import React, { useState } from 'react';
import { View, Text } from 'react-native';
import PhotoAndQR from './src/components/PhotoAndQR';
import QRScannerScreen from './src/components/QRScannerScreen';
import CreatePunch from './src/components/CreatePunch';
import Enroll from './src/components/Enroll';

export default function App() {
  const [captureData, setCaptureData] = useState(null);
  const [qrCodeData, setQRCodeData] = useState(null);
  const [idData, setIdData] = useState(null);

  const [showEmployeeID, setShowEmployeeID] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [showCreatePunch, setShowCreatePunch] = useState(false);

  const handleIDRetrieved = (id) => {
    console.log('handleIDRetrieved: ', id);
    setShowEmployeeID(false);
    setIdData(id);
    setShowCamera(true);
  };

  const handlePhotoAndQRTaken = (info) => { 
    console.log('handlePhotoAndQRTaken: ', info);
    setCaptureData({
      ResizedImage: info.Photo,
      Location: info.Location,
      QrData: info.Barcode
    });
    //console.log('handlePhotoAndQRTaken: ', info);
    setShowCamera(false);
    setShowCreatePunch(true);
  };

  const handleCreatePunchDone = () => {
    setShowCamera(true);
    setShowCreatePunch(false);
    setCaptureData(null);
    setQRCodeData(null);
  };
  if(showEmployeeID) {
    return (
      <Enroll onIdRetrieved={handleIDRetrieved}/>
    );
  }
  if (showCamera) {
    return (
       <PhotoAndQR onPhotoAndQRTaken={handlePhotoAndQRTaken} /> 
    );
  }

  if (showCreatePunch) {
    return (
      <CreatePunch 
        captureData={captureData} 
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
