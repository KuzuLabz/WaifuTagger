import { RefObject, useEffect, useState } from 'react';
import { Asset, useAssets } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { InferenceTags } from '../types';
import { toByteArray } from 'react-native-quick-base64';
import { zip } from '../utils';
import {
	character_indexes,
	character_names,
	general_indexes,
	general_names,
	kaomojis,
	rating_indexes,
	tag_names,
} from '../constants';
import * as FileSystem from 'expo-file-system';
import { Image, ImageChangeEvent, ScrollView } from 'react-native';
import * as Burnt from 'burnt';
import { SettingsState, useSettingsStore } from '../store';
import { ImageColorsResult, getColors } from 'react-native-image-colors';
import { ShareIntent, useShareIntent } from 'expo-share-intent';

const IMAGE_EXTENSIONS = ['image/jpeg', 'image/png'];

const useModel = (scrollview: ScrollView | null) => {
	const [assets] = useAssets([require('../../assets/models/model.quant.preproc.onnx')]);
	const { hasShareIntent, error, resetShareIntent, shareIntent } = useShareIntent();
	const { char_threshold, general_threshold } = useSettingsStore();
	const [image, setImage] = useState<ImagePicker.ImagePickerAsset>();
	const [imageColors, setImageColors] = useState<ImageColorsResult>();
	const [session, setSession] = useState<InferenceSession | null>(null);
	const [loading, setLoading] = useState(true);
	const [isInferLoading, setIsInferLoading] = useState(false);
	const [tags, setTags] = useState<InferenceTags>();

	const changeImageColorMode = async (uri: string, key: string) => {
		const colors = await getColors(uri, {
			cache: true,
			key: key,
		});
		setImageColors(colors);
	};

	const loadModel = async () => {
		setLoading(true);
		session?.release();
		// const assets = await Asset.loadAsync([
		// 	require('../../assets/models/model.quant.preproc.onnx'),
		// ]);
		if (assets[0] && assets[0].localUri) {
			try {
				const model: InferenceSession = await InferenceSession.create(assets[0].localUri);
				setSession(model);
			} catch (e) {
				console.error(e);
			}
		}
		setLoading(false);
	};

	const unloadModel = async () => {
		try {
			await session?.release();
			setSession(null);
		} catch (e) {
			console.error(e);
		}
	};

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			base64: true,
			quality: 1,
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
		});
		if (result.assets && result.assets[0]?.base64 && result.assets[0]?.mimeType) {
			if (!IMAGE_EXTENSIONS.includes(result.assets[0]?.mimeType)) {
				Burnt.toast({
					title: 'Image must be PNG or JPG',
					haptic: 'error',
					preset: 'error',
				});
			} else {
				changeImageColorMode(
					`data:${result.assets[0]?.mimeType};base64,${result.assets[0]?.base64}`,
					result.assets[0].fileName ?? result.assets[0].assetId ?? 'temp',
				);
				setImage(result.assets[0]);
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
			changeImageColorMode(
				`data:${result.assets[0]?.mimeType};base64,${result.assets[0]?.base64}`,
				result.assets[0].fileName ?? result.assets[0].assetId ?? 'temp',
			);
			setImage(result.assets[0]);
		}
	};

	const onImagePaste = async (e: ImageChangeEvent) => {
		const { uri, linkUri, mime, data } = e.nativeEvent;
		const link = linkUri ?? uri;
		// FileSystem.
		// const result = await FileSystem.downloadAsync(
		// 	link,
		// 	FileSystem.cacheDirectory + (link.split('/')?.at(-1) ?? 'temp.jpg'),
		// );
		// console.log('LocalURI:', result.uri);
		if (mime && !IMAGE_EXTENSIONS.includes(mime)) {
			Burnt.toast({
				title: 'Image must be PNG or JPG',
				haptic: 'error',
				preset: 'error',
			});
		} else if (data && link && mime) {
			Image.getSize(`data:${mime};base64,${data}`, (w, h) => {
				setImage({
					uri: `data:${mime};base64,${data}`,
					width: w,
					height: h,
					base64: data.replaceAll('\n', ''),
				});
			});
			changeImageColorMode(`data:${mime};base64,${data}`, linkUri ?? uri ?? 'temp');
		}
	};

	const loadFromUrl = async (url: string) => {
		const [{ localUri, name }] = await Asset.loadAsync(url);
		const base64 = localUri
			? await FileSystem.readAsStringAsync(localUri, {
					encoding: 'base64',
				})
			: null;
		if (localUri && base64) {
			Image.getSize(url, (w, h) => {
				setImage({
					uri: localUri,
					width: w,
					height: h,
					base64: base64,
				});
			});
			changeImageColorMode(url, name ?? 'temp');
		}
	};

	const runInference = async () => {
		if (!session) {
			await loadModel();
		}
		if (session && image?.base64) {
			setIsInferLoading(true);
			const image_array = toByteArray(image.base64.trim());
			const inputTensor = new Tensor(image_array, [image_array.length]);
			const feeds = { image: inputTensor };
			const fetches = await session?.run(feeds);
			const output = fetches[session.outputNames[0]];

			if (!output) {
				Burnt.toast({ title: 'Failed to inference!', preset: 'error' });
			} else {
				const new_labels: [string, number][] = zip([tag_names, output.data]);
				const general_matches = new_labels.filter(
					(label) => label[1] > general_threshold && general_names.includes(label[0]),
				);
				const character_matches = new_labels.filter(
					(label) => label[1] > char_threshold && character_names.includes(label[0]),
				);
				const infer_tags: InferenceTags = {
					rating: rating_indexes.map((rt) => ({
						...rt,
						probability: new_labels.find((label) => label[0] === rt.name)?.[1] ?? 0,
					})),
					general: general_matches
						.sort((a, b) => b[1] - a[1])
						.map((gt) => ({
							...(general_indexes.find((gi) => gi.name === gt[0]) ?? {
								name: gt[0],
								category: 0,
								tag_id: 10000002,
								count: 0,
							}),
							name: kaomojis.includes(gt[0]) ? gt[0] : gt[0].replaceAll('_', ' '),
							probability: gt[1],
						})),
					character: character_matches
						.sort((a, b) => b[1] - a[1])
						.map((ct) => ({
							...(character_indexes.find((ci) => ci.name === ct[0]) ?? {
								name: ct[0],
								category: 0,
								tag_id: 10000002,
								count: 0,
							}),
							probability: ct[1],
						})),
					ordered_tags: general_matches
						.sort((a, b) => b[1] - a[1])
						.map((label) =>
							kaomojis.includes(label[0]) ? label[0] : label[0].replaceAll('_', ' '),
						),
				};

				setTags(infer_tags);
			}
			setIsInferLoading(false);
		} else {
			setIsInferLoading(false);
		}
	};

	const handleShareIntent = async (intent: ShareIntent) => {
		if (intent.files && FileSystem.cacheDirectory) {
			const file = intent.files[0];
			const fileUri = FileSystem.cacheDirectory + file.fileName;
			await FileSystem.copyAsync({ from: file.path, to: fileUri });
			const base64 = await FileSystem.readAsStringAsync(fileUri, {
				encoding: 'base64',
			});
			if (file.type && !IMAGE_EXTENSIONS.includes(file.type)) {
				Burnt.toast({
					title: 'Image must be PNG or JPG',
					haptic: 'error',
					preset: 'error',
				});
			} else if (base64) {
				Image.getSize(`data:${file.type};base64,${base64}`, (w, h) => {
					setImage({
						uri: `data:${file.type};base64,${base64}`,
						width: w,
						height: h,
						base64: base64.replaceAll('\n', ''),
					});
				});
				changeImageColorMode(`data:${file.type};base64,${base64}`, file.fileName ?? 'temp');
				scrollview?.scrollTo({ y: 0, animated: true });
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
		if (!session && assets?.length > 0) {
			loadModel();
		}
	}, [assets]);

	return {
		session,
		image,
		tags,
		loading,
		isInferLoading,
		imageColors,
		onImagePaste,
		pickImage,
		takePicture,
		loadFromUrl,
		runInference,
	};
};

export default useModel;
