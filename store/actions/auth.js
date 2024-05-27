
import { env } from '../../env'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
export const SIGN_IN = 'SIGN_IN';
export const ALREADY_SIGNED_IN = 'ALREADY_SIGNED_IN'
export const NOT_SIGNED_IN = 'NOT_SIGNED_IN'
export const SIGN_OUT = 'SIGN_OUT'
export const SIGN_IN_ERROR = 'SIGN_IN_ERROR'
export const INTERNET_ERROR = 'INTERNET_ERROR'
export const REFRESHING = 'REFRESHING'


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
export const alreadySignedIn = () => {
    console.log('AUTHENTICATION ACTION : ALREADY_SIGNED_IN')
    return async dispatch => { 
        dispatch({ type: ALREADY_SIGNED_IN })
    }
}

export const notSignedIn = () => {
    console.log('AUTHENTICATION ACTION : NOT_SIGNED_IN')
    return async dispatch => { 
        dispatch({ type: NOT_SIGNED_IN })
    }
}
export const signOut = () => {
    return async dispatch => { 
        console.log('AUTHENTICATION ACTION : SIGN_OUT')
        let savedToken = await SecureStore.getItemAsync('token');
        savedToken = savedToken.substring(1, savedToken.length-1);
        console.log("=======================================>",savedToken)
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${savedToken}`);
       
        await fetchWithRetry(env.URL + env.api_logout, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${savedToken}`
            }
        }, 10000, MAX_RETRIES);
        await AsyncStorage.removeItem('email');
        await AsyncStorage.removeItem('rider_id');
        await SecureStore.deleteItemAsync('token');
        dispatch({ type: SIGN_OUT })
    }
}
export const signIn = (email, password) => {
    URL_SignIn = env.URL + env.api_login
    return async dispatch => { 
        console.log('AUTHENTICATION ACTION : SIGN_IN')
        console.log('---')
        console.log(email)
        console.log(password)
        console.log(URL_SignIn)
        console.log('---')


        dispatch({ type: REFRESHING, payload:true })
        try {
            const response = await fetchWithRetry(URL_SignIn, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }, 10000, MAX_RETRIES);
                try{
                    let json = await response.json();
                    // console.log(json)
                    // console.log(json.token)
                    console.log("--1")
                    console.log(json)
                    console.log("--2")
                    console.log(json.token)
                    console.log(json.rider_id)
                    console.log("--3")

                    try{
                        await SecureStore.setItemAsync(
                            'token',
                            JSON.stringify(json.token)
                        );
                        console.log("Token has been stored in the device!")
                    }
                    catch(err){
                        console.log("Token Not Received!",err)
                        dispatch({ type: REFRESHING, payload:false })
                    } 

                    try{
                        await AsyncStorage.setItem(
                            'email',
                            JSON.stringify(json.username)
                             );
                        
                        console.log("Username has been stored in the device!")
                    }
                    catch(err){
                        console.log("Username Not Received!",err)
                        dispatch({ type: REFRESHING, payload:false })
                    }
                    
                    try{
                        await AsyncStorage.setItem(
                            'rider_id',
                            JSON.stringify(json.rider_id)
                             );
                        
                        console.log("Rider ID has been stored in the device!")
                    }
                    catch(err){
                        console.log("Username Not Received!",err)
                        dispatch({ type: REFRESHING, payload:false })
                    }

                    try{
                        let savedToken = await SecureStore.getItemAsync('token');
                        savedToken = savedToken.substring(1, savedToken.length-1);
                        console.log("Token --> ",savedToken, typeof savedToken)
                        storedRiderID = await AsyncStorage.getItem('rider_id')
                        console.log("Rider ID -=-=>",storedRiderID)
                        let myHeaders = new Headers();
                        myHeaders.append("Accept", "application/json");
                        myHeaders.append("Authorization", `Bearer ${savedToken}`);
                        
                        let requestOptions = {
                        method: 'GET',
                        headers: myHeaders,
                        redirect: 'follow'
                        };
                        let URLMeter = env.URL + env.api_daystatus
                        let finalURL = `${URLMeter}/${storedRiderID}`
                        console.log("Fetching Data From",finalURL)
                        let response = await fetchWithTimeout(
                        finalURL, requestOptions, 10000, 'Request Timeout, Check Your Connection'
                        );
                        response = await response.json();
                        console.log('----- Checking Day Status For Meter -------1')
                        console.log(response)
                        await AsyncStorage.setItem(
                        'meter',
                        JSON.stringify({startDay:response.startDay, endDay:response.endDay})
                        );
                        console.log('----- Checking Day Status For Meter -------2')
                    }
                    catch(err){
                        console.log("Error in setting meter data!",err)
                        dispatch({ type: REFRESHING, payload:false })
                    }

                    if(json.status ==="success" ){
                        dispatch({ type: SIGN_IN, payload:true })
                        dispatch({ type: REFRESHING, payload:false })
                    }
                    else{
                        console.log("Login Failed!")
                        alert("Login Failed! Wrong Username or Password!'")
                        dispatch({ type: SIGN_IN_ERROR, payload:'Wrong Username or Password!' })
                    }
                }
                catch(err){
                    console.log("JSON NOT RECIEVED FROM THE SERVER!")
                    alert("Server Error!")
                    dispatch({ type: REFRESHING, payload:false })
                }
          } 
        catch (error) {
            dispatch({ type: REFRESHING, payload:false })
            console.error(error);  } } }




            /// ---
        