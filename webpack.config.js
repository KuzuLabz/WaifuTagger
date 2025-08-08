const HtmlWebpackPlugin = require('html-webpack-plugin');

const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
	const config = await createExpoWebpackConfigAsync(
		{
			...env,
			babel: {
				dangerouslyAddModulePathsToTranspile: [
					// Ensure that all packages starting with @evanbacon are transpiled.
					'burnt',
				],
			},
			resolve: {
				...env.resolve,
				alias: {
					'react-native$': require.resolve('react-native-web'),
				},
			},
			module: {
				...env.module,
				rules: [
					{
						test: /\.(js|jsx)$/,
						exclude: /node_modules[/\\](?!react-native-vector-icons)/,
						use: {
							loader: 'babel-loader',
							options: {
								// Disable reading babel configuration
								babelrc: false,
								configFile: false,

								// The configuration for compilation
								presets: [
									['@babel/preset-env', { useBuiltIns: 'usage' }],
									'@babel/preset-react',
									'@babel/preset-flow',
									'@babel/preset-typescript',
								],
								plugins: [
									'@babel/plugin-proposal-class-properties',
									'@babel/plugin-proposal-object-rest-spread',
								],
							},
						},
					},
					{
						test: /\.(jpg|png|woff|woff2|eot|ttf|svg)$/,
						type: 'asset/resource',
					},
				],
			},
		},
		argv,
	);
	return config;
};
