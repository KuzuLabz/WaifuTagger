/* eslint-disable @typescript-eslint/no-var-requires */
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
	// Adds support for `.db` files for SQLite databases
	'onnx',
);

module.exports = config;
