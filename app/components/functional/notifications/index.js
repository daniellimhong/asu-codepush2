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
  TouchableHighlight,
  ActivityIndicator,
  PushNotificationIOS,
  AccessibilityInfo,
  findNodeHandle,
  UIManager
} from "react-native";

import {
  Api,
  Auth,
  User,
  setMsgData,
  getMsgData,
  updateMsgData,
  getUnreadNotifications,
  setUnreadNotifications,
  updateUnreadNotifications
} from "../../../services";
import {
  createMaterialTopTabNavigator,
  createAppContainer
} from "react-navigation";

import DeviceInfo from "react-native-device-info";
import Analytics from "./../analytics";
import { tracker } from "../../achievement/google-analytics.js";
import PropTypes from "prop-types";
import { palette } from "../../../themes/asu";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getInboxMsgs, getActivityMsgs } from "./gql/Queries";
import { openedNotification, deleteNotification } from "./gql/Mutations";
import { AppSyncComponent } from "../authentication/auth_components/appsync/AppSyncApp";

import {
  Card,
  CardTitle,
  CardContent,
  CardAction,
  CardButton,
  CardImage
} from "react-native-cards";
import Moment from "moment";
const initialLayout = {
  height: 0,
  width: Dimensions.get("window").width
};

var baseUrl = "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod";
var msgUnsecure =
  "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod/msgctr";
var tokenUnsecure =
  "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod/tokenpref";
const configs = { service: "execute-api", region: "us-east-1" };

const myColors = {
  maroon: "#c1003b",
  blue: "#44a0dd",
  orange: "#f77030",
  yellow: "#ffc425",
  tan: "#AFA593",
  green: "#568E14",
  gray: "#828282"
};

var dataToSend = [];

export class Notifications extends React.PureComponent {
  static navigationOptions = ({ navigation, screenProps }) => ({
    header: null
  });

  constructor(props) {
    super(props);
    if (Platform.OS == "ios") {
      PushNotificationIOS.setApplicationIconBadgeNumber(0);
    }
  }
  componentDidMount() {
    this.setAccessibilityFocus();
  }

  componentWillUnmount() {
    this.setState({ data: null });
    setMsgData("");
    this.setState({
      fullyLoaded: false
    });
    clearTimeout(this.focusTimeout);
  }

  setAccessibilityFocus() {
    const FOCUS_ON_VIEW = 8;
    const nodeHandle = findNodeHandle(this.focusHeading);
    this.focusTimeout = setTimeout(() => {
      Platform.OS === "ios"
        ? AccessibilityInfo.setAccessibilityFocus(nodeHandle)
        : UIManager.sendAccessibilityEvent(nodeHandle, FOCUS_ON_VIEW);
    }, 400);
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        <View
          style={{
            height: 80,
            backgroundColor: "#25262a",
            paddingTop: 20,
            paddingBottom: 20,
            flexDirection: "row"
          }}
        >
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.goBack();
              }}
              style={{ flex: 0, justifyContent: "center" }}
              accessibilityLabel="Back"
              accessibilityRole="button"
            >
              <Icon name="navigate-before" size={40} color="white" />
            </TouchableOpacity>
          </View>
          <View
            style={{ flex: 2, justifyContent: "center", alignItems: "center" }}
            ref={focusHeading => {
              this.focusHeading = focusHeading;
            }}
            accessible={true}
            accessibilityLabel="Message Center"
            accessibilityRole="header"
          >
            <Text
              style={{
                color: "white",
                fontSize: 20,
                textAlign: "center",
                textAlignVertical: "center"
              }}
            >
              Message Center
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              flex: 1,
              marginTop: 10
            }}
          >
            <View
              style={{ flex: 1, flexDirection: "column", alignItems: "center" }}
            >
              {/* Placeholder for notifications maybe? */}
            </View>
          </View>
        </View>
        <NotificationNav screenProps={this.props} />
      </View>
    );
  }
}

