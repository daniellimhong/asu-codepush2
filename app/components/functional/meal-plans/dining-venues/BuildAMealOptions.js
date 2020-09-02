import React, { PureComponent } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome";

const downIcon = <Icon name="sort-down" />;
const upIcon = <Icon name="sort-up" />;

export default class BuildAMealOptions extends PureComponent {
  state = {
    menuOpen: false,
    mealMenuOpen: false
  };

  _renderItems = dataToRender => {
    if (this.state.menuOpen) {
      return dataToRender.map((v, i) => {
        const showArrow =
          i === 0 ? <Text style={styles.menuText}>{downIcon}</Text> : null;
        return (
          <TouchableOpacity
            style={styles.menuItemsBox}
            onPress={() => {
              this.props.setWhich(v), this.setState({ menuOpen: false });
            }}
            key={i}
          >
            <Text style={styles.menuText}>{v} </Text>
            {showArrow}
          </TouchableOpacity>
        );
      });
    } else {
      return (
        <TouchableOpacity
          style={styles.menuItemsBox}
          onPress={() => this.setState({ menuOpen: true })}
        >
          <Text style={styles.menuText}>{dataToRender[0]} </Text>
          <Text style={styles.menuText}>{downIcon}</Text>
        </TouchableOpacity>
      );
    }
  };

  _renderMealItems = dataToRender => {
    if (this.state.mealMenuOpen) {
      return dataToRender.map((v, i) => {
        const showArrow =
          i === 0 ? <Text style={styles.menuText}>{downIcon}</Text> : null;
        return (
          <TouchableOpacity
            style={styles.menuItemsBox}
            onPress={() => {
              this.props.setMeal(v.mealPeriod),
                this.setState({ mealMenuOpen: false });
            }}
            key={i}
          >
            <Text style={styles.menuText}>{v.mealPeriod} </Text>
            {showArrow}
          </TouchableOpacity>
        );
      });
    } else {
      return (
        <TouchableOpacity
          style={styles.menuItemsBox}
          onPress={() => this.setState({ mealMenuOpen: true })}
        >
          <Text style={styles.menuText}>
            {dataToRender.length > 0 ? dataToRender[0].mealPeriod : ""}{" "}
          </Text>
          <Text style={styles.menuText}>{downIcon}</Text>
        </TouchableOpacity>
      );
    }
  };

  render() {
    // console.log("buildAMealOptions props ", this.props);
    const menuHeight = this.state.menuOpen
      ? responsiveHeight(2.3 * this.props.arrayOfWhich.length)
      : responsiveHeight(3.5);
    const mealMenuHeight = this.state.mealMenuOpen
      ? responsiveHeight(3 * this.props.meals.length)
      : responsiveHeight(3.5);
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>Todays Menu</Text>
        <View style={styles.rowsContainer}>
          <View style={{ flex: 1, marginRight: responsiveWidth(2) }}>
            <View
              style={[
                styles.rowsBox,
                { width: "100%", height: mealMenuHeight }
              ]}
            >
              <View style={styles.rowsBoxItem}>
                {this._renderMealItems(this.props.meals)}
              </View>
            </View>
          </View>
          <View style={{ flex: 0.6, marginRight: responsiveWidth(2) }}>
            <View
              style={[
                styles.rowsBox,
                {
                  width: "100%",
                  height: menuHeight,
                  justifyContent: "center",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  flexDirection: "column"
                }
              ]}
            >
              {this._renderItems(this.props.arrayOfWhich)}
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.rowsBox,
              {
                flex: 1,
                justifyContent: "center",
                marginRight: 0,
                height: responsiveHeight(3.5)
              }
            ]}
            onPress={() => this.props.setModalVisible(true, "foodPreference")}
          >
            <Text style={styles.menuText}>Preferences</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

BuildAMealOptions.propTypes = {
  setWhich: PropTypes.func,
  setMeal: PropTypes.func,
  meals: PropTypes.array,
  arrayOfWhich: PropTypes.array,
  setModalVisible: PropTypes.func
};

const styles = StyleSheet.create({
  container: { width: "100%", justifyContent: "center", alignItems: "center" },
  titleText: {
    fontWeight: "bold",
    fontSize: responsiveFontSize(1.5),
    paddingVertical: responsiveHeight(1),
    color: "black",
    fontFamily: "Roboto"
  },
  rowsContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  rowsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "black",
    paddingHorizontal: responsiveWidth(1),
    paddingVertical: responsiveHeight(0.5),
    marginRight: responsiveWidth(0),
    height: responsiveHeight(3)
  },
  rowsBoxItem: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%"
  },
  boxText: {
    color: "black",
    fontSize: responsiveFontSize(1.5)
  },
  menuItemsBox: {
    flexDirection: "row",
    width: "80%",
    justifyContent: "space-between",
    paddingVertical: responsiveHeight(0.1)
  },
  lastBox: {
    width: "100%",
    alignItems: "flex-end",
    paddingVertical: responsiveHeight(1)
  },
  menuText: {
    color: "black",
    fontSize: responsiveFontSize(1.4)
  }
});
