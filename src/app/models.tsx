import { Platform, View } from "react-native";
import { useModelsStore } from "../store/models";
import { useSettingsStore } from "../store/settings";
import { router, Stack } from "expo-router";
import { Button, IconButton, Text, List as PaperList, Chip } from "react-native-paper";
import { useLingui } from "@lingui/react/macro";
import { PaperHeader } from "../components/header";
import { useEffect, useState } from "react";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../providers/theme";
import { AppTitle } from "../components/title";
import { getCurrentPlatform } from "../utils/platform";
import { openModelsDir } from "../utils/fs";
import { ScrollViewStyled } from "../components/scrollview";
import { WebThemeProvider } from "../providers/webTheme";
import SessionManager from '../onnx';
import { useModelWatch } from "../hooks/useModelWatch";
import { ModelEntry, ModelKey, ModelListCatalog, SupportedModels, TagCategoryType, VariantType } from "../types";
import { CATEGORY_COLORS, MODEL_CATALOG } from "../constants";
import { useCategoryTitles } from "../hooks/translations/useCategoryTitles";
import { ProgressBar } from "../components/common/progressBar";
import { getStorageInfo } from "../utils/memory";
import { formatBytes, openBrowser } from "../utils/utils";
import { StorageInfo } from "../utils/memory/types";
import { List, ListItem } from "../components/common/list";
import { PaperIcon } from "../components/common/icon/paperIcon";
import { ButtonGroup } from "../components/common/buttonGroup";

const ModelDescription = ({type, variant, fontSize, color}:  {type: SupportedModels, variant: VariantType, color: string; fontSize: number}) => {
    const { fonts, dark, colors } = useAppTheme();
    const { t } = useLingui();
    const categoryTitles = useCategoryTitles();

    const scale = useSharedValue(1);

    const colorSchema = dark ? 'dark' : 'light';
    const size = MODEL_CATALOG[type].variants[variant]?.size;
    const categories = MODEL_CATALOG[type].categories as TagCategoryType[];

    const animatedTextStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const onOpenLink = async (linkType: keyof ModelEntry['links']) => {
        await openBrowser(MODEL_CATALOG[type].links[linkType], undefined, MODEL_CATALOG[type].name);
    };

    useEffect(() => {
        scale.set(1.1);
        scale.set(() => withTiming(1, { duration: 500 }));
    }, [size]);

    return(
        <View style={{gap: 8, paddingTop: 8}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <PaperIcon name={'account'} size={14} color={colors.onSurfaceVariant} />
                <Text style={{fontSize, color}}>{`${MODEL_CATALOG[type].creator}`}</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <PaperIcon name={'license'} size={14} color={colors.onSurfaceVariant} />
                <Text style={{fontSize, color}}>{`${MODEL_CATALOG[type].license}`}</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <PaperIcon name={'database'} size={14} color={colors.onSurfaceVariant} />
                <Animated.Text style={[animatedTextStyle, { ...fonts.default, fontSize, color,}]}>{size}</Animated.Text>
            </View>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 4}}>
                {categories.map((c) => 
                    <View 
                        key={c}
                        style={{
                            paddingHorizontal: 8, 
                            paddingVertical: 4, 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            overflow: 'hidden', 
                            backgroundColor: CATEGORY_COLORS[colorSchema][c]?.backgroundColor ?? colors.surfaceContainer, 
                            borderWidth: 0.5, 
                            borderColor: CATEGORY_COLORS[colorSchema][c]?.color,  
                            borderRadius: 6
                        }}
                    >
                        <Text variant="labelMedium" style={{color: CATEGORY_COLORS[colorSchema][c]?.color ?? colors.onSurface,}}>
                            {categoryTitles[c]}
                        </Text>
                    </View>
                )}
            </View>
            <View style={{flexDirection: 'row', gap: 8, paddingTop: 8}}>
                <Chip 
                    mode="outlined" 
                    compact 
                    icon={'link'} 
                    onPress={() => onOpenLink('mobileUrl')}
                >
                    {t`Model`}
                </Chip>
                <Chip 
                    mode="outlined" 
                    compact 
                    icon={'link'} 
                    onPress={() => onOpenLink('sourceUrl')}
                >
                    {t`Source`}
                </Chip>
            </View>
        </View>
    );
};

