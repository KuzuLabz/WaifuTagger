import {
	ButtonVariant,
	Button as ExpoButton,
	ButtonProps as NativeButtonProps,
} from '@expo/ui/jetpack-compose';
import { ButtonProps } from './types';
import { useAppTheme } from '../../../theme';
import { Material3Theme } from '@pchmn/expo-material3-theme';

const getElementColors = (
	variant: ButtonVariant | undefined,
	colors: Material3Theme['dark'],
	disabled?: boolean,
): Partial<ButtonVariantProps> | undefined => {
	switch (variant) {
		case 'elevated':
			return {
				elementColors: {
					containerColor: colors.surfaceContainerLow,
					contentColor: colors.primary,
					disabledContainerColor: colors.onSurfaceDisabled,
					disabledContentColor: colors.onSurfaceDisabled,
				},
			};
		case 'outlined':
			return {
				elementColors: {
					containerColor: 'transparent',
					contentColor: colors.primary,
					disabledContainerColor: 'transparent',
					// disabledContentColor: colors.onSurfaceDisabled,
				},
				style: {
					outlineColor: disabled ? colors.onSurface : colors.outline,
				},
			};
		case 'borderless':
			return {
				elementColors: {
					containerColor: 'transparent',
					contentColor: colors.primary,
					disabledContainerColor: 'transparent',
					// disabledContentColor: colors.onSurfaceDisabled,
				},
			};
		case 'bordered':
			return {
				elementColors: {
					containerColor: colors.secondaryContainer,
					contentColor: colors.onSecondaryContainer,
					disabledContainerColor: colors.surfaceDisabled,
					// disabledContentColor: colors.onSurfaceDisabled,
				},
			};
		default:
			return {
				elementColors: {
					containerColor: colors.primary,
					contentColor: colors.onPrimary,
					// disabledContainerColor: colors.surfaceDisabled,
					// disabledContentColor: colors.onSurfaceDisabled,
				},
			};
	}
};

type ButtonVariantProps =
	| {
			style?: NativeButtonProps['style'];
			elementColors: NativeButtonProps['elementColors'];
	  }
	| undefined;
export const Button = (props: ButtonProps) => {
	const { colors } = useAppTheme();

	const themedProps = getElementColors(props.androidVariant, colors, props.disabled);

	return (
		<ExpoButton
			{...props}
			variant={props.androidVariant}
			onPress={props.onPress}
			// @ts-expect-error
			systemImage={props.androidIcon ?? props.icon}
			elementColors={themedProps?.elementColors}
			style={[themedProps?.style, props.style]}
		/>
	);
};
