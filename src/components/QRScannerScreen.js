import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import WaitOverlay from './WaitOverlay';

export default function QRScannerScreen({ onQRCodeScanned }) {
  console.log("QRScannerScreen");
  const [hasPermission, setHasPermission] = useState(null);
  const timerRef = useRef(null);
  const [isWaiting, setIsWaiting] = useState(false);

  console.log("Starting!");
  console.log("QRScannerScreen: ", onQRCodeScanned);
  console.log("hasPermission: ", hasPermission);
  console.log("timerRef: ", timerRef);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      console.log("status: ", status);
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setIsWaiting(true);
    console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
    //setScanned(true);
    clearTimeout(timerRef.current);
    onQRCodeScanned(data, true);
  };

  const startTimer = () => {
    timerRef.current = setTimeout(() => {
      console.log('Timer expired');
      onQRCodeScanned(null, false);
    }, 30000);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  else if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  else {
    startTimer();
    
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottomContainer: {
      position: 'absolute',
      bottom: 20,
    },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ffffff',
    },
  });


  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.bottomContainer}>
        <Text style={styles.text}>Scan a QR code</Text>
      </View>
      <WaitOverlay isWaiting={isWaiting} />
    </View>
  );
  
}