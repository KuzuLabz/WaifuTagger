import { View, Pressable, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Button, Chip, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { RankInfo } from '../types';
import { useStatsStore } from '../store/stats';

const RankChip = ({ rank }: { rank: RankInfo }) => {
	return (
		<Chip compact mode="flat" elevated textStyle={{ fontWeight: '900' }}>
			{rank.rank} <Text variant="labelSmall">+ {rank.xp}</Text>
		</Chip>
	);
};

type ImageSelectorProps = {
	image?: ImagePicker.ImagePickerAsset;
	rank?: RankInfo;
	onImagePick: () => void;
	isLoading?: boolean;
};
const ImageSelector = ({ image, rank, isLoading, onImagePick }: ImageSelectorProps) => {
	const { height, width } = useWindowDimensions();
	const { isEnabled } = useStatsStore();

	return (
		<Pressable
			onPress={onImagePick}
			style={{
				height: height / 3 + 16,
				alignSelf: 'center',
				width: '100%',
				borderStyle: 'solid',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'row',
				overflow: 'hidden',
				// @ts-expect-error: Wails specific
				'--wails-drop-target': 'drop',
			}}
		>
			{image ? (
				<View style={{ flex: 1 }}>
					<Image
						source={{ uri: image.uri }}
						style={{
							width: '100%',
							height: height / 3,
							paddingVertical: 8,
						}}
						contentFit="contain"
					/>
				</View>
			) : (
				<>
					<Button mode="text" icon={'upload'} onPress={onImagePick}>
						Upload Image
					</Button>
				</>
			)}
			{isLoading && (
				<BlurView
					intensity={50}
					tint="systemChromeMaterialDark"
					experimentalBlurMethod={'dimezisBlurView'}
					style={[
						{
							position: 'absolute',
							height: '101%',
							width: width,
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: 'transparent',
						},
					]}
				>
					<ActivityIndicator />
				</BlurView>
			)}
			{rank && isEnabled && (
				<Animated.View
					entering={FadeIn}
					exiting={FadeOut}
					style={{ position: 'absolute', bottom: 5, right: 5 }}
				>
					<RankChip rank={rank} />
				</Animated.View>
			)}
		</Pressable>
	);
};

export default ImageSelector;
