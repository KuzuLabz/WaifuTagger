import { Directory, File, Paths } from 'expo-file-system';
import { startActivityAsync } from 'expo-intent-launcher';
import { AppUpdaterType } from './types';
import { completeHandler, createDownloadTask } from '@kesha-antonov/react-native-background-downloader';
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import { getLatestGithubRelease } from './common';

const app_name = 'waifutagger';
const PLAY_STORE_INSTALLERS = new Set([
    'com.android.vending',
    'com.google.android.finsky',
]);

const getIsInstalledFromPlayStore = () => {
    const installer = DeviceInfoModule.installerPackageName;
    return !!installer && PLAY_STORE_INSTALLERS.has(installer);
};

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

const checkStoreUpdate = async () => {
    // TODO
    return null;
};

export const AppUpdater: AppUpdaterType = {
    checkForUpdate: async () => {
        const installedFromPlayStore = getIsInstalledFromPlayStore();

        if (!installedFromPlayStore) {
            return await getLatestGithubRelease();
        }

        return await checkStoreUpdate();
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



