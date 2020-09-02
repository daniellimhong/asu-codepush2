import React from "react";
import {
  View,
  Text,
  StyleSheet,
  UIManager,
  LayoutAnimation
} from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";
import { commonStyles } from "./CommonStyles";

let CustomLayoutAnimation = {
  duration: 200,
  create: {
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.opacity
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut //Change Type
  }
};

export class ReservationInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    name: "",
    date: "",
    time: "",
    room: ""
  };

  lineItem = (title, info) => {
    return (
      <View
        style={{
          flexDirection: "row",
          marginTop: responsiveHeight(1),
          marginHorizontal: responsiveWidth(2)
        }}
      >
        <View style={{flex: 1}}>
          <Text style={[commonStyles.bolded,{fontSize: responsiveFontSize(1.8)}]}>{title}: </Text>
        </View>
        <View style={{ flex: 3, flexDirection: "row", flexWrap: "wrap"}}>
          <Text style={[{fontSize: responsiveFontSize(1.8)}]}>{info}</Text>
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={{marginHorizontal: responsiveWidth(2)}}>
        {
          this.props.showTopper ? (
            <View style={{ marginBottom: responsiveHeight(1) }}>
              <Text style={{ textAlign: "center" }}>
                You have successfully reserved the following room:
              </Text>
            </View>
          ) : null
        }

        {this.lineItem("Library", this.props.libraryName)}
        {this.lineItem("Room", this.props.roomName)}
        {this.lineItem("Date", this.props.date)}
        {this.lineItem("Time", this.props.time)}
      </View>
    );
  }
}
