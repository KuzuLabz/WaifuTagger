import { useEffect } from "react";
import { readImage } from "@tauri-apps/plugin-clipboard-manager";
import { type as osType } from "@tauri-apps/plugin-os";
import { ImageController } from "../utils/selector";
import { useSettingsStore } from "../store/settings";
import { useImageStore } from "../store/image";
import { getCurrentPlatform } from "../utils/platform";
import { getHash } from "../utils/hash";

const POLL_INTERVAL_MS = 3000;

let isChecking = false;

const checkClipboard = async () => {
    if (isChecking) {
        return;
    }
    isChecking = true;
    try {
        const image = await readImage();
        if (!image) {
            return;
        }
        const rgbaBytes = await image.rgba();
        const buffer = rgbaBytes.buffer.slice(
            rgbaBytes.byteOffset,
            rgbaBytes.byteOffset + rgbaBytes.byteLength
        );
        const hash = await getHash(buffer);
        const { clipboardHash, setClipboardHash } = useImageStore.getState();
        if (!hash || hash === clipboardHash) {
            return;
        }
        setClipboardHash(hash);
        await ImageController.fromPaste();
    } catch (e) {
        console.warn(e);
    } finally {
        isChecking = false;
    }
};

export const useClipboardMonitor = () => {
    const clipboardMonitor = useSettingsStore(state => state.clipboardMonitor);

    useEffect(() => {
        if (getCurrentPlatform() !== 'desktop' || osType() === 'linux' || !clipboardMonitor) {
            return;
        }

        const interval = setInterval(checkClipboard, POLL_INTERVAL_MS);
        checkClipboard();
        return () => clearInterval(interval);
    }, [clipboardMonitor]);
};
