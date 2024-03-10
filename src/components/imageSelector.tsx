import { View, Pressable, useWindowDimensions } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ImageSelectorProps = {
    image?: ImagePicker.ImagePickerAsset;
    onImagePick: () => void;
};
const ImageSelector = ({ image, onImagePick }: ImageSelectorProps) => {
    const { top } = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    return (
        <Pressable
            onPress={onImagePick}
            style={{
                height: height * 0.35,
                width: '100%',
                borderWidth: 2,
                borderColor: image ? 'transparent' : '#FFF',
                borderRadius: 12,
                borderStyle: 'dashed',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                marginTop: top + 15,
            }}
        >
            {image ? (
                <Image
                    // source={{ uri: `data:image/png;base64,${image}` }}
                    source={{ uri: image.uri }}
                    style={{
                        width: undefined,
                        height: '100%',
                        aspectRatio: image.width / image.height,
                    }}
                />
            ) : (
                <>
                    <Icon source="upload" size={24} />
                    <Text variant="titleMedium">Upload Image</Text>
                </>
            )}
        </Pressable>
    );
};

export default ImageSelector;
