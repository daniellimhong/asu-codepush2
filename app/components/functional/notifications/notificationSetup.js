import React from "react";
import {
  View,
  Image,
  Dimensions,
  Keyboard,
  Text,
  AsyncStorage,
  TextInput,
  Button,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  Platform,
  DeviceEventEmitter,
  AppRegistry,
  NativeModules,
  NativeAppEventEmitter,
  PushNotificationIOS,
  Linking,
  Share
} from "react-native";

import {
  Api,
  Auth,
  User,
  updateMsgData,
  getUnreadNotifications,
  setUnreadNotifications,
  updateUnreadNotifications
} from "../../../services";

// import {
//   updateUnreadNotifications
// } from "../../../services";

import DeviceInfo from "react-native-device-info";
import PushNotification from "react-native-push-notification";
import { Notifications } from "../notifications/index";
import PropTypes from "prop-types";

import { Task } from "../../universal";

const baseUrl = "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod";
const msgCtrUrl = baseUrl + "/msgctr";
const tokenUrl = baseUrl + "/tokenpref";

const secureApi = "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod";
const configs = { service: "execute-api", region: "us-east-1" };

var actions = {};
//Avoid infinite loop to regiester tokens
var alreadySent = false;
var username = "";
var calledPerms = false;

//Set up bridge & headless js functions for ios and android
const bridging = require("./bridgeFunctions.js");

export class NotificationSetup extends React.PureComponent {
  static navigationOptions = ({ navigation, screenProps }) => ({
    header: null
  });

