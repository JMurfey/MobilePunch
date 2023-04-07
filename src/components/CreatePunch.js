import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import moment from "moment";

export default function CreatePunch({ pictureData, qrCodeData, idData, onDone }) {
  const [showAPIResult, setShowAPIResult] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRejected, setShowRejected] = useState(false)  ;

  const [currentDateTime, setCurrentDateTime] = useState('');
  const [result, setResult] = useState({});

  console.log('CreatePunch: ', pictureData, qrCodeData, idData);

  useEffect(() => {
    console.log("useEffect");
    /*********************************************/
    /*  This is where you will make the API call */
    /*********************************************/
    const createPunch = async () => {
      console.log('createPunch: ', pictureData, qrCodeData, idData);
      // let params = {
      //   "ClientDateTime": "", //"String content", //you should be able to leave this empty
      //   "ClientId": data.clientId, //from QR
      //   "DepartmentId": "530", //from QR, not necessary
      //   "Id":  idInput, //"String content", //Stored ID
      //   "Image": imageBase64,//"String content", //b64 of image
      //   "LocationId": data.LocationId, //"String content", //from QR
      //   "PhoneDateTime": currentDateTime, //"String content", //long data - # of milliseconds since 1970
      //   "PhoneLatitude": data.Lattitude,  //"String content", // This will probably come from QR
      //   "PhoneLongitude": data.Logitude, //"String content", // This will probably come from QR
      //   "PhoneNum": "", //"String content", // Phone Number, not used at the moment
      //   "PunchClockId": "", //"String content", // from QR, not used at the moment
      //   }
      // replace "Image": imageBase64 below for actual image
      let currentDateTime = moment().valueOf();
      console.log('currentDateTime: ', currentDateTime);




      let params = {
        "ClientDateTime": currentDateTime,
        "ClientId": "165",
        "DepartmentId": "",
        "Id": idData,
        "LocationId": "",
        "PhoneDateTime": currentDateTime,
        "PhoneLatitude": pictureData.location.coords.latitude,
        "PhoneLongitude": pictureData.location.coords.longitude,
        "PhoneNum": "1234321234",
        "PunchClockId": "",
        "Image": pictureData.resizedPhoto.photo.base64,
      }
      console.log(params);


      try {
        console.log("Calling API");
        console.log(JSON.stringify(params));
        let res = await fetch('http://msiwebtrax.com/Api/MobilePunch', {
          method: 'POST',
          headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
            'Cookie': 'ASP.NET_SessionId=plhoe3jdaw2dtengknpcbfra'
          },
          body: JSON.stringify(params),
          // body: params
        });
        console.log(res);
        let resText = await res.text();
        console.log(resText);
        let resj = JSON.parse(resText);

        console.log("HTTP Status :", res.ok, res.status);

        const {Name, Success, Day } = resj;

        console.log("Name", Name);
        console.log("Success", Success);
        console.log("Day", Day);

        let dateS = moment(date).format('MMM Do, YYYY');
        let timeS = moment(date).format('h:mm a');
        console.log("dateS", dateS);
        console.log("timeS", timeS);

        let successS = Success  < 0 ? false : true;

        setResult({
          success: successS,
          name: Name || "",
          day: Day,
          date: dateS,
          time: timeS
        })

        console.log(result);
        // setShowCamera(false);
        console.log("result", result)
        if(successS) {
          setShowSuccess(true);
          setShowRejected(false);
        }
        else {
          setShowSuccess(false)
          setShowRejected(true);
        }



      } catch (e) {
        console.error(e);
      }
      setShowAPIResult(true);
      //setShowProcessing(false);

      //setShowCamera(false);
      return true;
    }

    createPunch();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dataContainer: {
      paddingHorizontal: 20,
    },
    dataLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    dataText: {
      fontSize: 16,
    },
  });

  return (
    <View style={styles.container}>
      {showAPIResult && (
        <View style={styles.container}>
          {showSuccess && (
            <View style={{ flex: 1, backgroundColor: 'lightgreen', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Success</Text>
              <Text style={styles.fullName}>{result.name}</Text>
              <Text style={styles.date}>{result.date}</Text>
              <Text style={styles.time}>{result.time}</Text>
              <View style={{ justifyContent: 'center', borderColor: 'red', alignItems: 'flex-end', margin: 30 }}>
                <TouchableOpacity
                  style={{ alignSelf: 'center', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                  onPress={startOver}>
                    </TouchableOpacity>
                    </View>
            </View>

          )}

          {showRejected && (
            <View style={{ flex: 1, backgroundColor: '#FF7276', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Not Authorized</Text>
              <Text style={styles.fullName}>{result.name}</Text>
              <Text style={styles.date}>{result.date}</Text>
              <Text style={styles.time}>{result.time}</Text>
              <View style={{ justifyContent: 'center', borderColor: 'red', alignItems: 'flex-end', margin: 30 }}>

                <TouchableOpacity
                  style={{ alignSelf: 'center', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                  onPress={startOver}>

                  <Ionicons name="refresh-circle" size={24} style={{ margin: 2 }} /><Text >Restart</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}
        </View>
      )}
    </View>
  );
}
