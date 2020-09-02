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

import { Api, Auth, User } from "../../../services";

import PropTypes from "prop-types";
import BackgroundGeolocation from "react-native-background-geolocation-android";
import DeviceInfo from "react-native-device-info";

var username = "";

const baseUrl = "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod";
const msgCtrUrl = baseUrl + "/msgctr";
const tokenUrl = baseUrl + "/tokenpref";
const geoUrl = baseUrl + "/geofence";

const campusWideGeofences = [];

const configs = { service: "execute-api", region: "us-east-1" };

export class Geolocation extends React.Component {
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

    function addGeofences(resp) {
      var payload = {
        operation: "getGeofences",
        uuid: DeviceInfo.getUniqueID()
      };

      fetch(
        "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/geofence",
        {
          method: "POST",
          body: JSON.stringify(payload)
        }
      ).then( data => data.json())
       .then(resp => {
        var locs = resp;

        for (var i = 0; i < locs.length; ++i) {
          var basicGeofenceConfigs = {
            identifier: locs[i].id.toString(),
            radius: locs[i].radius ? locs[i].radius : 75,
            latitude: parseFloat(locs[i].lat),
            longitude: parseFloat(locs[i].lon),
            notifyOnEntry: true,
            notifyOnExit: true,
            notifyOnDwell: false,
            loiteringDelay: 30000, // 30 seconds
            extras: {
              // Optional arbitrary meta-data
              dUUID: DeviceInfo.getUniqueID(),
              identifier: locs[i].id.toString(),
              campus: locs[i].campus
            }
          };

          if( i < 5 ) {
            console.log(basicGeofenceConfigs);
          }
          BackgroundGeolocation.addGeofence(basicGeofenceConfigs).then((success) => {
            console.log("[addGeofence] success");
          }).catch((error) => {
            console.log("[addGeofence] FAILURE: ", error);
          });
        }
      });
      BackgroundGeolocation.startGeofences(function(state) {
        console.log(
          "- Geofence-only monitoring started",
          state.trackingMode
        );
      });
    }

    BackgroundGeolocation.on("geofence", function(geofence) {
      var location = geofence.location;
      var identifier = geofence.identifier;
      var action = geofence.action;
      console.log("A geofence has been crossed: ", identifier);
      console.log("GEO ACTION: ", action);
    });

    BackgroundGeolocation.on("providerchange", function(provider) {
      console.log(
        "- Provider Change: ",
        provider,
        BackgroundGeolocation.AUTHORIZATION_STATUS_DENIED
      );
      // console.log("  enabled: ", provider.enabled);
      // console.log("  gps: ", provider.gps);
      // console.log("  network: ", provider.network);
      // console.log("  status: ", provider.status);

      switch (provider.status) {
        case BackgroundGeolocation.AUTHORIZATION_STATUS_DENIED:
          // Android & iOS
          BackgroundGeolocation.removeGeofences();  // <-- Calling stop will prevent Dialog showing
          BackgroundGeolocation.stop();

          break;
        case BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS:
          // Android & iOS
          addGeofences();
          break;
        case BackgroundGeolocation.AUTHORIZATION_STATUS_WHEN_IN_USE:
          // Android & iOS
          addGeofences();
          break;
      }
    });

    var geoConfigs = {
      desiredAccuracy: 10,
      distanceFilter: 0,
      stopTimeout: 1,
      debug: false,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      locationAuthorizationRequest: "Any",
      stopOnTerminate: true, // <-- Allow the background-service to continue tracking when user closes the app.
      startOnBoot: false, // <-- Auto start tracking when device is powered-up.
      url:
        "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/geofence",
      maxDaysToPersist: 365,
      httpTimeout: 60000,
      params: {
        // <-- Optional HTTP params
        dUUID: DeviceInfo.getUniqueID(),
        operation: "writeLocation",
        platform: Platform.OS
      }
    };
    // BackgroundGeolocation.removeListeners();
    BackgroundGeolocation.configure(geoConfigs, state => {
      console.log(
        "- BackgroundGeolocation is configured and ready: ",
        state.enabled
      );
      // }
      // }, function(error) {
      //   console.warn("Failed to fetch geofences from server");
      // });

      // BackgroundGeolocation.startGeofences(function(state) {
      //   console.log('- Geofence-only monitoring started', state.trackingMode);
      // });
    });
  }

  componentDidMount() {
    console.log("component mounted");
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
