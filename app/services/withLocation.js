import React, { PureComponent } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import Permissions from "react-native-permissions";

export const withLocation = WrappedComponent => {
  return class GetCurrentLocation extends PureComponent {
    state = {};

    componentDidMount() {
      this.getPerms();
    }

    getPerms = async () => {
      const toastMessage =
        "Please enable location for this app from device settings";
      if (Platform.OS == "ios") {
        Permissions.check("location").then(response => {
          if (response === "authorized") {
            navigator.geolocation.getCurrentPosition(
              position => {
                this.setState({
                  locationValid: true,
                  locationCoordinates: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                  }
                });
              },
              error => {
                this.setDefaultLocation();
              }
            );
          } else {
            this.setDefaultLocation();
          }
        });
      } else {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted) {
          navigator.geolocation.getCurrentPosition(
            position => {
              this.setState({
                locationValid: true,
                locationCoordinates: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                }
              });
            },
            error => {
              this.setDefaultLocation();
            }
          );
        } else {
          this.setDefaultLocation();
        }
      }
    };

    setDefaultLocation = () => {
      this.setState({
        locationValid: false,
        locationCoordinates: {
          latitude: "33.419181",
          longitude: "-111.917183"
        }
      });
    };

    render() {
      // console.log("this is location ", this.state.locationCoordinates);
      return (
        <WrappedComponent
          {...this.props}
          location={this.state.locationCoordinates}
        />
      );
    }
  };
};
