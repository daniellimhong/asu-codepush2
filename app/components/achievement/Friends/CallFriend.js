import React from "react";
import { View, TouchableOpacity, Linking, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { makeNumber, checkIfEmployee } from "./utility";

export class CallFriend extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      employee: checkIfEmployee(this.props.affiliations)
    };
  }

  pressHandler = () => {
    this.refs.analytics.sendData({
      "action-type": "view",
      "target": "Call",
      "starting-screen": this.props.previousScreen?this.props.previousScreen:null,
      "starting-section": this.props.previousSection?this.props.previousSection:null,
      "resulting-screen": "call-friend", 
      "resulting-section": null,
      "target-id": this.props.phone.toString(),
      "action-metadata":{
        "target-id": this.props.phone.toString(),
      }
    });
    tracker.trackEvent("Click", "CallFriend");
    Linking.openURL(`tel:${makeNumber(this.props.phone)}`);
  };

  render() {
    if (this.props.phone && this.state.employee) {
      return (
        <TouchableOpacity
          onPress={this.pressHandler}
          accessibilityLabel="Call friend"
          accessibilityRole="button"
        >
          <Analytics ref="analytics" />
          <View style={styles.circle}>
            <Icon
              name={"phone"}
              size={responsiveFontSize(2.6)}
              color="#B1B1B1"
              style={{ backgroundColor: "transparent" }}
            />
          </View>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  circle: {
    height: responsiveWidth(10),
    width: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    borderColor: "#B1B1B1",
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center"
  }
});
