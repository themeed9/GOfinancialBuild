// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web build (used only for browser previews) ships a .wasm file.
config.resolver.assetExts.push('wasm');

module.exports = config;
