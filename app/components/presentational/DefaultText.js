import React, { PureComponent } from "react";
import { Text, StyleSheet } from "react-native";

export class DefaultText extends PureComponent {
  render() {
    //console.log('this is the style passed down ', this.props.style)
    return (
      <Text style={[styles.myText, this.props.style]}>
        {this.props.children}
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  myText: {
    // fontFamily: "Futura",
    fontFamily: "Roboto",
    color: "black"
  }
});