export class ViewNotificationsX extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      toggles: [],
      viewButtons: [],
      activeRowKey: null,
      fullyLoaded: true,
      currentScreen: props.navigation.state.key,
      updateUnreadNum: props.screenProps.navigation.state.params.updateUnreadNum
    };
  }

  componentWillReceiveProps(props) {
    this.setState({ viewButtons: [] });
  }

  render() {
    var d = this.props[this.state.currentScreen.toLowerCase()];

    // console.log("Starting render", d);

    if (!this.state.fullyLoaded) {
      return (
        <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
          <Analytics ref="analytics" />
          <ScrollView style={{ flex: 1 }}>
            <View style={{ display: "flex", flex: 1 }}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          </ScrollView>
        </View>
      );
    } else if (
      this.state.currentScreen == "Inbox" &&
      (d == undefined || d == null || d.length == 0)
    ) {
      return (
        <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
          <Analytics ref="analytics" />
          <ScrollView style={{ flex: 1 }}>
            <View style={{ display: "flex", flex: 1 }}>
              <Text style={styles.loadingText}>Inbox Empty</Text>
              <Text style={styles.loadingSubText}>
                Nothing new to report here!
              </Text>
              <Text style={styles.loadingSubText}>
                {"You're all caught up."}
              </Text>
            </View>
          </ScrollView>
        </View>
      );
    } else if (
      this.state.currentScreen == "Activity" &&
      (d == undefined || d == null || d.length == 0)
    ) {
      return (
        <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
          <Analytics ref="analytics" />
          <ScrollView style={{ flex: 1 }}>
            <View style={{ display: "flex", flex: 1 }}>
              <Text style={styles.loadingText}>No Activity</Text>
              <Text style={styles.loadingSubText}>
                Nothing new to report here!
              </Text>
              <Text style={styles.loadingSubText}>
                {"You're all caught up."}
              </Text>
            </View>
          </ScrollView>
        </View>
      );
    } else {
      // console.log(this.props);
      return (
        <ScrollView style={{ backgroundColor: "#f2f2f2" }}>
          <Analytics ref="analytics" />
          <View style={styles.container}>
            <FlatList
              data={this.props[this.state.currentScreen.toLowerCase()]}
              extraData={this.state}
              renderItem={this._renderList}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </ScrollView>
      );
    }
  }

  deleteMsg = data => {
    var payload = {
      pushId: data.pushId,
      uuid: DeviceInfo.getUniqueID(),
      inboxType: this.state.currentScreen,
      appId: "edu.asu.asumobileapp"
    };

    // console.log("PAYY", payload);

    this.props.deleteNotification(payload).then(resp => {
      console.log(" BACK: message deleted");
    });

    var toggles = this.state.toggles;
    toggles[data.pushId] = false;

    this.setState({
      toggles: toggles
    });

    var archiveText = "deleted";
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "notifications",
      "starting-section": this.state.currentScreen, 
      "target": "delete",
      "resulting-screen": "notifications", 
      "resulting-section": this.state.currentScreen,
      "action-metadata": {
        "title":data.title,
        "push-id":data.pushId
      }
    });
    tracker.trackEvent(
      "Click",
      `Notifications_Msg_${archiveText} - item: ${data}`
    );
  };

  update = (d, changeTo) => {
    var temp = this.state[this.state.currentScreen].slice();
    var tempL = temp.length;
    for (var i = 0; i < tempL; ++i) {
      if (temp[i].pushId == d.pushId) {
        temp[i].archived = changeTo;
        temp[i].updatedFrom = "UPDATE AT " + new Date();
        // temp.sort(function (a, b) { return a.seen - b.seen })
        this.setState({ data: temp });
        dataToSend = temp;
      }
    }

    // updateMsgData(this.context.getTokens).then(resp);
    // updateMsgData(this.context.getTokens);
  };

  updateSeen = d => {
    // var temp = this.state[this.state.currentScreen].slice();
    // var tempL = temp.length;
    // for (var i = 0; i < tempL; ++i) {
    //   if (temp[i].pushId == d.pushId) {
    //     if (temp[i].seen == false) {
    //       this.state.updateUnreadNum();
    //     }
    //     temp[i].seen = true;
    //     temp.sort(function(a, b) {
    //       return a.seen - b.seen;
    //     });
    //     this.setState({ data: temp });
    //     dataToSend = temp;
    //     // setMsgData(temp, 'Update Seen');
    //   }
    // }
  };

  openedItem = item => {
    var payload = {
      pushId: item.pushId,
      deviceId: DeviceInfo.getUniqueID(),
      timeOpened: new Date(),
      openedFrom: "app",
      inboxType: this.state.currentScreen,
      appId: "edu.asu.asumobileapp"
    };

    getUnreadNotifications().then(res => {
      if (res > 0) {
        setUnreadNotifications(res - 1);
      }
    });

    this.props.openedNotification(payload).then(resp => {
      console.log(" BACK: opened updated");
    });
  };

  updateAction = (d, act) => {
    // console.log("ACTION", d, act);
    var temp = this.state[this.state.currentScreen].slice();
    var tempL = temp.length;
    for (var i = 0; i < tempL; ++i) {
      if (temp[i].pushId == d.pushId) {
        temp[i].action = act;
        this.setState({ data: temp });
        dataToSend = temp;
        // setMsgData(temp, 'Update Action');
      }
    }
  };

  _renderList = ({ item }) => {
    var iconType = "";
    var highlightIcon = false;

    switch (item.type) {
      case "alert":
        item.iconType = "ALERT";
        item.iconName = "priority-high";
        item.iconColor = myColors.maroon;
        highlightIcon = true;
        break;
      case "event":
        item.iconType = "EVENT";
        item.iconName = "event";
        item.iconColor = myColors.orange;
        break;
      case "lightening":
        item.iconType = "ANNOUNCEMENT";
        item.iconName = "flash-on";
        item.iconColor = myColors.maroon;
        break;
      case "lightening":
        item.iconType = "TECHNOLOGY";
        item.iconName = "flash-on";
        item.iconColor = myColors.blue;
        break;
      case "star":
        item.iconType = "NOTICE";
        item.iconName = "grade";
        item.iconColor = myColors.yellow;
        break;
      case "parking":
        item.iconType = "PARKING & TRANSIT";
        item.iconName = "directions-car";
        item.iconColor = myColors.green;
        break;
      case "maintenance":
        item.iconType = "MAINTENANCE";
        item.iconName = "build";
        item.iconColor = myColors.tan;
        break;
      case "arts":
        item.iconType = "CREATIVITY";
        item.iconName = "color-lens";
        item.iconColor = myColors.orange;
        break;
      case "lightbulb":
        item.iconType = "SOLUTIONS";
        item.iconName = "lightbulb-outline";
        item.iconColor = myColors.yellow;
        break;
      case "global":
        item.iconType = "GLOBAL ENGAGEMENT";
        item.iconName = "public";
        item.iconColor = myColors.blue;
        break;
      case "trendingup":
        item.iconType = "ARIZONA IMPACT";
        item.iconName = "trending-up";
        item.iconColor = myColors.gray;
        break;
      case "group":
        item.iconType = "SUN DEVIL LIFE";
        item.iconName = "group";
        item.iconColor = myColors.tan;
        break;
      case "friends":
        item.iconType = "FRIENDS";
        item.iconName = "group";
        item.iconColor = myColors.blue;
        break;
      case "auto_friends":
        item.iconType = "FRIENDS";
        item.iconName = "group";
        item.iconColor = myColors.blue;
        break;
      case "search":
        item.iconType = "DISCOVER";
        item.iconName = "search";
        item.iconColor = myColors.green;
        break;
      default:
        item.iconType = "MESSAGE";
        item.iconName = "grade";
        item.iconColor = myColors.tan;
    }

    var archive = item.archived;
    var seen = item.seen;
    var toggles = this.state.toggles;
    const { navigate } = this.props.screenProps.navigation;

    var showArchived = this.state.currentScreen == "Inbox" ? false : true;
    var arrowDirection = this.state.viewButtons[item.pushId]
      ? "arrow-drop-up"
      : "arrow-drop-down";

    //Show only either archived or inbox messages based on current screen
    if (toggles[item.pushId] == true || toggles[item.pushId] == undefined) {
      var msg = item.body;

      if (msg && msg.length >= 55) {
        msg = msg.substring(0, 52) + "...";
      }

      item.username = this.state.username;

      // console.log("ITEM",item);

      return (
        <View>
          <Card>
            <TouchableOpacity
              style={[styles.notificationListItem]}
              onPress={() => {
                this.pressHandler(item);
                tracker.trackEvent(
                  "Click",
                  `Notifications_messageOpened - item: ${item}`
                );
              }}
              accessible={false}
            >
              <View style={{ flex: 1, flexDirection: "row" }} accessible={true}>
                <View style={[styles.iconSection]}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: highlightIcon ? "#c1003b" : "#d3d2d3" }
                    ]}
                    accessible={false}
                  >
                    <MaterialIcons
                      name={item.iconName}
                      size={24}
                      color="white"
                      style={styles.icon}
                    />
                  </View>
                </View>
                <View style={{ flex: 1, marginRight: 50 }}>
                  <TouchableOpacity
                    onPress={() => this.pressHandler(item)}
                    accessibilityLabel={`${item.title}.`}
                  >
                    <Text
                      style={[
                        styles.nTitle,
                        {
                          color: item.seen ? "#7c7c7c" : "black",
                          fontWeight: item.seen ? "normal" : "bold",
                          fontFamily: "Roboto"
                        }
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.pressHandler(item)}>
                    <Text style={[styles.nDate]}>
                      {Moment(item.date.start).format("MMMM D, YYYY")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.pressHandler(item)}>
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={[
                        styles.nBody,
                        { color: item.seen ? "#7c7c7c" : "black" }
                      ]}
                    >
                      {msg}
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flex: 1, flexDirection: "row" }}>
                    {this.setActionTag(item.action, item.actions)}
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.arrowDropIconBox]}
                onPress={() => {
                  this.toggleButtons(item.pushId);
                }}
                accessibilityLabel="Options"
                accessibilityRole="button"
              >
                <MaterialIcons
                  name={arrowDirection}
                  size={26}
                  color="#c1003b"
                  style={styles.arrowDropIcon}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </Card>
          {this.showArchiveButtons(item)}
        </View>
      );
    } else {
      return null;
    }
  };

  pressHandler(item) {
    const { navigate } = this.props.screenProps.navigation;
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "notifications",
      "starting-section": this.state.currentScreen, 
      "target": "notification",
      "resulting-screen": "notifications-details", 
      "resulting-section": null,
      "action-metadata": {
        "title":item.title,
        "push-id":item.pushId
      }
    });
    // this.updateSeen(item);
    this.openedItem(item);
    item.inboxType = this.state.currentScreen;
    navigate("Actions", {
      data: item,
      updateAction: this.updateAction.bind(this)
    });
  }

  //onclick expand buttons
  showArchiveButtons = item => {
    if (this.state.viewButtons[item.pushId] == true) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            marginLeft: 7,
            marginRight: 7,
            marginTop: -10
          }}
        >
          <TouchableOpacity
            style={[styles.underBtns, styles.deleteButton]}
            onPress={() => this.deleteMsg(item)}
            accessibilityRole="button"
          >
            <Text style={[styles.underBtnsText]}>DELETE</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  //In button drop down find if it should unarchive or archive base don screeen
  // archiveOrUn = (item) => {
  //   if( this.state.currentScreen == "Inbox" ) {
  //     return (
  //       <TouchableOpacity
  //         style={[styles.underBtns, styles.archiveButton]}
  //         onPress={() => this.archiveMsg(item)}>
  //         <Text style={[styles.underBtnsText]}>ARCHIVE</Text>
  //       </TouchableOpacity>
  //     )
  //   } else {
  //     return (
  //       <TouchableOpacity
  //         style={[styles.underBtns, styles.archiveButton]}
  //         onPress={() => this.unarchiveMsg(item)}>
  //         <Text style={[styles.underBtnsText]}>UNARCHIVE</Text>
  //       </TouchableOpacity>
  //     )
  //   }
  // }

  //hanles keeping tack of what buttons to show
  toggleButtons = pushId => {
    var toggles = this.state.viewButtons;
    if (toggles[pushId] === undefined) {
      toggles[pushId] = true;
    } else {
      toggles[pushId] = !toggles[pushId];
    }

    this.setState({
      viewButtons: toggles
    });
  };

  //Tags list item with response
  setActionTag = (a, acts) => {
    var addExtra = "";
    if (Platform.OS == "ios") {
      addExtra = { paddingTop: 5 };
    }
    if (acts != null && a == null) {
      return (
        <View style={[{ backgroundColor: "black" }, styles.baseTagContainer]}>
          <Text style={[styles.tagText, addExtra]}>Unanswered</Text>
        </View>
      );
    } else if (acts != null && a != null) {
      return (
        <View style={[{ backgroundColor: "#119236" }, styles.baseTagContainer]}>
          <Text style={[styles.tagText, addExtra]}>{a}</Text>
        </View>
      );
    } else {
      return (
        <View
          accessible={false}
          style={[{ backgroundColor: "white" }, styles.baseTagContainer]}
        >
          <Text accessible={false} style={{ color: "white" }}>
            None
          </Text>
        </View>
      );
    }
  };
}

