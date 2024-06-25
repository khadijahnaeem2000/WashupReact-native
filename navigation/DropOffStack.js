import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import QRCodeScreen from "../screens/QRCode";
import DropOff from "../screens/DropOffScreen";

const DropOffStack = () => {
    const Stack = createStackNavigator();

    return (
        <Stack.Navigator
            initialRouteName="DropOff"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="DropOff" component={DropOff} />
            <Stack.Screen name="QRCode" component={QRCodeScreen} />
        </Stack.Navigator>
    );
};

export default DropOffStack;
