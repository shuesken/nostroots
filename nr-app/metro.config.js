// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const extraConfig = {
  watchFolders: [path.resolve(`${__dirname}/../nr-common/`)],
  resolver: {
    // extraNodeModules: { "nr-common": `${__dirname}/../nr-common/nr-common` },
    enableGlobalPackages: true,
  },
  resetCache: true,
};

const mergedConfig = { ...config, ...extraConfig };

module.exports = mergedConfig;
