import React, {useState,useEffect} from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNetInfo} from "@react-native-community/netinfo";
import { Input,Button } from 'react-native-elements';
import washupLogo from '../assets/images/logo.png'
import authBackground from '../assets/images/authBackground.png'
import { env } from '../env'
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
}//-----------------FOR IMAGES-----------------//
const authBackgroundURI = Image.resolveAssetSource(authBackground).uri
const washupLogoURI     = Image.resolveAssetSource(washupLogo).uri
//-------------------------------------------//
const ForgottenPasswordScreen = props => {
    const [username, setUsername] = useState('');
    const [refreshing, setRefreshing] = useState(false)
    const netInfo = useNetInfo();
    const handleSubmit = async ()=>{
        if(!username){
            alert("Type a Username!")
            return
        }
        if(!netInfo.isConnected){
            Alert.alert("Internet Error!")
        }
        else{
            console.log("-1-")
            const URL = env.URL + env.api_forgot
            console.log("-2-")
            try{
                setRefreshing(true)
                let response = await fetchWithTimeout(
                    URL,
                    {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          username: username
                        })
                      }, 10000, 'Request Timeout, Check Your Connection'
                    );
                let json = await response.json();
                setRefreshing(false)
                console.log(json)
                if(json.status=="failed"){
                    alert(json.error)
                }
                if(json.status=="success"){
                    alert("Username Sent!")
                }
            }
            catch(error){
                console.log('--000--')
                error = 'Request Timeout, Check Your Connection' ? 
                alert("Request Timeout, Check Your Connection") :
                alert("Server Error!")
                console.log(error);
                console.log('--001--')
                setRefreshing(false)
            }
        }
    }
    const handleSignIn = ()=>{
        props.navigation.navigate('SignIn')
}
    if(refreshing){
        return(
            <View style={styles.loadercontainer} >
            <View style={styles.backgroundImage}>
                <Image
                    source={{uri: authBackgroundURI}}
                    style={styles.backgroundImage}
                />
            </View>
            <View style={styles.loginForm}>
            <Image
                    source={{uri: washupLogoURI}}
                    resizeMode="contain"
                    style={styles.AppLogo}
                    />
            </View>
               <ActivityIndicator size="large" color="#fff" style={styles.appLoader}/>
          </View>
        )
      }
return (
    <TouchableWithoutFeedback   onPress={Keyboard.dismiss} styles={styles.container}>
        <View style={styles.container} >
            <View style={styles.backgroundImage}>
                <Image
                    source={{uri: authBackgroundURI}}
                    style={styles.backgroundImage}
                />
            </View>
            <View style={styles.loginForm}>
                <Image
                    source={{uri: washupLogoURI}}
                    resizeMode="contain"
                    style={styles.AppLogo}
                    />
                <Input
                    placeholder='User Name'
                    placeholderStyle={{ backgroundColor: "white", borderColor: 'red' }}     
                    autoCapitalize="none"
                    autoCorrect={false}
                    // underlineColorAndroid="#ffffff"
                    onChangeText={setUsername}
                    style={styles.inputFields}
                    inputContainerStyle = {{borderColor:'white'}}
                    placeholderTextColor="white" 
                    leftIcon={
                        <Icon
                        name='user'
                        size={24}
                        color='white'
                        />
                    }
                />
                    <TouchableOpacity 
                        style={styles.button_logincontainer}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.buttonLogin}> Confirm</Text>
                    </TouchableOpacity> 
                <View style={styles.ForgotBtn}>
                    <TouchableOpacity
                        style={styles.FogottenButton}
                        onPress={handleSignIn}>
                        <Text style={styles.colorWhite}>Back To Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </TouchableWithoutFeedback>
        );}
const styles = StyleSheet.create({
      container : {
          flex:1,
      },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // or 'stretch'
      },
      loginForm:{
        width: '100%',
        position:"absolute",
        top:"25%",
        height:"30%",
        paddingLeft:10,
        paddingRight:10
      },
      button_logincontainer:{
        marginHorizontal:10
      },
      buttonLogin:{
          backgroundColor:'white',
          color:"#006be4",
          textAlign:'center',
          fontSize:14,
          fontFamily:'poppins-exbold',
          backgroundColor:"white",
          fontFamily:'poppins-exbold',
          paddingVertical:10,
          borderRadius:2
        },
      AppLogo:{
          height:120,
          marginBottom:10,
      },
      inputFields:{
          color:"white",
          borderWidth:0,
      },
      ForgotBtn:{
        alignItems: 'flex-end',
        paddingTop:10,
        paddingRight:10
      },
      colorWhite:{
        color: 'white'
      },
      button:{
        backgroundColor:"white",
      },
      loadercontainer:{
        flex:1,
    },
    appLoader:{
      position:"absolute",
      height:'100%',
      top:0,
      bottom:0,
      left:0,
      right:0
    }
});
export default ForgottenPasswordScreen;
