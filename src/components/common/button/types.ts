import { StyleProp, ViewStyle } from 'react-native';
import { ButtonProps as ButtonPaperProps } from 'react-native-paper';
import { ButtonProps as AndroidButtonProps } from '@expo/ui/jetpack-compose';
import { ButtonProps as IOSButtonProps } from '@expo/ui/swift-ui';

export type ButtonProps = {
	onPress: () => void;
	children: string;
	webVariant?: ButtonPaperProps['mode'];
	androidVariant?: AndroidButtonProps['variant'];
	iosVariant?: IOSButtonProps['variant'];
	style?: StyleProp<ViewStyle>;
	icon?: string;
	androidIcon?: AndroidButtonProps['systemImage'];
	disabled?: boolean;
};
