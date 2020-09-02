import React from "react";
import {
  View,
  ScrollView,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  TouchableHighlight,
  LayoutAnimation,
  DatePickerIOS,
  TimePickerAndroid,
  Animated,
  TextInput
} from "react-native";
import PropTypes from "prop-types";
import moment from "moment";
import _ from "lodash";
import Button from "apsl-react-native-button";
import ListSeperatorNewUI from "../../../universal/list-seperator/newUI";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/FontAwesome";
import Analytics from "../../analytics";
import { CalModalButtons } from "./ModalHelpers/Buttons";
import { AddEventForm } from "./ModalHelpers/AddEventForm";
import { SectionHeader } from "./ModalHelpers/SectionHeader";
import { MainModal } from "./ModalHelpers/MainModal";
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";
import { SingleSchedule } from "./SingleSchedule";
import { EmptySchedule } from "./EmptySchedule";
import { OnlineList } from "./OnlineList";
import { limitSchedule, makeid } from "./utility";
import { DefaultText as Text } from "../../../presentational/DefaultText.js";
import { getUnixNumDOW } from "../Reminders/utility";

export class ScheduleList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalTitle: null,
      showManageCal: props.showManageCal !== null ? props.showManageCal : false
    };
  }

  static defaultProps = {
    saveEvent: () => null,
    attendees: [],
    scheduleList: [],
    onlineClasses: [],
    resetNum: 0,
    loadingError: false,
    eventTime: null,
    limit: null,
    storedLocalNotifications: [],
    canvasAuthorized: true
  };

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.showManageCal != undefined &&
      nextProps.showManageCal != null &&
      nextProps.showManageCal != this.props.showManageCal
    ) {
      this.setState({
        showManageCal: nextProps.showManageCal
      });
    }
  }

  _limitSchedule() {
    let { scheduleList, limit } = this.props;
    return limitSchedule(scheduleList, limit);
  }

  renderColorLabel(i) {
    var backgroundColor = "#2aacf9";

    switch (i.type) {
      case "academic":
        backgroundColor = "#2aacf9";
        break;
      case "event":
        backgroundColor = "#ffc402";
        break;
      case "athletics":
        backgroundColor = "#ffc402";
        break;
      case "alert":
        backgroundColor = "#9a023f";
        break;
      case "custom_event":
        backgroundColor = "#76bf42";
        break;
      case "phone_cal":
        if (i.color) {
          backgroundColor = i.color;
        } else {
          backgroundColor = "#f47d37";
        }
        break;
    }

    switch (i.feed_type) {
      case "events":
        backgroundColor = "#ffc402";
        break;
    }

    return <View style={{ flex: 1, backgroundColor: backgroundColor }} />;
  }

  closeModal = () => {
    this.setState({
      showManageCal: false,
      eventTime: null
    });
    this.props.closeModal();
  };

  checkForReminder(i) {
    var conditionalID = 0;
    if (i.type !== "academic") {
      conditionalID = i.id;
    } else {
      conditionalID = i.course_id;
    }

    i.alert_amount = null;

    var myId = conditionalID + getUnixNumDOW(i.unixTime);
    var allReminders = this.props.storedLocalNotifications;

    for (var x = 0; x < allReminders.length; ++x) {
      if (allReminders[x].push_id == myId) {
        i.alert_amount = allReminders[x].alert_amount;
      }
    }

    return i;
  }

  addEventOnDay = d => {
    var baseDate = moment(d.day);
    var myTime = moment();

    var currentTime =
      baseDate.format("MM/DD/YY") + " " + myTime.format("hh:mm A");

    this.setState({
      eventTime: moment(currentTime),
      showManageCal: true
    });
  };

  setCanvasAuthorized = bool => {
    this.setState({ canvasAuthorized: bool });
  };

  render() {
    let { limit, scheduleList, navigation, loadingError, resetNum } = this.props;
    let moreButton = () => null;
    var dateStamp = new Date().getTime(); //Needed to make sure schedule sees update

    if (limit) {
      scheduleList = this._limitSchedule();
      moreButton = () => {
        return (
          <View accessible={true} accessibilityRole="button">
            <Button
              style={styles.loadButton}
              onPress={() => {
                  navigation.navigate("Schedule",{
                    previousScreen: "home",
                    previousSection: "schedule-list"
                  })
                  this.refs.analytics.sendData({
                    eventtime: new Date().getTime(),
                    "action-type": "click",
                    "starting-screen": "home",
                    "starting-section": "schedule-list",
                    target: "View Full Schedule",
                    "resulting-screen": "schedule-list",
                    "resulting-section": null
                  });
                }
              }
            >
              <Text style={{ color: "#D40546", fontSize: 15 }}>
                View Full Schedule
              </Text>
            </Button>
          </View>
        );
      };
    }
    if (
      (!this.props.scheduleList && !this.props.onlineClasses) ||
      (this.props.scheduleList.length <= 0 &&
        this.props.onlineClasses.length <= 0) ||
      this.props.loadingError
    ) {
      return (
        <EmptySchedule
          navigation={navigation}
          scheduleList={scheduleList}
          loadingError={loadingError}
        />
      );
    } else {
      // console.log("Schedule List is rendering");
      return (
        <ScrollView style={styles.container}>
          <Analytics ref="analytics" />
          <OnlineList
            canvasAuthorized={this.state.canvasAuthorized}
            setCanvasAuthorized={this.setCanvasAuthorized}
            onlineClasses={this.props.onlineClasses}
            navigation={this.props.navigation}
            previousScreen={this.props.previousSection!="drawer-menu"?this.props.previousScreen:"schedule-list"}
            previousSection={this.props.previousSection!="drawer-menu"?this.props.previousSection:null}
          />
          <SectionList
            sections={scheduleList}
            listKey="normalClasses"
            renderSectionHeader={({ section }) => (
              <SectionHeader
                section={section}
                pressedBtn={this.addEventOnDay.bind(this)}
              />
            )}
            renderItem={({ item, index, section }) => {
              item = this.checkForReminder(item);
              return (
                <View
                  elevation={2}
                  style={[styles.itemBody, { flexDirection: "row" }]}
                >
                  {this.renderColorLabel(item)}
                  <View
                    style={{ backgroundColor: "#FFF", flex: 100, padding: 5 }}
                  >
                    <SingleSchedule
                      item={item}
                      dateStamp={dateStamp}
                      resetNum={resetNum}
                      canvasAuthorized={this.state.canvasAuthorized}
                      setCanvasAuthorized={this.setCanvasAuthorized}
                      navigation={this.props.navigation}
                      previousScreen={this.props.previousSection!="drawer-menu"?this.props.previousScreen:"schedule-list"}
                      previousSection={this.props.previousSection!="drawer-menu"?this.props.previousSection:null}
                    />
                  </View>
                </View>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={() => <ListSeperatorNewUI />}
          />
          {moreButton()}
          <MainModal
            showManageCal={this.state.showManageCal}
            addOnDay={this.state.eventTime}
            closeModal={this.closeModal.bind(this)}
            phoneCal={this.props.phoneCal}
          />
        </ScrollView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    backgroundColor: "#F4F4F4",
    marginBottom: 10
  },
  calIcon: {
    height: responsiveHeight(4.7),
    width: responsiveHeight(4.7),
    backgroundColor: "#cecece",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#cecece",
    borderWidth: 1,
    borderRadius: 50
  },
  SectionHeaderStyle: {
    flex: 1,
    width: undefined,
    flexDirection: "row",
    textAlign: "justify",
    height: responsiveHeight(7),
    marginBottom: 10,
    padding: 10
  },
  SectionHeaderText: {
    fontSize: responsiveFontSize(2.2),
    color: "#000",
    fontWeight: "100",
    fontFamily: 'Roboto',
    lineHeight: responsiveHeight(4.7),
    textAlignVertical: "center"
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  timeRemaining: {
    color: "#999999"
  },
  itemBody: {
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: "#FFF",
    shadowColor: "#d9d9d9",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 3,
    shadowOpacity: 1.0
  },
  lastItemBody: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#FFF"
  },
  titleBlock: {
    justifyContent: "space-between",
    flex: 2
  },
  loadButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    alignSelf: "center",
    width: 200,
    height: 50,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#D40546",
    marginVertical: 15
  },
  eventTitle: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(1.8)
  },
  timeBlock: {
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  locationText: {
    color: "#939393"
  },
  locationCircle: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
    width: responsiveHeight(3.5),
    height: responsiveHeight(3.5),
    backgroundColor: "#8A1E41",
    borderRadius: 25
  },
  favoriteRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  blankSchedule: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    height: "100%",
    backgroundColor: "#fff"
  },
  errorMessage: {
    color: "maroon",
    fontSize: 20
  },
  modalButton: {
    padding: 15,
    flex: 1
  },
  modalButtonText: {
    textAlign: "center",
    fontSize: responsiveFontSize(1.6),
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  onlineItemBody: {
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    backgroundColor: "#FFF",
    borderBottomColor: "#D3D3D3",
    borderBottomWidth: 1
  },
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
  },
  campusStyle: {
    paddingVertical: responsiveWidth(1.5),
    borderRadius: responsiveWidth(1),
    alignSelf: "flex-start",
    backgroundColor: "#9F9F9F",
    marginRight: 5,
    flexDirection: "row",
    width: responsiveWidth(16),
    justifyContent: "center",
    alignItems: "center"
  }
});
