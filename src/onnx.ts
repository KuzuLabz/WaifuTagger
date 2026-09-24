import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { SelectedModel, useModelsStore } from './store/models';
import { Platform } from 'react-native';
import { SessionOptions } from 'onnxruntime-react-native/dist/typescript/api';
import { useImageStore } from './store/image';
import { loadImage } from 'react-native-nitro-image';
import { t } from '@lingui/core/macro';
import { parseResults } from './utils/parse';
import { useStatsStore } from './store/stats';
import { downloadTags, getModelUri } from './utils/fs';
import { RawTags } from './types';
import { File } from 'expo-file-system';
import { PixelFormat } from 'react-native-nitro-image/lib/typescript/specs/Image.nitro';
import { router } from 'expo-router';
import { getModelKey } from './utils/utils';
import { sendToast } from './utils/toast';

function prepareImageBufferForONNX(
  pixelArray: Uint8Array,
  format: PixelFormat,
  numPixels: number
): Uint8Array {
    const rgb = new Uint8Array(numPixels * 3);

    const hasAlpha =
    format === 'BGRA' ||
    format === 'RGBA' ||
    format === 'ABGR' ||
    format === 'ARGB' ||
    format === 'BGRX' ||
    format === 'RGBX' ||
    format === 'XBGR' ||
    format === 'XRGB';

    const srcStride = hasAlpha ? 4 : 3;

    for (let i = 0; i < numPixels; i++) {
    const s = i * srcStride;
    const d = i * 3;

    switch (format) {
        case 'BGRA':
        case 'BGRX':
        rgb[d]     = pixelArray[s + 2]; // R
        rgb[d + 1] = pixelArray[s + 1]; // G
        rgb[d + 2] = pixelArray[s];     // B
        break;

        case 'RGBA':
        case 'RGBX':
        rgb[d]     = pixelArray[s];     // R
        rgb[d + 1] = pixelArray[s + 1]; // G
        rgb[d + 2] = pixelArray[s + 2]; // B
        break;

        case 'ABGR':
        case 'XBGR':
        rgb[d]     = pixelArray[s + 3]; // R
        rgb[d + 1] = pixelArray[s + 2]; // G
        rgb[d + 2] = pixelArray[s + 1]; // B
        break;

        case 'ARGB':
        case 'XRGB':
        rgb[d]     = pixelArray[s + 1]; // R
        rgb[d + 1] = pixelArray[s + 2]; // G
        rgb[d + 2] = pixelArray[s + 3]; // B
        break;

        case 'BGR':
        rgb[d]     = pixelArray[s + 2];
        rgb[d + 1] = pixelArray[s + 1];
        rgb[d + 2] = pixelArray[s];
        break;

        case 'RGB':
        default:
        rgb[d]     = pixelArray[s];
        rgb[d + 1] = pixelArray[s + 1];
        rgb[d + 2] = pixelArray[s + 2];
        break;
    }
    }

    return rgb;
}

const executionProviders = Platform.select<SessionOptions['executionProviders']>({android: ['nnapi', 'xnnpack', 'cpu'], ios: ['coreml', 'xnnpack', 'cpu']});

class SessionManager {
    public isLoaded: boolean = false;
    private session: InferenceSession | null = null;
    private currentType: SelectedModel = null;
    private tags: RawTags =  null;

    async loadModel(selected: SelectedModel, gpu: boolean = false) {
        if (selected === null) {
            return;
        }
        try {
            const modelKey = getModelKey(selected);
            const store = useModelsStore.getState();
            const isDownloaded = store.downloaded[modelKey];
            const { model: modelUri, tags: tagsUri } = await getModelUri(modelKey, store.modelsDir,);
            const modelFile = new File(modelUri);
            let tagFile = new File(tagsUri);

            if (!isDownloaded || !modelFile.exists) {
                sendToast({title: t`Model not found!`, preset: 'error'});
                router.replace('/models');
                return;
            }

            if (this.currentType?.type === selected.type && this.currentType?.variant === selected.variant && this.session) {
                return;
            }

            if (this.session) {
                await this.releaseSession();
            }

            // Load tags
            if (!tagFile.exists) {
                await downloadTags(selected.type, store.modelsDir);
            }
            this.tags = await tagFile.json();

            this.session = await InferenceSession.create(modelUri, { executionProviders: executionProviders, graphOptimizationLevel: 'disabled' });
            this.currentType = selected;
            this.isLoaded = true;
            useImageStore.setState({currentHash: undefined});
        } catch (e) {
            console.warn(e);
            await this.releaseSession();
            sendToast({title: t`Model is too large for this device.`});
            this.currentType = null;
            useModelsStore.setState({selected: null});
        }
    };

    async classify() {
        const image = useImageStore.getState().image;
        if (!this.currentType || !image?.uri) {
            return null;
        }

        if (!this.session) {
            return null;
        }

        try {
            const imageResponse = await loadImage({url: image.uri});
            const pixelData = await imageResponse.toRawPixelDataAsync(false);
            const numPixels = pixelData.width * pixelData.height;

            const tensor = new Tensor('uint8', prepareImageBufferForONNX(new Uint8Array(pixelData.buffer), pixelData.pixelFormat, numPixels), [1, pixelData.height, pixelData.width, 3]);
            const feeds: Record<string, Tensor> = { [this.session.inputNames[0]]: tensor };

            const results = await this.session.run(feeds);

            const outputName = this.session.outputNames[0]
            const logits = results[outputName].data as Float32Array;
            const selectedCandidates = this.currentType.type === 'camie-tagger-v2' ? results['selected_candidates'].data as BigInt64Array : undefined;
            
            if (logits) {
                const tags = parseResults(this.tags, logits, selectedCandidates);
                useImageStore.getState().setCurrentHash();
                useStatsStore.getState().addXp(tags.rank.rank);
                return tags;
            } else {
                sendToast({ title: t`Failed to inference!`, preset: 'error'});
                return null;
            }
        } catch (e) {
            console.warn(e);
        }
    }

    async releaseSession() {
        await this.session?.release();
        this.session = null;
        this.currentType = null;
        this.isLoaded = false;
    }
};

export default new SessionManager();