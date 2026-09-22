import { invoke } from "@tauri-apps/api/core";
import { ImageControllerType } from "./types";
import { getImageBlob } from "../utils";
import { open } from "@tauri-apps/plugin-dialog";
import { useSettingsStore } from "../../store/settings";
import { SelectedImage, useImageStore } from "../../store/image";
import { t } from "@lingui/core/macro";
import { readImage, readText } from '@tauri-apps/plugin-clipboard-manager';
import { sendToast } from "../toast";
import { getRemoteImage as getRemoteImageTauri } from '../commands'
import { getHash } from "../hash";

const getLocalImage = (path: string) => {
    return invoke<ArrayBuffer>('get_local_image', {path: decodeURIComponent(path)});
};

const getRemoteImage = async (url: string) => {
    try {
        const remoteUrl = (url.includes('\n') ? url.split('\n')[0] : url).replace(/\0/g, '').trim();
        return await getRemoteImageTauri(remoteUrl);
    } catch (error) {
        console.warn(error);
    }
    
};

const getClipboardImage = async (): Promise<SelectedImage | null> => {
    try {
        const image = await readImage();
        if (image) {
            const size = await image.size();
            const rgbaBytes = await image.rgba();
            const canvas = new OffscreenCanvas(size.width, size.height);
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            const clampedArray = new Uint8ClampedArray(
                rgbaBytes.buffer,
                rgbaBytes.byteOffset,
                rgbaBytes.byteLength
            );

            // @ts-expect-error arraybuffers...
            ctx.putImageData(new ImageData(clampedArray, width, height), 0, 0);
            const blob = await canvas.convertToBlob({ type: 'image/png' });
            const uri = URL.createObjectURL(blob);
            const hash = await getHash(await blob.arrayBuffer());
            return { uri, hash, ...size };
        }
    } catch (e) {
        console.warn(e);
        return null;
    }
};

const getClipboardUrl = async (): Promise<string | null> => {
    try {
        const url = await readText();
        if (url) {
            return url
        } else {
            return null;
        }
    } catch (e) {
        console.warn(e);
        return null;
    }
};

const getSelectedImageData = async (arrayBuffer: ArrayBuffer, fileName?: string) => {
    try {
        const uri = getImageBlob(arrayBuffer);
        console.log(uri);
        const hash = await getHash(arrayBuffer);
        return { uri, fileName, hash }
    } catch (e) {
        console.warn(e);
    }
};

const getImageFromLocalPath = async (path: string): Promise<SelectedImage> => {
    try {
        const imageBuffer = await getLocalImage(path);
        const fileName = path.split('/').at(-1);
        return await getSelectedImageData(imageBuffer, fileName);
    } catch (e) {
        console.error(e);
    }
};

export const ImageController: ImageControllerType = {
    fromImageDialog: async () => {
        try {
            const filePath = await open({defaultPath: useSettingsStore.getState().lastOpenedDir});
            if (!filePath) {
                return;
            }
            const data = await getImageFromLocalPath(filePath);
            useImageStore.getState().setSelectedImage(data, filePath);
            useSettingsStore.getState().updateLastOpenedDir(filePath);
        } catch (e) {
            sendToast({title: `${e}`, preset: 'error'});
        }
    },
    fromCamera: async () => {
        // Unsupported platform
        return;
    },
    fromUrl: async (url) => {
        try {
            const img = await getRemoteImage(url);
            console.log(img.byteLength);
            const data = await getSelectedImageData(img, url.split('/').at(-1) ?? 'temp');
            useImageStore.getState().setSelectedImage(data, url);
        } catch (e) {
            console.warn(e);
            sendToast({ preset: 'error', title: t`Error loading URL` });
        }
        
    },
    fromDrop: async (filePath) => {
        try {
            if (!filePath) {
                return;
            }
            sendToast({title: t`Processing image...`, preset: 'none', duration: 2});
            console.log('Filepath:', filePath);
            const data = await getImageFromLocalPath(filePath);
            useImageStore.getState().setSelectedImage(data, filePath);
            useSettingsStore.getState().updateLastOpenedDir(filePath);
        } catch (e) {
            sendToast({title: e, preset: 'error'});
        }
    },
    fromIntent: async () => {
        return;
    },
    fromPaste: async () => {
        try {
            const imageData = await getClipboardImage();
            const url = await getClipboardUrl();

            if (imageData) {
                useImageStore.getState().setSelectedImage(imageData);
            }

            if (url) {
                const img = await getRemoteImage(url);
                const data = await getSelectedImageData(img, url.split('/').at(-1) ?? 'temp');
                useImageStore.getState().setSelectedImage(data, url);
                return url;
            }

        } catch (e) {
            console.warn(e);
        }
    }
};