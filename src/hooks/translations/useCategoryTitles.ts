import { useLingui } from "@lingui/react/macro";
import { TagCategoryType } from "../../types";

export const useCategoryTitles = (): Record<TagCategoryType, string> => {
    const { t } = useLingui();

    return {
        artist: t`Artist`,
        character: t`Character`,
        copyright: t`Copyright`,
        general: t`General`,
        meta: t`Meta`,
        rating: t`Rating`,
        year: t`Year`,
    };
};