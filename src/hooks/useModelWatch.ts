import { UnwatchFn, watch } from '@tauri-apps/plugin-fs';
import { useEffect } from 'react';
import { useModelsStore } from '../store/models';
import { getBaseDir } from '../utils/commands';
import { getModelKey, getTypeVariantFromPath } from '../utils/utils';
import { MODEL_CATALOG } from '../constants';

export const useModelWatch = () => {
    const modelsDir = useModelsStore(state => state.modelsDir);
    const updateDownloaded = useModelsStore(state => state.updateDownloaded);
    const removeModelType = useModelsStore(state => state.removeModelType);

    useEffect(() => {
        let unWatch: UnwatchFn;
        const createUnWatch = async () => {
            const baseDir = await getBaseDir(modelsDir);
            unWatch = await watch(baseDir, (event) => {
                if (typeof event.type !== 'string' && 'remove' in event.type && MODEL_CATALOG) {
                    const uri = event.paths[0];
                    getTypeVariantFromPath(uri).then(({type, variant}) => {
                        if (variant) {
                            updateDownloaded(getModelKey({type, variant}), false);
                        } else {
                            removeModelType(type);
                        }
                    });
                }
            }, {recursive: true});
        };

        createUnWatch();

        return () => {
            unWatch?.();
        }
    },[modelsDir])
};