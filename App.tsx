import { Asset } from 'expo-asset';
// import * as DocumentPicker from 'expo-document-picker';
// import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { toByteArray } from 'react-native-quick-base64';

import tags from './assets/tags.json';

// load a model
// const session: InferenceSession = await InferenceSession.create(modelPath);
// input as InferenceSession.OnnxValueMapType
// const result = session.run(input, ['num_detection:0', 'detection_classes:0'])

const rating_indexes = tags.filter((tag) => tag.category === 9);
const general_indexes = tags.filter((tag) => tag.category === 0);
const character_indexes = tags.filter((tag) => tag.category === 4);
const tag_names = tags.map((tag) => tag.name);
const character_names = character_indexes.map((tag) => tag.name);
const general_names = general_indexes.map((tag) => tag.name);

const useModel = () => {
    const [labels, setLabels] = useState<[string, number][]>();
    const [image, setImage] = useState<string>();
    const [session, setSession] = useState<InferenceSession | null>(null);
    const [loading, setLoading] = useState(false);

    const loadModel = async () => {
        setLoading(true);
        const assets = await Asset.loadAsync([require('./assets/model.quant.preproc.onnx')]);
        if (assets[0] && assets[0].localUri) {
            try {
                console.log('loading');
                const model: InferenceSession = await InferenceSession.create(assets[0].localUri);
                setSession(model);
                console.log('model loaded');
            } catch (e) {
                console.error(e);
            }
        }
        setLoading(false);
    };

    const unloadModel = async () => {
        try {
            await session?.release();
            setSession(null);
        } catch (e) {
            console.error(e);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
            quality: 1,
            selectionLimit: 1,
        });
        // const result = await Asset.loadAsync([require('./assets/power.jpg')]);
        if (result.assets && result.assets[0]?.base64) {
            // resizeImage(result[0]?.localUri);
            setImage(result.assets[0]?.base64);
        }
    };

    const runInference = async () => {
        if (session && image) {
            const image_array = toByteArray(image);
            const inputTensor = new Tensor(image_array, [image_array.length]);
            const feeds = { input: inputTensor };
            const fetches = await session?.run(feeds);
            const output = fetches[session.outputNames[0]];

            if (!output) {
                // Alert.alert('failed to get output', `${model.outputNames[0]}`);
                console.log('Failed to get output', `${session.outputNames[0]}`);
            } else {
                // Alert.alert(
                //   'model inference successfully',
                //   `output shape: ${output.dims}, output data: ${output.data}`);
                console.log(
                    'Model inference successfully',
                    `OutputName: ${session.outputNames[0]}`,
                    `output shape: ${output.dims}`,
                    `first output: ${output.data[0]}`,
                );
                // labels = list(zip(self.tag_names, preds[0].astype(float)))
                const new_labels: [string, number][] = zip([tag_names, output.data]);
                setLabels(new_labels);
                console.log('test:', new_labels[0]);
                console.log('characters:', character_names.length);
                const character_matches = new_labels.filter((label) => label[1] > 0.5);
                console.log('character matches:', character_matches);
            }
        }
    };

    return {
        session,
        image,
        labels,
        loading,
        loadModel,
        unloadModel,
        pickImage,
        runInference,
    };
};

function zip(arrays: any[]) {
    return arrays[0].map(function (_: any, i: string | number) {
        return arrays.map(function (array) {
            return array[i];
        });
    });
}

export default function App() {
    const { loadModel, unloadModel, runInference, pickImage, labels, image, session, loading } = useModel();

    return (
        <View style={styles.container}>
            <Text>Session Status: {session ? 'Available' : 'Unavailable'}</Text>
            <Text>Image Status: {image ? 'loaded' : 'unloaded'}</Text>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            <Button title="Load Model" onPress={loadModel} />
            <Button title="Unload Model" onPress={unloadModel} />
            <Button title="Pick Image" onPress={pickImage} />
            {image && (
                <Image
                    source={{ uri: `data:image/png;base64,${image}` }}
                    style={{
                        width: undefined,
                        height: 200,
                        aspectRatio: 1,
                    }}
                />
            )}
            <Button title="Inference Image" onPress={runInference} />
            {labels ? (
                <View>
                    <Text>General: {(labels[0][1] * 100).toFixed(2)}%</Text>
                    <Text>Sensitive: {(labels[1][1] * 100).toFixed(2)}%</Text>
                    <Text>Questionable: {(labels[2][1] * 100).toFixed(2)}%</Text>
                    <Text>Explicit: {(labels[3][1] * 100).toFixed(2)}%</Text>
                    <Text>hatsune miku: {labels.find((label) => label[0] === 'hatsune miku')}</Text>
                </View>
            ) : null}
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#363636',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
