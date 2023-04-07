import * as Location from 'expo-location';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Button } from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, CameraType } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';




export default function CameraScreen({ onPictureTaken }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [location, setLocation] = useState(null);
  const [type, setType] = useState(CameraType.front);
  const handleCameraReady = useCallback(() => setIsCameraInitialized(true), []);

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
    console.log("resizedImage: ", resizedImage);

  // Get the base64 representation of the resized image
  const base64Image = await ImageManipulator.manipulateAsync(
    resizedImage.uri,
    [],
    { base64: true }
  );



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
  }, [permission]);

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
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
      flexDirection: 'column',
      backgroundColor: 'black',
    },
    cameraPreview: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      height: Dimensions.get('window').height,
      width: Dimensions.get('window').width,
    },
    cameraButtonContainer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cameraButton: {
      width: 70,
      height: 70,
      borderWidth: 2,
      borderRadius: 35,
      borderColor: '#FFFFFF',
      marginHorizontal: 20,
    },
    cameraButtonInner: {
      width: 60,
      height: 60,
      borderWidth: 2,
      borderRadius: 30,
      borderColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
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
    button: {
      flex: 1,
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
  });
