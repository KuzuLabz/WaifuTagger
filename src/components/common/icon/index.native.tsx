import { Icon as ExpoIcon } from '@expo/ui';
import { IconProps } from "./types";
import { getIcon } from './icons';

export const Icon = ({name, color, modifiers, size}: IconProps) => {
    const icon = getIcon(name);
    return(
        // @ts-expect-error
        <ExpoIcon name={icon} size={size} color={color} modifiers={modifiers} />
    );
};