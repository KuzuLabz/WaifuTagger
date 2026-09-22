import { StyleSheet, View } from 'react-native';
import { useStatsStore } from '../store/stats';
import { Text, ProgressBar } from 'react-native-paper';
import { useLingui } from '@lingui/react/macro';
import Color from 'color';
import { useAppTheme } from '../providers/theme';

export const LevelView = ({ isLoading }: { isLoading: boolean }) => {
    const isEnabled = useStatsStore(state => state.isEnabled);
    const levelInfo = useStatsStore(state => state.levelInfo);
    const { t } = useLingui();
    const { colors } = useAppTheme();

    const style = StyleSheet.create({
        text: {
            color: colors.onSecondaryContainer,
            fontWeight: '900',
            fontSize: 12
        },
    });

    if (!isEnabled) {
        return null;
    }

    return (

        <View style={{ overflow: 'hidden', justifyContent: 'center', height: 20 }}>
            <ProgressBar
                progress={levelInfo.xp / levelInfo.levelXpCap}
                indeterminate={isLoading}
                style={{ width: '100%', borderRadius: 0, height: '100%' }}
            />
            <View
                style={{
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'visible',
                }}
            >
                <View
                    style={{
                        position: 'absolute',
                        left: 0,
                        height: '100%',
                        justifyContent: 'center',
                        paddingHorizontal: 6,
                    }}
                >
                    <View style={{backgroundColor: Color(colors.secondaryContainer).fade(.2).rgb().toString(), borderRadius: 12, paddingHorizontal: 8}}>
                        <Text selectable={false} style={[style.text]}>
                            {t`Lvl.`} {levelInfo.level}
                        </Text>
                    </View>
                </View>
                <View style={{backgroundColor: Color(colors.secondaryContainer).fade(.2).rgb().toString(), borderRadius: 12, paddingHorizontal: 8}}>
                    <Text selectable={false} style={[style.text]}>
                        {levelInfo.xp} / {levelInfo.levelXpCap}
                    </Text>
                </View>
            </View>
        </View>
    );
};
