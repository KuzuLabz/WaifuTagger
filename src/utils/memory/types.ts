export type MemoryInfoItem = {
    total: number;
    free: number;
    used: number;
    appUsed: number;
};

export type MemoryInfo = {
    vram?: Omit<MemoryInfoItem, 'appUsed'>;
    ram: MemoryInfoItem;
};

export type StorageInfo = MemoryInfoItem;