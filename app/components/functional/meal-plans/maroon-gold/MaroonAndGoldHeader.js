import React, { PureComponent } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

export default class MaroonAndGoldHeader extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <Image
          style={styles.leftImage}
          source={require("../../assets/mg-logo.png")}
          resizeMode="stretch"
        />
        <View style={styles.rightText}>
          <Text style={styles.boldText}>Maroon and Gold Dollars</Text>
          <Text style={styles.normalText}>
            Add M&G dollars that can be used at any Sun Devil Dining location
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "rgb(162, 0, 68)",
    padding: responsiveWidth(1)
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
    paddingHorizontal: responsiveWidth(4),
    justifyContent: "center",
    alignItems: "flex-start"
  },
  boldText: {
    fontSize: responsiveFontSize(2),
    marginBottom: responsiveHeight(0.7),
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
