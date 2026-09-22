import { IconButton as IconButtonNative } from "@expo/ui/jetpack-compose";
import { IconButtonProps } from "./types";
import { CircularProgress } from "../progressBar";
import { Icon } from "../icon";

export const IconButton = ({name, size, isLoading, onPress}: IconButtonProps) => {
    if (!name) {
        return;
    }

    return(
        <IconButtonNative onClick={onPress}>
            {isLoading ? <CircularProgress value={0} indeterminate /> : <Icon name={name} size={size} />}
        </IconButtonNative>
    );
};