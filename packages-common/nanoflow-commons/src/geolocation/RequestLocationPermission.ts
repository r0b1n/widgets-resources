// This file was generated by Mendix Studio Pro.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the code between BEGIN USER CODE and END USER CODE
// Other code you write will be lost the next time you deploy the project.

import ReactNative from "react-native";

/**
 * On the native platform a request for permission should be made before the `GetCurrentLocation` action would work.
 * @returns {Promise.<boolean>}
 */
export async function RequestLocationPermission(): Promise<boolean> {
    // BEGIN USER CODE

    if (navigator && navigator.product === "ReactNative") {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const RN: typeof ReactNative = require("react-native");

        if (RN.Platform.OS === "android") {
            const locationPermission = RN.PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;

            return RN.PermissionsAndroid.check(locationPermission).then(hasPermission =>
                hasPermission
                    ? true
                    : RN.PermissionsAndroid.request(locationPermission).then(
                          status => status === RN.PermissionsAndroid.RESULTS.GRANTED
                      )
            );
            // @ts-ignore
        } else if (navigator.geolocation && navigator.geolocation.requestAuthorization) {
            try {
                // @ts-ignore
                navigator.geolocation.requestAuthorization();
                return Promise.resolve(true);
            } catch (error) {
                return Promise.reject(error);
            }
        }
    }

    return Promise.reject(new Error("No permission request for location is required for web/hybrid platform"));

    // END USER CODE
}
