import React from "react";
import {
  View,
  Image,
  Dimensions,
  Keyboard,
  Text,
  AsyncStorage,
  TextInput,
  Button,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  Alert,
  Platform
} from "react-native";

import { Api, Auth, User } from "../../../../services";

import PropTypes from "prop-types";
import BackgroundGeolocation from "react-native-background-geolocation-android";
import BackgroundFetch from "react-native-background-fetch";
import DeviceInfo from "react-native-device-info";

const baseUrl = "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod";
const msgCtrUrl = baseUrl + "/msgctr";
const tokenUrl = baseUrl + "/tokenpref";
const geoUrl = baseUrl + "/geofence";

const configs = { service: "execute-api", region: "us-east-1" };

var username = "";

export class Heartbeat extends React.Component {
  static navigationOptions = ({ navigation, screenProps }) => ({
    title: "Geolocation"
  });

  constructor(props) {
    super(props);

    username = props;
    this.state = {
      longitude: null,
      error: null
    };

    // BackgroundGeolocation.on('providerchange', function(provider) {
    //   console.log('- Provider Change: ', provider);
    //   console.log('  enabled: ', provider.enabled);
    //   console.log('  gps: ', provider.gps);
    //   console.log('  network: ', provider.network);
    //   console.log('  status: ', provider.status);
    //   BackgroundGeolocation.stop();
    //
    //   switch(provider.status) {
    //     case BackgroundGeolocation.AUTHORIZATION_STATUS_DENIED:
    //       // Android & iOS
    //       BackgroundGeolocation.removeGeofences();  // <-- Calling stop will prevent Dialog showing
    //
    //       break;
    //     case BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS:
    //       // Android & iOS
    //       BackgroundGeolocation.startGeofences(function(state) {
    //         console.log('- Geofence-only monitoring started', state.trackingMode);
    //       });
    //       break;
    //     case BackgroundGeolocation.AUTHORIZATION_STATUS_WHEN_IN_USE:
    //       // Android & iOS
    //       BackgroundGeolocation.startGeofences(function(state) {
    //         console.log('- Geofence-only monitoring started', state.trackingMode);
    //       });
    //       break;
    //   }
    // });

    BackgroundFetch.configure(
      {
        minimumFetchInterval: 1, // <-- minutes (15 is minimum allowed)
        stopOnTerminate: false, // <-- Android-only,
        startOnBoot: true // <-- Android-only
      },
      async () => {
        // console.log(
        //   "----------------------------- BackgroundFetch HeadlessTask start"
        // );
        let location = await BackgroundGeolocation.getCurrentPosition();
        // console.log(
        //   "----------------------------- BackgroundFetch current position: ",
        //   location
        // );
        try {
          var payload = {
            operation: "writeLocation",
            platform: Platform.OS,
            geofence: "passive",
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            dUUID: DeviceInfo.getUniqueID(),
            from: "heartbeat"
          };

          fetch(geoUrl, {
            method: "POST",
            body: JSON.stringify(payload)
          });
        } catch (err) {
          console.log("Error:",err);
        }
        BackgroundFetch.finish();
      },
      error => {
        console.log("[js] RNBackgroundFetch failed to start");
      }
    );
  }

  render() {
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1
  },
  map: {
    height: 100,
    width: 100
  }
});
