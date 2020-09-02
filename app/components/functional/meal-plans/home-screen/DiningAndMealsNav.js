import React, { PureComponent } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Analytics from "../../analytics";
import { tracker } from "../../../achievement/google-analytics";
import PressedWrapper from "../PressedWrapper";

export default class DiningAndMealsNav extends PureComponent {
  leftPressHandler = () => {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "dining-and-meals",
      "starting-section": null, 
      "target":"Dining Venues",
      "resulting-screen": "dining-venues",
      "resulting-section": null,
    });
    tracker.trackEvent("Click", `DiningVenuesBox`);
    this.props.navigation.navigate("DiningVenues", {
      location: this.props.location,
      venues: this.props.venues,
      foodPreferences: this.props.foodPreferences,
      addPreference: this.props.addPreference,
      addFavorite: this.props.addFavorite
    });
  };

  rightPressHandler = () => {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "dining-and-meals",
      "starting-section": null, 
      "target":"Meal Plans",
      "resulting-screen": "meal-plans",
      "resulting-section": null,
    });
    tracker.trackEvent("Click", `MealPlansBox`);
    this.props.navigation.navigate("InAppLink", {
      title: "Meal Plans",
      url: "https://sundevildining.asu.edu/meal-plans"
    });
  };
  render() {
    // console.log("DiningAndMealsNav props", this.props);
    let leftBox;
    if (this.props.venueDataError) {
      leftBox = (
        <View style={styles.box} onPress={this.leftPressHandler}>
          <View style={styles.bottomBoxError}>
            <Text style={styles.boldText}>Dining Venues Error</Text>
            <Text style={styles.normalText}>
              Sorry, but there was an error loading this section.
            </Text>
          </View>
        </View>
      );
    } else if (this.props.venues && this.props.venues.length > 0) {
      leftBox = (
        <PressedWrapper style={styles.box} onPress={this.leftPressHandler}>
          <Image
            style={styles.topBox}
            source={require("../../assets/dining-hero.png")}
            resizeMode="stretch"
          />
          <View style={styles.bottomBox}>
            <Text style={styles.boldText}>Dining Venues</Text>
            <Text style={styles.normalText}>
              View dining locations and menus across campus
            </Text>
          </View>
        </PressedWrapper>
      );
    } else {
      return null;
    }

    const rightBox = (
      <PressedWrapper style={styles.box} onPress={this.rightPressHandler}>
        <Analytics ref="analytics" />
        <Image
          style={styles.topBox}
          source={require("../../assets/meals-hero.png")}
          resizeMode="stretch"
        />
        <View style={styles.bottomBox}>
          <Text style={styles.boldText}>Meal Plans</Text>
          <Text style={styles.normalText}>
            Choose a meal plan that is perfect for you
          </Text>
        </View>
      </PressedWrapper>
    );

    return (
      <View style={styles.container}>
        {leftBox}
        {rightBox}
      </View>
    );
  }
}

DiningAndMealsNav.propTypes = {
  navigation: PropTypes.object.isRequired,
  location: PropTypes.object,
  venues: PropTypes.array,
  foodPreferences: PropTypes.object,
  addFavorite: PropTypes.func,
  addPreference: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: responsiveWidth(2),
    width: responsiveWidth(96),
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "grey",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.7,
    elevation: 10
  },
  box: {
    flexDirection: "column",
    width: responsiveWidth(44),
    height: responsiveWidth(44),
    alignItems: "center",
    borderRadius: 5
  },
  topBox: {
    flex: 2,
    width: "100%",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3
  },
  bottomBox: {
    flex: 1.4,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    width: "100%",
    paddingHorizontal: responsiveWidth(1.5),
    paddingVertical: responsiveWidth(2),
    justifyContent: "space-around",
    alignItems: "center",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3
  },
  bottomBoxError: {
    flex: 1.4,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    width: "100%",
    paddingHorizontal: responsiveWidth(1.5),
    paddingVertical: responsiveWidth(12),
    justifyContent: "space-around",
    alignItems: "center",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3
  },
  boldText: {
    fontSize: responsiveFontSize(1.7),
    color: "white",
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  normalText: {
    fontSize: responsiveFontSize(1.3),
    color: "white",
    fontWeight: "500",
    fontFamily: 'Roboto',
    textAlign: "center"
  }
});
