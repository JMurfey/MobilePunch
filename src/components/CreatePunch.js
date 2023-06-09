import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import moment from "moment";

export default function CreatePunch({ captureData, idData, onDone }) {
  const [showAPIResult, setShowAPIResult] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRejected, setShowRejected] = useState(false);

  const [currentDateTime, setCurrentDateTime] = useState("");
  const [result, setResult] = useState({});
  const stopSign = require("../../assets/stopsign.png");
  const [errorMsg, setErrorMsg] = useState("");

  async function createPunch(params) {
    try {
      console.log("Calling API: " + params);
      let res = await fetch("http://msiwebtrax.com/Api/MobilePunch", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Cookie: "ASP.NET_SessionId=plhoe3jdaw2dtengknpcbfra",
        },
        //body: JSON.stringify({"ClientDateTime": 12341343414, "": }),
        body: params,
      });
      //console.log(res);
      if (res.status != 200) {
        setErrorMsg("Error: " + res.status);
        return;
      }

      //console.log("This is data returned from server: ", res);
      let resText = await res.text();
      console.log("This is text returned from server: ", resText);
      let resj = JSON.parse(resText);

      console.log("HTTP Status :", res.ok, res.status);
      const { Name, Message, Success, Day } = resj;

      console.log("Name", Name);
      console.log("Message", Message);
      console.log("Success", Success);
      console.log("Day", Day);

      let dateS = moment().format("MMM Do, YYYY");
      let timeS = moment().format("h:mm a");
      console.log("dateS", dateS);
      console.log("timeS", timeS);

      let successS = Success < 0 ? false : true;

      setResult({
        success: successS,
        name: Name || "",
        message: Message || "",
        day: Day,
        date: dateS,
        time: timeS,
      });

      console.log(result);
      console.log("result", result);
      if (successS) {
        setShowSuccess(true);
        setShowRejected(false);
      } else {
        setShowSuccess(false);
        setShowRejected(true);
      }
    } catch (e) {
      console.error(e);
    }
    setShowAPIResult(true);
  }

  /* get current time to compare against time from QR code */
  useEffect(() => {
    console.log("useEffect");
    if (currentDateTime == null || currentDateTime.length == 0) {
      setCurrentDateTime(moment().valueOf());
      return;
    }
    console.log("In UseEffect, currentDateTime: ", currentDateTime);

    console.log("QR: ", captureData.QrData);
    const validateData = async () => {
      /* TODO: this code should be run when the QR code is captured, in the 
          PhotoAndQR.js component */
      //const dataString = captureData.QrData.data;
      //const modifiedDataString = dataString.replace(
      //  /([a-zA-Z]+)(:)/g,
      //  '"$1"$2'
      //);
      //captureData.QrData.data = JSON.parse(modifiedDataString);

      if (
        captureData.QrData === null ||
        captureData.QrData === undefined ||
        captureData.QrData.clientID === null ||
        captureData.QrData.clientID === undefined ||
        captureData.QrData.datetime === null ||
        captureData.QrData.datetime === undefined
      ) {
        console.log("QR Code is invalid: ", captureData.QrData);
        setErrorMsg("QR Code Invalid");
      } else if (
        Math.abs(captureData.QrData.datetime - currentDateTime.valueOf()) >
        20000
      ) {
        console.log(currentDateTime);
        console.log(captureData.QrData.datetime);
        console.log("QR Code is expired");
        setErrorMsg("QR Code Expired");
      } else {
        //console.log("Time difference: ", captureData.QrData.datetime - currentDateTime.valueOf());
        let params = {
          ClientDateTime: captureData.QrData.datetime,
          ClientId: captureData.QrData.clientID,
          DepartmentId: "",
          Id: idData,
          LocationId: "",
          PhoneDateTime: currentDateTime,
          PhoneLatitude: captureData.Location.coords.latitude,
          PhoneLongitude: captureData.Location.coords.longitude,
          PhoneNum: "1234321234",
          PunchClockId: "",
          Image: captureData.ResizedImage.base64,
        };
        params = JSON.stringify(params);
        console.log("params AFTER stringify: " + params);
        createPunch(params);
      }
      return true;
    };
    validateData();
  }, [currentDateTime]);

  return errorMsg.length > 0 ? (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FF7276",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View>
        <Text
          style={{
            justifyContent: "center",
            borderColor: "red",
            alignItems: "flex-end",
            margin: 30,
            fontSize: 48,
            fontWeight: "bold",
            color: "black",
            padding: 10,
            borderRadius: 10,
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {errorMsg}
        </Text>
        <TouchableOpacity
          style={{
            alignSelf: "center",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            console.log("startOver");
            onDone(); // Call the OnDone reference
          }}
        >
          <Text>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      {showAPIResult && (
        <View style={styles.container}>
          {showSuccess && (
            <View
              style={{
                height: Dimensions.get("window").height,
                width: Dimensions.get("window").width,
                flex: 1,
                width: "100%",
                backgroundColor: "lightgreen",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 48, fontWeight: "bold", marginBottom: 10 }}
              >
                Success
              </Text>
              <Text style={styles.fullName}>{result.name}</Text>
              <Text style={styles.date}>{result.date}</Text>
              <Text style={styles.time}>{result.time}</Text>
              <View
                style={{
                  justifyContent: "center",
                  borderColor: "red",
                  alignItems: "flex-end",
                  margin: 30,
                }}
              >
                <TouchableOpacity
                  style={{
                    alignSelf: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    console.log("startOver");
                    onDone(); // Call the OnDone reference
                  }}
                >
                  <Text>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {showRejected && (
            <View
              style={{
                flex: 1,
                backgroundColor: "#FF7276",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View>
                <Image
                  style={{ backgroundColor: "transparent" }}
                  source={stopSign}
                />
              </View>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 24,
                  fontWeight: "bold",
                  marginBottom: 10,
                }}
              >
                {result.message}
              </Text>
              <Text style={styles.fullName}>{result.name}</Text>
              <Text style={styles.date}>{result.date}</Text>
              <Text style={styles.time}>{result.time}</Text>
              <View
                style={{
                  justifyContent: "center",
                  borderColor: "red",
                  alignItems: "flex-end",
                  margin: 30,
                }}
              >
                <TouchableOpacity
                  style={{
                    alignSelf: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    console.log("startOver");
                    onDone(); // Call the OnDone reference
                  }}
                >
                  <Text>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    margin: 20,
    marginBottom: 40,
    justifyContent: "center",
  },
  button: {
    alignSelf: "flex-end",
    alignItems: "center",
    flexDirection: "row",
  },
  text: {
    fontSize: 18,
    color: "blue",
  },
  captureButton: {
    alignSelf: "flex-end",
  },

  fullName: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    fontWeight: "600",

    marginBottom: 2,
  },
  time: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
});
