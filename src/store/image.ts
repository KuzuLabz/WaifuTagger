import { create } from 'zustand';
import { useThemeStore } from './theme';
import { ImageUtils } from 'material-color-react-native';

export type SelectedImage = {
	uri: string | null;
	height?: number;
	width?: number;
	base64?: string;
	fileName?: string;
	mimeType?: string;
	hash: string | null;
};

export type ImageState = {
    image: SelectedImage;
    currentHash: string | null;
    isInferDisabled: boolean;
};

type ImageAction = {
    setSelectedImage: (image: SelectedImage, colorCacheKey?: string) => void;
    setCurrentHash: () => void;
    clear: () => void;
};

const initialState: ImageState = {
	image: {
        height: 1,
        width: 1,
        uri: null,
        hash: null,
    },
    currentHash: null,
    isInferDisabled: true,
};

export const useImageStore = create<ImageState & ImageAction>(
    (set, get) => ({
        ...initialState,
        setSelectedImage(image) {
            if (image.hash === get().currentHash) {
                set({isInferDisabled: true});
                return;
            } 
            set({image: image, isInferDisabled: false});
            ImageUtils.sourceHexColorFromImageUri(image.uri, {maxWidthOrHeight: 640}).then((color) => {
                useThemeStore.getState().updateTheme({ color });
            });
            
        },
        setCurrentHash() {
            set({currentHash: get().image.hash});
        },
        clear() {
            set(initialState)
        },
    }),
);
