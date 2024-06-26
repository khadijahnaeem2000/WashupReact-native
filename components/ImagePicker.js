import React, { useState } from "react";
import { View, Button, Image, Text, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Permissions from 'expo-permissions';

// Importing custom components if needed
import TakeMeterPhoto from "../components/TakeMeterPhoto";
import UploadMeterPhoto from "../components/UploadMeterPhoto";

// Importing custom styles or constants
import Colors from "../constants/Colors";

const ImgPicker = (props) => {
  const [pickedImage, setPickedImage] = useState();

  

  const takePhotoHandler = async () => {
  
    let image = await ImagePicker.launchCameraAsync();
    if (!image.cancelled) {
      // Check if image capture was cancelled
      try {
        // Ensure that the 'uri' property is a string before manipulation
        const uri = image.assets[0]?.uri; // Access the uri property from the first asset in the assets array
        if (typeof uri === 'string') {
          image = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 200, height: 200 } }],
            { compress: 0, format: ImageManipulator.SaveFormat.PNG }
          );
          setPickedImage(image.uri);
          props.onImageTaken(image.uri);
        } else {
          console.error("Invalid image URI:", uri); // Log invalid image URI
        }
      } catch (error) {
        console.error("Image manipulation error:", error); // Log any errors during image manipulation
      }
    }
  };
  
  
  

  return (
    <View style={styles.imagePicker}>
      <View style={styles.imagePreview}>
        {!pickedImage ? (
          <Text>No image picked yet.</Text>
        ) : (
          <Image style={styles.image} source={{ uri: pickedImage }} />
        )}
      </View>
      <TakeMeterPhoto onSelect={takePhotoHandler} />
      <UploadMeterPhoto
        imageURI={pickedImage}
        meterReadingType={props.meterReadingType}
        meterReadingValue={props.meterReadingValue}
        showActivityIndicator={props.showActivityIndicator}
        props_navigation={props.props_navigation}
        setStartDay={props.setStartDay}
        setEndDay={props.setEndDay}
        setRefreshing={props.setRefreshing}
        setSelectedValue={props.setSelectedValue}
        setMeterReading={props.setMeterReading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imagePicker: {
    alignItems: "center",
    marginBottom: 15,
  },
  imagePreview: {
    width: "80%",
    height: 200,
    marginBottom: 30,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: "#c1c1c1",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default ImgPicker;
