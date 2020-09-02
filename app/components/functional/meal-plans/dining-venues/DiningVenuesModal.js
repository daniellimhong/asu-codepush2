import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform
} from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import MealOptionChart from "./MealOptionChart";
import DiningVenuesModalPrefItem from "./DiningVenuesModalPrefItem";
import { makeStandardTime, getNumber, setActive } from "./utility";

export default class DiningVenuesModal extends Component {
  state = {
    allergens: [
      { name: "Eggs", active: false },
      { name: "Fish", active: false },
      { name: "Milk", active: false },
      { name: "Peanuts", active: false },
      { name: "Shellfish", active: false },
      { name: "Soy", active: false },
      { name: "Tree Nuts", active: false },
      { name: "Wheat", active: false }
    ],
    preferences: [
      { name: "Made without Gluten", active: false },
      { name: "Vegan", active: false },
      { name: "Vegetarian", active: false }
    ]
  };

  _renderDays = arrayOfDays => {
    return arrayOfDays.map((v, i) => {
      return (
        <View key={i}>
          <Text
            style={{
              fontSize: responsiveFontSize(1.6),
              fontWeight: "bold",
              alignSelf: "flex-start",
              paddingVertical: responsiveHeight(1),
              fontFamily: "Roboto"
            }}
          >
            {v.Day}
          </Text>
          {this._renderHours(v.MealPeriods)}
        </View>
      );
    });
  };

  _renderHours = arrayOfHours => {
    return arrayOfHours.map((v, i) => {
      return (
        <View
          style={{ flexDirection: "row", justifyContent: "space-between" }}
          key={i}
        >
          <Text style={{ fontWeight: "500", fontFamily: 'Roboto' }}>{v.MealPeriod}</Text>
          <View
            style={{
              flexDirection: "row"
            }}
          >
            <Text style={{ paddingHorizontal: responsiveWidth(1) }}>
              {makeStandardTime(v.Start)} -
            </Text>
            <Text>{makeStandardTime(v.End)}</Text>
          </View>
        </View>
      );
    });
  };

  _renderPreferences = (arrayOfPreferences, which) => {
    const currentArray = setActive(
      arrayOfPreferences,
      this.props.foodPreferences,
      which
    );
    return arrayOfPreferences.map((v, i) => {
      return (
        <DiningVenuesModalPrefItem
          key={i}
          data={v}
          i={i}
          currentArray={currentArray}
          which={which}
          preferencesPressHandler={this.preferencesPressHandler}
        />
      );
    });
  };

  preferencesPressHandler = (name, which, active, index, array) => {
    // console.log(`add preference ${name}${which}`);
    const addOrRemove = !active;
    this.props.addPreference(name, which, addOrRemove);
    for (let i = 0; i < array.length; i++) {}
  };

