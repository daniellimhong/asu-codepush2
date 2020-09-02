import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PropTypes from "prop-types";
import BuildAMealItem from "./BuildAMealItem";
import BuildAMealChart from "./BuildAMealChart";
import BuildAMealOptions from "./BuildAMealOptions";
import {
  makeFoodPreferencesObject,
  separateMeals,
  getNutrients
} from "./utility";

const CIRCLE_GREEN = "rgb(38, 131, 0)";

export default class BuildAMeal extends Component {
  state = {
    meals: [],
    which: "Info",
    arrayOfWhich: ["Info", "cals", "fat", "carbs", "prot"],
    data: [],
    cals: 0,
    carbs: 0,
    fat: 0,
    protein: 0,
    index: 0,
    unselect: 0
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.mealsData &&
      this.props.foodPreferences &&
      prevProps.mealsData !== this.props.mealsData
    ) {
      // console.log("this.props.mealsData ", this.props.mealsData);
      const separatedMeals = separateMeals(
        this.props.mealsData.MealPeriods,
        this.props.foodPreferences,
        this.state.whichMeal
      );
      // console.log(
      //   "serparate meals ",
      //   separatedMeals,
      //   this.props.foodPreferences
      // );
      this.setState({
        meals: separatedMeals
      });
    } else if (this.props.mealsData && this.props !== prevProps) {
      const separatedMeals = separateMeals(
        this.props.mealsData.MealPeriods,
        this.props.foodPreferences,
        this.state.whichMeal
      );
      this.setState({
        meals: separatedMeals
      });
    }
    // if (
    //   this.props.modalVisible !== prevProps.modalVisible &&
    //   this.props.modalVisble === false
    // ) {
    //   // alert("changed");
    // }
  }

  selectItem = (nutrients, add) => {
    if (add) {
      this.setState({
        selected: true,
        cals: this.state.cals + nutrients.cals,
        carbs: this.state.carbs + nutrients.carbs,
        fat: this.state.fat + nutrients.fat,
        protein: this.state.protein + nutrients.protein
      });
    } else {
      this.setState({
        selected: false,
        cals: this.state.cals - nutrients.cals,
        carbs: this.state.carbs - nutrients.carbs,
        fat: this.state.fat - nutrients.fat,
        protein: this.state.protein - nutrients.protein
      });
    }
  };

  openFoodItem = data => this.props.setModalVisible(true, "foodOption", data);

  setWhich = which => {
    const { arrayOfWhich } = this.state;
    for (let i = 0; i < arrayOfWhich.length; i++) {
      if (arrayOfWhich[i] === which) {
        const spliced = arrayOfWhich.splice(i, 1);
        arrayOfWhich.unshift(spliced[0]);
      }
    }
    const finalArray = arrayOfWhich.filter(v => v !== "Info");
    // console.log("finalArray ", finalArray);
    this.setState({ which, arrayOfWhich: finalArray });
  };

  setMeal = meal => {
    const arrayOfMeals = this.state.meals;
    for (let i = 0; i < arrayOfMeals.length; i++) {
      if (arrayOfMeals[i].mealPeriod === meal) {
        const spliced = arrayOfMeals.splice(i, 1);
        arrayOfMeals.unshift(spliced[0]);
      }
    }
    // console.log("arrayOfMeals ", arrayOfMeals);
    this.setState({
      whichMeal: meal,
      meals: arrayOfMeals,
      unselect: this.state.unselect + 1,
      cals: 0,
      carbs: 0,
      fat: 0,
      protein: 0
    });
  };

  _renderLunchItem = (arrayOfMeals, parentIndex) => {
    const mappedData = arrayOfMeals.map((v, i) => {
      return (
        <BuildAMealItem
          name={v.ProductName}
          data={v}
          nutrients={getNutrients(v)}
          which={this.state.which}
          key={i}
          i={i}
          parentIndex={parentIndex}
          selectItem={this.selectItem}
          openFoodItem={this.openFoodItem}
          unselect={this.state.unselect}
        />
      );
    });
    return mappedData;
  };

  render() {
    const { meals } = this.state;
    // console.log("BuildAMeal reload ", meals);
    const listOfMeals =
      meals && meals.length > 0
        ? this.state.meals[0].data.map((v, i) => {
            return (
              <View style={styles.sectionContainer} key={i}>
                <Text style={styles.titleText}>{v.Name}</Text>
                {this._renderLunchItem(v.Items, v.i)}
              </View>
            );
          })
        : null;
    if (
      !this.props.mealsData ||
      !this.props.mealsData.MealPeriods ||
      this.props.mealsData.MealPeriods.length === 0
    ) {
      return null;
    } else {
      return (
        <View style={styles.container}>
          <Text
            style={styles.titleText}
            onPress={() => this.props.setModalVisible(true, "foodOption")}
          >
            Build a Meal
          </Text>
          <Text style={styles.normalText}>
            Select items below to view your macronutrients
          </Text>
          <BuildAMealChart
            cals={this.state.cals}
            carbs={this.state.carbs}
            fat={this.state.fat}
            protein={this.state.protein}
          />
          <BuildAMealOptions
            setModalVisible={this.props.setModalVisible}
            arrayOfWhich={this.state.arrayOfWhich}
            setWhich={this.setWhich}
            meals={this.state.meals}
            setMeal={this.setMeal}
          />
          {listOfMeals}
        </View>
      );
    }
  }
}

BuildAMeal.propTypes = {
  navigation: PropTypes.object,
  setModalVisible: PropTypes.func,
  foodPreferences: PropTypes.object,
  mealsData: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
    width: responsiveWidth(94),
    marginHorizontal: responsiveWidth(3),
    marginVertical: responsiveHeight(2),
    shadowColor: "grey",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    elevation: 10,
    backgroundColor: "white",
    padding: responsiveWidth(4)
  },
  sectionContainer: {
    paddingVertical: responsiveHeight(1)
  },
  titleText: {
    fontWeight: "bold",
    color: "black",
    fontSize: responsiveFontSize(1.9),
    fontFamily: "Roboto"
  },
  normalText: {
    color: "black",
    fontSize: responsiveFontSize(1.5)
  }
});
