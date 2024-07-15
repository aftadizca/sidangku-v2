import { StyleSheet } from "react-native";
import { Box, Image } from "@gluestack-ui/themed";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

export default function ImageView() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();

  return (
    <Box flex={1} backgroundColor="$blue900">
      <Image
        bgColor="$backgroundDark100"
        size="full"
        alt="Camera Image View"
        source={{
          uri: uri
            ? uri
            : "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        }}
      />
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
