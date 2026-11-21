import { useEffect } from "react";
import { readImage } from "@tauri-apps/plugin-clipboard-manager";
import { ImageController } from "../utils/selector";
import { useSettingsStore } from "../store/settings";
import { getCurrentPlatform } from "../utils/platform";
import { getHash } from "../utils/hash";

const POLL_INTERVAL_MS = 3000;

const checkClipboard = async (currentHash: string) => {
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
        if (!hash || hash === currentHash) {
            return;
        }
        await ImageController.fromPaste();
    } catch (e) {
        console.warn(e);
    }
};

export const useClipboardMonitor = () => {
    const clipboardMonitor = useSettingsStore(state => state.clipboardMonitor);
    const currentHash = useImageStore(state => state.currentHash);

    useEffect(() => {
        if (platform() === 'linux' || !clipboardMonitor) {
            return;
        }

        let interval: ReturnType<typeof setInterval>;

        interval = setInterval(checkClipboard, POLL_INTERVAL_MS);
        checkClipboard(currentHash);
        return () => clearInterval(interval);
    }, [clipboardMonitor]);
};
