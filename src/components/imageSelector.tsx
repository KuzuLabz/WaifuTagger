import { View, Pressable, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme';

type ImageSelectorProps = {
	image?: ImagePicker.ImagePickerAsset;
	onImagePick: () => void;
	isLoading?: boolean;
};
const ImageSelector = ({ image, isLoading, onImagePick }: ImageSelectorProps) => {
	const { colors } = useAppTheme();
	const { top } = useSafeAreaInsets();
	const { height, width } = useWindowDimensions();
	return (
		<Pressable
			onPress={onImagePick}
			style={{
				height: height / 3,
				alignSelf: 'center',
				width: '100%',
				// borderWidth: 2,
				// borderColor: image ? 'transparent' : '#FFF',
				// borderColor: colors.outlineVariant,
				// borderRadius: 12,
				borderStyle: 'solid',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'row',
			}}
		>
			{image ? (
				<View style={{ height: '100%', justifyContent: 'center' }}>
					<Image
						source={{ uri: image.uri }}
						style={{
							width: '100%',
							height: image.width > image.height ? undefined : '100%', // if width is greater than height, image will fill height so return undefined
							aspectRatio: image.width / image.height,
						}}
						contentFit="contain"
					/>
				</View>
			) : (
				<>
					<Button mode="text" icon={'upload'}>
						Upload Image
					</Button>
				</>
			)}
			{isLoading && (
				<View
					style={{
						position: 'absolute',
						height: '100%',
						width: width,
						backgroundColor: 'rgba(0,0,0,0.7)',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<ActivityIndicator />
				</View>
			)}
		</Pressable>
	);
};

export default ImageSelector;
