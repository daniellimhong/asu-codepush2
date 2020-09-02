import React, { Component } from "react";
import {
  StyleSheet,
  View,
  PushNotificationIOS,
  Alert,
  Platform,
  TouchableOpacity
} from "react-native";
import PushNotification from "react-native-push-notification";
import moment from "moment";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import PropTypes from "prop-types";
import _ from "lodash";
import { AppSyncComponent } from "../../authentication/auth_components/appsync/AppSyncApp";
import { DefaultText as Text } from '../../../presentational/DefaultText.js';

import {
  removeReminder,
  getReminders
} from "../../../../Queries/ReminderQueries";

export class ReminderInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static defaultProps = {
    reminders: [],
    removeReminder: () => null,
    getReminders: () => null
  };

  //=== HELPER FUNCTIONS ===\\

  getUnixNumDOW = unixTimestamp => {
    const dowNumber = moment(unixTimestamp).format("e");
    return dowNumber;
  };

  toaster = message => {
    if( message ) {
      this.context.SetToast(message);
    }
    this.props.finishedInfo();
  };

  removeSingleNotification = () => {
    if (this.props.item.type === "academic") {
      conditionalID = this.props.item.course_id;
    } else {
      conditionalID = this.props.item.id;
    }

    let id = conditionalID + this.getUnixNumDOW(this.props.item.unixTime);

    PushNotification.cancelLocalNotifications({
      id
    });

    this.props.removeReminder({ id });
  };

  removeAllNotifications = () => {
    const { reminders, item, removeReminder } = this.props;
    for (let i = 0; i < reminders.length; i++) {
      const id = reminders[i].push_id;
      if (item.course_id === reminders[i].course_id) {
        PushNotification.cancelLocalNotifications({
          id
        });
        removeReminder({ id });
      }
    }
  };

  renderAlertModal = () => {
    if (this.props.item.type === "academic") {
      Alert.alert("Confirm removal", "Do you want to remove this reminder?", [
        {
          text: "Cancel",
          onPress: () => {
            this.toaster()
            return false;
          },
          style: "cancel"
        },
        {
          text: "Remove This Reminder",
          onPress: () => {
            this.removeSingleNotification();
            this.toaster("Reminder Removed Successfully");
          }
        },
        {
          text: "Remove All Reminders",
          onPress: () => {
            this.removeAllNotifications();
            this.toaster("All Reminders Removed Successfully");
          }
        }
      ]);
    } else {
      Alert.alert("Confirm removal", "Do you want to remove this reminder?", [
        {
          text: "Cancel",
          onPress: () => {
            this.toaster()
            return false;
          },
          style: "cancel"
        },
        {
          text: "Remove This Reminder",
          onPress: () => {
            this.removeSingleNotification();
            this.toaster("Reminder Removed Successfully");
          }
        }
      ]);
    }
  };

  render() {

    if( this.props.showRemove ) {
      return (
        <View>
          {this.renderAlertModal()}
        </View>
      )
    } else {
      return null;
    }
  }
}

ReminderInfo.contextTypes = {
  SetToast: PropTypes.func
};

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 5
  },
  notificationInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    marginBottom: 10
  }
});

export default AppSyncComponent(ReminderInfo, getReminders, removeReminder);
