import React, { useState } from "react";
import { Alert,View,Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AppLoading } from 'expo';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import SignInScreen from "../screens/SignInScreen";
import ForgottenPasswordScreen from "../screens/ForgottenPasswordScreen";
import MeterReadingScreen from "../screens/MeterReadingScreen";
import YourTodayRidesScreen from "../screens/YourTodayRidesScreen";
import RideHistoryScreen from "../screens/RideHistoryScreen";
import PickupScreen from "../screens/PickupScreen";
import PickupInternalScreen from "../screens/PickupInternalScreen";
import DropOffScreen from "../screens/DropOffScreen";
import CustomDrawerContent from "./CustomDrawerContent";
import DashboardScreen from "../screens/DashboardScreen";
import PickupInternalAddonsScreen from "../screens/PickupInternalAddonScreen";
import QRCodeScreen from "../screens/QRCodeScreen";
import CancelScreen from "../screens/CancelScreen";
import ConfirmOrderScreen from "../screens/ConfirmOrderScreen";
import CollectPaymentScreen from "../screens/CollectPaymentScreen";
import RecentOrdersScreen from "../screens/RecentOrdersScreen";
import OrdersPaymentScreen from "../screens/OrdersPaymentScreen";
import NetInfo from "@react-native-community/netinfo";
import * as authActions from "../store/actions/auth";
import { useSelector, useDispatch } from "react-redux";
import { env } from "../env";
import DropOffStack from "./DropOffStack";

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

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
let storedEmail;
let storedToken;
let initialRoute;
const URL = env.URL + env.api_daystatus;

const meterCheck = async () => {
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
    let finalURL = `${URL}/${storedRiderID}`;
    console.log("Fetching Data From", finalURL);
    let response = await fetchWithTimeout(
      finalURL,
      requestOptions,
      10000,
      "Request Timeout, Check Your Connection"
    );
    response = await response.json();
    await AsyncStorage.setItem(
      "meter",
      JSON.stringify({ startDay: response.startDay, endDay: response.endDay })
    );
  } catch (error) {
    console.log("Error in setting meter data!", error);
  }
};
const checkAuth = async () => {
  const { isConnected } = await NetInfo.fetch();
  if (!isConnected) {
    Alert.alert("Internet Error!");
    initialRoute = "INTERNET ERROR";
  } else {
    initialRoute = "Dashboard";
  }
  try {
    storedEmail = await AsyncStorage.getItem("email");
  } catch (err) {
  }

  try {
    storedToken = await SecureStore.getItemAsync("token");
  } catch (err) {
  }
  try {
    storedRiderID = await AsyncStorage.getItem("rider_id");
  } catch (err) {
  }
  meterCheck(); //This function is for checking meter status
};

const AppNavigator = () => {
  const [authenticatedMeterCheck, setAuthenticatedMeterCheck] = useState(false);
  const state = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  //Following Snippet is for Splash Screen! It checks if token and email exists!
  if (!!state.isSignedIn & !!state.isTokenChecked) {
    return (
      <AppLoading
        startAsync={checkAuth}
        onFinish={() => {
          if (storedEmail && storedToken) {
            dispatch(authActions.alreadySignedIn());
          } else {
            dispatch(authActions.notSignedIn());
            setAuthenticatedMeterCheck(false);
          }
        }}
      />
     
    );
  }
  if (!state.isSignedIn) {
    return (
      <Stack.Navigator screenOptions={{headerShown:false}}  >
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{
            title: "Sign in",
            animationTypeForReplace: state.isSignout ? "pop" : "push",
          }}
        />
        <Stack.Screen
          name="ForgottenPassword"
          component={ForgottenPasswordScreen}
          options={{
            title: "Forgotten Password?",
            animationTypeForReplace: state.isSignout ? "pop" : "push",
          }}
        />
      </Stack.Navigator>
    );
  } else {
    return (
      <Drawer.Navigator
        initialRouteName="Dashboard"
        labelStyle={{ fontSize: "2%" }}
        screenOptions={{
          headerShown:false,
          backgroundColor: "#0c76e6",
          padding: 0,
          itemStyle: {
            fontSize: 10,
            padding: 10,
            borderBottomColor: "#d6e8fc",
            borderBottomWidth: 0.4,
            backgroundColor: "transparent",
            width: "auto",
            borderRadius: 0,
            marginVertical: 0,
            marginHorizontal: 0,
          },
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="signal"
                color={focused ? "#03fcf8" : "white"}
                size={22}
                style={{ marginRight: -20 }}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Meter Reading"
          component={MeterReadingScreen}
          options={{
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="speedometer"
                color={focused ? "#03fcf8" : "white"}
                size={22}
                focused={true}
                style={{ marginRight: -20 }}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="My Rides"
          component={YourTodayRidesScreen}
          options={{
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="motorbike"
                color={focused ? "#03fcf8" : "white"}
                size={22}
                style={{ marginRight: -20 }}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Payment Only Rides"
          component={CollectPaymentScreen}
          options={{
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="cash"
                color={focused ? "#03fcf8" : "white"}
                size={22}
                style={{ marginRight: -20 }}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Recent Orders"
          component={RecentOrdersScreen}
          options={{
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="motorbike"
                color={focused ? "#03fcf8" : "white"}
                size={22}
                style={{ marginRight: -20 }}
              />
            ),
          }}
        />
        {/* <Drawer.Screen
          name="Orders Payment"
          component={RecentOrdersScreen}
          options={{
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="account-cash"
                color={focused ? "#03fcf8" : "white"}
                size={22}
                style={{ marginRight: -20 }}
              />
            ),
          }}
        /> */}
        <Drawer.Screen
          name="Ride History"
          component={RideHistoryScreen}
          options={{
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="history"
                color={focused ? "#03fcf8" : "white"}
                size={22}
                style={{ marginRight: -20 }}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Orders Payment"
          component={OrdersPaymentScreen}
          options={{
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="history"
                color={focused ? "#03fcf8" : "white"}
                size={22}
                style={{ marginRight: -20 }}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Pickup"
          component={PickupScreen}
          options={{
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="history"
                color={focused ? "#03fcf8" : "white"}
                size={22}
                style={{ marginRight: -20 }}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="PickupInternal"
          component={PickupInternalScreen}
          options={{
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="history"
                color={focused ? "#03fcf8" : "white"}
                size={22}
                style={{ marginRight: -20 }}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Drop Off"
          component={DropOffStack}
          options={{
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="history"
                color={focused ? "#03fcf8" : "white"}
                size={22}
                style={{ marginRight: -20 }}
              />
            ),
          }}
        />
        {/* <Drawer.Screen
          name="QR Code"
          component={QRCodeScreen}
          icon={({ focused, color, size }) => (
            <Icon
              color={color}
              size={size}
              name={focused ? "heart" : "heart-outline"}
            />
          )}
        /> */}
        <Drawer.Screen
          name="PickupInternalAddonsScreen"
          component={PickupInternalAddonsScreen}
          icon={({ focused, color, size }) => (
            <Icon
              color={color}
              size={size}
              name={focused ? "heart" : "heart-outline"}
            />
          )}
        />
        <Drawer.Screen
          name="CancelScreen"
          component={CancelScreen}
          icon={({ focused, color, size }) => (
            <Icon
              color={color}
              size={size}
              name={focused ? "heart" : "heart-outline"}
            />
          )}
        />
        <Drawer.Screen name="Confirm Order" component={ConfirmOrderScreen} />
      </Drawer.Navigator>
    );
  }
};
export default AppNavigator;
