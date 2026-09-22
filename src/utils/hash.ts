import * as Crypto from 'expo-crypto';
import { File } from 'expo-file-system';

export const getHash = async (data: string | File | ArrayBuffer): Promise<string | null> => {
    // Expo SDK 58 beta
    // if (data instanceof File) {
    //     return await data.digest('SHA-256');
    // }
    if (typeof data === 'string') {
        const base64Data = data.split(',').at(-1);
        if (base64Data.length < 1) {
            return null;
        }
        return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, base64Data);
    } else {
        const sha256Buffer = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, new Uint8Array(data instanceof File ? await data.arrayBuffer() : data));
        const hash = Array.from(new Uint8Array(sha256Buffer))
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('');
        return hash;
    }
};
