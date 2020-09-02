import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Text,
  StyleSheet,
  View,
  ViewPropTypes,
  I18nManager
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";

const ViewPropTypesStyle = ViewPropTypes
  ? ViewPropTypes.style
  : View.propTypes.style;
let direction = I18nManager.isRTL ? "right" : "left";

function percentToDegrees(percent) {
  return percent * 3.6;
}

export default class ProgressCircle extends Component {
  static propTypes = {
    color: PropTypes.string,
    shadowColor: PropTypes.string,
    bgColor: PropTypes.string,
    radius: PropTypes.number.isRequired,
    borderWidth: PropTypes.number,
    percent: PropTypes.number.isRequired,
    children: PropTypes.node,
    containerStyle: ViewPropTypesStyle,
    outerCircleStyle: ViewPropTypesStyle
  };

  static defaultProps = {
    color: "#f00",
    shadowColor: "#999",
    bgColor: "#e9e9ef",
    borderWidth: 2,
    children: null,
    containerStyle: null
  };

  constructor(props) {
    super(props);
    this.state = this.getInitialStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getInitialStateFromProps(nextProps));
  }

  getInitialStateFromProps(props) {
    const percent = Math.max(Math.min(100, props.percent), 0);
    const needHalfCircle2 = percent > 50;
    let halfCircle1Degree;
    let halfCircle2Degree;
    if (needHalfCircle2) {
      halfCircle1Degree = 180;
      halfCircle2Degree = percentToDegrees(percent);
    } else {
      halfCircle1Degree = percentToDegrees(percent);
      halfCircle2Degree = 0;
    }

    return {
      halfCircle1Degree,
      halfCircle2Degree,
      halfCircle2Styles: {
        backgroundColor: needHalfCircle2 ? props.color : props.shadowColor
      }
    };
  }

  renderHalfCircle(rotateDegrees, halfCircleStyles) {
    const { radius, color } = this.props;
    const key = I18nManager.isRTL ? "right" : "left";
    return (
      <View
        style={[
          styles.leftWrap,
          {
            width: radius,
            height: radius * 2
          }
        ]}
      >
        <View
          style={[
            styles.halfCircle,
            {
              width: radius,
              height: radius * 2,
              borderRadius: radius,
              overflow: "hidden",
              transform: [
                { translateX: radius / 2 },
                { rotate: `${rotateDegrees}deg` },
                { translateX: -radius / 2 }
              ],
              backgroundColor: color,
              ...halfCircleStyles
            }
          ]}
        />
      </View>
    );
  }

  renderInnerCircle() {
    const radiusMinusBorder = this.props.radius - this.props.borderWidth;
    return (
      <View
        style={[
          styles.innerCircle,
          {
            width: radiusMinusBorder * 2,
            height: radiusMinusBorder * 2,
            borderRadius: radiusMinusBorder,
            backgroundColor: this.props.bgColor,
            ...this.props.containerStyle
          }
        ]}
      >
        <Text
          style={[
            styles.displayBigText,
            {
              fontSize: !this.props.mainPage
                ? responsiveFontSize(4.7)
                : responsiveFontSize(3.5)
            }
          ]}
        >
          {this.props.percent}%
        </Text>
        {!this.props.mainPage ? (
          <Text style={[styles.displaySmallText]}>COMPLETE</Text>
        ) : null}
      </View>
    );
  }

  render() {
    const {
      halfCircle1Degree,
      halfCircle2Degree,
      halfCircle2Styles
    } = this.state;
    return (
      <View
        style={[
          styles.outerCircle,
          {
            width: this.props.radius * 2 + this.props.radius / 6,
            height: this.props.radius * 2 + this.props.radius / 6,
            borderRadius: this.props.radius + this.props.radius / 6,
            backgroundColor: "white",
            ...this.props.outerCircleStyle
          }
        ]}
      >
        <View
          style={[
            styles.outerCircle,
            {
              width: this.props.radius * 2,
              height: this.props.radius * 2,
              shadowOpacity: !this.props.mainPage ? 0.8 : 0,
              borderRadius: this.props.radius,
              backgroundColor: this.props.shadowColor,
              ...this.props.outerCircleStyle
            }
          ]}
        >
          {this.renderHalfCircle(halfCircle1Degree)}
          {this.renderHalfCircle(halfCircle2Degree, halfCircle2Styles)}
          {this.renderInnerCircle()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  outerCircle: {
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "#9f9f9f",
    elevation: 8,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8
  },
  innerCircle: {
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  leftWrap: {
    position: "absolute",
    top: 0,
    [`${direction}`]: 0
  },
  halfCircle: {
    position: "absolute",
    top: 0,
    left: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  displayBigText: {
    fontWeight: "300",
    fontFamily: 'Roboto',
    color: "black"
  },
  displaySmallText: {
    fontWeight: "500",
    fontFamily: 'Roboto',
    color: "black",
    fontSize: responsiveFontSize(1.65)
  }
});
