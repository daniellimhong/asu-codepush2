import React, { PureComponent } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PressedWrapper from "../../../presentational/PressedWrapper";
import Analytics from "./../../../functional/analytics";
import { tracker } from "../../google-analytics.js";

export default class GameDayNav extends PureComponent {
  pressHandler = () => {
    this.refs.analytics.sendData({
      "eventtime": new Date().getTime(),
      "action-type": "click",
      "starting-screen": "athletics",
      "starting-section": "gameday-companion", 
      "target": "GameDay Companion",
      "resulting-screen": "gameday-companion", 
      "resulting-section": null,
    });
    tracker.trackEvent("Click", `GameDayCompanion`);
    this.props.navigation.navigate("GameDayCompanion");
  };
  render() {
    return (
      <PressedWrapper onPress={this.pressHandler}>
        <Analytics ref="analytics" />
        <ImageBackground
          style={styles.container}
          source={require("../../assets/game_day_companion.jpg")}
          resizeMode="stretch"
        >
          <Text style={styles.vsText}>Click Here</Text>
        </ImageBackground>
      </PressedWrapper>
    );
  }
}

GameDayNav.propTypes = {
  navigation: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    margin: responsiveWidth(4),
    padding: responsiveHeight(1),
    marginBottom: 0,
    height: responsiveHeight(15)
  },
  vsText: {
    color: "rgb(255, 214, 0)",
    position: "absolute",
    bottom: responsiveHeight(0.5),
    fontWeight: "bold",
    fontFamily: 'Roboto',
    fontSize: responsiveFontSize(2),
    paddingVertical: responsiveHeight(0.5),
    paddingRight: responsiveWidth(3)
  }
});
