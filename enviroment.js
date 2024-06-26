import Constants from 'expo-constants';

const ENV = {
    dev: {
        apiUrl: 'https://dev.washup.com.pk/',
    },
    prod: {
        apiUrl: 'https://washup.com.pk/',
    },
};
const getEnvVars = () => {
    // What is __DEV__ ?
    // This variable is set to true when react-native is running in Dev mode.
    // __DEV__ is true when run locally, but false when published.

    if (__DEV__) {
        return ENV.dev;
    } else {
        return ENV.prod;
    }
};

export default getEnvVars;
