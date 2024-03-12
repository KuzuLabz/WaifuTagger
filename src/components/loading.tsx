import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import Constants from 'expo-constants';
import { useAppTheme } from '../theme';

const LoadingView = () => {
	const theme = useAppTheme();
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size="large" />
			<Text theme={theme}>Booting up {Constants.expoConfig?.name}</Text>
		</View>
	);
};

export default LoadingView;
