import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MeterReading from "../screens/MeterReading";
import Dashboard from "../screens/DashboardScreen";
import MyRides from "../screens/MyRides";
import CollectPayment from "../screens/CollectPayment";
import DropOff from "../screens/DropOffScreen";
import OrdersPayment from "../screens/OrdersPayment";
import Pickup from "../screens/Pickup";
import PickupInternal from "../screens/PickupInternal";
import PickupInternalAddons from "../screens/PickupInternalAddonScreen";
import QRCode from "../screens/QRCode";
import RecentOrders from "../screens/RecentOrders";
import RideHistory from "../screens/RideHistory";
import ConfirmOrder from "../screens/ConfirmOrder";
import Cancel from "../screens/Cancel";

const DashboardStack = () => {
    const Stack = createStackNavigator();

    return (
        <Stack.Navigator
            initialRouteName="Dashboard"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="MeterReading" component={MeterReading} />
            <Stack.Screen name="MyRides" component={MyRides} />
            <Stack.Screen name="CollectPayment" component={CollectPayment} />
            <Stack.Screen name="DropOff" component={DropOff} />
            <Stack.Screen name="OrdersPayment" component={OrdersPayment} />
            <Stack.Screen name="Pickup" component={Pickup} />
            <Stack.Screen name="PickupInternal" component={PickupInternal} />
            <Stack.Screen name="PickupInternalAddons" component={PickupInternalAddons} />
            <Stack.Screen name="QRCode" component={QRCode} />
            <Stack.Screen name="RecentOrders" component={RecentOrders} />
            <Stack.Screen name="RideHistory" component={RideHistory} />
            <Stack.Screen name="ConfirmOrder" component={ConfirmOrder} />
            <Stack.Screen name="Cancel" component={Cancel} />
        </Stack.Navigator>
    );
};

export default DashboardStack;
