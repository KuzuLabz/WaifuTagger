import { Linking, Platform } from "react-native";
import { startActivityAsync, ActivityAction } from 'expo-intent-launcher';
import { ListItem } from "./common/list";
import { useLingui } from "@lingui/react/macro";
import { DeviceInfoModule } from "react-native-nitro-device-info";
import { PaperIcon } from "./common/icon/paperIcon";
import { getLocales } from "expo-localization";
import { useSettingsStore } from "../store/settings";
import { LANGUAGES } from "../constants";
import { dynamicActivate } from "../locale";
import { useAppTheme } from "../providers/theme";

export const LanguageList = () => {
    const { t } = useLingui();
    const { colors } = useAppTheme();
    const lang = useSettingsStore(state => state.language);
    const updateSettings = useSettingsStore((state) => state.updateSettings);

    const onLaunch = async () => {
        try {
            if (Platform.OS === 'android') {
                await startActivityAsync(ActivityAction.APP_LOCALE_SETTINGS, {
                    data: `package:${DeviceInfoModule.bundleId}`
                });
            } else {
                await Linking.openSettings();
            }
            
            const newLang = getLocales()[0].languageCode;
            updateSettings({language: newLang});
            await dynamicActivate(newLang);
        } catch (e) {
            console.warn(e);
            Linking.openSettings();
        }
        
    };
    
    return(
        <ListItem 
            title={t`Language`} 
            description={LANGUAGES[lang]} 
            onPress={onLaunch} 
            trailing={<PaperIcon name="launch" size={24} color={colors.onSurface} />} 
            isFirst={false} isLast={true} 
        />
    );
};