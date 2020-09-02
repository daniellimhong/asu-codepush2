import React from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { Divider } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  responsiveWidth,
  responsiveFontSize,
  responsiveHeight
} from "react-native-responsive-dimensions";

import { libraryAddress } from "../utility";

const parseLibNames = libName => {
  switch (libName) {
    case "Design and the Arts Library":
      return "College of Design North";
    case "Downtown Campus Library":
      return "University Center (Downtown)";
    case "Hayden Library":
      return "Hayden Library";
    case "Music Library":
      return "Music Bldg.";
    case "Polytechnic campus Library":
      return "Academic Center";
    case "Noble Library":
      return "Noble Science Library";
    case "Thunderbird Library (IBIC)":
      return "Arizona Center";
    case "Fletcher Library":
      return "Fletcher Library";
    default:
      console.log("libName did not match any libraries in the database...");
      return null;
  }
};

const onPressHandler = props => {
  let formattedItem = {
    map_coords: {
      lat: props.activeLibraryName.lat,
      lng: props.activeLibraryName.lon
    }
  };
  props.navigate("Maps", {
    locationName: parseLibNames(props.activeLibraryName),
    previousScreen:props.previousScreen,
    previousSection:props.previousSection,
    target:"NAVIGATE",
    data: parseLibNames(props.activeLibraryName),
    item: {
      data: {
        data: formattedItem
      }
    }
  });
};

export const Address = props => (
  <React.Fragment>
    <View style={{ marginVertical: responsiveHeight(2) }}>
      <Text style={styles.sectionText}>Address</Text>
      {libraryAddress(props.contact)}
      <TouchableOpacity
        onPress={() => onPressHandler(props)}
        style={styles.navigateButton}
        accessibilityLabel="Navigate here"
        accessibilityRole="button"
      >
        <Icon
          name={"location-arrow"}
          size={responsiveFontSize(2)}
          color="#fff"
          style={{ marginRight: responsiveWidth(1) }}
        />
        <Text style={styles.navigateText}>Navigate</Text>
      </TouchableOpacity>
    </View>
    <Divider style={{ backgroundColor: "#D5D5D5" }} />
  </React.Fragment>
);

const styles = StyleSheet.create({
  sectionText: {
    color: "#222222",
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(2),
    marginBottom: responsiveHeight(1.5)
  },
  navigateButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: responsiveWidth(1.5),
    borderRadius: 50,
    backgroundColor: "#2A2B30",
    width: responsiveWidth(30)
  },
  navigateText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "Roboto"
  }
});
