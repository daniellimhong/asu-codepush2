import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Button from "apsl-react-native-button";

import TransitionView from "../../universal/TransitionView";
import { DefaultText as Text } from "../../presentational/DefaultText.js";

export class CanvasNotif extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const sI = this.props.scheduleItem;
    return (
      <View
        style={[styles.container, { padding: responsiveHeight(sI ? 1 : 3) }]}
      >
        <TransitionView index={3}>
          <Text style={[styles.text, { textAlign: "center" }]}>
            Canvas authorization incomplete. Please authorize Canvas to access
            more course information.
          </Text>
        </TransitionView>
        <TransitionView index={4}>
          <TouchableOpacity
            style={styles.canvasAuthButton}
            onPress={() =>
              this.props.this.setState({
                displayCanvasModal: true
              })
            }
          >
            <Text style={styles.textAlt}>Allow Canvas Access</Text>
          </TouchableOpacity>
        </TransitionView>
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFC627",
    padding: responsiveHeight(3)
  },
  canvasAuthButton: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 30,
    marginTop: responsiveHeight(1),
    paddingHorizontal: responsiveHeight(2),
    paddingVertical: responsiveHeight(1)
  },
  text: {
    color: "black",
    fontSize: responsiveFontSize(1.5)
    // textAlign: "center"
  },
  textAlt: {
    color: "black",
    fontSize: responsiveFontSize(1.4),
    textAlign: "center"
  }
});
