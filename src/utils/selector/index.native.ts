import { File } from "expo-file-system";
import { useImageStore } from "../../store/image";
import { ImageControllerType } from "./types";
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { Platform } from "react-native";
import { useSettingsStore } from "../../store/settings";
import { loadImage } from "react-native-nitro-image";
import { t } from "@lingui/core/macro";
import { sendToast } from "../toast";
import { getHash } from "../hash";

const fromUrl: ImageControllerType['fromUrl'] = async (url) => {
    try {
        const img = await loadImage({url});
        const png = await img.toEncodedImageDataAsync('png', 100);
        
        const hash = await getHash(png.buffer);
        useImageStore.getState().setSelectedImage({
            uri: url, 
            hash, 
            width: img.width, 
            height: img.height
        });
    } catch (e) {
        sendToast({title: t`Failed to load image!`});
        console.warn(e);
    }
};

export const ImageController: ImageControllerType = {
    fromCamera: async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            base64: true,
            quality: 1,
        });
        const asset = result.assets?.[0];
        if (asset) {
            const hash = await getHash(new File(asset.uri));
            useImageStore.getState().setSelectedImage({ uri: asset.uri, base64: asset.base64, width: asset.width, height: asset.height, mimeType: asset.mimeType, hash });
        }
    },
    fromDrop: async () => {},
    fromImageDialog: async () => {
        const result = (
            await ImagePicker.launchImageLibraryAsync({
                base64: true,
                quality: 1,
                mediaTypes: ['images'],
            })
        )?.assets?.[0];

        if (result && result?.mimeType) {
            const hash = await getHash(
                result.base64 ? result.base64 : result.uri.includes('data:') ? result.uri.split(',').at(-1) : '',
            );
            useImageStore.getState().setSelectedImage({...result, hash}, result.fileName);
            useSettingsStore.getState().updateLastOpenedDir(result.uri);
        }
    },
    fromUrl: fromUrl,
    fromIntent: async (uri) => {
        const image = new File(uri);
        const hash = await getHash(image);
        useImageStore.getState().setSelectedImage({uri: image.uri, hash});
        useSettingsStore.getState().updateLastOpenedDir(image.uri);
    },
    fromPaste: async () => {
        try {
            const isImage = await Clipboard.hasImageAsync();
            if (isImage) {
                const img = await Clipboard.getImageAsync({format: 'png'});
                const hash = await getHash(img.data.split(',').at(-1) ?? '');
                useImageStore.getState().setSelectedImage({uri: img.data, hash, ...img.size});
            }

            const isText = await (Platform.OS === 'ios' ? Clipboard.hasUrlAsync() : Clipboard.hasStringAsync());
            if (isText) {
                const text = await (Platform.OS === 'ios' ? Clipboard.getUrlAsync() : Clipboard.getStringAsync());
                if (text.startsWith('http')) {
                    await fromUrl(text);
                    return text;
                }
                return;
            }
        } catch (e) {
            console.warn(e);
        }
        
    },
};