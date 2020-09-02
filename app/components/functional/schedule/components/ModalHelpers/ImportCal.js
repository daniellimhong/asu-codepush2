import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  PermissionsAndroid,
  FlatList,
  Platform,
  StyleSheet
} from "react-native";
import { CheckBox } from "react-native-elements";
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";
import moment from "moment";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import RNCalendarEvents from "react-native-calendar-events";
import { CalModalButtons } from "./Buttons";
import { parseEvents } from "../utility";
import { addCalendarEvent } from "./gql/mutations";

import { AppSyncComponent } from "../../../authentication/auth_components/appsync/AppSyncApp";

export class ImportCalX extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showPicker: false,
      eventText: null,
      eventTime: props.eventTime ? props.eventTime : null,
      eventLocation: null,
      calPerms: true,
      importReady: false,
      calsLoaded: false,
      allCals: []
    };
  }

  static defaultProps = {
    btn1Text: null,
    btn2Text: null,
    btn1Avail: true,
    btn2Avail: true,
    btnPress: () => null
  };

  componentDidMount() {
    if (Platform.OS == "ios") {
      this.checkPerms();
    } else {
      this.checkForCalendarPermissionAndroid();
    }
  }

  setDate = newDate => {
    var formattedDate = moment(newDate).format("MMMM Do YYYY, h:mm a");
    this.setState({
      eventTime: moment(newDate)
    });
    this.checkForDone();
  };

  saveOrCancel = s => {
    if (s === 1) {
      this.props.closeAndReset();
    } else {
      // this.findEvents();
      this.saveCalendars();
    }
  };

  saveCalendars = () => {
    var calendars = [];
    var cals = this.state.allCals;

    for (var i = 0; i < cals.length; ++i) {
      if (cals[i].checked) {
        calendars.push(cals[i].id);
      }
    }

    if( calendars.length == 0 ) calendars=["none"]

    var payload = {
      calIds: calendars
    }

    this.props.addCalendarEvent(payload);
    this.props.closeAndReset();

  }

  findEvents = () => {
    var calendars = [];
    var cals = this.state.allCals;

    for (var i = 0; i < cals.length; ++i) {
      if (cals[i].checked) {
        calendars.push(cals[i].id);
      }
    }

    RNCalendarEvents.fetchAllEvents(moment(), moment().add(7, "d"), calendars)
      .then(events => {
        var eventsToAdd = parseEvents(events);
        console.log("EVENTS READY", eventsToAdd);
      })
      .catch(err => {
        this.setEventError();
      });
  };

  findCals = () => {
    RNCalendarEvents.findCalendars()
      .then(cals => {
        var allCals = [];

        if (cals.length == 0) {
          this.setZeroMsgs();
        } else {

          var calCheck = this.props.phoneCal;
          if( !this.props.phoneCal ) calCheck = [];

          for (var i = 0; i < cals.length; ++i) {

            allCals.push({
              id: cals[i].id,
              title: cals[i].title,
              color: cals[i].color,
              checked: calCheck.indexOf(cals[i].id) > -1
            });
          }

          this.setState({
            allCals: allCals,
            errorMessage: null,
            loading: false
          });
          this.props.calReady();
        }
      })
      .catch(err => {
        console.log("failed getting calendars", err);
        this.setEventError();
      });
  };

  setEventError = () => {
    this.setState({
      loading: false,
      errorMessage:
        "There was an issue importing the calendar(s). Please try again later.",
      calPerms: false
    });
    this.props.calReady();
  };

  setZeroMsgs = () => {
    this.setState({
      loading: false,
      errorMessage: "No Calendars Found",
      calPerms: false
    });
    this.props.calReady();
  };

  setErrorMsg = () => {
    this.setState({
      loading: false,
      errorMessage:
        "There was an issue finding your calendars. Please try again later",
      calPerms: false
    });
    this.props.calReady();
  };

  setDeniedMsg = () => {
    this.setState({
      loading: false,
      errorMessage:
        "Calendar cannot be imported because permissions have been denied. Please go into your phone settings and allow access to calendar.",
      calPerms: false
    });
    this.props.calReady();
  };

  checkForCalendarPermissionAndroid = async () => {

    // console.log("Calendar - checking permissions for android")
    try {
      const hasReadPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_CALENDAR
      );

      const hasWritePermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_CALENDAR
      );

      // console.log("Calendar - current permissions for android: ",hasReadPermission)

      if (hasReadPermission&hasWritePermission) {
        this.findCals();
      } else {
        this.requestCalendarPermissionAndroid();
      }
    } catch (error) {
      console.log("Calendar - Error getting android permissions",err)
    }
  };

  requestCalendarPermissionAndroid= async () => {

    // console.log("Calendar - will try and request access android")
    PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.READ_CALENDAR,PermissionsAndroid.PERMISSIONS.WRITE_CALENDAR]).then( resp => {
      // console.log("Calendar - RESP",resp)

      try {
        if( resp["android.permission.WRITE_CALENDAR"] === "granted" && resp["android.permission.READ_CALENDAR"] === "granted" ) {
          this.findCals();
        } else {
          this.setDeniedMsg();
        }
      } catch (e) {
        console.log("Calendar - Error with permissions",e)
        this.setErrorMsg();
      }

    });



  }

  checkPerms = () => {
    RNCalendarEvents.authorizationStatus()
      .then(resp => {
        // console.log("Calendar - Auth Status:", resp);
        if (resp == "undetermined") {
          // console.log("Calendar - Will try and authorize");
          RNCalendarEvents.authorizeEventStore()
            .then(authresp => {
              // console.log("Calendar - Auth Status:", authresp);
              if (authresp != "denied") {
                this.findCals();
              } else {
                this.setDeniedMsg();
              }
            })
            .catch(err => {
              console.log("AUTH ERROR", err);
              this.setErrorMsg();
            });
        } else if (resp == "denied") {
          this.setDeniedMsg();
        } else {
          this.findCals();
        }
      })
      .catch(err => {
        console.log("AUTH STAT", err);
        this.setErrorMsg();
      });
  };

  render() {
    return <View>{this.showInfo()}</View>;
  }

  showInfo = () => {
    if (this.state.loading) {
      return (
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: responsiveWidth(5),
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <ActivityIndicator size="small" color="#00ff00" />
          <Text style={{ fontSize: responsiveFontSize(1.7) }}>
            Loading Calendars
          </Text>
        </View>
      );
    } else {
      if (this.state.errorMessage) {
        return (
          <View>
            <Text
              style={{
                fontSize: responsiveFontSize(1.7),
                textAlign: "center",
                marginHorizontal: responsiveWidth(5)
              }}
            >
              {this.state.errorMessage}
            </Text>
            <CalModalButtons
              btn1Text="Cancel"
              btn2Text="Save"
              btn2Avail={this.state.calPerms}
              btnPress={this.saveOrCancel.bind(this)}
            />
          </View>
        );
      } else {
        return (
          <View>
            <Text
              style={{
                fontSize: responsiveFontSize(1.7),
                textAlign: "center",
                marginHorizontal: responsiveWidth(5)
              }}
            >
              Select Calendars to Import or Deselect to Remove
            </Text>
            <ScrollView
              style={{
                height: responsiveHeight(15),
                marginHorizontal: responsiveWidth(5),
                marginTop: responsiveHeight(3)
              }}
            >
              <View>
                <Text>Testing text</Text>
                <FlatList
                  data={this.state.allCals}
                  extraData={this.state}
                  renderItem={this._renderList}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
            </ScrollView>
            <CalModalButtons
              btn1Text="Cancel"
              btn2Text="Save"
              btn2Avail={this.state.calPerms}
              btnPress={this.saveOrCancel.bind(this)}
            />
          </View>
        );
      }
    }
  };

  toggleItem = item => {
    var currItems = this.state.allCals;

    for (var i = 0; i < currItems.length; ++i) {
      if (currItems[i].id == item.id) {
        currItems[i].checked = !item.checked;
      }
    }

    var atLeastOneChecked = false;
    for (var i = 0; i < currItems.length; ++i) {
      if (currItems[i].checked) {
        atLeastOneChecked = true;
      }
    }

    this.setState({
      allCals: currItems,
      importReady: atLeastOneChecked
    });
  };

  _renderList = ({ item }) => {
    return (
      <View style={{ flex: 1 }}>
        <CheckBox
          title={item.title}
          checked={item.checked}
          containerStyle={styles.checkCont}
          iconType="material"
          checkedIcon="check"
          checkedColor={item.color ? item.color : "#2aacf9"}
          uncheckedIcon="add"
          onPress={() => this.toggleItem(item)}
        />
      </View>
    );
  };

  findText = () => {
    if (this.state.calPerms) {
      return "Import Calendar from your Phone";
    } else {
      return "Calendar cannot be imported because permissions have been denied. Please go into your phone settings and allow access to calendar.";
    }
  };
}

export const ImportCal = AppSyncComponent(
  ImportCalX,
  addCalendarEvent
);

const styles = StyleSheet.create({
  formItem: {
    marginTop: responsiveHeight(1),
    flex: 1
  },
  checkCont: {
    backgroundColor: "#FFF",
    borderColor: "#FFF",
    margin: 0,
    padding: 0
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
