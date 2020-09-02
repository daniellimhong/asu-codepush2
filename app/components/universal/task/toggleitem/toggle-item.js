import React, { Component } from "react";

import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  Image
} from "react-native";

import { palette } from "../../../../themes/asu";

export default class ToggleItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      toggled: false
    };
  }

  toggleState = () => {
    const stateCopy = Object.assign({}, this.state);

    this.setState(
      {
        toggled: !stateCopy.toggled
      },
      () => console.log("state:", this.state)
    );
  };

  render() {
    var imageOff = this.props.imageOff
      ? this.props.imageOff
      : require("./toggleItem_default_off.png");
    var imageOn = this.props.imageOn
      ? this.props.imageOn
      : require("./toggleItem_default_on.png");

    const size = 35;

    const styles = StyleSheet.create({
      container: {
        width: size,
        height: size
      },
      iconContainer: {
        width: 35,
        height: 35,
        borderColor: "#747474",
        borderRadius: 3,
        borderWidth: 3
      },
      icon: {
        tintColor: "#747474",
        width: 30,
        height: 30
      }
    });

    if (this.state.toggled) {
      return (
        <TouchableOpacity
          onPress={this.toggleState}
          underlayColor={palette.none}
          activeOpacity={1}
          style={styles.container}
        >
          <Image source={imageOn} style={[styles.icon]} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={this.toggleState}
        underlayColor={palette.none}
        activeOpacity={1}
        style={{ width: size, height: size }}
      >
        <Image source={imageOff} style={styles.icon} />
      </TouchableOpacity>
    );
  }
}
