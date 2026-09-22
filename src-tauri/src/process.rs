use image::{imageops, GenericImageView, Rgb, RgbImage};
use ort::value::Tensor;

// pub fn create_image_tensor(
//     image_bytes: &[u8],
//     channels_first: bool, // Set `true` for NCHW [1, 3, 448, 448]
// ) -> Result<Tensor<f32>, Box<dyn std::error::Error>> {
//     // 1. Config values
//     let target_w = 448u32;
//     let target_h = 448u32;
//     let rescale_factor = 0.00392156862745098f32; // 1 / 255
//     let mean = [0.5f32, 0.5f32, 0.5f32];
//     let std = [0.5f32, 0.5f32, 0.5f32];
//     let bg_color = [255, 255, 255]; // White padding

//     // 2. Decode & Letterbox Resize
//     let img = image::load_from_memory(image_bytes)?;
//     let (orig_w, orig_h) = img.dimensions();

//     let ratio = (target_w as f32 / orig_w as f32).min(target_h as f32 / orig_h as f32);
//     let new_w = (orig_w as f32 * ratio).round() as u32;
//     let new_h = (orig_h as f32 * ratio).round() as u32;

//     let resized_img = img.resize_exact(new_w, new_h, image::imageops::FilterType::Triangle);

//     let mut canvas = RgbImage::from_pixel(target_w, target_h, Rgb(bg_color));
//     let offset_x = (target_w - new_w) / 2;
//     let offset_y = (target_h - new_h) / 2;
//     imageops::overlay(
//         &mut canvas,
//         &resized_img.to_rgb8(),
//         offset_x as i64,
//         offset_y as i64,
//     );

//     // 3. Process into float array
//     let total_pixels = (target_w * target_h) as usize;
//     let mut float_buffer = vec![0.0f32; 3 * total_pixels];

//     if channels_first {
//         // Layout: NCHW [1, 3, 448, 448]
//         let channel_stride = total_pixels;

//         for (x, y, pixel) in canvas.enumerate_pixels() {
//             let pixel_idx = (y * target_w + x) as usize;
//             let [r, g, b] = pixel.0;

//             // RGB -> BGR flip + rescale + normalize
//             let b_val = ((b as f32 * rescale_factor) - mean[0]) / std[0];
//             let g_val = ((g as f32 * rescale_factor) - mean[1]) / std[1];
//             let r_val = ((r as f32 * rescale_factor) - mean[2]) / std[2];

//             float_buffer[0 * channel_stride + pixel_idx] = b_val; // Channel 0: B
//             float_buffer[1 * channel_stride + pixel_idx] = g_val; // Channel 1: G
//             float_buffer[2 * channel_stride + pixel_idx] = r_val; // Channel 2: R
//         }

//         let shape = [1usize, 3, target_h as usize, target_w as usize];
//         Ok(Tensor::from_array((
//             shape,
//             float_buffer.into_boxed_slice(),
//         ))?)
//     } else {
//         // Layout: NHWC [1, 448, 448, 3]
//         for (x, y, pixel) in canvas.enumerate_pixels() {
//             let pixel_idx = ((y * target_w + x) * 3) as usize;
//             let [r, g, b] = pixel.0;

//             float_buffer[pixel_idx + 0] = ((b as f32 * rescale_factor) - mean[0]) / std[0]; // B
//             float_buffer[pixel_idx + 1] = ((g as f32 * rescale_factor) - mean[1]) / std[1]; // G
//             float_buffer[pixel_idx + 2] = ((r as f32 * rescale_factor) - mean[2]) / std[2];
//             // R
//         }

//         let shape = [1usize, target_h as usize, target_w as usize, 3];
//         Ok(Tensor::from_array((
//             shape,
//             float_buffer.into_boxed_slice(),
//         ))?)
//     }
// }
