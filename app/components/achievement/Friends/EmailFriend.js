import React from "react";
import { View, TouchableOpacity, Linking } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics.js";
/**
 * Button to be placed allowing users to send friend requests
 * to other users, given an asurite.
 */
export class EmailFriend extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    asurite: null
  };

  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.refs.analytics.sendData({
            "action-type": "view",
            "target": "Email",
            "starting-screen": this.props.previousScreen?this.props.previousScreen:null,
            "starting-section": this.props.previousSection?this.props.previousSection:null, 
            "resulting-screen": "email-friend", 
            "resulting-section": null,
            "target-id":this.props.asurite.toString(),
            "action-metadata":{
              "target-id":this.props.asurite.toString(),
            }
          });
          tracker.trackEvent("Click", "EmailFriend");
          Linking.openURL("mailto:" + this.props.asurite + "@asu.edu");
        }}
        accessibilityLabel="Email friend"
        accessibilityRole="button"
      >
        <Analytics ref="analytics" />
        <View
          style={{
            height: responsiveWidth(10),
            width: responsiveWidth(10),
            borderRadius: responsiveWidth(5),
            borderColor: "#B1B1B1",
            borderWidth: 3,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Icon
            name={"envelope-o"}
            size={responsiveFontSize(2.6)}
            color="#B1B1B1"
            style={{ backgroundColor: "transparent" }}
          />
        </View>
      </TouchableOpacity>
    );
  }
}
