import { Tensor } from '../onnx';

const config = {
	size: {
		width: 448,
		height: 448,
	},
	rescale_factor: 0.00392156862745098,
	image_std: [0.5, 0.5, 0.5],
	image_mean: [0.5, 0.5, 0.5],
};

const resizeWithPadding = (
	image: HTMLImageElement,
	size: { width: number; height: number },
	color = [255, 255, 255],
) => {
	const { width, height } = size;

	// Create a canvas
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');

	// Calculate aspect ratio
	const originalWidth = image.width;
	const originalHeight = image.height;
	const ratio = Math.min(width / originalWidth, height / originalHeight);
	const newWidth = Math.round(originalWidth * ratio);
	const newHeight = Math.round(originalHeight * ratio);

	// Draw solid background
	ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
	ctx.fillRect(0, 0, width, height);

	// Draw resized image at the center
	const offsetX = Math.round((width - newWidth) / 2);
	const offsetY = Math.round((height - newHeight) / 2);
	ctx.drawImage(image, offsetX, offsetY, newWidth, newHeight);

	// Get image data as Uint8ClampedArray
	const imageData = ctx.getImageData(0, 0, width, height).data;

	// Convert to Float32Array and perform RGB to BGR conversion
	const floatArray = new Float32Array(width * height * 3);
	for (let i = 0, j = 0; i < imageData.length; i += 4, j += 3) {
		// RGB to BGR (reverse order)
		floatArray[j] = imageData[i + 2]; // B
		floatArray[j + 1] = imageData[i + 1]; // G
		floatArray[j + 2] = imageData[i]; // R
	}

	const channelsFirstArray = new Float32Array(width * height * 3);
	for (let h = 0; h < height; h++) {
		for (let w = 0; w < width; w++) {
			for (let c = 0; c < 3; c++) {
				channelsFirstArray[c * height * width + h * width + w] =
					floatArray[(h * width + w) * 3 + c];
			}
		}
	}
	return channelsFirstArray; // channels_last: [height * width * 3]
};

const rescale = (imageArray: Float32Array, scale = 1 / 255) => {
	const result = new Float32Array(imageArray.length);
	for (let i = 0; i < imageArray.length; i++) {
		result[i] = imageArray[i] * scale;
	}
	return result;
};

const normalize = (
	imageArray: Float32Array,
	width: number,
	height: number,
	dataFormat = 'channels_last',
	mean = [0.485, 0.456, 0.406],
	std = [0.229, 0.224, 0.225],
) => {
	const result = new Float32Array(imageArray.length);
	const channels = 3;

	if (dataFormat === 'channels_first') {
		// Input is [3, height, width]
		for (let c = 0; c < channels; c++) {
			for (let h = 0; h < height; h++) {
				for (let w = 0; w < width; w++) {
					const idx = c * height * width + h * width + w;
					result[idx] = (imageArray[idx] - mean[c]) / std[c];
				}
			}
		}
	} else {
		// Input is [height, width, 3]
		for (let h = 0; h < height; h++) {
			for (let w = 0; w < width; w++) {
				for (let c = 0; c < channels; c++) {
					const idx = (h * width + w) * channels + c;
					result[idx] = (imageArray[idx] - mean[c]) / std[c];
				}
			}
		}
	}

	return result;
};

const createTensor = (
	imageArray: Float32Array,
	width: number,
	height: number,
	dataFormat = 'channels_first',
) => {
	const channels = 3;
	const dims =
		dataFormat === 'channels_first'
			? [1, channels, height, width]
			: [1, height, width, channels];
	return new Tensor('float32', imageArray, dims);
};

export const getImageTensor = async (uri: string) => {
	try {
		const img = new Image();
		img.src = uri;
		await new Promise((resolve) => (img.onload = resolve));

		let processedImage = resizeWithPadding(img, config.size);
		processedImage = rescale(processedImage, config.rescale_factor);
		processedImage = normalize(
			processedImage,
			config.size.width,
			config.size.height,
			'channels_last',
			config.image_mean,
			config.image_std,
		);
		// processedImage = toChannelDimensionFormat(
		// 	processedImage,
		// 	config.size.width,
		// 	config.size.height,
		// 	'channels_first',
		// 	'channels_last',
		// );
		const tensor = createTensor(
			processedImage,
			config.size.width,
			config.size.height,
			'channels_first',
		);
		return tensor;
	} catch (e) {
		console.error('Error during processing or inference:', e);
	}
};
