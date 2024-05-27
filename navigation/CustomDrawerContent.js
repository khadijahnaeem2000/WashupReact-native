import React, { useState, useEffect } from "react";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useDispatch } from "react-redux";
import * as authActions from "../store/actions/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Image, Text, View, StyleSheet } from "react-native";
import { env } from "../env";
import profilePicture from "../assets/images/profilepic.png";

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

const MeterStatusURL = env.URL + env.api_daystatus;
const URL = env.URL;
const profilePictureURI = Image.resolveAssetSource(profilePicture).uri;

function CustomDrawerContent(props) {
    const [profilePic, setProfilePic] = useState(profilePictureURI);
    const [profileName, setProfileName] = useState("Name");
    const dispatch = useDispatch();

 
    

    const handleSignOut = async () => {
        dispatch(authActions.signOut());
    };

    useEffect(() => {
        console.log("useEffect triggered");
        getStoredData()
            .then(() => {
                console.log("getStoredData completed successfully");
                meterCheck();
            })
            .catch(error => {
                console.log("Error in getStoredData:", error);
            });
    },);
    const getStoredData = async () => {
        try {
            let storedEmail = await AsyncStorage.getItem("profileName");
            storedEmail = storedEmail.substring(1, storedEmail.length - 1);
            console.log("Retrieved email from AsyncStorage:", storedEmail);
            setProfileName(storedEmail);
            console.log("Updated profileName state:", profileName);
        } catch (err) {
            console.log("Error in Retrieving Email from AsyncStorage:", err);
        }
        try {
            let storedProfilePicURL = await AsyncStorage.getItem("profilePicURL");
            storedProfilePicURL = storedProfilePicURL.substring(1, storedProfilePicURL.length - 1);
            storedProfilePicURL = `${URL}uploads/riders/${storedProfilePicURL}`;
            setProfilePic(storedProfilePicURL);
        } catch (err) {
            console.log("Error in Retrieving Profile Pic from AsyncStorage:", err);
        }
    };
    
    const meterCheck = async () => {
        try {
            console.log("CHECKING METER STATUS");
            let savedToken = await SecureStore.getItemAsync("token");
            savedToken = savedToken.substring(1, savedToken.length - 1);
            console.log("Token --> ", savedToken, typeof savedToken);
            let myHeaders = new Headers();
            myHeaders.append("Accept", "application/json");
            myHeaders.append("Authorization", `Bearer ${savedToken}`);

            let requestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow",
            };
            let finalURL = `${MeterStatusURL}/${storedRiderID}`;
            console.log("Fetching Data From", finalURL);
            let response = await fetchWithTimeout(finalURL, requestOptions, 10000);
            response = await response.json();
            console.log("----- Checking Day Status For Meter -------3");
            console.log(response);
            await AsyncStorage.setItem(
                "meter",
                JSON.stringify({ startDay: response.startDay, endDay: response.endDay })
            );
            console.log("----- Checking Day Status For Meter -------4");
        } catch (error) {
            console.log("Error in setting meter data!", error);
        }
    };

    const { state, ...rest } = props;
    const newState = { ...state };

    console.log("working on navigator");
    newState.routes = newState.routes.filter((item) => !["Pickup", "PickupInternal", "Drop Off", "QR Code", "PickupInternalAddonsScreen", "CancelScreen", "Confirm Order"].includes(item.name));

    return (
        <DrawerContentScrollView {...rest}>
            <DrawerItem
                label={() => (
                    <View style={styles.profileArea}>
                        <Text style={{ color: "black" }}>{profileName}</Text>
                        <View style={styles.activeIcon} />
                    </View>
                )}
                icon={({ focused, color, size }) => (
                    <Image
                        source={{ uri: profilePic }}
                        style={{ height: 50, width: 40, marginRight: -20 }}
                        resizeMode="contain"
                    />
                )}
            />
            {newState.routes.map((route, index) => (
                <DrawerItem
                    key={index}
                    label={route.name}
                    onPress={() => props.navigation.navigate(route.name)}
                />
            ))}
            <DrawerItem
                labelStyle={{ color: "black" }}
                label="Logout"
                onPress={handleSignOut}
                icon={({ focused, color, size }) => (
                    <Icon
                        name="logout"
                        color={focused ? "#03fcf8" : "black"}
                        size={22}
                        style={{ marginRight: -20 }}
                    />
                )}
            />
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    activeIcon: {
        width: 8,
        height: 8,
        backgroundColor: "#33e642",
        position: "absolute",
        right: -35,
        top: 5,
        borderRadius: 50,
    },
    profileArea: {
        width: "100%",
        marginHorizontal: 0,
        paddingHorizontal: 0,
    },
});

export default CustomDrawerContent;
