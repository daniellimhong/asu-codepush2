import React, { PureComponent } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PropTypes from "prop-types";
import {
  removeMinusFromString,
  createMealAmountString,
  createMealBalanceString
} from "../utility";
import { compareTransactionTypes } from "./utility";

export default class LastDiningTransaction extends PureComponent {
  _renderLastTransaction = (lastDining, lastMAndG) => {
    const lastTransaction = compareTransactionTypes(lastDining, lastMAndG);
    const isDining = lastTransaction.type !== "m&g";
    const amount = isDining
      ? createMealAmountString(lastTransaction.amount)
      : Number(removeMinusFromString(lastTransaction.amount)).toFixed(2);
    const balance = isDining
      ? createMealBalanceString(lastTransaction.balance)
      : Number(removeMinusFromString(lastTransaction.balance)).toFixed(2);
    return (
      <View style={styles.container}>
        <View style={styles.containerLeft}>
          <Image
            style={{
              width: "100%",
              height: responsiveHeight(8.5),
              alignSelf: "flex-start"
            }}
            source={require("../../assets/dining-dollar.png")}
            resizeMode="contain"
          />
        </View>
        <View style={styles.containerRight}>
          <Text style={styles.titleText}>
            {isDining ? "Last Dining Transaction" : "Last M&G Transaction"}
          </Text>
          <View style={styles.middleBox}>
            <Text style={styles.locationText}>
              {lastTransaction.description}
            </Text>
            <Text style={[styles.greyText, { paddingTop: 0 }]}>
              {lastTransaction.time}
            </Text>
          </View>
          <View style={styles.bottomBox}>
            <Text style={styles.greyText}>
              <Text style={styles.boldText}>Amount: </Text> ${amount}
            </Text>
            <Text style={styles.greyText}>
              <Text style={styles.boldText}>Balance: </Text> ${balance}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  render() {
    if (!this.props.lastDiningTransaction && !this.props.lastMAndGTransaction) {
      return null;
    } else {
      return this._renderLastTransaction(
        this.props.lastDiningTransaction,
        this.props.lastMAndGTransaction
      );
    }
  }
}

LastDiningTransaction.propTypes = {
  lastDiningTransaction: PropTypes.object,
  lastMAndGTransaction: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: responsiveWidth(4),
    backgroundColor: "white",
    shadowColor: "grey",
    elevation: 5,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1
  },
  containerLeft: {
    flex: 1
  },
  containerRight: {
    flex: 3
  },
  middleBox: {
    paddingVertical: responsiveWidth(1)
  },
  bottomBox: {
    paddingVertical: responsiveWidth(1)
  },
  titleText: {
    fontSize: responsiveFontSize(2.1),
    color: "black",
    fontWeight: "600",
    fontFamily: 'Roboto',
    paddingBottom: responsiveWidth(2)
  },
  locationText: {
    fontSize: responsiveFontSize(1.7),
    color: "black",
    paddingBottom: responsiveWidth(1)
  },
  boldText: {
    fontSize: responsiveFontSize(1.4),
    color: "black",
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  greyText: {
    fontSize: responsiveFontSize(1.4),
    color: "grey",
    paddingTop: responsiveWidth(1)
  }
});
