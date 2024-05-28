//https://blog.jscrambler.com/add-a-search-bar-using-hooks-and-flatlist-in-react-native/
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  BackHandler,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";
import Header from "../components/Header";
import { env } from "../env";
import { useRoute } from "@react-navigation/native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

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


const ConfirmOrderScreen = (props) => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  const order_id = props.route.params.order_id;
  const customer_name = props.route.params.customer_name;
  const customer_id = props.route.params.customer_id;
  const order_note = props.route.params.order_note;
  const rider_id = props.route.params.rider_id;
  const location = props.route.params.location;
  const isUserNew = props.route.params.isUserNew;
  const addressID = props.route.params.addressID;
  const recentOrders = props.route.params.recentOrders;
  const [showBottomContent, setShowBottomContent] = useState(false);
  const [listData, setListData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isDataSent, setIsDataSent] = useState(false);
  const [enableYes, setEnableYes] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(response);
      }
    );
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);


  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Washup",
        body: "Done!",
        // data: { data: 'goes here' },
      },
      // trigger: { seconds: 2 ƒ√},
      trigger: null,
    });
  }
  async function registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
      const {
        status: existingStatus,
      } = await Notifications.getPermissionsAsync();
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
  useEffect(() => {
    setIsDataSent(false);
    setEnableYes(true);
    setShowBottomContent(false);
  }, [order_id]);


  if (refreshing) {
    return (
      <View style={styles.container}>
        <Header
          toggleDrawer={props.navigation.toggleDrawer}
          screenName="Confirm Screen"
        />
        <View style={styles.mainView}>
          <ActivityIndicator size="large" color="#0c76e6" />
        </View>
      </View>
    );
  }
  const confirmFunc = async () => {
    let items_selected = [];
    for (let key in listData) {
      // console.log("--8")
      if (listData[key]["quantity"] > 0) {
        // console.log(listData[key])
        items_selected.push(listData[key]);
      }
    }
    let sendDataObj;
    isUserNew
      ? (sendDataObj = {
          rider_id: rider_id,
          order_id: order_id,
          order_note: order_note,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address_id: addressID,
        })
      : (sendDataObj = {
          rider_id: rider_id,
          order_id: order_id,
          order_note: order_note,
        });
    console.log(sendDataObj);
    const confirmURL = env.URL + env.api_confirmpickup;
    console.log("Sending Data To: ", confirmURL);
    let savedToken = await SecureStore.getItemAsync("token");
    
    savedToken = savedToken.substring(1, savedToken.length - 1);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${savedToken}`);
    var raw = JSON.stringify(sendDataObj);
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    Alert.alert(
      "Sending Data",
      "Please Wait",
      [
        {
          // text: "Cancel",
          // onPress: () => console.log("Cancel Pressed"),
          // style: "cancel"
        },
      ],
      { cancelable: false }
    );
    // setRefreshing(true);
    fetchWithTimeout(
      confirmURL,
      requestOptions,
      10000,
      "Request Timeout, Check Your Connection"
    )
      .then((response) => response.text())
      .then((result) => {
        console.log("---123");
        console.log(result, typeof result);

        if (typeof result === "string") {
          console.log("--1", result);
          confirmResponse = JSON.parse(result);
          console.log("--11", confirmResponse);
        } else {
          confirmResponse = result;
          console.log("--2", confirmResponse);
        }
        console.log(confirmResponse);
        if (confirmResponse.status === "success") {
          console.log("Data Sent Successfuly!")
          console.log("data is here order is here ",order_id)

          alert("Data Sent!");
          schedulePushNotification();
          setIsDataSent(true);
          setEnableYes(false);
          setRefreshing(false);
          props.route.params.setOrderNote("");
        }else if(confirmResponse.status === 'failed'){
          alert(confirmResponse.error);
          schedulePushNotification();
          setIsDataSent(true);
          setEnableYes(false);
          setRefreshing(false);
          props.route.params.setOrderNote("");
          if (recentOrders) {
            props.navigation.navigate("Recent Orders", {
              order_completed: order_id,
            });
          } else {
            console.log("data is here order is here",order_id)
            props.navigation.navigate("My Rides", {
              order_completed: order_id,
            });
          }
        } 
        else {
          Alert.alert("Server Error! Data Not Sent!");
          setRefreshing(false);
        }
      })
      .catch((error) => {
        setRefreshing(false);
        console.log("--000--");
        error = "Request Timeout, Check Your Connection"
          ? alert("Request Timeout, Check Your Connection")
          : alert("Server Error!");
        console.log(error);
        console.log("--001--");
      });
  };

  async function fetchData() {
    const { isConnected } = await NetInfo.fetch();
    let storedRiderID = await AsyncStorage.getItem("rider_id");
    let savedToken = await SecureStore.getItemAsync("token");
    savedToken = savedToken.substring(1, savedToken.length - 1);
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${savedToken}`);
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    let addAnotherOrderURL =
      env.URL + env.api_addanotherorder + `/${storedRiderID}/${customer_id}`;
    console.log("Fetching Data From:", addAnotherOrderURL);
    console.log("Token --->", savedToken);
    if (isConnected) {
      try {
        setRefreshing(true);
        let response = await fetchWithTimeout(
          addAnotherOrderURL,
          requestOptions,
          10000,
          "Request Timeout, Check Your Connection"
        );
        response = await response.json();
        console.log(response);
        setEnableYes(false);
        props.navigation.navigate("Pickup", {
          pickdropdata: response,
          screenTitle: response.title,
          orderID: response.order_id,
        });
        setRefreshing(false);
      } catch (error) {
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

  async function fetchnodata() {
    const { isConnected } = await NetInfo.fetch();
    let storedRiderID = await AsyncStorage.getItem("rider_id");
    let savedToken = await SecureStore.getItemAsync("token");
    savedToken = savedToken.substring(1, savedToken.length - 1);
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${savedToken}`);
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    let addAnotherOrderURL =
      env.URL + env.api_ordercancel + `/${order_id}/${rider_id}`;
    console.log("Fetching Data From:", addAnotherOrderURL);
    console.log("Token --->", savedToken);
    if (isConnected) {
      try {
        setRefreshing(true);
        let response = await fetchWithTimeout(
          addAnotherOrderURL,
          requestOptions,
          10000,
          "Request Timeout, Check Your Connection"
        );
        response = await response.json();
        console.log(response);
        setEnableYes(false);
        Alert.alert(
          "Success",
          "",
          [
            {
              text: "OK",
              onPress: () => props.navigation.navigate("My Rides"), // Remove unnecessary empty object
            }
          ],
          { cancelable: false }
        );
        setRefreshing(false);
      } catch (error) {
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

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to go back?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'YES', onPress: async () => {
          console.log("isDataaSentttt" , isDataSent)
          if(isDataSent){
            fetchnodata()
          }else{
            props.navigation.goBack()
          }
        }},
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);



console.log("COnfirm Screeen me khara heee")
  
  //------------- FUNCTIONS END HERE -----------//
  if (refreshing) {
    return (
      <View style={styles.container}>
        <Header
          toggleDrawer={props.navigation.toggleDrawer}
          screenName={props.route.params.screenHeader}
          // backButton={props.navigation.goBack}
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
        screenName="Confirm"
      />
      <View style={styles.mainView}>
        <View style={styles.screenContainer}>
          <View style={styles.objContainer}>
            <Text style={styles.textHeader}>Order No.</Text>
            <Text style={styles.textSimple}>{order_id}</Text>
          </View>
          <View style={styles.objContainer}>
            <Text style={styles.textHeader}>Customer Name</Text>
            <Text style={styles.textSimple}>{customer_name}</Text>
          </View>
          <TouchableOpacity
            style={
              showBottomContent
                ? [styles.buttonStretched, { backgroundColor: "#0C76E6" }]
                : [styles.buttonStretched]
            }
            onPress={() =>
              showBottomContent
                ? setShowBottomContent(false)
                : setShowBottomContent(true)
            }
          >
            <Text style={{ color: "white" }}>
              Write Order Number On Card To Finalize The Order
            </Text>
          </TouchableOpacity>
        </View>
        {showBottomContent ? (
          <View>
            <TouchableOpacity
              style={[styles.buttonStretched, { marginLeft: "3%" }]}
              onPress={confirmFunc}
              disabled={isDataSent ? true : false}
            >
              <Text style={{ color: "white" }}>✓ Order Final</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {isDataSent ? (
          <View style={styles.addCustomerContainer}>
            <Text>Want to add another order for the customer?</Text>
            <View style={styles.addCustomerContainerButtons}>
              <TouchableOpacity
                style={styles.bottomMostButton}
                onPress={fetchData}
                disabled={enableYes ? true : false}
              >
                <Text style={{ color: "white" }}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.bottomMostButton,
                  { backgroundColor: "#c1c1c1" },
                ]}
                onPress={fetchnodata}

                // onPress={() => {
                //   senddatano

                //   if (recentOrders) {
                //   //   props.navigation.navigate("Recent Orders", {
                //   //     order_completed: order_id,
                //   //   });
                //   // } else {
                //   //   props.navigation.navigate("My Rides", {
                //   //     order_completed: order_id,
                //   //   });
                  
                //   }
                // }}
              >
                
                <Text style={{ color: "white" }}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
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
    backgroundColor: "white",
    padding: 0,
  },
  screenContainer: {
    marginTop: "5%",
    marginLeft: "3%",
  },
  objContainer: {
    marginTop: "3%",
    borderBottomWidth: 1,
    borderBottomColor: "#c1c1c1",
  },
  textHeader: {
    fontSize: 14,
    color: "#0C76E6",
    fontWeight: "bold",
  },
  textSimple: {
    marginTop: "3%",
    marginLeft: "5%",
    marginBottom: "1%",
  },
  buttonStretched: {
    marginTop: "5%",
    backgroundColor: "#0C76E6",
    borderRadius: 5,
    //   width:"100%",
    marginRight: "4%",
    //   height:"14%",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addCustomerContainer: {
    margin: "4%",
  },
  addCustomerContainerButtons: {
    margin: "4%",
    flexDirection: "row",
    justifyContent: "flex-end",
    // paddingLeft:10
    // margin:10
  },
  bottomMostButton: {
    paddingVertical: 10,
    width: 80,
    alignItems: "center",
    // paddingHorizontal:10,
    backgroundColor: "#0C76E6",
    marginLeft: 10,
    borderRadius: 10,
  },
});
export default ConfirmOrderScreen;
