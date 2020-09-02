import React from "react";
import {
  View,
  Text,
  StyleSheet
} from "react-native";
import {
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { CalModalButtons } from "./Buttons";

export class BaseView extends React.Component {
  constructor(props) {
    super(props);
  }

  openView = (v) => {
    if( v === 1 ) {
      this.props.viewChange("Add Event")
    } else {
      this.props.viewChange("Add Calendar")
    }
  }

  render() {
    return (
      <View style={{width: "100%", marginHorizontal: 0}}>
        <Text
          style={styles.textContainer}
        >
          Create a custom event or
        </Text>
        <Text
          style={styles.textContainer}
        >
          add a calendar of interest
        </Text>
        <CalModalButtons btn1Text="Add Event" btn2Text="Add Calendar" btnPress={this.openView.bind(this)} />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  textContainer: {
    fontSize: responsiveFontSize(1.7),
    textAlign: "center"
  }
});
