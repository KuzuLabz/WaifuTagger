import { ExpoConfig, ConfigContext } from 'expo/config';
const IS_DEV = process.env.APP_VARIANT === 'development';

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: IS_DEV ? 'WaifuTagger Dev' : 'WaifuTagger',
	slug: 'WaifuTagger',
	version: '1.0.0',
	orientation: 'portrait',
	icon: './assets/icon.png',
	userInterfaceStyle: 'automatic',
	backgroundColor: '#000',
	splash: {
		image: './assets/splash.png',
		resizeMode: 'contain',
		backgroundColor: '#000',
	},
	assetBundlePatterns: ['**/*'],
	plugins: [
		'onnxruntime-react-native',
		[
			'expo-build-properties',
			{
				ios: {
					useFrameworks: 'static',
					deploymentTarget: '17.0',
				},
				android: {
					useLegacyPackaging: true,
				},
			},
		],
	],
	ios: {
		supportsTablet: true,
	},
	android: {
		adaptiveIcon: {
			foregroundImage: './assets/adaptive-icon.png',
			backgroundColor: '#000',
		},
		package: IS_DEV ? 'com.kuzulabz.WaifuTaggerDev' : 'com.kuzulabz.WaifuTagger',
	},
	web: {
		favicon: './assets/favicon.png',
	},
	extra: {
		eas: {
			projectId: '3cb39eec-898a-4a8e-a82d-fe95c9d7dfc2',
		},
	},
});