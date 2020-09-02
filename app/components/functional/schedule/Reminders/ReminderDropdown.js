import React, { PureComponent } from "react";
import {
  Text,
  StyleSheet,
  View,
  Modal,
  TouchableHighlight
} from "react-native";
import PushNotification from "react-native-push-notification";
import moment from "moment";
import PropTypes from "prop-types";
import { AppSyncComponent } from "../../authentication/auth_components/appsync/AppSyncApp";

import {
  addReminder,
  removeReminder,
  getReminders
  // GetAllLocalNotifications
} from "../../../../Queries";
import confirmCreateAlert from "./confirmCreateAlert";

export class ReminderDropdown extends PureComponent {
  static defaultProps = {
    reminders: [],
    addReminder: () => null,
    removeReminder: () => null,
    getReminders: () => null
  };

  constructor(props) {
    super(props);
    this.state = {
      dropdownOptions: [],
      msCalc: 0,
      pickerDisplayed: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.showDrop === true) {
      this.togglePicker();
      this.setUp(nextProps);
    }
  }

  componentDidMount = () => {
    this.setUp(this.props);
  };

  setUp(p) {
    const { item } = p;

    const now = moment()._d;
    const then = moment(item.unixTime)._d;

    const ms = parseInt(
      moment(then).diff(
        moment(now), "minutes"
      )
    );

    this.displayModal = true;

    if (ms < 30) {
      this.setState({
        dropdownOptions: [{ title: "15 Minutes", value: "15 Minutes" }],
        msCalc: ms
      });
    } else if (ms < 45) {
      this.setState({
        dropdownOptions: [
          { title: "15 Minutes", value: "15 Minutes" },
          { title: "30 Minutes", value: "30 Minutes" }
        ],
        msCalc: ms
      });
    } else if (ms < 60) {
      this.setState({
        dropdownOptions: [
          { title: "15 Minutes", value: "15 Minutes" },
          { title: "30 Minutes", value: "30 Minutes" },
          { title: "45 Minutes", value: "45 Minutes" }
        ],
        msCalc: ms
      });
    } else if (ms >= 60) {
      this.setState({
        dropdownOptions: [
          { title: "15 Minutes", value: "15 Minutes" },
          { title: "30 Minutes", value: "30 Minutes" },
          { title: "45 Minutes", value: "45 Minutes" },
          { title: "60 Minutes", value: "60 Minutes" }
        ],
        msCalc: ms
      });
    }
  }

  togglePicker = () => {
    const { pickerDisplayed } = this.state;
    const { finishedInfo } = this.props;
    finishedInfo();
    this.setState({
      pickerDisplayed: !pickerDisplayed
    });
  };

  removeSingleNotification = () => {
    const { item, removeReminder } = this.props;
    let conditionalID;

    if (item.type === "academic") {
      conditionalID = item.course_id;
    } else {
      conditionalID = item.id;
    }

    const id = conditionalID + this.getUnixNumDOW(item.unixTime);

    PushNotification.cancelLocalNotifications({
      id
    });
    removeReminder({ id });
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

  getUnixNumDOW = unixTimestamp => {
    const dowNumber = moment(unixTimestamp).format("e");
    return dowNumber;
  };

  unixToDOW = unixTimestamp => {
    const dowNumber = moment(unixTimestamp).format("e");
    if (dowNumber === "0") {
      return "Sunday";
    } else if (dowNumber === "1") {
      return "Monday";
    } else if (dowNumber === "2") {
      return "Tuesday";
    } else if (dowNumber === "3") {
      return "Wednesday";
    } else if (dowNumber === "4") {
      return "Thursday";
    } else if (dowNumber === "5") {
      return "Friday";
    } else if (dowNumber === "6") {
      return "Saturday";
    }
  };

  toaster = message => {
    const { SetToast } = this.context;
    const { finishedInfo } = this.props;
    if (message) SetToast(message);
    finishedInfo();
  };

  render() {
    const { pickerDisplayed, dropdownOptions, msCalc } = this.state;
    const { item, addReminder } = this.props;

    if (this.displayModal === false) {
      return <View />;
    } else {
      // console.log("MS PICKER: ",msCalc)
    }

    return (
      <View>
        <Modal
          visible={pickerDisplayed}
          animationType="slide"
          transparent
          onRequestClose={() => {
            console.log("Modal has been closed.");
          }}
        >
          <TouchableHighlight
            onPress={() => this.togglePicker()}
            style={styles.modalBackground}
          >
            <View style={styles.modal}>
              {dropdownOptions.map((value, index) => {
                return (
                  <TouchableHighlight
                    key={index}
                    onPress={() => {
                      const dowNum = this.getUnixNumDOW(item.unixTime);
                      const dow = this.unixToDOW(item.unixTime);
                      confirmCreateAlert(
                        item,
                        value.value,
                        this.removeSingleNotification,
                        dow,
                        dowNum,
                        this.toaster,
                        this.removeAllNotifications,
                        addReminder
                      );
                      this.togglePicker();
                    }}
                    style={{ paddingTop: 7.5, paddingBottom: 7.5 }}
                  >
                    <Text style={{ fontSize: 16 }}>{value.title}</Text>
                  </TouchableHighlight>
                );
              })}
              <TouchableHighlight
                onPress={() => {
                  this.togglePicker();
                  this.toaster();
                }}
                style={{ paddingTop: 15, paddingBottom: 5 }}
              >
                <Text style={{ color: "#006fff" }}>Cancel</Text>
              </TouchableHighlight>
            </View>
          </TouchableHighlight>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    padding: 20,
    backgroundColor: "#efefef",
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: "center",
    position: "absolute",
    borderWidth: 1,
    borderColor: "#efefef",
    borderRadius: 3.75
  },
  modalBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  }
});

ReminderDropdown.contextTypes = {
  SetToast: PropTypes.func
};

export default AppSyncComponent(
  ReminderDropdown,
  getReminders,
  addReminder,
  removeReminder
);
