import React, { Component } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome5";
import PressedWrapper from "./PressedWrapper";
import DiningVenueFilter from "./dining-venues/DiningVenueFilter";
import DiningVenueTopFavorites from "./dining-venues/DiningVenueTopFavorites";
import { organizeVenues, filterVenues } from "./utility";

const PINK = "rgb(173, 5, 66)";
const TITLE_FONT_SIZE = responsiveFontSize(1.8);
const heartIcon = <Icon name="heart" color={PINK} size={TITLE_FONT_SIZE} />;
const heartIconFull = (
  <Icon name="heart" color={PINK} size={TITLE_FONT_SIZE} solid />
);
const arrowIcon = <Icon name="chevron-right" />;
const arrayOfInfoMeals = [
  [
    "Tempe",
    [
      { name: "Barret Honors College - Student Plans" },
      { name: "Barret Honors College - Faculty Plans" },
      { name: "Student Plans" },
      { name: "Faculty and Staff Plans" }
    ]
  ],
  [
    "Downtown",
    [{ name: "Student Plans" }, { name: "Faculty and Staff Plans" }]
  ],
  [
    "Polytechnic",
    [{ name: "Student Plans" }, { name: "Faculty and Staff Plans" }]
  ],
  ["West", [{ name: "Student Plans" }, { name: "Faculty and Staff Plans" }]]
];

export default class Campuses extends Component {
  state = {
    arrayOfVenues: organizeVenues(this.props.venues),
    which: "all"
  };

  componentDidMount() {
    this.setItems();
  }

  addFavorite = (whichId, add = true) => {
    const array = this.state.arrayOfVenues;
    array.forEach(v => {
      if (v.locationId === whichId) {
        v.favorite = add;
      }
    });
    // console.log("addFavorite ", whichId, add, array);
    this.setState({ arrayOfVenues: array }, () => this.setItems());
  };

  filterPressHandler = which => {
    this.setState(
      { arrayOfVenues: filterVenues(this.props.venues, which), which },
      () => this.setItems()
    );
  };

  setItems() {
    const whichDataSet =
      this.props.which === "mealPlans"
        ? arrayOfInfoMeals
        : this.state.arrayOfVenues;
    this.setState({ data: [] });
    setTimeout(() => {
      this.setState({ data: this._renderData(whichDataSet) });
    }, 300);
  }

  _renderData = array => {
    if (Array.isArray(array) && array.length > 0) {
      return array.map((v, i) => {
        const items = this._renderItems(v[1]);
        return (
          <View style={styles.sectionBox} key={i}>
            <View style={styles.itemContainer}>
              <Text style={styles.itemTitleText}>{v[0]}</Text>
            </View>
            {items}
          </View>
        );
      });
    } else if (Array.isArray(array) && array.length === 0) {
      // console.log("this.state.which ", this.state.which);
      let noneMessage;
      if (this.state.which === "Open Now") {
        noneMessage = "There are no dining venues currently open";
      } else if (this.state.which === "Near Me") {
        noneMessage =
          "There are no dining venues within 2 miles of your location.";
      } else {
        noneMessage = "There are no dining venues in the database.";
      }
      return (
        <View style={{ padding: responsiveWidth(10) }}>
          <Text
            style={{
              textAlign: "center",
              color: "black",
              fontSize: responsiveFontSize(1.7)
            }}
          >
            {noneMessage}
          </Text>
        </View>
      );
    } else {
      return null;
    }
  };

  _renderItems = sectionArray => {
    return sectionArray.map((v, i) => {
      // console.log("_renderItems seciton ", v);
      const whereToNavigate =
        this.props.which === "venues" ? "DiningVenue" : "MealPlansBuy";
      const propsToPass =
        this.props.which === "venues"
          ? {
              venueData: v,
              foodPreferences: this.props.foodPreferences,
              addPreference: this.props.addPreference,
              addFavorite: this.props.addFavorite,
              addFavoriteCampuses: this.addFavorite
            }
          : { mealPlansData: v };
      const whichHeartIcon = v.favorite ? heartIconFull : heartIcon;
      return (
        <View style={styles.itemContainer} key={i}>
          <PressedWrapper
            onPress={() =>
              this.props.navigation.navigate(whereToNavigate, propsToPass)
            }
            key={i}
            style={styles.upperItemContainer}
          >
            <Text style={styles.itemText}>{v.name}</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <DiningVenueTopFavorites
                favorite={v.favorite}
                locationId={v.locationId}
                addFavorite={this.props.addFavorite}
                fontSize={responsiveFontSize(1.8)}
              />
              <Text
                style={[
                  styles.itemText,
                  {
                    paddingHorizontal: responsiveWidth(4),
                    paddingLeft: responsiveWidth(6)
                  }
                ]}
              >
                {arrowIcon}
              </Text>
            </View>
          </PressedWrapper>
        </View>
      );
    });
  };

  render() {
    const { location, mealPlans } = this.props.navigation.state.params;
    if (this.props.venues || mealPlans) {
      return (
        <View style={styles.container}>
          {this.props.which === "venues" ? (
            <DiningVenueFilter filterPressHandler={this.filterPressHandler} />
          ) : null}
          {this.state.data}
        </View>
      );
    } else {
      return <ActivityIndicator />;
    }
  }
}

Campuses.propTypes = {
  navigation: PropTypes.object.isRequired,
  which: PropTypes.string,
  venues: PropTypes.array,
  foodPreferences: PropTypes.object,
  addFavorite: PropTypes.func,
  addPreference: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: responsiveWidth(3),
    marginVertical: responsiveWidth(4),
    marginBottom: 0,
    shadowColor: "grey",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    elevation: 10,
    marginBottom: responsiveHeight(1),
    paddingVertical: responsiveHeight(1)
  },
  sectionBox: {
    marginVertical: responsiveHeight(1)
  },
  upperItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%"
  },
  itemContainer: {
    width: responsiveWidth(84),
    paddingVertical: responsiveHeight(1),
    borderBottomWidth: 1,
    borderBottomColor: "rgb(207, 207, 207)"
  },
  itemTitleText: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: "bold",
    color: "black",
    fontFamily: "Roboto"
  },
  itemText: {
    fontSize: responsiveFontSize(1.5),
    color: "rgb(66, 66, 66)"
  }
});
