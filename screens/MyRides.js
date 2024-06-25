//https://blog.jscrambler.com/add-a-search-bar-using-hooks-and-flatlist-in-react-native/
import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Linking,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DropOffImage from "../assets/images/dropoff_simple.png";
import PickUpImage from "../assets/images/pickup_simple.png";
import dropoffAndPickupImage from "../assets/images/dropoffAndPickup_simple.png";
import toBePackedImage from "../assets/images/tobepacked_simple.png";
import handImg from "../assets/images/hand_simple.png";
import Header from "../components/Header";
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
const DropOffImageURI = Image.resolveAssetSource(DropOffImage).uri;
const PickUpImageURI = Image.resolveAssetSource(PickUpImage).uri;
const dropoffAndPickupImageURI = Image.resolveAssetSource(dropoffAndPickupImage)
  .uri;
const toBePackedURI = Image.resolveAssetSource(toBePackedImage).uri;
const handImgURI = Image.resolveAssetSource(handImg).uri;
let selectedURI;
let dummyData = [
  {
    address: "dummy address",
    address_id: 25,
    buttonCall: "03343836748",
    buttonMap: "24.8159633, 67.0482452",
    buttonService: "Pickup",
    complete: 0,
    customer_id: 22,
    customer_name: "dummy name",
    id: 0,
    isComplete: true,
    isHFQ: false,
    isNew: true,
    note: null,
    order_id: 1,
    permenantNote: null,
    ref_order_id: null,
    rideTime: "11 mins",
    status_id: 1,
    status_id1: 1,
    status_id2: 6,
    time_at_loc: null,
    title: "1-DummyOrder",
  },
];
//-----------------FOR IMAGES-----------------//
const MyRides = (props) => {
  const URL = env.URL + env.api_todayrides;
  const [startDay, setStartDay] = useState();
  const [countFirstTime, setCountFirstTime] = useState(false);
  const [endDay, setEndDay] = useState();
  const [selectedId, setSelectedId] = useState(null);
  const [listData, setListData] = useState(dummyData);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshForDropOffPoint, setRefreshForDropOffPoint] = useState(false);
  const [endDayNotification, setEndDayNotification] = useState(false);
  var storedMeterData;
  // // ------This is to refresh when any delivery or pickup is done------//
  const refreshScreen = props.route.params;


  // if (startDay && !endDay && !endDayNotification && listData.length === 0) {
  //   Alert.alert("End Day", "End Your Day!", [
  //     { text: "OK", onPress: () => props.navigation.navigate("Meter Reading") },
  //   ]);
  //   setEndDayNotification(true);
  // }

  async function fetchStoredData() {
    try {
      storedMeterData = await AsyncStorage.getItem("meter");
      storedMeterData = JSON.parse(storedMeterData);
      setStartDay(storedMeterData.startDay);
      setEndDay(storedMeterData.endDay);
    } catch (e) {
      alert("Error In Getting Meter Status");
    }
  }

  useFocusEffect(
    useCallback(
      () => {
        try {
          fetchStoredData();
          fetchData();
          setCountFirstTime(true);
          setEndDayNotification(false);
        } catch (error) {
          Alert.alert(error);
        }
      },
      [refreshScreen, refreshForDropOffPoint],
    ))

  useEffect(() => {
    try {
      setEndDayNotification(false);
    } catch (error) {
    }
  }, [storedMeterData, refreshScreen]);

  const onRefresh = useCallback(() => {
    try {
      fetchData();
    } catch (e) {
    }
  }, [refreshing]);
  // ----------- FUNCTIONS STARTS HERE ---------- //
  const pressMap = (props_map) => (props) => {
    Linking.openURL(`http://maps.google.com/?daddr=${props_map}`);
  };
  const pressCall = (props_call) => (props) => {
    Linking.openURL(`tel://${props_call}`);
  };
  const changeScreen = (props_screen, props_navigation, item) => (props) => {
    const screenTitle = item.title;
    if (props_screen === "Drop Off") {
      // console.log({
      //   screenTitle: screenTitle,
      //   screenType: "Drop Off",
      //   orderID: item.order_id.toString(),
      //   customerID: item.customer_id,
      //   recentOrders: false,
      // });
      props_navigation.navigate("Drop Off", {
        screen: "DropOffScreen", params: {
          screenTitle: screenTitle,
          screenType: "Drop Off",
          orderID: item.order_id.toString(),
          customerID: item.customer_id,
          recentOrders: false,
        }
      });
    } else if (props_screen === "Pickup") {
      props_navigation.navigate("Pickup", {
        screenTitle: screenTitle,
        orderID: item.order_id.toString(),
        isUserNew: item.isNew,
        addressID: item.address_id, //required at backend
        customerID: item.customer_id,
        pickdropdata: null,
        recentOrders: false,
      });
    } else if (props_screen === "Pick & Drop") {
      props_navigation.navigate("Drop Off", {
        screen: "DropOffScreen", params: {
          screenTitle: screenTitle,
          screenType: "Pick & Drop",
          orderID: item.order_id.toString(),
          recentOrders: false,
        }
      });
    } else if (props_screen === "To Be Packed") {
    }
  };

  async function fetchData() {
    const { isConnected } = await NetInfo.fetch();
    storedRiderID = await AsyncStorage.getItem("rider_id");
    const finalURL = URL + `/${storedRiderID}`;
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
        setListData(responseJson);
        setRefreshing(false);
      } catch (error) {
        error = "Request Timeout, Check Your Connection"
          ? alert("Request Timeout, Check Your Connection")
          : alert("Server Error!");
        setRefreshing(false);
      }
    } else {
      Alert.alert("Internet Error!");
      setRefreshing(false);
    }
  }
  // ----------- FUNCTIONS ENDS HERE ------------//
  const renderItem = ({ item }) => {
    return (
      <Item
        item={item}
        onPress={() => setSelectedId(item.id)} // Use index as a fallback if id is missing
        style={styles.itemBoxStyle}
      />
    );
  };

  const Item = ({ item, onPress, style }) => {
    const dropOffPointAsk = () => {
      Alert.alert(
        "Drop Off Point",
        "Move To Hub",
        [
          {
            text: "Cancel",
            onPress: () => { },
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => {
              const { isConnected } = await NetInfo.fetch();
              storedRiderID = await AsyncStorage.getItem("rider_id");
              let urlMoveToHub = env.URL + env.api_movetohub;
              if (isConnected) {
                try {
                  setRefreshing(true);
                  let savedToken = await SecureStore.getItemAsync("token");
                  savedToken = savedToken.substring(1, savedToken.length - 1);
                  let myHeaders = new Headers();
                  myHeaders.append("Authorization", `Bearer ${savedToken}`);
                  myHeaders.append("Content-Type", "application/json");
                  let raw = JSON.stringify({
                    rider_id: storedRiderID,
                    ids: item.ids,
                  });
                  var requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow",
                  };
                  let response = await fetchWithTimeout(
                    urlMoveToHub,
                    requestOptions,
                    10000,
                    "Request Timeout, Check Your Connection"
                  );
                  let responseJson = await response.json();
                  refreshForDropOffPoint
                    ? setRefreshForDropOffPoint(false)
                    : setRefreshForDropOffPoint(true);
                  setRefreshing(false);
                } catch (error) {
                  error = "Request Timeout, Check Your Connection"
                    ? alert("Request Timeout, Check Your Connection")
                    : alert("Server Error!");
                  setRefreshing(false);
                }
              } else {
                Alert.alert("Internet Error!");
                setRefreshing(false);
              }
            },
          },
        ],
        { cancelable: false }
      );
      //this is a function for drop off point only in which IDs are sent back to server.
    };
    if (item.buttonService === "Drop Off") {
      selectedURI = DropOffImageURI;
    } else if (item.buttonService === "Pickup") {
      selectedURI = PickUpImageURI;
    } else if (item.buttonService === "Pick & Drop") {
      selectedURI = dropoffAndPickupImageURI;
    } else if (item.buttonService === "To Be Packed") {
      selectedURI = toBePackedURI;
    }
    if (item.isComplete === true) return <View></View>;
    let HFQColor;
    item.isHFQ ? (HFQColor = "#c7c7c7") : (HFQColor = "#ffffff");
    if (item.title === "Drop Off Point")
      return (
        <TouchableOpacity style={styles.DropOffPoint} onPress={dropOffPointAsk}>
          <Text style={styles.DropOffPointText}>
            {item.title} - {item.time}
          </Text>
          <Image
            source={{ uri: handImgURI }}
            style={styles.iconInsideHand}
            resizeMode="contain"
          />
        </TouchableOpacity>
      );
    else
      return (
        <TouchableOpacity style={[styles.item, { backgroundColor: HFQColor }]}>
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
              Timeslot
            </Text>{" "}
            {item.time_slot}
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
              onPress={changeScreen(item.buttonService, props.navigation, item)}
              style={[styles.BtnInfo, style]}
            >
              <View style={styles.BtnStylingArea}>
                <Image
                  source={{ uri: selectedURI }}
                  style={styles.BtnImageInfo}
                  resizeMode="contain"
                />
                {item.serviceQuantity ? (
                  <Text style={styles.QuantityNumb}>
                    {item.serviceQuantity}
                  </Text>
                ) : null}

                <Text style={styles.btnTextColor}>{item.buttonService}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
  };
  return (
    <View style={styles.container}>
      <Header
        toggleDrawer={props.navigation.toggleDrawer}
        screenName={props.route.name}
      />
      <View style={styles.mainView}>
        <View style={styles.subContainer}>
          {
            //if startDay is true, show FlatList
            startDay ? (
              <FlatList
                data={listData}
                renderItem={renderItem}
                keyExtractor={(item) => item.order_id.toString()}
                extraData={selectedId}
                style={styles.TestDev}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            ) : (
              <TouchableOpacity
                style={styles.MeterReadingView}
                onPress={() => {
                  props.navigation.navigate("MeterReading");
                }}
              >
                <Text style={{ color: "white" }}>Start Your Day</Text>
              </TouchableOpacity>
            )
          }
        </View>
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
    marginBottom: 30,
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
    textAlign: "center",
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
  subContainer: {
    minHeight: 420,
  },
});
export default MyRides;
