import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ImageBackground,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  AsyncStorage,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import moment from "moment";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

// import { getCovidWellnessResources } from "./Queries";
import {
  getWeeklyHealthCheckUpDetails,
  getCovidWellnessResources,
  // getCampusScheduleQuery,
} from "./Queries";
import WeeklyHealthCheckComponent from "./WeeklyHealthCheckComponent";
import WellnessButton from "../Common/WellnessButton";
import WHCLineItem from "./WHCLineItem";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import useGlobal from "../../functional/global-state/store";
import { DHC } from "../wellness/DailyHealthCheck/index.js";
import Analytics from "../../functional/analytics";
import { Auth } from "../../../services";
import WHCParentOS from "./WHCParentOS";

const mayoIcon = require("../assets/covidWellnessCenter/mayo-icon2x.png");

const styles = StyleSheet.create({
  backgroundImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0)",
  },
  imageContainer: {
    width: "100%",
    height: 360,
  },
  textContainer: {
    marginTop: 130,
    paddingLeft: 15,
  },
  headerBig: {
    fontSize: responsiveFontSize(4.2),
    fontFamily: "Roboto",
    color: "white",
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  // cardButton:{
  //     backgroundColor: "#FFC627",
  //     borderRadius: 20,
  //     width: 220,
  //     height: 40,
  //     borderRadius: 20,
  //     alignItems: "center",
  //     justifyContent: "center"
  // },
  // cardButtonText:{
  //     fontSize: 15,
  //     fontWeight: "bold",
  //     color: "black"
  // },
  cardButtonContainer: {
    paddingHorizontal: 15,
    marginTop: 20,
  },
  mainContainer: {
    backgroundColor: "#F0F0F0",
    padding: 10,
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 15,
    shadowColor: "#777",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
  },
  titleContainer: {
    paddingBottom: 15,
  },
  cardTitleText: {
    fontWeight: "bold",
    fontSize: responsiveFontSize(2.5),
    fontFamily: "Roboto",
    color: "black",
  },
  cardHelpText: {
    fontSize: responsiveFontSize(2),
    fontFamily: "Roboto",
    color: "black",
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    fontSize: responsiveFontSize(1.5),
    fontFamily: "Roboto",
    paddingHorizontal: 2,
  },
  headerContainer: {
    flexDirection: "row",
  },
  backButton: {
    width: 30,
    height: 30,
  },
  backbuttonConatiner: {
    padding: 15,
    flex: 0.5,
  },
  headerRight: {
    alignItems: "flex-end",
    flex: 0.5,
    flexDirection: "row",
  },
});

const WellnessCenterImages = {
  "health-portal-2x.png": {
    url: require("../assets/covidWellnessCenter/health-portal-2x.png"),
  },
  "health-services-2x.png": {
    url: require("../assets/covidWellnessCenter/health-services-2x.png"),
  },
  "covid-testing-2x.png": {
    url: require("../assets/covidWellnessCenter/covid-testing-2x.png"),
  },
  "telehealth-2x.png": {
    url: require("../assets/covidWellnessCenter/telehealth-2x.png"),
  },
  "symptoms-2x.png": {
    url: require("../assets/covidWellnessCenter/symptoms-2x.png"),
  },
  "mayo-info-library-2x.png": {
    url: require("../assets/covidWellnessCenter/mayo-info-library-2x.png"),
  },
  "Group-12-2x.png": {
    url: require("../assets/covidWellnessCenter/Group-12-2x.png"),
  },
  "contact-tracing-2x.png": {
    url: require("../assets/covidWellnessCenter/contact-tracing-2x.png"),
  },
  "daily-health-checks-2x.png": {
    url: require("../assets/covidWellnessCenter/daily-health-checks-2x.png"),
  },
  "wellness-policies-2x.png": {
    url: require("../assets/covidWellnessCenter/wellness-policies-2x.png"),
  },
  "coronavirus-faqs-2x.png": {
    url: require("../assets/covidWellnessCenter/coronavirus-faqs-2x.png"),
  },
  "live-well-2x.png": {
    url: require("../assets/covidWellnessCenter/live-well-2x.png"),
  },
  "Group-12-2x.png": {
    url: require("../assets/covidWellnessCenter/Group-12-2x.png"),
  },
  "virtual-fitness-2x.png": {
    url: require("../assets/covidWellnessCenter/virtual-fitness-2x.png"),
  },
  "support-circles-2x.png": {
    url: require("../assets/covidWellnessCenter/support-circles-2x.png"),
  },
  "asu-counseling-2x.png": {
    url: require("../assets/covidWellnessCenter/asu-counseling-2x.png"),
  },
};

