import { Icon } from ".";
import { IconProps } from "./types";

export const PaperIcon = ({ name, size, color, slot }: IconProps) => {
    return(
        <Icon name={name} size={size} color={color} slot={slot} />
    );
};