import { Chip, List as PaperList, Text } from "react-native-paper";
import { ListSwitch } from "../common/switch";
import { Platform, View } from "react-native";
import { useLingui } from "@lingui/react/macro";
import { useSettingsStore } from "../../store/settings";
import { useThemeStore } from "../../store/theme";
import { useStatsStore } from "../../store/stats";
import { useAppTheme } from "../../providers/theme";
import { router, useFocusEffect } from "expo-router";
import { List, ListItem } from "../common/list";
import { LanguageList } from "../language";
import { setTheme } from '@tauri-apps/api/app';
import Constants from 'expo-constants';
import { useThemeVariantNames } from "../../hooks/translations/useThemeVariantNames";
import { useCallback, useState } from "react";
import { MemoryInfo } from "../../utils/memory/types";
import { getMemoryInfo } from "../../utils/memory";
import { formatBytes, openBrowser } from "../../utils/utils";
import { CircularProgress, ProgressBar } from "../common/progressBar";
import { AppUpdater } from "../../utils/update";
import { sendToast } from "../../utils/toast";
import { type as osType } from '@tauri-apps/plugin-os';
import { getCurrentPlatform } from "../../utils/platform";
import { PaperIcon } from "../common/icon/paperIcon";
import { PRIVACY_POLICY_URL, RELEASES_URL } from "../../constants";

const ThemeModeSelection = () => {
    const { colorMode, updateTheme } = useThemeStore();

    const variantNames = useThemeVariantNames();

    return (
        <>
            {Object.keys(variantNames).sort().map((mode, idx) => (
                <Chip
                    key={idx}
                    mode={Number(mode) === colorMode ? "flat" : 'outlined'}
                    selected={Number(mode) === colorMode}
                    onPress={() => {
                        updateTheme({colorMode: Number(mode)});
                    }}
                    style={{ margin: 5 }}
                    textStyle={{ textTransform: 'capitalize' }}
                >
                    {variantNames[mode]}
                </Chip>
            ))}
        </>
    );
};

const UpdateListItem = () => {
    const { t } = useLingui();
    const [isLoading, setIsLoading] = useState(false);

    const onUpdateCheck = async () => {
        setIsLoading(true);
        const update = await AppUpdater.checkForUpdate();
        if (update) {
            setIsLoading(false);
            Platform.OS === 'web' && router.back();
            router.navigate({
                pathname: '(dialogs)/updateChecker',
                params: update
            });
            return;
        } else {
            sendToast({title: t`No update available`, preset: 'done'})
        }
        setIsLoading(false);
    };

    return (
        <ListItem
            title={t`Version` + ` ${Constants.expoConfig.version}`}
            mode="action"
            onPress={onUpdateCheck}
            isFirst
            trailing={isLoading ? 
                <CircularProgress hosted variant="linear" value={0} indeterminate slot="trailing" style={{aspectRatio: 1, height: 24}} /> 
                : <PaperIcon name="update" slot="trailing" />}
        />
    );
};

const MemoryViewer = () => {
    const [memoryInfo, setMemoryInfo] = useState<MemoryInfo>(null);
    const { t } = useLingui();
    const { colors } = useAppTheme();

    const preferGpu = useSettingsStore(state => state.preferGpu);

    const platform = getCurrentPlatform();

    const onCheckMemory = async() => {
        const info = await getMemoryInfo();
        setMemoryInfo(info);
    };

    useFocusEffect(
        useCallback(() => {
            onCheckMemory();
            return () => null;
        }, []),
    );

    // TODO: Remove with inline module fix
    if (platform === 'mobile') {
        return null;
    }

    return(
        <PaperList.Section title={t`Memory`} titleStyle={{color: colors.primary}}>
            <List>
                <ListItem
                    title={t`RAM - App usage`}
                    mode="action"
                    description={`${memoryInfo ? formatBytes(memoryInfo.ram.appUsed).join(' ') : ''}`} 
                    onPress={onCheckMemory}
                    trailing={<PaperIcon name="autorenew" slot="trailing" />}
                />
                <ListItem
                    title="RAM"
                    mode="item"
                    description={
                        <View style={{gap: 6}}>
                            <Text variant="labelMedium" style={{color: colors.onSurfaceVariant}}>{memoryInfo ? `${formatBytes(memoryInfo.ram.used)[0]} / ${formatBytes(memoryInfo.ram.total).join(' ')}` : ''}</Text>
                            <ProgressBar hosted value={memoryInfo?.ram.used ?? 0} indeterminate={!memoryInfo} max={memoryInfo?.ram.total} variant="linear"  />
                        </View>
                    } 
                />
                {preferGpu && <ListItem
                    title="GPU"
                    mode="item"
                    description={
                        <View style={{gap: 6}}>
                            <Text variant="labelMedium" style={{color: colors.onSurfaceVariant}}>{memoryInfo ? `${formatBytes(memoryInfo.vram.used)[0]} / ${formatBytes(memoryInfo.vram.total).join(' ')}` : ''}</Text>
                            <ProgressBar hosted value={memoryInfo?.vram.used ?? 0} indeterminate={!memoryInfo} max={memoryInfo?.vram.total} variant="linear"  />
                        </View>
                    } 
                />}
            </List>
        </PaperList.Section>
    );
};

