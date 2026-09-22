import { MemoryInfo, StorageInfo } from "./types";
import { DeviceInfoModule } from "react-native-nitro-device-info";
import { requireNativeModule } from "expo";
import { Directory } from "expo-file-system";
import { useModelsStore } from "../../store/models";

type SystemMemoryInfo = {
    availableMemory: number;
    usedMemory: number;
};
interface DeviceMemoryModuleInterface {
    getSystemMemoryInfo: () => SystemMemoryInfo;
}
const DeviceMemoryModule = requireNativeModule<DeviceMemoryModuleInterface>('DeviceMemoryModule');

export const getMemoryInfo = async (): Promise<MemoryInfo | null> => {
    const systemMemory = DeviceMemoryModule.getSystemMemoryInfo();
    return {
        ram: {
            appUsed: DeviceInfoModule.getUsedMemory(),
            free: systemMemory.availableMemory,
            total: DeviceInfoModule.totalMemory,
            used: systemMemory.usedMemory
        }
    };
};

export const getStorageInfo = async (): Promise<StorageInfo | null> => {
    const freeSpace = DeviceInfoModule.getFreeDiskStorage();
    const modelDir = new Directory(useModelsStore.getState().modelsDir);

    return {
        free: freeSpace,
        total: DeviceInfoModule.totalDiskCapacity,
        used: DeviceInfoModule.totalDiskCapacity - freeSpace,
        appUsed: modelDir.size
    }
};