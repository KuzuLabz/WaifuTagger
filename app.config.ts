import { ExpoConfig, ConfigContext } from 'expo/config';
const IS_DEV = process.env.APP_VARIANT === 'development';
// const IS_DEV = true;
const IS_STORE = process.env.APP_VARIANT === 'store';

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	owner: 'kuzulabz',
	name: IS_DEV ? 'WaifuTagger Dev' : 'WaifuTagger',
	slug: 'WaifuDetector',
	scheme: IS_DEV ? 'waifutaggerdev' : 'waifutagger',
	version: '2.1.0',
	orientation: 'portrait',
	icon: './assets/icon.png',
	userInterfaceStyle: 'automatic',
	backgroundColor: '#000',
	platforms: ['android', 'ios', 'web'],
	assetBundlePatterns: ['assets/models/*', 'assets/*'],
	plugins: [
		'onnxruntime-react-native',
		'expo-asset',
        'expo-image',
        'expo-status-bar',
		'expo-web-browser',
        'expo-localization',
		[
			'expo-share-intent',
			{
				androidIntentFilters: ['image/png', 'image/jpg', 'image/jpeg'],
			},
		],
		[
			'expo-build-properties',
			{
				ios: {
					useFrameworks: 'static',
					deploymentTarget: '17.0',
				},
				android: {
					useLegacyPackaging: true,
					// enableProguardInReleaseBuilds: true, // this will crash the app on inference :(
				},
			},
		],
		[
			'expo-updates',
			{
				username: 'kuzulabz',
			},
		],
        [
            'expo-splash-screen',
            {
                "backgroundColor": "#232323",
                "image": './assets/splash.png',
                "dark": {
                    "backgroundColor": "#000000"
                },
                "imageWidth": 200
            }
        ]
	],
	ios: {
		supportsTablet: true,
	},
	android: {
		adaptiveIcon: {
			foregroundImage: './assets/adaptive-icon.png',
			backgroundColor: '#000',
		},
		versionCode: 4,
		package: IS_DEV ? 'com.kuzulabz.WaifuTaggerDev' : 'com.kuzulabz.WaifuTagger',
	},
	web: {
		favicon: './assets/favicon.png',
		bundler: 'webpack',
	},
	extra: {
		eas: {
			projectId: '3cb39eec-898a-4a8e-a82d-fe95c9d7dfc2',
		},
		isStore: IS_STORE,
	},
});
