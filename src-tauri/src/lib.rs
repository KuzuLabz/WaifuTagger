use fs_extra::dir::{move_dir, CopyOptions};
use serde::Serialize;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;
use std::{env, fs};
use tauri::http::header::{ACCEPT, CONTENT_TYPE};

use tauri::ipc::Response;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_http::reqwest;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

mod memory;
mod onnx;

#[derive(Clone, Serialize)]
struct DownloadProgress {
    // model_name: String,
    downloaded_bytes: u64,
    total_bytes: u64,
    progress_percentage: f64,
}

fn is_html_or_text(bytes: &[u8]) -> bool {
    let slice = if bytes.len() > 512 {
        &bytes[..512]
    } else {
        bytes
    };
    let text = String::from_utf8_lossy(slice).to_lowercase();
    text.starts_with("<!doctype") || text.starts_with("<html") || text.starts_with("<?xml")
}

fn resolve_default_models_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let base = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    Ok(base.join("models"))
}

#[tauri::command]
fn get_base_dir(app: AppHandle, custom_dir: Option<String>) -> Result<String, String> {
    let base_dir = match custom_dir {
        Some(dir) if !dir.trim().is_empty() => PathBuf::from(dir),
        _ => resolve_default_models_dir(&app)?,
    };
    Ok(base_dir.to_string_lossy().into_owned())
}

fn resolve_target_model_dir(
    app: &AppHandle,
    model_type: &str,
    custom_dir: Option<String>,
) -> Result<PathBuf, String> {
    let base_dir = match custom_dir {
        Some(dir) if !dir.trim().is_empty() => PathBuf::from(dir),
        _ => resolve_default_models_dir(app)?,
    };
    Ok(base_dir.join(model_type))
}

async fn download_stream(
    app: &AppHandle,
    mut response: reqwest::Response,
    path: &PathBuf,
    total_bytes: u64,
) -> Result<(), String> {
    let mut file = File::create(path)
        .await
        .map_err(|e| format!("Failed to create file {:?}: {}", path, e))?;

    let mut downloaded_bytes = 0u64;
    let mut last_emitted_bytes = 0u64;
    const EMIT_THRESHOLD_BYTES: u64 = 128 * 1024;

    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|e| format!("Error while reading chunk: {}", e))?
    {
        file.write_all(&chunk)
            .await
            .map_err(|e| format!("Failed to write chunk to disk: {}", e))?;

        downloaded_bytes += chunk.len() as u64;

        if downloaded_bytes - last_emitted_bytes >= EMIT_THRESHOLD_BYTES
            || downloaded_bytes == total_bytes
        {
            last_emitted_bytes = downloaded_bytes;

            let progress_percentage = if total_bytes > 0 {
                (downloaded_bytes as f64 / total_bytes as f64) * 100.0
            } else {
                0.0
            };

            let _ = app.emit(
                "download-progress",
                DownloadProgress {
                    downloaded_bytes,
                    total_bytes,
                    progress_percentage,
                },
            );
        }
    }

    file.flush()
        .await
        .map_err(|e| format!("Failed to flush file {:?}: {}", path, e))?;

    let final_percentage = if total_bytes > 0 {
        (downloaded_bytes as f64 / total_bytes as f64) * 100.0
    } else {
        100.0
    };

    let _ = app.emit(
        "download-progress",
        DownloadProgress {
            downloaded_bytes,
            total_bytes,
            progress_percentage: final_percentage,
        },
    );

    Ok(())
}

#[tauri::command]
async fn move_models_directory(
    handle: AppHandle,
    new_dir: String,
    current_dir: Option<String>,
) -> Result<String, String> {
    let source_dir: PathBuf = match current_dir {
        Some(dir) if !dir.trim().is_empty() => PathBuf::from(dir),
        _ => resolve_default_models_dir(&handle)?,
    };

    let target_dir = PathBuf::from(&new_dir);

    if !source_dir.exists() {
        return Err(format!("Source directory does not exist: {:?}", source_dir));
    }
    if source_dir == target_dir {
        return Ok(target_dir.to_string_lossy().to_string());
    }

    // Ensure target parent directory exists prior to moving
    if let Some(parent) = target_dir.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directory: {e}"))?;
    }

    if std::fs::rename(&source_dir, &target_dir).is_err() {
        // Fallback across different drives/mount points
        let mut options = CopyOptions::new();
        options.copy_inside = true; // Moves contents into target_dir instead of nesting
        options.content_only = true;

        fs::create_dir_all(&target_dir)
            .map_err(|e| format!("Failed to create target directory: {e}"))?;

        move_dir(&source_dir, &target_dir, &options)
            .map_err(|e| format!("Failed to move models: {e}"))?;

        let _ = fs::remove_dir_all(&source_dir);
    }

    Ok(target_dir.to_string_lossy().to_string())
}

