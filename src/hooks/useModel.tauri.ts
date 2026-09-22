import { useEffect, useState } from 'react';
import { InferenceTags } from '../types';
import { useSettingsStore } from '../store/settings';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { useImageStore } from '../store/image';
import SessionManager from '../onnx';
import { useModelsStore } from '../store/models';

interface ModelStatus {
  is_loading: boolean;
  is_loaded: boolean;
}

const useModel = () => {
    const preferGpu = useSettingsStore(state => state.preferGpu);
	const autoInfer = useSettingsStore(state => state.autoInfer);

    const imageHash = useImageStore(state => state.image.hash);
    const currentHash = useImageStore(state => state.currentHash);
    const selected = useModelsStore(state => state.selected);

	const [loading, setLoading] = useState(true);
	const [isInferLoading, setIsInferLoading] = useState(false);
	const [tags, setTags] = useState<InferenceTags | null>();

    const loadModel = async (gpu?: boolean) => {
        try {
            if (selected) {
                setLoading(true);
                await SessionManager.loadModel(selected, gpu);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

	const runInference = async () => {
        if (loading || isInferLoading || !SessionManager.isLoaded) return;
        
        setIsInferLoading(true);
        useImageStore.getState().setCurrentHash();
        const infTags = await SessionManager.classify();
        if (infTags) {
            setTags(infTags);
        }
        setIsInferLoading(false);
	};

	useEffect(() => {
        if (autoInfer && imageHash && imageHash !== currentHash && !isInferLoading) {
            runInference();
        }
    }, [autoInfer, imageHash, currentHash, loading]);

	useEffect(() => {
        let unsubscribe: UnlistenFn;
        const createUnsubscribe = async () => {
            unsubscribe = await listen<ModelStatus>('model-status', (event) => {
                if (event.payload.is_loaded) {
                    setLoading(false);
                }
                
            })
        };

		createUnsubscribe();
        loadModel(preferGpu);

        return () => {
            unsubscribe?.();
        }
	}, [selected, preferGpu]);

	return {
		tags,
		loading,
		isInferLoading,
		runInference,
	};
};

export default useModel;
