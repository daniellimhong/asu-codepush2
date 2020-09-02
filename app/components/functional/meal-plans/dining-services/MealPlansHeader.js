import React, { PureComponent } from "react";
import { View, Text, StyleSheet, ImageBackground, Image } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

export default class MealPlansHeader extends PureComponent {
  render() {
    return (
      <ImageBackground
        source={require("../../assets/dining/header.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.bannerBox}>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "center"
            }}
          >
            <Image
              source={require("../../assets/dining/dining-service-icon.png")}
              style={{
                width: responsiveWidth(10),
                height: responsiveWidth(8)
              }}
              resizeMode="stretch"
            />
          </View>
          <View style={styles.bannerBoxRight}>
            <Text style={styles.bannerBoxRightText}>
              View your meal account balances or activate/deactivate your Sun
              Card
            </Text>
          </View>
        </View>
      </ImageBackground>
    );
  }
}

MealPlansHeader.propTypes = {};

const styles = StyleSheet.create({
  container: {
    width: responsiveWidth(100),
    height: responsiveWidth(41),
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "blue"
  },
  bannerBox: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: responsiveWidth(4),
    backgroundColor: "rgba(0, 0, 0, 0.65)"
  },
  bannerBoxRight: {
    flex: 3,
    justifyContent: "center",
    justifyContent: "center"
  },
  bannerBoxRightText: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: "500",
    fontFamily: 'Roboto',
    color: "white"
  }
});
