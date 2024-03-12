import { getDefaultConfig } from 'expo/metro-config';

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
	// Adds support for `.db` files for SQLite databases
	'onnx',
);

export default config;
