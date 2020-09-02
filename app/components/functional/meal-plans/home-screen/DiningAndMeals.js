import React, { PureComponent } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import axios from "axios";
import moment from "moment";
import { Api } from "../../../../services/api";
import { tracker } from "../../../achievement/google-analytics";
import Analytics from "../../analytics";
import DiningAndMealsHeader from "./DiningAndMealsHeader";
import MaroonAndGoldBox from "../MaroonAndGoldBox";
import DiningAndMealsNav from "./DiningAndMealsNav";
import NearbyOpenDining from "./NearbyOpenDining";
import LostCardNav from "./LostCardNav";
import LastDiningTransaction from "./LastDiningTransaction";
import { getLastTransaction } from "../utility";
import { getCurrentVenueStatus, sortNearestRestaurants } from "./utility";

export default class DiningAndMeals extends PureComponent {
  state = {
    venueDataError: false,
    mealPlansDataError: false
  };

  componentDidMount() {
    this.getMealPlansData();
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null,
      "target": "Dining & Meals",
      "resulting-screen": "dining-services", 
      "resulting-section": null
    });
    tracker.trackEvent("View", "Dining&Meals_Home");
  }

  componentDidUpdate(prevProps) {
    // console.log("running and this is prevLocation ", prevProps.location);
    if (
      prevProps.location !== this.props.location &&
      typeof this.props.location === "object"
    ) {
      this.getVenuesData();
    }
  }

  getMealPlansData = () => {
    this.context
      .getTokens()
      .then(tokens => {
        this.setState({
          tokens,
          asurite: tokens.username ? tokens.username : "guest"
        });
        if (tokens.username && tokens.username !== "guest") {
          const apiService = new Api(
            "https://4iml3flfvd.execute-api.us-west-2.amazonaws.com/prod/",
            // "https://d0za13ejt3.execute-api.us-west-2.amazonaws.com/test",
            tokens
          );
          apiService
            .get("/mealplans")
            .then(mealplansResponse => {
              // console.log("mealPlans ", mealplansResponse);
              // mealplansResponse = [];
              apiService
                .get("/transactions")
                .then(transactionsResponse => {
                  // console.log("transactions ", transactionsResponse);
                  // transactionsResponse = null;
                  // console.log(
                  //   "this is transactions and mealPlans ",
                  //   transactionsResponse,
                  //   mealplansResponse
                  // );
                  this.setState({
                    transactions: transactionsResponse,
                    lastDiningTransaction: getLastTransaction(
                      transactionsResponse,
                      "Dining"
                    ),
                    lastMAndGTransaction: getLastTransaction(
                      transactionsResponse,
                      "M&G"
                    ),
                    mealPlans: mealplansResponse
                  });
                  let filteredMealPlans;
                  if (mealplansResponse && mealplansResponse.length > 0) {
                    filteredMealPlans = mealplansResponse.filter(
                      v => v.visible
                    );
                  } else {
                    filteredMealPlans = mealplansResponse;
                  }
                  if (
                    !filteredMealPlans ||
                    (filteredMealPlans && filteredMealPlans.length === 0)
                  ) {
                    this.setState({ signup: "loading" });
                    axios
                      .get(
                        "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/dining-services-signup"
                      )
                      .then(signupResponse => {
                        // console.log(
                        //   "links signupResponse ",
                        //   signupResponse.data
                        // );
                        this.setState({ signup: signupResponse.data });
                      })
                      .catch(e => console.log("links api error: ", e));
                  }
                })
                .catch(error => {
                  console.log("getTransactions error ", error);
                  this.setState({ mealPlansDataError: true });
                });
            })
            .catch(error => {
              console.log("getMealPlans error ", error);
              this.setState({ mealPlansDataError: true });
            });
        }
      })
      .catch(error => {
        this.setState({
          guest: true
        });
      });
  };

  getVenuesData() {
    this.context.getTokens().then(tokens => {
      this.setState({
        tokens,
        asurite: tokens.username ? tokens.username : "guest"
      });
      if (tokens.username && tokens.username !== "guest") {
        const apiService = new Api(
          "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/",
          tokens
        );
        // console.log("tokens.username ", tokens.username);
        apiService
          .post("/dining-services-apis", {
            which: "venues",
            date: moment(new Date()).format("MM/DD/YYYY"),
            location: this.props.location,
            asurite: tokens.username
            // asurite: "zazaidi"
          })
          .then(apisResponse => {
            const { arrayOfVenues, foodPreferences } = apisResponse;
            // console.log("apisResponse ", apisResponse);
            // console.log(
            //   "getCurrentVenueStatus ",
            //   getCurrentVenueStatus(arrayOfVenues)
            // );
            getCurrentVenueStatus(arrayOfVenues);
            const NearbyOpenDiningItems = sortNearestRestaurants(arrayOfVenues);
            // console.log("nearby baby ", NearbyOpenDiningItems.array);
            this.setState({
              venues: arrayOfVenues,
              foodPreferences,
              nearbyItems: NearbyOpenDiningItems.array,
              nearbyFavorites: NearbyOpenDiningItems.favorites
            });
          })
          .catch(error => {
            console.log("getVenuesData error ", error);
            this.setState({ venueDataError: true });
          });
      }
    });
  }

  addPreference = (whichItem, whichPreference, add = true) => {
    const preferences =
      whichPreference === "preferences" ? "preferences" : "allergens";
    if (this.state.foodPreferences[preferences]) {
      const array = this.state.foodPreferences[preferences];
      // console.log("addPreference ", whichItem, whichPreference, add);
      if (!add) {
        // console.log("removing ", array);
        array.forEach((v, i) => {
          if (v === whichItem) {
            array.splice(i, 1);
            // console.log(v);
          }
        });
      } else {
        array.push(whichItem);
      }
    } else {
      this.state.foodPreferences[preferences] = [whichItem];
    }
  };

  addFavorite = (whichId, add = true) => {
    const array = this.state.venues;
    array.forEach(v => {
      if (v.locationId === whichId) {
        v.favorite = add;
      }
    });
    // console.log("addFavorite ", whichId, add, array);
    const NearbyOpenDiningItems = sortNearestRestaurants(array);
    this.setState({
      nearbyItems: NearbyOpenDiningItems.array,
      nearbyFavorites: NearbyOpenDiningItems.favorites
    });
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <Analytics ref="analytics" />
        <DiningAndMealsHeader
          navigation={this.props.navigation}
          transactions={this.state.transactions}
          mealPlans={this.state.mealPlans}
          lastDiningTransaction={this.state.lastDiningTransaction}
          lastMAndGTransaction={this.state.lastMAndGTransaction}
          mealPlansDataError={this.state.mealPlansDataError}
        />
        <LastDiningTransaction
          lastDiningTransaction={this.state.lastDiningTransaction}
          lastMAndGTransaction={this.state.lastMAndGTransaction}
        />
        <MaroonAndGoldBox navigation={this.props.navigation} />
        <DiningAndMealsNav
          navigation={this.props.navigation}
          location={this.props.location}
          venues={this.state.venues}
          foodPreferences={this.state.foodPreferences}
          addPreference={this.addPreference}
          addFavorite={this.addFavorite}
          venueDataError={this.state.venueDataError}
        />
        <NearbyOpenDining
          navigation={this.props.navigation}
          venues={this.state.venues}
          foodPreferences={this.state.foodPreferences}
          addPreference={this.addPreference}
          addFavorite={this.addFavorite}
          nearbyItems={this.state.nearbyItems}
          nearbyFavorites={this.state.nearbyFavorites}
        />
        <LostCardNav navigation={this.props.navigation} />
      </ScrollView>
    );
  }
}

DiningAndMeals.propTypes = {
  navigation: PropTypes.object.isRequired,
  location: PropTypes.object
};

DiningAndMeals.contextTypes = {
  getTokens: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgb(227, 226, 226)",
    height: "100%"
  }
});
