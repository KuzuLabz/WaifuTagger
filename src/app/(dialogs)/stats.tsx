import { useLingui } from "@lingui/react/macro";
import { useStatsStore } from "../../store/stats";
import { Dialog } from "../../components/dialogs/dialog";
import { ScrollViewStyled } from "../../components/scrollview";
import { useAppTheme } from "../../providers/theme";
import { StatsContent } from "../../components/content/stats";

const StatsDialog = () => {
    const { colors } = useAppTheme();
    const isEnabled = useStatsStore(state => state.isEnabled);
    const resetStats = useStatsStore(state => state.resetStats);
    const resetLevels = useStatsStore(state =>  state.resetLevels);

    const { t } = useLingui();

    const onReset = () => {
        resetStats();
        resetLevels();
    };

    if (!isEnabled) {
        return null;
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