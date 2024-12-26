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

function deepMerge(obj1, obj2) {
  for (let key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (obj2[key] instanceof Object && obj1[key] instanceof Object) {
        obj1[key] = deepMerge(obj1[key], obj2[key]);
      } else if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        obj1[key] = [...obj1[key], ...obj2[key]];
      } else {
        obj1[key] = obj2[key];
      }
    }
  }
  return obj1;
}

const mergedConfig = deepMerge(config, extraConfig);

module.exports = mergedConfig;
