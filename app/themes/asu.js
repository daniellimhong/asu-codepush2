import React, { Component } from "react";
import { Platform, StyleSheet, Text, View, Button } from "react-native";

// =====================================================
// PALETTE
// official asu colors

const palette = {
  maroon: "#8c1d40",
  gold: "#ffc627",
  green: "#78be20",
  blue: "#00a3e0",
  orange: "#ff7f32",
  dark_grey: "#5c6670",
  grey: "#a3b1be",
  light_grey: "#edf2f5",
  black: "#2a2a2a",
  white: "#ffffff",
  red: "#e42222",
  none: "rgba(0,0,0,0.0)" // Transparent color
};

// =====================================================
// COMPONENTS
// styles for specific components: call to action, buttons, headers

const actions = {
  backgroundClick: palette.white
};

const asu = StyleSheet.create({
  text: {
    color: palette.maroon
  },
  button: {
    borderRadius: 4,
    padding: "0.375em 1.1875em"
  },
  button_large: {
    borderRadius: 4,
    padding: "0.65em 1.5em"
  },
  cta_primary: {
    // call to action
    backgroundColor: palette.maroon
  },
  cta_secondary: {
    backgroundColor: palette.lgrey
  },
  cta_RFI: {
    backgroundColor: palette.gold
  },
  cta_EOP: {
    backgroundColor: palette.blue
  }
});

// =====================================================
// BUG FIXES
// corrections to

const bug_fix = StyleSheet.create({
  ios_image_container: {
    // random position colors effecting heros
    position: "absolute",
    backgroundColor: palette.none
  },
  ios_default_text: {
    // default ios text has a default backgroundColor of white
    color: palette.black,
    backgroundColor: palette.none
  }
});

export { palette, actions, asu };
