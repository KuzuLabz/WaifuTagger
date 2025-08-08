import { Slider as ExpoSlider, SliderProps } from '@expo/ui/jetpack-compose';
import { ListSliderProps } from './types';
import { List } from 'react-native-paper';
import { useAppTheme } from '../../../theme';

export const Slider = (props: SliderProps) => {
	const { colors } = useAppTheme();
	return (
		<ExpoSlider
			{...props}
			elementColors={{
				activeTickColor: colors.primary,
				activeTrackColor: colors.primary,
				inactiveTrackColor: colors.secondaryContainer,
				inactiveTickColor: colors.onSecondaryContainer,
				thumbColor: colors.primary,
			}}
		/>
	);
};
export const ListSlider = ({ ...props }: ListSliderProps) => {
	return (
		<>
			<List.Item {...props} />
			<Slider {...props.slider} style={{ minHeight: 46 }} />
		</>
	);
};
