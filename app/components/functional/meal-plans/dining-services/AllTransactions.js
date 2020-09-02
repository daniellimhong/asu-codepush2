import React, { PureComponent } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import {
  removeMinusFromString,
  createMealAmountString,
  createMealBalanceString
} from "../utility";

const BORDER_COLOR = "rgb(203, 203, 203)";
const MAROON = "rgb(212, 0, 77)";

export default class AllTransactions extends PureComponent {
  state = {
    rows: null
  };

  componentDidMount() {
    this.setState({ rows: this._renderRows() });
  }

  _renderRows = () => {
    return this.props.navigation.state.params.data.map((v, i, a) => {
      const isMeal = v.type === "meal";
      const amount = isMeal
        ? createMealAmountString(v.amount)
        : Number(removeMinusFromString(v.amount)).toFixed(2);
      const balance = isMeal
        ? createMealAmountString(v.balance)
        : Number(removeMinusFromString(v.balance)).toFixed(2);
      return (
        <View
          style={[
            styles.middleBoxContainer,
            { width: responsiveWidth(86), paddingVertical: responsiveWidth(4) }
          ]}
          key={i}
        >
          <Text style={styles.middleBoxContainerHeaderText}>
            {v.description}
          </Text>
          <View style={styles.middleBoxContainerBox}>
            <Text style={styles.middleBoxText}>{v.time}</Text>
          </View>
          <View style={styles.bottomBox}>
            <View style={styles.middleBoxContainerBox}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: responsiveWidth(86)
                }}
              >
                <Text style={[styles.middleBoxText]}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "black",
                      fontFamily: "Roboto"
                    }}
                  >
                    Amount:{" "}
                  </Text>
                  {amount}
                </Text>
                <Text style={[styles.middleBoxText]}>
                  <Text style={{ fontWeight: "bold", fontFamily: "Roboto", color: "black" }}>
                    Type:{" "}
                  </Text>{" "}
                  {isMeal ? "Meal Plan" : "Maroon & Gold"}
                </Text>
              </View>
              <Text style={[styles.middleBoxText]}>
                <Text style={{ fontWeight: "bold", fontFamily: "Roboto", color: "black" }}>
                  Balance:{" "}
                </Text>
                {balance}
              </Text>
            </View>
          </View>
        </View>
      );
    });
  };

  render() {
    const { whichTitle } = this.props.navigation.state.params;
    return (
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.topBox}>
            <View style={styles.topBoxFirst}>
              <Image
                source={require("../../assets/dining/meal-plan-icon.png")}
                style={styles.imageIcon}
                resizeMode="stretch"
              />
              <Text style={styles.topBoxHeaderText}> {whichTitle}</Text>
            </View>
            <View style={styles.topBoxSecond}>
              <Text style={styles.topBoxText}>Total: </Text>
              <View style={styles.topBoxSecondNumberBox}>
                <Text style={styles.topBoxSecondNumberBoxText}>{120}</Text>
              </View>
            </View>
          </View>
          {this.state.rows}
          {this.state.rows}
        </View>
      </ScrollView>
    );
  }
}

AllTransactions.propTypes = {
  navigation: PropTypes.object.isRequired
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
    marginBottom: responsiveHeight(1)
  },
  topBox: {
    width: responsiveWidth(94),
    paddingVertical: responsiveWidth(5),
    paddingHorizontal: responsiveWidth(5),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgb(60, 60, 60)"
  },
  topBoxFirst: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  topBoxHeaderText: {
    fontSize: responsiveFontSize(1.75),
    color: "white",
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  topBoxText: {
    fontSize: responsiveFontSize(1.5),
    color: "white"
  },
  topBoxSecond: {
    flexDirection: "row",
    alignItems: "center"
  },
  topBoxSecondNumberBox: {
    backgroundColor: MAROON,
    paddingVertical: responsiveWidth(0.5),
    paddingHorizontal: responsiveWidth(1.5),
    borderRadius: 5
  },
  topBoxSecondNumberBoxText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  middleBoxContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    paddingVertical: responsiveWidth(2),
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR
  },
  middleBoxContainerHeaderText: {
    fontSize: responsiveFontSize(1.9),
    color: "black"
  },
  middleBoxText: {
    fontSize: responsiveFontSize(1.4),
    color: "black",
    paddingVertical: responsiveHeight(0.3),
    fontWeight: "200",
    fontFamily: 'Roboto',
  },
  bottomBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: responsiveHeight(1)
  },
  middleBoxContainerBox: {
    justifyContent: "space-around"
  },
  imageIcon: {
    width: responsiveWidth(8),
    height: responsiveWidth(8)
  }
});
