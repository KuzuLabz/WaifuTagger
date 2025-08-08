import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import * as Burnt from 'burnt';
import { Platform } from 'react-native';
import { GetImageMD5 } from './wailsjs/go/main/App';
import * as Crypto from 'expo-crypto';

export const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));

export const zip = (arrays: any[]) => {
	return arrays[0].map(function (_: any, i: string | number) {
		return arrays.map(function (array) {
			return array[i];
		});
	});
};

export const copyToClipboard = async (text: string | number) => {
	const isSet = await Clipboard.setStringAsync(`${text}`);
	if (Platform.OS === 'web' && isSet) {
		Burnt.toast({ title: 'Copied to Clipboard', preset: 'done' });
	}
};

export const openBrowser = async (url: string, options?: WebBrowser.WebBrowserOpenOptions) => {
	await WebBrowser.openBrowserAsync(url, options);
};

export const toastImageError = (): void =>
	Burnt.toast({
		title: 'Image must be PNG or JPEG',
		haptic: 'error',
		preset: 'error',
	});

export const getBase64Uri = (b64: string, mime: string) => {
	if (['image/png', 'image/jpeg'].includes(mime)) {
		return `data:${mime};base64,${b64}`;
	}
	return null;
};

export const getImageHash = async (base64String: string): Promise<string | null> => {
	const base64Data = base64String.split(',').at(-1);
	let hash = '';
	if (base64Data.length < 1) {
		return null;
	}

	if (Platform.OS === 'web') {
		hash = await GetImageMD5(base64Data);
	} else {
		hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.MD5, base64Data);
	}
	return hash;
};
