import { useEffect, useState } from 'react';
import { InferenceTags } from '../types';
import { ResolvedSharePayload, useIncomingShare, clearSharedPayloads } from 'expo-sharing';
import { useSettingsStore } from '../store/settings';
import { useImageStore } from '../store/image';
import { ImageController } from '../utils/selector';
import { useModelsStore } from '../store/models';
import SessionManager from '../onnx';

const useModel = () => {
	const { resolvedSharedPayloads } = useIncomingShare();

	const autoInfer = useSettingsStore(state => state.autoInfer);

    const imageHash = useImageStore(state => state.image?.hash);
    const imageUri = useImageStore(state => state.image?.uri);
    const currentHash = useImageStore(state => state.currentHash);

    const selected = useModelsStore(state => state.selected);
    
	const [loading, setLoading] = useState(true);
	const [isInferLoading, setIsInferLoading] = useState(false);
	const [tags, setTags] = useState<InferenceTags | null>();
    

    const loadModel = async () => {
        try {
            if (selected) {
                setLoading(true);
                await SessionManager.loadModel(selected);
            }
        } catch (e) {
            console.error(e);
        }
		setLoading(false);
	};

    const runInference = async () => {
        setIsInferLoading(true);
        const infTags = await SessionManager.classify();
        if (infTags) {
            setTags(infTags);
        }
        setIsInferLoading(false);
    };

	const handleShareIntent = async (payload?: ResolvedSharePayload) => {
        if (payload && payload.shareType === 'image') {
            await ImageController.fromIntent(payload.contentUri);
        }
        clearSharedPayloads();
	};

    useEffect(() => {
        if (resolvedSharedPayloads[0] && resolvedSharedPayloads[0].contentType === 'image') {
            handleShareIntent(resolvedSharedPayloads[0]);
        }
    },[resolvedSharedPayloads])

	useEffect(() => {
		if (autoInfer && imageUri && imageHash !== currentHash) {
			runInference();
		}
	}, [autoInfer, imageHash, imageUri, currentHash]);

    useEffect(() => {
        loadModel();
    },[selected])

	return {
		tags,
		loading,
		isInferLoading,
		runInference,
	};
};

export default useModel;
