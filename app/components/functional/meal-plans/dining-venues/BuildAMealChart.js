import React, { PureComponent } from "react";
import { View, Text, StyleSheet } from "react-native";
import { PieChart } from "react-native-svg-charts";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PropTypes from "prop-types";

const BLUE = "rgb(0, 136, 223)";
const MAROON = "rgb(212, 0, 108)";
const YELLOW = "rgb(255, 199, 0)";

export default class BuildAMealChart extends PureComponent {
  getPercentages = data => {
    const carbAmount = data[0].amount;
    const fatAmount = data[1].amount;
    const proteinAmount = data[2].amount;
    const totalGrams = carbAmount + fatAmount + proteinAmount;
    const carb = Math.round((carbAmount / totalGrams) * 100);
    const fat = Math.round((fatAmount / totalGrams) * 100);
    const protein = Math.round((proteinAmount / totalGrams) * 100);
    return {
      carb: carb || 0,
      fat: fat || 0,
      protein: protein || 0
    };
  };

  render() {
    const data = [
      { key: 1, name: "carbs", amount: this.props.carbs, svg: { fill: BLUE } },
      { key: 2, name: "fat", amount: this.props.fat, svg: { fill: MAROON } },
      {
        key: 3,
        name: "protein",
        amount: this.props.protein,
        svg: { fill: YELLOW }
      }
    ];
    const carbs = <Text style={{ color: BLUE }}>carbs</Text>;
    const fat = <Text style={{ color: MAROON }}>fat</Text>;
    const protein = <Text style={{ color: YELLOW }}>protein</Text>;
    const percentages = this.getPercentages(data);
    if (
      !this.props.cals &&
      !this.props.carbs &&
      !this.props.fat &&
      !this.props.protein
    ) {
      return null;
    } else {
      return (
        <View style={styles.container}>
          <PieChart
            style={styles.pieBox}
            valueAccessor={({ item }) => item.amount}
            data={data}
            spacing={0}
            innerRadius="60%"
            outerRadius="95%"
          />
          <View style={styles.dataBox}>
            <Text style={styles.textBold}>
              {this.props.cals}{" "}
              <Text style={{ fontWeight: "400", fontFamily: 'Roboto', }}>total cals</Text>
            </Text>
            <Text style={styles.textBold}>
              {percentages.carb}% {carbs}, {percentages.fat}% {fat},{" "}
              {percentages.protein}% {protein}
            </Text>
          </View>
        </View>
      );
    }
  }
}

BuildAMealChart.propTypes = {
  cals: PropTypes.number,
  carbs: PropTypes.number,
  fat: PropTypes.number,
  protein: PropTypes.number
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingTop: responsiveHeight(1),
    paddingBottom: responsiveHeight(2),
    borderBottomWidth: 1,
    borderBottomColor: "rgb(191, 191, 191)"
  },
  pieBox: {
    flex: 1,
    height: responsiveWidth(10)
  },
  dataBox: {
    flex: 6,
    justifyContent: "center",
    marginHorizontal: responsiveWidth(2)
  },
  textBold: {
    fontWeight: "bold",
    fontSize: responsiveFontSize(1.5),
    color: "black",
    fontFamily: "Roboto"
  }
});
