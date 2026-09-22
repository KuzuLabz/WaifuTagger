import { Directory, File } from 'expo-file-system';
import { createDownloadTask, completeHandler, getExistingDownloadTasks, setConfig } from '@kesha-antonov/react-native-background-downloader';
import { getCurrentPlatform } from './platform';
import { sendToast } from './toast';
import { ModelKey, SupportedModels, VariantType } from '../types';
import { MODEL_CATALOG } from '../constants';
import { getAllModelKeys, getFromModelKey } from './utils';

export const downloadTags = async (type: SupportedModels, directory?: string) => {
    const tagsKey = `${type}:tags`;
    const tagsFile = new File(directory, "tags.json");
    if (tagsFile.exists) {
        return tagsFile.uri;
    }
    const tagsTask = createDownloadTask({
        id: tagsKey,
        destination: tagsFile.uri,
        url: MODEL_CATALOG[type].tags,
        groupId: type,
        groupName: type,
    }).done(() => {
        completeHandler(tagsKey);
    });
    tagsTask.start();

    return tagsFile.uri;
};

export const downloadModel = async (type: SupportedModels, variant: VariantType, directory: string, onProgress: (progress: number) => void, onComplete: () => void) => {
    try {
        const modelKey = `${type}:${variant}` as ModelKey;
        const variantInfo = MODEL_CATALOG[type]['variants'][variant];
        const rootDir = new Directory(directory);
        const parentDir = new Directory(rootDir, type);
        parentDir.create({idempotent: true, intermediates: true});

        const modelFile = new File(parentDir, variantInfo.filename);

        if (getCurrentPlatform() === 'mobile') {
            setConfig({
                showNotificationsEnabled: true, 
                notificationsGrouping: { 
                    enabled: true, 
                    mode: 'summaryOnly',
                    texts: { 
                        groupTitle: MODEL_CATALOG[type].name,
                    } 
                }
            })
        }

        downloadTags(type, parentDir.uri);
        const modelTask = createDownloadTask({
            id: modelKey,
            destination: modelFile.uri,
            url: variantInfo.url,
            groupId: type,
            groupName: type,
        }).begin(({ expectedBytes }) => {
            console.log(`Starting download (${expectedBytes})`);
        }).progress(({ bytesTotal, bytesDownloaded }) => {
            onProgress(bytesDownloaded / bytesTotal)
        }).done(({ bytesDownloaded, bytesTotal, location }) => {
            onComplete();
            console.log(`Downloaded ${bytesDownloaded} to ${location}`);
            completeHandler(modelKey);
        }).error(({ error, errorCode }) => {
            sendToast({title: 'Failed to download model', preset: 'error'});
            console.log('Download canceled due to error: ', { error, errorCode });
        });
        modelTask.start();

    } catch (e) {
        console.warn(e);
    }
};

export const syncDownloads = async (onComplete: (taskId: string) => void) => {
    const tasks = await getExistingDownloadTasks();

    for (const task of tasks) {
        task.progress(({ bytesDownloaded, bytesTotal }) => {
            console.log(`Downloaded: ${bytesDownloaded / bytesTotal * 100}%`)
        }).done(({ location, bytesDownloaded, bytesTotal }) => {
            console.log('Download complete!', { location, bytesDownloaded, bytesTotal });
            onComplete(task.id);
        }).error(({ error, errorCode }) => {
            console.log('Download failed:', { error, errorCode })
        })
    }
};

export const getDirectoryUri = async (currentDir?: string) => {
    try {
        const dir = await Directory.pickDirectoryAsync(currentDir);
        if (dir) {
            const modelsDir = new Directory(dir);
            return (modelsDir.uri);
        }
        
    } catch (e) {
        console.log(e);
        return null;
    }
};

export const openModelsDir = async (modelDir?: string | undefined) => {
};

export const moveModels = async (currentDir: string | null | undefined, newDir: string | null | undefined) => {
    return '';
};

export const deleteModel = async (modelKey: ModelKey, modelDir?: string) => {
    const {type, variant} = getFromModelKey(modelKey);
    const baseDir = new Directory(modelDir, type);
    try {
        const model = new File(baseDir, MODEL_CATALOG[type].variants[variant].filename);
        if (model.exists) {
            model.delete();
        }

        return { isDownloaded: false, uri: undefined }
    } catch (e) {
        console.warn(e);
        sendToast({title: 'Failed to delete ' + type, preset: 'error'});
    }
};

export const verifyModels = async (modelsDir: string | undefined, onUpdate: (downloads: Record<ModelKey, boolean>) => void, ) => {
    const rootDir = new Directory(modelsDir);
    const modelKeys = getAllModelKeys();

    const updates: Record<string, boolean> = {}; 
    modelKeys.forEach((modelKey) => {
        const [type, variant] = modelKey.split(':');
        const file = new File(rootDir, type, MODEL_CATALOG[type].variants[variant].filename);
        updates[modelKey] = file.exists;
    });

    onUpdate(updates);
};

export const getModelUri = async (modelKey: ModelKey, baseUri?:string) => {
    const baseDir = new Directory(baseUri);
    const { type, variant } = getFromModelKey(modelKey);
    const tags = new File(baseDir, type, 'tags.json');
    const model = new File(baseDir, type, MODEL_CATALOG[type].variants[variant].filename);
    return {
        tags: tags.uri,
        model: model.uri
    }
};