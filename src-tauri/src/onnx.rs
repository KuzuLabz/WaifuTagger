use image::DynamicImage;
use ndarray::Array4;
use ort::ep::{self, ExecutionProvider};
use ort::{
    session::{builder::GraphOptimizationLevel, Session},
    value::Tensor,
};
use serde::Serialize;
use std::sync::{Arc, Mutex};
use tauri::{ipc::Response, AppHandle, Emitter, State};

// #[path = "./process.rs"]
// mod onnx_proc;

pub struct LoadedModel {
    pub session: Session,
    pub model_type: String, // Tracks model identity/path
    pub provider: String,
}
pub struct AppState {
    pub session: Arc<Mutex<Option<LoadedModel>>>,
}

#[derive(Clone, Serialize)]
pub struct ModelStatusPayload {
    pub is_loading: bool,
    pub is_loaded: bool,
}

fn process_image_tensor(image_bytes: Vec<u8>) -> Result<Tensor<u8>, String> {
    let img: DynamicImage = image::load_from_memory(&image_bytes)
        .map_err(|e| format!("Failed to decode image: {}", e))?;

    let rgb_img = img.to_rgb8();
    let (width, height) = rgb_img.dimensions();

    let raw_pixels: Vec<u8> = rgb_img.into_raw();
    let shape = (1, height as usize, width as usize, 3);

    let tensor_array: Array4<u8> = Array4::from_shape_vec(shape, raw_pixels)
        .map_err(|e| format!("Failed to create ndarray: {}", e))?;
    let input_tensor = Tensor::from_array(tensor_array)
        .map_err(|e| format!("Failed to build ORT Tensor: {}", e))?;
    // let tensor = onnx_proc::create_image_tensor(&image_bytes, true).map_err(|e| e.to_string())?;

    Ok(input_tensor)
}

#[tauri::command]
pub async fn load_model(
    handle: AppHandle,
    state: State<'_, AppState>,
    model_type: String,
    path: String,
    prefer_gpu: bool,
) -> Result<String, String> {
    let old_session = {
        let mut guard = state.session.lock().map_err(|e| e.to_string())?;
        if let Some(ref current_model) = *guard {
            if current_model.model_type == model_type {
                handle
                    .emit(
                        "model-status",
                        ModelStatusPayload {
                            is_loading: false,
                            is_loaded: true,
                        },
                    )
                    .ok();
                return Ok(current_model.provider.clone());
            }
        }
        // Take ownership of the old model to drop it explicitly off the async thread
        guard.take()
    };

    handle
        .emit(
            "model-status",
            ModelStatusPayload {
                is_loading: true,
                is_loaded: false,
            },
        )
        .ok();

    // let value = handle.clone();
    let session_result = tauri::async_runtime::spawn_blocking(move || {
        if let Some(old) = old_session {
            drop(old);
            // Give Dawn's asynchronous WebGPU context destruction time to settle
            // on the C++ thread before initializing a new WebGPU encoder.
            std::thread::sleep(std::time::Duration::from_millis(100));
        }

        let mut builder = Session::builder()?;
        let mut attempted_provider = "CPU".to_string();

        if prefer_gpu {
            // #[cfg(feature = "cuda")]
            // if attempted_provider == "CPU" && ep::CUDA::default().is_available()? {
            //     match ep::CUDA::default().register(&mut builder) {
            //         Ok(_) => attempted_provider = "CUDA".to_string(),
            //         Err(e) => println!("CUDA registration failed: {:?}", e),
            //     }
            // }

            #[cfg(feature = "nvrtx")]
            if attempted_provider == "CPU" && ep::NVRTX::default().is_available()? {
                match ep::NVRTX::default().register(&mut builder) {
                    Ok(_) => attempted_provider = "TensorRT RTX".to_string(),
                    Err(e) => println!("NVRTX registration failed: {:?}", e),
                }
            }

            #[cfg(feature = "tensorrt")]
            if attempted_provider == "CPU" && ep::TensorRT::default().is_available()? {
                match ep::TensorRT::default().register(&mut builder) {
                    Ok(_) => attempted_provider = "TensorRT".to_string(),
                    Err(e) => println!("TensorRT registration failed: {:?}", e),
                }
            }

            // #[cfg(feature = "webgpu")]
            // if attempted_provider == "CPU" && ep::WebGPU::default().is_available()? {
            //     match ep::WebGPU::default().register(&mut builder) {
            //         Ok(_) => attempted_provider = "WebGPU".to_string(),
            //         Err(e) => println!("WebGPU registration failed: {:?}", e),
            //     }
            // }

            #[cfg(feature = "directml")]
            if attempted_provider == "CPU" && ep::DirectML::default().is_available()? {
                match ep::DirectML::default().register(&mut builder) {
                    Ok(_) => attempted_provider = "DirectML".to_string(),
                    Err(e) => println!("DirectML registration failed: {:?}", e),
                }
            }

            #[cfg(feature = "coreml")]
            if attempted_provider == "CPU" && ep::CoreML::default().is_available()? {
                match ep::CoreML::default().register(&mut builder) {
                    Ok(_) => attempted_provider = "CoreML".to_string(),
                    Err(e) => println!("CoreML registration failed: {:?}", e),
                }
            }
        }

        let enable_memory_pattern = attempted_provider == "CPU";
        let session = builder
            .with_optimization_level(GraphOptimizationLevel::Level1)?
            .with_memory_pattern(enable_memory_pattern)?
            .commit_from_file(path)?;

        Ok((session, attempted_provider))
    })
    .await
    .map_err(|e| format!("Join error: {}", e))?
    .map_err(|e: ort::Error| format!("Failed to load ONNX session: {}", e))?;

    let (session, active_provider) = session_result;

    let mut guard = state.session.lock().map_err(|e| e.to_string())?;
    *guard = Some(LoadedModel {
        session: session,
        model_type: model_type,
        provider: active_provider.clone(),
    });

    handle
        .emit(
            "model-status",
            ModelStatusPayload {
                is_loading: false,
                is_loaded: true,
            },
        )
        .ok();

    Ok(active_provider)
}

