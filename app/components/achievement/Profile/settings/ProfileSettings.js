import React, { useState, useEffect } from "react";
import {
  View,
  Dimensions,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
  Linking,
  AsyncStorage,
  ActivityIndicator
} from "react-native";
import PropTypes from "prop-types";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import _ from "lodash";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Permissions from "react-native-permissions";
import Analytics from "../../../functional/analytics";
import { ErrorWrapper } from "../../../functional/error/ErrorWrapper";
import { SettingsContext } from "../../Settings/Settings";
import { AppSyncComponent } from "../../../functional/authentication/auth_components/appsync/AppSyncApp";
import WeeklyHealthModal from "../../CovidWellnessCenter/WeeklyHealthModal";
import useGlobal from "../../../functional/global-state/store";
import text from "./blurb_text.json";
import { EventRegister } from "react-native-event-listeners";

import {
  getCovidPermissions
} from "../../../functional/covid/gql/Queries";

import { setCovidOnboardPermissionsMutation } from "../../../functional/covid/gql/Mutations";
import { Auth } from "../../../../services";

const { height, width } = Dimensions.get("window");
const defaultImg = "https://i.ebayimg.com/images/g/MRkAAOxyHIlTbPRW/s-l640.jpg";

const myColors = {
  maroon: "#c1003b",
  blue: "#44a0dd",
  orange: "#f77030",
  yellow: "#ffc425",
  tan: "#AFA593",
  green: "#568E14",
  gray: "#828282"
};

const dataToSend = [];

