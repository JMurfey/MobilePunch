import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";

export default function PermissionRequester() {
  const [cameraPermission, setCameraPermission] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [fileSystemPermission, setFileSystemPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");
    })();
  }, []);

  // Request file system permission
  useEffect(() => {
    (async () => {
      const { status } = await FileSystem.requestPermissionsAsync();
      setFileSystemPermission(status === "granted");
    })();
  }, []);

  if (cameraPermission && locationPermission && fileSystemPermission) {
    return null; // Return null if all permissions are granted
  }

  const requestPermissions = async () => {
    if (!cameraPermission) {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === "granted");
    }

    if (!locationPermission) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");
    }

    if (!fileSystemPermission) {
      const { status } = await FileSystem.requestPermissionsAsync();
      setFileSystemPermission(status === "granted");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        We need your permission to use the camera, access your location, and
        save files.
      </Text>
      <Button title="Grant Permissions" onPress={requestPermissions} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
});
