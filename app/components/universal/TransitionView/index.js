import React, { PureComponent } from "react";
import * as Animatable from "react-native-animatable";

export default class TransitionView extends PureComponent {
  render() {
    const { index, ...rest } = this.props;
    return (
      <Animatable.View
        animation="fadeIn"
        duration={250}
        delay={index ? (index * 700) / 5 : 0}
        useNativeDriver
        {...rest}
      />
    );
  }
}
