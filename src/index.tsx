import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import useModel from './hooks/useModel';
import { ActivityIndicator, Button, Headline, ProgressBar, Text } from 'react-native-paper';

const Main = () => {
    const { loadModel, unloadModel, runInference, pickImage, tags, image, session, loading } =
        useModel();
    return (
        <View style={styles.container}>
            {image && (
                <Image
                    // source={{ uri: `data:image/png;base64,${image}` }}
                    source={{ uri: image.uri }}
                    style={{
                        width: undefined,
                        height: 200,
                        aspectRatio: image.width / image.height,
                    }}
                />
            )}
            <Text>Session Status: {session ? 'Available' : 'Unavailable'} </Text>
            <Text> Image Status: {image ? 'loaded' : 'unloaded'} </Text>
            {loading && <ActivityIndicator size="large" />}
            {session ? (
                <Button onPress={unloadModel}>Unload Model</Button>
            ) : (
                <Button onPress={loadModel}>Load Model</Button>
            )}

            <Button onPress={pickImage}>Pick Image</Button>

            <Button onPress={() => runInference(0.35, 0.5)}>Predict</Button>
            {/* <View style={{alignSelf:'flex-start'}}>
                    <Headline>General</Headline>
                    <PercentageBar progress={0.6} />
                </View> */}
            {tags ? (
                <View>
                    {/* <Text>General: {(tags.rating[0].probability * 100).toFixed(2)}%</Text> */}
                    <Headline> General: {(tags.rating[0].probability * 100).toFixed(0)}% </Headline>
                    <ProgressBar progress={tags.rating[0].probability} />

                    <Headline>
                        Sensitive: {(tags.rating[1].probability * 100).toFixed(0)}%{' '}
                    </Headline>
                    <ProgressBar progress={tags.rating[1].probability} />

                    <Headline>
                        Questionable: {(tags.rating[2].probability * 100).toFixed(0)}%{' '}
                    </Headline>
                    <ProgressBar progress={tags.rating[2].probability} />

                    <Headline>Explicit: {(tags.rating[3].probability * 100).toFixed(0)}% </Headline>
                    <ProgressBar progress={tags.rating[3].probability} />
                    {/* <Text>Sensitive: {(tags.rating[1].probability * 100).toFixed(2)}%</Text>
                        <Text>Questionable: {(tags.rating[2].probability * 100).toFixed(2)}%</Text>
                        <Text>Explicit: {(tags.rating[3].probability * 100).toFixed(2)}%</Text> */}
                    <Text>
                        {tags.character[0]?.name ?? 'Character unknown'}{' '}
                        {tags.character[0]
                            ? (tags.character[0]?.probability * 100).toFixed(2) + ' %'
                            : ''}
                    </Text>
                    <Text> {'\n' + tags.ordered_tags?.join(', ') ?? ''} </Text>
                </View>
            ) : null}
        </View>
    );
};

export default Main;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
