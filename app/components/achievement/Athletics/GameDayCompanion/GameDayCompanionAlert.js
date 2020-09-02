import React, { PureComponent } from "react";
import { View, Text, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";

export default class GameDayCompanionAlert extends PureComponent {
  render() {
    if (this.props.lastPlayText) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>{this.props.lastPlayText}</Text>
        </View>
      );
    } else {
      return null;
    }
  }
}

GameDayCompanionAlert.propTypes = {
  lastPlayText: PropTypes.string
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "rgb(255, 198, 0)",
    padding: responsiveWidth(1),
    paddingVertical: responsiveHeight(1.2),
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    color: "black",
    fontSize: responsiveFontSize(1.7),
    fontWeight: "bold",
    fontFamily: 'Roboto'
  }
});
