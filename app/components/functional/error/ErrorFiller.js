import React from "react";
import { View, Text } from "react-native";
import { responsiveFontSize } from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome";

export class ErrorFiller extends React.Component {
  render() {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          backgroundColor: "#efefef"
        }}
      >
        <View
          style={{
            marginVertical: 20
          }}
        >
          <Icon
            name="exclamation-triangle"
            color="#b3b3b3"
            size={responsiveFontSize(6)}
          />
        </View>
        <Text
          style={{
            color: "#b3b3b3",
            fontSize: responsiveFontSize(2),
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Roboto"
          }}
        >
          Sorry, but there was an error loading this section. Feel free to let
          us know via the feedback section from the app menu!
        </Text>
      </View>
    );
  }
}
