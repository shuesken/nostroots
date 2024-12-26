// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig, mergeConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const myExtraModuleDir = path.resolve(__dirname, "../nr-common/");
const extraNodeModules = {
  "nr-common": myExtraModuleDir,
  zod: path.resolve(myExtraModuleDir, "node_modules/zod"),
};

const extraConfig = {
  watchFolders: [myExtraModuleDir],
  resolver: {
    extraNodeModules: new Proxy(extraNodeModules, {
      get: (target, name) => {
        console.log("Getting");
        console.log(target, name);
        return name in target
          ? target[name]
          : path.join(process.cwd(), `node_modules/${name}`);
      },
      // redirects dependencies referenced from myExtraModule/ to local node_modules
    }),
    nodeModulesPaths: [path.resolve(myExtraModuleDir, "node_modules")],
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
