import React, { PureComponent } from "react";
import {
  StyleSheet,
  Dimensions,
  Platform,
  View,
  TouchableOpacity
} from "react-native";

const IS_IOS = Platform.OS === "ios";
const { width: viewportWidth, height: viewportHeight } = Dimensions.get(
  "window"
);

function wp(percentage) {
  const value = (percentage * viewportWidth) / 100;
  return Math.round(value);
}

const slideHeight = viewportHeight * 0.6;
const slideWidth = wp(90);
const itemHorizontalMargin = wp(0.2);

export const sliderWidth = viewportWidth;
export const itemWidth = slideWidth + itemHorizontalMargin * 2;

const entryBorderRadius = 5;

/**
 * Slider item that is used to populate the Live Cards on the
 * Home Screen
 */
export default class SliderEntry extends PureComponent {
  render() {
    if (this.props.card) {
      const Comp = this.props.card;
      return (
        <TouchableOpacity activeOpacity={1} style={styles.slideInnerContainer}>
          <View style={styles.shadow} />
          <View style={{ flex: 1 }}>
            <Comp {...this.props} />
          </View>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  slideInnerContainer: {
    width: slideWidth,
    flex: 1,
    height: slideHeight,
    backgroundColor: "white",
    paddingHorizontal: 0,
    shadowColor: "black",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    borderBottomLeftRadius: entryBorderRadius,
    borderBottomRightRadius: entryBorderRadius
  },
  shadow: {},
  textContainer: {
    justifyContent: "center",
    paddingTop: 20 - entryBorderRadius,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderBottomLeftRadius: entryBorderRadius,
    borderBottomRightRadius: entryBorderRadius
  },
  textContainerEven: {
    backgroundColor: "black"
  },
  title: {
    color: "black",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
    fontFamily: "Roboto"
  },
  titleEven: {
    color: "white"
  },
  subtitle: {
    marginTop: 6,
    color: "grey",
    fontSize: 12,
    fontStyle: "italic"
  },
  subtitleEven: {
    color: "rgba(255, 255, 255, 0.7)"
  }
});
