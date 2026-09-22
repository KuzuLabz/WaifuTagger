import { ButtonProps, ButtonVariant } from "@expo/ui";
import { Button, ButtonColors, OutlinedButton, Text, TextButton } from '@expo/ui/jetpack-compose';
import { useAppTheme } from "../../providers/theme";

export const NativeButton = ({ variant = 'filled', disabled, modifiers, onPress, ...props }: ButtonProps) => {
    const { colors } = useAppTheme();

    const buttonColors: Record<typeof variant, ButtonColors> = {
        filled: {
            containerColor: colors.primary,
            contentColor: colors.onPrimary,
            disabledContainerColor: colors.onSurface,
            disabledContentColor: colors.onSurface
        },
        outlined: {
            contentColor: colors.primary,
            disabledContentColor: colors.onSurface
        },
        text: {
            contentColor: colors.primary
        }
    };

    const ButtonComponent = variantComponentMap[variant];
    const content = props.children ?? <Text>{props.label ?? ''}</Text>;
    const commonProps = {
        onClick: disabled ? undefined : onPress,
        enabled: !disabled,
        modifiers,
    };

    return (
        <ButtonComponent {...commonProps} colors={buttonColors[variant]}>{content}</ButtonComponent>
    );
};

const variantComponentMap: Record<
    ButtonVariant,
    typeof Button | typeof OutlinedButton | typeof TextButton
> = {
    filled: Button,
    outlined: OutlinedButton,
    text: TextButton,
};