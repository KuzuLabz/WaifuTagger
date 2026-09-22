import { Stack } from "expo-router";
import { FlatList, ListRenderItemInfo, useWindowDimensions, View } from "react-native";
import { PaperHeader } from "../components/header";
import { useLingui } from "@lingui/react/macro";
import { useCallback, useEffect, useState } from "react";
import { ReactNativeLegal, Library } from "react-native-legal";
import { Chip, List, Searchbar, Text, Button as PaperButton, Portal } from "react-native-paper";
import { Button, Column, Host, Text as NativeText, RNHostView, Row, ScrollView } from '@expo/ui';
import { useAppTheme } from "../providers/theme";
import { BottomSheet } from "../components/common/bottomsheet";
import { openBrowser } from "../utils/utils";

const LibrarySheetContent = ({ library }: { library?: Library }) => {
    const { colors, fonts } = useAppTheme();
    const { t } = useLingui();

    if (!library) {
        return null;
    }

    return (
        <ScrollView>
            <Column spacing={18} style={{ paddingHorizontal: 12 }}>
                <Column spacing={18}>
                    <Column spacing={6}>
                        <NativeText textStyle={{ ...fonts.titleLarge }}>{library.name}</NativeText>
                        {library?.version &&
                            <NativeText
                                textStyle={{ ...fonts.labelMedium, color: colors.onSurfaceVariant }}
                            >
                                {library.version}
                            </NativeText>
                        }
                    </Column>
                    <NativeText
                        textStyle={{ ...fonts.labelMedium, color: colors.onSurfaceVariant }}
                    >
                        {
                            library?.developers.map((d) => d.name).join(', ')
                        }
                    </NativeText>
                </Column>
                <Column spacing={18}>
                    <NativeText textStyle={{ ...fonts.bodyMedium }}>
                        {library?.description}
                    </NativeText>
                    <Row spacing={8} alignment="center">
                        {library?.website && <Button variant="outlined" onPress={() => openBrowser(library.website)}>
                            <NativeText textStyle={{ color: colors.onSurface }}>{t`Website`}</NativeText>
                        </Button>}
                        {library?.licenses?.[0]?.url &&
                            <RNHostView matchContents>
                                <PaperButton mode="contained" onPress={() => openBrowser(library?.licenses[0].url)}>{t`View license`}</PaperButton>
                            </RNHostView>
                        }
                    </Row>
                </Column>
                {library?.licenses?.[0]?.licenseContent && <Column style={{ borderRadius: 12, backgroundColor: colors.surfaceDim, padding: 8 }}>
                    <NativeText textStyle={{ color: colors.onSurfaceVariant }}>
                        {library.licenses[0].licenseContent}
                    </NativeText>
                </Column>}
            </Column>
        </ScrollView>
    );
};

const LicenseItem = ({ item, onPress }: ListRenderItemInfo<Library> & { onPress: (lib: Library) => void }) => {
    const { colors } = useAppTheme();
    const authors = item.developers?.map((d) => d.name) ?? [];

    return (
        <View>
            <List.Item
                title={item.name}
                onPress={() => onPress(item)}
                description={(textProps) =>
                    <View>
                        {authors?.length > 0 && authors[0].length > 0 && <Text style={{ ...textProps }}>{authors.join(', ')}</Text>}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', }}>
                            {item.licenses.map((license, idx) => (
                                <View
                                    key={idx}
                                    style={{
                                        marginTop: 6,
                                        padding: 4, paddingHorizontal: 6,
                                        justifyContent: 'center', alignItems: 'center',
                                        borderRadius: 12,
                                        backgroundColor: colors.primaryContainer
                                    }}
                                >
                                    <Text variant="labelMedium" style={{color: colors.onPrimaryContainer}}>{license.name === 'MIT' ? 'MIT License' : license.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                }
                right={() => <Text>{item.version}</Text>}
            />

        </View>
    );
};

const LicensesPage = () => {
    const { t } = useLingui();
    const { colors } = useAppTheme();

    const [libraries, setLibraries] = useState<Library[]>([]);
    const [selectedLib, setSelectedLib] = useState<Library>(null);
    const [presented, setPresented] = useState(false);

    const onDismiss = () => {
        setPresented(false);
    };

    const onPresent = (data: Library) => {
        setSelectedLib(data);
        setPresented(true);
    };

    const renderItem = useCallback((props: ListRenderItemInfo<Library>) => {
        return (<LicenseItem {...props} onPress={onPresent} />)
    }, [onPresent]);

    useEffect(() => {
        const getLibs = async () => {
            const result = await ReactNativeLegal.getLibrariesAsync();
            setLibraries(result?.data);
        };

        getLibs();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen options={{ headerShown: true, header: () => <PaperHeader title={t`Open source licenses`} back /> }} />
            <FlatList
                data={libraries}
                keyExtractor={(d) => d.id}
                renderItem={renderItem}
                keyboardDismissMode="on-drag"
            />
            <Host>
                <BottomSheet
                    isPresented={presented}
                    onDismiss={onDismiss}
                    snapPoints={["full"]}
                >
                    <LibrarySheetContent library={selectedLib} />
                </BottomSheet>
            </Host>
        </View>
    );
};

export default LicensesPage;