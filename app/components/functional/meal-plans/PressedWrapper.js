import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback
} from "react-native";
import PropTypes from "prop-types";

export default class PressedWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.animatedValue = new Animated.Value(1);
    this.state = {
      disabled: false
    };
  }

  handlePressIn = () => {
    this.setState({ disabled: true });
    Animated.spring(this.animatedValue, {
      toValue: 0.9
    }).start();
  };

  handlePressOut = () => {
    Animated.spring(this.animatedValue, {
      toValue: 1,
      friction: 8,
      tension: 40
    }).start();
    setTimeout(() => {
      this.setState({ disabled: false });
    }, 160);
  };

  pressHandler = () => {
    if (this.props.onPress) {
      setTimeout(() => {
        this.setState({ disabled: false });
        this.props.onPress();
      }, 160);
    }
  };

  render() {
    return (
      <TouchableWithoutFeedback
        onPressIn={this.handlePressIn}
        onPressOut={this.handlePressOut}
        onPress={this.pressHandler}
        accessibilityLabel="button"
        disabled={this.state.disabled}
      >
        <Animated.View
          style={[
            this.props.style,
            { transform: [{ scale: this.animatedValue }] }
          ]}
        >
          {this.props.children}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}

PressedWrapper.propTypes = {
  onPress: PropTypes.func,
  style: PropTypes.object
};

const styles = StyleSheet.create({
  container: {}
});
