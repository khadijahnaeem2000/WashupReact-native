import React, { Component } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function DrawerHeaderButton(props) {
  return (
    <TouchableOpacity 
    style={[styles.container, props.style]}
    onPress={props.onSelect}
    >
      <Icon name="menu" style={styles.caption}></Icon>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 2
  },
  caption: {
    color: "#3F51B5",
    fontSize: 24
  }
});
export default DrawerHeaderButton;