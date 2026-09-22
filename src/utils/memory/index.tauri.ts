import { useModelsStore } from "../../store/models";
import { 
    getAppMemory, 
    getStorageInfo as getStorageInfoNative, 
    getMemoryInfo as getMemoryInfoNative, 
    getVramInfo, 
    getModelDirSize 
} from "../commands";
import { MemoryInfo, StorageInfo } from "./types";

export const getMemoryInfo = async (): Promise<MemoryInfo | null> => {
    const info = await getMemoryInfoNative();
    const appMemory = await getAppMemory();
    const vram = await getVramInfo();
    return {
        ram: {
            free: info.free_ram,
            total: info.total_ram,
            used: info.used_ram,
            appUsed: appMemory.memory_bytes
        },
        vram: vram && {
            free: vram.free_ram * Math.pow(1024, 2),
            total: vram.total_ram * Math.pow(1024, 2),
            used: vram.used_ram * Math.pow(1024, 2)
        }
    };
};

export const getStorageInfo = async (): Promise<StorageInfo | null> => {
    const baseDir = useModelsStore.getState().modelsDir;
    const info = await getStorageInfoNative(baseDir);
    const appUsed = await getModelDirSize(baseDir);

    return {
        free: info.free,
        total: info.total,
        used: info.used,
        appUsed
    }
};