import { Button, ButtonProps, ProgressView } from "@expo/ui/swift-ui";
import { IconButtonProps } from "./types";
import { labelStyle } from "@expo/ui/swift-ui/modifiers";
import { getIcon } from "../icon/icons";

export const IconButton = ({name, isLoading, onPress}: IconButtonProps) => {
    const icon = getIcon(name);

    if (!icon) {
        return null;
    }

    return(
        isLoading 
        ?
            <ProgressView />
        :
            <Button
                label={name}
                systemImage={icon as ButtonProps['systemImage']}
                modifiers={[labelStyle('iconOnly')]}
                onPress={onPress}
            />
    );
};