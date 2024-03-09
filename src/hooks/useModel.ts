import { useState } from "react";
import { Asset } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { InferenceTags } from "../types";
import { toByteArray } from "react-native-quick-base64";
import { zip } from "../utils";
import { character_names, general_indexes, general_names, rating_indexes, tag_names } from "../constants";

const useModel = () => {
    const [labels, setLabels] = useState<[string, number][]>();
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset>();
    const [session, setSession] = useState<InferenceSession | null>(null);
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState<InferenceTags>();

    const loadModel = async () => {
        setLoading(true);
        const assets = await Asset.loadAsync([require('../../assets/model.quant.preproc.onnx')]);
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
            setImage(result.assets[0]);
        }
    };

    const runInference = async (general_threshold = 0.35, char_threshold = 0.8) => {
        if (session && image?.base64) {
            const image_array = toByteArray(image.base64);
            const inputTensor = new Tensor(image_array, [image_array.length]);
            const feeds = { image: inputTensor };
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
                const general_matches = new_labels.filter(
                    (label) => label[1] > general_threshold && general_names.includes(label[0]),
                );
                const character_matches = new_labels.filter(
                    (label) => label[1] > char_threshold && character_names.includes(label[0]),
                );
                console.log('character matches:', character_matches);
                const infer_tags: InferenceTags = {
                    rating: rating_indexes.map((rt) => ({
                        ...rt,
                        probability: new_labels.find((label) => label[0] === rt.name)?.[1] ?? 0,
                    })),
                    general: general_matches.map((gt) => ({
                        ...(general_indexes.find((gi) => gi.name === gt[0]) ?? {
                            name: gt[0],
                            category: 0,
                            tag_id: 10000002,
                            count: 0,
                        }),
                        probability: gt[1],
                    })),
                    character: character_matches.map((ct) => ({
                        ...(general_indexes.find((ci) => ci.name === ct[0]) ?? {
                            name: ct[0],
                            category: 0,
                            tag_id: 10000002,
                            count: 0,
                        }),
                        probability: ct[1],
                    })),
                    ordered_tags: general_matches
                        .sort((a, b) => b[1] - a[1])
                        .map((label) => label[0].replaceAll('_', ' ')),
                };

                setTags(infer_tags);
            }
        }
    };

    return {
        session,
        image,
        tags,
        loading,
        loadModel,
        unloadModel,
        pickImage,
        runInference,
    };
};

export default useModel;