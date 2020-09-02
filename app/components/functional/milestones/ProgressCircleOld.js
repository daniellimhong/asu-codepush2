import React, { PureComponent } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";

const CIRCLE_DIAMETER = responsiveHeight(23);
const OUTER_CIRCLE_DIAMETER = CIRCLE_DIAMETER + CIRCLE_DIAMETER / 15;
const CIRCLE_GREY = "#a3a3a3";
const CIRCLE_COLOR = "#c6b323";
const CIRCLE_DIAMETER_MAIN_PAGE = responsiveHeight(13);
const OUTER_CIRCLE_DIAMETER_MAIN_PAGE =
  CIRCLE_DIAMETER_MAIN_PAGE + OUTER_CIRCLE_DIAMETER / 25;

export default class ProgressCircle extends PureComponent {
  state = {
    circleDiameter: !this.props.mainPage
      ? CIRCLE_DIAMETER
      : CIRCLE_DIAMETER_MAIN_PAGE,
    outerCircleDiameter: !this.props.mainPage
      ? OUTER_CIRCLE_DIAMETER
      : OUTER_CIRCLE_DIAMETER_MAIN_PAGE,
    textBigSize: !this.props.mainPage
      ? responsiveFontSize(5.9)
      : responsiveFontSize(3.9),
    textSmallSize: !this.props.mainPage
      ? responsiveFontSize(1.7)
      : responsiveFontSize(1.1)
  };

  propStyle = (percent, base_degrees) => {
    const rotateBy = base_degrees + percent * 3.6;
    return {
      transform: [{ rotateZ: `${rotateBy}deg` }]
    };
  };

  renderThirdLayer = percent => {
    if (percent > 50) {
      return (
        <View
          style={[
            styles.secondProgressLayer,
            this.propStyle(percent - 50, 45),
            {
              width: this.state.circleDiameter,
              height: this.state.circleDiameter,
              borderWidth: this.state.circleDiameter / 10,
              borderRightColor: this.props.circleColor,
              borderTopColor: this.props.circleColor,
              borderRadius: this.state.circleDiameter / 2
            }
          ]}
        />
      );
    } else {
      return (
        <View
          style={[
            styles.offsetLayer,
            {
              width: this.state.circleDiameter,
              height: this.state.circleDiameter,
              borderWidth: this.state.circleDiameter / 10,
              borderRadius: this.state.circleDiameter / 2
            }
          ]}
        />
      );
    }
  };

  render() {
    let firstProgressLayerStyle;
    if (this.props.percent > 50) {
      firstProgressLayerStyle = this.propStyle(50, -135);
    } else {
      firstProgressLayerStyle = this.propStyle(this.props.percent, -135);
    }
    return (
      <View
        style={[
          styles.containerOutside,
          {
            width: this.state.outerCircleDiameter,
            height: this.state.outerCircleDiameter,
            borderWidth: this.state.outerCircleDiameter / 10,
            borderRadius: this.state.outerCircleDiameter / 2
          }
        ]}
      >
        <View
          style={[
            styles.container,
            {
              width: this.state.circleDiameter,
              height: this.state.circleDiameter,
              borderWidth: this.state.circleDiameter / 10,
              borderRadius: this.state.circleDiameter / 2
            }
          ]}
        >
          <View
            style={[
              styles.firstProgressLayer,
              firstProgressLayerStyle,
              {
                borderColor: "blue",
                borderRightColor: this.props.circleColor,
                borderTopColor: this.props.circleColor,
                width: this.state.circleDiameter,
                height: this.state.circleDiameter,
                borderWidth: this.state.circleDiameter / 10,
                borderRadius: this.state.circleDiameter / 2
              }
            ]}
          />
          {this.renderThirdLayer(this.props.percent)}
          <View style={styles.display}>
            <Text
              style={[
                styles.displayBigText,
                { fontSize: this.state.textBigSize }
              ]}
            >
              {this.props.percent}%
            </Text>
            <Text
              style={[
                styles.displaySmallText,
                { fontSize: this.state.textSmallSize }
              ]}
            >
              COMPLETE
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerOutside: {
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "#9f9f9f",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8
  },
  container: {
    borderColor: CIRCLE_GREY,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    color: "transparent"
  },
  firstProgressLayer: {
    position: "absolute",
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: CIRCLE_COLOR,
    borderTopColor: CIRCLE_COLOR,
    transform: [{ rotateZ: "-135deg" }],
    backgroundColor: "transparent",
    color: "transparent"
  },
  secondProgressLayer: {
    position: "absolute",
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: CIRCLE_COLOR,
    borderTopColor: CIRCLE_COLOR,
    transform: [{ rotateZ: "45deg" }],
    backgroundColor: "transparent",
    color: "transparent"
  },
  offsetLayer: {
    position: "absolute",
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: CIRCLE_GREY,
    borderTopColor: CIRCLE_GREY,
    transform: [{ rotateZ: "-135deg" }],
    backgroundColor: "transparent",
    color: "transparent"
  },
  display: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    color: "transparent"
  },
  displayBigText: {
    fontWeight: "300",
    fontFamily: 'Roboto',
    color: "black"
  },
  displaySmallText: {
    fontWeight: "500",
    fontFamily: 'Roboto',
    color: "black"
  }
});
