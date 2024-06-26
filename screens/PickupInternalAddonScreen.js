import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MultiSelect from 'react-native-multiple-select';
import Header from '../components/Header'

const dummyItems = [
  { id: 1, name: 'angellist' },
  { id: 2, name: 'codepen' },
  { id: 3, name: 'envelope' },
  { id: 4, name: 'etsy' },
  { id: 5, name: 'facebook' },
  { id: 6, name: 'foursquare' },
  { id: 7, name: 'github-alt' },
  { id: 8, name: 'github' },
  { id: 9, name: 'gitlab' },
  { id: 10, name: 'instagram' },
]
const PickupInternalAddons = ({ navigation, route }) => {
  const { screenTitle, addons, itemID, serviceName } = route.params

  const [selectedItems, setSelectedItems] = useState([]);
  const [items, setItems] = useState([dummyItems])
  const [checkingTitle, setCheckingTitle] = useState([])



  useEffect(() => {
    if (checkingTitle.indexOf(screenTitle) !== -1) {
    } else {
      for (let i in addons) {
        let newArray = [...checkingTitle, screenTitle]
        setCheckingTitle(newArray)
        addons[i].id = addons[i].id.toString() + ',' + addons[i].name.toString() + "," + screenTitle + "," + serviceName
      }
    }
  }, [screenTitle]);

  useEffect(() => {
    setItems(addons)
  }, [screenTitle]);

  const onSelectedItemsChange = (selectedItems, aa) => {
    route.params.selectAddons(selectedItems)
    setSelectedItems(selectedItems);
  };

  return (
    <View style={styles.container}>
      <Header
        toggleDrawer={navigation.toggleDrawer}
        screenName={screenTitle + ' Addons'}
      />
      <View style={styles.mainView}>
        <MultiSelect
          hideTags
          items={items}
          uniqueKey="id"
          onSelectedItemsChange={onSelectedItemsChange}
          onSubmit={onSelectedItemsChange}
          selectedItems={selectedItems}
          selectText="Pick Addons"
          searchInputPlaceholderText="Search Addons"
          onChangeInput={(text) => { }}
          tagRemoveIconColor="#CCC"
          tagBorderColor="#CCC"
          tagTextColor="#CCC"
          selectedItemTextColor="#0d72fe"
          selectedItemIconColor="#0d72fe"
          itemTextColor="grey"
          displayKey="name"
          searchInputStyle={{ color: '#CCC' }}
          submitButtonColor="#0d72fe"
          submitButtonText="Confirm"
          style={styles.MultiSel}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainView: {
    flex: Dimensions.get('window').height < 600 ? 4.3 : 4.8,
    backgroundColor: 'white',
    padding: 0
  },
  titleText: {
    padding: 8,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default PickupInternalAddons;