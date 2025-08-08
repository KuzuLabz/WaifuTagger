import { LinearProgress } from '@expo/ui/jetpack-compose';
import { useAppTheme } from '../../../theme';
import { ProgressBarProps } from './types';

export const ProgressBar = (props: ProgressBarProps) => {
	const { colors } = useAppTheme();
	return (
		<LinearProgress
			{...props}
			style={[props.style, { height: props.height }]}
			color={colors.primary}
			elementColors={{ trackColor: colors.secondaryContainer }}
		/>
	);
};
