import React, { PureComponent } from "react";
import { View, Text, StyleSheet, ImageBackground, Image } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

export default class MyComponent extends PureComponent {
  render() {
    return (
      <ImageBackground
        source={require("../../assets/dining/header.png")}
        style={styles.imageContainer}
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
              source={require("../../assets/dining/mg-icon.png")}
              style={{
                width: responsiveWidth(10),
                height: responsiveWidth(8)
              }}
              resizeMode="stretch"
            />
          </View>
          <View style={styles.bannerBoxRight}>
            <Text style={styles.bannerBoxRightText}>
              Activate/deactivate your Sun Card
            </Text>
          </View>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  imageContainer: {
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
