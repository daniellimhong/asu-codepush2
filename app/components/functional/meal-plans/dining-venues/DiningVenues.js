import React, { PureComponent } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PropTypes from "prop-types";
import Campuses from "../Campuses";
import DiningVenuesHeader from "./DiningVenuesHeader";

export default class DiningVenues extends PureComponent {
  render() {
    const {
      venues,
      foodPreferences,
      addPreference,
      addFavorite
    } = this.props.navigation.state.params;
    return (
      <ScrollView style={styles.container}>
        <DiningVenuesHeader />
        <Campuses
          navigation={this.props.navigation}
          which="venues"
          venues={venues}
          foodPreferences={foodPreferences}
          addPreference={addPreference}
          addFavorite={addFavorite}
        />
      </ScrollView>
    );
  }
}

DiningVenues.propTypes = {
  navigation: PropTypes.object.isRequired,
  venues: PropTypes.array,
  foodPreferences: PropTypes.object,
  addPreference: PropTypes.func,
  addFavorite: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
