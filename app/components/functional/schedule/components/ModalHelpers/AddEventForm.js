import React from "react";
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  Platform,
  DatePickerIOS,
  TimePickerAndroid,
  DatePickerAndroid,
  StyleSheet
} from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";
import moment from "moment";
import { makeid } from "../utility";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { CalModalButtons } from "./Buttons";
import { ModalViewContainer } from "./ModalViewContainer";

import { addUserCalEvent } from "./gql/mutations";

import { AppSyncComponent } from "../../../authentication/auth_components/appsync/AppSyncApp";

class AddEventFormX extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showPicker: false,
      eventText: null,
      eventTime: props.eventTime ? props.eventTime : null,
      eventLocation: null,
      formReady: false,
      allDayEvent: false,
      datePickerHeight: 0,
      formHeight: null
    };
  }

  static defaultProps = {
    btn1Text: null,
    btn2Text: null,
    btn1Avail: true,
    btn2Avail: true,
    btnPress: () => null
  };

  checkForDone = () => {
    if (this.state.eventText && this.state.eventText.length > 0) {
      if (this.state.eventLocation && this.state.eventLocation.length > 0) {
        if (this.state.eventTime) {
          this.setState({
            formReady: true
          });
        }
      }
    }
  };

  setDate = newDate => {
    var formattedDate = moment(newDate).format("MMMM Do YYYY, h:mm a");
    this.setState({
      eventTime: moment(newDate)
    });
    this.checkForDone();
  };

  showAndroidDatePicker = () => {
    var myDate = moment(this.state.eventTime).toDate();
    if (!this.state.eventTime) {
      myDate = new Date();
    }

    try {
      DatePickerAndroid.open({
        date: new Date(myDate),
        minDate: new Date()
      })
        .then(resp => {
          if (
            resp.response == "dismissedAction" ||
            resp.action == "dismissedAction"
          ) {
          } else {
            if (!this.state.allDayEvent) {
              this.showAndroidTimePicker(myDate, resp);
            } else {
              this.setDate(new Date(resp.year, resp.month, resp.day));
            }
          }
        })
        .catch(err => {
          console.log("ERROR ANDROID", err);
        });
    } catch ({ code, message }) {
      console.log("Cannot open date picker", message);
    }
  };

  showAndroidTimePicker = (myDate, selectedDate) => {
    try {
      TimePickerAndroid.open({
        hour: myDate.getHours(),
        minute: myDate.getMinutes(),
        mode: "spinner",
        is24Hour: false
      }).then(timeResp => {
        if (
          timeResp.response !== "dismissedAction" &&
          timeResp.action !== "dismissedAction"
        ) {
          this.setDate(
            new Date(
              selectedDate.year,
              selectedDate.month,
              selectedDate.day,
              timeResp.hour,
              timeResp.minute
            )
          );
        }
      });
    } catch ({ code, message }) {
      console.log("Cannot open time picker", message);
    }
  };

  render() {
    return (
      <View style={{ width: "100%", marginHorizontal: 0, flex: 1 }}>
        <View style={{ paddingHorizontal: responsiveWidth(3.5), flex: 1 }}>
          {this.showForm()}

          <TouchableOpacity
            style={[
              styles.formItem,
              { flexDirection: "row", marginTop: responsiveHeight(1) }
            ]}
            onPress={() => {
              if (Platform.OS == "ios") {
                this.setState({
                  datePickerHeight: null,
                  formHeight: 0
                });
              } else {
                this.showAndroidDatePicker();
              }
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginTop: 1
              }}
            >
              <MaterialCommunityIcons
                name={"calendar-clock"}
                size={24}
                color="#4a4a4a"
              />
            </View>
            <Text style={[styles.formTitleText, { marginLeft: 4 }]}>
              {this.state.eventTime
                ? this.formatTime(this.state.eventTime)
                : "Select Time"}
            </Text>
          </TouchableOpacity>

          {this.getDatePicker()}
        </View>
        {this.state.formHeight == 0 ? (
          <CalModalButtons
            btn1Text="Cancel"
            btn2Text="Done"
            btnPress={this.toggleShowView.bind(this)}
          />
        ) : (
          <CalModalButtons
            btn1Text="Cancel"
            btn2Text="Save"
            btn2Avail={this.state.formReady}
            btnPress={this.saveOrCancel.bind(this)}
          />
        )}
      </View>
    );
  }

  toggleShowView = b => {
    if (b == 1) {
      this.setState({
        datePickerHeight: 0,
        eventTime: null,
        formHeight: null
      });
    } else {
      this.setState({
        datePickerHeight: 0,
        formHeight: null
      });
    }
  };

  showForm = () => {
    var color = this.state.allDayEvent ? "#ffc424" : "#b7b7b7";
    var rotation = this.state.allDayEvent ? "0deg" : "180deg";
    return (
      <ModalViewContainer myHeight={this.state.formHeight}>
        <View style={styles.formItem}>
          <Text style={styles.formTitleText}>Title </Text>
          <TextInput
            style={styles.formInputBox}
            placeholder={"Financial Aid Appointment"}
            multiline={false}
            maxLength={150}
            onChangeText={t => {
              this.setState({ eventText: t });
              this.checkForDone();
            }}
            onEndEditing={v => {
              this.checkForDone();
            }}
            accessibilityLabel="Type event title here"
          />
        </View>

        <View style={styles.formItem}>
          <Text style={styles.formTitleText}>Location</Text>
          <TextInput
            style={styles.formInputBox}
            placeholder={"University Center Building, Room 120"}
            multiline={false}
            maxLength={150}
            onChangeText={t => {
              this.setState({ eventLocation: t });
              this.checkForDone();
            }}
            onEndEditing={v => {
              this.checkForDone();
            }}
            accessibilityLabel="Type event location here"
          />
        </View>

        <TouchableWithoutFeedback
          style={[styles.toggleCont, { flex: 1 }]}
          onPress={() => {
            this.setState({
              allDayEvent: !this.state.allDayEvent
            });
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginTop: responsiveHeight(1),
              alignItems: "center"
            }}
          >
            <View>
              <FontAwesome
                name="toggle-on"
                style={{ transform: [{ rotate: rotation }] }}
                color={color}
                size={responsiveFontSize(3)}
              />
            </View>
            <Text style={[styles.formTitleText, { marginLeft: 4 }]}>
              All Day Event
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </ModalViewContainer>
    );
  };

  formatTime = t => {
    if (this.state.allDayEvent) {
      return t.format("MMMM Do YYYY");
    } else {
      return t.format("MMMM Do YYYY, h:mm a");
    }
  };

  getDatePicker = () => {
    var myDate = moment(this.state.eventTime).toDate();
    if (!this.state.eventTime) {
      myDate = new Date();
    }

    if (Platform.OS == "ios") {
      return (
        <ModalViewContainer myHeight={this.state.datePickerHeight}>
          <View>
            <DatePickerIOS
              date={myDate}
              mode={this.state.allDayEvent ? "date" : "datetime"}
              minimumDate={new Date()}
              onDateChange={d => this.setDate(d)}
            />
          </View>
        </ModalViewContainer>
      );
    }
  };

  saveOrCancel = s => {
    if (s === 1) {
      this.props.closeAndReset();
    } else {
      this.saveCalEvent();
    }
  };

  saveCalEvent = () => {

    let uTime = this.state.eventTime.toDate().getTime();
    let id = ((uTime/1000).toString().slice(-3)) + (new Date().getTime().toString().slice(-3));

    // console.log(" ********************************** ")
    // console.log("ID",uTime,id);
    // while( id.toString().length > 6 ) {
    //   id = Math.floor(parseInt(id)/2);
    //   console.log("ID",id);
    // }
    // console.log(" ********************************** ")

    var payload = {
      eventId: id,
      title: this.state.eventText,
      location: this.state.eventLocation,
      unixTime: this.state.eventTime.toDate().getTime(),
      allDayEvent: this.state.allDayEvent
    };

    if (this.state.allDayEvent) {
      var tempDate = this.state.eventTime.toDate();
      var nextDay = new Date(
        tempDate.getFullYear(),
        tempDate.getMonth(),
        tempDate.getDate() + 1
      );
      var newMoment = moment(nextDay).add(-1, "minutes");
      payload.unixTime = newMoment.toDate().getTime();
    }

    this.props.addUserCalEvent(payload);
    this.props.closeAndReset();
  };
}

export const AddEventForm = AppSyncComponent(AddEventFormX, addUserCalEvent);

const styles = StyleSheet.create({
  formItem: {
    marginTop: responsiveHeight(1),
    flex: 1
  },
  formTitleText: {
    fontSize: responsiveFontSize(1.7),
    lineHeight: responsiveHeight(5),
    color: "#4a4a4a",
    textAlignVertical: "center",
    flex: 1
  },
  formInputBox: {
    textAlignVertical: "top",
    fontSize: responsiveFontSize(1.7),
    // paddingHorizontal: 10,
    paddingVertical: 2,
    borderBottomColor: "#000",
    borderBottomWidth: 1
  }
});
