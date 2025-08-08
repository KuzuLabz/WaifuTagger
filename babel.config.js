module.exports = function (api) {
	api.cache(true);
	return {
		presets: [
			[
				'babel-preset-expo',
				{
					unstable_transformImportMeta: true,
				},
			],
		],
		plugins: ['@babel/plugin-proposal-export-namespace-from', 'react-native-reanimated/plugin'],
	};
};
