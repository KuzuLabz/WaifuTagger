import Color from "color";
import { Platform, View } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { useAppTheme } from "../theme";
import Constants from 'expo-constants';
import { Image } from "expo-image";
import { useStatsStore } from "../store/stats";

type RootHeaderProps = {
    onAppInfoPress: () => void;
    onStatsPress: () => void;
    onSettingsPress: () => void;
};
export const RootHeader = ({ onAppInfoPress, onStatsPress, onSettingsPress }: RootHeaderProps) => {
    const { colors } = useAppTheme();
    const { isEnabled: isRankEnabled } = useStatsStore();
    return (
        <Appbar.Header
            mode="center-aligned"
            style={[
                Platform.select({
                    web: {
                        width: '100%',
                        backgroundColor: Color(colors.surface).alpha(0.4).rgb().string(),
                        backdropFilter: 'blur(10px)',
                    },
                    native: undefined,
                }),
            ]}
        >
            <Appbar.Action
                icon={'information-outline'}
                onPress={onAppInfoPress}
            />
            <Appbar.Content
                title={
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            pointerEvents="none"
                            source={require('../assets/adaptive-icon.png')}
                            style={{ height: 32, aspectRatio: 1 }}
                        />
                        <Text variant="titleLarge" selectable={false}>
                            {Constants.expoConfig?.name}
                        </Text>
                    </View>
                }
            />
            {isRankEnabled && (
                <Appbar.Action
                    icon={'trophy-variant-outline'}
                    onPress={onStatsPress}
                />
            )}
            <Appbar.Action
                icon={'cog-outline'}
                onPress={onSettingsPress}
            />
        </Appbar.Header>
    );
};