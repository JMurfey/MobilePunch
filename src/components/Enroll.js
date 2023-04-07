import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';//To store Employee ID

export default function Enroll({onIdRetrieved}) {
  const EMPLOYEE_ID_KEY = "EMPLOYEE_ID";
  const [id, setId] = useState('');
  const [idOnFile, setIdOnFile] = useState(true);


  async function save(key, value) {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (e) {
      console.err(e);
    }
  }
  
  async function get(key) {
    let result = await AsyncStorage.getItem(key)
    return result;
  }
  
  async function handleIdSet() {
      console.log("handleIdRetrieved: " + id);
      console.log('saving', id);
      await save(EMPLOYEE_ID_KEY, id);
  
      let result = await get(EMPLOYEE_ID_KEY);
      console.log('Employee ID Stored', result);
      onIdRetrieved(id);
  }
  
  useEffect(() => {
    //Verify if the Employee ID has been already entered.
    //If so, then no need to ask for entering ID again.
    (async () => {
      console.log("Employee Enrollment");
      let result = await get(EMPLOYEE_ID_KEY);
      console.log("🔐 Here's your Employee ID 🔐 :" + result);
      if(result && result.length > 0) {
        setId(result);
        setIdOnFile(true);
        onIdRetrieved(result);
      }
      else {
        setIdOnFile(false);
      }
    })();
  }, []);


  return (
    (idOnFile) ? (
        <View style={styles.container}>
            <Text style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center', margin: 10}}>
                Retrieving Employee ID...
            </Text>
        </View>
    ):(
    <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.employeeContainer}>
            <TextInput 
              style={{backgroundColor:'#efefef', margin: 10, padding:10, maxWidth:300}}
              defaultValue={id}
              placeholder='Please Enter ID'
              onChangeText={(text)=>setId(text)}
            />
          </View>
          <TouchableOpacity
                style={{alignSelf:'center', alignItems: 'center', flexDirection:'row', 
                    backgroundColor:'#eee333', borderRadius:5, margin:10, padding:10}}
                onPress={async (props) => {
                    console.log("Submit Button Pressed");
                    handleIdSet();  /* from the text input */
                }}>
            <Text style={{fontWeight: 'bold'}}>Submit</Text>
          </TouchableOpacity>          
        </View>
    </View>
    ));
}

/* @hide const styles = StyleSheet.create({ ... }); */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },

  employeeContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  camera: {
    flex: 1,
    backgroundColor: "#fffeee",

  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
    marginBottom:40,
    justifyContent:'center'
  },
  button: {
    
    alignSelf: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row'
  },
  text: {
    fontSize: 18,
    color: 'blue',
  },
  captureButton: {
    alignSelf: 'flex-end',
    
  },

  fullName: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom:10,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    
    marginBottom:2,
    
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom:2,
  },
});