import React, { PureComponent } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import moment from "moment";
import PropTypes from "prop-types";
import { Api } from "../../../../services/api";
import Analytics from "../../analytics";
import { tracker } from "../../../achievement/google-analytics";
import BuildAMeal from "./BuildAMeal";
import DiningVenueTop from "./DiningVenueTop";
import DiningVenuesModal from "./DiningVenuesModal";

export default class DiningVenue extends PureComponent {
  state = {
    modalVisible: false,
    which: "hours"
  };

  componentDidMount() {
    this.getMealsData();
    const { venueData } = this.props.navigation.state.params;
    // console.log("venueData ", venueData);
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "dining-venue-list",
      "starting-section": null, 
      "target": venueData.name,
      "resulting-screen": "dining-venue-details", 
      "resulting-section": null
    });
    tracker.trackEvent("View", `DiningVenue-${venueData.name}`);
  }

  getMealsData() {
    const { venueData } = this.props.navigation.state.params;
    this.context.getTokens().then(tokens => {
      if (tokens.username && tokens.username !== "guest") {
        const apiService = new Api(
          "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/",
          tokens
        );
        // console.log(
        //   "LocationId",
        //   venueData.LocationId,
        //   moment(new Date()).format("MM/DD/YYYY")
        // );
        // const currentDate = moment(new Date()).format("MM/DD/YYYY");
        const currentDate = "07/29/2019";
        apiService
          .post("/dining-services-apis", {
            which: "getMealItems",
            locationId: venueData.LocationId,
            date: currentDate,
            asurite: tokens.username
          })
          .then(apisResponse => {
            // console.log("apisResponse ", apisResponse);

            this.setState({ mealsData: apisResponse });
          });
      }
    });
  }

  setModalVisible = (visible, which, foodItemData = false) =>
    this.setState({ modalVisible: visible, which, foodItemData });

  render() {
    const {
      venueData,
      foodPreferences,
      addPreference,
      addFavorite,
      addFavoriteCampuses
    } = this.props.navigation.state.params;
    const setBackgroundDark = this.state.modalVisible ? (
      <View style={styles.darkBackground} />
    ) : null;
    // console.log("isDar? ", this.state.modalVisble ? "dark" : "light");
    return (
      <ScrollView>
        <View style={styles.container}>
          <Analytics ref="analytics" />
          <DiningVenueTop
            navigation={this.props.navigation}
            venueData={venueData}
            setModalVisible={this.setModalVisible}
            addFavorite={addFavorite}
            addFavoriteCampuses={addFavoriteCampuses}
          />
          <BuildAMeal
            navigation={this.props.navigation}
            setModalVisible={this.setModalVisible}
            modalVisible={this.state.modalVisible}
            mealsData={this.state.mealsData}
            foodPreferences={foodPreferences}
          />
          <DiningVenuesModal
            setModalVisible={this.setModalVisible}
            modalVisible={this.state.modalVisible}
            foodItemData={this.state.foodItemData}
            venueData={venueData}
            which={this.state.which}
            foodPreferences={foodPreferences}
            food={foodPreferences}
            allergens={foodPreferences}
            addPreference={addPreference}
          />
        </View>
        {setBackgroundDark}
      </ScrollView>
    );
  }
}

DiningVenue.contextTypes = {
  getTokens: PropTypes.func
};

DiningVenue.propTypes = {
  navigation: PropTypes.object.isRequired,
  venueData: PropTypes.object,
  foodPreferences: PropTypes.object,
  addPreference: PropTypes.func,
  addFavorite: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgb(227, 226, 226)"
  },
  darkBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    height: "100%",
    width: responsiveWidth(100),
    position: "absolute",
    zIndex: 10
  }
});
