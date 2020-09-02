import React, { PureComponent } from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome";

const locationIcon = <Icon name="map-marker" size={responsiveFontSize(1.6)} />;

export default class DiningVenueFilter extends PureComponent {
  state = {
    selected: "All"
  };

  filterSelected = which => {
    this.setState({ selected: which });
    this.props.filterPressHandler(which);
  };

  render() {
    const selectedBox = {
      backgroundColor: "black"
    };
    const selectedText = {
      color: "white",
      fontWeight: "bold",
      fontFamily: "Roboto"
    };

    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={() => this.filterSelected("All")}>
          <View
            style={[styles.box, this.state.selected === "All" && selectedBox]}
          >
            <Text
              style={[
                styles.myText,
                this.state.selected === "All" && selectedText
              ]}
            >
              All
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => this.filterSelected("Open Now")}
        >
          <View
            style={[
              styles.box,
              this.state.selected === "Open Now" && selectedBox
            ]}
          >
            <Text
              style={[
                styles.myText,
                this.state.selected === "Open Now" && selectedText
              ]}
            >
              Open Now
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => this.filterSelected("Near Me")}
        >
          <View
            style={[
              styles.box,
              this.state.selected === "Near Me" && selectedBox
            ]}
          >
            <Text
              style={[
                styles.myText,
                this.state.selected === "Near Me" && selectedText
              ]}
            >
              {locationIcon} Near Me
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

DiningVenueFilter.propTypes = {
  filterPressHandler: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: responsiveHeight(1)
  },
  box: {
    borderColor: "black",
    borderWidth: 1,
    paddingVertical: responsiveWidth(1),
    paddingHorizontal: responsiveWidth(2),
    margin: responsiveWidth(1.5)
  },
  myText: {
    fontSize: responsiveFontSize(1.6),
    color: "black"
  }
});
