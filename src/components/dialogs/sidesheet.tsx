import { Pressable, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SideSheetProps } from "./types";
import { Button, Divider, IconButton, Text } from "react-native-paper";
import { ScrollViewStyled } from "../scrollview";
import { useAppTheme } from "../../providers/theme";

export const SideSheet = ({ title, children, isPresented, scrollable, actions, actionHeader, onDismiss }: SideSheetProps) => {
    const { height } = useWindowDimensions();
    const { top, bottom } = useSafeAreaInsets();
    const { colors } = useAppTheme();

    const Scrollable = scrollable ? ScrollViewStyled : View;

    if (!isPresented) {
        return null;
    }
    
    return(
        <View style={{width: '100%', height: '100%', alignItems: 'flex-end'}}>
            <Pressable style={{ position: 'absolute', width: '100%', height}} onPress={onDismiss}>
                <Animated.View entering={FadeIn} exiting={FadeOut} style={{ height: '100%', width: '100%', backgroundColor: 'rgba(0,0,0,0.4)' }} />
            </Pressable>
            {isPresented && <Animated.View entering={SlideInRight} exiting={SlideOutRight} style={{ height: height - bottom - 24, width: '45%', backgroundColor: colors.surfaceContainerLow, borderRadius: 24, marginVertical: 16, marginTop: top + 16, marginRight: 16}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 24 }}>
                    <Text variant="titleLarge">{title}</Text>
                    <IconButton icon="close" onPress={onDismiss} />
                </View>
                <Scrollable contentContainerStyle={{paddingHorizontal: 16}}>
                    {children}
                </Scrollable>
                {actions && <View style={{gap: 12}}>
                    <Divider />
                    {actionHeader}
                    <View style={{flexDirection: 'row', gap: 16, paddingHorizontal: 16, paddingVertical: 16}}>
                        {actions.map((action, idx) => (
                            <Button key={idx} mode={action.mode} onPress={action.onPress} disabled={action.disabled}>{action.title}</Button>
                        ))}
                    </View>
                </View>}
            </Animated.View>}
        </View>
    );
};