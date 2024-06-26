import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";
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

const OrdersPayment = ({navigation , route}) => {

  let regularOrderObj = [
    {
      order_id: 0,
      order_amount: "0",
    },
  ];

  let paymentOnlyOrderObj = [
    {
      order_id: 0,
      order_amount: "0",
    },
  ];

  const URL = env.URL + env.api_report;
  const [regularOrder, setRegularOrder] = useState(regularOrderObj);
  const [paymentOrder, setPaymentOrder] = useState(paymentOnlyOrderObj);
  const [totalAmount, setTotalAmount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
      fetchData();
  }, []);


  if (refreshing) {
    return (
      <View style={styles.container}>
        <Header
          toggleDrawer={navigation.toggleDrawer}
          screenName={route.name}
        />
        <View style={styles.mainView}>
          <ActivityIndicator size="large" color="#0c76e6" />
        </View>
      </View>
    );
  }

  async function fetchData() {
    const { isConnected } = await NetInfo.fetch();
    storedRiderID = await AsyncStorage.getItem("rider_id");
    let finalURL = URL + `/${storedRiderID}/`;
    if (isConnected) {
      try {
        setRefreshing(true);
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
        let response = await fetchWithTimeout(
          finalURL,
          requestOptions,
          10000,
          "Request Timeout, Check Your Connection"
        );
        setRefreshing(false);
        let responseJson = await response.json();

        if (responseJson.regular_order.length === 0) {
          setRegularOrder(regularOrderObj);
        } else {
          setRegularOrder(responseJson.regular_order);
        }
        if (responseJson.regular_order.length === 0) {
          setPaymentOrder(paymentOnlyOrderObj);
        } else {
          setPaymentOrder(responseJson.payment_only_rides);
        }

        // setRegularOrder(responseJson.regular_order);
        // setPaymentOrder(responseJson.payment_only_rides);
        setTotalAmount(responseJson.total_amount);
      } catch (error) {
        error = "Request Timeout, Check Your Connection"
          ? alert("Request Timeout, Check Your Connection")
          : alert("Server Error!");
      }
    } else {
      Alert.alert("Internet Error!");
    }
  }

  let renderRegularOrder = (props) => {
    return (
      <View style={styles.tabledataRow}>
        <Text style={styles.tabledataText}>{props.item.order_id}</Text>
        <Text style={styles.tabledataAmount}>{props.item.order_amount}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        toggleDrawer={navigation.toggleDrawer}
        screenName={route.name}
      />
     
      <View style={styles.mainView}>
        <View style={styles.subTotal}>
          <TouchableOpacity
            onPress={() => fetchData()}
            style={styles.iconStyle}
          >
            <Icon name="reload" color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.subTotal_text}>{totalAmount} PKR</Text>
        </View>
       
        <View style={styles.tableHead}>
          <Text style={styles.tabHeadingtext}>Regular Order #</Text>
          <Text style={styles.tabHeadingtext}>Payment</Text>
        </View>
        <FlatList
          data={regularOrder}
          renderItem={renderRegularOrder}
          keyExtractor={(item) => item.order_id.toString()}
          style={styles.PaymentDataTables}
        />
        <View style={styles.marginTopAdd}>
          <View style={styles.tableHead}>
            <Text style={styles.tabHeadingtext}>Payment Only Rides #</Text>
            <Text style={styles.tabHeadingtext}>Payment</Text>
          </View>
        </View>

        <FlatList
          data={paymentOrder}
          renderItem={renderRegularOrder}
          keyExtractor={(item) => item.order_id.toString()}
          style={styles.PaymentDataTables}
        />
      </View>
    </View>
  );
};

export default OrdersPayment;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainView: {
    flex: Dimensions.get("window").height < 600 ? 4.3 : 4.8,
    backgroundColor: "white",
    paddingTop: 20,
  },
  FieldTitle: {
    fontSize: 18,
    color: "#403e3f",
    marginBottom: 5,
    paddingLeft: 10,
    fontWeight: "bold",
  },
  TextInField: {
    backgroundColor: "white",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#cfcfcf",
    paddingLeft: 10,
    color: "#5a5a5a",
    fontSize: 14,
  },
  dropOffAndPickUpImage: {
    width: 110,
    height: 100,
    marginLeft: 0,
    left: -50,
    top: 10,
    marginRight: "auto",
    position: "absolute",
  },
  bottomImagesContainer: {
    width: Dimensions.get("window").height < 600 ? 240 : 220,
    flex: 1,
    marginLeft: "auto",
    marginRight: "auto",
    position: "relative",
    zIndex: 1,
    marginTop: 20,
    marginBottom: 20,
  },
  bottomImagesContentContainer: {
    alignItems: "center",
    backgroundColor: "#1767ae",
    paddingTop: 20,
    paddingLeft: 55,
    paddingBottom: 20,
    borderRadius: 10,
    position: "relative",
    zIndex: -1,
    marginTop: 0,
  },
  dropOffPickUp: {
    fontSize: 16,
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dropOffPickUpDynamic: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    lineHeight: 50,
    marginTop: 10,
  },
  horizontalLine: {
    borderBottomWidth: 1,
    marginHorizontal: 14,
    borderColor: "grey",
    marginBottom: 20,
  },
  PickerDesign: {
    marginLeft: 30,
  },
  subTotal: {
    padding: 5,
    textAlign: "center",
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b6bd1",
    margin: 10,
    marginTop: 0,
    marginBottom: 20,
    borderRadius: 5,
    position: "relative",
  },
  subTotal_text: {
    color: "white",
    alignContent: "center",
    fontSize: 18,
    textAlign: "center",
    // marginTop: 0,
    fontWeight: "bold",
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#0b6bd1",
    // justifyContent: "space-around",
    justifyContent: "space-between",
    padding: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
    margin: 10,
    marginTop: 0,
  },
  tabHeadingtext: {
    color: "white",
    fontSize: 15,
  },
  tabledataRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingLeft: 22,
    paddingRight: 22,
    justifyContent: "space-between",
    paddingVertical: 5,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#cdcdcd",
    // flex: 4,
  },
  tabledataText: {
    fontSize: 14,
    width: "80%",
    color: "#717171",
    fontWeight: "bold",
  },
  tabledataAmount: {
    fontSize: 14,
    // width: "80%",
    color: "#717171",
    fontWeight: "bold",
  },
  PaymentDataTables: {
    height: 215,
  },
  marginTopAdd: {
    marginTop: 20,
  },
  iconStyle: {
    position: "absolute",
    right: 15,
    left: "auto",
    color: "white",
    zIndex: 9,
  },
});

