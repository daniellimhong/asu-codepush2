import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  ScrollView,
  Image,
  Dimensions,
  StyleSheet,
  View,
  Switch,
  TouchableWithoutFeedback,
  TouchableOpacity,
  AsyncStorage,
  ActivityIndicator,
  ImageBackground
} from 'react-native';

import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

import { AppSyncComponent } from "../../../functional/authentication/auth_components/appsync/AppSyncApp";
import Analytics from "../../../functional/analytics";
import { SettingsContext } from "../../../achievement/Settings/Settings";
import { Auth } from "../../../../services/auth";
import { EventRegister } from "react-native-event-listeners";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import LinearGradient from "react-native-linear-gradient";

import {
  getCovidPermissionsContent,
  getCovidPermissions
} from "./../gql/Queries";

import {
  setCovidOnboardPermissionsMutation
} from "./../gql/Mutations";

function ContactTracingContent(props) {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const [healthRecordsSwitch, setHealthRecordsSwitch] = useState(false);
  const [locationTrackingSwitch, setLocationTrackingSwitch] = useState(false);
  const [pushNotificationSwitch, setPushNotificationSwitch] = useState(false);
  const [emailSwitch, setEmailSwitch] = useState(false);

  const [loadingPush, setLoadingPush] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingTestResults, setLoadingTestResults] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [covidPermissionsContent, setCovidPermissionsContent] = useState(null);
  const [screen, setScreen] = useState(props.navigation.state.params.screen ? props.navigation.state.params.screen : 1);
  let analyticsRef = useRef(null);

  useEffect(() => {
    // console.log("Covid Props on change of props:", props.covidPermissions);
    if (props.covidPermissions) {
      setLocationTrackingSwitch(props.covidPermissions.share_location);
      setHealthRecordsSwitch(props.covidPermissions.share_health_records);
      setPushNotificationSwitch(props.covidPermissions.push_notifications);
      setEmailSwitch(props.covidPermissions.email_notifications);
    }
    if (props.covidPermissionsContent) {
      setCovidPermissionsContent(props.covidPermissionsContent);
    }
  }, [props]);

  // useEffect(() => {
  //   if (!isSubscribed) {
  //     setIsSubscribed(true, () => {
  //       props.subscribeToPermissionUpdates();
  //     });
  //   }
  // },[])

  const togglePermission = (name, status) => {
    // console.log("Toggle Switch called",name);
    if (name === "share_health_records" && healthRecordsSwitch !== status) {
      mutatePermissions({ type: "update", payload: { share_health_records: status } });
      // setHealthRecordsSwitch(status);
    } else if (name === "share_location" && locationTrackingSwitch !== status) {
      mutatePermissions({ type: "update", payload: { share_location: status } });
      // setLocationTrackingSwitch(status);
    } else if (name === "push_notifications" && pushNotificationSwitch !== status) {
      // console.log("Changing- push:",status,"Email:", emailSwitch)
      if (!emailSwitch && !status) {
        props.setToast("Cannot disable email and push notifications together.")
      } else {
        mutatePermissions({ type: "update", payload: { push_notifications: status } });
        // setPushNotificationSwitch(status);
      }
    } else if (name === "email_notifications" && emailSwitch !== status) {
      // console.log("Changing- push:",pushNotificationSwitch,"Email:", status)
      if (!pushNotificationSwitch && !status) {
        props.setToast("Cannot disable email and push notifications together.")
      } else {
        mutatePermissions({ type: "update", payload: { email_notifications: status } });
        // setEmailSwitch(status);
      }
    }
  }

  const _storeData = async (key, whatToSave) => {
    try {
      await AsyncStorage.setItem(key, whatToSave);
      return true;
    } catch (error) {
      return false;
    }
  };

  const _retrieveData = async (itemToRetrieve) => {
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

  mutatePermissions = (permissionsPayload) => {
    // console.log("Payload: ", permissionsPayload);
    if (props.client) {
      return props.client
        .mutate({
          mutation: setCovidOnboardPermissionsMutation,
          variables: permissionsPayload
        })
        .then(resp => {
          setLoadingPush(false);
          setLoadingEmail(false);
          setLoadingLocation(false);
          setLoadingTestResults(false);
          // console.log("mutation response from covid tracing", resp); // Debug option
          if (pushNotificationSwitch !== resp.data.setCovidOnboardPermissions.push_notifications) {
            EventRegister.emit("updatePermissions", resp.data.setCovidOnboardPermissions);
            setPushNotificationSwitch(resp.data.setCovidOnboardPermissions.push_notifications);
            analyticsRef.current.sendData({
              "action-type": "click",
              "starting-screen": "covid-permissions",
              "starting-section": null,
              "target": "toggle-covid-push-remainder-settings",
              "resulting-screen": "covid-permissions",
              "resulting-section": null,
              "action-metadata": {
                "value": resp.data.setCovidOnboardPermissions.push_notifications
              }
            });
          }
          if (locationTrackingSwitch !== resp.data.setCovidOnboardPermissions.share_location) {
            setLocationTrackingSwitch(resp.data.setCovidOnboardPermissions.share_location);
            EventRegister.emit("updatePermissions", resp.data.setCovidOnboardPermissions);
            analyticsRef.current.sendData({
              "action-type": "click",
              "starting-screen": "covid-permissions",
              "starting-section": null,
              "target": "toggle-covid-share-location-settings",
              "resulting-screen": "covid-permissions",
              "resulting-section": null,
              "action-metadata": {
                "value": resp.data.setCovidOnboardPermissions.share_location
              }
            });
          }
          if (healthRecordsSwitch !== resp.data.setCovidOnboardPermissions.share_health_records) {
            setHealthRecordsSwitch(resp.data.setCovidOnboardPermissions.share_health_records);
            EventRegister.emit("updatePermissions", resp.data.setCovidOnboardPermissions);
            analyticsRef.current.sendData({
              "action-type": "click",
              "starting-screen": "covid-permissions",
              "starting-section": null,
              "target": "toggle-covid-share-test-records-settings",
              "resulting-screen": "covid-permissions",
              "resulting-section": null,
              "action-metadata": {
                "value": resp.data.setCovidOnboardPermissions.share_health_records
              }
            });
          }
          if (emailSwitch !== resp.data.setCovidOnboardPermissions.email_notifications) {
            setEmailSwitch(resp.data.setCovidOnboardPermissions.email_notifications);
            EventRegister.emit("updatePermissions", resp.data.setCovidOnboardPermissions);
            analyticsRef.current.sendData({
              "action-type": "click",
              "starting-screen": "covid-permissions",
              "starting-section": null,
              "target": "toggle-covid-email-notification-settings",
              "resulting-screen": "covid-permissions",
              "resulting-section": null,
              "action-metadata": {
                "value": resp.data.setCovidOnboardPermissions.email_notifications
              }
            });
          }
        })
        .catch(e => {
          props.settings.SetToast(
            "Something went wrong. Please try again."
          );
          console.log("submission error", e);
        });
    } else {
      props.settings.SetToast(
        "Something went wrong. Please try again."
      );
      return Promise.reject("No client");
    }
  }

  onBack = () => {
    // console.log("OnBack pressed");
    props.navigation.goBack();
  }

  //Commented by Abhik Dey for flickering issue
  /*  function TabBar() {
      return(
        <View style={styles.tabBarParent}>
          <View style={styles.tabBarLayout}>
            <View style={styles.tabBarLeftContainer}>
            <TouchableOpacity
              key={"back_button"}
              onPress={() => {
                // console.log("On back cliked inside")
                props.navigation.goBack();
              }}
              style={styles.notificationIconContainer}
              accessibilityRole="button">
                <Image source={require('../../../achievement/assets/covidWellnessCenter/left.png')}
                  style={styles.notificationIcon} />
            </TouchableOpacity>
            </View>
            <View style={styles.tabBarRightContainer}>
              {/* <Image source={require('../../assets/covid/icons/chat.png')}
                  style={styles.notificationIcon} />
              <Image source={require('../../assets/covid/icons/notification.png')}
                  style={styles.notificationIcon} /> *//*}
</View>
</View>
</View>
);
}

function HeroImage() {
if(screen===2){
return(
<Image source={require('../../assets/covid/hero/hero-permissions-check.png')}
style={styles.heroImage} />
);
} else {
return(
<Image source={require('../../assets/covid/hero/hero-exposure.png')}
style={styles.heroImage} />
);
}
}


function Title() {
if(screen===2){
return(
<View style={styles.headerText}>
<Text style={styles.boldWhiteText20}>Daily Health{'\n'}Checks</Text>
</View>
);
} else {
return(
<View style={styles.headerText}>
<Text style={styles.boldWhiteText20}>Exposure{'\n'}Management</Text>
</View>
);
}
}

function Header() {
return(
<View>
<HeroImage/>
<Title/>
<TabBar/>
</View>
);
}*/

  function TabBarHeaders() {
    return (
      <View>
        <ScrollView horizontal={true} nestedScrollEnabled={true}>
          <View style={{ backgroundColor: "#ffffff", flexDirection: "row", paddingStart: 10, paddingEnd: 10 }}>
          {
            // <TouchableWithoutFeedback
            //   onPress={() => {
            //     // console.log("Exposure manangment clicked");
            //     if (screen !== 1) {
            //       analyticsRef.current.sendData({
            //         "action-type": "click",
            //         "starting-screen": "covid-permissions",
            //         "starting-section": "daily-healthcheck",
            //         "target": "toggle-covid-share-test-records-settings",
            //         "resulting-screen": "covid-permissions",
            //         "resulting-section": "exposure-management"
            //       });
            //     }
            //     setScreen(1);
            //   }}
            //   style={styles.settingsButton}
            // >
            //   <View style={styles.horizScrollItemContainer}>
            //     <Text style={styles.horizontalBarItemText}>Exposure Management</Text>
            //     {screen === 1 && <View style={styles.tabBarActiveBar} />}
            //   </View>
            // </TouchableWithoutFeedback>
          }
            <TouchableWithoutFeedback
              onPress={() => {
                // console.log("Daily Health Check clicked");
                if (screen !== 2) {
                  analyticsRef.current.sendData({
                    "action-type": "click",
                    "starting-screen": "covid-permissions",
                    "starting-section": "exposure-management",
                    "target": "toggle-covid-share-test-records-settings",
                    "resulting-screen": "covid-permissions",
                    "resulting-section": "daily-healthcheck"
                  });
                }
                setScreen(2);
              }}
              style={styles.settingsButton}
            >
              <View style={styles.horizScrollItemContainer}>
                <Text style={styles.horizontalBarItemText}>Daily Health Checks</Text>
                {screen === 2 && <View style={styles.tabBarActiveBar} />}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </ScrollView>
      </View>
    );
  }

  function Status(props) {
    // console.log("Get Status:", props.status);
    var loadingView = (
      <View style={styles.loaderStyle}>
        <ActivityIndicator size={"small"} animating={true} color="maroon" />
      </View>
    );
    if (props.status) {
      return (
        <View style={styles.switchContainer}>
          <View accessible accessibilityLabel="On. Button">
            <FontAwesome
              name="toggle-on"
              color="#FFC627"
              size={responsiveFontSize(6)}
            />
          </View>
          {props.loading && loadingView}
        </View>
      );
    } else {
      return (
        <View style={styles.switchContainer}>
          <View accessible accessibilityLabel="Off. Button">
            <FontAwesome
              name="toggle-on"
              style={{ transform: [{ rotate: "180deg" }] }}
              color="#b8bdc4"
              size={responsiveFontSize(6)}
            />
          </View>
          {props.loading && loadingView}
        </View>
      );
    }
  }

  function PermissionsToggle() {
    if (screen === 2) {
      return (
        <View style={styles.permissionsContainer}>
          <View
            style={[
              styles.settingsTextBox,
              { flexDirection: "row", backgroundColor: "white" }
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.normalText}>Remind me via <Text style={{ fontWeight: "bold" }}> push notification</Text></Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setLoadingPush(true);
                togglePermission("push_notifications", !pushNotificationSwitch)
              }}
              style={styles.settingsButton}
            >
              <Status status={pushNotificationSwitch} loading={loadingPush} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.settingsTextBox,
              { flexDirection: "row", backgroundColor: "white" }
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.normalText}>Remind me via <Text style={{ fontWeight: "bold" }}> email</Text></Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setLoadingEmail(true);
                togglePermission("email_notifications", !emailSwitch)
              }}
              style={styles.settingsButton}
            >
              <Status status={emailSwitch} loading={loadingEmail} />
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.permissionsContainer}>
          <View
            style={[
              styles.settingsTextBox,
              { flexDirection: "row", backgroundColor: "white" }
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.normalText}>Share COVID <Text style={{ fontWeight: "bold" }}>test related</Text> health records</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setLoadingTestResults(true);
                togglePermission("share_health_records", !healthRecordsSwitch)
              }}
              style={styles.settingsButton}
            >
              <Status status={healthRecordsSwitch} loading={loadingTestResults} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.settingsTextBox,
              { flexDirection: "row", backgroundColor: "white" }
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.normalText}>Share my <Text style={{ fontWeight: "bold" }}>location</Text> for exposure management</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setLoadingLocation(true);
                togglePermission("share_location", !locationTrackingSwitch)
              }}
              style={styles.settingsButton}
            >
              <Status status={locationTrackingSwitch} loading={loadingLocation} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }

  function Bullet({ text }) {
    return (
      <View style={styles.row}>
        <View style={styles.bullet}>
          <Text style={styles.normalText}>{'\u2022' + " "}</Text>
        </View>
        <View style={styles.bulletText}>
          <Text style={styles.normalText}>{text}</Text>
        </View>
      </View>
    );
  }

  function RenderContent() {
    if (covidPermissionsContent != null) {
      var contents = sortObjectEntries(covidPermissionsContent, "screen");
      contents = contents[screen - 1].contents
      contents = sortObjectEntriesAfterParsing(contents, "position");
      // console.log("Contents sorted::::::", contents);
      return (
        <View style={styles.contentContainer}>
          {
            contents.map((section, index) => {
              return (
                <Section section={section} />
              )
            })
          }
        </View>
      )
    }
    return null;
  }

  function Section(props) {
    var section = JSON.parse(props.section);
    return (
      <View style={styles.bodyBlock}>
        {section.title !== null && <Text style={styles.boldText14}>{section.title}</Text>}
        {section.content !== null && <Text style={[styles.normalText, (section.isItalics ? styles.italicText : {})]}>{section.content}</Text>}
        {/* {section.bullets &&
          section.bullets.map((bulletText,index) => {
            return(
              <Bullet text={bulletText}/>
            )
          })
        } */}
      </View>
    )
  }

  function sortObjectEntries(obj, key) {
    return obj.sort((a, b) => a[key] - b[key])
  }

  function sortObjectEntriesAfterParsing(obj, key) {
    return obj.sort((a, b) => JSON.parse(a)[key] - JSON.parse(b)[key])
  }

  function Body() {
    return (
      <View>
        <TabBarHeaders />
        <LinearGradient style={styles.gradientSeparator} colors={["#a9a9a9", "#ffffff"]} style={{ flex: 1 }}>
          <View style={styles.seapratorGradientBlock} />
        </LinearGradient>
        <View style={styles.mainContentContainer}>
          <PermissionsToggle />
          <View style={styles.separator} />
          <RenderContent />
        </View>
      </View>
    );
  }

  //Changes by Abhik Dey for flickering issue - Start
  const HeaderText = () => {
    return (
      screen === 2 ?
        <View style={styles.headerText}>
          <Text style={styles.boldWhiteText20}>Daily Health{'\n'}Checks</Text>
        </View>
        :
        <View style={styles.headerText}>
          <Text style={styles.boldWhiteText20}>Exposure{'\n'}Management</Text>
        </View>
    );
  }

  const BackArrowNav = () => {
    return (
      <View style={styles.tabBarParent}>
        <View style={styles.tabBarLayout}>
          <View style={styles.tabBarLeftContainer}>
            <TouchableOpacity
              key={"back_button"}
              onPress={() => {
                props.navigation.goBack();
              }}
              style={styles.notificationIconContainer}
              accessibilityRole="button">
              <Image source={require('../../../achievement/assets/covidWellnessCenter/left.png')}
                style={styles.notificationIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  //Changes by Abhik Dey for flickering issue - End

  return (
    <ScrollView>
      <View style={styles.heroImageContainer} >
        <Analytics ref={analyticsRef} />
        <ImageBackground
          source={screen === 2 ? require("../../assets/covid/hero/hero-permissions-check.png")
                               : require("../../assets/covid/hero/hero-exposure.png")}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <HeaderText />
          <BackArrowNav />
        </ImageBackground>
      </View>
      <View style={styles.container}>
        {/*<Analytics ref={analyticsRef} />
        <Header />*//* Commented by Abhik Dey*/}
        <Body />
      </View>
    </ScrollView>
  );
}

const ContactTracingContentWithData = AppSyncComponent(
  ContactTracingContent,
  getCovidPermissions,
  getCovidPermissionsContent
);

class ContactTracingComponent extends React.Component {
  render() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <ContactTracingContentWithData {...this.props} setToast={settings.SetToast} />
        )}
      </SettingsContext.Consumer>
    );
  }
}

