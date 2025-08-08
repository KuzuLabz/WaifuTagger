import { ListSliderProps, SliderProps } from './types';
import { List } from 'react-native-paper';
import WebSlider from '@react-native-community/slider';
import { useAppTheme } from '../../../theme';

export const Slider = (props: SliderProps) => {
	const { colors } = useAppTheme();
	return (
		<WebSlider
			thumbTintColor={colors.primary}
			minimumTrackTintColor={colors.primaryContainer}
			step={props.steps}
			minimumValue={props.min}
			maximumValue={props.max}
			value={props.value}
			onValueChange={props.onValueChange}
		/>
	);
};

export const ListSlider = ({ ...props }: ListSliderProps) => {
	return (
		<>
			<List.Item {...props} />
			<Slider {...props.slider} style={[props.style, { marginHorizontal: 18 }]} />
		</>
	);
};
