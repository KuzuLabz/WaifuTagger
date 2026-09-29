// import { check } from '@tauri-apps/plugin-updater';
// import { relaunch } from '@tauri-apps/plugin-process';
import { AppUpdaterType } from './types';
import { RELEASES_URL, REPO_URL } from '../../constants';
import { GithubReleaseResponse } from '../../types';
import { getLatestGithubRelease } from './common';
import { openBrowser } from '../utils';

export const AppUpdater: AppUpdaterType = {
    checkForUpdate: async () => {
        return await getLatestGithubRelease();
    },
    startUpdate: async (_url, _version, onStart, onProgress, onComplete) => {
        await openBrowser(RELEASES_URL + '/latest', undefined, 'WaifuTagger Release');
        // const update = await check();
        // if (update) {
        //     console.log(
        //         `found update ${update.version} from ${update.date} with notes ${update.body}`
        //     );
        //     let downloaded = 0;
        //     let total = 0;
        //     await update.downloadAndInstall((event) => {
        //         switch (event.event) {
        //             case 'Started':
        //                 onStart?.();
        //                 total = event.data.contentLength;
        //                 console.log(`started downloading ${total} bytes`);
        //                 break;
        //             case 'Progress':
        //                 downloaded += event.data.chunkLength;
        //                 console.log(`downloaded ${downloaded} from ${total}`);
        //                 onProgress?.(downloaded / total);
        //                 break;
        //             case 'Finished':
        //                 console.log('download finished');
        //                 onComplete?.();
        //                 break;
        //         }
        //     });
        //     await relaunch();
        // }
    },
    clean: async () => {
    }
};