#[tauri::command]
pub async fn unload_model(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    app.emit(
        "model-status",
        ModelStatusPayload {
            is_loading: false,
            is_loaded: false,
        },
    )
    .ok();

    let session_state = state.session.clone();

    // Await spawn_blocking so unload finishes BEFORE any subsequent load_model call begins
    tauri::async_runtime::spawn_blocking(move || {
        if let Ok(mut guard) = session_state.lock() {
            let _old_model = guard.take(); // Explicit drop within blocking thread
        }
    })
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

fn pack_response(main_logits: &[f32], candidates: Option<&[i64]>) -> Vec<u8> {
    let cand_slice = candidates.unwrap_or(&[]);
    let cand_count = cand_slice.len() as u32;

    // Convert i64 slices to raw u8 byte views using size_of::<i64>() (8 bytes)
    let cand_u8: &[u8] = unsafe {
        std::slice::from_raw_parts(
            cand_slice.as_ptr() as *const u8,
            cand_slice.len() * std::mem::size_of::<i64>(),
        )
    };

    let logits_u8: &[u8] = unsafe {
        std::slice::from_raw_parts(
            main_logits.as_ptr() as *const u8,
            main_logits.len() * std::mem::size_of::<f32>(),
        )
    };

    // Allocate single payload buffer
    let mut payload = Vec::with_capacity(4 + cand_u8.len() + logits_u8.len());

    payload.extend_from_slice(&cand_count.to_le_bytes()); // [4 bytes candidate count]
    payload.extend_from_slice(cand_u8); // [i64 candidate bytes]
    payload.extend_from_slice(logits_u8); // [f32 logits bytes]

    payload
}

#[tauri::command]
pub async fn run_inference(state: State<'_, AppState>, image: Vec<u8>) -> Result<Response, String> {
    let mut guard = state.session.lock().map_err(|e| e.to_string())?;

    let loaded_model = guard
        .as_mut()
        .ok_or_else(|| "Model is not loaded yet!".to_string())?;

    let tensor = process_image_tensor(image)?;

    let input_name = { &loaded_model.session.inputs()[0].name() }.to_string();
    let default_output_name = { &loaded_model.session.outputs()[0].name() }.to_string();

    let outputs = loaded_model
        .session
        .run(ort::inputs![input_name => tensor])
        .map_err(|e| e.to_string())?;

    let primary_output_value = if let Some(val) = outputs.get("refined_probs") {
        val
    } else {
        outputs.get(&default_output_name).ok_or_else(|| {
            format!(
                "Failed to find default output tensor '{}'",
                default_output_name
            )
        })?
    };

    let selected_candidates: Option<&[i64]> = match outputs.get("selected_candidates") {
        Some(value) => {
            let (_, slice) = value
                .try_extract_tensor::<i64>()
                .map_err(|e| format!("Failed to extract candidates tensor: {}", e))?;
            Some(slice)
        }
        None => None,
    };

    let (_shape, output_data) = primary_output_value
        .try_extract_tensor::<f32>()
        .map_err(|e| e.to_string())?;

    let response_bytes = pack_response(output_data, selected_candidates);
    Ok(Response::new(response_bytes))
}

// int64[batch_size,256]
