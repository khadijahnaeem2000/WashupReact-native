import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  ActivityIndicator,
  LogBox,
  BackHandler,
  RefreshControl,
  Platform,
} from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import Header from "../components/Header";
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

const DropOff = ({ navigation, route }) => {
  const notificationListener = useRef();
  const responseListener = useRef();
  let storedEmail;
  let countQRScans = 0;
  let QRScanHeading;
  let initialURL;

  const { screenTitle, screenType, orderID, customerID } = route?.params;

  const [refreshingStoredData, setRefreshingStoredData] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [QRState, setQRState] = useState(false);
  const [allQRscanned, setAllQRscanned] = useState(false);
  const [listData, setListData] = useState([]);
  const [paymentSent, setPaymentSent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });


  // useFocusEffect(
  useEffect(() => {
    fetchData();
  }, [])
  // )

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
        title: "Washup!",
        body: "Order Delivered!",
      },
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
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: process.env.NODE_ENV === 'development' ? "com.shameel123.WashupMobileApp.dev" : "com.shameel123.WashupMobileApp"
      })).data;
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
    setAllQRscanned(false);
    fetchData();
  }, [screenTitle, orderID]);


  if (isNaN(receivedAmount)) {
    let value = receivedAmount;
    value = value.substring(0, value.length - 1);
    Alert.alert("Value is Not Number");
    setReceivedAmount(value);
  }
  if (refreshing) {
    return (
      <View style={styles.container}>
        <Header
          toggleDrawer={navigation.toggleDrawer}
          screenName={screenTitle}
        />
        <View style={styles.mainView}>
          <ActivityIndicator size="large" color="#0c76e6" />
        </View>
      </View>
    );
  }
  async function fetchData() {
    setPaymentSent(false);
    setReceivedAmount("");
    const { isConnected } = await NetInfo.fetch();
    screenType === "DropOff"
      ? (initialURL = env.URL + env.api_dropoff)
      : (initialURL = env.URL + env.api_pickdrop);
    storedRiderID = await AsyncStorage.getItem("rider_id");
    const finalURL = initialURL + `/${storedRiderID}/${orderID}`;
    let response;
    let responseJson;
    if (isConnected) {
      try {
        try {
          let savedToken = await SecureStore.getItemAsync("token");
          savedToken = savedToken.substring(1, savedToken.length - 1);
          let myHeaders = new Headers();
          myHeaders.append("Accept", "application/json");
          myHeaders.append("Authorization", `Bearer ${savedToken}`);
          let requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow",
          };
          setRefreshing(true);
          response = await fetchWithTimeout(
            finalURL,
            requestOptions,
            10000,
            "Request Timeout, Check Your Connection"
          );
          responseJson = await response.json();
          setRefreshing(false);
        } catch (e) {
          alert("Server Error!");
          setRefreshing(false);
        }
        setRefreshing(false);
        setListData(responseJson);
        for (let key in responseJson.polybag_items) {
          responseJson.polybag_items[key]["polybag_qr"] = null;
        }
      } catch (error) {
        error = "Request Timeout, Check Your Connection"
          ? alert("Request Timeout, Check Your Connection")
          : alert("Server Error!");
        setRefreshing(false);
      }
    } else {
      Alert.alert("Internet Error!");
    }
  }
  async function fetchAnotherOrder() {
    let addAnotherOrderURL =
      env.URL + env.api_addanotherorder + `/${storedRiderID}/${customerID}`;
    const { isConnected } = await NetInfo.fetch();
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
        setRefreshing(false);
        navigation.navigate("Pickup", {
          pickdropdata: response,
          screenTitle: response.title,
          orderID: response.order_id,
          isNew:true
        });
      } catch (error) {
        setRefreshing(false);
        error = "Request Timeout, Check Your Connection"
          ? alert("Request Timeout, Check Your Connection")
          : alert("Server Error!");
      }
    } else {
      setRefreshing(false);
      Alert.alert("Internet Error!");
    }
  }
  const paymentFunc = async (received_amount,) => {
    if (!received_amount) {
      Alert.alert("Insert Received Amount!");
      return;
    }
    storedRiderID = await AsyncStorage.getItem("rider_id");
    const sendDataObj = {
      order_id: orderID,
      rider_id: storedRiderID,
      received_amount: parseInt(received_amount),
      polybag_items: listData.polybag_items,
    };
    const paymentURL = env.URL + env.api_payment;
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
        },
      ],
      { cancelable: false }
    );
    setRefreshing(true);
    fetchWithTimeout(
      paymentURL,
      requestOptions,
      10000,
      "Request Timeout, Check Your Connection"
    )
      .then((response) => response.text())
      .then((result) => {
        let paymentResponse;
        if (typeof result === "string") {
          paymentResponse = JSON.parse(result.toString());
        } else {
          paymentResponse = result;
        }
        if (paymentResponse.status === "success" && !paymentResponse.data) {
          alert("Data Sent!");
          schedulePushNotification();
          setPaymentSent(true);
          setRefreshing(false);
        } else if (
          paymentResponse.status === "success" &&
          paymentResponse.data.original
        ) {
          alert("Data Sent!");
          setRefreshing(false);
          schedulePushNotification();
          navigation.navigate("MyRides");
        } else if (paymentResponse.status === 'failed') {
          alert(paymentResponse.error);
          setRefreshing(false);
          navigation.goBack()
        }

        else {
          Alert.alert("Server Error! Data Not Sent!!");
          setRefreshing(false);
        }
      })
      .catch((error) => {
        error = "Request Timeout, Check Your Connection"
          ? alert("Request Timeout, Check Your Connection")
          : alert("Server Error!");
        setRefreshing(false);
      });
  };
  //------------- FUNCTIONS END HERE -----------//
  const Item = ({ item, onPress }) => {
    return (
      <View style={styles.RowData}>
        <Text style={[styles.RowText, styles.RowTextCol2]}>
          {item.service_name}
        </Text>
        <Text style={[styles.RowText, styles.RowTextCol]}>
          {" "}
          {item.service_item}
        </Text>
        <Text style={[styles.RowText, styles.RowTextCol3]}>
          {item.service_weight}
        </Text>
        <Text style={[styles.RowText, styles.RowTextCol4]}>
          {item.service_price}
        </Text>
      </View>
    );
  };
  const ItemPolybag = ({ item, onPress }) => {


    const scanQRFunc = (qrData) => {
      item.polybag_qr = qrData;
      for (let key in listData.polybag_items) {
        listData.polybag_items[key]["polybag_qr"] ? (countQRScans += 1) : null;
      }
      if (countQRScans === parseInt(listData.polybag)) {
        QRScanHeading = [styles.TapableBox, styles.ScanTapperGreen];
        setAllQRscanned(true);
      }

      QRState ? setQRState(false) : setQRState(true);
    };
    let colorQR = null;
    item.polybag_qr
      ? (colorQR = [styles.ScanTapper, styles.ScanTapperGreen])
      : (colorQR = [styles.ScanTapper]);
    return (
      <View style={styles.RowData}>
        <Text style={[styles.RowText, styles.RowTextCol2]}>
          {item.polybag_name}
        </Text>
        <Text style={[styles.RowText, styles.RowTextCol4]}>
          {item.polybag_number}
        </Text>
        <View style={[styles.RowText, styles.RowTextCol2, styles.TextRIght]}>
          <TouchableOpacity
            style={colorQR}
            onPress={() => {
              !item.polybag_qr
                ? navigation.navigate("QRCode", {
                  itemData: item,
                  scanQRFunc: scanQRFunc,
                })
                : null;
            }}
          >
            <Icon name="barcode-scan" style={styles.ScanTapperIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const renderItem = ({ item }) => {
    return (
      <Item
        item={item}
        onPress={() => setSelectedId(item.id)}
        style={styles.itemBoxStyle}
      />
    );
  };

  const renderPolybag = ({ item }) => {
    return (
      <ItemPolybag
        item={item}
        onPress={() => setSelectedId(item.id)}
        style={styles.itemBoxStyle}
      />
    );
  };
  const renderHeader = () => {
    return (
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: 5,
          marginTop: 0,
        }}
      >
        <View style={styles.RowData}>
          <Text style={[styles.RowHeadText, styles.RowTextCol2]}>
            Service Name
          </Text>
          <Text style={[styles.RowHeadText, styles.RowTextCol]}>Items</Text>
          <Text style={[styles.RowHeadText, styles.RowTextCol3]}>Weight</Text>
          <Text style={[styles.RowHeadText, styles.RowTextCol4]}>Price</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <Header
        toggleDrawer={navigation.toggleDrawer}
        screenName={screenTitle}
      />
      <View style={styles.mainView}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshingStoredData}
              onRefresh={() => fetchData()}
            />
          }
        >
          <FlatList
            ListHeaderComponent={renderHeader}
            data={listData.Services}
            renderItem={renderItem}
            keyExtractor={(item) => item.service_id.toString()}
            extraData={selectedId}
            style={styles.TestDev}
          />
          <View style={styles.RowData}>
            <Text style={[styles.RowText, styles.RowTextHalf]}>
              <Text>Delivery Charges:</Text>
            </Text>
            <Text
              style={[styles.RowText, styles.RowTextHalf, styles.TextRIght]}
            >
              {listData.delivery_charges}
            </Text>
          </View>
          <View style={styles.RowData}>
            <Text style={[styles.RowText, styles.RowTextHalf]}>
              <Text>Total:</Text>
            </Text>
            <Text
              style={[styles.RowText, styles.RowTextHalf, styles.TextRIght]}
            >
              {listData.total}
            </Text>
          </View>
          <View style={styles.ActionArea}>
            <View
              style={
                allQRscanned
                  ? (QRScanHeading = [
                    styles.TapableBox,
                    styles.ScanTapperGreen,
                  ])
                  : (QRScanHeading = [styles.TapableBox])
              }
            >
              <Text style={styles.TapableText}>
                QR SCAN: Check From PolyBag
              </Text>
            </View>
            <Text>Polybag: {listData.polybag}/pieces</Text>
          </View>
          <FlatList
            data={listData.polybag_items}
            renderItem={renderPolybag}
            keyExtractor={(item) => item.polybag_id.toString()}
            extraData={QRState}
            style={styles.TestDev}
          />
          <View style={styles.ActionArea}>
            <Text style={styles.HeadText}>Payment</Text>
          </View>
          <View style={styles.RowData}>
            <Text style={[styles.RowText, styles.RowTextHalf]}>
              <Text>Order Amount:</Text>
            </Text>
            <Text
              style={[styles.RowText, styles.RowTextHalf, styles.TextRIght]}
            >
              {listData.order_amount}
            </Text>
          </View>
          <View style={styles.RowData}>
            <Text style={[styles.RowText, styles.RowTextHalf]}>
              <Text>Wallet Amount: </Text>
            </Text>
            <Text
              style={[styles.RowText, styles.RowTextHalf, styles.TextRIght]}
            >
              {listData.wallet_amount}
            </Text>
          </View>
          <View style={styles.RowData}>
            <Text style={[styles.RowText, styles.RowTextHalf]}>
              <Text>Payable Amount: </Text>
            </Text>
            <Text
              style={[styles.RowText, styles.RowTextHalf, styles.TextRIght]}
            >
              {listData.payable_amount}
            </Text>
          </View>
          <View style={styles.RowData}>
            <Text style={[styles.RowText, styles.RowTextHalf]}>
              <Text>Receieved Amount:</Text>
            </Text>
            <View
              style={[
                styles.RowText,
                styles.RowTextHalf,
                styles.TextRIght,
                styles.PullRight,
              ]}
            >
              <View style={styles.AmountInputContainer}>
                <TextInput
                  style={styles.AmountInput}
                  autoCorrect={false}
                  keyboardType="phone-pad"
                  placeholder="Enter Amount"
                  textAlign={"right"}
                  onChangeText={setReceivedAmount}
                  value={receivedAmount}
                />
              </View>
            </View>
          </View>
          <View style={styles.ActionArea}>
            <TouchableOpacity
              disabled={paymentSent ? true : false}
              style={
                allQRscanned
                  ? (QRScanHeading = [
                    styles.TapableBox,
                    styles.ScanTapperGreen,
                  ])
                  : (QRScanHeading = [styles.TapableBox])
              }
              onPress={() => paymentFunc(receivedAmount)}
            >
              <Text style={styles.TapableText}>Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={paymentSent ? true : false}
              style={styles.TapableBox}
              onPress={() => {
                navigation.navigate("Cancel", {
                  rider_id: storedEmail,
                  order_id: orderID,
                  screenTitle: screenTitle,
                  recentOrders: route?.params?.recentOrders,
                });
              }}
            >
              <Text style={styles.TapableText}>Cancel</Text>
            </TouchableOpacity>
            {paymentSent ? (
              <View>
                <Text style={styles.bottomText}>Place a New Order</Text>
                <View style={styles.PlaceOrder}>
                  <TouchableOpacity
                    style={[
                      styles.TapableBox,
                      styles.PlaceOrderYes,
                      styles.PlaceOrderBtns,
                    ]}
                    onPress={() => {
                      setPaymentSent(false);
                      fetchAnotherOrder();
                    }}
                  >
                    <Text style={styles.TapableText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.TapableBox,
                      styles.PlaceOrderNoThanks,
                      styles.PlaceOrderBtns,
                    ]}
                    onPress={() => {
                      setPaymentSent(false);
                      navigation.navigate("MyRides", {
                        order_completed: orderID,
                      });
                    }}
                  >
                    <Text style={styles.TapableText}>No Thanks</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};


export default DropOff


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainView: {
    flex: Dimensions.get("window").height < 600 ? 4.3 : 4.8,
    backgroundColor: "white",
    padding: 0,
  },
  RowData: {
    flexDirection: "row",
    margin: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#7d7d7d",
  },
  RowText: {
    color: "#7d7d7d",
    flexDirection: "row",
    textAlign: "left",
  },
  textService: {
    color: "#0d72fe",
    fontWeight: "bold",
    fontSize: 16,
  },
  RowHeadText: {
    color: "#0d72fe",
    fontWeight: "bold",
    flexDirection: "row",
    textAlign: "left",
  },
  RowTextCol: {
    width: "22%",
  },
  RowTextCol2: {
    width: "40%",
  },
  RowTextCol3: {
    width: "20%",
  },
  RowTextCol4: {
    width: "18%",
    paddingLeft: 10,
  },
  RowTextHalf: {
    width: "50%",
  },
  TextRIght: {
    textAlign: "right",
  },
  item: {
    padding: 20,
    marginVertical: 10,
    width: 320,
    marginLeft: "auto",
    marginRight: "auto",
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
    backgroundColor: "#0c76e6",
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
    backgroundColor: "#0c76e6",
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
    backgroundColor: "#0c76e6",
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
  TapableBox: {
    backgroundColor: "#0d72fe",
    borderRadius: 4,
    // marginVertical:10,
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: "#cdcdcd",
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  TapableText: {
    color: "white",
    textAlign: "center",
  },
  ScanTapper: {
    backgroundColor: "#0d72fe",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 5,
    width: "100%",
    marginTop: -5,
  },
  ScanTapperGreen: {
    backgroundColor: "green",
  },
  ScanTapperIcon: {
    color: "white",
    fontSize: 18,
    marginLeft: "auto",
    marginRight: "auto",
  },
  ActionArea: {
    paddingHorizontal: 10,
  },
  bottomText: {
    color: "#0d72fe",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  PlaceOrder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    // marginTop:10,
  },
  PlaceOrderYes: {
    marginRight: 10,
    alignItems: "center",
  },
  PlaceOrderNoThanks: {
    marginLeft: 10,
    backgroundColor: "#bebebe",
  },
  AmountInputContainer: {
    // paddingLeft:70
  },
  AmountInput: {
    textAlign: "right",
  },
  PullRight: {
    justifyContent: "flex-end",
  },
  PlaceOrderBtns: {
    width: 130,
    marginBottom: 30,
  },
});
