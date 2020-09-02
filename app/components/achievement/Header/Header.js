// Implement Drawer-left Navigator
// Implement Drawer-right Navigator

import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  findNodeHandle,
  AccessibilityInfo,
  Platform,
  AppState,
  UIManager
} from "react-native";
import { DefaultText as Text } from "../../presentational/DefaultText.js";
import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { AuthStatus } from "../../functional/authentication/auth_components/weblogin";
import Analytics from "./../../functional/analytics";
import { tracker } from "../google-analytics.js";
import {
  getUnreadNotifications,
  setUnreadNotifications,
  updateUnreadNotifications
} from "../../../services";
import HeaderNotification from "./HeaderNotification";
import RoleSelection from "./RoleSelection";

/**
 * Home Screen app header that contains navigation to the drawer as
 * well as the notifications page
 */
export class Header extends React.PureComponent {
  constructor(props) {
    //
    super(props);
    this.state = {
      unread: 0
    };

    this.updateUnreadNum = this.updateUnreadNum.bind(this);
  }

  componentDidMount() {
    tracker.trackEvent("View", "Header");

    updateUnreadNotifications(this.context.getTokens).then(resp => {
      getUnreadNotifications().then(res => {
        this.setState({ unread: res });
      });
    });

    AppState.addEventListener("change", this._checkStatus);

    this._interval = setInterval(() => {
      getUnreadNotifications().then(res => this.setState({ unread: res }));
    }, 5000);

  }

  _checkStatus = state => {
    if (state == "active") {

      this._interval = setInterval(() => {
        getUnreadNotifications().then(res => this.setState({ unread: res }));
      }, 5000);

    } else {
      clearInterval(this._interval);
    }
  };

  componentDidUpdate() {
    this.setAccessibilityFocus();
  }

  componentWillUnmount() {
    clearInterval(this._interval);
    clearTimeout(this.focusTimeout);
  }

  setAccessibilityFocus() {
    const FOCUS_ON_VIEW = 8;
    const nodeHandle = findNodeHandle(this.focusHeading);
    this.focusTimeout = setTimeout(() => {
      Platform.OS === "ios"
        ? AccessibilityInfo.setAccessibilityFocus(nodeHandle)
        : UIManager.sendAccessibilityEvent(nodeHandle, FOCUS_ON_VIEW);
    }, 450);
  }

  render() {
    const { navigate } = this.props.navigation;

    return (
      <View>
        <RoleSelection />
        <View>
          <Analytics ref="analytics" />
          <View style={{ height: 75, backgroundColor: "white" }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                paddingHorizontal: 15
              }}
            >
              <View style={{ flexDirection: "column", flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    flex: 1,
                    justifyContent: "flex-start",
                    alignItems: "center"
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      this.refs.analytics.sendData({
                        "action-type": "click",
                        "starting-screen": "Home",
                        "starting-section": null, 
                        "target": "hamburger-menu",
                        "resulting-screen": "Home", 
                        "resulting-section": "drawer-menu",
                      });
                      tracker.trackEvent("Click", "Header_DrawerOpen");
                      this.props.navigation.openDrawer();
                    }}
                    style={{
                      flex: 0,
                      justifyContent: "center"
                    }}
                    accessibilityLabel="Menu"
                    accessibilityRole="button"
                    ref={focusHeading => {
                      this.focusHeading = focusHeading;
                    }}
                  >
                    <Icon name="menu" size={35} color="#464646" />
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden"
                }}
              >
                <Image
                  style={{
                    resizeMode: "contain",
                    width: 85
                  }}
                  source={require("./asu-logo.png")}
                />
              </View>
              <View style={{ flexDirection: "column", flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    flex: 1,
                    justifyContent: "flex-end",
                    alignItems: "center"
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      this.refs.analytics.sendData({
                        "action-type": "click",
                        "starting-screen": "Home",
                        "starting-section": null, 
                        "target": "notification-icon",
                        "resulting-screen": "notifications", 
                        "resulting-section": null,
                      });
                      tracker.trackEvent("Click", "Header_Notifications");
                      navigate("Notifications", {
                        data: this.state.username,
                        updateUnreadNum: this.updateUnreadNum
                      });
                    }}
                    style={{ flex: 0, justifyContent: "center", width: 27 }}
                    accessibilityLabel="Notifications"
                    accessibilityRole="button"
                  >
                    <View>
                      {this.showAlert(this.state.unread)}
                      <FontAwesome name="bell" size={26} color="#464646" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <AuthStatus />
          <HeaderNotification />
        </View>
      </View>
    );
  }

  showAlert = num => {
    if (num > 0) {
      return (
        <View style={styles.notificationAlert}>
          <Text style={styles.notificationAlertText}>{num}</Text>
        </View>
      );
    } else {
      return null;
    }
  };

  updateUnreadNum = () => {
    var temp = this.state.unread;
    if (temp > 0) {
      temp = temp - 1;
      this.setState({ unread: temp });
      setUnreadNotifications(temp);
    }
  };

}
Header.contextTypes = {
  getTokens: PropTypes.func
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 75,
    paddingTop: 25,
    backgroundColor: "white",
    padding: 10
  },
  notificationAlert: {
    height: 14,
    width: 14,
    backgroundColor: "#ff004b",
    borderRadius: 7,
    position: "absolute",
    marginTop: 1,
    marginLeft: 14,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: "#fff",
    overflow: "visible"
  },
  notificationAlertText: {
    color: "white",
    fontSize: 7,
    zIndex: 6,
    textAlign: "center",
    paddingTop: 1,
    backgroundColor: "transparent"
  }
});
