import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground
} from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PressedWrapper from "../PressedWrapper";

export default class DiningAndMealsHeader extends PureComponent {
  findBalance = (whichType, array) => {
    if (whichType === "M&G Dollars") {
      if (array) {
        const filteredArray = array.filter(v => {
          return v.type === whichType;
        });
        const total = filteredArray.reduce(
          (acc, val) => acc + Number(val.balance),
          0
        );
        return filteredArray.length > 0 ? total.toFixed(2) : "0.00";
      } else {
        return "0.00";
      }
    } else if (whichType === "Meal Plan") {
      if (array) {
        const filteredArray = array.filter(v => {
          return v.type === whichType;
        });
        const total = filteredArray.reduce(
          (acc, val) => acc + Number(val.balance),
          0
        );
        return filteredArray.length > 0 ? total : "0";
      } else {
        return "0";
      }
    }
  };

  pressHandler = () => {
    this.props.navigation.navigate("DiningServices", {
      transactions: this.props.transactions,
      mealPlans: this.props.mealPlans,
      lastDiningTransaction: this.props.lastDiningTransaction,
      lastMAndGTransaction: this.props.lastMAndGTransaction
    });
  };

  render() {
    // console.log("DiningAndMealsHeader props ", this.props);
    const whatToReturn = this.props.mealPlans ? (
      <View>
        <View style={styles.container}>
          <Text style={[styles.topBox, styles.topBoxText]}>
            Current Balances
          </Text>
          <View style={styles.middleBox}>
            <View style={styles.middleBoxItem}>
              <Text style={styles.middleBoxText}>Maroon & Gold Dollars: </Text>
              <Text style={styles.middleBoxText}>
                ${this.findBalance("M&G Dollars", this.props.mealPlans)}
              </Text>
            </View>
            <View style={styles.middleBoxItem}>
              <Text style={styles.middleBoxText}>Meals Balance: </Text>
              <Text style={styles.middleBoxText}>
                {this.findBalance("Meal Plan", this.props.mealPlans)}
              </Text>
            </View>
          </View>
          <PressedWrapper style={styles.bottomBox} onPress={this.pressHandler}>
            <Text style={styles.bottomBoxText}>View Transactions</Text>
          </PressedWrapper>
        </View>
      </View>
    ) : (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
    if (this.props.mealPlansDataError) {
      return (
        <ImageBackground
          style={styles.imageContainer}
          source={require("../../assets/hero-01.png")}
        >
          <Text style={[styles.bottomBoxText, { padding: responsiveWidth(5) }]}>
            Sorry, but there was an error loading this section.
          </Text>
        </ImageBackground>
      );
    }
    if (this.props.mealPlans && this.props.mealPlans.length == 0) {
      return null;
    } else {
      return (
        <ImageBackground
          style={styles.imageContainer}
          source={require("../../assets/hero-01.png")}
        >
          {whatToReturn}
        </ImageBackground>
      );
    }
  }
}

DiningAndMealsHeader.propTypes = {
  navigation: PropTypes.object.isRequired,
  transactions: PropTypes.array,
  mealPlans: PropTypes.array,
  lastDiningTransaction: PropTypes.object,
  lastMAndGTransaction: PropTypes.object
};

const styles = StyleSheet.create({
  imageContainer: {
    width: "100%"
  },
  container: {
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveWidth(6.5),
    justifyContent: "space-around",
    alignItems: "center"
  },
  topBox: {
    alignSelf: "flex-start"
  },
  topBoxText: {
    color: "white",
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  middleBox: {
    width: "100%",
    marginVertical: responsiveWidth(3),
    alignItems: "center"
  },
  middleBoxItem: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: responsiveWidth(1)
  },
  middleBoxText: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: "bold",
    color: "white",
    fontFamily: "Roboto"
  },
  bottomBox: {
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "white",
    paddingVertical: responsiveHeight(0.5),
    paddingHorizontal: responsiveWidth(4),
    borderRadius: 5
  },
  bottomBoxText: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: "bold",
    color: "white",
    alignSelf: "center",
    textAlign: "center",
    fontFamily: "Roboto"
  }
});
