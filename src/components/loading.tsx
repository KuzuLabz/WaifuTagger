import { ActivityIndicator, Surface, Text } from 'react-native-paper';
import { useAppTheme } from '../theme';

const LoadingView = () => {
	const theme = useAppTheme();
	return (
		<Surface
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				gap: 12,
			}}
		>
			<ActivityIndicator size="large" />
			<Text theme={theme} selectable={false}>
				Loading model...
			</Text>
		</Surface>
	);
};

export default LoadingView;