const ModelItem = ({ type }: {type: SupportedModels}) => {
    const variantKeys = Object.keys(MODEL_CATALOG[type].variants) as VariantType[];

    const { colors } = useAppTheme();
    const { t } = useLingui();

    const deleteModel = useModelsStore(state => state.delete);
    const downloadModel = useModelsStore(state => state.download);
    const setSelected = useModelsStore((state) => state.selectModel);
    const updateDownloaded = useModelsStore((state) => state.updateDownloaded);
    const selected = useModelsStore((state) => state.selected);
    const downloads = useModelsStore((state) => state.downloaded);

    const [currentVariant, setCurrentVariant] = useState<VariantType>(selected ? selected.variant : getCurrentPlatform() === 'desktop' ? 'FP16' : 'QUINT8');
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);

    const isSelected = selected ? selected.type === type && selected.variant === currentVariant : false;
    const modelKey = `${type}:${currentVariant}` as ModelKey;

    const onSelect = () => {
        updateDownloaded(modelKey, true);
        setSelected(type, currentVariant);
        useSettingsStore.setState({isNewUser: false});
        router.replace('/(app)');
    };

    const onDelete = async () => {
        await SessionManager.releaseSession();
        await deleteModel(type, currentVariant)
    };

    const onModelAction = async () => {
        if (isSelected) {
            useModelsStore.setState({ selected: null });
            await SessionManager.releaseSession();
            return;
        }
        if (downloads[modelKey]) {
            onSelect();
        } else {
            setIsDownloading(true);
            await downloadModel(type, currentVariant, (val) => {
                setProgress(val);
            }, () => {
                setIsDownloading(false);
            });
            
        }
    };

    const onOpenLink = async () => {
        await openBrowser(MODEL_CATALOG[type].links['mobileUrl'], undefined, MODEL_CATALOG[type].name);
    };

    return(
        <View style={{backgroundColor: colors.elevation.level5, borderRadius: 16, gap:8, overflow: 'hidden'}}>
            <PaperList.Item 
                title={MODEL_CATALOG[type].name} 
                description={(props) => <ModelDescription type={type} variant={currentVariant} {...props}  />}
                // right={(props) => 
                //     <IconButton icon={'launch'} onPress={onOpenLink} {...props} />
                // }
            />
            <View style={{paddingHorizontal: 6, paddingBottom: 12, gap: 12}}>
                <ButtonGroup 
                    actions={variantKeys.map((v) => ({label: v, icon: downloads[`${type}:${v}`] ? 'database' : undefined}))}
                    onValueChange={(val) => setCurrentVariant(variantKeys[val])}
                    selectedIndex={variantKeys.indexOf(currentVariant)}
                />
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Button 
                        loading={isDownloading} 
                        disabled={isDownloading} 
                        icon={isSelected ? 'check' : downloads[modelKey] ?  undefined : 'download-outline'} 
                        onPress={onModelAction}
                        mode="contained"
                        style={{flexGrow: 1}}
                    >
                        {!downloads[modelKey] ? t`Download` : isSelected ? t`Deselect` : t`Select`}
                    </Button>
                    {downloads[modelKey] && <IconButton 
                        icon={'trash-can-outline'}
                        iconColor={colors.error}
                        onPress={onDelete}
                    />}
                </View>
            </View>
            
            {isDownloading && <Animated.View entering={FadeIn} exiting={FadeOut} style={{paddingBottom: 6, paddingHorizontal: 12 }}>
                    <ProgressBar hosted={Platform.OS !== 'web'} value={progress * 100} max={100} indeterminate={false} />
                </Animated.View>}
        </View>
    );
};

