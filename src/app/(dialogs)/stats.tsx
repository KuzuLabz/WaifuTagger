import { useLingui } from "@lingui/react/macro";
import { useStatsStore } from "../../store/stats";
import { Dialog } from "../../components/dialogs/dialog";
import { ScrollViewStyled } from "../../components/scrollview";
import { useAppTheme } from "../../providers/theme";
import { StatsContent } from "../../components/content/stats";
import { useWindowWidthClass, WindowWidthClass } from "../../hooks/useWindowWidthClass";
import { useState } from "react";
import { router } from "expo-router";
import { WebThemeProvider } from "../../providers/webTheme";
import { SideSheet } from "../../components/dialogs/sidesheet";

const StatsDialog = () => {
    const { colors } = useAppTheme();
    const isEnabled = useStatsStore(state => state.isEnabled);
    const resetStats = useStatsStore(state => state.resetStats);
    const resetLevels = useStatsStore(state =>  state.resetLevels);

    const sizeClass = useWindowWidthClass();
    const [isPresent, setIsPresent] = useState(true);
    
    const onDismiss = () => {
        setIsPresent(false);
        (new Promise(resolve => setTimeout(resolve, 200))).then(() => {
            router.back();
        });
    };

    const { t } = useLingui();

    const onReset = () => {
        resetStats();
        resetLevels();
    };

    if (!isEnabled) {
        return null;
    }

    if (sizeClass !== WindowWidthClass.Compact) {
            return(
                <WebThemeProvider>
                    <SideSheet 
                        title={t`Statistics`} 
                        onDismiss={onDismiss} 
                        isPresented={isPresent}
                        actions={[{title: t`Done`, onPress: onDismiss, mode: 'contained'}, {title: t`Reset`, onPress: onReset}]}
                        scrollable
                    >
                        <StatsContent />
                    </SideSheet>
                </WebThemeProvider>
            );
        }

    return (
        <Dialog 
            visible={true} 
            title={t`Statistics`} 
            scrollable 
            actions={[{title: t`Reset`, onPress: onReset, autoDismiss: false}, {title: t`Done`}]}
        >
            <ScrollViewStyled scrollbarStyle={{ railColor: colors.elevation.level3 }}>
                <StatsContent />
            </ScrollViewStyled>
        </Dialog>
    );
};

export default StatsDialog;