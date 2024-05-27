import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";
import header from "../assets/images/header.png";
import AllLocationsImage from "../assets/images/allLocations.png";
import OntimeImage from "../assets/images/ontime.png";
import DropOffImage from "../assets/images/dropoff.png";
import PickUpImage from "../assets/images/pickup.png";
import Header from "../components/Header";
import { env } from "../env";
const MAX_RETRIES = 3; // Maximum number of retries
const RETRY_INTERVAL = 1000; // Retry interval in milliseconds

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

async function fetchWithRetry(url, options, timeout, retries) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetchWithTimeout(url, options, timeout);
            return response;
        } catch (error) {
            if (i === retries - 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
        }
    }
}
//-----------------FOR IMAGES-----------------//
const AllLocationsImageURI = Image.resolveAssetSource(AllLocationsImage).uri;
const OntimeImageURI = Image.resolveAssetSource(OntimeImage).uri;
const DropOffImageURI = Image.resolveAssetSource(DropOffImage).uri;
const PickUpImageURI = Image.resolveAssetSource(PickUpImage).uri;
//-----------------FOR IMAGES-----------------//
const RideHistoryScreen = (props) => {
  //---------------DATE STUFF----------------------//
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  let currentMonth = monthNames[currentDate.getMonth()];
  let currentMonthNumber = (currentDate.getMonth() + 1).toString();
  console.log("---DATE---", currentDate);
  console.log("---YEAR---", currentYear);
  console.log(
    "---CURRENT---",
    currentMonth,
    currentMonthNumber,
    typeof currentMonthNumber
  );
  //----------------------------------------------//
  let riderHistoryObj = {
    dropAchieved: 0,
    dropTarget: 0,
    onTimeAchieved: 0,
    onTimeTarget: 0,
    pickAchieved: 0,
    pickDropAchieved: 0,
    pickDropTarget: 0,
    pickTarget: 0,
    totalLocationAchieved: 0,
    totalLocationTarget: 0,
  };
  const URL = env.URL + env.api_riderhistory;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthNumber);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [listData, setListData] = useState(riderHistoryObj);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    try {
      fetchData();
    } catch (error) {
      console.log(error);
    }
  }, [selectedYear, selectedMonth]);
  if (refreshing) {
    return (
      <View style={styles.container}>
        <Header
          toggleDrawer={props.navigation.toggleDrawer}
          screenName={props.route.name}
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
    console.log("Rider ID -=-=>", storedRiderID);
    let finalURL = URL + `/${storedRiderID}/${selectedYear}/${selectedMonth}`;
    console.log("Fetching Data From:", finalURL);
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
        console.log(responseJson);
        setListData(responseJson);
      } catch (error) {
        console.log("--000--");
        error = "Request Timeout, Check Your Connection"
          ? alert("Request Timeout, Check Your Connection")
          : alert("Server Error!");
        console.log(error);
        console.log("--001--");
      }
    } else {
      Alert.alert("Internet Error!");
    }
  }
  const monthHandler = (itemValue, itemIndex) => {
    console.log("MONTH SELECTED : ", itemValue, typeof itemValue);
    setSelectedMonth(itemValue);
  };
  const yearHandler = (itemValue, itemIndex) => {
    console.log("YEAR SELECTED : ", itemValue);
    setSelectedYear(itemValue);
  };
  let years = [];
  const yearsFunc = () => {
    let max = new Date().getFullYear();
    let min = 2010;
    for (let i = max; i >= min; i--) {
      years.push(i.toString());
    }
    return years.toString();
  };
  yearsFunc();
  return (
    <View style={styles.container}>
      <Header
        toggleDrawer={props.navigation.toggleDrawer}
        screenName={props.route.name}
      />
      <View style={styles.mainView}>
        <View style={styles.bottomView}>
          <ScrollView>
            <Text style={styles.FieldTitle}>Month</Text>
            <View style={styles.PickerDesign}>
              <Picker
                itemStyle={{ backgroundColor: "red" }}
                selectedValue={selectedMonth}
                onValueChange={monthHandler}
              >
                <Picker.Item label="January" value="1" />
                <Picker.Item label="February" value="2" />
                <Picker.Item label="March" value="3" />
                <Picker.Item label="April" value="4" />
                <Picker.Item label="May" value="5" />
                <Picker.Item label="June" value="6" />
                <Picker.Item label="July" value="7" />
                <Picker.Item label="August" value="8" />
                <Picker.Item label="September" value="9" />
                <Picker.Item label="October" value="10" />
                <Picker.Item label="November" value="11" />
                <Picker.Item label="December" value="12" />
              </Picker>
            </View>
            <View style={styles.horizontalLine} />
            <Text style={styles.FieldTitle}>Year</Text>
            <View style={styles.PickerDesign}>
              <Picker selectedValue={selectedYear} onValueChange={yearHandler}>
                {years.map((item, index) => {
                  return <Picker.Item label={item} value={item} key={index} />;
                })}
              </Picker>
            </View>
            <View style={styles.horizontalLine} />
            <View style={styles.bottomImagesContainer}>
              <Image
                source={{ uri: AllLocationsImageURI }}
                resizeMode="contain"
                style={styles.dropOffAndPickUpImage}
              ></Image>
              <View style={styles.bottomImagesContentContainer}>
                <Text style={styles.dropOffPickUp}>Total Locations </Text>
                <Text style={styles.dropOffPickUpDynamic}>
                  {listData.totalLocationAchieved} /{" "}
                  {listData.totalLocationTarget}
                </Text>
              </View>
            </View>
            <View style={styles.bottomImagesContainer}>
              <Image
                source={{ uri: DropOffImageURI }}
                resizeMode="contain"
                style={styles.dropOffAndPickUpImage}
              ></Image>
              <View style={styles.bottomImagesContentContainer}>
                <Text style={styles.dropOffPickUp}>Pick &amp; Drop </Text>
                <Text style={styles.dropOffPickUpDynamic}>
                  {listData.pickDropAchieved} / {listData.pickDropTarget}
                </Text>
              </View>
            </View>
            <View style={styles.bottomImagesContainer}>
              <Image
                source={{ uri: PickUpImageURI }}
                resizeMode="contain"
                style={styles.dropOffAndPickUpImage}
              ></Image>
              <View style={styles.bottomImagesContentContainer}>
                <Text style={styles.dropOffPickUp}>Pick Up</Text>
                <Text style={styles.dropOffPickUpDynamic}>
                  {listData.pickAchieved} / {listData.pickTarget}
                </Text>
              </View>
            </View>
            <View style={styles.bottomImagesContainer}>
              <Image
                source={{ uri: DropOffImageURI }}
                resizeMode="contain"
                style={styles.dropOffAndPickUpImage}
              ></Image>
              <View style={styles.bottomImagesContentContainer}>
                <Text style={styles.dropOffPickUp}>Drop Off </Text>
                <Text style={styles.dropOffPickUpDynamic}>
                  {listData.dropAchieved} / {listData.dropTarget}
                </Text>
              </View>
            </View>
            <View style={styles.bottomImagesContainer}>
              <Image
                source={{ uri: OntimeImageURI }}
                resizeMode="contain"
                style={styles.dropOffAndPickUpImage}
              ></Image>
              <View style={styles.bottomImagesContentContainer}>
                <Text style={styles.dropOffPickUp}>On TIme</Text>
                <Text style={styles.dropOffPickUpDynamic}>
                  {listData.onTimeAchieved} / {listData.onTimeTarget}
                </Text>
              </View>
            </View>
          </ScrollView>
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
});
export default RideHistoryScreen;
