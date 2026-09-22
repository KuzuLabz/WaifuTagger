import { SelectedModel, useModelsStore } from './store/models';
import { useImageStore } from './store/image';
import { t } from '@lingui/core/macro';
import { parseResults } from './utils/parse';
import { useStatsStore } from './store/stats';
import { RawTags } from './types';
import { getModelKey } from './utils/utils';
import { router } from 'expo-router';
import { getTagsData, loadModel as loadModelNative, runInference, unloadModel } from './utils/commands';
import { getModelUri } from './utils/fs';
import { sendToast } from './utils/toast';
import { useSettingsStore } from './store/settings';

class SessionManager {
    public isLoaded: boolean = false;
    private currentType: SelectedModel = null;
    private tags: RawTags =  null;

    async loadModel(selected: SelectedModel, gpu: boolean = false) {
        if (selected === null) {
            this.currentType = null;
            this.tags === null;
            return;
        }

        const modelKey = getModelKey(selected);
        const store = useModelsStore.getState();
        const isDownloaded = store.downloaded[modelKey];

        if (!isDownloaded) {
            sendToast({title: t`Model not found!`, preset: 'error'});
            router.replace('/models');
            return;
        }

        if (this.isLoaded) {
            await this.releaseSession();
        }

        try {
            const path = await getModelUri(modelKey, store.modelsDir);
            if (this.currentType?.type !== selected.type) {
                this.tags = await getTagsData(selected.type, store.modelsDir);
            } 
            const executionProvider = await loadModelNative(selected.type, path.model, store.modelsDir, gpu);
            useSettingsStore.setState({executionProvider});
            this.currentType = selected;
            this.isLoaded = true;
        } catch (error) {
            console.warn(error);
            sendToast({title: 'Model failed to load!', preset: 'error'});
            useModelsStore.setState({selected: null});
            router.replace('/models');
        }
    };

    async classify() {
        if (!this.isLoaded) {
            sendToast({title: 'Model is not loaded!', preset: 'error'});
            return null;
        }

        if (!this.currentType) {
            return null;
        }

        const image = useImageStore.getState().image;
        const imageResponse = await fetch(image.uri);
        const imageBytes = await imageResponse.arrayBuffer();
        
        try {
            const rawBytesResponse = await runInference(new Uint8Array(imageBytes));
            const rawBytes = new Uint8Array(rawBytesResponse);
            const view = new DataView(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);
            
            const candidateCount = view.getUint32(0, true);

            let selectedCandidates: BigInt64Array | undefined = undefined;
            let offset = 4;

            if (candidateCount > 0) {
                const candidateByteLength = candidateCount * 8;
                
                const candidateBuffer = rawBytes.buffer.slice(
                    rawBytes.byteOffset + offset,
                    rawBytes.byteOffset + offset + candidateByteLength
                );
                selectedCandidates = new BigInt64Array(candidateBuffer);
                offset += candidateByteLength;
            }

            const logitsBuffer = rawBytes.buffer.slice(rawBytes.byteOffset + offset);
            const logits = new Float32Array(logitsBuffer);
            
            if (logits) {
                const tags = parseResults(this.tags, logits, selectedCandidates);
                if (tags?.rank) {
                    useStatsStore.getState().addXp(tags.rank.rank);
                }
                return tags;
            } else {
                sendToast({ title: t`Failed to inference!`, preset: 'error'});
                return null;
            }
        } catch (e) {
            console.warn(e);
            sendToast({ title: t`Failed to inference!`, preset: 'error'});
            return null;
        };
    }

    async releaseSession() {
        await unloadModel();
        this.isLoaded = false;
        this.currentType = null;
    }
};

export default new SessionManager();