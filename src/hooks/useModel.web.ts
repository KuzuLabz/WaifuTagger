import { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';
import { InferenceTags, SelectedImage } from '../types';
import { getBase64Uri, getImageHash, toastImageError } from '../utils';
import { Image as RNImage } from 'react-native';
import * as Burnt from 'burnt';
import { useSettingsStore } from '../store/settings';
import { ImageColorsResult, getColors } from 'react-native-image-colors';
import { InferenceSession, env } from '../onnx';
import { ConvertImageToBase64, OpenImageDialog, UrlToBase64 } from '../wailsjs/go/main/App';
import { getResults } from '../parse';
import { OnFileDrop, OnFileDropOff } from '../wailsjs/runtime/runtime';
import { getImageTensor } from '../web/process';
import { useStatsStore } from '../store/stats';

env.wasm.proxy = true;

const IMAGE_EXTENSIONS = ['image/jpeg', 'image/png', 'png', 'jpg', 'jpeg'];

const bufferToB64 = (buffer: ArrayBuffer) => {
	return new Promise<string>((resolve, reject) => {
		const blob = new Blob([buffer]);
		const reader = new FileReader();
		reader.onloadend = () => {
			const base64String = (reader.result as string).split(',')[1]; // Remove data URL prefix
			resolve(base64String);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
};

const getModelUri = async () => {
	const assets = await Asset.loadAsync(require('../../assets/models/model_quantized.onnx'));

	if (assets && assets[0].localUri) {
		return assets[0].localUri;
	} else {
		return null;
	}
};

const useModel = () => {
	const { lastOpenedDir, autoInfer, updateLastOpenedDir } = useSettingsStore();
	const { addXp } = useStatsStore();
	const [session, setSession] = useState<InferenceSession>(null);
	const [image, setImage] = useState<SelectedImage>();
	const [imageColors, setImageColors] = useState<ImageColorsResult>();
	const [loading, setLoading] = useState(true);
	const [isInferLoading, setIsInferLoading] = useState(false);
	const [tags, setTags] = useState<InferenceTags>();
	const [prevHash, setPrevHash] = useState<string>('');

	const changeImageColorMode = async (uri: string, key: string) => {
		const colors = await getColors(uri, {
			cache: true,
			key: key,
		});
		setImageColors(colors);
	};

	const onImageSelect = async (img: SelectedImage) => {
		const md5 = await getImageHash(
			img.base64 ? img.base64 : img.uri.includes('data:') ? img.uri.split(',').at(-1) : '',
		);
		if (md5 === prevHash) {
			return;
		}
		if (!img.height || !img.width) {
			RNImage.getSize(img.uri, (w, h) => {
				setImage({
					...img,
					width: w,
					height: h,
					md5: md5,
				});
			});
		} else {
			setImage({ ...img, md5 });
		}
		changeImageColorMode(
			img.uri.includes('data:') ? img.uri : getBase64Uri(img.base64, img.mimeType),
			img.fileName ?? 'temp',
		);
		setTags(null);
	};

	const loadModel = async () => {
		setLoading(true);
		const modelUri = await getModelUri();
		if (modelUri) {
			try {
				const model: InferenceSession = await InferenceSession.create(modelUri, {
					executionProviders: ['wasm'],
					graphOptimizationLevel: 'all',
				});
				setSession(model);
				setLoading(false);
			} catch (e) {
				console.error(e);
			}
		} else {
			Burnt.toast({ title: 'No model found!', preset: 'error' });
		}
	};

	const pickImage = async () => {
		try {
			const result = await OpenImageDialog(lastOpenedDir);
			if (result) {
				const md5 = await getImageHash(result.Base64String);
				if (md5 === prevHash) {
					return;
				}
				setImage({
					uri: result.DataURI,
					width: result.Width,
					height: result.Height,
					mimeType: result.MimeType,
					fileName: result.Filename,
					md5,
				});
				changeImageColorMode(result.DataURI, result.Filename ?? 'temp');
				updateLastOpenedDir(result.LocalUri);
			}
		} catch (e) {
			if (e.includes('format')) {
				toastImageError();
			}
		}
	};

	const takePicture = async () => {
		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			base64: true,
			quality: 1,
		});
		if (result.assets && result.assets[0]?.base64) {
			onImageSelect(result.assets[0]);
		}
	};

	// const onImagePaste = async (e: ImageChangeEvent) => {
	// 	// const { uri, linkUri, mime, data } = e.nativeEvent;
	// 	// const link = linkUri ?? uri;
	// 	// console.log(uri, linkUri);
	// 	// if (mime && !IMAGE_EXTENSIONS.includes(mime)) {
	// 	// 	toastImageError();
	// 	// } else if (data && link && mime) {
	// 	// 	RNImage.getSize(`data:${mime};base64,${data}`, (w, h) => {
	// 	// 		setImage({
	// 	// 			uri: `data:${mime};base64,${data}`,
	// 	// 			width: w,
	// 	// 			height: h,
	// 	// 		});
	// 	// 	});
	// 	// 	changeImageColorMode(`data:${mime};base64,${data}`, linkUri ?? uri ?? 'temp');
	// 	// }
	// };

	const loadFromUrl = async (url: string) => {
		try {
			const base64 = await UrlToBase64(url);
			if (base64) {
				// @ts-expect-error: width / height is handled in func
				onImageSelect({ uri: base64, fileName: url.split('/').at(-1) ?? 'temp' }, prevHash);
				return;
			} else {
				toastImageError();
				return;
			}
		} catch (e) {
			console.warn(e);
			Burnt.toast({ preset: 'error', title: 'Error loading URL' });
		}
	};

	const runInference = async () => {
		const isUriB64 = image?.uri.includes('data:');
		if (!!session && (image?.base64 || isUriB64)) {
			const rawUri = isUriB64 ? image?.uri : getBase64Uri(image.base64, image.mimeType);
			try {
				setIsInferLoading(true);
				const tensor = await getImageTensor(rawUri);
				const feeds = { pixel_values: tensor };
				const result = await session.run(feeds);
				const logits = result[session.outputNames[0]]?.data;
				if (!logits) {
					Burnt.toast({ title: 'Failed to inference!', preset: 'error' });
				} else {
					const results = getResults(logits as Float32Array);
					addXp(results.rank.rank);
					setTags(results);
					setPrevHash(image.md5);
				}
				setIsInferLoading(false);
			} catch (e) {
				console.warn(e);
				Burnt.toast({ title: 'Failed to inference!', preset: 'error' });
			}
		} else {
			Burnt.toast({ title: 'Error: Image missing base64', preset: 'error' });
			setIsInferLoading(false);
		}
	};

	const setFileToImage = async (file: File) => {
		const buffer = await file.arrayBuffer();
		const b64 = await bufferToB64(buffer);
		const dataUri = getBase64Uri(b64, file.type);
		// @ts-expect-error
		onImageSelect({
			uri: dataUri,
			mimeType: file.type,
			fileName: file.name,
		});
	};

	useEffect(() => {
		if (autoInfer && image && image.md5 !== prevHash) {
			runInference();
		}
	}, [autoInfer, image, prevHash]);

	// Load Model at start
	useEffect(() => {
		loadModel();
	}, []);

	// Drag and Drop
	useEffect(() => {
		OnFileDrop((x, y, paths) => {
			if (paths[0]) {
				ConvertImageToBase64(paths[0])
					.then((info) => {
						onImageSelect({
							uri: info.DataURI,
							width: info.Width,
							height: info.Height,
							mimeType: info.MimeType,
							fileName: info.Filename,
						});
						// setImage({
						// 	uri: info.DataURI,
						// 	width: info.Width,
						// 	height: info.Height,
						// 	mimeType: info.MimeType,
						// 	fileName: info.Filename,
						// 	base64: info.Base64String,
						// });
						// changeImageColorMode(info.DataURI, info.Filename ?? 'temp');
					})
					.catch((_) => toastImageError());
			}
		}, true);

		const onRemoteDrop = (e: DragEvent) => {
			e.preventDefault();
			const url = e.dataTransfer.getData('url');
			if (url) {
				if (IMAGE_EXTENSIONS.includes(e.dataTransfer.files.item(0).type)) {
					setFileToImage(e.dataTransfer.files.item(0));
				} else {
					toastImageError();
				}
			}
		};

		addEventListener('drop', onRemoteDrop);

		return () => {
			OnFileDropOff();
			removeEventListener('drop', onRemoteDrop);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [prevHash]);

	// Image Paste Listener
	useEffect(() => {
		const onPaste = async (e: ClipboardEvent) => {
			const files = e.clipboardData.files;
			if (files.length > 0) {
				if (IMAGE_EXTENSIONS.includes(files.item(0).type)) {
					setFileToImage(files.item(0));
				} else {
					toastImageError();
				}
			}
		};
		addEventListener('paste', onPaste);

		return () => {
			removeEventListener('paste', onPaste);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [prevHash]);

	return {
		image,
		tags,
		loading,
		isInferLoading,
		imageColors,
		isInferDisabled: prevHash === image?.md5,
		prevHash,
		// onImagePaste,
		pickImage,
		takePicture,
		loadFromUrl,
		runInference,
	};
};

export default useModel;
