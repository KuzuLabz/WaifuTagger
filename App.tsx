import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Button, Linking, StyleSheet, Text, View } from 'react-native';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

// load a model
// const session: InferenceSession = await InferenceSession.create(modelPath);
// input as InferenceSession.OnnxValueMapType
// const result = session.run(input, ['num_detection:0', 'detection_classes:0'])

const getImageBuffer = async (uri: string): Promise<Float32Array | undefined> => {
    try {
        console.log('Reading file from uri: ', uri);
        const response = await fetch(uri);
        const imageDataArrayBuffer = await response.arrayBuffer();
        const fileContent = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        const buffer = Buffer.from(fileContent, 'base64');
        const float32img = Float32Array.from(buffer);

        return float32img;
    } catch (error) {
        console.error(error);
        // return new Float32Array();
    }
};

export default function App() {
    const [image_uri, setImageUri] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [session, setSession] = useState<InferenceSession | null>(null);
    const [modelUri, setModelUri] = useState<string | null>(null);

    const [isLoadingModel, setIsLoadingModel] = useState(false);

    const pickImage = async () => {
        try {
            const image = await ImagePicker.launchImageLibraryAsync({
                selectionLimit: 1,
            });
            if (image.assets) {
                setImageUri(image.assets[0]);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const unloadModel = async () => {
        if (session) {
            await session.release();
            console.log('released!');
        }
    };

    const runInference = async (session: InferenceSession) => {
        if (session && image_uri) {
            const input_name = session.inputNames[0];
            const label_name = session.outputNames[0];
            console.log('Input:', input_name);
            console.log('Output:', label_name);
            // const input: InferenceSession.OnnxValueMapType = {
            //     [input_name]: new Tensor('float32', [1, 3, 224, 224]),
            // };

            // const preds = await session.run(input);
        }
    };

    const loadModel = async (uri: string) => {
        if (modelUri) {
            setIsLoadingModel(true);
            try {
                const session = await InferenceSession.create(uri);
                setSession(session);
            } catch (error) {
                console.error(error);
            }
            setIsLoadingModel(false);
        }
    };

    const pickModel = async () => {
        const model = await DocumentPicker.getDocumentAsync({ multiple: false });
        if (model.assets) {
            setModelUri(model.assets[0].uri);
            loadModel(model.assets[0].uri);
        } else {
            return null;
        }
    };

    return (
        <View style={styles.container}>
            <Button
                title="Download Model"
                onPress={() =>
                    Linking.openURL(
                        'https://huggingface.co/SmilingWolf/wd-convnext-tagger-v3/tree/main',
                    )
                }
            />
            {/* <Button title="Pick Model" onPress={pickModel} />
            {isLoadingModel ? <ActivityIndicator /> : null}

            <Text>{session ? 'Model is Loaded!' : 'Model not loaded!'}</Text>

            <Button title="Pick an image" onPress={pickImage} />

            <Button title="Unload Model" onPress={unloadModel} /> */}

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
