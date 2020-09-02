import React from "react";
import {
  View,
  Image,
  Dimensions,
  Keyboard,
  AsyncStorage,
  TextInput,
  Button,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Linking,
  Platform,
  SectionList
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import axios from "axios";
import ResponsiveImage from "react-native-responsive-image";
import {
  CheckinActivityEventFlatMutation,
  VerifyCheckinStatusQuery
} from "../../../Queries/Activities";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { graphql } from "react-apollo";
import moment from "moment";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { DefaultText as Text } from "../../presentational/DefaultText.js";

const checkIcon = (
  <Icon name="check" size={responsiveFontSize(1.5)} color="#900" />
);
/**
 * Button to be placed allowing users to check into events
 */
export class EventCheckinButtonX extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  static defaultProps = {
    data: null,
    activity_type: "social",
    checkIn: () => {},
    verifyCheckinStatus: true,
    style: "default"
  };

  canCheckIn() {
    // return true // Un/Comment out for testing
    if (this.props.data.starttime) {
      let starttime = moment(this.props.data.starttime).format("x");
      let checkinEnd = this.props.data.endtime
        ? moment(this.props.data.endtime).format("x")
        : moment(moment(this.props.data.starttime).add(1, "hours")).format("x");
      let checkinStart = moment(
        moment(this.props.data.starttime).subtract(15, "minutes")
      ).format("x");
      let now = new Date().getTime();

      if (now >= checkinStart && now <= checkinEnd) {
        return true;
      }
    }
    return false;
  }

  /**
   * Promise check to see whether this is a user's first check-in.
   *
   * If so, display a modal notifying users that it does onot count for attendance.
   */
  verifyFirstCheckin() {
    return AsyncStorage.getItem("HasPreviousCheckedIn");
  }

  storeCheckinStatus() {
    AsyncStorage.setItem("HasPreviousCheckedIn", "doneit");
  }
  render() {
    let myCheckinButton = (
      <View
        style={[styles[this.props.style]]}
        accessible={true}
        accessibilityLabel={"Check-in"}
      >
        <Text
          style={styles[this.props.style + "text"]}
          accessibilityRole="button"
        >
          {checkIcon} CHECK-IN
        </Text>
      </View>
    );
    if (this.props.from === "schedule") {
      myCheckinButton = (
        <View style={[styles.bigSchedule]}>
          <Text style={styles[this.props.style + "text"]}>
            {checkIcon} CHECK-IN
          </Text>
        </View>
      );
    }

    if (!this.props.checkinStatus && this.canCheckIn()) {
      return (
        <TouchableOpacity
          onPress={() => {
            tracker.trackEvent("Click", "Checkin");
            let checkinData = { ...this.props.data };
            checkinData.activity_type = this.props.activity_type;
            this.verifyFirstCheckin().then(data => {
              if (!data) {
                this.refs.analytics.sendData({
                  "eventtime": new Date().getTime(),
                  "action-type": "click",
                  "target": "Checkin Button",
                  "starting-screen": this.props.previousScreen?this.props.previousScreen:null,
                  "starting-section": this.props.previousSection?this.props.previousSection:null,
                  "resulting-screen": this.props.previousScreen?this.props.previousScreen:null,
                  "resulting-section": "check-in-modal"
                });
                this.context.setModalContent(CheckinModalContent, {
                  close: this.context.setModalVisible
                });
                this.context.setModalVisible(true);
                this.storeCheckinStatus();
              } else {
                this.refs.analytics.sendData({
                  "eventtime": new Date().getTime(),
                  "action-type": "click",
                  "target": "Checkin Button",
                  "starting-screen": this.props.previousScreen?this.props.previousScreen:null,
                  "starting-section": this.props.previousSection?this.props.previousSection:null,
                  "resulting-screen": this.props.previousScreen?this.props.previousScreen:null,
                  "resulting-section": this.props.previousSection?this.props.previousSection:null,
                });
              }
            });
            this.props.checkIn(checkinData);
          }}
          accessibilityRole="button"
        >
          <Analytics ref="analytics" />
          {myCheckinButton}
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  }
}

class CheckinModalContent extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    close: () => null
  };

  render() {
    return (
      <View
        style={{
          paddingVertical: 0,
          alignItems: "center",
          justifyContent: "center",
          flex: 1
        }}
      >
        <View style={styles.attentionContainer}>
          <Text
            style={{
              fontSize: responsiveFontSize(3.6),
              color: "black",
              fontWeight: "bold",
              fontFamily: "Roboto"
            }}
          >
            Attention
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "center"
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(2.7),
              marginTop: responsiveHeight(5),
              color: "black",
              textAlign: "center",
              marginHorizontal: responsiveWidth(8)
            }}
          >
            Checking into your class through the ASU Mobile App does not fulfill
            requirements for attendance in any class.
          </Text>
        </View>
        <View
          style={{
            borderBottomColor: "grey",
            borderBottomWidth: 0.7,
            flex: 1,
            justifyContent: "center",
            width: responsiveWidth(90)
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(2.7),
              color: "black",
              textAlign: "center",
              marginHorizontal: responsiveWidth(7)
            }}
          >
            Please see course syllabus for attendance policy.
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => {
              this.props.close(false);
            }}
            style={styles.modalButton}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(3),
                color: "black",
                fontWeight: "bold",
                fontFamily: "Roboto"
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.props.close(false);
            }}
            style={styles.modalButton1}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(3),
                color: "black",
                fontWeight: "bold",
                fontFamily: "Roboto"
              }}
            >
              Okay
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

