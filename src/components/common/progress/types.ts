import { ViewStyle } from 'react-native';

export type ProgressBarProps = {
	progress: number;
	indeterminate?: boolean;
	height?: number;
	style: ViewStyle;
};
