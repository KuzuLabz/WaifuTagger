import { M3eIcon } from "@m3e/react/icon";
import { IconProps } from "./types";
import { getIcon } from "./icons";

export const Icon = ({ name, slot, color, size }: IconProps) => {
    const icon = getIcon(name);

    const sizeStyle = size ? { ['--m3e-icon-size']: size } : {};

    return(
        <M3eIcon name={icon} slot={slot} style={{ ...sizeStyle, color: color, }}  />
    );
};