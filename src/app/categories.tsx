import { useLingui } from "@lingui/react/macro";
import { View } from "react-native";
import { Checkbox, Divider, List as PaperList } from "react-native-paper";
import { useAppTheme } from "../providers/theme";
import { useSettingsStore } from "../store/settings";
import type { SortableGridRenderItem } from 'react-native-sortables';
import Sortable from "react-native-sortables";
import { Stack } from "expo-router";
import { PaperHeader } from "../components/header";
import { ListSwitch } from "../components/common/switch";
import { WebThemeProvider } from "../providers/webTheme";
import { useCategoryTitles } from "../hooks/translations/useCategoryTitles";
import { List } from "../components/common/list";

const CategoryOrderPage = () => {
    const { t } = useLingui();
    const { colors } = useAppTheme();
    const categoryOrder = useSettingsStore(state => state.categoryOrder);
    const hideEmpty = useSettingsStore(state => state.hideEmptyCategory);
    const setSettings = useSettingsStore(state => state.updateSettings);
    const toggleCategory = useSettingsStore(state => state.toggleCategory);
    const titleTranslations = useCategoryTitles();

    const sortItem: SortableGridRenderItem<typeof categoryOrder[0]> = ({item}) => {
        return(
            <PaperList.Item 
                title={titleTranslations[item.category]} 
                titleStyle={{textTransform: 'capitalize'}}
                left={(props) => <PaperList.Icon icon={'drag'} {...props} />} 
                right={(props) => <Sortable.Touchable {...props} onTap={() => toggleCategory(item.category)}><Checkbox status={item.enabled ? 'checked' : 'unchecked'} /></Sortable.Touchable>}
                style={{ backgroundColor: colors.surfaceContainer, borderRadius: 20}} 
            />
        );
    };

    return(
        <WebThemeProvider>
            <View style={{ flex: 1, backgroundColor: colors.surface, padding: 12}}>
                <Stack.Screen options={{ header: () => <PaperHeader title={t`Categories`} back />}} />
                <View style={{maxWidth: 1024, width: '100%', alignSelf: 'center'}}>
                    <List>
                        <ListSwitch 
                            title={t`Hide empty`} 
                            value={hideEmpty}
                            onValueChange={(v) => setSettings({hideEmptyCategory: v})} 
                        />
                    </List>
                    <Divider style={{marginVertical: 12}} />
                    <Sortable.Grid
                        columns={1}
                        data={categoryOrder}
                        keyExtractor={(item) => item.category}
                        renderItem={sortItem}
                        rowGap={6}
                        activeItemScale={1.1}
                        enableActiveItemSnap={false}
                        onDragEnd={({ data }) => setSettings({categoryOrder: data})}
                    />
                </View>
            </View>
        </WebThemeProvider>
    );
};

export default CategoryOrderPage;