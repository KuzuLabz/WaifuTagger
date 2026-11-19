import { useEffect } from "react";
import { readImage } from "@tauri-apps/plugin-clipboard-manager";
import { ImageController } from "../utils/selector";
import { useSettingsStore } from "../store/settings";
import { getCurrentPlatform } from "../utils/platform";
import { getHash } from "../utils/hash";

const POLL_INTERVAL_MS = 3000;

export const useClipboardMonitor = () => {
    const clipboardMonitor = useSettingsStore(state => state.clipboardMonitor);

    useEffect(() => {
        if (getCurrentPlatform() !== 'desktop' || !clipboardMonitor) {
            return;
        }

        let lastHash: string | null = null;
        let interval: ReturnType<typeof setInterval>;

        const checkClipboard = async () => {
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
                if (!hash || hash === lastHash) {
                    return;
                }
                lastHash = hash;
                await ImageController.fromPaste();
            } catch (e) {
                console.warn(e);
            }
        };

        interval = setInterval(checkClipboard, POLL_INTERVAL_MS);
        checkClipboard();
        return () => clearInterval(interval);
    }, [clipboardMonitor]);
};
