import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

const LoadingView = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text>Loading Model</Text>
        </View>
    );
};

export default LoadingView;
