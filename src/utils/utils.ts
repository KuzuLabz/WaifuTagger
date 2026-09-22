import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform, Share } from 'react-native';
import { share, canShare } from "@vnidrop/tauri-plugin-share";
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';
import { getCurrentPlatform } from './platform';
import { t } from '@lingui/core/macro';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useSettingsStore } from '../store/settings';
import { sendToast } from './toast';
import * as tauriPath from '@tauri-apps/api/path';
import { ModelKey, SupportedModels, VariantType } from '../types';
import { MODEL_CATALOG } from '../constants';
import { filesize } from 'filesize';

const openUrlWindow = (url: string, title?: string) => {
    if (useSettingsStore.getState().extBrowser) {
        openUrl(url);
        return;
    }
    const windowLabel = `external-win-${Date.now()}`;

    const webview = new WebviewWindow(windowLabel, {
        url: url,
        title: title,
        width: 1024,
        height: 768,
        resizable: true,
    });

    webview.once('tauri://created', () => {
        console.log('New webview window successfully created');
    });

    webview.once('tauri://error', (e) => {
        console.error('Error creating window:', e);
    });
};

export const copyToClipboard = async (text: string | number) => {
    const message = t`Copied to Clipboard`;
    if (getCurrentPlatform() === 'desktop') {
        await writeText(`${text}`);
        sendToast({ title: message, preset: 'done' });
        return;
    }

	const isSet = await Clipboard.setStringAsync(`${text}`);
	if (Platform.OS === 'web' && isSet) {
		sendToast({ title: message, preset: 'done' });
	}
};

export const pasteFromClipboard = async () => {
    const text = Platform.OS === 'web' ? await readText() : await Clipboard.getStringAsync();
    return text;
};

export const openBrowser = async (url: string, options?: WebBrowser.WebBrowserOpenOptions, title?: string) => {
    const platform = getCurrentPlatform();
    if (platform === 'desktop') {
        openUrlWindow(url, title);
        return;
    }

    if (useSettingsStore.getState().extBrowser) {
        await Linking.openURL(url);
    } else {
        await WebBrowser.openBrowserAsync(url, options);
    }
};

export const getImageBlob = (arrayBuffer: ArrayBuffer) => {
    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' }); 
    return URL.createObjectURL(blob);
};

export const shareText = async (text: string) => {
    const platform = getCurrentPlatform();
    if (platform === 'desktop') {
        const ready = await canShare();
        ready && await share({text});
        await share({text});
    } else if (platform === 'mobile') {
        await Share.share({message: text});
    }
};

export const getModelKey = ({ type, variant } :{type: SupportedModels, variant: VariantType}): ModelKey => `${type}:${variant}`;
export const getAllModelKeys = (): ModelKey[] => {
    const types = Object.keys(MODEL_CATALOG) as SupportedModels[];
    const modelKeys: ModelKey[] = [];
    
    types.forEach((t) => {
        (Object.keys(MODEL_CATALOG[t].variants) as VariantType[]).forEach((v) => {
            modelKeys.push(getModelKey({type: t, variant: v}))
        })
    });

    return modelKeys;
};
export const getFromModelKey = (modelKey: ModelKey) => {
    const [type, variant] = modelKey.split(':') as [SupportedModels, VariantType];
    return {type, variant};
};

/** Tauri only */
export const getTypeVariantFromPath = async (uri: string): Promise<{type: SupportedModels, variant: VariantType | null}> => {
    if (uri.endsWith('.onnx')) {
        const parentDirUri = await tauriPath.dirname(uri);
        const filename = await tauriPath.basename(uri);
        const type = await tauriPath.basename(parentDirUri) as SupportedModels;
        
        let variant: VariantType;
        Object.entries(MODEL_CATALOG[type].variants).forEach(([v, info], idx) => {
            if (info.filename === filename) {
                variant = v as VariantType;
                return;
            }
        });

        return { type, variant };
    } else {
        const type = await tauriPath.basename(uri) as SupportedModels;
        return { type, variant: null }
    }
}

export const getBytesToGigabytes = (bytes: number) => {
    return bytes / (1024 * 1024 * 1024);
};
export const formatBytes = (bytes: number) => {
    return filesize(bytes, { output: 'array' });
};