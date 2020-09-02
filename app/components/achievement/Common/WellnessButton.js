import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import PropTypes from "prop-types";

const { width } = Dimensions.get("window");
const GOLD = "#FDC627";
const MAROON = "#991E32";
const GREY = "#D9D9D9";
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const GREEN = "#78BE20";

const WellnessButton = ({
  onPress,
  text,
  filled = true,
  height,
  disabled = false,
  style = {},
  textStyle = {},
  theme = "default",
  size = "default",
  iconLeft = null,
  ...extraProps
}) => {
  const { containerStyles, textStyles } = getStyles({
    filled,
    disabled,
    height,
    style,
    textStyle,
    theme,
    size,
    ...extraProps,
  });

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <View style={containerStyles}>
        {iconLeft && iconLeft }
        <Text style={textStyles}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

WellnessButton.propTypes = {
  text: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  height: PropTypes.number,
  style: PropTypes.object.isRequired,
  textStyle: PropTypes.object,
  filled: PropTypes.bool,
  disabled: PropTypes.bool,
  theme: PropTypes.oneOf(["default", "maroon", "gold", "grey"]),
  // size: PropTypes.oneOf['default', 'small', 'large']
};

const getStyles = ({
  filled,
  disabled,
  height,
  style,
  textStyle,
  theme,
  ...extraProps
}) => {
  const containerStyles = [styles.constainerDefault];
  const textStyles = [styles.textDefault];

  switch (theme) {
    case "maroon":
      containerStyles.push(
        filled ? styles.containerMaroonFilled : styles.containerMaroonOutlined
      );
      textStyles.push(
        filled ? styles.textMaroonFilled : styles.textMaroonOutlined
      );
      break;
    case "gold":
      containerStyles.push(
        filled ? styles.containerGoldFilled : styles.containerGoldOutlined
      );
      textStyles.push(filled ? styles.textGoldFilled : styles.textGoldOutlined);
      break;
    case "grey":
      containerStyles.push(
        filled ? styles.containerGreyFilled : styles.containerGreyOutlined
      );
      textStyles.push(filled ? styles.textGreyFilled : styles.textGreyOutlined);
      break;
    case "green":
      containerStyles.push(
        filled ? styles.containerGreenFilled : styles.containerGreenOutlined
      );
      textStyles.push(
        filled ? styles.textGreenFilled : styles.textGreenOutlined
      );
      break;
    default:
      containerStyles.push(
        filled ? styles.containerGoldFilled : styles.containerGoldOutlined
      );
      textStyles.push(filled ? styles.textGoldFilled : styles.textGoldOutlined);
      break;
  }

  if (disabled) {
    containerStyles.push(styles.containerDisabled);
    textStyles.push(styles.textDisabled);
  }

  if (height) {
    style.height = height;
    style.borderRadius = height / 2;
  }
  containerStyles.push(style);
  if (textStyle) {
    textStyles.push(textStyle);
  }

  return { containerStyles, textStyles };
};

const styles = StyleSheet.create({
  // Container Styles
  constainerDefault: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 25,
    marginHorizontal: 10,
    marginVertical: 10,
    width: "25%",
  },
  containerDisabled: {
    opacity: 1,
  },
  containerMaroonFilled: {
    backgroundColor: MAROON,
    borderColor: MAROON,
  },
  containerMaroonOutlined: {
    borderWidth: 1.5,
    backgroundColor: "transparent",
    borderColor: MAROON,
  },
  containerGoldFilled: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  containerGoldOutlined: {
    borderWidth: 1.5,
    backgroundColor: "transparent",
    borderColor: GOLD,
  },
  containerGreyFilled: {
    backgroundColor: GREY,
    borderColor: GREY,
  },
  containerGreenFilled: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  containerGreyOutlined: {
    borderWidth: 1.5,
    backgroundColor: "transparent",
    borderColor: GREY,
  },

  // Text Styles
  textDefault: {
    fontSize: 14,
    fontWeight: "500",
    color: BLACK,
    fontFamily: "roboto",
  },
  textMaroonFilled: {
    color: WHITE,
  },
  textMaroonOutlined: {
    color: MAROON,
  },
  textGoldFilled: {
    color: BLACK,
  },
  textGoldOutlined: {
    color: BLACK,
  },
  textGreyFilled: {
    color: BLACK,
  },
  textGreenFilled: {
    color: BLACK,
  },
  textGreyOutlined: {
    color: BLACK,
  },
  textDisabled: {},
});

export default WellnessButton;
