import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AppLoading } from 'expo';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import SignInScreen from "../screens/SignInScreen";
import ForgottenPasswordScreen from "../screens/ForgottenPasswordScreen";
import CustomDrawerContent from "./CustomDrawerContent";
import NetInfo from "@react-native-community/netinfo";
import * as authActions from "../store/actions/auth";
import { useSelector, useDispatch } from "react-redux";
import { env } from "../env";
import DashboardStack from "./DashboardStack";
import DrawerNavigation from "./DrawerNavigation";

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
  const [initialRoute, setInitialRoute] = useState(null)

  const checkLoggedIn = async () => {
    const isLogin = await AsyncStorage.getItem("isLogin")
    console.log("isLogingg", isLogin)
    if (isLogin) {
      setInitialRoute("DrawerNavigation")
    } else setInitialRoute("Login")

  }

  useEffect(() => {
    checkLoggedIn()
  }, [])

  // if () {
  //   return (
  //     <AppLoading
  //       startAsync={checkAuth}
  //       onFinish={() => {
  //         if (storedEmail && storedToken) {
  //           dispatch(authActions.alreadySignedIn());
  //         } else {
  //           dispatch(authActions.notSignedIn());
  //         }
  //       }}
  //     />
  //   );
  // }


  return initialRoute && (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: "Sign in", }}
      />
      <Stack.Screen
        name="ForgottenPassword"
        component={ForgottenPasswordScreen}
        options={{ title: "Forgotten Password?", }}
      />
      <Stack.Screen
        name="DrawerNavigation"
        component={DrawerNavigation}
      />

    </Stack.Navigator>
  );

};
export default AppNavigator;
