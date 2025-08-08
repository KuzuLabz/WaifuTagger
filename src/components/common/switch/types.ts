import { StyleProp, ViewStyle } from 'react-native';
import { ListItemProps } from 'react-native-paper';

export type SwitchProps = {
	value: boolean;
	onValueChange?: (value: boolean) => void;
	style?: StyleProp<ViewStyle>;
	disabled?: boolean;
};

export type ListItemSwitchProps = SwitchProps & ListItemProps;
