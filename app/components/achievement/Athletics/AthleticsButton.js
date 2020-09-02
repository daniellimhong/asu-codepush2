import React, { PureComponent } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Analytics from "./../../functional/analytics";
import { tracker } from "../google-analytics.js";
import PressedWrapper from "../../presentational/PressedWrapper";

export default class AthleticsButton extends PureComponent {
  pressHandler = () => {
    tracker.trackEvent("Click", `Athletics${this.props.text}`);
    this.props.onPress();
  };
  render() {
    if (!this.props.isWhite) {
      return (
        <PressedWrapper style={styles.button} onPress={this.props.onPress}>
          <Analytics ref="analytics" />
          <Text style={styles.buttonText}>{this.props.text}</Text>
        </PressedWrapper>
      );
    } else {
      return (
        <PressedWrapper style={styles.buttonWhite} onPress={this.props.onPress}>
          <Analytics ref="analytics" />
          <Text style={styles.buttonTextWhite}>{this.props.text}</Text>
        </PressedWrapper>
      );
    }
  }
}

AthleticsButton.propTypes = {
  onPress: PropTypes.func,
  text: PropTypes.string.isRequired,
  isWhite: PropTypes.bool
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#941E41",
    paddingHorizontal: responsiveWidth(7),
    paddingVertical: responsiveHeight(1.4),
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonWhite: {
    backgroundColor: "white",
    paddingHorizontal: responsiveWidth(7),
    paddingVertical: responsiveHeight(1.3),
    borderRadius: 30,
    borderColor: "grey",
    borderWidth: 1
  },
  buttonText: {
    color: "white",
    fontSize: responsiveFontSize(1.1),
    fontWeight: "800",
    fontFamily: 'Roboto',
  },
  buttonTextWhite: {
    color: "grey",
    fontSize: responsiveFontSize(1.1),
    fontWeight: "bold",
    fontFamily: 'Roboto'
  }
});
