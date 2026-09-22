import { HorizontalDivider } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";

export const Divider = () => {
    return(
        <HorizontalDivider modifiers={[fillMaxWidth()]} />
    );
};