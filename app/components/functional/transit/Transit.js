import React, { Component } from "react";
import { View, Text, StyleSheet, AsyncStorage } from "react-native";
import { WebView } from "react-native-webview";
import { HeaderQuick } from "../../achievement/Header/HeaderQuick";
import { checkLocationPermission, getLocation } from "./utility";
import Analytics from "../analytics";

const campus_centers = {
  Downtown: {
    latitude: "33.45332",
    longitude: "-112.07288",
  },
  Polytechnic: {
    latitude: "33.307013",
    longitude: "-111.676934",
  },
  Tempe: {
    latitude: "33.4242401",
    longitude: "-111.92805301",
  },
  Thunderbird: {
    latitude: "33.620986",
    longitude: "-112.180928",
  },
  West: {
    latitude: "33.607943",
    longitude: "-112.159807",
  },
};

const patchPostMessageFunction = function() {
  // var originalPostMessage = window.postMessage;
  // var patchedPostMessage = function(message, targetOrigin, transfer) {
  //   originalPostMessage(message, targetOrigin, transfer);
  // };
  // patchedPostMessage.toString = function() {
  //   return String(Object.hasOwnProperty).replace(
  //     "hasOwnProperty",
  //     "postMessage"
  //   );
  // };
  window.postMessage = function(data) {
    window.ReactNativeWebView.postMessage(data);
  };
};

const injectScript = "(" + String(patchPostMessageFunction) + ")();true";

export class Transit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: null,
      longitude: null,
    };
  }
  componentDidMount() {
    this.getCurrentLocation()
      .then((location) => {
        this.setState({
          ...location,
        });
      })
      .catch((e) => {
        console.log(e);
        this.setState({
          ...campus_centers.Tempe,
        });
      });

    this.refs.analytics.sendData({
      "action-type": "click",
      target: "Transit",
      "starting-screen": this.props.navigation.state.params.previousScreen
        ? this.props.navigation.state.params.previousScreen
        : null,
      "starting-section": this.props.navigation.state.params.previousSection
        ? this.props.navigation.state.params.previousSection
        : null,
      "resulting-screen": "transit",
      "resulting-section": null,
      "action-metadata": {
        "screen-type": "webview",
      },
    });
  }

  _onMessage(e) {
    try {
      let request = JSON.parse(e);
      if (request && request.process) {
        switch (request.process) {
          case "requestNavigation":
            this.getCurrentLocation()
              .then((userLocation) => {
                this.fulfillNavigationRequest(request, userLocation);
              })
              .catch((e) => {
                console.log(e);
                /**
                 * If failed, default to the Tempe campus
                 */
                this.fulfillNavigationRequest(request, campus_centers.Tempe);
              });
            break;
          case "log":
            console.log("Log request", request);
            break;
          default:
            console.log("Bad request type");
            break;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
  getCurrentLocation = () => {
    return new Promise(function(resolve, reject) {
      checkLocationPermission()
        .then((resp) => {
          getLocation()
            .then((location) => {
              resolve(location);
            })
            .catch((e) => {
              reject(e);
            });
        })
        .catch((e) => {
          console.log("Get current location failed", e);
          reject(e);
        });
    });
  };

  fulfillNavigationRequest(initialRequest, userLocation) {
    let payload = {
      process: "navigate",
      location: initialRequest.location,
      user: userLocation,
    };
    thisWebView.postMessage(JSON.stringify(payload));
  }

  render() {
    let { longitude, latitude } = this.state;
    if (longitude && latitude) {
      //const link = `http://dbt1nhrb7oiy8.cloudfront.net/?type=transit&client=mobile&startLongitude=${this.state.longitude}&startLatitude=${this.state.latitude}&key=pk.eyJ1IjoiYXN1bW9iaWxlIiwiYSI6ImNrNWUzc25yNTA2M3gzZXBnNDRvMmN4b2QifQ.ksMsUTkPiNMiRPAH5rq78w`;
      const link = 'https://arizonastate.ridesystems.net/'
      return (
        <View style={styles.container}>
          <HeaderQuick
            navigation={this.props.navigation}
            title={"ASU Shuttles"}
          />
          <Analytics ref="analytics" />
          <WebView
            style={{ flex: 1 }}
            ref={(webview) => {
              thisWebView = webview;
            }}
            source={{ uri: link }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            injectedJavaScript={injectScript}
            onMessage={(event) => this._onMessage(event.nativeEvent.data)}
          />
        </View>
      );
    } else {
      return (
        <View>
          <Analytics ref="analytics" />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
