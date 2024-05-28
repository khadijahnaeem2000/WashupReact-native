import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import filter from "lodash.filter";
import NetInfo from "@react-native-community/netinfo";
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
} const PickupInternalScreen = (props) => {
  let responsePickup;
  const URL = env.URL + props.route.params.apiPath;
  const order_id = props.route.params.order_id;
  const service_id = props.route.params.service_id;
  const rider_id = props.route.params.rider_id;
  const inputItem = useRef(null);
  const inputItemValue = useRef("");
  const inputQuantity = useRef("");
  const [listData, setListData] = useState([]);
  const [listData2, setListData2] = useState([]);
  const [query, setQuery] = useState("");
  const [fullData, setFullData] = useState([]);
  const [weight, setWeight] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [changeState, setChangeState] = useState(false);
  const [currentItemNote, setCurrentItemNote] = useState("");
  const [
    PickupInternalScreenUpdated,
    setPickupInternalScreenUpdated,
  ] = useState(false);
  const [showBottomSection, setShowBottomSection] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Item Name");

  let itemRowStyle;
  var savedToken;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false); // or some other action
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    try {
      setWeight(""); //clears the weight value for different screen!
      setCurrentItemNote("");
      setQuery("");
      fetchData();
      setSelectedItem("Item Name");
      inputItemValue.current = "";
    } catch (error) {
      Alert.alert("Error");
    }
  }, [URL]);
  // useEffect(() => {
  //   const unsubscribe = props.navigation.addListener("focus", () => {
  //     handleSearch("asdfasdfasdfasdfasdfasdfasdf ");
  //     handleSearch("");
  //     setSelectedItem("Item Name");
  //     inputItemValue.current = "";
  //     setListData(listData);
  //   });
  //   return unsubscribe;
  // }, [props.navigation]);
  if (refreshing) {
    return (
      <View style={styles.container}>
        <Header
          toggleDrawer={props.navigation.toggleDrawer}
          screenName={props.route.params.screenHeader}
        />
        <View style={styles.mainView}>
          <ActivityIndicator size="large" color="#0c76e6" />
        </View>
      </View>
    );
  }

  //--------------------FUNCTIONS START------------------//
  async function fetchData() {
    const { isConnected } = await NetInfo.fetch();
    storedRiderID = await AsyncStorage.getItem("rider_id");
    const finalURL = URL;
    if (isConnected) {
      try {
        setRefreshing(true);
        savedToken = await SecureStore.getItemAsync("token");
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
        responsePickup = await response.json();
        for (let key in responsePickup.items) {
          responsePickup.items[key]["serialNo"] = parseInt(key) + 1;
          responsePickup.items[key]["quantity"] = parseInt(
            responsePickup.items[key]["quantity"]
          );
        }
        setListData(responsePickup.items);
        setListData2(responsePickup.items);
        setFullData(responsePickup.items);
        responsePickup.weight == 0
          ? setWeight("")
          : setWeight(responsePickup.weight.toString());
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
  const handleChange = (quantity, id, serialNo, title) => {
    id = inputItemValue.current.id;
    for (let key in listData) {
      if (id === listData[key]["id"]) {
        if (!quantity) {
          listData[key]["quantity"] = null;
        } else {
          listData[key]["quantity"] = parseInt(quantity);
        }
      }
    }
  };
  const handleSubmit = (func, id, serialNo, title, quantity) => {
    changeState ? setChangeState(false) : setChangeState(true);
  };
  const handleSearch = (text) => {
    const formattedQuery = text.toLowerCase();
    const filteredData = filter(fullData, (user) => {
      return contains(user, formattedQuery);
    });
    setListData(filteredData);
    setQuery(text);
  };
  const contains = (user, query) => {
    const title = user.title.toLowerCase();
    if (title.includes(query)) {
      return true;
    }
    return false;
  };
  const handleWeight = (weightText) => {
    setWeight(weightText);
  };

  const confirmFunc = async () => {
    if (!weight) {
      Alert.alert("Enter Weight Body", "Please Enter Weight To Proceed!");
      return;
    }
    if (isNaN(weight)) {
      Alert.alert(
        "Incorrect Weight",
        "Please Enter Correct Weight To Proceed!"
      );
      return;
    }
    if (weight == 0) {
      Alert.alert("Incorrect Weight", "Weight must be greater than 0");
      return;
    }

    let items_selected = [];
    let emptyPieces = false
    for (let key in listData) {
      if (listData[key]["quantity"] > 0) {
        items_selected.push(listData[key]);
      } else {
        if (listData[key]['title'] === selectedItem) {
          emptyPieces = true
        }
      }
    }
    if (emptyPieces) {
      Alert.alert("Incorrect Pieces", "Pieces must be greater than 0");
      return;
    }
    const sendDataObj = {
      rider_id: rider_id,
      order_id: order_id,
      service_id: service_id,
      items_selected: items_selected,
      weight: weight,
    };
    const confirmURL = env.URL + env.api_confirmpickupservice;
    savedToken = await SecureStore.getItemAsync("token");
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
    setRefreshing(true);
    fetchWithTimeout(
      confirmURL,
      requestOptions,
      10000,
      "Request Timeout, Check Your Connection"
    )
      .then((response) => response.text())
      .then((result) => {
        result = JSON.parse(result);
        if (result.status === "success") {
          let totalQuantity = 0;
          // ---------- Summing up total items for notification! ------------ //
          for (let key in listData) {
            console.log(
              "---->",
              listData[key]["quantity"],
              typeof listData[key]["quantity"],
              totalQuantity,
              typeof totalQuantity
            );
            if (listData[key]["quantity"] > 0) {
              totalQuantity = totalQuantity + listData[key]["quantity"];
            }
          }
          Alert.alert(
            `${props.route.params.screenHeader}`,
            `Body: ${totalQuantity} Items, Weight: ${weight}`
          );
          PickupInternalScreenUpdated
            ? setPickupInternalScreenUpdated(false)
            : setPickupInternalScreenUpdated(true);
          props.navigation.navigate("Pickup", {
            orderID: order_id,


          }),
            setRefreshing(true);
        } else {
          Alert.alert("Server Error! Data Not Sent!");
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

  //--------------------FUNCTIONS END------------------//
  const renderHeader = () => {
    return (
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: 10,
          marginTop: 10,
        }}
      >
        <View style={styles.RowData}>
          <Text style={[styles.RowHeadText, styles.RowTextCol]}>#</Text>
          <Text style={[styles.RowHeadText, styles.RowTextCol2]}>Items</Text>
          <Text style={[styles.RowHeadText, styles.RowTextCol]}>Qty</Text>
        </View>
      </View>
    );
  };
  const renderItem = ({ item }) => {
    return <Item item={item} style={styles.itemBoxStyle} />;
  };
  var valueItem;
  const Item = ({ item, onPress }) => {
    if (item.quantity === 0 || !item.quantity) {
      valueItem = "";
      itemRowStyle = styles.RowData;
    } else {
      valueItem = item.quantity.toString();
      itemRowStyle = [styles.RowData, styles.RowDataQuantity];
    }
    inputQuantity.current = valueItem;
    return (
      <TouchableOpacity
        style={itemRowStyle}
        onPress={() => {
          inputItemValue.current = item;
          inputItem.current.focus();
        }}
      >
        <Text style={[styles.RowText, styles.RowTextCol]}>{item.serialNo}</Text>
        <Text style={[styles.RowText, styles.RowTextCol2]}>{item.title}</Text>
        <Text
          style={[styles.RowText, styles.RowTextCol3, { textAlign: "center" }]}
        >
          {valueItem}
        </Text>
      </TouchableOpacity>
    );
  };
  const deleteSearchItem = () => {
    setQuery("");
    setListData(listData2);
  };

  return (
    <View style={styles.container}>
      <Header
        toggleDrawer={props.navigation.toggleDrawer}
        screenName={props.route.params.screenHeader}
      />
      <ScrollView style={styles.mainView}>
        <View style={styles.SetPaddArea}>
          <Text style={styles.textService}>
            {props.route.params.screenHeader}
          </Text>
          <View style={styles.SearchParent}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="always"
              value={query}
              onChangeText={(queryText) => handleSearch(queryText)}
              placeholder="Search"
              style={styles.SearchRow}
              keyboardDismissMode="none"
              keyboardShouldPersistTabs="handled"
              onFocus={() => setShowBottomSection(false)}
              onBlur={() => setShowBottomSection(true)}
            />
            <TouchableOpacity
              style={styles.deleteSubmit}
              onPress={deleteSearchItem}
            >
              <Text style={styles.deleteSubmitText}>X</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.QuantityView}>
            <Text style={styles.QuantityViewText}>{selectedItem}</Text>

            <TextInput
              ref={inputItem}
              autoCorrect={false}
              keyboardType="phone-pad"
              placeholder="Quantity"
              style={styles.list_quantityIn}
              defaultValue={
                inputItemValue.current.quantity
                  ? inputItemValue.current.quantity.toString()
                  : inputQuantity.current
              }
              // editable={!selectedItem === "Item Name" ? true : false}
              // selectTextOnFocus={!selectedItem === "Item Name" ? true : false}
              onChangeText={(quantity) => handleChange(quantity)}
              onSubmitEditing={() => handleSubmit()}
              onPressOut={() => {}}
              onPressIn={() => {}}
              onFocus={() => {
                setShowBottomSection(false);
                inputItemValue.current.title
                  ? setSelectedItem(inputItemValue.current.title)
                  : setSelectedItem("Item Name");
              }}
              onBlur={() => {
                setShowBottomSection(true);
              }}
            />

            {/* <Button onPress={handleSubmit} title="✓" color="#0d72fe" /> */}
          </View>

          <View style={styles.flatlist_scroll}>
            <FlatList
              ListHeaderComponent={renderHeader}
              data={listData.sort(function (a, b) {
                return b.quantity - a.quantity;
              })}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.FLatStyle}
              keyboardDismissMode="none"
              initialNumToRender="10"
              maxToRenderPerBatch="10"
            />
          </View>
        </View>
      </ScrollView>
      {(!isKeyboardVisible || showBottomSection) && (
        <View style={styles.bottomArea}>
          <Text style={styles.TextHeading}> Enter Weight in KG </Text>
          <TextInput
            style={styles.TextareaSubmit}
            autoCorrect={false}
            placeholder="Enter Here"
            value={weight}
            onChangeText={(weightText) => handleWeight(weightText)}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.buttonSubmit} onPress={confirmFunc}>
            <Text style={styles.TextbuttonSubmit}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  mainView: {
    backgroundColor: "white",
    padding: 10,
  },
  RowData: {
    flexDirection: "row",
    padding: 10,
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
    width: 40,
  },
  RowTextCol2: {
    width: "60%",
  },
  RowTextCol3: {
    width: 80,
    borderBottomWidth: 1,
  },
  RowTextCol4: {
    width: 50,
    textAlign: "right",
  },

  TextHeading: {
    color: "#0d72fe",
    fontWeight: "bold",
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
  buttonSubmit: {
    backgroundColor: "#0d72fe",
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  TextbuttonSubmit: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  RowDataQuantity: {
    backgroundColor: "#0ec8fe",
    marginTop: 5,
  },
  RowDataAddon: {
    backgroundColor: "red",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },

  bottomArea: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  HiddenText: {
    color: "white",
  },
  list_quantityIn: {
    borderBottomWidth: 1,
    borderBottomColor: "#cdcdcd",
    textAlign: "center",
  },
  submitQuantityView: {
    position: "absolute",
    marginTop: 100,
    // padding:10
  },
  QuantityView: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#cdcdcd",
    // margin: 80,
    // alignContent: "flex-start",
  },
  QuantityViewText: {
    marginRight: 10,
    textAlign: "left",
    width: "40%",
    // backgroundColor: "red",
  },
  list_quantityIn: {
    marginRight: 10,
    width: "50%",
  },
  deleteSubmit: {
    backgroundColor: "#0d72fe",
    width: "10%",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#cdcdcd",
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 5, height: 5 },
    elevation: 8,
  },
  SearchParent: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    marginVertical: 5,
    marginHorizontal: 5,
    paddingVertical: 5,
    paddingLeft: 15,
    paddingRight: 5,
    shadowColor: "#cdcdcd",
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 5, height: 5 },
    elevation: 8,
    marginBottom: 5,
    marginTop: 10,
    flexDirection: "row",
  },
  SearchRow: {
    width: "90%",
  },
  deleteSubmitText: {
    fontSize: 14,
    color: "#fff",
  },
});
export default PickupInternalScreen;
