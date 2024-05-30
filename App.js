// import React, { useState } from 'react';
// import { AppLoading } from 'expo';
// import * as Font from 'expo-font';
// import { NavigationContainer } from '@react-navigation/native';
// import AppNavigator from './navigation/AppNavigator';
//  //import { createStore, combineReducers, applyMiddleware } from 'redux';
// // import {ReduxThunk} from 'redux-thunk';

// // import { Provider } from 'react-redux';
// // import authReducer from './store/reducers/auth'
// // import washupReducer from './store/reducers/washup'
// import { createStore, combineReducers, applyMiddleware } from 'redux';
// import thunk from 'redux-thunk'; // corrected import statement

// import { Provider } from 'react-redux';
// import authReducer from './store/reducers/auth';
// import washupReducer from './store/reducers/washup';
// import { View , Text} from 'react-native';
// // -------------------------REDUX INITIAL STUFF------------------------//
// const rootReducer = combineReducers({
//   auth: authReducer,
//   washup: washupReducer
// });

// const store = createStore(rootReducer, applyMiddleware(thunk)); 
// //---------------------------------------------------------------//

// //-------------------------FETCH FONTS FUNCTIONS----------------------------//
// const fetchFonts = () => {
//   console.log("--> executing fonts func")
//   return Font.loadAsync({
//     'poppins-regular':require('./assets/fonts/Poppins-Regular.ttf'),
//     'poppins-medium':require('./assets/fonts/Poppins-Medium.ttf'),
//     'poppins-light':require('./assets/fonts/Poppins-Light.ttf'),
//     'poppins-bold':require('./assets/fonts/Poppins-Bold.ttf'),
//     'poppins-exbold':require('./assets/fonts/Poppins-ExtraBold.ttf'),
//   });
  
// };

// //-------------------------------------------------------------------------//


// export default function App() {
//   const [fontLoaded, setFontLoaded] = useState(false);
//   if (!fontLoaded) {
//     return (
//       <AppLoading
//         startAsync={fetchFonts}
//         onFinish={() => {
//           // console.log('Fonts Have Been Loaded -->',fetchFonts,fetchFonts())
//           setFontLoaded(true);
//         }}
//       />
     
//     );
//   }


//   return (
//     <Provider store={store}>
//       <NavigationContainer>
//         <AppNavigator />
//       </NavigationContainer>
//     </Provider>
//   );
// }
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import authReducer from './store/reducers/auth';
import washupReducer from './store/reducers/washup';
import DropOffStack from './navigation/DropOffStack';

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  washup: washupReducer
});

// Create Redux store
const store = createStore(rootReducer, applyMiddleware(thunk));

// Function to fetch fonts
const fetchFonts = async () => {
  await Font.loadAsync({
    'poppins-regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'poppins-medium': require('./assets/fonts/Poppins-Medium.ttf'),
    'poppins-light': require('./assets/fonts/Poppins-Light.ttf'),
    'poppins-bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'poppins-exbold': require('./assets/fonts/Poppins-ExtraBold.ttf'),
  });
};

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await fetchFonts();
      setFontLoaded(true);
    };

    loadFonts();
  }, []);

  if (!fontLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}
