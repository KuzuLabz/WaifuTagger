import { View } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { useAppTheme } from "../../providers/theme";
import { useStatsStore } from "../../store/stats";
import { useLingui } from "@lingui/react/macro";

const StatListItem = ({
    title,
    description,
    stat,
}: {
    title: string;
    description?: string;
    stat?: string | number;
}) => {
    return (
        <List.Item
            title={title}
            description={description}
            right={(props) => (stat !== null ? <Text {...props}>{stat}</Text> : null)}
        />
    );
};

export const StatsContent = () => {
    const { colors } = useAppTheme();
    const levelInfo = useStatsStore(state => state.levelInfo);
    const totalInfers = useStatsStore(state => state.totalInfers);
    const ranksInferred = useStatsStore(state => state.ranksInferred);
    const { t } = useLingui();

    return(
        <>
            <List.Section title={t`Level Info`} titleStyle={{color: colors.primary}}>
                <StatListItem title={t`Level`} stat={levelInfo.level} />
                <StatListItem
                    title={t`XP`}
                    stat={`${levelInfo.xp} -> ${levelInfo.levelXpCap}`}
                />
            </List.Section>
            <List.Section title={t`Trackers`} titleStyle={{color: colors.primary}}>
                <StatListItem title={t`Total Inferences`} stat={totalInfers} />
                <StatListItem title={t`Image Ranks`} />
                <View style={{ paddingHorizontal: 24, gap: 6 }}>
                    {Object.keys(ranksInferred).map((rank, idx) => (
                        <View
                            key={idx}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '100%',
                                alignItems: 'center',
                            }}
                        >
                            <Text>{rank}</Text>
                            <Divider style={{ flexGrow: 1, marginHorizontal: 12 }} />
                            <Text>{ranksInferred[rank]}</Text>
                        </View>
                    ))}
                </View>
            </List.Section>
        </>
    );
};