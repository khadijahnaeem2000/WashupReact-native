import { StyleSheet, } from 'react-native'
import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from './CustomDrawerContent';
import DashboardStack from './DashboardStack';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const DrawerNavigation = () => {
    const Drawer = createDrawerNavigator();
    return (
        <Drawer.Navigator
            initialRouteName="Dashboard"
            labelStyle={{ fontSize: "2%" }}
            screenOptions={{
                headerShown: false,
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
                name="DashboardStack"
                component={DashboardStack}
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
        </Drawer.Navigator>
    )
}

export default DrawerNavigation

const styles = StyleSheet.create({})