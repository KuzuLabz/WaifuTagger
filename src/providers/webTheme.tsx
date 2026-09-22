import { ReactNode } from "react";
import { M3eTheme, ThemeVariant } from "@m3e/react/theme";
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

export const WebThemeProvider = ({children}: {children: ReactNode;}) => {
    const { color, darkMode, colorMode } = useThemeStore();
    
    return(
        <M3eTheme color={color} variant={getWebVariant(colorMode)} scheme={darkMode ? 'dark' : 'light'} motion="expressive">
            {children}
        </M3eTheme>
    );
};