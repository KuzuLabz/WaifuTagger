import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Button, Linking, StyleSheet, Text, View } from 'react-native';
import { useTensorflowModel, Tensor } from 'react-native-fast-tflite';

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
    // const [isLoadingModel, setIsLoadingModel] = useState(false);
    const { model, state } = useTensorflowModel(require('./assets/model_float16.tflite'));

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


    const runInference = async () => {
        if (state === 'loaded') {
            // model.inputs.forEach(())
            console.log(model.inputs);
            // const input = await getImageBuffer(image_uri?.uri);
            // if (input) {
            //     const tensor = new Tensor('float32', input, [1, 224, 224, 3]);
            //     const result = await session.run([tensor]);
            //     console.log(result);
            // }
        }
    };

    return (
        <View style={styles.container}>
            {/* <Button
                title="Download Model"
                onPress={() =>
                    Linking.openURL(
                        'https://huggingface.co/SmilingWolf/wd-convnext-tagger-v3/tree/main',
                    )
                }
            /> */}

            <Text>State: {state}</Text>

            <Button title="Pick an image" onPress={pickImage} />

            <Button title="Run Inference" onPress={runInference} />

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
