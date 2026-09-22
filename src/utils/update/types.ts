export type UpdateDetails = {
    version: string;
    url: string;
    body?: string;
} | null;

export type AppUpdaterType = {
    startUpdate: (url:string, version: string, onStart?: () => void, onProgress?: (progress: number) => void, onComplete?: () => void) => Promise<void>,
    clean: () => Promise<void>,
    checkForUpdate: () => Promise<UpdateDetails>
};