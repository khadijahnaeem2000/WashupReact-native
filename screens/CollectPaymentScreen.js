//https://blog.jscrambler.com/add-a-search-bar-using-hooks-and-flatlist-in-react-native/
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import handImg from "../assets/images/hand_simple.png";
import Header from "../components/Header";
import Dialog from "react-native-dialog";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { env } from "../env";
import { useFocusEffect } from "@react-navigation/native";

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

//-----------------FOR IMAGES-----------------//
const handImgURI = Image.resolveAssetSource(handImg).uri;
//-----------------FOR IMAGES-----------------//

const CollectPaymentScreen = (props) => {
  const URL = env.URL + env.api_collectpayment;
  const [selectedId, setSelectedId] = useState(null);
  const [listData, setListData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [startDay, setStartDay] = useState();
  const [endDay, setEndDay] = useState();
  const [currentItem, setCurrentItem] = useState({});
  let recievedAmount;
  //----------------------NOTIFICATION HOOKS AND FUNCTIONS ----------------------//
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);
  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Washup!",
        body: "Payment Collected!",
        // data: { data: 'goes here' },
      },
      // trigger: { seconds: 2 },
      trigger: null,
    });
  }
  async function registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
    return token;
  }
  //----------------------------------------------------------------------------------------//
  // useEffect(() => {
   
  // }, []);

