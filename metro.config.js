/* eslint-env node */

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
	// Adds support for `.db` files for SQLite databases
	'onnx',
	'wasm',
);

config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
