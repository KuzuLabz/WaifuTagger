import { useLingui } from "@lingui/react/macro";
import { TagCategoryType } from "../../types";
import { MaterialColor } from "material-color-react-native";

export const useContrastNames = (): Record<keyof typeof MaterialColor['ContrastLevelPresets'], string> => {
    const { t } = useLingui();

    return {
        DEFAULT: t`Default`,
        REDUCED: t`Reduced`,
        MEDIUM: t`Medium`,
        HIGH: t`High`,
    };
};