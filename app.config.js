const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
    name: IS_DEV ? 'Washup-App (Dev)' : 'Washup-App',
    slug: 'washme',
    ios: {
        bundleIdentifier: 'no',
    },
    android: {
        package: IS_DEV ? 'com.shameel123.WashupMobileApp.dev' : 'com.shameel123.WashupMobileApp',
    },
};