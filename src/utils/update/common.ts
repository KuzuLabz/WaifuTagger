import { Platform } from "react-native";
import { RELEASES_URL, REPO_URL } from "../../constants";
import { GithubReleaseResponse } from "../../types";
import Constants from 'expo-constants';
import { type } from '@tauri-apps/plugin-os';
import { fetch as nativeFetch } from '@tauri-apps/plugin-http';

export const getLatestGithubRelease= async() => {
    const platform = Platform.OS === 'web' ? type() : Platform.OS;
    const response = await (Platform.OS === 'web' ? nativeFetch : fetch)(REPO_URL + '/releases/latest');
    const data = await response.json() as GithubReleaseResponse;
    const newestVersion = data?.tag_name ?? null;

    const ext = platform === 'android' ? 'apk' : platform === 'linux' ? 'AppImage' : platform === 'macos' ? 'app' : 'exe';

    if (newestVersion && newestVersion !== Constants?.expoConfig?.version) {
        const platformAsset = data.assets.find((asset) => asset.name.includes(`.${ext}`));
        if (!platformAsset) {
            return null;
        }
        return {
            version: newestVersion,
            body: data.body,
            url: platformAsset.browser_download_url
        };
    } else {
        return null;
    }
};