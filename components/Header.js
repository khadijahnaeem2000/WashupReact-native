import React from "react";
import { 
    StyleSheet, 
    View, 
    Text, 
    Image, 
    TextInput,
    ImageBackground,
    TouchableOpacity,
    Platform,
    Dimensions
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import header from '../assets/images/header.png'

import washupLogo from '../assets/images/logo.png'


//-----------------FOR IMAGES-----------------//
const headerURI     = Image.resolveAssetSource(header).uri
const washupLogoURI = Image.resolveAssetSource(washupLogo).uri

//-----------------FOR IMAGES-----------------//
const Header = ({toggleDrawer,screenName,backButton}) => {

    // console.log('--------->',props)
    // console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=->',backButton)


    const handleDrawer = () => {
        toggleDrawer()      
    }
    return(
        <View style={styles.header}>
                
                  <View style={styles.headerImage}>
                    <Image 
                    source={{uri: headerURI}} 
                    style={styles.headerImage} 
                    />
                  </View>
                  <View style={styles.MainLogo}>
                    <Image
                      source={{uri: washupLogoURI}}
                      resizeMode="contain"
                      style={styles.AppLogo}
                    />
                    <Text style={styles.LogoTitle}>Washup Rider</Text>
                </View>
                {
                backButton ? 
                <View style={styles.BackAction}>
                  <TouchableOpacity 
                  style={styles.BackButton}
                  onPress={backButton}
                  >
                    <Icon name="arrow-left" style={styles.drawerButtonIcon}></Icon>
                  </TouchableOpacity>
                </View> 
                : null
                }
                
                  <Text style={styles.meterTitle}>{screenName}</Text>
                  <TouchableOpacity onPress={handleDrawer} style={styles.drawerButton}>
                    <Icon name="menu" style={styles.drawerButtonIcon}></Icon>
                  </TouchableOpacity>
            </View>
             )

            }
            
            const styles = StyleSheet.create({
              container: {
                flex: 1
              },
              header:{
                  // flex:Dimensions.get('window').height < 600 ? 1.7 : 1.2,
                  height:Dimensions.get('window').height < 600 ? 120 : 130,
                  width: "100%",
                  alignItems:"center",
                  justifyContent:"flex-end"
            
              },
              headerImage:{
                // flex:1,
                width: "100%",
                height:"100%",
                position: 'absolute',
                justifyContent:'center',
                top:0,
                zIndex:0
              },
              MainLogo:{
                  position: 'absolute',
                  left:"3%", 
                  top:Dimensions.get('window').height < 600 ? "15%" : "25%",
                  flexDirection:"row",
                  zIndex: 2
                },
              AppLogo:{
                  width:45,
                  height:45
              },
              LogoTitle:{
                fontSize: Platform.OS === 'ios' ? 22 : 16,
                paddingTop:10,
                paddingLeft:5,
                color: '#FFFFFF',
                textTransform:"uppercase",
                letterSpacing:1
              },
              drawerButton:{
                  position: 'absolute',
                  top:Dimensions.get('window').height < 600 ? "25%" : "30%",
                  right:Dimensions.get('window').height < 600 ? "3%" : "3%"
            
              },
              drawerButtonIcon:{
                  fontSize:Platform.OS === 'ios' ? 26 : 22,
                  color:"#ffffff"
              },
              meterTitle:{
                // fontSize:Platform.OS === 'ios' ? 24 : 20,
                fontSize:Dimensions.get('window').height < 600 ? 16 : 20,
                paddingBottom:Dimensions.get('window').height < 600 ? 20 : 25,
                // paddingTop:Dimensions.get('window').height < 600 ? 0 : 0,
                color:"#ffffff"
              },
              BackAction:{
                position: 'absolute',
                left:10,
                top:'56%',
                bottom:0
              }
            });
            
export default Header;