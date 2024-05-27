import React, { Component } from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";

function TakeMeterPhoto(props) {

  

  return (
    <TouchableOpacity 
    style={[styles.TakePhotoButton, props.style]}
    onPress={props.onSelect}
    >
      <Text style={styles.takePhoto}>Take Photo</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  TakePhotoButton: {
    backgroundColor: "#0c76e6",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 5,
    width: '100%',
    padding:10,
    marginBottom: 5
  },
  takePhoto: {
    color: "#fff",
    fontSize: 14,
    textTransform:"uppercase",
    textAlign: "center"
  }
});

export default TakeMeterPhoto;
