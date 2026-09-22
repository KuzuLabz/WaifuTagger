import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { Variant } from '@material/material-color-utilities';

export type ThemeState = {
    colorMode: Variant;
    darkMode: boolean;
    color: string;
};

type ThemeAction = {
	updateTheme: (config: Partial<ThemeState>) => void;
    // debug
    reset: () => void;
};

const initialState: ThemeState = {
	darkMode: Appearance.getColorScheme() === 'dark',
	colorMode: Variant.FIDELITY,
    color: '#3E8260'
};

export const useThemeStore = create<ThemeState & ThemeAction>()(
	persist(
		(set, get) => ({
			...initialState,
			updateTheme: (config) => set((state) => ({ ...state, ...config })),
            reset() {
                set(initialState);
            },
		}),
		{
			name: 'theme-storage',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
