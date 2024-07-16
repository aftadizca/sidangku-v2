const { withGradleProperties } = require("@expo/config-plugins");

module.exports = function androidGradlePlugin(config) {
  return withGradleProperties(config, async (config) => {
    let androidGradle = config.modResults;
    androidGradle = androidGradle.map((x) => {
      if (x.key === "reactNativeArchitectures") {
        x.value = "arm64-v8a";
      }
    });
    return config;
  });
};
