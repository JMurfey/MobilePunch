import * as Location from 'expo-location';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Button } from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, CameraType } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import WaitOverlay from './WaitOverlay';


export default function CameraScreen({ onPictureTaken }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [location, setLocation] = useState(null);
  const [type, setType] = useState(CameraType.front);
  const handleCameraReady = useCallback(() => setIsCameraInitialized(true), []);
  const [isWaiting, setIsWaiting] = useState(false);

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
      { resize: { width: newWidth, height: newHeight}}
    ]);
    console.log("resizedImage: ", pictureData.photo.uri);
    console.log("resizedImage: ", resizedImage.uri);

  // Get the base64 representation of the resized image
  const base64Image = await ImageManipulator.manipulateAsync(
    resizedImage.uri,
    [],
    { base64: true }
  );

    console.log(base64Image);
      // Return a new object containing the resized image data and its base64 representation
    return {
      location: pictureData.location,
      photo: {
        uri: resizedImage.uri,
        width: resizedImage.width,
        height: resizedImage.height,
        base64: base64Image.base64,
      },
    };
  }
  
  const handleTakePicture = async () => {
    if (isCameraInitialized) {
      setIsWaiting(true);
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync();
          const resizedPhoto = await resizeImage({ photo });
          try {
            const location = await Location.getCurrentPositionAsync({});
            onPictureTaken({ resizedPhoto, location });
          } catch (error) {
            console.log(error);
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      console.log('Camera is not initialized yet.');
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      } else {
        console.log('Permission to access location was granted');
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      }
    })();
  }, []);

  useEffect(() => {
    if (permission && permission.granted) {
      setIsCameraInitialized(true);
    }
    else {
      console.log('permission', permission);
      console.log('Permission to access camera was denied');
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
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={() => requestPermission()}>
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
      />
      <View style={styles.cameraButtonContainer}>
        <TouchableOpacity style={styles.cameraButton} onPress={handleTakePicture}>
          <View style={styles.cameraButtonInner} />
        </TouchableOpacity>
      </View>
      <WaitOverlay visible={isWaiting} />
    </View>
  );
}
  /* styles */
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginBottom: 20,      
    },
    cameraContainer: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: 'black',
      alignSelf: 'center',      
    },
    cameraPreview: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      height: Dimensions.get('window').height - 100, // subtracting 100 to make space for the button container
      width: Dimensions.get('window').width, // reducing the width by 40 for a border
      marginTop: 100, // adding a margin of 100 to the camera preview
      borderRadius: 10, // adding rounded corners to the camera preview
      borderWidth: 2, // adding a border to the camera preview
      borderColor: 'black', // setting the border color to white
      overflow: 'hidden', // hiding any content that extends beyond the rounded corners
    },
    cameraButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      height: 100, // setting the height for the button container
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // setting a semi-transparent black background for the button container
    },
    cameraButton: {
      width: 70,
      height: 70,
      borderWidth: 2,
      borderRadius: 35,
      borderColor: '#111',
      marginHorizontal: 20,
    },
    cameraButtonInner: {
      width: 60,
      height: 60,
      borderWidth: 2,
      borderRadius: 30,
      borderColor: '#111',
      backgroundColor: '#111',
      margin: 3,
    },
    capturedPhotoContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    capturedPhoto: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      height: Dimensions.get('window').height,
      width: Dimensions.get('window').width,
    },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
    },
    button: {
      borderRadius: 5,
      backgroundColor: 'blue',
      paddingHorizontal: 20,
      paddingVertical: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
    },


  });
  