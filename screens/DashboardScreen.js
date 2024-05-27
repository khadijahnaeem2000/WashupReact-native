import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import NetInfo from "@react-native-community/netinfo";
import header from "../assets/images/header.png";
import AllLocationsImage from "../assets/images/allLocations.png";
import OntimeImage from "../assets/images/ontime.png";
import DropOffImage from "../assets/images/dropoff.png";
import PickUpImage from "../assets/images/pickup.png";
import washupLogo from "../assets/images/logo.png";
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
const headerURI = Image.resolveAssetSource(header).uri;
const AllLocationsImageURI = Image.resolveAssetSource(AllLocationsImage).uri;
const OntimeImageURI = Image.resolveAssetSource(OntimeImage).uri;
const DropOffImageURI = Image.resolveAssetSource(DropOffImage).uri;
const PickUpImageURI = Image.resolveAssetSource(PickUpImage).uri;
const washupLogoURI = Image.resolveAssetSource(washupLogo).uri;
//-----------------FOR IMAGES-----------------//

const DashboardScreen = (props) => {
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
  let statusString =
    currentMonth +
    " " +
    currentDate.getDate().toString() +
    ", " +
    currentYear.toString();
  //----------------------------------------------//
  const URL = env.URL + env.api_dashboard;
  let dashboardObj = {
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
  const [refreshing, setRefreshing] = useState(false);
  const [listData, setListData] = useState(dashboardObj);
  const [profileName, setProfileName] = useState("Profile Name");
  
  async function fetchData() {
    storedRiderID = await AsyncStorage.getItem("rider_id");
    const finalURL = URL + `/${storedRiderID}`;
    const { isConnected } = await NetInfo.fetch();
    if (isConnected) {
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
        let response = await fetchWithTimeout(
          finalURL,
          requestOptions,
          5000,
          "Request Timeout, Check Your Connection"
        );
        let responseJson = await response.json();
        setListData(responseJson);
        if (responseJson?.profileName) {
          setProfileName(responseJson?.profileName);
          await AsyncStorage.setItem(
            "profileName",
            JSON.stringify(responseJson?.profileName)
          );
          await AsyncStorage.setItem(
            "profilePicURL",
            JSON.stringify(responseJson?.profilePic)
          );
        } else {
          alert("No Rides Found")
        }
        setRefreshing(false);
      } catch (error) {
      }
    } else {
      Alert.alert("Internet Error!");
      setRefreshing(false);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
      fetchData();
  }, []);
  const handleDrawer = () => {
    props.navigation.openDrawer();
  };
  return (
    <View style={styles.container}>
      <View style={styles.topView}>
        <Image
          source={{ uri: headerURI }}
          resizeMode="cover"
          style={styles.headerImage}
        />
        <View style={styles.MainLogo}>
          <Image
            source={{ uri: washupLogoURI }}
            resizeMode="contain"
            style={styles.AppLogo}
          />
          <Text style={styles.LogoTitle}>WahsUp Rider</Text>
        </View>
        <TouchableOpacity onPress={handleDrawer} style={styles.drawerButton}>
          <Icon name="menu" style={styles.drawerButtonIcon}></Icon>
        </TouchableOpacity>
        <View style={styles.topTextContainer}>
          <Text style={styles.welcome}>Welcome</Text>
          <Text style={styles.riderName}>{profileName}</Text>
        </View>
      </View>
      <View style={styles.statusView}>
        <Text style={styles.statusTopTitle}>Your Daily Status</Text>
        <Text style={styles.statusDate}>{statusString}</Text>
        <Text style={styles.statusRides}>
          {listData.totalLocationTarget} Rides
        </Text>
      </View>
      <View style={styles.bottomView}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
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
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ScrollView: {
    height: "100%",
  },
  topView: {
    height: Dimensions.get("window").height < 600 ? 250 : 300,
  },
  headerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    justifyContent: "center",
    top: 0,
    zIndex: 0,
  },
  MainLogo: {
    position: "absolute",
    left: "3%",
    top: Dimensions.get("window").height < 600 ? "10%" : "15%",
    flexDirection: "row",
    zIndex: 2,
  },
  AppLogo: {
    width: 45,
    height: 45,
  },
  LogoTitle: {
    fontSize: Platform.OS === "ios" ? 22 : 16,
    paddingTop: 10,
    paddingLeft: 5,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  drawerButton: {
    position: "absolute",
    top: Dimensions.get("window").height < 600 ? "15%" : "20%",
    right: Dimensions.get("window").height < 600 ? "3%" : "3%",
  },
  drawerButtonIcon: {
    fontSize: Platform.OS === "ios" ? 26 : 22,
    color: "#ffffff",
  },
  statusView: {
    flex: 0.4,
    backgroundColor: "white",
    width: "80%",
    marginTop: "-28%",
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: "-10%",
    borderRadius: 10,
    shadowColor: "black",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 22,
    zIndex: 9,
    position: "relative",
    justifyContent: "center",
    paddingTop: Dimensions.get("window").height < 600 ? 10 : 0,
    paddingLeft: Dimensions.get("window").height < 600 ? 10 : 10,
    paddingRight: Dimensions.get("window").height < 600 ? 0 : 0,
    paddingBottom: Dimensions.get("window").height < 600 ? 10 : 0,
  },
  bottomView: {
    flex: 2.6,
    backgroundColor: "#ffffff",
    zIndex: 1,
    paddingTop: 33,
    position: "relative",
  },
  welcome: {
    fontSize: Dimensions.get("window").height < 600 ? 18 : 22,
    color: "#ffffff",
  },
  riderName: {
    fontSize: Dimensions.get("window").height < 600 ? 18 : 30,
    color: "#FFFFFF",
  },
  topTextContainer: {
    alignItems: "center",
    paddingBottom: Dimensions.get("window").height < 600 ? 20 : 20,
    // paddingTop:10
    height: "100%",
    justifyContent: "center",
  },
  dropOffAndPickUpImage: {
    width: "50%",
    height: 80,
    marginLeft: "auto",
    marginRight: "auto",
    position: "relative",
  },
  bottomImagesContainer: {
    width: Dimensions.get("window").height < 600 ? 200 : 180,
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
    backgroundColor: "#39b5e7",
    paddingTop: 40,
    paddingBottom: 10,
    borderRadius: 10,
    position: "relative",
    zIndex: -1,
    marginTop: -30,
  },
  dropOffPickUp: {
    fontSize: 16,
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dropOffPickUpDynamic: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#FFFFFF",
    lineHeight: 50,
    marginTop: 10,
  },
  statusTopTitle: {
    fontSize: Platform.OS === "ios" ? 20 : 14,
  },
  statusDate: {
    fontSize: Platform.OS === "ios" ? 14 : 10,
    color: "#adadad",
  },
  statusRides: {
    fontSize: Platform.OS === "ios" ? 20 : 14,
    marginTop: 5,
  },
});
export default DashboardScreen;