  constructor(props) {
    super(props);
    username = props.username;
    this.state = {
      data: [],
      username: props.username,
      getTokens: props.getTokens
    };



    _handleAppStateChange = nextAppState => {
      if (
        this.state.appState.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        PushNotificationIOS.setApplicationIconBadgeNumber(0);
      }
      this.setState({ appState: nextAppState });
    };

    var perms = false;

    if (Platform.OS != "ios") {
      perms = true;
    }

    PushNotification.configure({
      senderID: "628934528083",
      onRegister: function(token) {
        console.log(" *********************** TOKEN:", token, DeviceInfo.getUniqueID());
        var payload = {
          operation: "writeToken",
          id: DeviceInfo.getUniqueID(),
          appId: "edu.asu.asumobileapp",
          token: token.token,
          platform: Platform.OS
        };
        props
          .getTokens()
          .then(tokens => {
            let apiService = new Api(baseUrl, tokens, configs);

            if (tokens.username && tokens.username !== "guest") {
              apiService
                .post("/tokenpref-secure", payload)
                .then(resp1 => {
                  // console.log("RESPONSE *** ", resp1);
                })
                .catch(error => {
                  console.log(error);
                });
            } else {
              fetch(tokenUrl, {
                method: "POST",
                body: JSON.stringify({
                  operation: "writeToken",
                  id: DeviceInfo.getUniqueID(),
                  appId: "edu.asu.asumobileapp",
                  token: token.token,
                  platform: Platform.OS
                })
              });
            }
          })
          .catch(err => {
            fetch(tokenUrl, {
              method: "POST",
              body: JSON.stringify({
                operation: "writeToken",
                id: DeviceInfo.getUniqueID(),
                appId: "edu.asu.asumobileapp",
                token: token.token,
                platform: Platform.OS
              })
            });
          });
      },
      onNotification: function(notification) {
        // console.log("NOTIFICATION:", notification);
        // console.log("NOTIFICATION ACTION ---- :", notification.action);
        updateMsgData(props.getTokens);
        // updateUnreadNotifications(props.getTokens);
        const navigate = props.data.navigate;
        bridging.setNavigation(navigate);

        //Add Push notifications analytics here

        if (notification.userInteraction == true) {
          var pId = "";
          var actionCat = "";
          var title = "";
          var message = "";
          var sentBy = "";
          var fullData = "";
          var sendGroup = "";
          var sendGroupTwo = "";
          var goToPage = "";
          var pushPage = false;
          var extraData = "";

          if (Platform.OS == "ios") {
            fullData = notification.data;
            PushNotificationIOS.setApplicationIconBadgeNumber(0);
            // console.log("IOS DATA", fullData);
          } else {
            fullData = notification;
            PushNotification.cancelLocalNotifications({ userInfo: {id: '-1'} })
            // console.log("ANDROID DATA", fullData);
          }

          pId = fullData.pushId;
          sendGroup = fullData.ownerGroup;
          goToPage = fullData.goToPage;
          extraData = fullData.extraData;
          pushPage = fullData.pushPage;

          if (sendGroup == "reminder") {
            goToPage = "Schedule";
            pushPage = "true";
          }
          else if (sendGroup == "weekly_schedule") {
            goToPage = "ProfileSettings";
            pushPage = "true";
            AsyncStorage.setItem(
              "show_weekly_modal", "true"
            );
          }
          else if( sendGroup == "daily_health_check"){
            goToPage = "Home";
            pushPage = "true";
          }
          if(sendGroup == "weekly_schedule" || sendGroup == "daily_health_check"){
            props.getTokens().then(tokens => {
              if (tokens.username && tokens.username !== "guest") {
                const apiService = new Api(
                  "https://jrfhye0mkf.execute-api.us-west-2.amazonaws.com/prod",
                  tokens
                );
                try {
                  apiService.get("/notifications?id="+fullData.id).then(response => {
                    console.log("API response", response);
                  }).catch(error => {
                    console.log("Error", error);
                  });
                } catch (err) {
                  console.log("Error:", err);
                }
              }
            });
          }

          var openedPay = {
            operation: "openedNotification",
            pushId: pId,
            deviceId: DeviceInfo.getUniqueID(),
            timeOpened: new Date(),
            openedFrom: "push"
          };

          if (pId) {
            props
              .getTokens()
              .then(tokens => {
                let apiService = new Api(baseUrl, tokens, configs);
                apiService
                  .post("/msgctr-secure", openedPay)
                  .then(resp1 => {
                    // console.log("RESPONSE", resp1);
                  })
                  .catch(error => {
                    throw error;
                  });
              })
              .catch(err => {
                fetch(msgCtrUrl, {
                  method: "POST",
                  body: JSON.stringify(openedPay)
                });
              });
          }

          fullData.dontReAdd = true;

          if (
            ((pushPage && pushPage != "false") || pushPage == "true") &&
            goToPage &&
            goToPage != ""
          ) {
            if (!extraData) extraData = "{}";
            AsyncStorage.multiSet([
              ["goToPage", goToPage],
              ["actionsData", extraData]
            ]).then(
              resp => {
                console.log("PROPS.DATA.STATE: ", goToPage);
              },
              err => console.log("ERROR STORING ", err)
            );
          } else {
            // console.log("ACTIONS PAGE", fullData);
            AsyncStorage.multiSet([
              ["goToPage", "Actions"],
              ["actionsData", JSON.stringify({ data: fullData })]
            ]).then(
              resp => {
                console.log("SET");
              },
              err => console.log("ERROR STORING", err)
            );
          }
        } else {
          var silent = false;
          var ownerGroup = null;
          if (Platform.OS == "ios") {
            silent = notification.data.silent;
            ownerGroup = notification.data.ownerGroup;
            PushNotificationIOS.setApplicationIconBadgeNumber(0);
          } else {
            silent = notification.silent;
            ownerGroup = notification.ownerGroup;
          }

          // console.log("silent", silent);

          if (silent !== true && silent !== "true" && ownerGroup != "chat") {
            getUnreadNotifications().then(res => {
              setUnreadNotifications(res + 1);
            });
          }
        }
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      popInitialNotification: true,
      requestPermissions: perms,
      onError: function(err) {
        console.log("HERE", err);
      }
    });

    var requestPromise = null;

    function requestPerms() {
      if (requestPromise) {
        // console.log("RESPONSE", requestPromise);
        return requestPromise;
      } else {
        requestPromise = PushNotification.requestPermissions().then(
          res => {
            // console.log("RESPONSE", res);
            requestPromise = null;
            return res;
          },
          err => {
            requestPromise = null;
          }
        );
        return requestPromise;
      }
    }

    if (Platform.OS == "ios") {
      if (!calledPerms) requestPerms();
      calledPerms = true;
    } else {
      PushNotification.requestPermissions("628934528083");
    }
  }
  render() {
    return null;
  }
}

NotificationSetup.contextTypes = {
  getTokens: PropTypes.func
};
