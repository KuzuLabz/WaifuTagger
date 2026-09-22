import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Directory, Paths } from 'expo-file-system';
import { deleteModel, downloadModel, getDirectoryUri, moveModels, verifyModels } from '../utils/fs';
import { INIT_THRESHOLDS, MAX_TAGS, MODEL_CATALOG } from '../constants';
import { getModelKey } from '../utils/utils';
import { ModelKey, SupportedModels, TagCategoryType, VariantType } from '../types';

export type ThresholdSettings = Record<TagCategoryType, number>;

export type SelectedModel = { type: SupportedModels; variant: VariantType } | null;

export type ModelSettings = {
    thresholds: ThresholdSettings;
    maxTags: number;
};

export type ModelsState =  {
    downloaded: Partial<Record<ModelKey, boolean>>;
    settings: Partial<Record<SupportedModels, ModelSettings>>;
    selected: SelectedModel;
    modelsDir: string | null;
};

type ModelsAction = {
    download: (type: SupportedModels, variant: VariantType, onProgress: (val: number) => void, onComplete?: () => void) => Promise<void>;
    delete: (type: SupportedModels, variant: VariantType) => Promise<void>;
    changeDirectory: (onBeforeMove?: () => void) => Promise<void>;
    resetDirectory: () => Promise<void>;
    updateSettings: (config: Partial<ModelSettings>) => void;
    updateDownloaded: (modelKey: ModelKey, isDownloaded: boolean) => void;
    removeModelType: (type: SupportedModels) => void;
    selectModel: (type: SupportedModels, variant: VariantType) => void;
};

const getDefaultDir = () => Platform.OS === 'web' ? null : (new Directory(Paths.document.uri, 'models')).uri;

export const useModelsStore = create<ModelsState & ModelsAction>()(
	persist(
		(set, get) => ({
			downloaded: {},
            modelsDir: getDefaultDir(),
            selected: null,
            settings: {},
			selectModel(type, variant) {
                const settings = get().settings;
                
                set({selected: { type, variant }});

                if (!settings[type]) {
                    set((state) => ({...state, settings: {...state.settings, [type]: {
                        maxTags: MAX_TAGS,
                        thresholds: {
                            ...INIT_THRESHOLDS, 
                            general: MODEL_CATALOG[type].minThreshold
                        }, 
                    }}}));
                }
            },
            async download(type, variant, onProgress, onComplete) {
                const dir = get().modelsDir;
                const key = getModelKey({type, variant});
                await downloadModel(type, variant, dir, onProgress, () => {
                    set((state) => ({ downloaded: {...state.downloaded, [key]: true} }));
                    if (!get().settings[type]) {
                        set(state => ({
                            settings: { 
                                ...state.settings,
                                [type]: {
                                    thresholds: {
                                        ...INIT_THRESHOLDS, 
                                        general: MODEL_CATALOG[type].minThreshold
                                    }, 
                                    maxTags: MAX_TAGS 
                                }
                            }
                        }));
                    }
                    onComplete?.();
                });
                
            },
            async delete(type, variant) {
                const key = getModelKey({type, variant});
                const selected = get().selected;
                await deleteModel(key, get().modelsDir);
                set((state) => ({ downloaded: {...state.downloaded, [key]: false}}));
                
                if (selected && selected.type === type && selected.variant === variant) {
                    set({selected: null});
                }
            },
            changeDirectory: async (onBeforeMove) => {
                const dir = await getDirectoryUri(get().modelsDir);
                if (dir === get().modelsDir) {
                    return;
                }
                if (dir) {
                    onBeforeMove?.();
                    await moveModels(get().modelsDir ?? '', dir);
                    set({modelsDir: dir});
                    await verifyModels(dir, (downloads) => set({downloaded: downloads}));
                }
            },
            async resetDirectory() {
                const dir = getDefaultDir();

                const newDir = await moveModels(get().modelsDir ?? '', dir);
                set({ modelsDir: newDir });
            },
            removeModelType(type) {
                const selected = get().selected;
                const newDownloaded = Object.fromEntries(Object.keys(get().downloaded).map((mType) => [mType, false]));
                set((state) => ({...state, selected: selected?.type === type ? null : selected, downloaded: {...state.downloaded, ...newDownloaded}}));
            },
            updateDownloaded(modelKey, isDownloaded) {
                const selected = get().selected;
                const selectedModelKey = selected ? getModelKey(selected) : '';
                set((state) => ({...state, selected: (modelKey === selectedModelKey) && !isDownloaded ? null : selected,  downloaded: {...state.downloaded, [modelKey]: isDownloaded}}));
            },
            updateSettings(config) {
                const type = get().selected?.type;
                set(state => ({
                    settings: {
                        ...state.settings,
                        [type]: {
                            ...state.settings[type],
                            ...config
                        },
                    },
                }));
            },
		}),
		{
			name: 'models-storage',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
