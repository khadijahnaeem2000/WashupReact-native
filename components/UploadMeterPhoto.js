import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { env } from "../env";

async function fetchWithTimeout(url, options, timeout) {
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Request Timeout'));
    }, timeout);

    try {
      const response = await fetch(url, options);
      clearTimeout(timeoutId);
      resolve(response);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

export const alreadySignedIn = () => {
  console.log('AUTHENTICATION ACTION : ALREADY_SIGNED_IN')
  return async dispatch => {
    dispatch({ type: ALREADY_SIGNED_IN })
  }
}

export const notSignedIn = () => {
  console.log('AUTHENTICATION ACTION : NOT_SIGNED_IN')
  return async dispatch => {
    dispatch({ type: NOT_SIGNED_IN })
  }
}
function UploadMeterPhoto(props) {
  let fetchResult;
  const URL = env.URL + env.api_meterPhoto;

  if (props.imageURI) {
    console.log("Image to upload -->", props.imageURI);
  } else {
    console.log("Image URI is not available to Upload on Server!");
  }

  let photo = {
    uri: props.imageURI,
    type: "image/jpeg",
    name: "photo.jpg",
  };

  const uploadPhotoHandler = async () => {


    console.log("Meter Reading Type------->>>", props.meterReadingType);
    console.log(props);
    if (
      !props.imageURI &&
      !props.meterReadingType &&
      !props.meterReadingValue
    ) {
      alert("Select Meter Reading Type, Enter Meter Reading and Capture Image");
    } else if (!props.meterReadingType && !props.meterReadingValue) {
      alert("Select Meter Reading Type and Enter Meter Reading");
    } else if (!props.imageURI && !props.meterReadingValue) {
      alert("Enter Meter Reading and Capture Image");
    } else if (Number(props.meterReadingValue) < 1) {
      alert("Meter Reading must be greater than Zero(0)");
    } else if (!props.imageURI && !props.meterReadingType) {
      alert("Enter Meter Type and Capture Image");
    } else if (!props.meterReadingValue) {
      alert("Enter Meter Reading");
    } else if (!props.meterReadingType) {
      alert("Select 'Start Day' or 'End Day'");
    } else if (!props.imageURI) {
      alert("Capture and Image first!");
    } else {
      const { isConnected } = await NetInfo.fetch();
      if (isConnected) {
        try {
          const finalURL = URL;
          console.log("Sending Data To:", finalURL);

          Alert.alert("Image Uploading", "Please Wait");

          storedRiderID = await AsyncStorage.getItem("rider_id");

          var form = new FormData();
          form.append("rider_id", storedRiderID);
          form.append("image", photo);
          form.append("type", props.meterReadingType);
          form.append("reading", props.meterReadingValue);

          let savedToken = await SecureStore.getItemAsync("token");
          savedToken = savedToken.substring(1, savedToken.length - 1);

          let myHeaders = new Headers();
          myHeaders.append("Authorization", `Bearer ${savedToken}`);
          myHeaders.append("Content-Type", `multipart/form-data`);

          props?.setRefreshing(true);

          await fetchWithTimeout(
            finalURL,
            {
              body: form,
              method: "POST",
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${savedToken}`,
              },
            },
            10000,
            "Request Timeout, Check Your Connection"
          )
            .then((response) => response.text())
            .then(async (result) => {
              result = JSON.parse(result);
              fetchResult = result;
              console.log("Meeeete Readun Result Ststtautuatuatuatua", result);
              if (result.status == "failed") {
                alert("Error Occured!");
                props.setRefreshing(false);
              }

              // This is for End Day
              if (result.status == "pending") {
                console.log("--->> Meter Photo Sent | Order Remaining!");
                alert(result.data);
                props.setRefreshing(false);
              }

              // This is for Start Day

              if (result.status == "error") {
                console.log("--->> Meter Photo Sent | Day Already Started!");
                alert(result.data);
                props.setRefreshing(false);
                props.props_navigation.navigate("My Rides", {
                  enableRides: true,
                });
                props.setRefreshing(false);
              }
              if (props.meterReadingType == "0" && fetchResult.success == "true") {
                props.setStartDay(true);
                props.setEndDay(false);
                await AsyncStorage.setItem(
                  "meter",
                  JSON.stringify({ startDay: true, endDay: false })
                );
              }
              if (props.meterReadingType == "1" && fetchResult.success == "true") {
                props.setStartDay(true);
                props.setEndDay(true);
                await AsyncStorage.setItem(
                  "meter",
                  JSON.stringify({ startDay: true, endDay: true })
                );
              }

              if (result.success == "true") {
                console.log("--->> Meter Photo Sent");
                props.setRefreshing(false);

                let meterReadingType = null;
                props.meterReadingType == "0"
                  ? (meterReadingType = "Start Day")
                  : (meterReadingType = "End Day");
                console.log("==--==--==>   meterReadingType  meterReadingType  meterReadingType meterReadingType ", meterReadingType);
                if (meterReadingType == "Start Day") {
                  props.props_navigation.navigate("My Rides", {
                    enableRides: true,
                  });
                }
                Alert.alert(
                  `${meterReadingType}`,
                  `${props.meterReadingValue}`
                );
                props.setSelectedValue(null);
                props.setMeterReading("");
              }

              // }
            })
            .catch((error) => {
              console.log("--000--");
              error = "Request Timeout, Check Your Connection"
                ? alert("Request Timeout, Check Your Connection")
                : alert("Server Error!");
              console.log(error);
              console.log("--001--");
              props.setRefreshing(false);
            });

          console.log("-------------------------------------------122");
          console.log(fetchResult, typeof fetchResult);
          // fetchResult = fetchResult.json()
          console.log(fetchResult.success, typeof fetchResult.success);
          console.log(props.meterReadingType, typeof fetchResult.success);
          console.log("-------------------------------------------221");

        } catch (e) {
          console.log(e);
          alert("Picture Not Sent!");
          setRefreshing(false);
        }
      } else {
        Alert.alert("Internet Error!");
        props.setRefreshing(false);
      }
    }
  };
  return (
    <TouchableOpacity
      style={[styles.container, props.style]}
      onPress={uploadPhotoHandler}
    >
      <Text style={styles.upload}>UPLOAD</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0eb5fb",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 5,
    width: "100%",
    padding: 10,
    marginBottom: 10,
  },
  upload: {
    color: "#fff",
    fontSize: 14,
    textTransform: "uppercase",
    textAlign: "center",
  },
});

export default UploadMeterPhoto;
