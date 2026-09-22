import { Column, FieldGroup, Host, Row, Text } from "@expo/ui";
import { useAppTheme } from "../../providers/theme";
import { router } from "expo-router";
import { useLingui } from "@lingui/react/macro";
import { BottomSheet } from "../../components/common/bottomsheet";
import { useSettingsStore } from "../../store/settings";
import { useState } from "react";
import { ModelSettings, useModelsStore } from "../../store/models";
import { INIT_THRESHOLDS, MAX_TAGS, MODEL_CATALOG } from "../../constants";
import { ListSlider, NativeSlider } from "../../components/common/slider";
import { NativeButton } from "../../components/common/button";
import { weight } from "@expo/ui/jetpack-compose/modifiers";
import { Divider } from "../../components/common/divider";
import { useCategoryTitles } from "../../hooks/translations/useCategoryTitles";
import { SideSheet } from "../../components/dialogs/sidesheet";
import { List as PaperList } from "react-native-paper";
import { List } from "../../components/common/list";
import { useWindowWidthClass, WindowWidthClass } from "../../hooks/useWindowWidthClass";

const ConfigSheet = () => {
    const { t } = useLingui();
    const { colors, dark, fonts } = useAppTheme();
    const sizeClass = useWindowWidthClass();
    const categoryOrder = useSettingsStore(state => state.categoryOrder);
    const settings = useModelsStore(state => state.settings);
    const selected = useModelsStore(state => state.selected);
    const updateSettings = useModelsStore(state => state.updateSettings);

    const [newConfig, setNewConfig] = useState(settings[selected.type]);
    const cats = useCategoryTitles();

    const updateThreshold = (type: keyof ModelSettings['thresholds'], value: number) => {
        setNewConfig((prev) => ({...prev, thresholds: { ...prev.thresholds, [type]: value } }));
    };

    const updateMaxTags = (value: number) => {
        setNewConfig((prev) => ({...prev, maxTags: value}));
    }

    const onDismiss = () => router.back();

    const onSave = () => {
        updateSettings(newConfig);
        onDismiss();
    };

    const onClose = () => {
        onDismiss();
        setNewConfig(settings[selected.type]);
    };

    const onReset = () => {
        setNewConfig({ thresholds: {...INIT_THRESHOLDS, general: MODEL_CATALOG[selected.type].minThreshold}, maxTags: MAX_TAGS });
    };

    if (sizeClass !== WindowWidthClass.Compact) {
        return(
            <SideSheet 
                title={t`Model Settings`} 
                isPresented={true}
                onDismiss={onDismiss}
                scrollable
                actions={[
                    {
                        title: t`Save`,
                        onPress: onSave,
                        mode: 'contained'
                    },
                    {
                        title: t`Reset`,
                        onPress: onReset,
                        mode: 'outlined'
                    }
                ]}
            >
                <PaperList.Section title={t`Max tags`}>
                    <List>
                        <ListSlider 
                            title={cats.general} 
                            value={newConfig.maxTags ?? MAX_TAGS} 
                            hosted
                            min={20} max={80} fractionDigits={0} 
                            step={1}
                            onValueChange={(v) => updateMaxTags(v)} 
                        />
                    </List>
                </PaperList.Section>
                <PaperList.Section title={t`Minimum thresholds`}>
                    <List>
                        {categoryOrder.map((c, idx) => c.enabled && (
                            <ListSlider
                                key={idx}
                                hosted
                                title={cats[c.category]}
                                value={newConfig.thresholds[c.category]}
                                min={0.25} max={1}
                                step={0.01}
                                onValueChange={(val) => updateThreshold(c.category, parseFloat(val.toFixed(2)))}
                            />
                        ))}
                    </List>
                </PaperList.Section>
            </SideSheet>
        );
    }

    return(
        <Host style={{ flex: 1 }} colorScheme={dark ? 'dark' : 'light'} seedColor={colors.primary}>
            <BottomSheet isPresented={true} onDismiss={onClose} snapPoints={['full']} contentPadding={{left: 0, right: 0, bottom: 0}}>
                <FieldGroup modifiers={[weight(1)]} style={{backgroundColor: colors.surfaceContainerLow, paddingHorizontal: 6}}>
                    <FieldGroup.SectionHeader>
                        <Text textStyle={{...fonts.titleLarge, color: colors.onSurface}}>{t`Model Settings`}</Text>
                    </FieldGroup.SectionHeader>
                    <FieldGroup.Section title={t`Max General Tags`}>
                        <NativeSlider value={newConfig.maxTags} min={20} max={80} fractionDigits={0} onValueChange={(v) => updateMaxTags(v)} />
                    </FieldGroup.Section>
                    <FieldGroup.Section title={t`Minimum Thresholds`}>
                        {categoryOrder.map((c, idx) => (
                            <ListSlider
                                key={idx}
                                title={cats[c.category]}
                                value={newConfig.thresholds[c.category]}
                                min={0.25} max={1}
                                step={0.01}
                                onValueChange={(val) => updateThreshold(c.category, parseFloat(val.toFixed(2)))}
                            />
                        ))}
                    </FieldGroup.Section>
                </FieldGroup>
                <Column style={{paddingHorizontal: 12, paddingTop: 4}}>
                    <Divider />
                    <Row spacing={12} style={{ paddingVertical: 12 }}>
                        <NativeButton label={t`Save`} onPress={onSave} modifiers={[weight(1)]} />
                        <NativeButton label={t`Reset`} variant="text" onPress={onReset} />
                    </Row>
                </Column>
            </BottomSheet>
        </Host>
    );
};

export default ConfigSheet;