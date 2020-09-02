import React from "react";
import {
  View,
  ImageBackground,
  Dimensions,
  Text,
  AsyncStorage,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TouchableHighlight,
  PushNotificationIOS,
  Linking,
  Share,
  AccessibilityInfo,
  findNodeHandle,
  UIManager
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DeviceInfo from "react-native-device-info";
import Analytics from "./../../analytics";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import LinearGradient from "react-native-linear-gradient";

import { clickedAction } from "../gql/Mutations";
import { AppSyncComponent } from "../../authentication/auth_components/appsync/AppSyncApp";

import {
  Api,
  Auth,
  User,
  updateMsgData,
  updateUnreadNotifications
} from "../../../../services";

const { height, width } = Dimensions.get("window");

const myColors = {
  maroon: "#c1003b",
  blue: "#44a0dd",
  orange: "#f77030",
  yellow: "#ffc425",
  tan: "#AFA593",
  green: "#568E14",
  gray: "#828282"
};

const baseUrl = "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod";
const msgUnsecure =
  "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod/msgctr";
// const tokenUnsecure =
//   "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod/tokenpref";
const configs = { service: "execute-api", region: "us-east-1" };

export class ActionsX extends React.PureComponent {
  static navigationOptions = ({ navigation, screenProps }) => ({
    title: "Message Center",
    header: null
  });

  constructor(props) {
    super(props);

    let d = props.navigation.state.params.data;
    if (!d) {
      d = props.navigation.state.params.pushData;
    }

    if (Platform.OS == "ios") {
      PushNotificationIOS.setApplicationIconBadgeNumber(0);
    }

    this.state = {
      actions:
        typeof d.actions == "string" &&
        d.actions != undefined &&
        d.actions != null
          ? JSON.parse(d.actions)
          : d.actions,
      category: d.category,
      action: d.action,
      title: d.title,
      message: d.body,
      pushId: d.pushId,
      sentBy: d.sentBy,
      link: d.link,
      link2: d.link2,
      type: d.type,
      image: d.image,
      reAdd: d.dontReAdd,
      iconType: d.iconType,
      iconName: d.iconName,
      goToPage: d.goToPage,
      extraData: d.extraData != undefined ? d.extraData : "{}",
      iconColor: d.iconColor,
      inboxType: d.inboxType
    };

    User("Actions Constructor").then(resp => {
      this.setState({ username: resp });
    });

    AsyncStorage.multiRemove(["goToPage", "actionsData"]);
  }

  componentDidMount() {
    this.setAccessibilityFocus();
  }

  componentWillUnmount() {
    clearTimeout(this.focusTimeout);
  }

  setAccessibilityFocus() {
    const FOCUS_ON_VIEW = 8;
    const nodeHandle = findNodeHandle(this.focusTitle);
    this.focusTimeout = setTimeout(() => {
      Platform.OS === "ios"
        ? AccessibilityInfo.setAccessibilityFocus(nodeHandle)
        : UIManager.sendAccessibilityEvent(nodeHandle, FOCUS_ON_VIEW);
    }, 300);
  }

  response = answer => {
    const payload = {
      deviceId: DeviceInfo.getUniqueID(),
      pushId: this.state.pushId,
      action: answer,
      inboxType: this.state.inboxType,
      appId: "edu.asu.asumobileapp"
    };

    const navigate = this.props.navigation;

    this.props
      .clickedAction(payload)
      .then(resp => {
        navigate.goBack();
      })
      .catch(err => {
        console.log("Errored writing action");
      });
  };

  openLink = (link, share) => {
    if (share != "Share Now") {
      Linking.canOpenURL(link).then(supported => {
        if (supported) {
          Linking.openURL(link);
        } else {
          console.log("Don't know how to open URI");
        }
      });
    } else {
      const content = {
        message: this.state.message,
        title: this.state.title
      };
      Share.share(content);
    }
  };

  findButtons = (a, resp, link, title) => {

    // let show = "";
    // let btn1 = "";
    // let btn2 = "";
    // let open = "";
    // let responded = resp ? true : false;

    // console.log(
    //   " RESPONDED**********************************",
    //   this.state.goToPage,
    //   this.state.extraData
    // );
    // console.log(title);
    if (title === "Chat Invite") {
      // console.log("within Chat Invite");
      return (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            height: responsiveHeight(5),
            width: width,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 20,
            paddingLeft: 30,
            paddingRight: 30
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row"
            }}
          >
            <TouchableHighlight
              style={[styles.goButton, styles.bottomBtnConfigs]}
              onPress={() => {
                this.props.navigation.navigate("ChatManager");
              }}
            >
              <View style={{}}>
                <Text style={[styles.bottomBtnConfigsText, styles.goText]}>
                  Take me there
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      );
    }

    // console.log("after chat invite");

    if (a == null || a == undefined) {
      return null;
    }

    firstButton = () => {
      if (link || resp == null) {
        return (
          <View
            style={{
              flex: 1,
              flexDirection: "row"
            }}
          >
            <TouchableHighlight
              style={[styles.goButton, styles.bottomBtnConfigs]}
              onPress={() => {
                this.response(a[0].action_id ? a[0].action_id : a[0].id);
                if (link || a[0].text == "Share Now") {
                  this.openLink(link, a[0].text);
                } else if (this.state.goToPage) {
                  this.props.navigation.navigate(
                    this.state.goToPage,
                    JSON.parse(this.state.extraData)
                  );
                }
              }}
            >
              <View style={{}}>
                <Text style={[styles.bottomBtnConfigsText, styles.goText]}>
                  {a[0].text}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        );
      } else {
        return null;
      }
    };

    secondButton = () => {
      if (this.state.link2 || resp == null) {
        return (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end"
            }}
          >
            <TouchableHighlight
              style={[styles.noButton, styles.bottomBtnConfigs]}
              onPress={() => {
                this.response(a[1].action_id ? a[1].action_id : a[1].id);
                if (this.state.link2) {
                  this.openLink(this.state.link2, a[1].text);
                }
              }}
            >
              <View style={{}}>
                <Text style={[styles.bottomBtnConfigsText, styles.noText]}>
                  {a[1].text}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        );
      } else {
        return null;
      }
    };

    if (a && a.length == 2) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            height: responsiveHeight(5),
            width: width,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 20,
            paddingLeft: 30,
            paddingRight: 30
          }}
        >
          {firstButton()}
          {secondButton()}
        </View>
      );
    } else {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            height: responsiveHeight(5),
            width: width,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 20,
            paddingLeft: 30,
            paddingRight: 30
          }}
        >
          {firstButton()}
        </View>
      );
    }
  };

  setImage = img => {
    const imageHeight = Math.round((width * 9) / 16);
    if (img != "" && img != null) {
      return (
        <ImageBackground
          style={
            ([styles.test1],
            { width: width, height: imageHeight, marginTop: -80 })
          }
          source={{ uri: img }}
        >
          <LinearGradient
            colors={[
              "rgba(37, 38, 42, 0.6)",
              "rgba(37, 38, 42, 0.5)",
              "rgba(37, 38, 42, 0)",
              "rgba(37, 38, 42, 0)",
              "rgba(37, 38, 42, 0)",
              "rgba(37, 38, 42, 0)",
              "rgba(37, 38, 42, 0)"
            ]}
            style={styles.test2}
          />
        </ImageBackground>
      );
    } else {
      return null;
    }
  };

  render() {
    let data = this.state;
    let title = data.title;
    let message = data.message;
    let actions = data.actions;
    let action = data.action;
    // const sentBy = data.sentBy ? data.sentBy : "ASU";
    // const time = data.pushId ? data.pushId.slice(-19) : null;
    let image = data.image;
    let type = data.type;
    let iconType = data.iconType;
    let iconName = data.iconName;
    let iconColor = data.iconColor;
    let link = data.link;

    if (iconName == undefined || iconName == null) {
      switch (type) {
        case "alert":
          iconType = "ALERT";
          iconName = "priority-high";
          iconColor = myColors.maroon;
          highlightIcon = true;
          break;
        case "event":
          iconType = "EVENT";
          iconName = "event";
          iconColor = myColors.orange;
          break;
        case "lightening":
          iconType = "ANNOUNCEMENT";
          iconName = "flash-on";
          iconColor = myColors.maroon;
          break;
        case "lightening":
          iconType = "TECHNOLOGY";
          iconName = "flash-on";
          iconColor = myColors.blue;
          break;
        case "star":
          iconType = "NOTICE";
          iconName = "grade";
          iconColor = myColors.yellow;
          break;
        case "parking":
          iconType = "PARKING & TRANSIT";
          iconName = "directions-car";
          iconColor = myColors.green;
          break;
        case "maintenance":
          iconType = "MAINTENANCE";
          iconName = "build";
          iconColor = myColors.tan;
          break;
        case "arts":
          iconType = "CREATIVITY";
          iconName = "color-lens";
          iconColor = myColors.orange;
          break;
        case "lightbulb":
          iconType = "SOLUTIONS";
          iconName = "lightbulb-outline";
          iconColor = myColors.yellow;
          break;
        case "global":
          iconType = "GLOBAL ENGAGEMENT";
          iconName = "public";
          iconColor = myColors.blue;
          break;
        case "trendingup":
          iconType = "ARIZONA IMPACT";
          iconName = "trending-up";
          iconColor = myColors.gray;
          break;
        case "group":
          iconType = "SUN DEVIL LIFE";
          iconName = "group";
          iconColor = myColors.tan;
          break;
        case "search":
          iconType = "DISCOVER";
          iconName = "search";
          iconColor = myColors.green;
          break;
        default:
          iconType = "MESSAGE";
          iconName = "grade";
          iconColor = myColors.tan;
      }
    }

    let text = "";

    if (image == "" || image == null) {
      text = "Message Center";
    }

    let findDot = message ? message.indexOf(" • ") : -1;

    if (findDot != -1) {
      message = message.slice(findDot + 2, 100);
    }

    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        {this.navHeader(text)}
        {this.setImage(image)}
        <View style={[styles.titleBlock]}>
          <View style={{ padding: 25 }}>
            <Text
              style={[styles.typeText, { color: iconColor }]}
              accessible={false}
            >
              {iconType}
            </Text>
            <Text
              style={[styles.titleText]}
              ref={focusTitle => {
                this.focusTitle = focusTitle;
              }}
            >
              {title}
            </Text>
          </View>
        </View>
        <View
          elevation={5}
          style={[styles.iconHolder, { backgroundColor: iconColor }]}
          accessible={false}
        >
          <MaterialIcons
            accessible={false}
            name={iconName}
            size={22}
            color="white"
          />
        </View>
        <ScrollView style={[styles.messageBlock, { height: height * 0.7 }]}>
          <View style={{ padding: 30 }}>
            <Text style={styles.bodyText}>{message}</Text>
          </View>
        </ScrollView>
        {this.findButtons(actions, action, link, title)}
      </View>
    );
  }

  navHeader = text => {
    return (
      <View
        style={[
          styles.navBar,
          { backgroundColor: text == "" ? "transparent" : "#25262a" }
        ]}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.goBack();
            }}
            style={{
              flex: 0,
              justifyContent: "center"
            }}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <MaterialIcons name="navigate-before" size={40} color="white" />
          </TouchableOpacity>
        </View>
        <View
          style={{ flex: 2, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 24,
              textAlign: "center",
              textAlignVertical: "center"
            }}
            accessibilityRole="header"
          >
            {text}
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
          />
        </View>
      </View>
    );
  };
}

