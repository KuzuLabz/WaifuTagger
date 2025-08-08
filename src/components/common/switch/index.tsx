import { Switch as ExpoSwitch, SwitchSwitchVariantProps } from '@expo/ui/jetpack-compose';
import { List } from 'react-native-paper';
import { ListItemSwitchProps, SwitchProps } from './types';
import { useAppTheme } from '../../../theme';

export const Switch = (props: SwitchProps) => {
	const { colors } = useAppTheme();
	const switchColors: SwitchSwitchVariantProps['elementColors'] = {
		uncheckedTrackColor: colors.surfaceContainerHighest,
		uncheckedThumbColor: colors.outline,
		checkedTrackColor: colors.primary,
		checkedThumbColor: colors.onPrimary,
	};

	return <ExpoSwitch {...props} variant="switch" elementColors={switchColors} />;
};

export const ListItemSwitch = ({ value, onValueChange, ...itemProps }: ListItemSwitchProps) => {
	return (
		<List.Item
			{...itemProps}
			right={(props) => (
				<Switch style={[props.style]} value={value} onValueChange={onValueChange} />
			)}
		/>
	);
};
