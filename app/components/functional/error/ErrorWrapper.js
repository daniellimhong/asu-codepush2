import React from "react";
import { View, Platform } from "react-native";
import { Crashlytics } from "react-native-fabric";
import { ErrorFiller } from "./ErrorFiller";

export class ErrorWrapper extends React.Component {
  state = {
    error: false
  };

  componentDidCatch(error, info) {
    if (Platform.OS === "ios") {
      Crashlytics.recordError(error.toString());
    } else {
      Crashlytics.logException(error.toString());
    }
    this.setState({
      error: true
    });
  }

  render() {
    if (!this.state.error) {
      return <View style={{ flex: 1 }}>{this.props.children}</View>;
    } else {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <ErrorFiller />
        </View>
      );
    }
  }
}
