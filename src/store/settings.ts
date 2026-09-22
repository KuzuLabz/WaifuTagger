import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TagCategoryType, TextFormat } from '../types';
import { ModelSettings } from './models';
import { getLocales } from 'expo-localization';

export type TextSettings = {
    included: Record<TagCategoryType, boolean>;
	textFormat: TextFormat;
};

export type SettingsState = TextSettings & {
    isNewUser: boolean;
    autoInfer: boolean;
    autoUpdate: boolean;
    preferGpu: boolean;
    executionProvider: string;
    lastOpenedDir: string; // Desktop
    hideEmptyCategory: boolean;
    extBrowser: boolean;
    tagPlainText: boolean;
    language: string;
    categoryOrder: { category: keyof ModelSettings['thresholds']; enabled: boolean }[];
};

type SettingsAction = {
	updateLastOpenedDir: (loc: string) => void;
	updateSettings: (config: Partial<SettingsState>) => void;
    toggleIncluded: (category: TagCategoryType) => void;
    toggleCategory: (category: keyof ModelSettings['thresholds']) => void;
};

const initialState: SettingsState = {
    isNewUser: true,
	textFormat: 'space',
    tagPlainText: false,
    language: getLocales()[0].languageCode,
    included: {
        artist: true,
        character: true,
        rating: false,
        copyright: true,
        general: true,
        meta: false,
        year: false,
    },
	autoInfer: false,
	lastOpenedDir: '',
    autoUpdate: true,
    extBrowser: true,
    preferGpu: false,
    executionProvider: 'CPU',
    hideEmptyCategory: false,
    categoryOrder: [
        {category: 'artist', enabled: true}, 
        {category: 'character', enabled: true}, 
        {category: 'copyright', enabled: true}, 
        {category: 'general', enabled: true}, 
        {category: 'meta', enabled: true}, 
        {category: 'rating', enabled: true}, 
        {category: 'year', enabled: true}
    ]
};

export const useSettingsStore = create<SettingsState & SettingsAction>()(
	persist(
		(set, get) => ({
			...initialState,
			updateLastOpenedDir: (loc) => {
				const lastSlashIndex =
					loc.lastIndexOf('/') > -1 ? loc.lastIndexOf('/') : loc.lastIndexOf('\\');
				set({ lastOpenedDir: lastSlashIndex === -1 ? loc : loc.slice(0, lastSlashIndex) });
			},
			updateSettings: (config) => set((state) => ({ ...state, ...config })),
            toggleIncluded(category) {
                set((state) => ({...state, included: {...state.included, [category]: !state.included[category]}}));
            },
            toggleCategory: (category) => {
                set((state) => ({
                    categoryOrder: state.categoryOrder.map((item) =>
                        item.category === category
                            ? { ...item, enabled: !item.enabled }
                            : item
                    ),
                }));
            },
		}),
		{
			name: 'settings-storage',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