EventCheckinButtonX.contextTypes = {
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func
};

/**
 * Verify that the event passed to this component has not already been checked into
 * by the current user.
 */
let checkinStatusQuery = graphql(VerifyCheckinStatusQuery, {
  options: props => {
    return {
      fetchPolicy: "network-only",
      variables: { event_id: props.data.id }
    };
  },
  props: props => {
    return {
      checkinStatus: props.data.verifyCheckinStatus
    };
  }
});

const styles = StyleSheet.create({
  default: {
    height: responsiveHeight(4),
    width: responsiveWidth(22),
    backgroundColor: "rgba(0,0,0,0)",
    borderWidth: 1,
    borderColor: "#D40546",
    borderRadius: responsiveWidth(5),
    alignItems: "center",
    justifyContent: "center",
    marginRight: responsiveWidth(1)
  },
  defaulttext: {
    color: "#D40546",
    fontSize: responsiveFontSize(1.3)
  },
  big: {
    height: responsiveHeight(3.2),
    width: responsiveWidth(27),
    backgroundColor: "rgba(0,0,0,0)",
    borderWidth: 1,
    borderColor: "#D40546",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: responsiveWidth(1),
    marginLeft: responsiveWidth(2)
  },
  bigSchedule: {
    height: responsiveHeight(3.3),
    width: responsiveWidth(21),
    backgroundColor: "rgba(0,0,0,0)",
    borderWidth: 1.5,
    borderColor: "#D40546",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: responsiveWidth(2),
    marginLeft: responsiveWidth(2)
  },
  bigtext: {
    color: "#D40546",
    fontSize: responsiveFontSize(1.4)
  },
  attentionContainer: {
    width: responsiveWidth(90),
    alignItems: "center",
    borderBottomColor: "grey",
    borderBottomWidth: 0.7,
    flex: 0.5,
    justifyContent: "center"
  },
  buttonContainer: {
    flex: 0.5,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  modalButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRightColor: "grey",
    borderRightWidth: 0.7,
    height: responsiveHeight(13)
  },
  modalButton1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 0
  }
});

/**
 * Check into an event
 */
let checkinToEvent = graphql(CheckinActivityEventFlatMutation, {
  props: props => ({
    checkIn: event => {
      let redone = {
        activity_type: event.activity_type,
        active: event.active ? event.active : null,
        id: event.id,
        timestamp: new Date().getTime(),
        endtime: event.endtime ? event.endtime : null,
        location: event.location ? event.location : null,
        starttime: event.starttime ? event.starttime : null,
        title: event.title ? event.title : null,
        url: event.url ? event.url : null,
        description: event.description ? event.description : null,
        key: event.key ? event.key : null,
        map_title: event.map_title ? event.map_title : null,
        map_type: event.map_type ? event.map_type : null,
        picture: event.picture ? event.picture : null,
        teaser: event.teaser ? event.teaser : null,
        feed_type: event.feed_type ? event.feed_type : null,
        map_lat: event.map_lat ? event.map_lat : null,
        map_lng: event.map_lng ? event.map_lng : null,
        nid: event.nid ? event.nid : null,
        category: event.category ? event.category : null,
        interests: event.interests ? event.interests : null,
        date: event.date ? event.date : null,
        rawDate: event.rawDate ? event.rawDate : null,
        __typename: "Event_News_flat"
      };
      props
        .mutate({
          variables: {
            ...redone
          },
          optimisticResponse: () => ({
            checkinActivityEventFlat: {
              active: event.active ? event.active : null,
              id: event.id,
              timestamp: new Date().getTime(),
              endtime: event.endtime ? event.endtime : null,
              location: event.location ? event.location : null,
              starttime: event.starttime ? event.starttime : null,
              title: event.title ? event.title : null,
              url: event.url ? event.url : null,
              description: event.description ? event.description : null,
              key: event.key ? event.key : null,
              map_title: event.map_title ? event.map_title : null,
              map_type: event.map_type ? event.map_type : null,
              picture: event.picture ? event.picture : null,
              teaser: event.teaser ? event.teaser : null,
              feed_type: event.feed_type ? event.feed_type : null,
              map_lat: event.map_lat ? event.map_lat : null,
              map_lng: event.map_lng ? event.map_lng : null,
              nid: event.nid ? event.nid : null,
              category: event.category ? event.category : null,
              interests: event.interests ? event.interests : null,
              date: event.date ? event.date : null,
              rawDate: event.rawDate ? event.rawDate : null,
              __typename: "Event_News_flat"
            }
          }),
          update: (store, { resp }) => {
            try {
              let data = store.readQuery({
                query: VerifyCheckinStatusQuery,
                variables: { event_id: event.id }
              });

              data.verifyCheckinStatus = true;

              store.writeQuery({
                query: VerifyCheckinStatusQuery,
                variables: { event_id: event.id },
                data
              });
            } catch (e) {
              console.log(e);
            }
          }
        })
        .then(resp => {
          // console.log("mutation response", resp); // Debug option
        })
        .catch(e => {
          console.log("submission error", e);
          // throw e;
        });
    }
  })
});
export let EventCheckinButton = AppSyncComponent(
  EventCheckinButtonX,
  checkinToEvent,
  checkinStatusQuery
);