  render() {
    // console.log("this is this.props in DiningVenuesModal ", this.props);
    let whichToReturn;
    if (this.props.which === "hours") {
      whichToReturn = (
        <View style={styles.sectionContainer}>
          <View style={{ paddingVertical: responsiveHeight(3) }}>
            <Text style={styles.modalTitleText}>
              {this.props.venueData.name}
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontSize: responsiveFontSize(1.6),
                color: "rgb(91, 88, 88)"
              }}
            >
              Standard Hours
            </Text>
          </View>
          <View
            style={{
              height: responsiveHeight(60)
            }}
          >
            <ScrollView style={{ marginBottom: responsiveHeight(2) }}>
              {this._renderDays(this.props.venueData.times.Days)}
            </ScrollView>
          </View>
        </View>
      );
    } else if (this.props.which === "foodPreference") {
      whichToReturn = (
        <View style={styles.sectionContainer}>
          <View
            style={{
              paddingTop: responsiveHeight(3),
              paddingBottom: responsiveHeight(1)
            }}
          >
            <Text style={styles.modalTitleText}>Preferences</Text>
          </View>
          <View style={{ paddingVertical: responsiveHeight(2) }}>
            <View>
              <Text style={styles.modalTextBold}>Allergens & Intolerances</Text>
              <Text style={styles.modalText}>
                Select items to exclude from the menu
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingVertical: responsiveHeight(1)
              }}
            >
              {this._renderPreferences(this.state.allergens, "allergens")}
            </View>
          </View>
          <View style={{ paddingVertical: responsiveHeight(2) }}>
            <View>
              <Text style={styles.modalTextBold}>Food Preferences</Text>
              <Text style={styles.modalText}>
                Select speical diet menu items
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingVertical: responsiveHeight(1)
              }}
            >
              {this._renderPreferences(this.state.preferences, "preferences")}
            </View>
          </View>
        </View>
      );
    } else if (this.props.which === "foodOption" && this.props.foodItemData) {
      const data = this.props.foodItemData;
      whichToReturn = (
        <View style={styles.foodOptionContainer}>
          <View style={styles.foodOptionBox}>
            <Text style={styles.modalTextBold}>{data.ProductName}</Text>
            <Text style={styles.foodOptionText}>{data.ShortDescription}</Text>
          </View>
          <View style={styles.foodOptionBox}>
            <Text style={styles.modalTextBold}>Macronutrients</Text>
            <MealOptionChart
              carbs={getNumber(data.TotalCarbohydrates)}
              fat={getNumber(data.TotalFat)}
              protein={getNumber(data.Protein)}
            />
          </View>
          <View style={[styles.foodOptionBox, { borderBottomWidth: 0 }]}>
            <Text style={styles.foodOptionBoldText}>
              Serving Size: {data.Serving}
            </Text>
            <Text style={styles.foodOptionBoldText}>Amount per serving:</Text>
            <View style={styles.foodOptionItemBox}>
              <Text style={styles.foodOptionBoldText}>Calories</Text>
              <Text style={styles.foodOptionText}>{data.Calories}</Text>
            </View>
            <View style={styles.foodOptionItemBox}>
              <Text style={styles.foodOptionBoldText}>Calories From Fat</Text>
              <Text style={styles.foodOptionText}>{data.CaloriesFromFat}</Text>
            </View>
            <View style={styles.foodOptionItemBox}>
              <Text style={styles.foodOptionBoldText}>Total Fat</Text>
              <Text style={styles.foodOptionText}>{data.TotalFat}</Text>
            </View>
            <View style={styles.foodOptionItemBox}>
              <Text style={styles.foodOptionText}>Saturated Fat</Text>
              <Text style={styles.foodOptionText}>{data.SaturatedFat}</Text>
            </View>
            <View style={styles.foodOptionItemBox}>
              <Text style={styles.foodOptionText}>Trans Fat</Text>
              <Text style={styles.foodOptionText}>{data.TransFat}</Text>
            </View>
            <View style={styles.foodOptionItemBox}>
              <Text style={styles.foodOptionBoldText}>Cholesterol</Text>
              <Text style={styles.foodOptionText}>{data.Cholesterol}</Text>
            </View>
            <View style={styles.foodOptionItemBox}>
              <Text style={styles.foodOptionBoldText}>Sodium</Text>
              <Text style={styles.foodOptionText}>{data.Sodium}</Text>
            </View>
            <View style={styles.foodOptionItemBox}>
              <Text style={styles.foodOptionBoldText}>Total Carbohydrate</Text>
              <Text style={styles.foodOptionText}>
                {data.TotalCarbohydrates}
              </Text>
            </View>
            <View style={styles.foodOptionItemBox}>
              <Text style={styles.foodOptionText}>Dietary Fiber</Text>
              <Text style={styles.foodOptionText}>{data.DietaryFiber}</Text>
            </View>
            <View style={styles.foodOptionItemBox}>
              <Text style={styles.foodOptionText}>Sugars</Text>
              <Text style={styles.foodOptionText}>{data.Sugars}</Text>
            </View>
            <View style={styles.foodOptionItemBox}>
              <Text style={styles.foodOptionBoldText}>Protein</Text>
              <Text style={styles.foodOptionText}>{data.Protein}</Text>
            </View>
          </View>
        </View>
      );
    } else {
      whichToReturn = null;
    }
    // console.log("DiningVenuesModal this.props", this.props);
    return (
      <Modal
        animationType="slide"
        transparent
        visible={this.props.modalVisible}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          width: "100%",
          height: "100%"
        }}
      >
        <View style={styles.modalView}>
          {whichToReturn}
          <TouchableOpacity
            onPress={() => this.props.setModalVisible(false)}
            style={styles.bottomButton}
          >
            <Text style={styles.bottomButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
}

DiningVenuesModal.propTypes = {
  modalVisible: PropTypes.bool.isRequired,
  setModalVisible: PropTypes.func.isRequired,
  venueData: PropTypes.object,
  which: PropTypes.string,
  addPreference: PropTypes.func,
  foodPreferences: PropTypes.object,
  allergens: PropTypes.object
};

const styles = StyleSheet.create({
  modalView: {
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    width: responsiveWidth(90),
    paddingHorizontal: responsiveWidth(6),
    alignSelf: "center",
    top: responsiveHeight(15),
    borderRadius: 10
  },
  modalTitleText: {
    fontSize: responsiveFontSize(2.7),
    fontWeight: "bold",
    paddingHorizontal: responsiveWidth(2),
    textAlign: "center",
    color: "black",
    fontFamily: "Roboto"
  },
  sectionContainer: {
    width: "100%"
  },
  modalTextBold: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: "bold",
    color: "black",
    fontFamily: "Roboto"
  },
  modalText: {
    color: "black",
    fontSize: responsiveFontSize(1.5),
    fontWeight: "300",
    fontFamily: 'Roboto',
  },
  bottomButton: {
    width: responsiveWidth(90),
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: responsiveHeight(2),
    borderTopWidth: 1,
    borderTopColor: "rgb(200, 200, 200)"
  },
  bottomButtonText: {
    fontSize: responsiveFontSize(1.75),
    fontWeight: "bold",
    color: "black",
    fontFamily: "Roboto"
  },
  foodOptionContainer: {
    width: "100%",
    paddingVertical: responsiveHeight(2)
  },
  foodOptionBox: {
    paddingTop: responsiveHeight(2),
    borderBottomWidth: 1,
    borderBottomColor: "rgb(212, 212, 212)"
  },
  foodOptionItemBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  foodOptionBoldText: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: "bold",
    color: "black",
    paddingVertical: responsiveHeight(0.5),
    fontFamily: "Roboto"
  },
  foodOptionText: {
    fontSize: responsiveFontSize(1.5),
    color: "grey",
    paddingVertical: responsiveHeight(0.5),
    paddingLeft: responsiveWidth(5)
  }
});
