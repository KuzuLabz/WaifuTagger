import { useLingui } from "@lingui/react/macro";
import { Variant } from "@material/material-color-utilities";

export const useThemeVariantNames = () => {
    const { t } = useLingui();
    
    return {
        [Variant.CONTENT]: t`Content`,
        [Variant.EXPRESSIVE]: t`Expressive`,
        [Variant.FIDELITY]: t`Fidelity`,
        [Variant.FRUIT_SALAD]: t`Fruit Salad`,
        [Variant.MONOCHROME]: t`Monochrome`,
        [Variant.NEUTRAL]: t`Neutral`,
        [Variant.RAINBOW]: t`Rainbow`,
        [Variant.TONAL_SPOT]: t`Tonal Spot`,
        [Variant.VIBRANT]: t`Vibrant`,
    };
};