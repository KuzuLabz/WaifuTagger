import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AndroidImageColors, WebImageColors } from 'react-native-image-colors/build/types';
import { Appearance, Platform } from 'react-native';
import { TextFormat } from '../types';

export type ThresholdSettings = {
	general_threshold: number;
	char_threshold: number;
};

export type TextSettings = {
	includeCharacter: boolean;
	includeRating: boolean;
	textFormat: TextFormat;
};

export type SettingsState = ThresholdSettings &
	TextSettings & {
		colorMode: keyof AndroidImageColors | keyof WebImageColors;
		darkMode: boolean;
		autoInfer: boolean;
		lastOpenedDir: string; // Desktop
	};

type SettingsAction = {
	updateLastOpenedDir: (loc: string) => void;
	updateSettings: (config: Partial<SettingsState>) => void;
};

const initialState: SettingsState & ThresholdSettings = {
	textFormat: 'space',
	includeCharacter: true,
	includeRating: false,
	autoInfer: false,
	darkMode: Appearance.getColorScheme() === 'dark',
	lastOpenedDir: '',
	char_threshold: 0.8,
	general_threshold: 0.35,
	colorMode: Platform.select({
		android: 'average' as keyof AndroidImageColors,
		web: 'vibrant' as keyof WebImageColors,
	}),
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
		}),
		{
			name: 'settings-storage',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
