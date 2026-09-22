import { ReactNode } from "react";
import { configureFonts, MD3Theme, PaperProvider, useTheme } from "react-native-paper";
import {
    ColorScheme,
    useMaterialColor,
} from "material-color-react-native"
import {
    PaperColorAdapter,
} from "material-color-react-native/react-native-paper"
import { StatusBar } from "expo-status-bar";
import { Toaster } from "burnt/web";
import { useThemeStore } from "../store/theme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const { darkMode, colorMode, color } = useThemeStore();
    const colorTheme = useMaterialColor(color, { isDark: darkMode, variant: colorMode, platform: 'phone', specVersion: '2025'});

    const themeColors = PaperColorAdapter.fromMaterialColor(colorTheme);

    return (
        <PaperProvider theme={{
            colors: {...colorTheme.colorScheme, ...themeColors},
            dark: darkMode,
            fonts: configureFonts({ config: { fontFamily: 'RobotoFlex_400Regular' } }),
            isV3: true
        }} >
            {children}
            <StatusBar style={darkMode ? 'light' : 'dark'} animated />
            <Toaster position="bottom-right" theme={darkMode ? 'dark' : 'light'} richColors />
        </PaperProvider>
    );
};

export const useAppTheme = useTheme<MD3Theme & { colors: ColorScheme }>;
