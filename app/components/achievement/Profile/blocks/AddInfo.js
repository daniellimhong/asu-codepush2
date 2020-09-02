import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Analytics from "../../../functional/analytics";
import { tracker } from "../../google-analytics.js";
export class AddInfo extends React.PureComponent {
  static defaultProps = {
    type: null,
    details: null,
    asurite: null
  };
  onPressHandler = () => {
    const { asurite, type, details } = this.props;
    const { navigate } = this.props.navigation;
    let analyticsPay = {
      eventName: "Profile_AddInfo",
      eventType: "click",
      asurite: asurite,
      addnData: {
        item: type
      }
    };
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": this.props.previousScreen,
      "starting-section": this.props.previousSection, 
      "target": "Add Button",
      "resulting-screen": this.props.resultingScreen,
      "resulting-section": null,
      "action-metadata":{
        "item": type
      }
    });
    tracker.trackEvent("Click", `Profile_AddInfo - ${analyticsPay.addnData}`);
    navigate("EditBlock", {
      type: type,
      details: details,
      asurite: asurite,
      roles: ["staff"]
    });
  };
  render() {
    return (
      <TouchableOpacity
        style={[styles.addIcon]}
        onPress={() => this.onPressHandler()}
      >
        <Analytics ref="analytics" />
        <MaterialIcons
          name="add-circle-outline"
          size={responsiveFontSize(3.3)}
          style={{ backgroundColor: "transparent", borderColor: "black" }}
        />
      </TouchableOpacity>
    );
  }
}
const styles = StyleSheet.create({
  addIcon: {
    flex: 1,
    alignItems: "flex-end",
    marginHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(2)
  }
});