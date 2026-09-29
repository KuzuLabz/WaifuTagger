// import { check } from '@tauri-apps/plugin-updater';
// import { relaunch } from '@tauri-apps/plugin-process';
import { AppUpdaterType } from './types';
import { REPO_URL } from '../../constants';
import { GithubReleaseResponse } from '../../types';

export const AppUpdater: AppUpdaterType = {
    checkForUpdate: async () => {
        // const update = await check();
        const update = { version: 3.0 };
        if (update) {
            const response = await fetch(REPO_URL + '/releases/latest');
            const data = await response.json() as GithubReleaseResponse;
            console.log(`Update ${update.version} is available!`);
            return { body: data.body, version: data.tag_name, url: data.assets_url }
        }
        return null;
    },
    startUpdate: async (_url, _version, onStart, onProgress, onComplete) => {
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
