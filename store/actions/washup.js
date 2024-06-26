import { env } from '../../env'

export const DASHBOARD = 'DASHBOARD';

export const reloadDashboard = () => {
    return async dispatch => { 

        fetch(URL)
            .then(response => response.text())
            .then(result => {
                dashboardObj = JSON.parse(result)
                setRefreshing(false)
            })
            .catch(error => {
                setRefreshing(false)
            });


        dispatch({ type: DASHBOARD })
    }
}