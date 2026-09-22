/* eslint-env node */

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const isTauri = process.env.TAURI_BUILD === "true";

if (isTauri) {
  // 1. Tell Metro 'tauri' is a valid platform target
  config.resolver.platforms.push("tauri");

  // 2. Intercept and prioritize '.tauri.xxx' files
  config.resolver.sourceExts = config.resolver.sourceExts.flatMap((ext) => [
    `tauri.${ext}`,
    ext,
    "sql",
  ]);

  console.log("🚀 Metro Bundler: Tauri resolution rules enabled.");
}

config.resolver.assetExts.push(
	// Adds support for `.db` files for SQLite databases
	'onnx',
	'wasm',
);

config.transformer.babelTransformerPath = require.resolve("@lingui/metro-transformer/expo");

config.resolver.sourceExts.push('po', 'pot');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Apply 'browser' condition strictly to Zustand to fix import.meta errors
  if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
    return context.resolveRequest(
      {
        ...context,
        unstable_conditionNames: ['browser', 'require'],
      },
      moduleName,
      platform,
    );
  }

  // Fallback to default Metro resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};


config.resolver.blockList.push(
  /[\\/]target[\\/]/,
  /[\\/]src-tauri[\\/]target[\\/]/,
);

module.exports = config;
