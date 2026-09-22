import { useWindowDimensions } from "react-native";

export enum WindowWidthClass {
    Compact = 'COMPACT',   // < 600dp (Phones, narrow split-screen)
    Medium = 'MEDIUM',     // 600dp - 839dp (Tablets in portrait, foldables)
    Expanded = 'EXPANDED', // >= 840dp (Tablets in landscape, desktop)
}

export const useWindowWidthClass = () => {
    const { width } = useWindowDimensions();

    if (width < 600) {
        return WindowWidthClass.Compact;
    }
    if (width < 840) {
        return WindowWidthClass.Medium;
    }
    return WindowWidthClass.Expanded;
};