import { StyleProp, ViewStyle } from 'react-native';
import { ListItemProps } from 'react-native-paper';

export type SliderProps = {
	style?: StyleProp<ViewStyle>;
	value?: number;
	steps?: number;
	min?: number;
	max?: number;
	onValueChange: (value: number) => void;
};

export type ListSliderProps = ListItemProps & {
	slider: SliderProps;
};
