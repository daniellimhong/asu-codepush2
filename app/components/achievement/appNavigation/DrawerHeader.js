import React from "react";
import {
  View,
  TouchableOpacity,
  AsyncStorage,
  ImageBackground,
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  UIManager,
  Text,
} from "react-native";
import { StackActions } from "react-navigation";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  responsiveFontSize,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import DeviceInfo from "react-native-device-info";
import _ from "lodash";
import { EventRegister } from "react-native-event-listeners";

import styles from "./styles";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics";
import WellnessButton from "../Common/WellnessButton";

const menuHero = require("../assets/menu-hero2.png");
const currentScreenName = "home";

export default class DrawerHeaderContent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      student_status: false,
      quickItems: []
    };
    this.isTorchOn = false;
  }

  static defaultProps = {
    settings: {},
  };

  componentDidMount() {
    this.refs.analytics.sendData({
      eventtime: new Date().getTime(),
      "action-type": "view",
      "starting-screen": null,
      "starting-section": null,
      target: "App Opened",
      "resulting-screen": "home",
      "resulting-section": null,
    });
    tracker.trackEvent("Navigation", "App Started");
    let manufacturer = DeviceInfo.getManufacturer();
    let model = DeviceInfo.getModel();
    let systemName = DeviceInfo.getSystemName();
    let systemVersion = DeviceInfo.getSystemVersion();
    let buildNumber = DeviceInfo.getBuildNumber().toString();
    let uniqueID = DeviceInfo.getUniqueID();
    const deviceInfoString = `${manufacturer} ${model}, ${systemName} ${systemVersion}, BuildNumber: ${buildNumber}, UniqueID: ${uniqueID}`;
    this._retrieveData("buildNumber").then((response) => {
      if (response !== buildNumber) {
        tracker.trackEvent("device-analytics", deviceInfoString);
        this._storeData("buildNumber", buildNumber);
        this._storeData("deviceInfo", deviceInfoString);
      } else {
        this._storeData("buildNumber", buildNumber);
        this._storeData("deviceInfo", deviceInfoString);
      }
    });

    this.props.settings.getTokens().then((tokens) => {
      this.setState({
        student_status: tokens.roleList.indexOf("student") > -1
      });
    });

    this.listener = EventRegister.addEventListener(
      "chatStatusUpdated",
      (data) => {
        this.forceUpdate();
      }
    );

    //Temporary - need to move to backend per role
    const studentItems = ['Home','ChatManager','MyFriends', 'Directory']
    const nonStudentItems = ['Home','Directory','Maps','ProfileSettings']
    let finalList = [];
    this.props.quickItems.map((item) => {
      if (this.props.settings.roles.indexOf("student") > -1 ) {
       if (studentItems.indexOf(item.key) > -1) {
          finalList.push(item)
       }
      } else {
        if (nonStudentItems.indexOf(item.key) > -1) {
          finalList.push(item)
        }
      }
    });
    this.setState({
      quickItems: finalList
    })
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);
  }

  _retrieveData = async (itemToRetrieve) => {
    try {
      const value = await AsyncStorage.getItem(itemToRetrieve);
      if (value !== null) {
        // We have data!!
        return value;
      } else {
        console.log("no data has been set");
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  _storeData = async (key, whatToSave) => {
    try {
      await AsyncStorage.setItem(key, whatToSave);
      return true;
    } catch (error) {
      return false;
    }
  };

  componentWillUnmount() {
    clearTimeout(this.focusTimeout);
  }

  setAccessibilityFocus() {
    const FOCUS_ON_VIEW = 8;
    const nodeHandle = findNodeHandle(this.focusCloseButton);
    this.focusTimeout = setTimeout(() => {
      Platform.OS === "ios"
        ? AccessibilityInfo.setAccessibilityFocus(nodeHandle)
        : UIManager.sendAccessibilityEvent(nodeHandle, FOCUS_ON_VIEW);
    }, 600);
  }

  render() {
    return (
      <View style={styles.flexOne}>
        <ImageBackground source={menuHero} style={styles.menuHero}>
          <Analytics ref="analytics" />
          <View style={styles.menuHeroContent}>
            <View>
              <TouchableOpacity
                onPress={() => {
                  this.refs.analytics.sendData({
                    eventtime: new Date().getTime(),
                    "action-type": "click",
                    "starting-screen": currentScreenName,
                    "starting-section": "drawer-menu",
                    target: "CLOSE",
                    "resulting-screen": currentScreenName
                      ? currentScreenName
                      : null,
                    "resulting-section": null,
                  });
                  tracker.trackEvent("Click", "Drawer_HomeButton");
                  this.props.navigation.closeDrawer();
                }}
                accessibilityLabel="Close menu"
                accessibilityRole="button"
                ref={(focusCloseButton) => {
                  this.focusCloseButton = focusCloseButton;
                }}
              >
                <Icon name="close" size={responsiveFontSize(4)} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          {this.props.settings && this.props.settings.user !== "" && (
            <DrawerUserInfo
              guest={this.props.settings.user === "guest"}
              isearch={this.props.settings.isearchData}
              navigation={this.props.navigation}
            />
          )}
          {/* <View style={{flexDirection:"row", paddingHorizontal: 15, marginVertical:10}}>
              {DailyHealthCheckTag(false)}
            </View> */}
          {renderQuickLinks(
            this.state.quickItems.slice(0, 4),
            this.props.navigation
          )}
        </ImageBackground>
      </View>
    );
  }
}

const DrawerUserInfo = (props) => {
  const { navigate } = props.navigation;
  const { isearch } = props;
  let name = "Guest";

  if (isearch && isearch.displayName) {
    name = isearch.displayName;
  }

  const salutatioText = "Hello,";

  return (
    <TouchableOpacity
      disabled={props.guest}
      onPress={() => {
        props.navigation.dispatch(StackActions.popToTop());
        navigate("MyProfile", {
          asurite: isearch.asuriteId,
          previousScreen: currentScreenName,
          previousSection: "drawer-menu",
        });
      }}
      accessible={props.guest}
      accessibilityLabel={`${name}'s Profile`}
      accessibilityRole="button"
    >
      <View style={styles.userInfoContainer}>
        <View style={styles.salutationContainer}>
          <Text style={styles.salutationText}>{salutatioText}</Text>
        </View>
        <View style={name.length < 15 ? styles.displayNameContainer : styles.displayNameContainerLong}>
          <Text adjustsFontSizeToFit numberOfLines={2} style={styles.userDisplayNameText}>
            {name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const renderQuickLinks = (quickItems, navigation) => (
  <View style={styles.quickLinkContainerBox}>
    <View style={styles.quickLinkContainer}>
      {quickItems.map((item) => (
        <WellnessButton
          key={item.routeName}
          text={item.params.quickLinkLabel}
          theme={"gold"}
          // height={responsiveHeight(5)}
          onPress={() => {
            item.routeName === "Home"
              ? navigation.closeDrawer()
              : (navigation.dispatch(StackActions.popToTop()),
                navigation.navigate(item.routeName, {
                  previousScreen: currentScreenName,
                  previousSection: "drawer-menu",
                  navigation: navigation
                }));
          }}
          style={styles.wellnessButton}
          textStyle={styles.wellnessButtonText}
        />
      ))}
    </View>
  </View>
);
