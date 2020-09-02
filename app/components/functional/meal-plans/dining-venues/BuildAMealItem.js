import React, { PureComponent } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PropTypes from "prop-types";
import PressedWrapper from "../PressedWrapper";

const CIRCLE_GREEN = "rgb(38, 131, 0)";

export default class BuildAMealItem extends PureComponent {
  state = {
    selected: false
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.name !== this.props.name ||
      prevProps.unselect !== this.props.unselect
    ) {
      this.setState({ selected: false });
    }
  }

  addItemPressHandler = () => {
    const shouldAdd = !this.state.selected;
    this.props.selectItem(this.props.nutrients, shouldAdd);
    this.setState({
      selected: shouldAdd
    });
  };

  whichTypeToShow = (which, nutrients) => {
    const whichData = {};
    switch (which) {
      case "cals":
        whichData.amount = nutrients.cals;
        whichData.type = nutrients.calsType;
        break;
      case "carbs":
        whichData.amount = nutrients.carbs;
        whichData.type = nutrients.carbsType;
        break;
      case "fat":
        whichData.amount = nutrients.fat;
        whichData.type = nutrients.fatType;
        break;
      case "prot":
        whichData.amount = nutrients.protein;
        whichData.type = nutrients.proteinType;
        break;
      case "Info":
        whichData.amount = "";
        whichData.type = "";
        console.log("empty baby ", whichData);
    }
    return whichData;
  };

  render() {
    // console.log("BuildAMealItem props ", this.props);
    const selectedStyle = {
      backgroundColor: CIRCLE_GREEN,
      borderColor: CIRCLE_GREEN
    };
    let whichToShow = this.whichTypeToShow(
      this.props.which,
      this.props.nutrients
    );
    if (whichToShow === "") {
      whichtoShow.amount = "";
    } else if (!whichToShow) {
      whichToShow.amount = 0;
    }
    return (
      <View style={styles.mealItemContainer} key={this.props.i}>
        <View style={styles.mealItemContainerLeft}>
          <TouchableOpacity
            onPress={this.addItemPressHandler}
            style={[styles.circle, this.state.selected && selectedStyle]}
          />
          <PressedWrapper
            onPress={() => this.props.openFoodItem(this.props.data)}
          >
            <Text style={styles.itemText}>{this.props.name}</Text>
          </PressedWrapper>
        </View>
        <Text style={styles.itemText}>
          {whichToShow.amount} {whichToShow.type ? whichToShow.type : ""}
        </Text>
      </View>
    );
  }
}

BuildAMealItem.propTypes = {
  i: PropTypes.number,
  name: PropTypes.string,
  nutrients: PropTypes.object,
  which: PropTypes.string,
  openFoodItem: PropTypes.func,
  selectItem: PropTypes.func
};

const styles = StyleSheet.create({
  mealItemContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgb(191, 191, 191)",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: responsiveHeight(1.3)
  },
  mealItemContainerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  circle: {
    width: responsiveWidth(5),
    height: responsiveWidth(5),
    marginHorizontal: responsiveWidth(2),
    borderWidth: 1,
    borderColor: "black",
    borderRadius: responsiveWidth(5) / 2
  },
  itemText: {
    fontSize: responsiveFontSize(1.6),
    color: "black"
  }
});
