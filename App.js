import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Camera from './src/components/Camera';
import CameraScreen from './src/components/CameraScreen';
import QRScannerScreen from './src/components/QRScannerScreen';
import CreatePunch from './src/components/CreatePunch';
import Enroll from './src/components/Enroll';

export default function App() {
  const [pictureData, setPictureData] = useState(null);
  const [qrCodeData, setQRCodeData] = useState(null);
  const [idData, setIdData] = useState(null);

  const [showEmployeeID, setShowEmployeeID] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showCreatePunch, setShowCreatePunch] = useState(false);

  const handleIDRetrieved = (id) => {
    console.log('handleIDRetrieved: ', id);
    setShowEmployeeID(false);
    setIdData(id);
    setShowCamera(true);
  };
  const handlePictureTaken = (info) => { 
    console.log('handlePictureTaken: ');
    setPictureData(info);
    setShowCamera(false);
    setShowQRScanner(true);
  };

  const handleBarCodeScanned = (data, success) => { 
    console.log('handleBarCodeScanned: ', data);
    setShowQRScanner(false);
    if( success ) {
      setQRCodeData(data);
      setShowCreatePunch(true);
    }
    else {
      setShowCamera(true);
    }
  };

  const handleCreatePunchDone = () => {
    setShowCamera(true);
    setShowCreatePunch(false);
    setPictureData(null);
    setQRCodeData(null);
  };
  if(showEmployeeID) {
    return (
      <Enroll onIdRetrieved={handleIDRetrieved}/>
    );
  }
  if (showCamera) {
    //console.log('handlePictureTaken: ', handlePictureTaken);
    return (
       <CameraScreen onPictureTaken={handlePictureTaken} /> 
    );
  }

  if (showQRScanner) {
    return (
      <QRScannerScreen onQRCodeScanned={handleBarCodeScanned} />
    );
  }

  if (showCreatePunch) {
    //console.log(pictureData);
    //console.log(qrCodeData);
    return (
      <CreatePunch 
        pictureData={pictureData} 
        qrCodeData={qrCodeData} 
        idData={idData}
        onDone={handleCreatePunchDone} 
      />
    );
  }

  return (
    <View>
      <Text>Something went wrong.</Text>
    </View>
  );
}
