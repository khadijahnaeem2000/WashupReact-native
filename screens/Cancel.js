import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Alert,
  TextInput,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";
import Header from "../components/Header";
import { env } from "../env";
import { Picker } from "@react-native-picker/picker";

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

const Cancel = ({navigation , route}) => {

  const URL = env.URL + env.api_cancel;
  const {order_id , recentOrders} = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [reason, setReason] = useState([]);
  const [otherSelected, setOtherSelected] = useState(false);
  const [otherReasonText, setOtherReasonText] = useState("");
  const [selectedReason, setSelectedReason] = useState("Select");
  const [sendingReason, setSendingReason] = useState(false);
  let sendReason;

  useEffect(() => {
    try {
      setOtherSelected(false);
      setOtherReasonText("");
      setSendingReason(false);
      fetchData();
    } catch (error) {
    }
  }, [order_id]);

  const reasonHandler = (itemValue, itemIndex) => {
    itemValue === "Other" ? setOtherSelected(true) : setOtherSelected(false);
    setSelectedReason(itemValue);
  };

  async function fetchData() {
    setSendingReason(false);
    const { isConnected } = await NetInfo.fetch();
    storedEmail = await AsyncStorage.getItem("email");
    const finalURL = URL;

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
          450000,
          "Request Timeout, Check Your Connection"
        );
        setRefreshing(false);
        let responseJson = await response.json();
        setSelectedReason("Select One");
        let modifiedReason = ["Select One", ...responseJson.reason, "Other"];
        setReason(modifiedReason);
      } catch (error) {
        error = "Request Timeout, Check Your Connection"
          ? alert("Request Timeout, Check Your Connection")
          : alert("Server Error!");
      }
    } else {
      Alert.alert("Internet Error!");
    }
  }
  if (refreshing) {
    return (
      <View style={styles.container}>
        <Header
          toggleDrawer={navigation.toggleDrawer}
          screenName="Cancel"
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
        toggleDrawer={navigation.toggleDrawer}
        screenName={"Cancel Screen"}
      />
      <View style={styles.mainView}>
        <Text style={styles.FieldTitle}>{route.params.screenTitle}</Text>
        <Text style={styles.FieldTitle}>Reason</Text>
        <Picker selectedValue={selectedReason} onValueChange={reasonHandler}>
          {reason.map((item, index) => {
            return <Picker.Item label={item} value={item} key={index} />;
          })}
        </Picker>
        <View style={styles.horizontalLine} />
        {otherSelected ? (
          <View>
            <TextInput
              autoCorrect={false}
              placeholder="Type Here..."
              placeholderStyle={{ borderColor: "red" }}
              multiline={true}
              numberOfLines={4}
              placeholderTextColor="#0d72fe"
              style={styles.TextArea}
              value={otherReasonText}
              onChangeText={setOtherReasonText}
            />
          </View>
        ) : null}
        <TouchableOpacity
          disbaled={sendingReason ? true : false}
          onPress={async () => {
            if (selectedReason === "Select One") {
              alert("Select a Reason!");
              return;
            } else if (selectedReason === "Other") {
              sendReason = otherReasonText;
              if (!otherReasonText) {
                alert("Type The Reason");
                return;
              }
            } else {
              sendReason = selectedReason;
            }
            storedRiderID = await AsyncStorage.getItem("rider_id");
            alert("Sending Reason!");
            setSendingReason(true);
            const sendDataObj = {
              rider_id: storedRiderID,
              order_id: order_id,
              reason: sendReason,
            };
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
            setRefreshing(true);
            fetchWithTimeout(
              URL,
              requestOptions,
              450000,
              "Request Timeout, Check Your Connection"
            )
              .then((response) => response.text())
              .then((result) => {
                result = JSON.parse(result);
                if (result.status === "success") {
                  alert("Order Cancelled!");
                  setSendingReason(true);
                  setRefreshing(false);
                  if (recentOrders) {
                    navigation.navigate("RecentOrders", {
                      order_completed: order_id,
                    });
                  } else {
                    navigation.navigate("MyRides", {
                      order_completed: order_id,
                    });
                  }
                } else if (result.status == "failed") {
                  let errorConcat = `Error: ${result.error}`;
                  alert(errorConcat);
                  setSendingReason(true);
                  setRefreshing(false);
                } else {
                  setSendingReason(true);
                  setRefreshing(false);
                  alert("Server Error!");
                  alert("Server Error:");
                }
              })
              .catch((error) => {
                error = "Request Timeout, Check Your Connection"
                  ? alert("Request Timeout, Check Your Connection")
                  : alert("Server Error!");
                setSendingReason(true);
                setRefreshing(false);
              });
          }}
          style={styles.SubmitButton}
        >
          <Text style={{ color: "white" }}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Cancel;


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
    fontSize: 14,
    color: "#0C76E6",
    marginBottom: 5,
    paddingLeft: 10,
    fontWeight: "bold",
  },
  horizontalLine: {
    borderBottomWidth: 1,
    marginHorizontal: 14,
    borderColor: "grey",
    marginBottom: 20,
  },
  SubmitButton: {
    backgroundColor: "#0C76E6",
    margin: 5,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  TextArea: {
    textAlignVertical: "top",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
    padding: 15,
    margin: 10,
  },
});
