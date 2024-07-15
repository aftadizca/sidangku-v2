import {
  Camera,
  CameraPermissionRequestResult,
  runAtTargetFps,
  useCameraDevice,
  useFrameProcessor,
  useSkiaFrameProcessor,
} from "react-native-vision-camera";
import { useState, createRef, useEffect } from "react";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { Box, Text, Button } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { useSharedValue } from "react-native-reanimated";
import {
  TensorflowModel,
  TensorflowPlugin,
  loadTensorflowModel,
  useTensorflowModel,
} from "react-native-fast-tflite";

import { Asset, useAssets } from "expo-asset";
import { useResizePlugin } from "vision-camera-resize-plugin";
import { Skia, useFont } from "@shopify/react-native-skia";

export default function CameraPage() {
  const wayang = {
    "0": "Arjuna",
    "1": "Bima",
    "2": "Yudistira",
    "3": "Nakula/Sadewa",
  };

  const emojiFont = useFont(
    require("../assets/fonts/SpaceMono-Regular.ttf"),
    18
  );

  const [permission, setPermission] =
    useState<CameraPermissionRequestResult>("denied");
  const device = useCameraDevice("back");
  const [model, setModel] = useState("");
  const [tfLite, setTFLite] = useState<TensorflowModel>();

  // const nameWayang = useSharedValue("");

  const { resize } = useResizePlugin();

  const frameProcessor = useSkiaFrameProcessor(
    (frame) => {
      "worklet";

      if (!tfLite) return;
      if (emojiFont === null) return;

      const frameWidth = frame.width - 40;
      const frameHeight = frame.height / 2;

      frame.render();
      const paint = Skia.Paint();
      paint.setColor(Skia.Color("red"));

      // runAtTargetFps(1, () => {
      //   "worklet";

      const resized = resize(frame, {
        scale: {
          width: 128,
          height: 128,
        },
        pixelFormat: "rgb",
        dataType: "float32",
      });
      const outputs = tfLite.runSync([resized]);

      frame.rotate(270, frameWidth, frameHeight);

      for (let key in outputs[0]) {
        if (outputs[0][key] > 0.8 && key !== "4") {
          frame.drawText(
            wayang[key as keyof typeof wayang],
            frameWidth,
            frameHeight,
            paint,
            emojiFont
          );

          console.log(
            wayang[key as keyof typeof wayang] + ": " + outputs[0][key]
          );
        }
      }
      // });
      // console.log(frameWidth, frameHeight);

      // console.log("font ready");
    },
    [tfLite]
  );

  // const frameProcessor = useFrameProcessor(
  //   (frame) => {
  //     "worklet";

  //     if (!tfLite) return;

  //     const resized = resize(frame, {
  //       scale: {
  //         width: 128,
  //         height: 128,
  //       },
  //       pixelFormat: "rgb",
  //       dataType: "float32",
  //     });
  //     const outputs = tfLite.runSync([resized]);

  //     for (let key in outputs[0]) {
  //       if (outputs[0][key] > 0.8 && key !== "4") {
  //         nameWayang.value = wayang[key as keyof typeof wayang];
  //         console.log(key + ": " + outputs[0][key]);
  //       }
  //     }
  //   },
  //   [tfLite]
  // );

  useEffect(() => {
    (async () => {
      const hasPermission = await Camera.requestCameraPermission();
      setPermission(hasPermission);
    })();
  }, []);

  useEffect(() => {
    const LoadAsset = async () => {
      try {
        const m = await Asset.fromModule(
          require("../assets/model/model.tflite")
        ).downloadAsync();
        return m;
      } catch (error) {
        console.log(error);
      }
    };

    console.log("downloading model");

    LoadAsset().then((x) => {
      if (x?.downloaded && x.uri) {
        setModel(x.uri);
        console.log("model downloaded");
      }
    });
  }, []);

  useEffect(() => {
    const LoadModel = async () => {
      const loadedModel = await loadTensorflowModel(
        {
          url: model,
        },
        "android-gpu"
      );

      return loadedModel;
    };
    if (model.length !== 0) {
      LoadModel().then((x) => {
        console.log("loading");
        setTFLite(x);
        console.log("model loaded");
        console.log("model inputs:", x.inputs);
      });
    }
  }, [model]);

  //   let cameraRef = createRef<CameraView>();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (permission === "denied") {
    return (
      <View style={styles.container}>
        <Text>
          Camera permission denied. Please grant permission by going to:
        </Text>
        <Button onPress={Linking.openSettings}></Button>
      </View>
    );
  }

  if (device == null) return <View />;

  //   const onCameraReady = () => {
  //     console.log("camera ready");
  //     setCameraReady(true);
  //   };

  //   const takePicture = async () => {
  //     const img = await cameraRef.current?.takePictureAsync();
  //     if (img?.uri) {
  //       const imgResize = await manipulateAsync(img.uri, [
  //         { resize: { width: 128, height: 128 } },
  //       ]);

  //       console.log("resize", imgResize.base64);

  //       router.push({
  //         pathname: "/image-view",
  //         params: { uri: img.uri },
  //       });
  //     }
  //   };

  return (
    <Box style={styles.container}>
      <Camera
        frameProcessor={frameProcessor}
        isActive={true}
        device={device}
        outputOrientation="preview"
        style={StyleSheet.absoluteFill}
      ></Camera>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
