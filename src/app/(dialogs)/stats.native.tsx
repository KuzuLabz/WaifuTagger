import { useLingui } from "@lingui/react/macro";
import { useAppTheme } from "../../providers/theme";
import { useStatsStore } from "../../store/stats";
import { ScrollView } from "react-native";
import { Stack } from "expo-router";
import { StatsHeader } from "../../components/header";
import { StatsContent } from "../../components/content/stats";
import { useState } from "react";
import { NativeAlertDialog } from "../../components/common/alert";

export const StatsPage = () => {
    const { t } = useLingui();
    const { colors } = useAppTheme();
    const reset = useStatsStore(state => state.reset);
    const [resetVis, setResetVis] = useState(false);

    return(
        <ScrollView style={{backgroundColor: colors.surface }}>
            <Stack.Screen options={{header: () => <StatsHeader title={t`Statistics`} onResetVis={() => setResetVis(true)} />}} />
            <StatsContent />
            <NativeAlertDialog 
                visible={resetVis} 
                title={t`Reset progress?`}
                message={t`This will wipe all progress.`}
                confirmLabel={t`Reset`}
                onConfirm={reset}
                onDismiss={() => setResetVis(false)}
            />
        </ScrollView>
    );
};

export default StatsPage;