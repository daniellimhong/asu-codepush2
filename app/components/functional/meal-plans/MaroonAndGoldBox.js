import React, { PureComponent } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { tracker } from "../../achievement/google-analytics";
import Analytics from "../analytics";
import PressedWrapper from "./PressedWrapper";

const MAROON = "rgb(138, 4, 60)";

export default class MaroonAndGoldBox extends PureComponent {
  pressHandler = () => {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "dining-and-meals",
      "starting-section": null, 
      "target":"Maroon and Gold Dollars",
      "resulting-screen": "in-app-browser",
      "resulting-section": "maroon-and-gold-dollars",
    });
    tracker.trackEvent("Click", `Maroon&GoldBox`);
    this.props.navigation.navigate("InAppLink", {
      title: "Maroon and Gold Dollars",
      url: "https://sundevildining.asu.edu/meal-plans/maroon-and-gold"
    });
  };

  render() {
    return (
      <PressedWrapper
        style={styles.container}
        onPress={() => this.pressHandler()}
      >
        <Analytics ref="analytics" />
        <Image
          style={styles.leftImage}
          source={require("../assets/mg-logo.png")}
          resizeMode="stretch"
        />
        <View style={styles.rightText}>
          <Text style={styles.boldText}>Maroon and Gold Dollars</Text>
          <Text style={styles.normalText}>View plans and add M&G dollars</Text>
        </View>
      </PressedWrapper>
    );
  }
}

MaroonAndGoldBox.propTypes = {
  navigation: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  container: {
    margin: responsiveWidth(4),
    flexDirection: "row",
    width: responsiveWidth(92),
    backgroundColor: MAROON,
    borderRadius: 2
  },
  leftImage: {
    flex: 0.8,
    height: responsiveHeight(10),
    marginVertical: responsiveWidth(2),
    marginLeft: responsiveWidth(6),
    justifyContent: "center",
    alignItems: "center"
  },
  rightText: {
    flex: 3,
    padding: responsiveWidth(1),
    justifyContent: "center",
    alignItems: "center"
  },
  boldText: {
    fontSize: responsiveFontSize(2),
    color: "white",
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  normalText: {
    fontSize: responsiveFontSize(1.5),
    color: "white",
    fontWeight: "500",
    fontFamily: 'Roboto',
  }
});
