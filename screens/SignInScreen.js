import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    StyleSheet,
    TouchableWithoutFeedback,
    Keyboard,
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Input } from 'react-native-elements';
import { useNetInfo } from "@react-native-community/netinfo";
import washupLogo from '../assets/images/logo.png'
import authBackground from '../assets/images/authBackground.png'
import * as authActions from '../store/actions/auth'

const authBackgroundURI = Image.resolveAssetSource(authBackground).uri
const washupLogoURI = Image.resolveAssetSource(washupLogo).uri

let stateForStyle
const SignInScreen = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const netInfo = useNetInfo();
    const state = useSelector(state => state.auth);

    stateForStyle = state
    const dispatch = useDispatch();
    const handleFogottenPassword = () => {  }
    
    const handleSignIn = () => {
        if (!netInfo.isConnected) {
            Alert.alert("Internet Error!")
        }
        else {
            dispatch(authActions.signIn(email, password))
        }
    }
    if (state.refreshing) {
        return (
            <View style={styles.loadercontainer} >
                <View style={styles.backgroundImage}>
                    <Image
                        source={{ uri: authBackgroundURI }}
                        style={styles.backgroundImage}
                    />
                </View>
                <View style={styles.loginForm}>
                    <Image
                        source={{ uri: washupLogoURI }}
                        resizeMode="contain"
                        style={styles.AppLogo}
                    />
                </View>
                <ActivityIndicator size="large" color="#fff" style={styles.appLoader} />
            </View>
        )
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} styles={styles.container}>
            <View style={styles.container} >
                <View style={styles.backgroundImage}>
                    <Image
                        source={{ uri: authBackgroundURI }}
                        style={styles.backgroundImage}
                    />
                </View>
                <View style={styles.loginForm}>
                    <Image
                        source={{ uri: washupLogoURI }}
                        resizeMode="contain"
                        style={styles.AppLogo}
                    />
                    <Input
                        placeholder='Username'
                        placeholderStyle={{ backgroundColor: "white", borderColor: 'red' }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={setEmail}
                        style={styles.inputFields}
                        inputContainerStyle={{ borderColor: 'white' }}
                        placeholderTextColor="white"
                        leftIcon={
                            <Icon
                                name='user'
                                size={24}
                                color='white'
                            />
                        }
                    />
                    <Input
                        placeholder='Password'
                        secureTextEntry={true}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={setPassword}
                        style={styles.inputFields}
                        inputContainerStyle={{ borderColor: 'white' }}
                        placeholderTextColor="white"
                        leftIcon={
                            <Icon
                                name='lock'
                                size={24}
                                color='white'
                            />
                        }
                    />
                    <TouchableOpacity
                        style={styles.button_logincontainer}
                        onPress={handleSignIn}
                    >
                        <Text style={styles.buttonLogin}> Login</Text>
                    </TouchableOpacity>
                    <View style={styles.ForgotBtn}>
                        <TouchableOpacity
                            style={styles.FogottenButton}
                            onPress={handleFogottenPassword}>
                            <Text style={styles.colorWhite}>Forget Password ?</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.signInErrorView}>
                        <Text style={styles.signInErrorText}>{state.signInError}</Text>
                    </View>
                </View>

            </View>
        </TouchableWithoutFeedback>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainView: {
        flex: Dimensions.get('window').height < 600 ? 4.3 : 4.8,
        backgroundColor: 'white',
        padding: 0
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // or 'stretch'
    },
    loginForm: {
        width: '100%',
        position: "absolute",
        top: "25%",
        height: "30%",
        paddingLeft: 10,
        paddingRight: 10
    },
    button_logincontainer: {
        marginHorizontal: 10
    },
    buttonLogin: {
        backgroundColor: 'white',
        color: "#006be4",
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'poppins-exbold',
        backgroundColor: "white",
        fontFamily: 'poppins-exbold',
        paddingVertical: 10,
        borderRadius: 2
    },
    AppLogo: {
        height: 120,
        marginBottom: 10,
    },
    inputFields: {
        color: "white",
        borderWidth: 0,
        fontFamily: "poppins-regular",
        fontWeight: '100'
    },
    ForgotBtn: {
        alignItems: 'flex-end',
        paddingTop: 10,
        paddingRight: 10,
        fontFamily: 'poppins-exbold',
        fontWeight: 'normal'
    },
    colorWhite: {
        color: 'white',


    },
    button: {

    },
    signInErrorView: {
        alignItems: 'center',
        opacity: stateForStyle === '' ? 0 : 1,
    },
    signInErrorText: {
        color: 'red',
    },
    loadercontainer: {
        flex: 1,
    },
    appLoader: {
        position: "absolute",
        height: '100%',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }
});
export default SignInScreen;