export const Actions = AppSyncComponent(ActionsX, clickedAction);

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    margin: 50
  },
  navBar: {
    height: 80,
    backgroundColor: "#25262a",
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: "row",
    zIndex: 100000
  },
  linearGradient: {
    height: 80,
    backgroundColor: "#25262a",
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: "row",
    zIndex: 100000,
    flex: 1,
    overflow: "visible",
    alignItems: "center",
    alignSelf: "stretch"
  },
  test1: {
    flex: 1,
    backgroundColor: "transparent"
  },
  test2: {
    flex: 1,
    height: 80,
    overflow: "visible",
    alignItems: "center",
    alignSelf: "stretch"
  },
  typeText: {
    fontSize: responsiveFontSize(2),
    color: "#f77030",
    fontWeight: "bold",
    fontFamily: "Roboto",
    letterSpacing: 5
  },
  seeAllBtn: {
    backgroundColor: "#990032",
    alignItems: "center",
    height: 75
  },
  titleText: {
    fontSize: responsiveFontSize(3.3),
    fontFamily: "Roboto-Light",
    paddingTop: 10,
    color: "white",
    paddingBottom: 5
  },
  bodyText: {
    fontSize: responsiveFontSize(1),
    lineHeight: responsiveFontSize(3.5),
    fontFamily: "Roboto-Light",
    fontSize: 18,
    fontWeight: "100",
    fontFamily: "Roboto",
    color: "#2A2B30"
  },
  titleBlock: {
    backgroundColor: "#25262a",
    zIndex: 0
  },
  messageBlock: {
    backgroundColor: "white",
    marginTop: -22
  },
  tagText: {
    fontSize: 14,
    fontWeight: "100",
    fontFamily: "Roboto",
    paddingLeft: 5,
    paddingRight: 5,
    marginTop: 1,
    paddingBottom: 5,
    color: "white"
  },
  seeAllText: {
    color: "white",
    fontSize: 20,
    marginTop: 25,
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  subText: {
    fontSize: 15,
    fontWeight: "100",
    fontFamily: "Roboto",
    textAlign: "center"
  },
  bottomBtnConfigs: {
    paddingVertical: responsiveHeight(1.2),
    paddingHorizontal: responsiveWidth(6),
    borderRadius: 3.75
  },
  bottomBtnConfigsText: {
    fontWeight: "400",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(1.8),
    fontFamily: "Roboto-Light"
  },
  buttonCont: {
    alignItems: "center",
    height: 75
  },
  goButton: {
    backgroundColor: "#990032"
  },
  noText: {
    color: "#990032"
  },
  goText: {
    color: "white"
  },
  noButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#990032"
  },
  okayButton: {
    backgroundColor: "#4078c1"
  },
  icon: {
    position: "relative",
    height: 50,
    width: 50,
    backgroundColor: "#f77030"
  },
  iconHolder: {
    position: "relative",
    borderWidth: 3,
    borderColor: "white",
    marginTop: -22,
    marginLeft: 30,
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: "#f77030",
    zIndex: 100,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowRadius: 5,
    shadowOpacity: 1.0,
    justifyContent: "center",
    alignItems: "center"
  },
  groupIcon: {
    fontWeight: "100",
    fontFamily: "Roboto",
    padding: 10
  }
});
