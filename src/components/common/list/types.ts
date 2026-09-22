import { ReactNode } from "react";
import { ViewStyle } from "react-native";

export type ListItemProps = {
    title?: string;
    description?: string | ReactNode;
    trailing?: ReactNode;
    leadingIcon?: {web: string; native: string;};
    onPress?: () => void;
    mode?: 'action' | 'item';
    isFirst?: boolean;
    isLast?: boolean;
};

export type ListProps = {children: ReactNode; style?: ViewStyle};