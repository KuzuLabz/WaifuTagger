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
