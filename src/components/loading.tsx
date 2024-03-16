import { View } from 'react-native';
import { ActivityIndicator, Surface, Text } from 'react-native-paper';
import Constants from 'expo-constants';
import { useAppTheme } from '../theme';

const LoadingView = () => {
	const theme = useAppTheme();
	return (
		<Surface
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				// backgroundColor: theme.colors.background,
			}}
		>
			<ActivityIndicator size="large" />
			<Text theme={theme}>Booting up {Constants.expoConfig?.name}</Text>
		</Surface>
	);
};

export default LoadingView;
