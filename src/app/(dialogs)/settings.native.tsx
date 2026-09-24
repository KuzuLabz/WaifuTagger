import { useAppTheme } from "../../providers/theme";
import { Stack } from "expo-router";
import { View } from "react-native";
import { PaperHeader } from "../../components/header";
import { SettingsContent } from "../../components/content/settings";
import { useLingui } from "@lingui/react/macro";
import { ScrollViewStyled } from "../../components/scrollview";

const SettingsScreen = () => {
    const { colors } = useAppTheme();
    const { t } = useLingui();
    
    return(
        <ScrollViewStyled style={{flex: 1, backgroundColor: colors.background}} contentContainerStyle={{paddingBottom: 12}}>
            <Stack.Screen options={{ header: () => <PaperHeader title={t`Settings`} back />}} />
            <View style={{padding: 12}}>
                <SettingsContent />
            </View>
        </ScrollViewStyled>
    );
};

export default SettingsScreen;