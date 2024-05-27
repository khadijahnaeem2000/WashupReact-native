import React, { useState, useEffect } from 'react';
import { Text, 
  View, 
  StyleSheet, 
  Button, 
  Alert,
  LogBox ,
  Dimensions,
  BackHandler
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import Header from '../components/Header'
import { BarCodeScanner } from 'expo-barcode-scanner';
const QRCodeScreen = props => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation >state',
 ]);
 const route = useRoute();
  useEffect(() => {
    const backAction = () => {           
      if (route.name === "QR Code"){
        props.navigation.navigate('Drop Off')
      }
      backHandler.remove();
      return true
      }
      const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
      );
        return () => backHandler.remove();
    }, []);
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
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
    console.log("DATA:",data)
    console.log(props.route.params)
    console.log("---->",props.route.params.itemData.polybag_name,data,props.route.params.itemData.polybag_name==data)
    if(props.route.params.itemData.polybag_name==data){
      props.route.params.scanQRFunc(data)
      Alert.alert(
        "QR Scan",
        `${data}`,
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "OK", onPress: () => {
            props.navigation.goBack()
          } }
        ],
        { cancelable: false }
      );

      }else{
        props.route.params.scanQRFunc(null)
        Alert.alert("Wrong QR Code Scanned!!",data)
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
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  mainView:{
    flex: Dimensions.get('window').height < 600 ? 4.3 : 4.8,
    backgroundColor: 'white',
    padding:0,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  textCenter:{
    textAlign:'center'
  }
});
export default QRCodeScreen;