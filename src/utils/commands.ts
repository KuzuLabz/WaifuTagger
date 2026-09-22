// TAURI COMMANDS

import { invoke } from "@tauri-apps/api/core";
import { Event, listen } from "@tauri-apps/api/event";
import { RawTags, SupportedModels, VariantType } from "../types";
import { MODEL_CATALOG } from "../constants";

interface ModelStatus {
    has_tags: boolean;
    variants: Record<VariantType, boolean>;
};

interface ProgressPayload {
    model_name: string;
    downloaded_bytes: number;
    total_bytes: number;
    progress_percentage: number;
}

export const getBaseDir = async (customDir?: string) => {
    return await invoke<string>('get_base_dir', { customDir: customDir});
};

/** Returns tags uri */
export const downloadTags = async (tagsUrl: string, type: SupportedModels, baseDir?: string) => {
    return invoke<string>('download_tags', { tagsUrl: tagsUrl, modelType: type, customDir: baseDir })
};

/** Returns unsubscribe func */
export const subscribeDownloadProgress = async (onEvent: (event: Event<ProgressPayload>) => void) => {
    return await listen<ProgressPayload>('download-progress', onEvent);
};
/** Returns model directory */
export const downloadModel = async (type: SupportedModels, variant: VariantType, baseDir?: string) => {
    const info = MODEL_CATALOG[type].variants[variant];
    return await invoke<string>('download_model', { 
        url: MODEL_CATALOG[type].variants[variant].url, 
        modelType: type, 
        fileName: info.filename, 
        customDir: baseDir 
    });
};

export const deleteModel = async (type: SupportedModels, variant: VariantType, baseDir?: string) => 
    invoke('delete_model', { 
        customDir: baseDir, 
        modelType: type, 
        fileName: MODEL_CATALOG[type].variants[variant].filename 
    });

/** Returns the new directory uri */
export const moveModelDir = async (currentDir: string, targetDir: string) => {
    return await invoke<string>('move_models_directory', {
        currentDir: currentDir,
        newDir: targetDir,
    });
};

export const openModelsDir = async (baseDir: string) => {
    await invoke('open_model_dir', { path: baseDir});
};

export const checkModelStatus = async (type: SupportedModels, expectedFiles: Record<string, string>, customDir?: string) => {
    return await invoke<ModelStatus>('check_model_status', {
        modelType: type,
        customDir: customDir,
        expectedFiles,
    });
};

export const checkTagFile = async (type: SupportedModels, customDir?: string) => {
    return await invoke<boolean>('check_tags', { modelType: type, customDir });
};

export const getModelPath = async (type: SupportedModels, fileName: string, baseDir?: string) => {
    const modelPath = await invoke<string>('get_model_path', {
        modelName: type, 
        fileName: fileName, 
        customDir: baseDir
    });
    return {modelPath, fileName}
};


// ONNX

export const loadModel = async (type: SupportedModels, path: string, baseDir?: string, gpu?: boolean) => {
    return await invoke<string>('load_model', { modelType: type, path, customDir: baseDir ?? undefined, preferGpu: gpu });
};

export const unloadModel = async () => {
    await invoke('unload_model');
};

export const runInference = async (imageBytes: Uint8Array | number[]) => {
    try {
        const rawArrayBuffer = await invoke<ArrayBuffer>('run_inference', {
            image: Array.from(imageBytes),
        });

        return new Uint8Array(rawArrayBuffer);
    } catch (e) {
        console.warn(e);
    }
};

export const getTagsData = async (type: SupportedModels, baseDir?: string) => {
    return await invoke<RawTags>('get_tags_json', {modelType: type, customDir: baseDir})
};

// Fetch
export const getRemoteImage = async (url: string) => {
    return await invoke<ArrayBuffer>('get_remote_image', {url});
};

// Memory
interface TauriMemoryInfo {
    total_ram: number; 
    used_ram: number; 
    free_ram: number;
};

export const getMemoryInfo = async () => {
    return await invoke<TauriMemoryInfo>('get_memory_info');
};
export const getAppMemory = async () =>  {
    return await invoke<{memory_bytes: number}>('get_app_memory');
};
export const getVramInfo = async () => {
    return await invoke<TauriMemoryInfo | undefined>('get_vram_memory');
};

// Storage
export const getModelDirSize = async (customDir?: string) => {
    const path = await getBaseDir(customDir);
    return await invoke<number>('get_dir_size', { path });
};
export const getStorageInfo = async (customDir?: string) => {
    const path = await getBaseDir(customDir);
    return await invoke<{total: number; used: number; free: number;}>('get_storage', { path });
};