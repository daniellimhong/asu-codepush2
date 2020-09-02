import React from "react";
import { View, StyleSheet, Platform, AsyncStorage } from "react-native";

import PropTypes from "prop-types";
import DeviceInfo from "react-native-device-info";
import { Api as ApiService } from "../../../services";
import { User } from "../../../services/index";
import IMEI from "react-native-imei";
var moment = require("moment");

const buildVersion =
  Platform.OS !== "ios" ? DeviceInfo.getVersion() : DeviceInfo.getBuildNumber();

export default class Analytics extends React.Component {
  static navigationOptions = ({ navigation, screenProps }) => ({
    title: "Analytics",
  });

  screen_mappings = {
    Home: "home",
    Card: "core-feature-card",
    ChatSettings: "chat-settings",
    Chat: "chat",
    ChatManager: "chat-manager",
    NewChat: "new-chat",
    Report: "report-concern",
    Class: "class-profile",
    ClassRoster: "class-roster",
    ClassSchedule: "calss-schedule",
    InAppLink: "in-app-browser",
    Athletics: "athletics",
    FootballTrivia: "football-trivia",
    DiningAndMeals: "dining-services",
    DiningVenues: "dining-venue-list",
    DiningVenue: "dining-venue-details",
    DiningServices: "dining-services",
    LostCard: "dining-services-lost-card",
    ChooseMealPlans: "choose-meal-plan",
    MealPlansBuy: "buy-meal-plans",
    MaroonAndGold: "maroon-and-gold-dollars",
    AllTransactions: "all-transactions",
    Notifications: "notifications",
    HomeSettings: "home-settings",
    HomeInterests: "preferences",
    Schedule: "schedule-list",
    Bookstore: "bookstore",
    ViewAllList: "view-all-list",
    ViewAllListFines: "view-all-list",
    Events: "events-list",
    News: "news-list",
    NewsOrRecommend: "news-list",
    RecommendedNews: "news-list",
    EventsOrRecommend: "events-list",
    RecommendedEvents: "events-list",
    Milestones: "milestones",
    Links: "links",
    LightGame: "light-game",
    GameDayCompanion: "gameday-companion",
    Transit: "transit",
    CommunityUnion: "365-community-union",
    Ticket: "ticket",
    Maps: "maps",
    SunDevilSync: "clubs",
    MyCheckins: "my-checkins",
    UserCheckins: "user-checkins",
    MyLikes: "my-likes",
    UserLikes: "user-likes",
    MyProfile: "my-profile",
    UserProfile: "user-profile",
    EditBlock: "add-info",
    FullInfoView: "full-info-view",
    ViewInfoDetails: "view-all",
    MyFriends: "my-friends",
    FriendSet: "attendees-list",
    InviteFriends: "invite-friends",
    ProfileSettings: "profile-settings",
    Actions: "actions",
    Feedback: "feedback",
    AppList: "asu-apps",
    Directory: "asu-directory",
    UserInfo: "asu-directory",
    OrganizationsHome: "clubs-home",
    Library: "library",
    Locations: "library-locations",
    StudyRooms: "study-rooms",
    MyAccount: "my-account",
    Wellness: "wellness",
    WHCParent:"covid-wellness",
    CovidContractTracing:"covid-permissions"
  };

  constructor(props) {
    super(props);
    this.state = {
      data: "Data inside Analytics Component",
    };
  }

  render() {
    return <View />;
  }

  componentDidMount() {
    User("Home").then((username) => {
      this.setState({ asurite: username });
    });
  }

