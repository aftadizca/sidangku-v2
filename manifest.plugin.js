const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function androiManifestPlugin(config) {
  return withAndroidManifest(config, async (config) => {
    let androidManifest = config.modResults.manifest;

    // add the tools to apply permission remove
    // androidManifest.$ = {
    //   ...androidManifest.$,
    //   "xmlns:tools": "http://schemas.android.com/tools",
    // };

    // add remove property to the audio record permission
    // if (androidManifest["uses-permission"]) {
    //   androidManifest["uses-permission"] = androidManifest[
    //     "uses-permission"
    //   ].map((perm) => {
    //     if (perm.$["android:name"] === "android.permission.VIBRATE") {
    //       perm.$["tools:node"] = "remove";
    //     }
    //     return perm;
    //   });
    // } else {
    //   console.log("no uses-permission");
    // }

    let obj = {
      manifest: {
        $: {
          "xmlns:android": "http://schemas.android.com/apk/res/android",
        },
        "uses-native-library": [
          {
            $: {
              "android:name": "libOpenCL.so",
              "android:required": false,
            },
          },
          {
            $: {
              "android:name": "libOpenCL-pixel",
              "android:required": false,
            },
          },
          {
            $: {
              "android:name": "libGLES_mali.so",
              "android:required": false,
            },
          },
          {
            $: {
              "android:name": "libPVROCL.so",
              "android:required": false,
            },
          },
        ],
      },
    };

    androidManifest["application"][0]["uses-native-library"] =
      obj.manifest["uses-native-library"];

    return config;
  });
};

//  <uses-native-library android:name="libOpenCL.so" android:required="false"/>
//   <uses-native-library android:name="libOpenCL-pixel.so" android:required="false"/>
//   <uses-native-library android:name="libGLES_mali.so" android:required="false"/>
//   <uses-native-library android:name="libPVROCL.so" android:required="false"/>
