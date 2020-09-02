import React from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import PropTypes from "prop-types";
import { StackedBarChart } from "react-native-svg-charts";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

const BLUE = "rgb(0, 136, 223)";
const MAROON = "rgb(212, 0, 108)";
const YELLOW = "rgb(255, 199, 0)";

export default class MealOptionChart extends React.PureComponent {
  getPercentages = props => {
    const carbAmount = props.carbs;
    const fatAmount = props.fat;
    const proteinAmount = props.protein;
    const totalGrams = carbAmount + fatAmount + proteinAmount;
    const carbs = Math.round((carbAmount / totalGrams) * 100);
    const fat = Math.round((fatAmount / totalGrams) * 100);
    const protein = Math.round((proteinAmount / totalGrams) * 100);
    return [
      {
        carbs: carbs || 0,
        fat: fat || 0,
        protein: protein || 0,
        month: new Date(2015, 0, 1),
        dates: 1
      }
    ];
  };

  render() {
    const data = this.getPercentages(this.props);

    const colors = [BLUE, MAROON, YELLOW];
    const keys = ["carbs", "fat", "protein"];

    return (
      <View style={styles.container}>
        <StackedBarChart
          style={{ height: responsiveHeight(1) }}
          keys={keys}
          colors={colors}
          data={data}
          showGrid={false}
          contentInset={{ top: 30, bottom: 30 }}
          horizontal
        />
        <Text style={styles.modalText}>
          {data[0].carbs}% <Text style={{ color: BLUE }}>carbs</Text>,{" "}
          {data[0].fat}% <Text style={{ color: MAROON }}>fat</Text>,{" "}
          {data[0].protein}% <Text style={{ color: YELLOW }}>protein</Text>
        </Text>
      </View>
    );
  }
}

MealOptionChart.propTypes = {
  carbs: PropTypes.number,
  fat: PropTypes.number,
  protein: PropTypes.number
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: responsiveHeight(1)
  },
  modalText: {
    color: "black",
    fontSize: responsiveFontSize(1.5),
    fontWeight: "700",
    fontFamily: 'Roboto',
    width: "100%",
    textAlign: "center",
    padding: responsiveHeight(1)
  }
});
