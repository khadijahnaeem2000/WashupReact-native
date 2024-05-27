import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/Header";
import ImgPicker from "../components/ImagePicker";

const MeterReadingScreen = (props) => {
  const [refreshingStoredData, setRefreshingStoredData] = useState(false);
  const [selectedImage, setSelectedImage] = useState();
  const [startDay, setStartDay] = useState();
  const [endDay, setEndDay] = useState();
  const [meterReading, setMeterReading] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  var storedMeterData;


  useEffect(() => {
    fetchStoredData();
  });
  const onRefresh = useCallback(() => {
    fetchStoredData();
  }, []);

  async function fetchStoredData() {
    storedMeterData = await AsyncStorage.getItem("meter");
    storedMeterData = JSON.parse(storedMeterData);
    setStartDay(storedMeterData.startDay);
    setEndDay(storedMeterData.endDay);
  }

  fetchStoredData();
  const showActivityIndicator = (value) => {
    if (value == true) {
      setRefreshing(true);
    }
    if (value == false) {
      setRefreshing(false);
    }
  };
  if (isNaN(meterReading)) {
    // If the Given Value is Not Number Then It Will Return True and This Part Will Execute.
    let value = meterReading;
    value = value.substring(0, value.length - 1);
    Alert.alert("Value is Not Number");
    setMeterReading(value);
  } else {
    // If the Given Value is Number Then It Will Return False and This Part Will Execute.
    // Alert.alert("Value is Number");
  }
  const selectedItem = {
    title: "Selected item title",
    description: "Secondary long descriptive text ...",
  };
  const imageTakenHandler = (imagePath) => {
    setSelectedImage(imagePath);
  };

  const meterReadingHandler = (itemValue, itemIndex) => {
    setSelectedValue(itemValue);
  };

  if (refreshing) {
    return (
      <View style={styles.container}>
        <Header
          toggleDrawer={props.navigation.toggleDrawer}
          screenName="Meter Reading"
        />
        <View style={styles.mainView}>
          <ActivityIndicator size="large" color="#0c76e6" />
        </View>
      </View>
    );
  }
  if (startDay && endDay) {
    return (
      <View style={styles.container}>
        <Header
          toggleDrawer={props.navigation.toggleDrawer}
          screenName={props.route.name}
        />
        <View style={styles.mainView}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshingStoredData}
                onRefresh={onRefresh}
              />
            }
          >
            <View>
              <Text style={styles.FieldTitle}>Your Day Has Ended!</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Header
        toggleDrawer={props.navigation.toggleDrawer}
        screenName={props.route.name}
      />
      <View style={styles.mainView}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshingStoredData}
              onRefresh={onRefresh}
            />
          }
        >
          <View>
            <Text style={styles.FieldTitle}>Meter Reading Type</Text>
            <Picker
              selectedValue={selectedValue}
              onValueChange={meterReadingHandler}
            >
              <Picker.Item label="Select One" value={null} />
              {!startDay && !endDay ? (
                <Picker.Item label="Start Day" value="0" />
              ) : null}
              {startDay && !endDay ? (
                <Picker.Item label="End Day" value="1" />
              ) : null}
              {startDay && endDay ? null : null}
            </Picker>
            <View></View>
          </View>
          <View style={styles.Separator} />
          <View>
            <Text style={styles.FieldTitle}>Meter Reading</Text>
            <TextInput
              style={styles.TextInField}
              placeholder="Placeholder Text"
              autoCorrect={false}
              keyboardType="phone-pad"
              onChangeText={setMeterReading}
              value={meterReading}
            />
          </View>
          <View style={styles.ImageUploadBox}>
            <Text style={styles.FieldTitle}>Image</Text>
            <ImgPicker
              onImageTaken={imageTakenHandler}
              meterReadingType={selectedValue}
              meterReadingValue={meterReading}
              showActivityIndicator={showActivityIndicator}
              props_navigation={props.navigation}
              setStartDay={setStartDay}
              setEndDay={setEndDay}
              setRefreshing={setRefreshing}
              setSelectedValue={setSelectedValue}
              setMeterReading={setMeterReading}
            />
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
  mainView: {
    flex: Dimensions.get("window").height < 600 ? 4.3 : 4.8,
    backgroundColor: "white",
    padding: 10,
  },
  setUp: {
    color: "red",
    backgroundColor: "red",
  },
  FieldTitle: {
    fontSize: 18,
    color: "#403e3f",
    marginBottom: 10,
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
  Separator: {
    backgroundColor: "#C1C1C1",
    height: 1,
  },
});
export default MeterReadingScreen;
