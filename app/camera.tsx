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
import { Box, Text, Button, VStack, Icon, HStack } from "@gluestack-ui/themed";
import { useSharedValue } from "react-native-worklets-core";
import {
  TensorflowModel,
  loadTensorflowModel,
  useTensorflowModel,
} from "react-native-fast-tflite";

import { Asset, useAssets } from "expo-asset";
import { useResizePlugin } from "vision-camera-resize-plugin";
import { Skia, useFont } from "@shopify/react-native-skia";
import Gradient from "@/assets/Icons/Gradient";
import Flashlight from "@/assets/Icons/Flash";

interface IWayang {
  [key: string]: string;
}

export default function CameraPage() {
  const wayang: IWayang = {
    "0": "Arjuna",
    "1": "Bima",
    "2": "Yudistira",
    "3": "Nakula/Sadewa",
    "4": "Other",
  };

  const labelFont = useFont(require("@/assets/fonts/AdventPro-Bold.ttf"), 32);
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
  // const [tfLite, setTFLite] = useState<TensorflowModel>();
  const tfLite = useTensorflowModel(require("@/assets/model/model.tflite"));
  const nameWayang = useSharedValue<{ name: string; confident: string }>({
    name: "",
    confident: "",
  });

  const { resize } = useResizePlugin();

  const frameProcessor = useSkiaFrameProcessor(
    (frame) => {
      "worklet";

      if (tfLite.state !== "loaded") return;
      if (labelFont === null) return;

      frame.render();

      frame.restore();

      const rectX = frame.height / 2;
      const rectY = frame.width - 200;
      const rectW = 300;
      const rectH = 70;

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

        // console.log(tfLite.model.delegate);
        // console.log(tfLite.model.inputs);

        const resized = resize(frame, {
          scale: {
            width: 224,
            height: 224,
          },
          pixelFormat: "rgb",
          dataType: "float32",
        });
        const outputs = tfLite.model.runSync([resized]);

        console.log(outputs);

        const n: [string, number] = Object.entries(outputs[0]).reduce(
          ([kp, vp], [kn, vn]) => {
            return vn && vn > vp ? [kn, vn] : [kp, vp];
          }
        );

        // console.log("n:", n);

        // if (n[1] < 0.5) {
        //   // console.log("under", n);
        //   nameWayang.value.name = "";
        //   nameWayang.value.confident = "";
        // }

        if (n[0] !== "4") {
          // console.log("upper", n);
          nameWayang.value.name = wayang[n[0]];
          nameWayang.value.confident = n[1].toFixed(2);
        } else {
          nameWayang.value.name = "";
          nameWayang.value.confident = "";
        }
      });
    },
    [tfLite]
  );

  // set camera permission
  useEffect(() => {
    (async () => {
      const hasPermission = await Camera.requestCameraPermission();
      setPermission(hasPermission);
    })();
  }, []);

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
    <Box flex={1}>
      <Gradient />
      <Camera
        frameProcessor={frameProcessor}
        isActive={true}
        resizeMode="contain"
        device={device}
        format={format}
        fps={30}
        style={styles.camera}
      ></Camera>
      <HStack
        zIndex={2000}
        space="md"
        flex={1}
        alignItems="center"
        justifyContent="center"
        position="absolute"
        right={5}
        bottom={10}
        left={5}
      >
        <Icon as={Flashlight} width={48} height={48} color="$blue900" />
        {/* <Icon as={Flashlight} size="lg" />
        <Icon as={Flashlight} size="lg" />
        <Icon as={Flashlight} size="lg" /> */}
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  camera: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: -1,
    right: 0,
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
