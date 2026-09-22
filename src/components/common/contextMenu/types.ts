import { ReactElement } from "react";
import { IconSelectSpec } from '@expo/ui';
import { MenuAction } from "@expo/ui/community/menu";
import { Platform } from "react-native";

export type ContextMenuAction = {
    title: string;
    id: string;
    titleColor?: string;
    image?: MenuAction['image'] | string;
};

export type ContextMenuTriggerProps<T extends readonly ContextMenuAction[]> = {
    actions: T;
    onItemPress: (id: T[number]['id']) => void;
    platforms?: typeof Platform.OS[];
    children: ReactElement;
};