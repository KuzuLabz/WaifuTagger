import { Platform, View } from "react-native";
import { Appbar, AppbarHeaderProps, Text, Tooltip } from "react-native-paper";
import Constants from 'expo-constants';
import { Image } from "expo-image";
import { useStatsStore } from "../store/stats";
import { router } from "expo-router";
import { useAppTheme } from "../providers/theme";
import { ReactNode } from "react";
import { useModelsStore } from "../store/models";
import { useLingui } from "@lingui/react/macro";
import { MODEL_CATALOG } from "../constants";

const openStats = () => router.navigate('/(dialogs)/stats');
const openSettings = () => router.navigate('/(dialogs)/settings');

export const RootHeader = () => {
    const { colors, dark } = useAppTheme();
    const selected = useModelsStore(state => state.selected);
    const { isEnabled: isRankEnabled } = useStatsStore();
    return (
        <View style={{width: '100%', overflow: 'hidden'}}>
            <Appbar.Header
                mode="small"
                style={[
                    Platform.select<AppbarHeaderProps['style']>({
                        web: {
                            width: '100%',
                            backgroundColor: dark ? 'rgba(11, 11, 11, 0.6)' : 'rgba(255,255,255, 1)',
                            paddingRight: 12
                        },
                        native: undefined,
                    }),
                ]}
            >
                <Appbar.Content
                    title={
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image
                                    pointerEvents="none"
                                    source={require('../../assets/adaptive-icon.png')}
                                    style={{ height: 38, aspectRatio: 1 }}
                                />
                                <Text variant="titleLarge" selectable={false}>
                                    {Constants.expoConfig?.name}
                                </Text>
                            </View>
                            {MODEL_CATALOG[selected?.type] && 
                                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                                    <Text variant="labelMedium" style={{ paddingLeft: 12, color: colors.onSurfaceVariant}}>{MODEL_CATALOG[selected?.type].name}</Text>
                                    <Text variant="labelSmall" style={{paddingHorizontal: 6, borderRadius: 6, backgroundColor: colors.surfaceContainer}}>{selected.variant}</Text>
                                </View>
                            }
                        </View>
                    }
                />
                {isRankEnabled && (
                    <Appbar.Action
                        icon={'trophy-variant-outline'}
                        onPress={openStats}
                    />
                )}
                <Appbar.Action
                    icon={'cog-outline'}
                    onPress={openSettings}
                />
            </Appbar.Header>
        </View>
    );
};

export const PaperHeader = ({title, elevated, back, children}: {title: string; elevated?: boolean; back?: boolean; children?: ReactNode}) => {
    return(
        <Appbar.Header elevated={elevated}>
            {back && <Appbar.BackAction onPress={() => router.back()} />}
            <Appbar.Content
                title={title}
            />
            {children}
        </Appbar.Header>
    );
};

export const StatsHeader = ({ title, onResetVis }: { title: string; onResetVis: () => void }) => {    
    const { t } = useLingui();
    
    return(
        <PaperHeader title={title} back>
            <Tooltip title={t`Reset`}>
                <Appbar.Action icon={'eraser'} onPress={onResetVis} />
            </Tooltip>
        </PaperHeader>
    );
};