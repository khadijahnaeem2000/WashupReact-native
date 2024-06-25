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
  SafeAreaView,
  ScrollView,
  Alert,
  LogBox,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";
import Header from "../components/Header";
import { env } from "../env";
import { TextInput } from "react-native-gesture-handler";

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

const Pickup = (props) => {
  let responsePickup;
  const URL = env.URL + env.api_pickup;
  const [selectedId, setSelectedId] = useState(null);
  const [listData, setListData] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [orderNote, setOrderNote] = useState("");
  const [screenTitle, setScreenTitle] = useState("Pickup");
  const [note, setNote] = useState("");
  const [permenantNote, setPermenantNote] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const isUserNew = props?.route?.params?.isUserNew;
  const addressID = props?.route?.params?.addressID;
  var orderID;
  let PickupInternalScreenUpdated =
    props?.route?.params?.PickupInternalScreenUpdated;

  const route = useRoute();

  useEffect(() => {
    (async () => {

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("===========>>>", "location not saved");
        setErrorMsg("Permission to access location was denied");
        return;
      }
      try {
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
          },
          (currentPosition) => {
            /* OK, it works*/
            setLocation(currentPosition);
          }
        );
      } catch (e) {
        alert(
          "We could not find your position. Please make sure your location service provider is on"
        );
        console.log("Error while trying to get location: ", e);
      }
    })();
  }, []);
  useEffect(() => {
    const backAction = () => {
      if (
        route.name === "Dashboard" ||
        route.name === "My Rides" ||
        route.name === "Meter Reading" ||
        route.name === "Ride History" ||
        route.name === "Payment Only Rides" ||
        route.name === "Recent Orders"
      ) {
        props.navigation.navigate("Dashboard");
      } else if (
        route.name === "Pickup" &&
        route.params.recentOrders === true
      ) {
        props.navigation.navigate("Recent Orders");
      } else if (route.name === "Pickup" || route.name === "Drop Off") {
        props.navigation.navigate("My Rides");
      } else if (route.name === "PickupInternal") {
        props.navigation.navigate("Pickup");
      } else if (route.name === "PickupInternalAddonsScreen") {
        props.navigation.navigate("PickupInternal");
      } else if (route.name === "QR Code") {
        props.navigation.navigate("Drop Off");
      }
      // backHandler.remove();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [
    props?.route?.params?.pickdropdata,
    PickupInternalScreenUpdated,
    props?.route?.params?.orderID,
  ]);


  //----------- FUNCTION STARTS HERE----------//
  async function fetchData() {
    // ----------- Logic for Pick&Drop Starts ----------- //
    // console.log("FETCH DATA FUNCTION EXECUTED! ");
    // console.log(props);
    if (props?.route?.params?.pickdropdata) {
      responsePickup = props?.route?.params?.pickdropdata;
      // console.log("---pickdropdata----");
      orderID = props?.route?.params?.pickdropdata?.order_id;
      setScreenTitle(props?.route?.params?.pickdropdata?.title);
    } else {
      setScreenTitle(props?.route?.params?.screenTitle);
      orderID = props?.route?.params?.orderID;
    }
    // ----------- Logic for Pick&Drop Ends ----------- //
    const { isConnected } = await NetInfo.fetch();
    storedRiderID = await AsyncStorage.getItem("rider_id");
    // console.log("Rider ID -=-=>", storedRiderID, orderID);
    const finalURL = URL + `/${storedRiderID}/${orderID}`;
    // console.log("Fetching Data From:", finalURL);
    if (isConnected) {
      try {
        setRefreshing(true);
        let savedToken = await SecureStore.getItemAsync("token");
        savedToken = savedToken.substring(1, savedToken.length - 1);
        // console.log("Token --> ", savedToken, typeof savedToken);
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
        responsePickup = await response.json();
        orderID = responsePickup.order_id;
        setListData(responsePickup.Services);
        setScreenTitle(responsePickup.title);
        setFullData(responsePickup);
        setPermenantNote(responsePickup.PermenantNote);
        setNote(responsePickup.Note);
        setRefreshing(false);
      } catch (error) {
        // console.log("--000--");
        error = "Request Timeout, Check Your Connection"
          ? alert("Request Timeout, Check Your Connection")
          : alert("Server Error!");
        console.log(error);
        // console.log("--001--");
      }
    } else {
      Alert.alert("Internet Error!");
      setRefreshing(false);
    }
  }
  //----------- FUNCTION ENDS HERE----------//


  useFocusEffect(useCallback(() => {
    LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
    try {
      fetchData();
    } catch (error) {
      Alert.alert(error);
      console.log(error);
    }
  }, [
    props?.route?.params?.pickdropdata,
    PickupInternalScreenUpdated,
    props?.route?.params?.orderID,
  ]))


  if (refreshing) {
    return (
      <View style={styles.container}>
        <Header
          toggleDrawer={props.navigation.toggleDrawer}
          screenName={screenTitle}
        />
        <View style={styles.mainView}>
          <ActivityIndicator size="large" color="#0c76e6" />
        </View>
      </View>
    );
  }


  const renderItem = ({ item }) => {
    let itemStyle;
    item.service_selected
      ? (itemStyle = [styles.item, { backgroundColor: "#0ec8fe" }])
      : (itemStyle = [styles.item]);
    if (item.service_name == "Unwashed Service") {
      console.log(itemStyle.push({ display: "none" }));
    }
    const changeScreen = (itemData, props_navigation, propsData) => (props) => {
      console.log("CHANGE SCREEN FUNCTION CALLED!");
      console.log("---", propsData.route.params.pickdropdata);
      if (propsData.route.params.pickdropdata) {
        orderID = propsData.route.params.pickdropdata?.order_id;
      } else {
        orderID = propsData.route.params.orderID;
      }
      try {
        props_navigation.navigate("PickupInternal", {
          screenHeader: itemData?.service_name,
          apiPath: itemData?.service_link,
          rider_id: storedRiderID,
          order_id: orderID,
          service_id: itemData?.service_id,
        });
      } catch (e) {
        console.log(e);
      }
    };
    return (
      <TouchableOpacity
        onPress={changeScreen(item, props.navigation, props)}
        style={[itemStyle]}
      >
        <Image
          source={{ uri: `${env.URL}${item.service_image}` }}
          style={styles.serviceImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>{item.service_name}</Text>
      </TouchableOpacity>
    );
  };
  const renderItemPrice = ({ item }) => {
    return (
      <View>
        <View style={styles.serviceContainer}>
          <Text style={styles.TableTitle}>{item.service_name}</Text>
          <View style={styles.ChildServiceDetails}>
            <View style={styles.column_inner}>
              <Text style={styles.TableTitle}>Pieces</Text>
              <Text>{item.pieces}</Text>
            </View>
            <View style={[styles.column_inner, styles.bordered]}>
              <Text style={styles.TableTitle}>KG</Text>
              <Text>{item.KG.toFixed(2)}</Text>
            </View>
            <View style={styles.column_inner}>
              <Text style={styles.TableTitle}>Price</Text>
              <Text>{item.price.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        toggleDrawer={props.navigation.toggleDrawer}
        screenName={screenTitle}
      />
      <View style={styles.mainView}>
        <SafeAreaView style={styles.container}>
          <ScrollView>
            <View style={styles.NoteBlock}>
              <Text style={styles.NoteText}>
                <Text style={styles.NoteTitle}>Permenant Note:</Text>{" "}
                {permenantNote}
              </Text>
              <Text style={styles.NoteText}>
                <Text style={styles.NoteTitle}>Note:</Text> {note}
              </Text>
            </View>
            <FlatList
              data={listData}
              renderItem={renderItem}
              keyExtractor={(item) => item.service_id.toString()}
              extraData={selectedId}
              style={styles.FLatStyle}
              numColumns={3}
              numRows={3}
            />
            <FlatList
              data={fullData.services_selected}
              renderItem={renderItemPrice}
              keyExtractor={(item) => item.service_id.toString()}
              extraData={selectedId}
              style={styles.FLatStyle}
            />
            {fullData.grandtotal ? (
              <View>
                <View>
                  <View style={styles.serviceContainer}>
                    <Text style={styles.TableTitle}>
                      Delivery Charges: {fullData.delivery_charges.price}
                    </Text>
                    <View style={styles.ChildServiceDetails}></View>
                  </View>
                  <View>
                    <View>
                      <Text style={styles.TableTitle}>Grand Total</Text>
                      <View style={styles.ChildServiceDetails}>
                        <View style={styles.column_inner}>
                          <Text style={styles.TableTitle}>Pieces</Text>
                          <Text>{fullData.grandtotal.pieces}</Text>
                        </View>
                        <View style={[styles.column_inner, styles.bordered]}>
                          <Text style={styles.TableTitle}>KG</Text>
                          <Text>{fullData.grandtotal.KG.toFixed(2)}</Text>
                        </View>
                        <View style={styles.column_inner}>
                          <Text style={styles.TableTitle}>Price</Text>
                          <Text>{fullData.grandtotal.price.toFixed(2)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.bottomStuff}>
                  <Text
                    style={[
                      styles.TableTitle,
                      { textAlign: "left", marginLeft: 5 },
                    ]}
                  >
                    Order Note
                  </Text>
                  <TextInput
                    autoCorrect={false}
                    placeholder="Type Here..."
                    placeholderStyle={{ borderColor: "red" }}
                    multiline={true}
                    numberOfLines={4}
                    placeholderTextColor="#0d72fe"
                    style={styles.TextAreaOrderNote}
                    value={orderNote}
                    onChangeText={setOrderNote}
                  />
                  <View style={styles.bottomButtonsContainer}>
                    <TouchableOpacity
                      style={styles.bottomButtons}
                      onPress={() => {
                        if (props?.route?.params?.pickdropdata) {
                          orderID = props?.route?.params?.pickdropdata?.order_id;
                        } else {
                          orderID = props?.route?.params?.orderID;
                        }
                        props.navigation.navigate("Confirm Order", {
                          rider_id: storedRiderID,
                          order_id: orderID,
                          customer_name: fullData.customer_name,
                          customer_id: fullData.customer_id,
                          order_note: orderNote,
                          location: location,
                          isUserNew: isUserNew,
                          addressID: addressID,
                          setOrderNote: setOrderNote,
                          recentOrders: props?.route?.params?.recentOrders,
                        });
                      }}
                    >
                      <Text style={{ color: "white" }}>Final Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.bottomButtons,
                        { backgroundColor: "#c1c1c1" },
                      ]}
                      onPress={() => {
                        if (props?.route?.params?.pickdropdata) {
                          orderID = props?.route?.params?.pickdropdata?.order_id;
                        } else {
                          orderID = props?.route?.params?.orderID;
                        }
                        props.navigation.navigate("CancelScreen", {
                          rider_id: storedRiderID,
                          order_id: orderID,
                          screenTitle: screenTitle,
                          recentOrders: props?.route?.params?.recentOrders,
                        });
                      }}
                    >
                      <Text style={{ color: "white" }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              //if data is not available then only show CANCEL button
              <View style={styles.cancelOnlyButton}>
                <TouchableOpacity
                  style={[styles.bottomButtons]}
                  onPress={() => {
                    if (props?.route?.params?.pickdropdata) {
                      orderID = props?.route?.params?.pickdropdata?.order_id;
                    } else {
                      orderID = props?.route?.params?.orderID;
                    }
                    props.navigation.navigate("CancelScreen", {
                      rider_id: storedRiderID,
                      order_id: orderID,
                      screenTitle: screenTitle,
                      recentOrders: props?.route?.params?.recentOrders,
                    });
                  }}
                >
                  <Text style={{ color: "white" }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
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
    backgroundColor: "white",
    padding: 0,
  },
  FLatStyle: {
    width: "100%",
    marginBottom: 0,
  },
  item: {
    backgroundColor: "#0d72fe",
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: "1.6%",
    width: "30%",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    height: 110,
    shadowColor: "#cdcdcd",
    shadowOpacity: 1,
    shadowRadius: 10,
    // shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  title: {
    textAlign: "center",
    fontSize: 12,
    color: "white",
  },
  serviceImage: {
    width: 50,
    height: 50,
    marginTop: -5,
  },
  NoteBlock: {
    padding: 7,
  },
  NoteText: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 10,
    fontSize: 12,
    marginVertical: 5,
    width: "100%",
    marginLeft: "auto",
    marginRight: "auto",
    shadowColor: "#cdcdcd",
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
    borderRadius: 2,
  },
  NoteTitle: {
    color: "#0d72fe",
    fontWeight: "bold",
  },
  TableTitle: {
    color: "#0d72fe",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  serviceContainer: {
    borderColor: "#c1c1c1",
    borderBottomWidth: 1,
    margin: 10,
    marginTop: 0,
    paddingBottom: 20,
  },
  ChildServiceDetails: {
    flexDirection: "row",
    margin: 10,
  },
  column_inner: {
    width: "33%",
    alignItems: "center",
  },
  column_inner_delivery: {
    width: "100%",
    alignItems: "center",
  },
  bordered: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#cdcdcd",
  },
  TextAreaOrderNote: {
    textAlignVertical: "top",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
    padding: 15,
  },
  bottomStuff: {
    margin: 10,
  },
  bottomButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  bottomButtons: {
    margin: 10,
    borderRadius: 90,
    backgroundColor: "green",
    width: 120,
    height: 40,
    paddingTop: 10,
    alignItems: "center",
    backgroundColor: "#3db2e7",
  },
  separatorLine: {
    backgroundColor: "#c1c1c1",
    width: "90%",
    height: "1%",
    marginTop: "5%",
  },
  cancelOnlyButton: {
    alignItems: "center",
  },
});
export default Pickup;
