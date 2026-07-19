import { useEffect, useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';
import { InferenceTags, SelectedImage } from '../types';
import { toByteArray } from 'react-native-quick-base64';
import { getBase64Uri, getImageHash, toastImageError } from '../utils';
import { Image, ScrollView } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import * as Burnt from 'burnt';
import { ImageColorsResult, getColors } from 'react-native-image-colors';
import { ShareIntent, useShareIntent } from 'expo-share-intent';
import { InferenceSession, Tensor } from '../onnx';
import { getResults } from '../parse';
import { useStatsStore } from '../store/stats';
import { useSettingsStore } from '../store/settings';
import { IMAGE_EXTENSIONS } from '../constants';

const getModelUri = async (): Promise<string | null> => {
	const assets = await Asset.loadAsync(require('../../assets/models/model.quant.preproc.onnx'));

	if (assets && assets[0].localUri) {
		return assets[0].localUri;
	} else {
		return null;
	}
};

const useModel = () => {
    const scrollRef = useRef<ScrollView>(null);
	const { hasShareIntent, resetShareIntent, shareIntent } = useShareIntent();
	const { autoInfer } = useSettingsStore();
	const { addXp } = useStatsStore();
	const [image, setImage] = useState<SelectedImage>();
	const [imageColors, setImageColors] = useState<ImageColorsResult>();
	const [session, setSession] = useState<InferenceSession | null>(null);
	const [loading, setLoading] = useState(true);
	const [isInferLoading, setIsInferLoading] = useState(false);
	const [tags, setTags] = useState<InferenceTags | null>();
	const [prevHash, setPrevHash] = useState<string | null>(null);

	const changeImageColorMode = async (uri: string, key: string) => {
		const colors = await getColors(uri, {
			cache: true,
			key: key,
		});
		setImageColors(colors);
	};

	const onImageSelect = async (img: ImagePicker.ImagePickerAsset) => {
		const md5 = await getImageHash(
			img.base64 ? img.base64 : img.uri.includes('data:') ? img.uri.split(',').at(-1) : '',
		);
		if (md5 === prevHash) {
			return;
		}
		if (!img.height || !img.width) {
			Image.getSize(img.uri, (w, h) => {
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
		session?.release();

		const modelPath = await getModelUri();
		if (modelPath) {
			try {
				const model: InferenceSession = await InferenceSession.create(modelPath);
				setSession(model);
			} catch (e) {
				console.error(e);
			}
		}
		setLoading(false);
	};

	const pickImage = async () => {
		const result = (
			await ImagePicker.launchImageLibraryAsync({
				base64: true,
				quality: 1,
				mediaTypes: ['images'],
			})
		).assets[0];

		if (result && result?.mimeType) {
			if (!IMAGE_EXTENSIONS.includes(result.mimeType)) {
				toastImageError();
			} else {
				onImageSelect(result);
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
	// 	const { uri, linkUri, mime, data } = e.nativeEvent;
	// 	const link = linkUri ?? uri;
	// 	if (mime && !IMAGE_EXTENSIONS.includes(mime)) {
	// 		toastImageError();
	// 	} else if (data && link && mime) {
	// 		Image.getSize(`data:${mime};base64,${data}`, (w, h) => {
	// 			setImage({
	// 				uri: `data:${mime};base64,${data}`,
	// 				width: w,
	// 				height: h,
	// 				base64: data.replaceAll('\n', ''),
	// 			});
	// 		});
	// 		changeImageColorMode(`data:${mime};base64,${data}`, linkUri ?? uri ?? 'temp');
	// 	}
	// };

	const loadFromUrl = async (url: string) => {
        const imgDir = new Directory(Paths.cache);
        const imgFile = await File.downloadFileAsync(url, imgDir);
		// const [{ localUri, name, height, width, type }] = await Asset.loadAsync(url);
		if (!IMAGE_EXTENSIONS.includes(imgFile.type)) {
			toastImageError();
			return;
		}
		const base64 = await imgFile.base64();
        const imgSize = await Image.getSize(imgFile.uri);
		onImageSelect({ uri: imgFile.uri, base64: base64, fileName: imgFile.name, ...imgSize });
		return;
	};

	const runInference = async () => {
		if (!session) {
			await loadModel();
		}
		const isUriB64 = image?.uri.includes('data:');
		if (session && (image?.base64 || isUriB64)) {
			setIsInferLoading(true);
			const b64 = isUriB64 ? image?.uri.split(',').at(-1) : image.base64;
			const image_array = toByteArray(b64.trim());
			const inputTensor = new Tensor(image_array, [image_array.length]);
			const feeds = { image: inputTensor };
			const fetches = await session?.run(feeds);
			const logits = fetches[session.outputNames[0]].data;

			if (!logits) {
				Burnt.toast({ title: 'Failed to inference!', preset: 'error' });
			} else {
				const results = getResults(logits as Float32Array);
				addXp(results.rank.rank);
				setTags(results);
				setPrevHash(image.md5);
			}
			setIsInferLoading(false);
		} else {
			setIsInferLoading(false);
		}
	};

	const handleShareIntent = async (intent: ShareIntent) => {
        if (intent.files) {
            const file = intent.files[0];
            const intentFile = new File(file.path);
            const cacheFile = new File(Paths.cache, file.fileName);
            if (cacheFile.uri !== file.path) {
                await intentFile.copy(cacheFile);
            }
            const base64 = await cacheFile.base64();
            if (file.mimeType && !IMAGE_EXTENSIONS.includes(file.mimeType)) {
                toastImageError();
            } else if (base64) {
                onImageSelect({
                    uri: getBase64Uri(base64, file.mimeType),
                    fileName: file.fileName,
                    width: file.width,
                    height: file.height,
                });
                scrollRef.current?.scrollTo({ y: 0, animated: true });
            }
        }
	};

	useEffect(() => {
		if (hasShareIntent && shareIntent.files) {
			handleShareIntent(shareIntent);
			resetShareIntent();
		}
	}, [hasShareIntent]);

	useEffect(() => {
		if (autoInfer && image && image?.md5 !== prevHash) {
			runInference();
		}
	}, [autoInfer, image, prevHash]);

	useEffect(() => {
		loadModel();
	}, []);

	return {
		image,
		tags,
		loading,
		isInferLoading,
		imageColors,
		isInferDisabled: prevHash === image?.md5,
        scrollRef,
		pickImage,
		takePicture,
		loadFromUrl,
		runInference,
	};
};

export default useModel;
