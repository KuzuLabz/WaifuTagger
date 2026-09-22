import { View, Pressable, useWindowDimensions, Platform } from 'react-native';
import { Button, Chip, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { RankInfo } from '../types';
import { useStatsStore } from '../store/stats';
import { useLingui } from '@lingui/react/macro';
import { useImageStore } from '../store/image';
import { useDragDrop } from '../hooks/useDragDrop';
import { useAppTheme } from '../providers/theme';
import { CircularProgress } from './common/progressBar';

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
const ImageSelector = ({ rank, isLoading, onImagePick }: ImageSelectorProps) => {
	const { height, width } = useWindowDimensions();
    const imageUri = useImageStore(state => state.image?.uri);
	const isEnabled = useStatsStore(state => state.isEnabled);
    const { colors } = useAppTheme();
    const { isHovered } = useDragDrop();
    const { t } = useLingui();

	return (
		<Pressable
            nativeID='drop-zone'
			onPress={onImagePick}
			style={{
				height: height / 3 + 16,
                minHeight: Platform.OS === 'web' ? 400 : undefined,
				alignSelf: 'center',
				width: '100%',
				borderStyle: 'solid',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'row',
				overflow: 'hidden',
			}}
		>
			{imageUri ? (
				<View style={{ width: '100%', height: '100%' }}>
                    <Image 
                        source={{ uri: imageUri }}
						style={{
							width: '100%',
							height: '100%',
                            position: 'absolute',
							// paddingVertical: 8,
						}}
						contentFit="cover"
                        blurRadius={18}
                    />
                    <View style={{height: '100%', width: '100%', paddingTop: 80, paddingBottom: 8,}}>
                        <Image
                            source={{ uri: imageUri }}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            contentFit="contain"
                        />
                    </View>
				</View>
			) : (
				<>
					<Button mode="text" icon={'upload'} onPress={onImagePick} style={{marginTop: 80}}>
						{t`Upload Image`}
					</Button>
				</>
			)}
			{isLoading && (
				<BlurView
					intensity={50}
					tint="systemChromeMaterialDark"
					style={[
						{
							position: 'absolute',
							height: '101%',
							width: width,
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: 'transparent',
                            paddingTop: 82
						},
					]}
				>
					<CircularProgress hosted={Platform.OS !== 'web'} value={0} indeterminate matchContents />
				</BlurView>
			)}
			{rank && isEnabled && (
				<Animated.View
					entering={FadeIn}
					exiting={FadeOut}
					style={{ position: 'absolute', bottom: 10, right: Platform.OS === 'web' ? 24 : 10 }}
				>
					<RankChip rank={rank} />
				</Animated.View>
			)}
            {isHovered && <Animated.View entering={FadeIn} exiting={FadeOut} style={{ position: 'absolute', width: '100%', height: '100%'}}>
                <View style={{backgroundColor: colors.surfaceContainerHigh, opacity: 0.75, width: '100%', height: '100%'}} />
                </Animated.View>}
		</Pressable>
	);
};

export default ImageSelector;
