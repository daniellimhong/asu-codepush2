module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  ignore: ["node_modules/aws-sdk/dist/aws-sdk-react-native.js"],
  env: {
    production: {
      plugins: ["transform-remove-console"]
    }
  }
};
