import { IconProps } from "../icon/types";

export type IconButtonProps = {
    name: IconProps['name'];
    onPress: () => void;
    size?: number;
    isLoading?: boolean;
    /** Web only */
    slot?: 'leading' | 'trailing';
    variant?: 'linear' | 'wavy';
};