#[tauri::command]
fn open_model_dir(path: String) -> Result<(), String> {
    // Opens the folder in File Explorer / Finder / Linux File Manager
    #[cfg(target_os = "windows")]
    std::process::Command::new("explorer")
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "macos")]
    std::process::Command::new("open")
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "linux")]
    std::process::Command::new("xdg-open")
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn get_remote_image(url: String) -> Result<tauri::ipc::Response, String> {
    let client = reqwest::Client::builder()
        .user_agent("WaifuTagger (tauriV2; desktop;) KuzuLabz@github")
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    // 2. Fetch the image
    let response = client
        .get(&url)
        .header(ACCEPT, "image/*, */*")
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    // 3. Validate response
    if !response.status().is_success() {
        return Err(format!(
            "Server returned error status: {}",
            response.status()
        ));
    }

    // Extract content-type before consuming bytes (defaults to image/jpeg if missing)
    let content_type = response
        .headers()
        .get(CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    if !content_type.starts_with("image/") {
        return Err(format!(
            "URL did not return an image. Received Content-Type: '{}'",
            if content_type.is_empty() {
                "unknown"
            } else {
                &content_type
            }
        ));
    }

    // 4. Download raw bytes
    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read image bytes: {}", e))?;

    if is_html_or_text(&bytes) {
        return Err("URL content payload is HTML or text, not a valid image.".into());
    }

    let ipc_response = tauri::ipc::Response::new(bytes.to_vec());

    Ok(ipc_response)
}

#[tauri::command]
async fn download_tags(
    app: AppHandle,
    tags_url: String,
    model_type: String,
    custom_dir: Option<String>,
) -> Result<String, String> {
    let target_dir = resolve_target_model_dir(&app, &model_type, custom_dir)?;

    tokio::fs::create_dir_all(&target_dir)
        .await
        .map_err(|e| format!("Failed to create directory {:?}: {}", target_dir, e))?;

    let tag_path = target_dir.join("tags.json");

    let response = reqwest::get(&tags_url)
        .await
        .map_err(|e| format!("HTTP request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Download failed with status: {}",
            response.status()
        ));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read tag bytes: {}", e))?;

    tokio::fs::write(&tag_path, bytes)
        .await
        .map_err(|e| format!("Failed to write tags to disk {:?}: {}", tag_path, e))?;

    Ok(tag_path.to_string_lossy().into_owned())
}

#[tauri::command]
async fn download_model(
    app: AppHandle,
    url: String,
    model_type: String,
    file_name: String,
    custom_dir: Option<String>,
) -> Result<String, String> {
    let target_dir = resolve_target_model_dir(&app, &model_type, custom_dir)?;

    tokio::fs::create_dir_all(&target_dir)
        .await
        .map_err(|e| format!("Failed to create directory {:?}: {}", target_dir, e))?;

    let file_path = target_dir.join(&file_name);

    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("HTTP request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Download failed with status: {}",
            response.status()
        ));
    }

    let total_bytes = response.content_length().unwrap_or(0);

    download_stream(&app, response, &file_path, total_bytes).await?;

    Ok(target_dir.to_string_lossy().into_owned())
}

#[tauri::command]
async fn delete_model(
    app: AppHandle,
    model_type: String,
    file_name: String,
    custom_dir: Option<String>,
) -> Result<(), String> {
    let target_dir = resolve_target_model_dir(&app, &model_type, custom_dir)?;
    let target_file = target_dir.join(file_name);

    if target_file.exists() {
        tokio::fs::remove_file(&target_file)
            .await
            .map_err(|e| format!("Failed to delete file {:?}: {}", target_file, e))?;
    }

    if target_dir.exists() {
        let mut entries = tokio::fs::read_dir(&target_dir)
            .await
            .map_err(|e| format!("Failed to read directory {:?}: {}", target_dir, e))?;

        let mut has_model_files = false;

        // Iterate through all entries in the directory
        while let Some(entry) = entries.next_entry().await.map_err(|e| e.to_string())? {
            let path = entry.path();

            if path.is_file() {
                if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                    // Case-insensitive check for .onnx or .ort
                    if ext.eq_ignore_ascii_case("onnx") || ext.eq_ignore_ascii_case("ort") {
                        has_model_files = true;
                        break; // Stop searching early once we find one
                    }
                }
            }
        }

        // 3. If no .onnx or .ort files remain, delete the entire directory
        if !has_model_files {
            tokio::fs::remove_dir_all(&target_dir)
                .await
                .map_err(|e| format!("Failed to delete directory {:?}: {}", target_dir, e))?;
        }
    }

    Ok(())
}