const ModelsPage = () => {
    const isNewUser = useSettingsStore((state) => state.isNewUser);
    const selected = useModelsStore((state) => state.selected);
    const downloaded = useModelsStore((state) => state.downloaded);
    const modelDir = useModelsStore((state) => state.modelsDir);
    const changeDirectory = useModelsStore((state) => state.changeDirectory);
    
    useModelWatch();
    const modelTypes = Object.keys(MODEL_CATALOG).filter((m) => m !== '$schema') as SupportedModels[];

    const [moveLoading, setMoveLoading] = useState<boolean>(false);
    const [storage, setStorage] = useState<StorageInfo | null>(null);
    
    const { colors } = useAppTheme();
    const { bottom, top, } = useSafeAreaInsets();
    const { t } = useLingui();

    const platform = getCurrentPlatform();
    const recVariant: VariantType = platform === 'desktop' ? 'FP16' : 'QUINT8';

    const isDownloadRequired = isNewUser || !selected || !!downloaded[`${selected.type}:${selected.variant}`] === false;

    const onStorageCheck = async () => {
        const info = await getStorageInfo();
        setStorage(info);
    };
    
    const onModelDirChange = async () => {
        setMoveLoading(true);
        await changeDirectory(() => SessionManager.releaseSession());
        await onStorageCheck();
        setMoveLoading(false);
    };

    useEffect(() => {
        onStorageCheck();
    },[]);

    return(
        <WebThemeProvider>
            <View style={{flex: 1, backgroundColor: colors.surface, paddingTop: isDownloadRequired ? top / 1.5 : undefined}}>
                <Stack.Screen options={{ header: () => <PaperHeader title={t`Model Manager`} elevated back={!isDownloadRequired} />, headerShown: !isDownloadRequired }} />
                <ScrollViewStyled style={{flex: 1, }}  fadingEdgeLength={4}>
                    <View style={{ gap: 12, maxWidth: 1024, width: '100%', alignSelf: 'center', paddingVertical: 12 }}>
                        
                        {isDownloadRequired && <View style={{alignItems: 'center', paddingVertical: 12, gap: 6}}>
                            <AppTitle titleVariant="headlineMedium" iconSize={120} />
                            <View>
                                <Text>{t`Please download and select a model to get started!`}</Text>
                            </View>
                        </View>}
                        <List style={{ paddingLeft: 12, paddingRight: 12}}>
                            {platform === 'desktop' && <ListItem 
                                title={t`Change model directory`}
                                // moveLoading && <ProgressBar value={0} indeterminate />
                                description={<View>
                                    <Text variant="labelMedium">{!modelDir ? 'Default' : modelDir}</Text>
                                    {moveLoading && <ProgressBar value={0} indeterminate />}
                                </View>}
                                mode="action"
                                onPress={onModelDirChange}
                                trailing={<PaperIcon name="folder-managed" slot="trailing" />}
                            />}
                            {platform === 'desktop' && <ListItem
                                title={t`Open model directory`}
                                onPress={() => openModelsDir(modelDir)}
                                trailing={<PaperIcon name="folder-open" slot="trailing" />}
                            />}
                            <ListItem
                                title={t`Storage`}
                                onPress={onStorageCheck}
                                description={
                                    <View style={{gap: 8}}>
                                        <Text variant="labelMedium">{storage ? `${formatBytes(storage.used).join(' ')} / ${formatBytes(storage.total).join(' ')}` : t`Unknown`}</Text>
                                        <ProgressBar variant="linear" hosted value={storage?.used ?? 0} max={storage?.total ?? 100} indeterminate={false} />
                                    </View>
                                }
                                trailing={<PaperIcon name="autorenew" slot="trailing" size={platform === 'mobile' ? 24 : undefined} />}
                            />
                        </List>
                        <View style={{paddingHorizontal: 12}}>
                            <View style={{ flex:1, flexDirection: 'row', width: '100%', gap: 12, alignItems: 'center', justifyContent: 'flex-start', padding: 8, borderRadius: 16, backgroundColor: colors.secondaryContainer}}>
                                <PaperIcon name={'info'} size={24} color={colors.onSurface} />
                                <Text variant="labelLarge"  style={{ color: colors.onSecondaryContainer }}>{t`${recVariant} is recommended for your device.`}</Text>
                            </View>
                        </View>
                        <View style={{gap: 12, paddingHorizontal: 12, paddingBottom: bottom}}>
                            {
                                modelTypes.map((type, idx) => (
                                    <ModelItem key={idx} type={type} />
                                ))
                            }
                        </View>
                    </View>
                </ScrollViewStyled>
                {isDownloadRequired && <View style={{ elevation: 4, paddingVertical: 12, paddingBottom: bottom + 12, paddingHorizontal: 8, backgroundColor: colors.elevation.level5}}>
                    <Button mode="elevated" disabled={!selected} onPress={() => router.replace('(app)')}>{'Continue'}</Button>
                </View>}
            </View>
        </WebThemeProvider>
    );
};

export default ModelsPage;