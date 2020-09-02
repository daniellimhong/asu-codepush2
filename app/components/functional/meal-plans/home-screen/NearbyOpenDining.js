import React, { PureComponent } from "react";
import { View, Text, StyleSheet } from "react-native";
import moment from "moment";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PressedWrapper from "../PressedWrapper";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  createServingString,
  sortNearestRestaurants,
  checkForFavorites
} from "./utility";

const PINK = "rgb(173, 5, 66)";
const TITLE_FONT_SIZE = responsiveFontSize(1.8);
const heartIcon = <Icon name="heart" color={PINK} size={TITLE_FONT_SIZE} />;

export default class NearbyOpenDining extends PureComponent {
  pressHandler = data => {
    // console.log("myData ", data);
    const propsToPass = {
      venueData: data,
      foodPreferences: this.props.foodPreferences,
      addPreference: this.props.addPreference,
      addFavorite: this.props.addFavorite
    };
    this.props.navigation.navigate("DiningVenue", propsToPass);
  };

  _renderData = arrayToRender => {
    let renderedArray = arrayToRender.map((v, i) => {
      // console.log("_renderData v", v);
      const showBorder = i < arrayToRender.length - 1;
      let currServe = null;
      if (
        v &&
        v.currentlyServing &&
        v.currentlyServing.MealPeriod &&
        v.currentlyServing.MealPeriod !== "Currently Closed"
      ) {
        currServe = `Currently Serving ${v.currentlyServing.MealPeriod}`;
      }
      return (
        <View
          style={[styles.box, { borderBottomWidth: showBorder ? 1 : 0 }]}
          key={i}
        >
          <View style={styles.leftBox}>
            <Text style={styles.boldText}>{v.name}</Text>
            <Text style={styles.normalText}>{currServe}</Text>
            <Text style={styles.normalText}>
              {createServingString(v.currentlyServing)}
            </Text>
          </View>
          <PressedWrapper
            style={styles.rightBox}
            onPress={() => this.pressHandler(v)}
          >
            <View style={styles.button}>
              <Text style={styles.buttonText}>{"LOCATION & MENU"}</Text>
            </View>
          </PressedWrapper>
        </View>
      );
    });
    // console.log("renderedArray", renderedArray);
    return renderedArray;
  };

  render() {
    if (this.props.nearbyItems) {
      const title = this.props.nearbyFavorites ? (
        <Text style={styles.titleText}>
          {heartIcon} Favorite Dining Locations
        </Text>
      ) : (
        <Text style={styles.titleText}>Nearby Open Dining</Text>
      );
      return (
        <View style={styles.container}>
          {title}
          {this._renderData(this.props.nearbyItems)}
        </View>
      );
    } else {
      return null;
    }
  }
}

NearbyOpenDining.propTypes = {
  navigation: PropTypes.object.isRequired,
  venues: PropTypes.array,
  foodPreferences: PropTypes.object,
  addFavorite: PropTypes.func,
  addPreference: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    margin: responsiveWidth(4),
    marginBottom: 0,
    width: responsiveWidth(92),
    padding: responsiveWidth(4),
    paddingBottom: 0,
    justifyContent: "space-around",
    backgroundColor: "white",
    borderRadius: 5,
    shadowColor: "grey",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.7,
    elevation: 10
  },
  box: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: responsiveWidth(84),
    paddingVertical: responsiveHeight(2),
    borderBottomColor: "rgb(181, 181, 181)"
  },
  leftBox: { flex: 1 },
  rightBox: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    height: "100%"
  },
  titleText: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: "bold",
    color: "black",
    fontFamily: "Roboto"
  },
  boldText: {
    fontSize: responsiveFontSize(1.6),
    color: "black",
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  normalText: {
    fontSize: responsiveFontSize(1.6),
    color: "black",
    fontWeight: "400",
    fontFamily: 'Roboto',
  },
  button: {
    backgroundColor: "rgb(79, 147, 2)",
    paddingVertical: responsiveWidth(1),
    paddingHorizontal: responsiveWidth(3),
    borderRadius: 3
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: responsiveFontSize(1.3),
    fontFamily: "Roboto"
  }
});
