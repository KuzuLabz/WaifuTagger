import { I18nProvider,  } from "@lingui/react"
import { i18n } from "@lingui/core";
import { NativeStackNavigationOptions, SplashScreen, Stack } from 'expo-router';
import { dynamicActivate } from '../locale';
import { ThemeProvider } from "../providers/theme";
import { RootHeader } from "../components/header";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useFonts, RobotoFlex_400Regular } from '@expo-google-fonts/roboto-flex';
import { syncDownloads, verifyModels } from "../utils/fs";
import { useModelsStore } from "../store/models";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getModelKey } from "../utils/utils";
import { useSettingsStore } from "../store/settings";
import { ModelKey } from "../types";
import { DeviceInfoModule } from "react-native-nitro-device-info";

SplashScreen.preventAutoHideAsync();

const dialogScreenOptions: NativeStackNavigationOptions = {
    presentation: Platform.OS === 'web' ? 'transparentModal' : undefined,
    headerShown: Platform.OS === 'web' ? false : true,
    animation: Platform.OS === 'web' ? 'fade' : undefined,
};

const RootLayout = () => {
    const [fontsLoaded] = useFonts({ RobotoFlex_400Regular });
    const [langLoaded, setLangLoaded] = useState(false);

    useEffect(() => {
        dynamicActivate(useSettingsStore.getState().language).then(() => setLangLoaded(true));
    }, []);

    useEffect(() => {
        if (fontsLoaded && langLoaded) {
            SplashScreen.hideAsync();
            syncDownloads((modelKey) => useModelsStore.getState().updateDownloaded(modelKey as ModelKey, true));
        }
    }, [fontsLoaded, langLoaded]);

    useEffect(() => {
        const checkModels =  () => {
            const selected = useModelsStore.getState().selected;
            const downloaded = useModelsStore.getState().downloaded;
            const modelDir = useModelsStore.getState().modelsDir;
            verifyModels(modelDir, (downloads) => useModelsStore.setState((state) => ({downloaded: { ...state.downloaded, ...downloads}}))).then(() => {
                if (selected && !downloaded[getModelKey(selected)]) {
                    useModelsStore.setState({selected: null});
                }
            });
            
        };
        checkModels();
    },[])

    if (!fontsLoaded || !langLoaded) {
        return null;
    }

    return (
        <I18nProvider i18n={i18n}>
            <GestureHandlerRootView>
                <ThemeProvider>
                    <React.Fragment>
                        {Platform.OS === 'web' ? (
                            <>
                                <link
                                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0"
                                    rel="stylesheet"
                                />
                                <style type="text/css">{`
                                    @font-face {
                                    font-family: 'MaterialDesignIcons';
                                    src: url(${require('@react-native-vector-icons/material-design-icons/fonts/MaterialDesignIcons.ttf')}) format('truetype');
                                    }
                                `}</style>
                            </>
                        ) : null}
                    </React.Fragment>
                    <Stack id="root" screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(app)" options={{ headerShown: true, headerTransparent: true, header: () => <RootHeader /> }} />
                        <Stack.Screen name="models" />
                        <Stack.Screen name="licenses" />
                        <Stack.Screen name="categories" options={{ headerShown: true }} />
                        <Stack.Screen name="(dialogs)/config" options={{ presentation: 'transparentModal', animation: 'fade' }} />
                        <Stack.Screen name="(dialogs)/settings" options={dialogScreenOptions} />
                        <Stack.Screen name="(dialogs)/stats" options={dialogScreenOptions} />
                        <Stack.Screen name="(dialogs)/tag" options={{ presentation: 'transparentModal', animation: Platform.OS ==='web' ? undefined : 'fade' }} />
                        <Stack.Screen name="(dialogs)/updateChecker" options={{ presentation: 'transparentModal', animation: DeviceInfoModule.isTablet ? 'none' : 'slide_from_bottom' }} />
                    </Stack>
                </ThemeProvider>
            </GestureHandlerRootView>
        </I18nProvider>
    );
};

export default RootLayout;