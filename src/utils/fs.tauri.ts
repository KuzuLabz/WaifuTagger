import { open } from '@tauri-apps/plugin-dialog';
import { t } from '@lingui/core/macro';
import { 
    downloadTags as downloadTagsNative, 
    downloadModel as downloadModelNative, 
    subscribeDownloadProgress,
    openModelsDir as openModelsDirNative,
    deleteModel as deleteModelNative,
    getBaseDir,
    moveModelDir,
    checkModelStatus,
    getModelPath,
    checkTagFile
} from './commands';
import { sendToast } from './toast';
import { ModelKey, SupportedModels, VariantType } from '../types';
import { getFromModelKey, getModelKey } from './utils';
import { MODEL_CATALOG } from '../constants';

export const downloadTags = async (type: SupportedModels, directory?: string) => {
    try {
        const exists = await checkTagFile(type, directory);
        if (exists) {
            return;
        }
        return await downloadTagsNative(MODEL_CATALOG[type].tags, type, directory);
    } catch (e) {
        console.warn(e);
    }
};

export const downloadModel = async (type: SupportedModels, variant: VariantType, directory?: string, onProgress?: (progress: number) => void, onComplete?: () => void) => {
    const unsubscribe = await subscribeDownloadProgress((event) => {
        const { downloaded_bytes, total_bytes, progress_percentage } = event.payload;
        onProgress(downloaded_bytes / total_bytes);
    });

    try {
        const [uri] = await Promise.all([
            downloadModelNative(type, variant, directory),
            downloadTags(type, directory)
        ]);
        onComplete();
        unsubscribe();
        return uri
    } catch (e) {
        console.warn(e);
        unsubscribe();
        sendToast({ title: t`Failed to download model!`, preset: 'error' });
        return null;
    }
};

export const syncDownloads = async () => {
    return null;
};

export const getDirectoryUri = async (currentDir?: string) => {
    try {
        const dir = await open({ directory: true, defaultPath: currentDir });
        return dir;
    } catch (e) {
        console.log(e);
        return null;
    }
};

export const openModelsDir = async (modelDir?: string | undefined) => {
    try {
        const basePath = await getBaseDir(modelDir);
        await openModelsDirNative(basePath);
    } catch (e) {
        console.warn(e);
        sendToast({title: t`Failed to open directory.`, preset: 'error'});
    }
};

export const moveModels = async (currentDir: string | null | undefined, newDir: string | null | undefined) => {
    try {
        const currentPath = await getBaseDir(currentDir);
        const targetPath = await getBaseDir(newDir);
        
        const resultPath = await moveModelDir(currentPath, targetPath);
        return resultPath;
    } catch (e) {
        console.warn(e);
        return;
    }
};


export const deleteModel = async (modelKey: ModelKey, modelDir?: string) => {
    const {type, variant} = getFromModelKey(modelKey);
    try {
        await deleteModelNative(type, variant, modelDir);
    } catch (e) {
        console.warn(e);
        sendToast({ title: t`Failed to delete ${type}`, preset: 'error' });
    }
};

export const verifyModels = async (modelsDir: string | undefined, onUpdate: (downloads: Record<ModelKey, boolean>) => void) => {
    const modelTypes = Object.keys(MODEL_CATALOG) as SupportedModels[];

    const updates: Record<ModelKey, boolean> = {};

    await Promise.allSettled(
        modelTypes.map(async (modelType) => {
            const modelConfig = MODEL_CATALOG[modelType as SupportedModels];
            const variants = Object.keys(modelConfig.variants) as VariantType[];
            const expectedFiles = {};

            for (let v of variants) {
                expectedFiles[v] = modelConfig.variants[v].filename
            }

            try {
                const status = await checkModelStatus(modelType as SupportedModels, expectedFiles, modelsDir);

                Object.entries(status.variants).forEach(([v, exists]) => {
                    updates[getModelKey({type: modelType, variant: v as VariantType})] = exists && status.has_tags;
                });
            } catch (err) {
                console.error(`Failed to verify model ${modelType}:`, err);
            }
        })
    );

    if (Object.keys(updates).length > 0) {
        onUpdate(updates);
    }

    return true;
};

export const getModelUri = async (modelKey: ModelKey, baseUri?:string) => {
    const { type, variant } = getFromModelKey(modelKey);
    const filename = MODEL_CATALOG[type].variants[variant].filename;
    const {modelPath} = await getModelPath(type, filename, baseUri);
    return {
        tags: modelPath.replace(filename, 'tags.json'),
        model: modelPath
    }
};