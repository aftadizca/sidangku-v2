import {
  Camera,
  CameraPermissionRequestResult,
  runAtTargetFps,
  useCameraDevice,
  useCameraFormat,
  useFrameProcessor,
  useSkiaFrameProcessor,
} from "react-native-vision-camera";
import { useState, createRef, useEffect } from "react";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { Box, Text, Button } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { useSharedValue } from "react-native-worklets-core";
import { TensorflowModel, loadTensorflowModel } from "react-native-fast-tflite";

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

  const labelFont = useFont(require("../assets/fonts/AdventPro-Bold.ttf"), 24);
  //set up camera
  const [permission, setPermission] = useState<CameraPermissionRequestResult>();
  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [
    { photoAspectRatio: 16 / 9 },
    { photoResolution: { width: 1280, height: 720 } },
    { videoAspectRatio: 16 / 9 },
    { videoResolution: { width: 1280, height: 720 } },
  ]);
  const [model, setModel] = useState("");
  const [tfLite, setTFLite] = useState<TensorflowModel>();
  const nameWayang = useSharedValue<{ name: string; confident: string }>({
    name: "",
    confident: "",
  });

  const { resize } = useResizePlugin();

  const frameProcessor = useSkiaFrameProcessor((frame) => {
    "worklet";

    if (!tfLite) return;
    if (labelFont === null) return;

    frame.render();

    frame.restore();

    const rectX = frame.height / 2;
    const rectY = frame.width - 100;
    const rectW = 200;
    const rectH = 50;

    const rect = Skia.XYWHRect(rectX - rectW / 2, rectY, rectW, rectH);
    const rrect = Skia.RRectXY(rect, 100, 100);

    const paint = Skia.Paint();
    paint.setColor(Skia.Color("blue"));

    // draw text background ( rounded rect )
    nameWayang.value.name && frame.drawRRect(rrect, paint);

    const text = nameWayang.value.name + " - " + nameWayang.value.confident;

    const measureText = labelFont.measureText(text);
    paint.setColor(Skia.Color("white"));

    //draw label
    nameWayang.value.name &&
      frame.drawText(
        text,
        rect.x + rectW / 2 - measureText.width / 2,
        rect.y + rectH / 2 + measureText.height / 3,
        paint,
        labelFont
      );

    // running inference at x fps
    runAtTargetFps(1, () => {
      "worklet";

      const resized = resize(frame, {
        scale: {
          width: 128,
          height: 128,
        },
        pixelFormat: "rgb",
        dataType: "float32",
      });
      const outputs = tfLite.runSync([resized]);

      for (let key in outputs[0]) {
        const confidence = parseFloat(outputs[0][key].toString());
        if (confidence > 0.85) {
          console.log(key, confidence);
          if (key !== "4") {
            nameWayang.value.name = wayang[key as keyof typeof wayang];
            nameWayang.value.confident = confidence.toFixed(2);
          } else {
            nameWayang.value.name = "";
            nameWayang.value.confident = "";
          }
        }
      }
    });
  }, []);

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

  return (
    <Box
      flex={1}
      justifyContent="center"
      alignContent="center"
      backgroundColor="$black"
    >
      <Camera
        frameProcessor={frameProcessor}
        isActive={true}
        device={device}
        resizeMode="contain"
        format={format}
        style={StyleSheet.absoluteFill}
      ></Camera>
      <Text
        zIndex={1000}
        position="absolute"
        bottom={0}
        textAlign="center"
        width="$full"
      >
        Test dsd dsd sfdsdsds s dsd {nameWayang.value.name}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
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
