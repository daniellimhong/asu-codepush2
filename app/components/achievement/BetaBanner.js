import React from "react";
import { View, Text, StyleSheet } from "react-native";

import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

/**
 * Small Banner to be displayed wherever we need "Beta" to mark those
 * areas of the app.
 */
export class BetaBanner extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.banner}>
        <Text style={styles.bannerText}>BETA</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  banner: {
    zIndex: 100,
    transform: [{ rotate: "45deg" }],
    height: responsiveHeight(6),
    width: responsiveWidth(100),
    backgroundColor: "#1A9FE5",
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    bottom: responsiveHeight(2),
    left: -responsiveWidth(41)
  },
  bannerText: {
    letterSpacing: 2,
    fontWeight: "bold",
    fontSize: responsiveFontSize(1.8),
    color: "white",
    textAlign: "center",
    fontFamily: "Roboto"
  }
});
