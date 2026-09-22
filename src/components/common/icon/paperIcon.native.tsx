import { Icon } from "react-native-paper";
import { IconProps } from "./types";
import { getPaperIcon } from "./getPaperIcon";

export const PaperIcon = ({ name, size = 24, color }: IconProps) => {
    const icon = getPaperIcon(name);
    return(
        <Icon source={icon} size={size} color={color} />
    );
};