import { ReactNode } from "react";
import { ContrastLevel, M3eTheme, ThemeVariant } from "@m3e/react/theme";
import { Variant } from "@material/material-color-utilities";
import { useThemeStore } from "../store/theme";

const getWebVariant = (variant: Variant): ThemeVariant => {
    switch(variant) {
        case Variant.CONTENT:
            return 'content';
        case Variant.EXPRESSIVE:
            return 'expressive';
        case Variant.FIDELITY:
            return 'fidelity';
        case Variant.FRUIT_SALAD:
            return 'fruit-salad';
        case Variant.MONOCHROME:
            return 'monochrome';
        case Variant.NEUTRAL:
            return 'neutral';
        case Variant.RAINBOW:
            return 'rainbow';
        case Variant.TONAL_SPOT:
            return 'tonal-spot';
        case Variant.VIBRANT:
            return 'vibrant';
    }
};

const getContrast = (contrast: number): ContrastLevel => {
    switch(contrast) {
        case 0.5:
            return 'medium';
        case 1:
            return 'high';
        default:
            return 'standard';
    }
};

export const WebThemeProvider = ({children}: {children: ReactNode;}) => {
    const darkMode = useThemeStore((state) => state.darkMode);
    const colorMode = useThemeStore((state) => state.colorMode);
    const color = useThemeStore((state) => state.color);
    const contrast = useThemeStore((state) => state.contrast);
    
    return(
        <M3eTheme color={color} variant={getWebVariant(colorMode)} scheme={darkMode ? 'dark' : 'light'} contrast={getContrast(contrast)} motion="expressive">
            {children}
        </M3eTheme>
    );
};