import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text, View,Dimensions,LogBox} from 'react-native';
import MultiSelect from 'react-native-multiple-select';
import Header from '../components/Header'

const dummyItems = [
  {id: 1, name: 'angellist'},
  {id: 2, name: 'codepen'},
  {id: 3, name: 'envelope'},
  {id: 4, name: 'etsy'},
  {id: 5, name: 'facebook'},
  {id: 6, name: 'foursquare'},  
  {id: 7, name: 'github-alt'},
  {id: 8, name: 'github'},
  {id: 9, name: 'gitlab'},
  {id: 10, name: 'instagram'},
]
  const PickupInternalAddonsScreen = props => {

    
    // console.log(props.route.params)
    const [selectedItems, setSelectedItems] = useState([]);
    const [items, setItems] = useState([dummyItems])
    const [checkingTitle, setCheckingTitle] = useState([])

    LogBox.ignoreLogs([
      'Non-serializable values were found in the navigation >state',
     ]);


    const screenTitle = props.route.params.title
    const addons = props.route.params.addons
    const itemID = props.route.params.itemID
    const serviceName = props.route.params.serviceName
    // console.log('--1')
    // console.log(itemID)
    // console.log(addons)
    // console.log('--2')

    // console.log("--1--")
    // console.log(selectedItems)
    // console.log("--2--")

    useEffect(() => {
      if(checkingTitle.indexOf(screenTitle) !== -1){
        console.log("Value exists!")
      } else{
        console.log("Value does not exists!")
        for (let i in addons){
          let newArray = [...checkingTitle, screenTitle]
          setCheckingTitle(newArray)
          addons[i].id =  addons[i].id.toString() + ',' + addons[i].name.toString() + "," + screenTitle + "," + serviceName
        }
      }
    },[screenTitle]);
    
    useEffect(() => {

      try{
          setItems(addons)
        }
      catch (error) {
        Alert.alert(error)
          console.log(error);
      }
      },[screenTitle]);

    const onSelectedItemsChange = (selectedItems,aa) => {
      // console.log('item ID:',itemID)
      // console.log('add  ID:',selectedItems)
      // console.log('-->',aa)
      // console.log('both   :',selectedItems+itemID)
      // console.log(selectedItems)  
      props.route.params.selectAddons(selectedItems)
      setSelectedItems(selectedItems);
    };
    
    // console.log(items)
    // console.log(screenTitle)
    // console.log(selectedItems)
    return (
        <View style={styles.container}>
        <Header
            toggleDrawer={props.navigation.toggleDrawer}
            screenName={screenTitle + ' Addons'}
            // backButton={props.navigation.goBack}
            />
        <View style={styles.mainView}>
          {/* <Text style={styles.titleText}>
            Multiple Select / Dropdown / Picker Example
            in React Native
          </Text> */}
          <MultiSelect
            hideTags
            items={items}
            uniqueKey="id"
            onSelectedItemsChange={onSelectedItemsChange}
            onSubmit={onSelectedItemsChange}
            selectedItems={selectedItems}
            selectText="Pick Addons"
            searchInputPlaceholderText="Search Addons"
            onChangeInput={(text) => console.log('Search -->',text)}
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#0d72fe"
            selectedItemIconColor="#0d72fe"
            itemTextColor="grey"
            displayKey="name"
            searchInputStyle={{color: '#CCC'}}
            submitButtonColor="#0d72fe"
            submitButtonText="Confirm"
            // hideSubmitButton='true'
            style={styles.MultiSel}
          />
        </View>
        {/* <Text>{selectedItems}</Text> */}
      </View>
    );
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    mainView:{
        flex: Dimensions.get('window').height < 600 ? 4.3 : 4.8,
        backgroundColor: 'white',
        padding:0
      },
    titleText: {
      padding: 8,
      fontSize: 16,
      textAlign: 'center',
      fontWeight: 'bold',
    },
  });

  export default PickupInternalAddonsScreen;