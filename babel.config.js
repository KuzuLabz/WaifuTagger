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
		plugins: ["@lingui/babel-plugin-lingui-macro", 'react-native-worklets/plugin'],
	};
};
