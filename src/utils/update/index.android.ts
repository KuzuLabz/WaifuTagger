import { Directory, File, Paths } from 'expo-file-system';
import { startActivityAsync } from 'expo-intent-launcher';
import { AppUpdaterType } from './types';
import Constants from 'expo-constants';
import { completeHandler, createDownloadTask } from '@kesha-antonov/react-native-background-downloader';
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import { GithubReleaseResponse } from '../../types';
import { REPO_URL } from '../../constants';

const app_name = 'waifutagger';

export const launchAPK = async (destination: string) => {
    const file = new File(destination);
    try {
        await startActivityAsync('android.intent.action.VIEW', {
            type: 'application/vnd.android.package-archive',
            data: file.contentUri,
            flags: 1,
            category: 'android.intent.category.DEFAULT',
        });
    } catch (e) {
        console.warn(e);
    }
};


const checkLocalUpdate = async() => {
    const response = await fetch(REPO_URL + '/releases/latest');
    const data = await response.json() as GithubReleaseResponse;
    const newestVersion = data?.tag_name ?? null;

    if (newestVersion && newestVersion !== Constants?.expoConfig?.version) {
        const apkAsset = data.assets.find((asset) => asset.name.includes('.apk'));
        if (!apkAsset) {
            return null;
        }
        return {
            version: newestVersion,
            body: data.body,
            url: apkAsset.browser_download_url
        };
    } else {
        return null;
    }
};
const checkStoreUpdate = async () => {
    // TODO
    return null;
};

export const AppUpdater: AppUpdaterType = {
    checkForUpdate:  async () => {
        const isSideloaded = DeviceInfoModule.installerPackageName === 'unknown';
        if (isSideloaded) {
            return await checkLocalUpdate();
        } else {
            return await checkStoreUpdate();
        }
    },
    startUpdate: async (url, version, onStart, onProgress, onComplete) => {
        const jobId = `${app_name}${version.replaceAll('.', '-')}`;
        const destination = new File(Paths.cache, `${jobId}.apk`);
        const task = createDownloadTask({
            id: jobId,
            destination: destination.uri,
            url: url,
        }).begin(() => {
            onStart?.();
        }).progress(({bytesTotal, bytesDownloaded}) => {
            onProgress(bytesDownloaded / bytesTotal);
        }).done(() => {
            onComplete?.();
            launchAPK(destination.uri);
            completeHandler(jobId);
            
        });
        task.start();
    },
    clean: async () => {
        const dir = new Directory(Paths.cache);
        for (const file of dir.list()) {
            if (file.name.includes(app_name) && file.uri.includes('.apk')) {
                file.delete();
            }
        }
    }
};



