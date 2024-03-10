import AsyncStorage from '@react-native-async-storage/async-storage';

export type InferenceConfig = {
    general_threshold: number;
    character_threshold: number;
};

export const defaultConfig: InferenceConfig = {
    general_threshold: 0.35,
    character_threshold: 0.8,
};

export const getConfig = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('my-key');
        if (jsonValue == null) {
            await storeConfig(defaultConfig);
            return defaultConfig;
        } else {
            return JSON.parse(jsonValue) as InferenceConfig;
        }
    } catch (e) {
        // error reading value
        console.log(e);
        return defaultConfig;
    }
};

export const storeConfig = async (config: InferenceConfig) => {
    try {
        const jsonValue = JSON.stringify(config);
        await AsyncStorage.setItem('my-key', jsonValue);
    } catch (e) {
        // saving error
        console.log(e);
    }
};