#[tauri::command]
fn get_tags_json(
    app: AppHandle,
    model_type: String,
    custom_dir: Option<String>,
) -> Result<serde_json::Value, String> {
    let tags_path = resolve_target_model_dir(&app, &model_type, custom_dir)?.join("tags.json");

    let contents =
        fs::read_to_string(&tags_path).map_err(|e| format!("Failed to read file: {}", e))?;

    let json: serde_json::Value =
        serde_json::from_str(&contents).map_err(|e| format!("Failed to parse JSON: {}", e))?;

    Ok(json)
}

#[derive(Serialize)]
pub struct ModelStatus {
    pub has_tags: bool,
    /// Maps each variant type (e.g., "FP16", "QUINT8") to its existence boolean
    pub variants: HashMap<String, bool>,
}

#[tauri::command]
async fn check_model_status(
    app: AppHandle,
    model_type: String,
    custom_dir: Option<String>,
    // Accepts e.g. {"FP16": "wd-convnext-tagger-v3-fp16-mobile.onnx", "QUINT8": "..."}
    expected_files: HashMap<String, String>,
) -> Result<ModelStatus, String> {
    let target_dir = resolve_target_model_dir(&app, &model_type, custom_dir)?;

    // 1. Check if tags.json exists
    let tag_path = target_dir.join("tags.json");
    let has_tags = tokio::fs::try_exists(&tag_path).await.unwrap_or(false);

    // 2. Check each variant file passed in from TypeScript
    let mut variants_status = HashMap::new();
    for (variant_key, filename) in expected_files {
        let file_path = target_dir.join(filename);
        let exists = tokio::fs::try_exists(&file_path).await.unwrap_or(false);
        variants_status.insert(variant_key, exists);
    }

    Ok(ModelStatus {
        has_tags,
        variants: variants_status,
    })
}

#[tauri::command]
async fn check_tags(
    app: AppHandle,
    model_type: String,
    custom_dir: Option<String>,
) -> Result<bool, String> {
    let target_dir = resolve_target_model_dir(&app, &model_type, custom_dir)?;

    // 1. Check if tags.json exists
    let tag_path = target_dir.join("tags.json");
    let has_tags = tokio::fs::try_exists(&tag_path).await.unwrap_or(false);
    Ok(has_tags)
}

#[tauri::command]
async fn get_local_image(path: String) -> Result<Response, String> {
    // let data = std::fs::read(path).unwrap();
    // tauri::ipc::Response::new(data)
    let data = tokio::fs::read(&path)
        .await
        .map_err(|e| format!("Failed to read file '{path}': {e}"))?;

    Ok(tauri::ipc::Response::new(data))
}

#[tauri::command]
fn get_model_path(
    app: AppHandle,
    model_name: String,
    file_name: String,
    custom_dir: Option<String>,
) -> Result<String, String> {
    let target_dir = resolve_target_model_dir(&app, &model_name, custom_dir)?;
    let target_path = target_dir.join(file_name);

    Ok(target_path.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_vnidrop_share::init())
        .manage(onnx::AppState {
            session: Mutex::new(None).into(),
        })
        .invoke_handler(tauri::generate_handler![
            // get_image_base64,
            get_base_dir,
            get_local_image,
            get_remote_image,
            move_models_directory,
            open_model_dir,
            download_model,
            download_tags,
            delete_model,
            check_model_status,
            check_tags,
            get_model_path,
            get_tags_json,
            memory::get_app_memory,
            memory::get_memory_info,
            memory::get_vram_memory,
            memory::get_storage,
            memory::get_dir_size,
            onnx::load_model,
            onnx::unload_model,
            onnx::run_inference
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            let default_dir = resolve_default_models_dir(app.handle())?;
            if !default_dir.exists() {
                fs::create_dir_all(&default_dir)?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