function CovidSettings(props) {
  const [globalState, globalActions] = useGlobal();
  const [isFaculty, setIsFaculty] = useState(false);
  // const [isSubscribed, setIsSubscribed] = useState(false);

  const [covidPushReminder, setCovidPushReminder] = useState(true);
  const [covidEmailReminder, setCovidEmailReminder] = useState(false);
  const [covidShareTestResults, setCovidShareTestResults] = useState(true);
  const [covidShareLocation, setCovidShareLocation] = useState(false);

  const [loadingPush, setLoadingPush] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingTestResults, setLoadingTestResults] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [covidRemindViaPushBlurb, setCovidRemindViaPushBlurb] = useState("");
  const [covidRemindViaEmailBlurb, setCovidRemindViaEmailBlurb] = useState("");
  const [covidLocationTrackingBlurb, setCovidLocationTrackingBlurb] = useState(
    ""
  );
  const [covidTestRecordsBlurb, setCovidTestRecordsBlurb] = useState("");

  let listener;
  useEffect(() => {
    Auth()
      .getSession()
      .then(tokens => {
        setIsFaculty(!(tokens.roleList.indexOf("student") > -1));
      });
    setCovidRemindViaPushBlurb(text.covid_remind_via_push);
    setCovidRemindViaEmailBlurb(text.covid_remind_via_email);
    setCovidLocationTrackingBlurb(text.covid_location_tracking);
    setCovidTestRecordsBlurb(text.covid_daily_health_checks);
    // trySub();
    listener = EventRegister.addEventListener("updatePermissions", data => {
      if (data) {
        setCovidShareLocation(data.share_location);
        setCovidShareTestResults(data.share_health_records);
        setCovidPushReminder(data.push_notifications);
        setCovidEmailReminder(data.email_notifications);
      }
    });
    const removeListener = () => {
      // console.log("Event listener removing");
      EventRegister.removeEventListener(listener);
    }
    return removeListener;
  }, []);

  // const trySub = () => {
  //   if (!isSubscribed) {
  //     setIsSubscribed(true);
  //     props.subscribeToPermissionUpdates();
  //   }
  // };

  useEffect(() => {
    if (props.covidPermissions) {
      setCovidShareLocation(props.covidPermissions.share_location);
      setCovidShareTestResults(props.covidPermissions.share_health_records);
      setCovidPushReminder(props.covidPermissions.push_notifications);
      setCovidEmailReminder(props.covidPermissions.email_notifications);
    }
  }, [props]);


  useEffect(() => {
    _retrieveData("show_weekly_modal").then(response => {
      if (response && response === "true") {
        globalActions.setPreviousScreenAndSection({"screen":"profile-settings","section":"daily-health-check-schedule"});
        globalActions.setShowCampusModal(true);
        _storeData("show_weekly_modal", "false");
      }
    });
  }, [isFaculty]);

  const _retrieveData = async itemToRetrieve => {
    try {
      const value = await AsyncStorage.getItem(itemToRetrieve);
      if (value !== null) {
        // We have data!!
        return value;
      } else {
        console.log("no data has been set");
      }
    } catch (error) {
      console.log("Error retrieving Data:", error)
    }
  };

  const _storeData = async (key, whatToSave) => {
    try {
      await AsyncStorage.setItem(key, whatToSave);
      return true;
    } catch (error) {
      return false;
    }
  };

  const mutatePermissions = permissionsPayload => {
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
          if (
            covidPushReminder !==
            resp.data.setCovidOnboardPermissions.push_notifications
          ) {
            setCovidPushReminder(
              resp.data.setCovidOnboardPermissions.push_notifications
            );
            props.analytics.sendData({
              "action-type": "click",
              "starting-screen": "profile-settings",
              "starting-section": null,
              "target": "toggle-covid-push-remainder-settings",
              "resulting-screen": "profile-setting",
              "resulting-section": null,
              "action-metadata":{
                "value": resp.data.setCovidOnboardPermissions.push_notifications
              }
            });
          }
          if (
            covidShareLocation !==
            resp.data.setCovidOnboardPermissions.share_location
          ) {
            setCovidShareLocation(
              resp.data.setCovidOnboardPermissions.share_location
            );
            props.analytics.sendData({
              "action-type": "click",
              "starting-screen": "profile-settings",
              "starting-section": null,
              "target": "toggle-covid-share-location-settings",
              "resulting-screen": "profile-setting",
              "resulting-section": null,
              "action-metadata":{
                "value": resp.data.setCovidOnboardPermissions.share_location
              }
            });
          }
          if (
            covidShareTestResults !==
            resp.data.setCovidOnboardPermissions.share_health_records
          ) {
            setCovidShareTestResults(
              resp.data.setCovidOnboardPermissions.share_health_records
            );
            props.analytics.sendData({
              "action-type": "click",
              "starting-screen": "profile-settings",
              "starting-section": null,
              "target": "toggle-covid-share-test-records-settings",
              "resulting-screen": "profile-setting",
              "resulting-section": null,
              "action-metadata":{
                "value": resp.data.setCovidOnboardPermissions.share_health_records
              }
            });
          }
          if (
            covidEmailReminder !==
            resp.data.setCovidOnboardPermissions.email_notifications
          ) {
            setCovidEmailReminder(
              resp.data.setCovidOnboardPermissions.email_notifications
            );
            props.analytics.sendData({
              "action-type": "click",
              "starting-screen": "profile-settings",
              "starting-section": null,
              "target": "toggle-covid-email-notification-settings",
              "resulting-screen": "profile-setting",
              "resulting-section": null,
              "action-metadata":{
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
  };

  function HealthCheckSchedule() {
    return (
      <TouchableOpacity
        onPress={() => {
          props.analytics.sendData({
            "action-type": "click",
            "starting-screen": "profile-settings",
            "starting-section": null,
            "target": "Daily Health Check Schedule",
            "resulting-screen": "profile-setting",
            "resulting-section": "weekly-health-check-modal"
          });
          globalActions.setPreviousScreenAndSection({"screen":"profile-settings","section":"daily-health-check-schedule"});
          globalActions.setShowCampusModal(true);
        }}
        style={[
          styles.settingsTextBox,
          { backgroundColor: "white", flexDirection: "row" }
        ]}
        accessble
        accessibilityLabel="Set a custom schedule for days working"
        accessibilityRole="link"
      >
        <Text style={[styles.toggleText, {flex:1,justifyContent:"center"}]}>
          {"Set a custom schedule for days working"}
        </Text>
        <MaterialIcons
          name="keyboard-arrow-right"
          size={36}
          style={{
            textAlign: "right"
          }}
          color="#929292"
        />
      </TouchableOpacity>
    );
  }

  function SectionHeader() {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>
          Daily Health Check Schedule
        </Text>
      </View>
    );
  }

  function SectionHeaderClickable({ title, analytics_title, screen }) {
    return (
      <TouchableOpacity
        onPress={() => {
          props.analytics.sendData({
            "action-type": "click",
            "starting-screen": "profile-settings",
            "starting-section": null,
            target: analytics_title,
            "resulting-screen": "covid-permissions",
            "resulting-section": screen==1?"exposure-management":"daily-healthcheck"
          });
          // console.log("Clicked:", analytics_title);
          props.navigation.navigate("CovidContractTracing", {
            screen
          });
        }}
        style={[
          styles.sectionHeader,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }
        ]}
        accessble
        accessibilityLabel={title}
        accessibilityRole="link"
      >
        <Text style={[styles.sectionHeaderText]}>{title}</Text>
        <MaterialIcons
          name="keyboard-arrow-right"
          size={36}
          style={{
            textAlign: "right"
          }}
          color="#929292"
        />
      </TouchableOpacity>
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

  function CovidReminderSettings() {
    return (
      <View>
        <SectionHeaderClickable
          title="Daily Health Check Reminders"
          analytics_title="click-covid-daily-health-check-reminders"
          screen={2}
        />
        <View
          style={[
            styles.settingsTextBox,
            { flexDirection: "row", backgroundColor: "white" }
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleText}>{covidRemindViaPushBlurb}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              // console.log("Push Notifications Status:", covidPushReminder);
              // console.log(
              //   "covidTestRecordsDeactivated Status:",
              //   covidShareTestResults
              // );
              // console.log(
              //   "covidRemindViaEmailDeactivated Status:",
              //   covidEmailReminder
              // );
              // console.log(
              //   "covidLocationTrackingDeactivated Status:",
              //   covidShareLocation
              // );
              if (!covidEmailReminder && covidPushReminder) {
                props.settings.SetToast(
                  "Cannot disable email and push notifications together."
                );
              } else {
                // setCovidPushReminder(!covidPushReminder);
                setLoadingPush(true);
                mutatePermissions({
                  type: "update",
                  payload: { push_notifications: !covidPushReminder }
                });
                // props.analytics.sendData({
                //   "action-type": "click",
                //   "starting-screen": "profile-settings",
                //   "starting-section": null,
                //   target: "toggle-covid-remind-via-push-check",
                //   "resulting-screen": "profile-settings",
                //   "resulting-section": null,
                //   "action-metadata":{
                //     "covid-remind-via-push-check-status":!covidPushReminder?"activated":"deactivated"
                //   }
                // });
              }
            }}
            style={styles.settingsButton}
          >
            <Status status={covidPushReminder} loading={loadingPush} />
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.settingsTextBox,
            { flexDirection: "row", backgroundColor: "white" }
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleText}>{covidRemindViaEmailBlurb}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              // console.log("Push Notifications Status:", covidPushReminder);
              // console.log(
              //   "covidTestRecordsDeactivated Status:",
              //   covidShareTestResults
              // );
              // console.log(
              //   "covidRemindViaEmailDeactivated Status:",
              //   covidEmailReminder
              // );
              // console.log(
              //   "covidLocationTrackingDeactivated Status:",
              //   covidShareLocation
              // );
              if (!covidPushReminder && covidEmailReminder) {
                props.settings.SetToast(
                  "Cannot disable email and push notifications together."
                );
              } else {
                // setCovidEmailReminder(!covidEmailReminder);
                setLoadingEmail(true);
                mutatePermissions({
                  type: "update",
                  payload: { email_notifications: !covidEmailReminder }
                });
                // props.analytics.sendData({
                //   "action-type": "click",
                //   "starting-screen": "profile-settings",
                //   "starting-section": null,
                //   target: "toggle-covid-remind-via-email",
                //   "resulting-screen": "profile-settings",
                //   "resulting-section": null,
                //   "action-metadata":{
                //     "covid-remind-via-email":!covidEmailReminder?"activated":"deactivated"
                //   }
                // });
              }
            }}
            style={styles.settingsButton}
          >
            <Status status={covidEmailReminder} loading={loadingEmail}/>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function CovidContactTracingSettings() {

    return null;
    //
    // return (
    //   <View>
    //     <SectionHeaderClickable
    //       title="COVID Exposure Management"
    //       analytics_title="click-covid-exposure-management"
    //       screen={1}
    //     />
    //     <View
    //       style={[
    //         styles.settingsTextBox,
    //         { flexDirection: "row", backgroundColor: "white" }
    //       ]}
    //     >
    //       <View style={{ flex: 1 }}>
    //         <Text style={styles.toggleText}>{covidTestRecordsBlurb}</Text>
    //       </View>
    //       <TouchableOpacity
    //         onPress={() => {
    //           // console.log("Push Notifications Status:", covidPushReminder);
    //           // console.log(
    //           //   "covidTestRecordsDeactivated Status:",
    //           //   covidShareTestResults
    //           // );
    //           // console.log(
    //           //   "covidRemindViaEmailDeactivated Status:",
    //           //   covidEmailReminder
    //           // );
    //           // console.log(
    //           //   "covidLocationTrackingDeactivated Status:",
    //           //   covidShareLocation
    //           // );
    //
    //           // setCovidShareTestResults(!covidShareTestResults);
    //           setLoadingTestResults(true);
    //           mutatePermissions({
    //             type: "update",
    //             payload: { share_health_records: !covidShareTestResults }
    //           });
    //         }}
    //         style={styles.settingsButton}
    //       >
    //         <Status status={covidShareTestResults} loading={loadingTestResults}/>
    //       </TouchableOpacity>
    //     </View>
    //     <View
    //       style={[
    //         styles.settingsTextBox,
    //         { flexDirection: "row", backgroundColor: "white" }
    //       ]}
    //     >
    //       <View style={{ flex: 1 }}>
    //         <Text style={styles.toggleText}>{covidLocationTrackingBlurb}</Text>
    //       </View>
    //       <TouchableOpacity
    //         onPress={() => {
    //           // console.log("Push Notifications Status:", covidPushReminder);
    //           // console.log(
    //           //   "covidTestRecordsDeactivated Status:",
    //           //   covidShareTestResults
    //           // );
    //           // console.log(
    //           //   "covidRemindViaEmailDeactivated Status:",
    //           //   covidEmailReminder
    //           // );
    //           // console.log(
    //           //   "covidLocationTrackingDeactivated Status:",
    //           //   covidShareLocation
    //           // );
    //           // setCovidShareLocation(!covidShareLocation);
    //           setLoadingLocation(true);
    //           mutatePermissions({
    //             type: "update",
    //             payload: { share_location: !covidShareLocation }
    //           });
    //           // this.refs.analytics.sendData({
    //           //   "action-type": "click",
    //           //   "starting-screen": "profile-settings",
    //           //   "starting-section": null,
    //           //   target: "toggle-covid-remind-via-push-check",
    //           //   "resulting-screen": "profile-settings",
    //           //   "resulting-section": null,
    //           //   "action-metadata":{
    //           //     "covid-remind-via-push-check-status":!covidRemindViaPushDeactivated?"activated":"deactivated"
    //           //   }
    //           // });
    //         }}
    //         style={styles.settingsButton}
    //       >
    //         <Status status={covidShareLocation} loading={loadingLocation}/>
    //       </TouchableOpacity>
    //     </View>
    //   </View>
    // );
  }

  return (
    <View>
      <CovidReminderSettings />
      {isFaculty && <SectionHeader />}
      {isFaculty && <HealthCheckSchedule />}
      {
      // <CovidContactTracingSettings />
      }
    </View>
  );
}

class ProfileSettingsContent extends React.Component {
  static navigationOptions = ({ navigation, screenProps }) => ({
    header: null
  });

  static defaultProps = {
    social: null,
    academic: null,
    setPermissions: () => null,
    settings: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      location: false,
      academic: false,
      events: false,
      push: false,
      notBlurb: "",
      locBlurb: "",
      shrBlurb: "",
      chatDeactivated: false,
      isSubscribedToPermissions: false
    };
  }

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "view",
      "starting-screen": this.props.previousScreen
        ? this.props.previousScreen
        : this.props.navigation.state.params.previousScreen
        ? this.props.navigation.state.params.previousScreen
        : null,
      "starting-section": this.props.previousSection
        ? this.props.previousSection
        : this.props.navigation.state.params.previousSection
        ? this.props.navigation.state.params.previousSection
        : null,
      target: this.props.target ? this.props.target : "Preferences",
      "resulting-screen": "profile-settings",
      "resulting-section": null
    });
    const d = require("./temp_permissions.json");
    Auth()
      .getSession()
      .then(tokens => {
        this.setState({
          isFaculty: !(tokens.roleList.indexOf("student") > -1)
        });
      });
    this.setState({
      location: d.location,
      academic: this.props.academic,
      events: d.events,
      social: this.props.social,
      push: d.push,
      inapp: d.inapp,
      notBlurb: text.notification,
      locBlurb: text.location,
      shrBlurb: text.sharing,
      chatBlurb: text.chat,
      covidRemindViaEmailBlurb: text.covid_remind_via_email,
      covidRemindViaPushBlurb: text.covid_remind_via_push,
      covidHealthCheckBlurb: text.covid_daily_health_checks,
      covidTestRecordsBlurb: text.covid_test_records,
      covidLocationTrackingBlurb: text.covid_location_tracking,
      chatDeactivated: this.props.settings.chatSettings.chatDeactivated
    });
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({ location: true });
      },
      error => {
        this.setState({ location: false });
      }
    );
    // console.log("Props in Settings:", this.props.covidPermissions);
    if (Platform.OS === "ios") {
      Permissions.request("notification", { type: ["alert"] }).then(
        response => {
          if (response == "authorized") {
            this.setState({ push: true });
          } else {
            this.setState({ push: false });
          }
        }
      );
    }
    // this.trySub();
  }

  // trySub = () => {
  //   const { isSubscribedToPermissions } = this.state;
  //   const { subscribeToPermissionUpdates } = this.props;
  //   if (!isSubscribedToPermissions) {
  //     this.setState({ isSubscribedToPermissions: true }, () => {
  //       subscribeToPermissionUpdates();
  //       console.log("Subscribing to permissions");
  //     });
  //   }
  // };

  sectionHeader = title => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
      </View>
    );
  };

  sectionHeaderClickable = (title, analytics_title, screen) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.refs.analytics.sendData({
            "action-type": "click",
            "starting-screen": "profile-settings",
            "starting-section": null,
            target: analytics_title,
            "resulting-screen": "profile-settings",
            "resulting-section": null
          });
          // console.log("Clicked:", analytics_title);
          this.props.navigation.navigate("CovidContractTracing", {
            screen
          });
        }}
        style={[
          styles.sectionHeader,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }
        ]}
        accessble
        accessibilityLabel={title}
        accessibilityRole="link"
      >
        <Text style={[styles.sectionHeaderText]}>{title}</Text>
        <MaterialIcons
          name="keyboard-arrow-right"
          size={36}
          style={{
            textAlign: "right"
          }}
          color="#929292"
        />
      </TouchableOpacity>
    );
  };

  privacy = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.refs.analytics.sendData({
            "action-type": "click",
            "starting-screen": "profile-settings",
            "starting-section": null,
            target: "View Privacy policy",
            "resulting-screen": "in-app-browser",
            "resulting-section": null
          });
          this.props.navigation.navigate("InAppLink", {
            url: "https://www.asu.edu/privacy/",
            title: "Privacy Policy"
          });
        }}
        style={[
          styles.settingsTextBox,
          { backgroundColor: "white", flexDirection: "row" }
        ]}
        accessble
        accessibilityLabel="View ASU's Privacy Policy"
        accessibilityRole="link"
      >
        <Text style={[styles.toggleText, {}]}>
          {"View ASU's Privacy Policy"}
        </Text>
        <MaterialIcons
          name="keyboard-arrow-right"
          size={36}
          style={{
            textAlign: "right"
          }}
          color="#929292"
        />
      </TouchableOpacity>
    );
  };

  healthCheckSchedule = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.refs.analytics.sendData({
            "action-type": "click",
            "starting-screen": "profile-settings",
            "starting-section": null,
            target: "Daily Health Check Schedule",
            "resulting-screen": "set-weekly-health-check-modal",
            "resulting-section": null
          });
        }}
        style={[
          styles.settingsTextBox,
          { backgroundColor: "white", flexDirection: "row" }
        ]}
        accessble
        accessibilityLabel="Set a custom schedule for days working"
        accessibilityRole="link"
      >
        <Text style={[styles.toggleText, {}]}>
          {"Set a custom schedule for days working"}
        </Text>
        <MaterialIcons
          name="keyboard-arrow-right"
          size={36}
          style={{
            textAlign: "right"
          }}
          color="#929292"
        />
      </TouchableOpacity>
    );
  };

  blurb = text => {
    return (
      <View style={[styles.blurbBox, { backgroundColor: "white" }]}>
        <Text style={styles.blurbText}>{text}</Text>
      </View>
    );
  };

  toggleBtn = (text, id, status) => {
    if (id == "location" || id == "push") {
      if (Platform.OS != "ios") {
      } else {
        return (
          <View
            style={[
              styles.settingsTextBox,
              { flexDirection: "row", backgroundColor: "white" }
            ]}
          >
            <Text style={styles.toggleText}>{text}</Text>
            <TouchableWithoutFeedback
              onPress={() => {
                this.toggleMe(id);
              }}
              accessble
              accessibilityLabel={status ? "on" : "off"}
              style={styles.settingsButton}
            >
              {this.getStatus(status)}
            </TouchableWithoutFeedback>
          </View>
        );
      }
    } else {
      return (
        <View
          style={[
            styles.settingsTextBox,
            { flexDirection: "row", backgroundColor: "white" }
          ]}
        >
          <View style={{ flex: 1 }}>
            {/* <View style={{width:width*.80}}> */}
            <Text style={styles.toggleText}>{text}</Text>
          </View>
          <View
            style={{
              justifyContent: "center",
              alignItem: "center",
              backgroundColor: "white",
              paddingRight: responsiveWidth(2)
            }}
          >
            <TouchableWithoutFeedback
              style={{ width: width * 0.2 }}
              onPress={() => {
                this.toggleMe(id);
              }}
              accessible={false}
            >
              {this.getStatus(status)}
            </TouchableWithoutFeedback>
          </View>
        </View>
      );
    }
  };

  toggleMe = item => {
    switch (item) {
      case "location":
        if (Platform.OS === "ios") {
          Linking.openURL("app-settings:");
        }
        this.setState({
          location: !this.state.location
        });
        break;
      case "academic":
        this.setState({
          academic: !this.state.academic
        });
        break;
      case "events":
        this.setState({
          events: !this.state.events
        });
        break;
      case "push":
        if (Platform.OS === "ios") {
          Linking.openURL("app-settings:");
        }
        this.setState({
          push: !this.state.push
        });
        break;
    }
  };

  getStatus = s => {
    // console.log("Get Status:", s);
    if (s) {
      return (
        <View accessible accessibilityLabel="On. Button">
          <FontAwesome
            name="toggle-on"
            color="#FFC627"
            size={responsiveFontSize(6)}
          />
        </View>
      );
    } else {
      return (
        <View accessible accessibilityLabel="Off. Button">
          <FontAwesome
            name="toggle-on"
            style={{ transform: [{ rotate: "180deg" }] }}
            color="#b8bdc4"
            size={responsiveFontSize(6)}
          />
        </View>
      );
    }
  };

  renderChatSettings() {
    const { settings } = this.props;
    const { chatSettings } = settings;
    const { chatDeactivated } = this.state;
    if ((!chatDeactivated || chatSettings.optedOut) && settings.student) {
      return (
        <View>
          {this.sectionHeader("Chat")}
          {this.blurb(this.state.chatBlurb)}
          <View
            style={[
              styles.settingsTextBox,
              { flexDirection: "row", backgroundColor: "white" }
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleText}>CHAT CAPABILITY</Text>
            </View>
            <TouchableWithoutFeedback
              onPress={() => {
                this.setState({
                  chatDeactivated: !chatDeactivated
                });
                settings.setChatStatus(!chatDeactivated);
                this.refs.analytics.sendData({
                  "action-type": "click",
                  "starting-screen": "profile-settings",
                  "starting-section": null,
                  target: "toggle-chat",
                  "resulting-screen": "profile-settings",
                  "resulting-section": null,
                  "action-metadata": {
                    "chat-status": chatDeactivated ? "activated" : "deactivated"
                  }
                });
              }}
              style={styles.settingsButton}
            >
              {this.getStatus(!chatDeactivated)}
            </TouchableWithoutFeedback>
          </View>
        </View>
      );
    } else {
      return null;
    }
  }

  mutatePermissions(permissionsPayload) {
    // console.log("Payload: ", permissionsPayload);
    if (this.props.client) {
      return this.props.client
        .mutate({
          mutation: setCovidOnboardPermissionsMutation,
          variables: permissionsPayload
        })
        .then(resp => {
          console.log("mutation response from profile", resp); // Debug option
        })
        .catch(e => {
          console.log("submission error", e);
        });
    } else {
      return Promise.reject("No client");
    }
  }

  render() {
    const { settings } = this.props;
    return (
      <ScrollView style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        {this.renderChatSettings()}

        <CovidSettings {...this.props} analytics={this.refs.analytics} />

        {this.sectionHeader("Privacy Policy")}
        {this.privacy()}

        {this.sectionHeader("Location")}
        {this.blurb(this.state.locBlurb)}
        {this.toggleBtn("LOCATION SERVICES", "location", this.state.location)}

        {settings && settings.student ? this.sectionHeader("Sharing") : null}
        {settings && settings.student ? this.blurb(this.state.shrBlurb) : null}
        {settings && settings.student ? (
          <View>
            <View
              style={[
                styles.settingsTextBox,
                { flexDirection: "row", backgroundColor: "white" }
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleText}>SHARE ACADEMIC INFO</Text>
              </View>
              <TouchableWithoutFeedback
                onPress={() => {
                  this.props.setPermissions({
                    academic: !this.state.academic,
                    social: this.state.social
                  });
                  this.setState({
                    academic: !this.state.academic
                  });
                }}
                style={styles.settingsButton}
              >
                {this.getStatus(this.state.academic)}
              </TouchableWithoutFeedback>
            </View>
            <View
              style={[
                styles.settingsTextBox,
                { flexDirection: "row", backgroundColor: "white" }
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleText}>SHARE SOCIAL INFO</Text>
              </View>
              <TouchableWithoutFeedback
                onPress={() => {
                  this.props.setPermissions({
                    academic: this.state.academic,
                    social: !this.state.social
                  });
                  this.setState({
                    social: !this.state.social
                  });
                }}
                style={styles.settingsButton}
              >
                {this.getStatus(this.state.social)}
              </TouchableWithoutFeedback>
            </View>
          </View>
        ) : null}

        {/* {this.toggleBtn("SHARE ACADEMIC INFO","academic",this.state.academic)}
            {this.toggleBtn("SHARE EVENT INFO","events",this.state.events)} */}

        {this.sectionHeader("Notifications")}
        {this.blurb(this.state.notBlurb)}
        {this.toggleBtn("RECEIVE PUSH NOTIFICATIONS", "push", this.state.push)}
        {/* <WeeklyHealthModal/> */}
      </ScrollView>
    );
  }
}

const ProfileSettingsContentWithData = AppSyncComponent(
  ProfileSettingsContent,
  getCovidPermissions
);

export class ProfileSettings extends React.Component {
  render() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <ErrorWrapper>
            <ProfileSettingsContentWithData
              {...this.props}
              settings={settings}
            />
          </ErrorWrapper>
        )}
      </SettingsContext.Consumer>
    );
  }
}

class PermissionToggleButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      status: false
    };
  }

  static defaultProps = {
    permission: null,
    status: false,
    setPermissions: () => null
  };

  componentDidUpdate(prevProps) {
    if (prevProps.status !== this.props.status) {
      this.setState({
        status: this.props.status[this.props.permission]
      });
    }
  }

  componentDidMount(prevProps) {
    this.setState({
      status: this.props.status[this.props.permission]
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          this.toggleMe();
        }}
        accessble={false}
      >
        <View
          style={{
            // backgroundColor:"black",
            height: responsiveHeight(5),
            width: responsiveWidth(20),
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {this.getStatus(this.state.status)}
        </View>
      </TouchableWithoutFeedback>
    );
  }

  toggleMe = () => {
    const newPerms = { ...this.props.status };
    newPerms[this.props.permission] = !this.props.status[this.props.permission];
    this.setState({
      status: !this.state.status
    });
    this.props.setPermissions({ ...newPerms });
  };

  getStatus = s => {
    if (s) {
      return (
        <View
          accessible
          accessibilityLabel="Status on. Button"
          accessibilityRole="button"
        >
          <FontAwesome
            name="toggle-on"
            color="#8ccac7"
            size={responsiveFontSize(6)}
            style={{
              backgroundColor: "rgba(0,0,0,0)"
            }}
          />
        </View>
      );
    } else {
      return (
        <View
          accessible
          accessibilityLabel="Status off. Button"
          accessibilityRole="button"
        >
          <FontAwesome
            name="toggle-on"
            style={{
              transform: [{ rotate: "180deg" }],
              backgroundColor: "rgba(0,0,0,0)"
            }}
            color="#bbbbbb"
            size={responsiveFontSize(6)}
          />
        </View>
      );
    }
  };
}

