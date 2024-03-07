import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Button, Linking, StyleSheet, Text, View } from 'react-native';

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

    return (
        <View style={styles.container}>
            

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
