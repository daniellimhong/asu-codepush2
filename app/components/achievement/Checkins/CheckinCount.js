import React from "react";
import { View, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { getCheckinCount, getAdminSettings } from "../../../Queries";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import moment from "moment";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { DefaultText as Text } from "../../presentational/DefaultText.js";

/**
 * Button to be placed allowing users to view number of
 * friends checked in to an event
 */
class CheckinCountX extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    attendees: [],
    event_id: null
  };

  render() {
    let { navigate } = this.props.navigation;
    if (this.props.attendees.length > 0) {
      return (
        <TouchableOpacity
          onPress={() => {
            this.refs.analytics.sendData({
              "eventtime": new Date().getTime(),
              "action-type": "click",
              "target": "Checkin Count",
              "starting-screen": this.props.previousScreen?this.props.previousScreen:null,
              "starting-section": this.props.previousSection?this.props.previousSection:null,
              "resulting-screen": "attendees-list", 
              "resulting-section": null
            });
            tracker.trackEvent("Click", "CheckinCount_FriendSet");
            navigate("FriendSet", { attendees: this.props.attendees });
          }}
        >
          <Analytics ref="analytics" />
          <View
            style={{
              paddingHorizontal: responsiveWidth(4),
              paddingVertical: responsiveWidth(0.5),
              marginRight: responsiveWidth(5),
              borderRadius: responsiveWidth(1),
              backgroundColor: "#931E42",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              width: responsiveWidth(16)
            }}
          >
            <Text
              style={{
                color: "white",
                padding: responsiveWidth(1)
              }}
            >
              {this.props.attendees.length}
            </Text>
            <Icon name={"check"} size={responsiveFontSize(2)} color="white" />
          </View>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  }
}

/**
 * Wrapper component for the checkin count, so we only make the appsync calls
 * for checkins if the admin settings say that we can.
 *
 * Will provide an "out" in case we run into any checkin count trouble.
 */
class CheckinCountAdminX extends React.PureComponent {
  static defaultProps = {
    checkinCounts: false,
    data: {},
    attendees: [],
    event_id: null,
    admin_settings: {}
  };

  buildCheckinWrapper = () => {
    let CheckinCountWrapper = AppSyncComponent(CheckinCountX, getCheckinCount);
    return <CheckinCountWrapper {...this.props} />;
  };

  render() {
    if (this.props.admin_settings && this.props.admin_settings.checkinCounts) {
      return <View>{this.buildCheckinWrapper()}</View>;
    } else {
      return null;
    }
  }
}

/**
 * Wrapper component to only initialize the checkin count if the time is right.
 * 15 minutes before
 */
export class CheckinCount extends React.PureComponent {
  static defaultProps = {
    data: {},
    attendees: [],
    event_id: null
  };

  buildCheckinAdmin = () => {
    let CheckinCountAdmin = AppSyncComponent(
      CheckinCountAdminX,
      getAdminSettings
    );
    return <CheckinCountAdmin {...this.props} />;
  };

  render() {
    // console.log(this.props.data, moment(this.props.data.starttime).format("x"));
    // If we get data
    // and there is a start time (unixTime or starttime)
    // and the time has passed 15 minutes before the starttime
    if (
      this.props.data &&
      ((this.props.data.unixTime &&
        this.props.data.unixTime < new Date().getTime() - 900000) ||
        (this.props.data.starttime &&
          moment(this.props.data.starttime).format("x") <
            new Date().getTime() - 900000))
    ) {
      return <View>{this.buildCheckinAdmin()}</View>;
    } else {
      return null;
    }
  }
}
