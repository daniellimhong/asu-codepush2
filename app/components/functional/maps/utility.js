import { Platform, PermissionsAndroid } from "react-native";
import Permissions from "react-native-permissions";
export function checkLocationPermission() {
  return new Promise(function(resolve, reject) {
    if (Platform.OS == "ios") {
      Permissions.check("location").then(response => {
        if (response === "authorized") {
          resolve(true);
        } else {
          reject("No location permission");
        }
      });
    } else {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ).then(granted => {
        if (granted) {
          resolve(true);
        } else {
          reject("No location permission");
        }
      });
    }
  });
}

export function getLocation() {
  return new Promise(function(resolve, reject) {
    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      error => {
        reject("Could not get location");
      }
    );
  });
}