export const SettingsContent = () => {
    const { colors } = useAppTheme();

    const autoInfer = useSettingsStore(state => state.autoInfer);
    
    const execProvider = useSettingsStore(state => state.executionProvider);
    const extBrowser = useSettingsStore(state => state.extBrowser);
    const autoUpdate = useSettingsStore(state => state.autoUpdate);
    const preferGpu = useSettingsStore(state => state.preferGpu);
    const updateSettings = useSettingsStore(state => state.updateSettings);

    // theme
    const darkMode = useThemeStore(state => state.darkMode);
    const updateTheme = useThemeStore(state => state.updateTheme);

    // rank
    const isRankEnabled = useStatsStore(state => state.isEnabled);
    const setIsRankEnabled = useStatsStore(state => state.setIsEnabled);
    
    const { t } = useLingui();

    const platform = Platform.OS === 'web' ? osType() : null;

    const onChangeModel = () => {
        router.back();
        router.navigate('models');
    };

    const onCategoryOrder = () => {
        router.back();
        router.navigate('categories');
    };

    const onDarkMode = (val: boolean) => {
        updateTheme({darkMode: val});
        getCurrentPlatform() === 'desktop' && setTheme(val ? 'dark' : 'light');
    };

    const onLicense = () => {
        router.back();
        router.navigate('licenses')
    };

    return(
        <View>
            <PaperList.Section title={t`Models`} titleStyle={{color: colors.primary}} style={{gap: 6}}>
                <List>
                    <ListItem title={t`Change model`} onPress={onChangeModel} />
                    <ListItem title={t`Categories`} onPress={onCategoryOrder} />
                    {platform && platform !== 'linux' && <ListSwitch title={t`Prefer GPU`} value={preferGpu} onValueChange={(val) => updateSettings({preferGpu: val})} />}
                    {Platform.OS === 'web' && <ListItem title={t`Execution Provider`} description={execProvider} mode="item" />}
                </List>
            </PaperList.Section>
            <PaperList.Section title={t`General`} titleStyle={{color: colors.primary}}>
                <List>
                    <ListSwitch title={t`Auto inference`} value={autoInfer} onValueChange={(val) => updateSettings({autoInfer: val})} />
                    <ListSwitch title={t`Rank mode`} value={isRankEnabled} onValueChange={(val) => setIsRankEnabled(val)} />
                    <ListSwitch title={t`Use external browser`} value={extBrowser} onValueChange={(val) => updateSettings({extBrowser: val})} />
                    <ListSwitch title={t`Check for updates on startup`} value={autoUpdate} onValueChange={(val) => updateSettings({ autoUpdate: val })} />
                    <LanguageList />
                </List>
             </PaperList.Section>
            <PaperList.Section title={t`Theme`} titleStyle={{color: colors.primary}}>
                <List>
                    <ListSwitch title={t`Dark mode`} value={darkMode} onValueChange={onDarkMode} />
                    <ListItem
                        title={t`Theme mode`}
                        mode="item"
                        description={
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 6 }}>
                                <ThemeModeSelection />
                            </View>
                        } 
                    />
                </List>
            </PaperList.Section>
            <MemoryViewer />
            <PaperList.Section title={t`About`} titleStyle={{color: colors.primary}}>
                <List>
                    <UpdateListItem />
                    <ListItem title={t`Update history`} onPress={() => openBrowser(RELEASES_URL)} />
                    {Platform.OS !== 'web' && <ListItem title={t`Open source licenses`} onPress={onLicense} />}
                    <ListItem title={t`Privacy policy`} onPress={() => openBrowser(PRIVACY_POLICY_URL)} />
                </List>
            </PaperList.Section>
        </View>
    );
};