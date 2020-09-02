import React, { PureComponent } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome";
import PressedWrapper from "../PressedWrapper";
import MealPlansBuyHeader from "./MealPlansBuyHeader";
import MealPlansBuyItem from "./MealPlansBuyItem";

const bulletIcon = <Icon name="circle" size={responsiveFontSize(0.5)} />;
const arrayOfInfo = [
  {
    name: "Tempe",
    items: [
      { name: "Barret Honors College - Student Plans" },
      { name: "Barret Honors College - Faculty Plans" },
      { name: "Student Plans" },
      { name: "Faculty and Staff Plans" }
    ]
  },
  {
    name: "Downtown",
    items: [{ name: "Student Plans" }, { name: "Faculty and Staff Plans" }]
  },
  {
    name: "Polytechnic",
    items: [{ name: "Student Plans" }, { name: "Faculty and Staff Plans" }]
  },
  {
    name: "West",
    items: [{ name: "Student Plans" }, { name: "Faculty and Staff Plans" }]
  }
];

export default class MealPlansBuy extends PureComponent {
  state = {};

  componentDidMount() {
    // this.setState({ data: this._renderData(arrayOfInfo) });
  }

  _renderData = array => {
    return array.map((v, i) => {
      const items = this._renderItems(v.items);
      return <View key={i} />;
    });
  };

  _renderItems = sectionArray => {
    console.log("MADE IT INTO _renderItems");
    return sectionArray.map((v, i) => {
      return <View />;
    });
  };

  render() {
    return (
      <View>
        <MealPlansBuyHeader />
        <MealPlansBuyItem />
      </View>
    );
  }
}

const styles = StyleSheet.create({});
