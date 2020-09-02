import React, { PureComponent } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome";
import PressedWrapper from "../PressedWrapper";

const bulletIcon = <Icon name="circle" size={responsiveFontSize(0.5)} />;

export default class MealPlansBuyItem extends PureComponent {
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
      <View style={styles.container}>
        <View style={styles.itemContainer}>
          <View style={styles.boxLeft}>
            <Text style={styles.itemWhiteText}>Fall 2019</Text>
            <Text style={styles.itemWhiteText}>25 Block Plan</Text>
            <Text style={styles.itemWhiteBoldText}>$333.00</Text>
          </View>
          <View style={styles.boxRight}>
            <View style={styles.row}>
              <View style={styles.bullet}>
                <Text>{"\u2022" + " "}</Text>
              </View>
              <View style={styles.bulletText}>
                <Text>
                  <Text style={styles.itemBlackText}>
                    25 Meals per semester
                  </Text>
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.bullet}>
                <Text>{"\u2022" + " "}</Text>
              </View>
              <View style={styles.bulletText}>
                <Text>
                  <Text style={styles.itemBlackText}>
                    Use at our residential restaurants
                  </Text>
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.bullet}>
                <Text>{"\u2022" + " "}</Text>
              </View>
              <View style={styles.bulletText}>
                <Text>
                  <Text style={styles.itemBlackText}>
                    $50 M&G to use at any of our dining locations!
                  </Text>
                </Text>
              </View>
            </View>
            <PressedWrapper
              style={{ marginLeft: responsiveWidth(3), width: "55%" }}
            >
              <View style={styles.myButton}>
                <Text style={styles.buttonText}>Buy Now</Text>
              </View>
            </PressedWrapper>
          </View>
        </View>
      </View>
    );
  }
}

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
    elevation: 10
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  boxLeft: {
    flex: 1,
    height: "100%",
    backgroundColor: "rgb(162, 0, 68)",
    justifyContent: "center",
    alignItems: "center",
    padding: responsiveWidth(6),
    height: responsiveHeight(20)
  },
  boxRight: { flex: 1, padding: responsiveWidth(4) },
  itemWhiteText: {
    fontSize: responsiveFontSize(1.9),
    color: "white"
  },
  itemWhiteBoldText: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "800",
    fontFamily: 'Roboto',
    color: "white"
  },
  itemBlackText: {
    fontSize: responsiveFontSize(1.3),
    color: "black",
    justifyContent: "center",
    alignItems: "center"
  },
  column: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    flex: 1
  },
  bullet: {
    width: responsiveWidth(3),
    justifyContent: "center",
    alignItems: "center"
  },
  bulletText: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  myButton: {
    borderWidth: responsiveWidth(0.2),
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: responsiveHeight(0.5),
    paddingHorizontal: responsiveWidth(1)
  },
  buttonText: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: "bold",
    fontFamily: "Roboto"
  }
});
