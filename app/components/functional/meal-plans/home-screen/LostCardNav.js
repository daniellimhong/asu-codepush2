import React, { PureComponent } from "react";
import { View, Text, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome5";
import Analytics from "../../analytics";
import { tracker } from "../../../achievement/google-analytics";
import PressedWrapper from "../PressedWrapper";

const MoreIcon = <Icon name="chevron-right" size={responsiveFontSize(1.6)} />;
const MAROON = "rgb(138, 4, 60)";

export default class LostCardNav extends PureComponent {
  pressHandler = () => {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "dining-and-meals",
      "starting-section": null, 
      "target":"Lost or Stolen Sun Card",
      "resulting-screen": "dining-services-lost-card",
      "resulting-section": null,
    });
    tracker.trackEvent("Click", `LostCardBox`);
    this.props.navigation.navigate("LostCard");
  };
  render() {
    return (
      <PressedWrapper style={styles.container} onPress={this.pressHandler}>
        <View>
          <Text style={styles.headerText}>Deactivate or Reactivate</Text>
          <Text style={styles.normalText}>A lost or found Sun Card</Text>
          <Analytics ref="analytics" />
        </View>
        <Text>{MoreIcon}</Text>
      </PressedWrapper>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: responsiveWidth(4),
    padding: responsiveWidth(4),
    backgroundColor: "white",
    shadowColor: "grey",
    elevation: 5,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    borderRadius: 5
  },
  headerText: {
    color: MAROON,
    fontSize: responsiveFontSize(1.9),
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  normalText: {
    color: "black",
    fontSize: responsiveFontSize(1.6)
  }
});
