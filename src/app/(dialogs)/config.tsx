import { useState } from "react";
import { Dialog } from "../../components/dialogs/dialog";
import { useLingui } from "@lingui/react/macro";
import { ListSlider } from "../../components/common/slider";
import { ScrollView } from "react-native";
import { ModelSettings, useModelsStore } from "../../store/models";
import { INIT_THRESHOLDS, MAX_TAGS, MODEL_CATALOG } from "../../constants";
import { useSettingsStore } from "../../store/settings";
import { List } from "../../components/common/list";
import { List as PaperList } from 'react-native-paper'
import { useCategoryTitles } from "../../hooks/translations/useCategoryTitles";

const ConfigDialog = () => {
    const { t } = useLingui();
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

    const onSave = () => {
        updateSettings(newConfig);
    };

    const onClose = () => {
        setNewConfig(settings[selected.type]);
    };

    const onReset = () => {
        setNewConfig({ thresholds: {...INIT_THRESHOLDS, general: MODEL_CATALOG[selected.type].minThreshold}, maxTags: MAX_TAGS });
    };

    return (
        <Dialog 
            visible={true} 
            onDismiss={onClose} 
            title={t`Model Settings`} 
            actions={[
                {
                    title: t`Reset`, 
                    onPress: onReset,
                    autoDismiss: false
                }, 
                {
                    title: t`Cancel`, 
                    onPress: onClose
                }, 
                {
                    title: t`Save`, 
                    onPress: onSave
                }
            ]}
        >
            <ScrollView style={{paddingHorizontal: 16}}>
                <PaperList.Section title={t`Max tags`}>
                    <List>
                        <ListSlider 
                            title={cats.general} 
                            value={newConfig.maxTags ?? MAX_TAGS} 
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
                                title={cats[c.category]}
                                value={newConfig.thresholds[c.category]}
                                min={0.25} max={1}
                                step={0.01}
                                onValueChange={(val) => updateThreshold(c.category, parseFloat(val.toFixed(2)))}
                            />
                        ))}
                    </List>
                </PaperList.Section>
            </ScrollView>
        </Dialog>
    );
};

export default ConfigDialog;