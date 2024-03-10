import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';
import useModel from './hooks/useModel';
import {
    Button,
    Chip,
    Headline,
    Icon,
    IconButton,
    Portal,
    ProgressBar,
    Surface,
    Text,
} from 'react-native-paper';
import LoadingView from './components/loading';
import ImageSelector from './components/imageSelector';
import ResultSection from './components/section';
import TagText from './components/tagText';
import { InferenceConfigurator, TagInfo } from './components/dialogs';
import { useState } from 'react';
import { InferenceTag } from './types';

const Main = () => {
    const [tagInfoVisible, setTagInfoVisible] = useState(false);
    const [configVisible, setConfigVisible] = useState(false);
    const [selectedTag, setSelectedTag] = useState<InferenceTag | null>(null);
    const { runInference, pickImage, updateConfig, tags, image, loading, inferenceConfig } =
        useModel();

    const onTagSelect = (tag: InferenceTag) => {
        setSelectedTag(tag);
        setTagInfoVisible(true);
    };

    return loading ? (
        <LoadingView />
    ) : (
        <View style={{ height: '100%' }}>
            <ScrollView style={{ flex: 1 }}>
                <ImageSelector onImagePick={pickImage} image={image} />
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 20,
                        marginHorizontal: 10,
                    }}
                >
                    <Button mode="elevated" onPress={runInference} style={{ flexGrow: 1 }}>
                        Run Inference
                    </Button>
                    <IconButton style={{ flexShrink: 1 }} icon={'tune-vertical-variant'} />
                </View>
                {tags ? (
                    <>
                        <TagText text={tags.ordered_tags.join(', ')} />
                        <View>
                            <ResultSection
                                tags={tags?.character}
                                title="Character"
                                onTagSelect={onTagSelect}
                            />
                            <ResultSection
                                tags={tags?.rating}
                                title="Ratings"
                                onTagSelect={onTagSelect}
                            />
                            <ResultSection
                                tags={tags?.general}
                                title="General Tags"
                                onTagSelect={onTagSelect}
                            />
                        </View>
                    </>
                ) : null}
            </ScrollView>
            <Portal>
                <TagInfo
                    visible={tagInfoVisible}
                    onDismiss={() => setTagInfoVisible(false)}
                    tag={selectedTag}
                />
                <InferenceConfigurator
                    defaultConfig={inferenceConfig}
                    onChange={(cf) => updateConfig(cf)}
                    visible={configVisible}
                    onDismiss={() => setConfigVisible(false)}
                />
            </Portal>
        </View>
    );
};

export default Main;

const styles = StyleSheet.create({
    container: {
        height: '100%',
    },
});
