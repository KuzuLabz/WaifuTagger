import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import Constants from 'expo-constants';

const LoadingView = () => {
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size="large" />
			<Text>Booting up {Constants.expoConfig?.name}</Text>
		</View>
	);
};

export default LoadingView;
