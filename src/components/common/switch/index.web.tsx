import { List, Switch as PaperSwitch } from 'react-native-paper';
import { ListItemSwitchProps, SwitchProps } from './types';

export const Switch = (props: SwitchProps) => {
	return <PaperSwitch {...props} />;
};

export const ListItemSwitch = ({ value, onValueChange, ...itemProps }: ListItemSwitchProps) => {
	return (
		<List.Item
			{...itemProps}
			right={(props) => (
				<Switch
					style={[props.style]}
					value={value}
					onValueChange={onValueChange}
					disabled={itemProps.disabled}
				/>
			)}
		/>
	);
};