// ViewNotifications.contextTypes = {
//   getTokens: PropTypes.func
// };

export const ViewNotifications = AppSyncComponent(
  ViewNotificationsX,
  getInboxMsgs,
  getActivityMsgs,
  openedNotification,
  deleteNotification
);

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    backgroundColor: "#f2f2f2"
  },
  notificationListItem: {
    flexDirection: "row",
    flex: 1,
    marginTop: 15,
    marginBottom: 15,
    paddingLeft: 0
  },
  iconSection: {
    width: 75,
    marginRight: 0
  },
  baseTagContainer: {
    alignSelf: "flex-start",
    height: 18,
    marginTop: 5,
    marginRight: 5
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 15
  },
  icon: {
    height: 27,
    width: 27,
    alignItems: "center",
    marginTop: 8,
    marginLeft: 8
  },
  arrowDropIcon: {
    height: 25,
    width: 25,
    marginRight: 15
  },
  nTitle: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
    fontFamily: "Roboto",
    paddingBottom: 0
  },
  nDate: {
    fontSize: 10,
    color: "#7c7c7c",
    paddingBottom: 5
  },
  nBody: {
    fontSize: 14,
    color: "black",
    lineHeight: 18,
    fontWeight: "200",
    fontFamily: "Roboto",
    paddingBottom: 5
  },
  archiveButton: {
    backgroundColor: myColors.maroon
  },
  unarchiveButton: {
    backgroundColor: myColors.maroon
  },
  deleteButton: {
    backgroundColor: "#25262a"
  },
  underBtns: {
    flex: 1,
    height: 40,
    justifyContent: "center"
  },
  underBtnsText: {
    color: "white",
    textAlign: "center",
    fontSize: 12
  },
  loadingText: {
    fontSize: 20,
    marginTop: 50,
    fontWeight: "500",
    fontFamily: "Roboto",
    color: "black",
    paddingBottom: 15,
    textAlign: "center"
  },
  loadingSubText: {
    fontSize: 16,
    fontWeight: "200",
    fontFamily: "Roboto",
    color: "black",
    paddingBottom: 2,
    textAlign: "center"
  },
  tagText: {
    fontSize: 12,
    fontWeight: "100",
    fontFamily: "Roboto",
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 5,
    color: "white"
  }
});

