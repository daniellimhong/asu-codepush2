import React, { PureComponent } from "react";
import { View, Text, StyleSheet, ImageBackground, Image } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome";

const phoneIcon = <Icon name="phone" />;
const mailIcon = <Icon name="envelope" />;

export default class MealPlansBuyHeader extends PureComponent {
  render() {
    return (
      <ImageBackground
        source={require("../../assets/dining/header.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.bannerBox}>
          <View style={styles.bannerBoxTop}>
            <Text style={styles.bannerBoxTopText}>Barret Dining Center</Text>
            <Text style={styles.bannerBoxTopText}>Student Plans</Text>
          </View>
          <View style={styles.bannerBoxBottom}>
            <Text style={styles.normalText}>
              {phoneIcon} 580-727-DINE(3463)
            </Text>
            <Text style={styles.normalText}>
              {mailIcon} SunDevilDining@asu.edu
            </Text>
          </View>
        </View>
      </ImageBackground>
    );
  }
}

MealPlansBuyHeader.propTypes = {};

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
  bannerBoxTop: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    width: "100%"
  },
  bannerBoxTopText: {
    fontSize: responsiveFontSize(2.1),
    fontWeight: "700",
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
