import React from "react";
import { Text, View, StyleSheet } from "react-native";
import {
  responsiveFontSize,
  responsiveHeight
} from "react-native-responsive-dimensions";
import { ServicesDefault } from "./Services/ServicesDefault";

import { renderServices } from "../utility";

// export const Services = props => (
//   <View style={styles.section}>
//     <Text style={styles.sectionText}>Services</Text>
//     {renderServices(props.activeLibrary)}
//     <ServicesDefault />
//   </View>
// );

const styles = StyleSheet.create({
  sectionText: {
    color: "#222222",
    fontWeight: "bold",
    fontSize: responsiveFontSize(2),
    marginBottom: responsiveHeight(1.5),
    fontFamily: "Roboto"
  },
  section: {
    marginVertical: responsiveHeight(2)
  }
});