export default ContactTracingComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentContainer: {
    paddingTop: 5,
    paddingBottom: 10,
    paddingStart: 10,
    paddingEnd: 10
  },
  mainContentContainer: {
    paddingBottom: 10,
    paddingStart: 10,
    paddingEnd: 10,
    paddingTop: 5
  },
  permissionsContainer: {
    paddingStart: 10,
    paddingEnd: 10,
    paddingBottom: 5
  },
  //Commented by Abhik Dey for flickering issue
  /*heroImage: {
    width:Dimensions.get('window').width,
    height:Dimensions.get('window').width
  },*/

  //CSS changes by Abhik Dey for flickering issue - Start
  heroImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0)",
  },
  heroImageContainer: {
    width: "100%",
    height: 360,
  },
  //CSS changes by Abhik Dey for flickering issue - Start
  tabBarParent: {
    position: "absolute",
    flex: 1,
    left: 0,
    right: 0,
  },
  headerText: {
    position: "absolute",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: Dimensions.get('window').width,
    padding: 20
  },
  tabBarLayout: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  notificationIcon: {
    height: 30,
    width: 30
  },
  notificationIconContainer: {
    padding: 20,
    height: 50,
    width: 50,
    zIndex: 10
  },
  tabBarLeftContainer: {
    flexDirection: "row"
  },
  tabBarRightContainer: {
    flexDirection: "row"
  },
  horizScrollItemContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    paddingTop: 15,
    paddingBottom: 10,
    paddingStart: 10,
    paddingEnd: 10,
  },
  horizontalBarItemText: {
    color: "black",
    fontWeight: "bold",
    fontSize: responsiveFontSize(2.1),
    textAlign: "center",
    fontFamily: "Roboto"
  },
  tabBarActiveBar: {
    height: 3,
    width: '100%',
    backgroundColor: "#FDC426",
    marginTop: 5
  },
  settingsTextBox: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  normalText: {
    fontSize: responsiveFontSize(1.9),
    color: "black",
    fontFamily: "Roboto"
  },
  boldWhiteText20: {
    fontSize: responsiveFontSize(5),
    fontFamily: "Roboto",
    color: "white",
    fontWeight: "bold"
  },
  separator: {
    height: 1,
    backgroundColor: "#a9a9a9",
    marginBottom: 5,
  },
  gradientSeparator: {
    height: 5,
    marginBottom: 5,
  },
  seapratorGradientBlock: {
    height: 5
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    flex: 1,
    marginVertical: 4
  },
  bullet: {
    width: 10
  },
  bulletText: {
    flex: 1,
    paddingStart: 5
  },
  boldText15: {
    color: "black",
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(2.1),
  },
  boldText14: {
    color: "black",
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(2.0),
  },
  italicText: {
    fontStyle: 'italic',
    color: "black",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(1.9)
  },
  bodyBlock: {
    paddingVertical: 10
  },
  loaderStyle: {
    position: "absolute",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  switchContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  }
});
