import { env } from '../../env'

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
export const DASHBOARD = 'DASHBOARD';

export const reloadDashboard = () => {
    console.log('WASHUP ACTION : DASHBOARD')
    return async dispatch => { 

        fetch(URL)
            .then(response => response.text())
            .then(result => {
                // console.log(result)
                dashboardObj = JSON.parse(result)
                console.log(dashboardObj)
                console.log(typeof dashboardObj)
                setRefreshing(false)
            })
            .catch(error => {
                console.log('error', error)
                setRefreshing(false)
            });


        dispatch({ type: DASHBOARD })
    }
}