const styles = StyleSheet.create({
  sectionHeader: {
    backgroundColor: "#f1f1f1",
    borderColor: myColors.gray,
    borderWidth: 0.5,
    paddingVertical: responsiveHeight(1.4),
    fontFamily: "Roboto",
    paddingHorizontal: responsiveWidth(3.5)
  },
  sectionHeaderText: {
    fontSize: responsiveFontSize(2.3),
    fontWeight: "500",
    fontFamily: "Roboto",
    color: "black"
  },
  settingsTextBox: {
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: myColors.gray,
    borderWidth: 0.5,
    paddingVertical: responsiveHeight(1.4),
    paddingHorizontal: responsiveWidth(5)
  },
  loaderStyle: {
    position: "absolute",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  switchContainer:{
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  toggleText: {
    fontSize: responsiveFontSize(2.0),
    fontFamily: "Roboto",
    color: "black"
  },
  blurbBox: {
    borderColor: myColors.gray,
    borderWidth: 0.5,
    paddingVertical: responsiveHeight(1.4),
    paddingHorizontal: responsiveWidth(5)
  },
  blurbText: {
    fontSize: responsiveFontSize(1.9),
    fontFamily: "Roboto",
    color: "black"
  },
  settingsButton: {
    alignItems: "center",
    justifyContent: "center"
  }
});
