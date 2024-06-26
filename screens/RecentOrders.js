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

const DropOffImageURI = Image.resolveAssetSource(DropOffImage).uri;
const PickUpImageURI = Image.resolveAssetSource(PickUpImage).uri;
const dropoffAndPickupImageURI = Image.resolveAssetSource(dropoffAndPickupImage).uri;
const toBePackedURI = Image.resolveAssetSource(toBePackedImage).uri;
const handImgURI = Image.resolveAssetSource(handImg).uri;
let selectedURI;

const RecentOrders = ({navigation , route}) => {
  const URL = env.URL + env.api_recentorders;
  const refreshScreen = route.params;
  var storedMeterData;


  const [selectedId, setSelectedId] = useState(null);
  const [listData, setListData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);


  async function fetchStoredData() {
    let currentDate = new Date();
    let currentDay = currentDate.getDay();
    storedMeterData = await AsyncStorage.getItem("meter");
    storedMeterData = JSON.parse(storedMeterData);

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

  useEffect(() => {
      fetchData();
  }, [refreshScreen]);

  useEffect(() => {
      fetchStoredData();
  }, [storedMeterData, refreshScreen]);

  const onRefresh = useCallback(() => {
      fetchData();
  }, [refreshing]);

  const pressMap = (props_map)  => {
    Linking.openURL(`http://maps.google.com/?daddr=${props_map}`);
  };

  const pressCall = (props_call) => {
    Linking.openURL(`tel://${props_call}`);
  };

  const changeScreen = (props_screen, item) => {
    const screenTitle = item.title;
    if (props_screen === "Pickup") {
      navigation.navigate("Pickup", {
        screenTitle: screenTitle,
        orderID: item.order_id.toString(),
        isUserNew: item.isNew,
        addressID: item.address_id, //required at backend
        customerID: item.customer_id,
        pickdropdata: null,
        recentOrders: true,
      });
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
        onPress={() => setSelectedId(item.id)}
        style={styles.itemBoxStyle}
      />
    );
  };
  const Item = ({ item, onPress, style }) => {
    if (item.buttonService === "Drop Off") {
      selectedURI = DropOffImageURI;
    } else if (item.buttonService === "Pickup") {
      selectedURI = PickUpImageURI;
    } else if (item.buttonService === "Pick & Drop") {
      selectedURI = dropoffAndPickupImageURI;
    } else if (item.buttonService === "To Be Packed") {
      selectedURI = toBePackedURI;
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
        <TouchableOpacity style={[styles.item, style]}>
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
              onPress={changeScreen(item.buttonService, item)}
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
        toggleDrawer={navigation.toggleDrawer}
        screenName={route.name}
      />
      <View style={styles.mainView}>
        <View style={styles.subContainer}>
          <FlatList
            data={listData}
            renderItem={renderItem}
            keyExtractor={(item) => item.order_id.toString()}
            extraData={selectedId}
            style={styles.TestDev}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
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
export default RecentOrders;
