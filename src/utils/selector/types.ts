
export type ImageControllerType = {
    fromImageDialog: () => Promise<void>;
    fromCamera: () => Promise<void>;
    fromUrl: (url: string) => Promise<void>;
    fromDrop: (uri: string)  => Promise<void>;
    fromIntent: (uri: string) => Promise<void>;
    fromPaste: () => Promise<string | void>;
};