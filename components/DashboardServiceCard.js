import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Ellipse } from "react-native-svg";

function DashboardServiceCard(props) {
  return (
    <View style={[styles.container, props.style]}>
      <View style={styles.rect3Stack}>
        <View style={styles.rect3}></View>
        <Svg viewBox="0 0 79.17 80.38" style={styles.ellipse}>
          <Ellipse
            strokeWidth={3}
            fill="rgba(74,144,226,1)"
            cx={40}
            cy={40}
            rx={38}
            ry={39}
            stroke="rgba(255,255,255,1)"
          ></Ellipse>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  rect3: {
    top: 66,
    left: 0,
    width: 116,
    height: 69,
    position: "absolute",
    backgroundColor: "rgba(106,216,222,1)"
  },
  ellipse: {
    top: 0,
    left: 18,
    width: 79,
    height: 80,
    position: "absolute"
  },
  rect3Stack: {
    width: 116,
    height: 135
  }
});

export default DashboardServiceCard;
