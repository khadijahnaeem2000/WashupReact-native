import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  Alert,
  Dimensions,
} from 'react-native';
import Header from '../components/Header'
import { CameraView, Camera } from "expo-camera/next";


const QRCodeScreen = props => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);


  if (hasPermission === null) {
    return <View style={styles.container}>
      <Header
        toggleDrawer={props.navigation.toggleDrawer}
        screenName="QR Scanner"
      />
      <View style={styles.mainView}>
        <Text style={styles.textCenter}>Requesting For Camera Permission!</Text>
      </View>
    </View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}>
      <Header
        toggleDrawer={props.navigation.toggleDrawer}
        screenName="QR Scanner"
      />
      <View style={styles.mainView}>
        <Text style={styles.textCenter}>No access to camera!</Text>
      </View>
    </View>;
  }
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    console.log("DATA:", data)
    console.log(props?.route?.params)
    console.log("---->", props?.route?.params?.itemData?.polybag_name, data, props?.route?.params?.itemData?.polybag_name == data)
    if (props?.route?.params?.itemData?.polybag_name == data) {
      props?.route?.params?.scanQRFunc(data)
      Alert.alert(
        "QR Scan",
        `${data}`,
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          {
            text: "OK", onPress: () => {
              props.navigation.navigate("Drop Off", {
                screenTitle: props?.route?.params?.screenTitle,
                screenType: "Drop Off",
                orderID: props?.route?.params?.orderID,
                customerID: props?.route?.params?.customerID,
                recentOrders: false,
              })
              // props.navigation.goBack()
            }
          }
        ],
        { cancelable: false }
      );

    } else {
      props?.route?.params?.scanQRFunc(null)
      Alert.alert("Wrong QR Code Scanned!!", data)
    }
  }




  if (hasPermission === null) {
    return <View style={styles.container}>
      <Header
        toggleDrawer={props.navigation.toggleDrawer}
        screenName="QR Scanner"
      />
      <View style={styles.mainView}>
        <Text style={styles.textCenter}>Requesting For Camera Permission!</Text>
      </View>
    </View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}>
      <Header
        toggleDrawer={props.navigation.toggleDrawer}
        screenName="QR Scanner"
      />
      <View style={styles.mainView}>
        <Text style={styles.textCenter}>No access to camera!</Text>
      </View>
    </View>;
  }
  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
        style={{ flex: 1 }}
      />
      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  mainView: {
    flex: Dimensions.get('window').height < 600 ? 4.3 : 4.8,
    backgroundColor: 'white',
    padding: 0,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  textCenter: {
    textAlign: 'center'
  }
});
export default QRCodeScreen;