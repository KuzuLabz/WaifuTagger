import { Buffer } from 'buffer';
import { Asset } from 'expo-asset';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import { manipulateAsync, FlipType, SaveFormat, ImageResult } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, Button, Linking, PixelRatio, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

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
    const [session, setSession] = useState<InferenceSession | null>(null);
    const [loading, setLoading] = useState(false);

    const loadModel = async () => {
        setLoading(true);
        const assets = await Asset.loadAsync([require('./assets/model.onnx')]);
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

    return {
        session,
        loading,
        loadModel,
        unloadModel,
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
    const inputImageRef = useRef<View>(null);
    const [image, setImage] = useState<ImageResult>();
    const [imageUri, setImageUri] = useState<string>();
    const [imgb64, setImgb64] = useState<string>('');
    const [labels, setLabels] = useState<[string, number][]>();
    const { loadModel, unloadModel, session, loading } = useModel();

    const resizeImage = async (uri: string) => {
        // const manipResult = await manipulateAsync(uri, [{ resize: { width: 448, height: 448 } }], {
        //     compress: 1,
        //     format: SaveFormat.PNG,
        //     base64: true,
        // });
        const pixelRatio = PixelRatio.get(); // The pixel ratio of the device
        // pixels * pixelratio = targetPixelCount, so pixels = targetPixelCount / pixelRatio
        const pixels = 448 / pixelRatio;
        const result = await captureRef(inputImageRef, {
            format: 'png',
            quality: 1,
            height: pixels,
            width: pixels,
        });
        if (result) {
            setImageUri(result);
        }
        // setImage(manipResult);
        // if (result) {
        //     setImgb64(manipResult?.base64);
        // }
    };

    const pickImage = async () => {
        // const result = await ImagePicker.launchImageLibraryAsync({
        //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
        //     base64: true,
        //     selectionLimit: 1,
        // });
        const result = await Asset.loadAsync([require('./assets/power.jpg')]);
        if (result[0]?.localUri) {
            resizeImage(result[0]?.localUri);
        }
    };

    const inferenceImage = async () => {
        if (session && imgb64) {
            const bytes = Buffer.from(imgb64, 'base64');
            const inputData = new Float32Array(448 * 448 * 3);
            for (let i = 0, len = bytes.length; i < len; i += 4) {
                inputData[i / 4] = bytes[i + 3] / 255;
            }
            const inputTensor = new Tensor('float32', inputData, [1, 448, 448, 3]);
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
                );
                // labels = list(zip(self.tag_names, preds[0].astype(float)))
                const new_labels: [string, number][] = zip([tag_names, output.data]);
                setLabels(new_labels);
                console.log('test:', new_labels[0]);
                console.log('characters:', character_names.length);
                const character_matches = new_labels.find(
                    (label) => label[0] === 'power_(chainsaw_man)',
                );
                console.log('character matches:', character_matches);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text>Session Status: {session ? 'Available' : 'Unavailable'}</Text>
            <Text>Image Status: {imageUri ? 'loaded' : 'unloaded'}</Text>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            <Button title="Load Model" onPress={loadModel} />
            <Button title="Unload Model" onPress={unloadModel} />
            <Button title="Pick Image" onPress={pickImage} />
            {/* {image && (
                <Image
                    source={{ uri: image?.uri }}
                    style={{
                        width: 200,
                        height: undefined,
                        aspectRatio: image?.width / image?.height,
                    }}
                />
            )} */}
            <Button title="Inference Image" onPress={inferenceImage} />
            {labels ? (
                <View>
                    <Text>General: {(labels[0][1] * 100).toFixed(2)}%</Text>
                    <Text>Sensitive: {(labels[1][1] * 100).toFixed(2)}%</Text>
                    <Text>Questionable: {(labels[2][1] * 100).toFixed(2)}%</Text>
                    <Text>Explicit: {(labels[3][1] * 100).toFixed(2)}%</Text>
                </View>
            ) : null}

            {image && (
                <View
                ref={inputImageRef}
                    style={{
                        height: 448,
                        width: 448,
                        position: 'absolute',
                        backgroundColor: '#FFF',
                        bottom: 500,
                        alignSelf: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Image
                        source={{ uri: image?.uri }}
                        style={{ width: '100%', height: 448 }}
                        contentFit="contain"
                    />
                </View>
            )}
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
