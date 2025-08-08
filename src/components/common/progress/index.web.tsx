import { ProgressBar as PaperBar } from 'react-native-paper';
import { ProgressBarProps } from './types';
import { View } from 'react-native';

export const ProgressBar = (props: ProgressBarProps) => {
	return (
		<View style={{ height: props.height }}>
			<PaperBar {...props} style={[props.style, { height: props.height }]} />
		</View>
	);
};
