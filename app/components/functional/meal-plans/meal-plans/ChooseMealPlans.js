import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView
} from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome";
import ChooseMealPlansHeader from "./ChooseMealPlansHeader";
import MaroonAndGoldBox from "../MaroonAndGoldBox";
import Campuses from "../Campuses";

const phoneIcon = <Icon name="phone" />;
const mailIcon = <Icon name="envelope" />;

export default class ChooseMealPlans extends PureComponent {
  render() {
    return (
      <ScrollView style={styles.container}>
        <ChooseMealPlansHeader />
        <MaroonAndGoldBox navigation={this.props.navigation} />
        <Campuses navigation={this.props.navigation} which="mealPlans" />
      </ScrollView>
    );
  }
}

ChooseMealPlans.propTypes = {
  navigation: PropTypes.object.isRequired,
  location: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgb(227, 226, 226)",
    height: "100%"
  }
});