  retrieveData = async (itemToRetrieve) => {
    try {
      const value = await AsyncStorage.getItem(itemToRetrieve);
      if (value !== null) {
        // We have data!!
        return value;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  storeData = async (key, whatToSave) => {
    try {
      await AsyncStorage.setItem(key, whatToSave);
      return true;
    } catch (error) {
      return false;
    }
  };

  sendData(metricData) {
    //var guestUser = true;
    var self = this;
    // var data = JSON.stringify(metricData);
    if (Platform.OS === "Android") {
      metricData["user-agent-string"] =
        DeviceInfo.getDeviceId() +
        ":" +
        DeviceInfo.getSystemVersion() +
        ":v" +
        buildVersion;
      metricData["device-id"] = IMEI.getImei();
    } else {
      metricData["user-agent-string"] =
        DeviceInfo.getManufacturer() +
        "-" +
        DeviceInfo.getModel() +
        ":" +
        DeviceInfo.getSystemVersion() +
        ":v" +
        buildVersion;
      metricData["device-id"] = DeviceInfo.getUniqueID();
    }
    metricData["actor-id"] = this.state.asurite;
    metricData["eventtime"] = new Date().toISOString();
    if (
      metricData.hasOwnProperty("action-type") &&
      metricData["action-type"] == "view"
    ) {
      metricData["actor-type"] = "System";
    } else {
      metricData["actor-type"] = "User";
    }
    if (
      metricData.hasOwnProperty("starting-screen") &&
      this.screen_mappings.hasOwnProperty(metricData["starting-screen"])
    ) {
      metricData["starting-screen"] = this.screen_mappings[
        metricData["starting-screen"]
      ];
    }
    if (
      metricData.hasOwnProperty("resulting-screen") &&
      this.screen_mappings.hasOwnProperty(metricData["resulting-screen"])
    ) {
      metricData["resulting-screen"] = this.screen_mappings[
        metricData["resulting-screen"]
      ];
    }
    if (
      metricData.hasOwnProperty("starting-section") &&
      this.screen_mappings.hasOwnProperty(metricData["starting-section"])
    ) {
      metricData["starting-section"] = this.screen_mappings[
        metricData["starting-section"]
      ];
    }
    if (
      metricData.hasOwnProperty("resulting-section") &&
      this.screen_mappings.hasOwnProperty(metricData["resulting-section"])
    ) {
      metricData["resulting-section"] = this.screen_mappings[
        metricData["resulting-section"]
      ];
    }
    metricData["time-zone-offset"] = DeviceInfo.getTimezone();
    this.retrieveData("session-time").then((sessionTime) => {
      if (sessionTime) {
        var sessionTimeDate = moment(sessionTime).add(10, "m");
        var now = moment(metricData["eventtime"]);
        if (sessionTimeDate.isBefore(now)) {
          var count = 0;
          self.storeData("session-time", metricData["eventtime"]);
          self.retrieveData("session-count").then((counter) => {
            if (counter) {
              count = parseInt(counter) + 1;
              self.storeData("session-count", count.toString());
            } else {
              count = 1;
              self.storeData("session-count", "1");
            }
            metricData["session-id"] =
              count +
              ":" +
              metricData["device-id"] +
              ":" +
              metricData["eventtime"];
            self.storeData(
              "session-id",
              count +
                ":" +
                metricData["device-id"] +
                ":" +
                metricData["eventtime"]
            );
            self.callSendDataAPI(metricData);
          });
        } else {
          self.storeData("session-time", metricData["eventtime"]);
          self.retrieveData("session-count").then((counter) => {
            var count = 0;
            if (counter) {
              count = counter;
            } else {
              count = 1;
            }
            metricData["session-id"] =
              count +
              ":" +
              metricData["device-id"] +
              ":" +
              metricData["eventtime"];
            self.callSendDataAPI(metricData);
          });
        }
      } else {
        metricData["session-id"] =
          "1:" + metricData["device-id"] + ":" + metricData["eventtime"];
        self.storeData("session-count", "1");
        self.storeData(
          "session-id",
          "1:" + metricData["device-id"] + ":" + metricData["eventtime"]
        );
        self.storeData("session-time", metricData["eventtime"]);
        self.callSendDataAPI(metricData);
      }
    });
  }

  callSendDataAPI(metricData) {
    // console.log("AnalyticsDataaaaa:", metricData);
    this.context
      .getTokens()
      .then((tokens) => {
        if (tokens.username) {
          let apiService = new ApiService(
            "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod",
            tokens
          );
          apiService
            .post("/asumobileapp_analytics_copy", metricData)
            .then((response) => {
              //metricData.asurite = this.state.user;
              console.log("Succcesfully sent to server");
            })
            .catch((error) => {
              console.log("Errorrrrr:", error);
              throw error;
            });
        } else {
          console.log("Guest");
        }
      })
      .catch((error) => {
        console.log("Errorrrrr");
      });
  }
}

Analytics.contextTypes = {
  getTokens: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
  },
});
