import { Dialog } from "../../components/dialogs/dialog";
import { SettingsContent } from "../../components/content/settings";
import { ScrollViewStyled } from "../../components/scrollview";
import { useLingui } from "@lingui/react/macro";
import { useWindowWidthClass, WindowWidthClass } from "../../hooks/useWindowWidthClass";
import { SideSheet } from "../../components/dialogs/sidesheet";
import { router } from "expo-router";
import { useState } from "react";
import { WebThemeProvider } from "../../providers/webTheme";

const SettingsDialog = () => {
    const { t } = useLingui();
    const sizeClass = useWindowWidthClass();
    const [isPresent, setIsPresent] = useState(true);

    const onDismiss = () => {
        setIsPresent(false);
        (new Promise(resolve => setTimeout(resolve, 200))).then(() => {
            router.back();
        });
    };

    if (sizeClass !== WindowWidthClass.Compact) {
        return(
            <WebThemeProvider>
                <SideSheet title={t`Settings`} onDismiss={onDismiss} isPresented={isPresent} scrollable>
                    <SettingsContent />
                </SideSheet>
            </WebThemeProvider>
        );
    }

    return (
        <Dialog 
            visible={true} 
            title={t`Settings`}
            actions={[{title: t`Close`}]}
        >
            <ScrollViewStyled contentContainerStyle={{paddingHorizontal: 12}}>
                <SettingsContent />
            </ScrollViewStyled>
        </Dialog>
    );
};

export default SettingsDialog;