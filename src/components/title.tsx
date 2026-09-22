import { Image } from 'expo-image';
import { View } from 'react-native';
import { Text, TextProps } from 'react-native-paper';
import Constants from 'expo-constants';

export const AppTitle = ({ iconSize, titleVariant }:{iconSize?: number, titleVariant?: TextProps<any>['variant']}) => {
    return(
        <View style={{alignItems: 'center'}}>
            <Image
                pointerEvents="none"
                source={require('../../assets/adaptive-icon.png')}
                style={{ height: iconSize ?? 38, aspectRatio: 1 }}
            />
            <Text variant={titleVariant ?? 'titleLarge'} style={{fontWeight: '900'}}>{Constants.expoConfig?.name}</Text>
        </View>
    );
};