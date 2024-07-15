import { withAndroidManifest } from "@expo/config-plugins";
import { ExpoConfig } from "@expo/config-types";

module.exports = function androiManifestPlugin(config: ExpoConfig) {
  return withAndroidManifest(config, async (config) => {
    let androidManifest = config.modResults.manifest;

    // add the tools to apply permission remove
    androidManifest.$ = {
      ...androidManifest.$,
      "xmlns:tools": "http://schemas.android.com/tools",
    };

    // add remove property to the audio record permission
    androidManifest["uses-permission"] = androidManifest["uses-permission"].map(
      (perm) => {
        if (perm.$["android:name"] === "android.permission.RECORD_AUDIO") {
          perm.$["tools:node"] = "remove";
        }
        return perm;
      }
    );

    return config;
  });
};