function WellnessCenterComponent(props) {
  const [globalState, globalActions] = useGlobal();
  const analyticsRef = useRef(null);

  const [isStudent, setIsStudent] = useState(false);
  const [displayWeek, setDisplayWeek] = useState(
    globalState.campusWeekSchedule
  );
  const [healthTools, setHealthTools] = useState(null);
  const [mayoResources, setMayoResources] = useState(null);
  const [covidResponseInformation, setCovidResponseInformation] = useState(
    null
  );
  const [communityWellness, setCommunityWellness] = useState(null);
  const [showHealthCheck, setShowHealthCheck] = useState(false);
  const [dow, setDow] = useState(null);
  const [buttonTheme, setButtonTheme] = useState("gold");
  const [buttonText, setButtonText] = useState("Submit Daily Health Check");
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

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

  useEffect(() => {
    Auth()
      .getSession()
      .then((tokens) => {
        setIsOnline(tokens.roleList.includes("online"));
        setIsStudent(tokens.roleList.indexOf("student") > -1);
      });
  }, []);

  useEffect(() => {
    analyticsRef.current.sendData({
      "action-type": "view",
      "starting-screen":
        props.navigation.state.params &&
        props.navigation.state.params.previousScreen
          ? props.navigation.state.params.previousScreen
          : null,
      "starting-section":
        props.navigation.state.params &&
        props.navigation.state.params.previousSection
          ? props.navigation.state.params.previousSection
          : null,
      target: "covid-wellness",
      "resulting-screen": "covid-wellness",
      "resulting-section": null,
    });

    const dowNum = moment().day();
    let dow;
    if (dowNum === 0) {
      dow = "Sunday";
    } else if (dowNum === 1) {
      dow = "Monday";
    } else if (dowNum === 2) {
      dow = "Tuesday";
    } else if (dowNum === 3) {
      dow = "Wednesday";
    } else if (dowNum === 4) {
      dow = "Thursday";
    } else if (dowNum === 5) {
      dow = "Friday";
    } else if (dowNum === 6) {
      dow = "Saturday";
    }
    console.log("dow: ", dow);
    setDow(dow);
  }, []);

  useEffect(() => {
    if (globalState.surveySubmitted) {
      setButtonDisabled(true);
    }
  }, [globalState.surveySubmitted]);

  useEffect(() => {
    // console.log("USE EFFECTING",props)
    if (props.weeklyHealthCheckup.covidGetWeeklyHealthCheckupProd) {
      _retrieveData("campus_week_schedule").then((response) => {
        // console.log("LIVE CARD RESP", response);
        if (response) {
          response = JSON.parse(response);
          const temp = JSON.parse(
            props.weeklyHealthCheckup.covidGetWeeklyHealthCheckupProd.dayStatus
          );

          if (temp[dow] === "completed") {
            setButtonTheme("green");
            setButtonText("Health Check Submitted");
            setButtonDisabled(true);
          }

          days.map((day, index) => {
            if (temp[day] == "default" && response[day] == true) {
              temp[day] = "coming";
            }
          });
          for (
            let i = 0;
            i < 7 &&
            days[i] !=
              props.weeklyHealthCheckup.covidGetWeeklyHealthCheckupProd.today;
            i++
          ) {
            if (displayWeek && displayWeek[days[i]] == "missed") {
              temp[days[i]] = "missed";
            } else if (temp[days[i]] == "coming") {
              temp[days[i]] = "missed";
            }
          }
          setDisplayWeek(temp);
        }
      });
    }
  }, [props, globalState]);

  useEffect(() => {
    const prop_obj = props.getCovidWellnessResources.getCovidWellnessResources;
    console.log("ALL", prop_obj);
    if (prop_obj) {
      setHealthTools(
        prop_obj
          .filter(function(x) {
            return x.type == 1;
          })
          .sort(function(a, b) {
            return a.order - b.order;
          })
      );
      setMayoResources(
        prop_obj
          .filter(function(x) {
            return x.type == 2;
          })
          .sort(function(a, b) {
            return a.order - b.order;
          })
      );
      setCovidResponseInformation(
        prop_obj
          .filter(function(x) {
            return x.type == 3;
          })
          .sort(function(a, b) {
            return a.order - b.order;
          })
      );
      setCommunityWellness(
        prop_obj
          .filter(function(x) {
            return x.type == 4;
          })
          .sort(function(a, b) {
            return a.order - b.order;
          })
      );
    }
  }, [props]);

  pressBackHandler = () => {
    // console.log("PRESS BACK BUTTON!")
    const { navigate } = props.navigation;
    navigate("Home", {
      previousScreen: "covid-wellness",
      previousSection: "covid-wellness",
    });
  };

  dailyHealthCheckPressed = () => {
    setLoading(true);
    // console.log("DailyHealthCheck component");
    setShowHealthCheck(true);
    // const { navigate } = props.navigation;
    // props.navigation.navigate("DailyHealthCheck");
    // props.navigation.navigate("DailyHealthCheck", {previousScreen: "CovidWellness", previousSection: "CovidWellness"});
  };

  if (isOnline) {
    return <WHCParentOS navigation={props.navigation} />;
  } else {
    return (
      <ScrollView>
        <View style={styles.imageContainer}>
          <Analytics ref={analyticsRef} />
          <ImageBackground
            source={require("../assets/hero-health-check-covid-2x.png")}
            style={styles.backgroundImageContainer}
            resizeMode="cover"
          >
            <View style={styles.headerContainer}>
              <TouchableOpacity onPress={() => pressBackHandler()}>
                <View style={styles.backbuttonConatiner}>
                  <Image
                    source={require("../assets/covidWellnessCenter/left.png")}
                    style={styles.backButton}
                  />
                </View>
              </TouchableOpacity>
              {/* <View style={styles.headerRight}>
                              <TouchableOpacity>
                                  <View style={styles.backbuttonConatiner}>
                                      <Image source={require("../assets/covidWellnessCenter/chat.png")} style={styles.backButton} ></Image>
                                  </View>
                                  <View style={styles.backbuttonConatiner}>
                                      <Image source={require("../assets/covidWellnessCenter/notification.png")} style={styles.backButton} ></Image>
                                  </View>
                              </TouchableOpacity>
                          </View> */}
            </View>
            <View style={styles.textContainer}>
              <View>
                <Text allowFontScaling={false} style={styles.headerBig}>
                  ASU COVID-19
                </Text>
                <Text allowFontScaling={false} style={styles.headerBig}>
                  Wellness Center
                </Text>
              </View>
            </View>
            <View style={styles.cardButtonContainer}>
              <WellnessButton
                iconLeft={
                  loading && (
                    <ActivityIndicator
                      size="small"
                      color="maroon"
                      style={{ marginRight: 5 }}
                    />
                  )
                }
                text={buttonText}
                theme={buttonTheme}
                style={{ width: responsiveWidth(65), flexDirection: "row" }}
                onPress={() => dailyHealthCheckPressed()}
                disabled={buttonDisabled}
              />
            </View>
          </ImageBackground>
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.cardContainer}>
            <WeeklyHealthCheckComponent displayType="wellness" />
          </View>
          {
          // <View style={styles.cardContainer}>
          //   <View style={styles.titleContainer}>
          //     <Text allowFontScaling={false} style={styles.cardTitleText}>
          //       Exposure Management
          //     </Text>
          //   </View>
          //   <View style={styles.cardContainer}>
          //     <View style={styles.titleContainer}>
          //       <Text allowFontScaling={false} style={styles.cardHelpText}>
          //         We'd like to let you know if you come in contact with someone
          //         who tests positive for COVID-19
          //       </Text>
          //     </View>
          //     <View style={styles.buttonContainer}>
          //       <WellnessButton
          //         text="Preferences"
          //         theme="gold"
          //         style={{ width: 240 }}
          //         onPress={() => {
          //           analyticsRef.current.sendData({
          //             "action-type": "click",
          //             "starting-screen": "covid-wellness",
          //             "starting-section": "exposure-management",
          //             target: "opt-in-to-exposure-management",
          //             "resulting-screen": "profile-settings",
          //             "resulting-section": null,
          //           });
          //           props.navigation.navigate("ProfileSettings", {
          //             previousScreen: "covid-wellness",
          //             previousSection: "covid-wellness",
          //           });
          //         }}
          //       />
          //       <WellnessButton
          //         text="More info"
          //         theme="gold"
          //         filled={false}
          //         style={{ width: 240 }}
          //         onPress={() => {
          //           analyticsRef.current.sendData({
          //             "action-type": "click",
          //             "starting-screen": "covid-wellness",
          //             "starting-section": "exposure-management",
          //             target: "exposure-management-more-info",
          //             "resulting-screen": "external-browser",
          //             "resulting-section": null,
          //             "action-metadata": {
          //               url: "https://healthcheck.asu.edu",
          //             },
          //           });
          //           props.navigation.navigate("InAppLink", {
          //             url: "https://healthcheck.asu.edu",
          //             title: "Health Check",
          //           });
          //         }}
          //       />
          //     </View>
          //   </View>
          // </View>
        }
          {healthTools && (
            <View style={styles.cardContainer}>
              <View style={styles.titleContainer}>
                <Text allowFontScaling={false} style={styles.cardTitleText}>
                  Health Tools
                </Text>
              </View>
              {healthTools.map((item, index) => {
                return (
                  <WHCLineItem
                    text={item.text}
                    link={isStudent ? item.student_link : item.employee_link}
                    imgUrl={WellnessCenterImages[item.image_name].url}
                    key={index}
                    analyticsRef={analyticsRef}
                    section="health-tools"
                    navigation={props.navigation}
                  />
                );
              })}
            </View>
          )}
          {mayoResources && (
            <View style={styles.cardContainer}>
              <View
                style={[
                  styles.titleContainer,
                  {
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  },
                ]}
              >
                <Text style={styles.cardTitleText}>Mayo Resources</Text>
                <Image
                  style={{ width: 28, height: 24 }} //style={{width: 72, height: 58}}
                  source={mayoIcon}
                />
              </View>
              {mayoResources.map((item, index) => {
                if (item.text != "Mayo Chatbot1") {
                  return (
                    // <WHCLineItem text={item.text} link={item.link} imgUrl={WellnessCenterImages[item.image_name].url} key={index}/>
                    <WHCLineItem
                      text={item.text}
                      navigation={props.navigation}
                      link="MayoClinicLibrary"
                      imgUrl={WellnessCenterImages[item.image_name].url}
                      key={index}
                    />
                  );
                }
              })}
            </View>
          )}
          {covidResponseInformation && (
            <View style={styles.cardContainer}>
              <View style={styles.titleContainer}>
                <Text allowFontScaling={false} style={styles.cardTitleText}>
                  COVID Response Information
                </Text>
              </View>
              {covidResponseInformation.map((item, index) => {

                if( item.text !== "Exposure Management" ) {
                  return (
                    <WHCLineItem
                      text={item.text}
                      link={isStudent ? item.student_link : item.employee_link}
                      analyticsRef={analyticsRef}
                      imgUrl={WellnessCenterImages[item.image_name].url}
                      key={index}
                      section="covid-response-information"
                      navigation={props.navigation}
                    />
                  );
                } else {
                  return null;
                }

              })}
            </View>
          )}
          {communityWellness && (
            <View style={styles.cardContainer}>
              <View style={styles.titleContainer}>
                <Text allowFontScaling={false} style={styles.cardTitleText}>
                  Community Wellness
                </Text>
              </View>
              {communityWellness.map((item, index) => {
                return (
                  <WHCLineItem
                    text={item.text}
                    link={isStudent ? item.student_link : item.employee_link}
                    imgUrl={WellnessCenterImages[item.image_name].url}
                    key={index}
                    analyticsRef={analyticsRef}
                    section="community-wellness"
                    navigation={props.navigation}
                  />
                );
              })}
            </View>
          )}
          {showHealthCheck && (
            <DHC
              {...props}
              toggleParent={(e) => {
                setShowHealthCheck(e);
              }}
              stopLoading={(e) => {
                setLoading(false);
              }}
              displayType="wellness"
            />
          )}
        </View>
      </ScrollView>
    );
  }
}

export default WHCParent = AppSyncComponent(
  WellnessCenterComponent,
  getCovidWellnessResources,
  getWeeklyHealthCheckUpDetails
);
