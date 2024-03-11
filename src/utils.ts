import * as Clipboard from 'expo-clipboard';

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

export const processBooruTagBody = (body: string) => {
	const newBody = body
		.replaceAll('[i]', '')
		.replaceAll('[/i]', '')
		.replaceAll('[b]', '')
		.replaceAll('[/b]', '')
		.split('h4.')[0];
	const doubleBracket = newBody.match(/\[\[.*?\]\]/g);
	if (doubleBracket) {
		const splitBody = newBody.split(/[[\]]{1,2}/g);
		for (let i = 0; i < splitBody.length; i++) {
			if (splitBody[i].includes('|')) {
				const splitBracket = splitBody[i].split('|');
				splitBody[i] = splitBracket.at(-1);
			}
		}
		const removedBrackets = splitBody.join('');
		return removedBrackets;
	} else {
		return newBody;
	}
};