const NotificationNav = createAppContainer(
  createMaterialTopTabNavigator(
    {
      Inbox: {
        screen: ViewNotifications
        // navigationOptions: ({navigation}) => ({
        //     tabBarOnPress: ({scene, jumpToIndex}) => {
        //         if (scene.focused === true && scene.route.index === 0) {
        //             return
        //         }
        //         if (scene.focused === false) {
        //             jumpToIndex(scene.index)
        //         }
        //         if (scene.route.index !== 0) {
        //             navigation.setParams({date: new Date(), data: dataToSend})
        //             navigation.popToTop()
        //         }
        //     },
        // })
      },
      Activity: {
        screen: ViewNotifications
        // navigationOptions: ({navigation}) => ({
        //     tabBarOnPress: ({scene, jumpToIndex}) => {
        //         if (scene.focused === true && scene.route.index === 0) {
        //             return
        //         }
        //         if (scene.focused === false) {
        //             jumpToIndex(scene.index)
        //         }
        //         if (scene.route.index !== 0) {
        //             navigation.setParams({date: new Date(), data: dataToSend})
        //             navigation.popToTop()
        //         }
        //     },
        // })
      }
    },
    {
      tabBarPosition: "top",
      tabBarOptions: {
        activeTintColor: "#fea812",
        labelStyle: {
          fontSize: 18,
          fontWeight: "bold",
          fontFamily: "Roboto",
          paddingVertical: 10
        },
        upperCaseLabel: false,
        style: {
          backgroundColor: "#25262a"
        }
      }
    }
  )
);
