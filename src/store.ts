import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AndroidImageColors } from 'react-native-image-colors/build/types';

export type ThresholdSettings = {
	general_threshold: number;
	char_threshold: number;
};

export type SettingsState = ThresholdSettings & {
	colorMode: keyof AndroidImageColors;
};

type SettingsAction = {
	updateColorMode: (mode: keyof AndroidImageColors) => void;
	updateThresholds: (config: { general_threshold: number; char_threshold: number }) => void;
};

export const useSettingsStore = create<SettingsState & SettingsAction>()(
	persist(
		(set, get) => ({
			general_threshold: 0.35,
			char_threshold: 0.8,
			colorMode: 'average',
			updateThresholds: (config) => set(config),
			updateColorMode: (mode) => set({ colorMode: mode }),
		}),
		{
			name: 'settings-storage',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
