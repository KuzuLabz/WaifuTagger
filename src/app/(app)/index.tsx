import { Button, Divider, IconButton } from 'react-native-paper';
import { Platform, StatusBar, View } from 'react-native';
import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { TextInputWrapper } from "expo-paste-input";
import { useStatsStore } from '../../store/stats';
import { useLingui } from '@lingui/react/macro';
import { InferenceTag } from '../../types';
import { useTags } from '../../hooks/useTags';
import useModel from '../../hooks/useModel';
import LoadingView from '../../components/loading';
import { ScrollViewStyled } from '../../components/scrollview';
import ImageSelector from '../../components/imageSelector';
import { LevelView } from '../../components/levelView';
import TagText from '../../components/tagText';
import ResultSection from '../../components/section';
import Footer from '../../components/footer';
import { router, Stack } from 'expo-router';
import { ImageController } from '../../utils/selector';
import { useImageStore } from '../../store/image';
import { useAppTheme } from '../../providers/theme';
import { WebThemeProvider } from '../../providers/webTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../store/settings';
import { UrlInput } from '../../components/input';

const App = () => {
    const { isEnabled: isRankEnabled } = useStatsStore();
    const { currentHash, image } = useImageStore();
    
    const categoryOrder = useSettingsStore(useShallow((state) => state.categoryOrder));
    const hideEmpty = useSettingsStore(state => state.hideEmptyCategory);
    const isPlainText = useSettingsStore(state => state.tagPlainText);
    const { colors } = useAppTheme();
    const { t } = useLingui();

    const [url, setUrl] = useState('');

    const {
        runInference,
        tags,
        loading,
        isInferLoading
    } = useModel();
    const adjustedTags = useTags(tags);

    const onTagSelect = (tag: InferenceTag) => {
        router.navigate({ pathname: '/(dialogs)/tag', params: { tagJson: JSON.stringify(tag) } });
    };

    return loading ? (
        <WebThemeProvider>
            <Stack.Screen options={{ headerShown: false }} />
            <LoadingView />
        </WebThemeProvider>
    ) : (
        <WebThemeProvider>
            <SafeAreaView
                style={{
                    backgroundColor: colors.surface,
                    height: Platform.select({ web: '100vh', native: '100%' }),
                }}
            >
                <Stack.Screen options={{ headerShown: true }} />
                <ScrollViewStyled
                    contentContainerStyle={{ flexGrow: 1, zIndex: 1 }}
                    keyboardDismissMode="on-drag"
                >
                    <View style={{ flex: 1 }}>
                        <ImageSelector
                            onImagePick={() => ImageController.fromImageDialog()}
                            isLoading={isInferLoading}
                            rank={tags?.rank}
                        />
                        <LevelView isLoading={isInferLoading} />
                        <Divider bold />
                        <View
                            style={{
                                flexDirection: 'row',
                                marginTop: 15,
                                width: '100%',
                                alignItems: 'center',
                            }}
                        >
                            <TextInputWrapper style={{ marginHorizontal: 10, flex: 1 }} onPaste={(e) => {
                                console.log(e);
                                if (e.type === 'images') {
                                    ImageController.fromIntent(e.uris[0]);
                                } else if (e.type === 'text' && (e.value.startsWith('http') || e.value.startsWith('data:'))) {
                                    ImageController.fromUrl(e.value);
                                }
                            }}>
                                <UrlInput text={url} onTextChange={(txt) => setUrl(txt)} />
                            </TextInputWrapper>
                            {Platform.OS !== 'web' && (
                                <IconButton 
                                    icon="camera" 
                                    onPress={ImageController.fromCamera} 
                                />
                            )}
                            {Platform.OS === 'web' && (
                                <IconButton
                                    icon={"send"}
                                    onPress={() => ImageController.fromUrl(url)}
                                    disabled={!url || !url.startsWith('http')}
                                />
                            )}
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 20,
                                marginHorizontal: 10,
                            }}
                        >
                            <Button
                                mode="contained-tonal"
                                onPress={() => runInference()}
                                style={{ flexGrow: 1 }}
                                disabled={(isRankEnabled && currentHash === image.hash) || !image.uri || isInferLoading}
                            >
                                {t`Run Inference`}
                            </Button>
                            <IconButton
                                style={{ flexShrink: 1 }}
                                icon={'tune-vertical-variant'}
                                onPress={() => router.navigate('/(dialogs)/config')}
                            />
                        </View>
                        {adjustedTags ? (
                            <>
                                <TagText tags={adjustedTags} isLoading={isInferLoading} />
                                {isPlainText && <View>
                                    {categoryOrder.map((item) =>  item.enabled && (hideEmpty ? adjustedTags[item.category].length > 0 : true) && (
                                        <ResultSection
                                            key={item.category}
                                            tags={adjustedTags[item.category]}
                                            title={item.category}
                                            onTagSelect={onTagSelect}
                                        />
                                    ))}
                                </View>}
                            </>
                        ) : null}
                        <View style={{ flex: 1 }} />
                        <Footer />
                    </View>
                </ScrollViewStyled>
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        width: '100%',
                        height: StatusBar.currentHeight,
                        backgroundColor: colors.surface,
                    }}
                />
            </SafeAreaView>
        </WebThemeProvider>
    );
};

export default App;
