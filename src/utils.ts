import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';

export const zip = (arrays: any[]) => {
	return arrays[0].map(function (_: any, i: string | number) {
		return arrays.map(function (array) {
			return array[i];
		});
	});
};

export const copyToClipboard = async (text: string | number) => {
	await Clipboard.setStringAsync(`${text}`);
};

export const openBrowser = async (url: string, options?: WebBrowser.WebBrowserOpenOptions) => {
	await WebBrowser.openBrowserAsync(url, options);
};
