import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import QRCodeScreen from "../screens/QRCodeScreen";
import DropOffScreen from "../screens/DropOffScreen";

const DropOffStack = () => {
    const Stack = createStackNavigator();

    return (
        <Stack.Navigator
        initialRouteName="DropOffScreen"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="DropOffScreen" component={DropOffScreen} />
            <Stack.Screen name="QR Code" component={QRCodeScreen} />
        </Stack.Navigator>
    );
};

export default DropOffStack;
