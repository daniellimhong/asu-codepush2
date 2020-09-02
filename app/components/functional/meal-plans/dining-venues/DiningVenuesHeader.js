import React, { PureComponent } from "react";
import { View, Text, StyleSheet, ImageBackground, Image } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

export default class DiningVenuesHeader extends PureComponent {
  render() {
    return (
      <ImageBackground
        source={require("../../assets/fruit-hero.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.bannerBox}>
          <View style={{ flexDirection: "row", width: "100%" }}>
            <View
              style={{
                justifyContent: "flex-start",
                alignItems: "center",
                paddingHorizontal: responsiveWidth(6)
              }}
            >
              <Image
                source={require("../../assets/spoon-icon.png")}
                style={{
                  width: responsiveWidth(10),
                  height: responsiveWidth(8)
                }}
                resizeMode="stretch"
              />
            </View>
            <View style={styles.bannerBoxRight}>
              <Text style={styles.bannerBoxRightText}>
                View dining locations and menus across campus
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    );
  }
}

DiningVenuesHeader.propTypes = {};

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
    flexDirection: "column",
    justifyContent: "space-around",
    paddingVertical: responsiveHeight(1.5),
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
  },
  bannerBoxBottom: {
    width: "100%",
    paddingTop: responsiveHeight(1),
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: responsiveWidth(4)
  },
  normalText: {
    color: "white",
    fontSize: responsiveFontSize(1.35),
    fontWeight: "bold",
    fontFamily: "Roboto"
  }
});