useFocusEffect(
  useCallback(() => {
    try {
      fetchData();
    } catch (error) {
      console.log(error);
    }
  },[])
)



  const onRefresh = useCallback(() => {
    try {
      fetchData();
    } catch (e) {
      console.log(e);
    }
  }, [refreshing]);
  // ----------- FUNCTIONS STARTS HERE ---------- //
  const showDialog = (param, item) => {
    setCurrentItem(item);
    setVisible(true);
  };

  const handleCancel = () => {
    recievedAmount = "";
    setVisible(false);
  };

  const handleChange = (value) => {
    recievedAmount = value;
  };
  const handleConfirm = async () => {
    storedRiderID = await AsyncStorage.getItem("rider_id");
    console.log("Rider ID -=-=>", storedRiderID);
    console.log("Recieved Amount: ", recievedAmount);
    console.log(currentItem);
    console.log(recievedAmount);
    if (isNaN(recievedAmount)) {
      alert("Type Numbers only!");
      return;
    }
    const sendDataObj = {
      order_id: currentItem.order_id,
      rider_id: storedRiderID,
      recievedamount: recievedAmount,
    };
    var raw = JSON.stringify(sendDataObj);
    savedToken = await SecureStore.getItemAsync("token");
    savedToken = savedToken.substring(1, savedToken.length - 1);
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${savedToken}`);
    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    alert("Please wait! Data is being sent!");
    setRefreshing(true);
    const URLPayment = env.URL + env.api_collectpaymentsubmit;
    try {
      const paymentResponse = await fetchWithTimeout(
        URLPayment,
        requestOptions,
        5000,
        "Request Timeout, Check Your Connection"
      );
      const paymentResponseJSON = await paymentResponse.json();
      setRefreshing(false);
      setListData(paymentResponseJSON.data);
      console.log(paymentResponseJSON);
      if (paymentResponseJSON.status == "success") {
        alert("Data Sent!");
        setRefreshing(false);
        schedulePushNotification();
      } else if (paymentResponseJSON.status == "failed") {
        alert(paymentResponseJSON.error);
        setRefreshing(false);
      }
    } catch (error) {
      console.log("--000--");
      error = "Request Timeout, Check Your Connection"
        ? alert("Request Timeout, Check Your Connection")
        : alert("Server Error!");
      console.log(error);
      console.log("--001--");
      setRefreshing(false);
    }
    setVisible(false);
  };
  const pressMap = (props_map) => (props) => {
    console.log(props_map);
    console.log("Call Pressed!");
    Linking.openURL(`http://maps.google.com/?daddr=${props_map}`);
  };
  const pressCall = (props_call) => (props) => {
    console.log(props_call);
    console.log("Map Pressed!");
    Linking.openURL(`tel://${props_call}`);
  };
  async function fetchData() {
    const { isConnected } = await NetInfo.fetch();
    storedRiderID = await AsyncStorage.getItem("rider_id");
    console.log("Rider ID -=-=>", storedRiderID);
    const finalURL = URL + `/${storedRiderID}`;
    console.log("Fetching Data From:", finalURL);
    if (isConnected) {
      try {
        setRefreshing(true);
        savedToken = await SecureStore.getItemAsync("token");
        savedToken = savedToken.substring(1, savedToken.length - 1);
        console.log("Token --> ", savedToken, typeof savedToken);
        let myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Authorization", `Bearer ${savedToken}`);
        let requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        };
        let response = await fetchWithTimeout(
          finalURL,
          requestOptions,
          5000,
          "Request Timeout, Check Your Connection"
        );
        setRefreshing(false);
        let responseJson = await response.json();
        // console.log(responseJson);
        setListData(responseJson);

        setRefreshing(false);
      } catch (error) {
        console.log("--000--");
        error = "Request Timeout, Check Your Connection"
          ? alert("Request Timeout, Check Your Connection")
          : alert("Server Error!");
        console.log(error);
        console.log("--001--");
        setRefreshing(false);
      }
    } else {
      Alert.alert("Internet Error!");
      setRefreshing(false);
    }
  }
  async function fetchStoredData() {
    let currentDate = new Date();
    let currentDay = currentDate.getDay();
    storedMeterData = await AsyncStorage.getItem("meter");
    storedMeterData = JSON.parse(storedMeterData);
    setStartDay(storedMeterData.startDay);
    setEndDay(storedMeterData.endDay);
    if (storedMeterData.storedWeekDay != currentDay) {
      //The day has been changed!
      await AsyncStorage.setItem(
        "meter",
        JSON.stringify({
          startDay: true,
          endDay: false,
          storedWeekDay: currentDay,
        })
      );
    }
  }
  fetchStoredData();
  // ----------- FUNCTIONS ENDS HERE ------------//
  const renderItem = ({ item }) => {
    // console.log(item)
    return (
      <Item
        item={item}
        onPress={() => setSelectedId(item.id)}
        style={styles.itemBoxStyle}
      />
    );
  };
  const Item = ({ item, onPress, style }) => {
    let boxStyle;
    if (item.cash != 0) {
      boxStyle = [styles.item, style];
    } else {
      boxStyle = [styles.item, style, styles.zeroPKR];
    }
    if (item.title === "Drop Off Point")
      return (
        <View style={styles.DropOffPoint}>
          <Text style={styles.DropOffPointText}>
            {item.title} - {item.time}
          </Text>
          <Image
            source={{ uri: handImgURI }}
            style={styles.iconInsideHand}
            resizeMode="contain"
          />
        </View>
      );
    else
      return (
        <TouchableOpacity style={boxStyle}>
          <Text style={styles.title}>
            <Text style={{ color: "#000", fontSize: 20 }}>{item.title}</Text>
          </Text>
          <Text style={styles.title}>
            <Text style={{ color: "#0c76e6" }}>Address:</Text> {item.address}
          </Text>
          <Text style={styles.title}>
            <Text style={{ color: "#0c76e6" }}>Ride Time:</Text> {item.rideTime}
          </Text>
          <Text style={styles.title}>
            <Text style={{ color: "#0c76e6", fontWeight: "bold" }}>
              Permenant Note:
            </Text>{" "}
            {item.permenantNote}
          </Text>
          <Text style={styles.title}>
            <Text style={{ color: "#0c76e6", fontWeight: "bold" }}>Note:</Text>{" "}
            {item.note}
          </Text>
          <View style={styles.InlineBlock}>
            <TouchableOpacity
              onPress={pressMap(item.buttonMap)}
              style={[styles.IconSocial, style]}
            >
              <Icon name="map-marker" size={22} style={styles.iconInside} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pressCall(item.buttonCall)}
              style={[styles.IconSocial, style]}
            >
              <Icon name="phone" size={22} style={styles.iconInside} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(param) => {
                console.log("paramss" , param)
                // showDialog(param, item)
              }}
              style={[styles.BtnInfo, style]}
            >
              <View style={styles.BtnStylingArea}>
                <Icon name="cash" color={"white"} size={42} />
                <Text style={styles.btnTextColor}>{item.cash} PKR</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
  };
  if (visible) {
    return (
      <View style={styles.container}>
        <Header
          toggleDrawer={props.navigation.toggleDrawer}
          screenName="Payment Only Rides"
        />
        <Dialog.Container visible={visible}>
          <Dialog.Title>Payable Amount: {currentItem.cash} PKR</Dialog.Title>
          <Dialog.Title>Enter Recieved Amount</Dialog.Title>
          <Dialog.Input
            style={styles.TextareaSubmit}
            autoCorrect={false}
            placeholder="Enter Here"
            onChangeText={(value) => handleChange(value)}
            value={recievedAmount}
            defaultValue={recievedAmount}
            keyboardType="phone-pad"
          />
          <Dialog.Button
            label="Cancel"
            onPress={handleCancel}
            color="#0C76E6"
          />
          <Dialog.Button
            label="Confirm"
            onPress={handleConfirm}
            color="#0C76E6"
          />
        </Dialog.Container>
      </View>
    );
  }
  if (refreshing) {
    return (
      <View style={styles.container}>
        <Header
          toggleDrawer={props.navigation.toggleDrawer}
          screenName="Payment Only Rides"
        />
        <View style={styles.mainView}>
          <ActivityIndicator size="large" color="#0c76e6" />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Header
        toggleDrawer={props.navigation.toggleDrawer}
        screenName={props.route.name}
      />
      <View style={styles.mainView}>
        <SafeAreaView style={styles.container}>
          <FlatList
            data={listData}
            renderItem={renderItem}
            keyExtractor={(item) => item.order_id.toString()}
            extraData={selectedId}
            style={styles.TestDev}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainView: {
    flex: Dimensions.get("window").height < 600 ? 4.3 : 4.8,
    width: "100%",
    backgroundColor: "white",
    padding: 0,
  },
  MeterReadingView: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#379aff",
    height: "20%",
    marginHorizontal: "20%",
    marginVertical: "65%",
    borderRadius: 10,
  },
  item: {
    padding: 20,
    marginVertical: 10,
    width: "92%",
    marginLeft: "4%",
    marginRight: "4%",
    backgroundColor: "#ffffff",
    shadowColor: "#cdcdcd",
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    color: "#888888",
  },
  InlineBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  iconInside: {
    backgroundColor: "#379aff",
    color: "#FFFF",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "white",
    width: 40,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    marginRight: 10,
    textAlignVertical: "center",
  },
  BtnInfo: {
    position: "absolute",
    right: 0,
  },
  BtnStylingArea: {
    flexDirection: "row",
    backgroundColor: "#379aff",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: 150,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  BtnImageInfo: {
    height: "100%",
    width: 35,
    marginRight: 5,
  },
  btnTextColor: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    width: 80,
    textAlign: "center",
  },
  QuantityNumb: {
    color: "#0c76e6",
    backgroundColor: "white",
    height: 20,
    width: 20,
    paddingLeft: 6,
    position: "relative",
    zIndex: 2,
    marginLeft: -25,
    marginRight: 5,
    marginTop: "-12%",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#0c76e6",
    fontSize: 12,
    textAlignVertical: "center",
    justifyContent: "center",
  },
  DropOffPoint: {
    color: "white",
    backgroundColor: "#379aff",
    padding: 10,
    marginVertical: 10,
    width: 320,
    marginLeft: "auto",
    marginRight: "auto",
    shadowColor: "#cdcdcd",
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
    borderRadius: 10,
  },
  DropOffPointText: {
    color: "white",
    alignItems: "center",
    fontSize: 12,
  },
  iconInsideHand: {
    width: 40,
    height: 20,
    position: "absolute",
    right: 0,
    top: 8,
  },
  TextareaSubmit: {
    borderWidth: 1,
    borderColor: "#0d72fe",
    padding: 5,
    height: 50,
    marginVertical: 10,
    textAlignVertical: "top",
    fontSize: 12,
  },
  zeroPKR: {
    backgroundColor: "#c7c7c7",
  },
});
export default CollectPaymentScreen;
