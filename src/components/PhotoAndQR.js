import * as Location from "expo-location";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Button,
} from "react-native";
import portraitOverlay from "../../assets/PortraitTemplate.png";
import qrOverlay from "../../assets/QROverlay.png";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Camera, CameraType } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import WaitOverlay from "./WaitOverlay";

export default function PhotoAndQR({ onPhotoAndQRTaken }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [type, setType] = useState(CameraType.front);
  const [remainingTime, setRemainingTime] = useState(0);
  const handleCameraReady = useCallback(() => setIsCameraInitialized(true), []);

  const [showWaitOverlay, setShowWaitOverlay] = useState(false);
  const [pictureInfo, setPictureInfo] = useState(null);

  async function resizeImage(pictureData) {
    // Get the image URI
    const uri = pictureData.photo.uri;
    // Get the image dimensions
    const { width, height } = pictureData.photo;
    // Calculate the new dimensions while maintaining aspect ratio
    const newWidth = 120;
    const newHeight = Math.round((newWidth * height) / width);
    // Resize the image
    const resizedImage = await ImageManipulator.manipulateAsync(uri, [
      { resize: { width: newWidth, height: newHeight } },
    ]);
    console.log("resizedImage: ", pictureData.photo.uri);

    // Get the base64 representation of the resized image
    const base64Image = await ImageManipulator.manipulateAsync(
      resizedImage.uri,
      [],
      { base64: true }
    );

    // Return a new object containing the resized image data and its base64 representation
    return {
      photo: {
        uri: resizedImage.uri,
        width: resizedImage.width,
        height: resizedImage.height,
        base64: base64Image.base64,
      },
    };
  }

  function isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  const handleTakePicture = async () => {
    console.log("handleTakePicture");
    if (isCameraInitialized) {
      setShowWaitOverlay(true);
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync();
          try {
            const location = await Location.getCurrentPositionAsync({});
            const resizedPhoto = await resizeImage({ photo });

            setPictureInfo({
              Photo: resizedPhoto.photo,
              Location: location,
            });
          } catch (error) {
            console.log(error);
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      console.log("Camera is not initialized yet.");
    }
  };

  const handleBarCodeScanned = (barCodeData) => {
    console.log("barCodeData: ", barCodeData);
    if (isJsonString(barCodeData)) {
      barCodeData = JSON.parse(barCodeData.data);
      console.log("barCodeData: ", barCodeData);
    } else {
      barCodeData = {};
    }
    setPictureInfo({
      Location: pictureInfo.Location,
      Photo: pictureInfo.Photo,
      Barcode: barCodeData,
    });
  };

  useEffect(() => {
    (async () => {
      if (pictureInfo === null) {
        setType(CameraType.front);
      } else if (
        pictureInfo.Barcode === null ||
        pictureInfo.Barcode === undefined
      ) {
        setType(CameraType.back);
        setRemainingTime(30); // Reset the remaining time
        // Add a 2-second delay before setting showWaitIndicator to false
        const timerStopWaitIndicator = setTimeout(() => {
          setShowWaitOverlay(false);
        }, 1000);

        // Timer to update remaining time
        const timerUpdateRemainingTime = setInterval(() => {
          setRemainingTime((prevRemainingTime) => {
            if (prevRemainingTime <= 1) {
              clearInterval(timerUpdateRemainingTime);
              setType(CameraType.front); // Set the camera to front
              setPictureInfo(null); // Clear the pictureInfo
              return 0;
            }
            return prevRemainingTime - 1;
          });
        }, 1000);

        return () => {
          clearTimeout(timerStopWaitIndicator);
          clearInterval(timerUpdateRemainingTime); // Clear the interval when the component unmounts
        };
      } else {
        onPhotoAndQRTaken(pictureInfo);
      }
    })();
  }, [pictureInfo]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      } else {
        console.log("Permission to access location was granted");
        //const location = await Location.getCurrentPositionAsync({});
        //setLocation(location);
      }
    })();
  }, []);

  useEffect(() => {
    if (permission && permission.granted) {
      setIsCameraInitialized(true);
    } else {
      console.log("permission", permission);
      console.log(
        "Permission is null or permission to access camera was denied"
      );
    }
  }, [permission]);

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => requestPermission()}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <Camera
        style={styles.cameraPreview}
        onCameraReady={handleCameraReady}
        type={type}
        ref={cameraRef}
        onBarCodeScanned={handleBarCodeScanned}
        androidZOrder="background" // Add this line
      />
      {type === CameraType.front && (
        <Image
          source={portraitOverlay}
          style={styles.portraitOverlay}
          resizeMode="contain"
        />
      )}
      {type === CameraType.back && (
        <Image
          source={qrOverlay}
          style={styles.qrOverlay}
          resizeMode="stretch"
        />
      )}
      <WaitOverlay visible={showWaitOverlay} />
      {type === CameraType.front ? (
        <View style={styles.cameraButtonContainer}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleTakePicture}
          >
            <View style={styles.cameraButtonInner} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bottomContainer}>
          <Text style={styles.text}>Scan QR Punch Clock</Text>
          <Text style={styles.countDownText}>{remainingTime}</Text>
        </View>
      )}
    </View>
  );
}
/* styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "black",
    alignSelf: "center",
  },
  cameraPreview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    height: Dimensions.get("window").height - 100, // subtracting 100 to make space for the button container
    width: Dimensions.get("window").width, // reducing the width by 40 for a border
    marginTop: 50, // adding a margin of 100 to the camera preview
    borderRadius: 10, // adding rounded corners to the camera preview
    borderWidth: 2, // adding a border to the camera preview
    borderColor: "black", // setting the border color to white
    overflow: "hidden", // hiding any content that extends beyond the rounded corners
  },
  cameraButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    height: 100, // setting the height for the button container
    backgroundColor: "rgba(0, 0, 0, 0.6)", // setting a semi-transparent black background for the button container
  },
  cameraButton: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderRadius: 35,
    borderColor: "#FFF",
    marginHorizontal: 20,
  },
  cameraButtonInner: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: 30,
    borderColor: "#FFF",
    backgroundColor: "#FFF",
    margin: 3,
  },
  capturedPhotoContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  capturedPhoto: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
  },
  text: {
    fontSize: 24,
    paddingTop: 10,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  countDownText: {
    fontSize: 36,
    paddingTop: 10,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  button: {
    borderRadius: 5,
    backgroundColor: "blue",
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  portraitOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  qrOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  bottomContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "15%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
});
