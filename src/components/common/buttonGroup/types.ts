import { ViewStyle } from "react-native";
import { IconProps } from "../icon/types";

export type ButtonGroupProps = {
    selectedIndex: number;
    actions: {label: string; icon?: IconProps['name']}[];
    onValueChange: (index: number) => void;
    style?: ViewStyle;
};