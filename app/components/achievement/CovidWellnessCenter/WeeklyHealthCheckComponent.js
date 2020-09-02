import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ImageBackground,
  AsyncStorage,
  ActivityIndicator,
  AppState,
} from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";

import {
  getWeeklyHealthCheckUpDetails,
  getCampusScheduleQuery,
} from "./Queries";

import useGlobal from "../../functional/global-state/store";
import WeeklyHealthModal from "./WeeklyHealthModal";
import { Auth } from "../../../services/auth";
import { Api } from "../../../services/api";
import { DHC } from "../wellness/DailyHealthCheck/index.js";
import Analytics from "../../functional/analytics";

const WHCStyles = StyleSheet.create({
  header: {},
  title: {
    fontSize: responsiveFontSize(1.75),
    color: "#B1B1B1",
    fontWeight: "bold",
  },
  headerBold: {
    fontWeight: "bold",
    color: "black",
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 20,
  },
  bubble: {
    borderRadius: 50,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: "black",
  },
  todayBubble: {
    borderRadius: 50,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: "black",
  },
  bubbleText: {
    color: "black",
    fontWeight: "bold",
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "black",
    marginVertical: 5,
  },
  todayContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

const covidCardStyles = StyleSheet.create({
  CardContainer: {
    flex: 1,
  },
  backgroundImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0)",
  },
  imageContainer: {
    // maxHeight: 282,
    width: "100%",
    height: "70%",
  },
  textContainer: {
    paddingTop: 20,
    paddingLeft: 15,
  },
  header: {
    fontSize: responsiveFontSize(2.5),
    fontFamily: "Roboto",
    color: "white",
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  headerBig: {
    fontSize: responsiveFontSize(3.2),
    fontFamily: "Roboto",
    color: "white",
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  middleTextContainer: {
    // flex: 0.9
    marginTop: "10%",
    paddingRight: 15,
  },
  middleText: {
    color: "white",
    fontSize: responsiveFontSize(1.5),
    fontFamily: "Roboto",
    fontWeight: "bold",
  },
  cardButton: {
    backgroundColor: "#FFC627",
    borderRadius: 20,
    width: responsiveWidth(70),
    fontFamily: "Roboto",
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  cardButtonText: {
    fontSize: responsiveFontSize(1.5),
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: "black",
    paddingHorizontal: 3,
  },
  mainContainer: {
    padding: 15,
  },
});

function WeeklyHealthCheck(props) {
  // console.log("props 1", props);
  const [globalState, globalActions] = useGlobal();
  const [colorScheme, setColorScheme] = useState({
    default: {
      borderColor: "#78BE20",
      backgroundColor: "#FFFFFF",
    },
    coming: {
      borderColor: "#DBDBDB",
      backgroundColor: "#DBDBDB",
    },
    missed: {
      borderColor: "#DBDBDB",
      backgroundColor: "#DBDBDB",
    },
    completed: {
      borderColor: "#78BE20",
      backgroundColor: "#78BE20",
    },
  });

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const [displayWeek, setDisplayWeek] = useState(
    globalState.campusWeekSchedule
  );
  const [today, setToday] = useState(null);
  const [submitButton, setSubmitButton] = useState({
    disabled: false,
    text: "Submit Daily Health Check",
    color: "null",
  });
  // const [modalWeek , setModalWeek] = useState(globalState.campusWeekSchedule);
  const [isStudent, setStudent] = useState(false);
  const [isFaculty, setFaculty] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchCampusSchedule, setFetchCampusSchedule] = useState(true);
  let analyticsRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, []);

  const _handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      //ADD CODE TO UPDATE DAILY HEALTH CHCK
      props.weeklyHealthCheckup.refetch();
      setFetchCampusSchedule(true);
    }
    appState.current = nextAppState;
    setAppStateVisible(appState.current);
    console.log("AppState", appState.current);
  };

  useEffect(() => {
    if (props.weeklyHealthCheckup.covidGetWeeklyHealthCheckupProd) {
      _retrieveData("campus_week_schedule").then((response) => {
        if (response) {
          response = JSON.parse(response);
          const temp = JSON.parse(
            props.weeklyHealthCheckup.covidGetWeeklyHealthCheckupProd.dayStatus
          );
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
          if (
            temp[
              props.weeklyHealthCheckup.covidGetWeeklyHealthCheckupProd.today
            ] == "completed"
          ) {
            let storedObj = { question: "completed", question_name: "" };
            _storeData(
              "Daily_Health_Check_Question",
              JSON.stringify(storedObj)
            );
          } else {
            _storeData("Daily_Health_Check_Question", "");
          }
          setDisplayWeek(temp);
        }
      });
      setColorScheme(
        JSON.parse(
          props.weeklyHealthCheckup.covidGetWeeklyHealthCheckupProd.colorScheme
        )
      );
      setToday(props.weeklyHealthCheckup.covidGetWeeklyHealthCheckupProd.today);
    }
  }, [props, globalState]);

  useEffect(() => {
    console.log("displayWeek[today]: ", displayWeek[today]);
    if (displayWeek[today] == "completed") {
      setSubmitButton({
        disabled: true,
        text: "Health Check Submitted",
        color: colorScheme[displayWeek[today]],
      });
    } else {
      setSubmitButton({
        disabled: false,
        text: "Submit Daily Health Check",
        color: null,
      });
    }
  }, [colorScheme, globalState, displayWeek[today]]);

  useEffect(() => {
    // console.log("REFRESHING WEEKLY CHECKUP");
    if (displayWeek[today] == "completed") {
      setSubmitButton({
        disabled: true,
        text: "Health Check Submitted",
        color: colorScheme[displayWeek[today]],
      });
    }
    // console.log(
    //   "props.weeklyHealthCheckup.refetch(): ",
    //   props.weeklyHealthCheckup
    // );
    props.weeklyHealthCheckup.refetch();
  }, [globalState.refetchWeeklySchedule]);

  useEffect(() => {
    // Check for Role - Staff and In campus Student
    // Check for Push Notification Permissions
    // Check for Async Storage and Schedule the 6 AM Notifications for each day
    _retrieveData("roles")
      .then((roles) => {
        console.log("ROLE CHECK IS RUNNING");
        console.log(roles);
        if (roles) {
          if (roles.indexOf("employee") > -1) {
            setStudent(false);
            setFaculty(true);
          } else {
            if (roles.indexOf("student") > -1) {
              setStudent(true);
              setFaculty(false);
            } else {
              setStudent(false);
              setFaculty(true);
            }
          }
        } else {
          Auth()
            .getSession()
            .then((tokens) => {
              if (tokens.roleList.indexOf("online") == -1) {
                if (tokens.roleList.indexOf("student") > -1) {
                  setStudent(true);
                  setFaculty(false);
                } else {
                  setStudent(false);
                  setFaculty(true);
                }
              }
            });
        }
      })
      .catch((err) => {
        Auth()
          .getSession()
          .then((tokens) => {
            if (tokens.roleList.indexOf("online") == -1) {
              if (tokens.roleList.indexOf("student") > -1) {
                setStudent(true);
                setFaculty(false);
              } else {
                setStudent(false);
                setFaculty(true);
              }
            }
          });
      });
  }, []);

  useEffect(() => {
    if (isStudent) {
      _retrieveData("campus_week_schedule").then((response) => {
        if (!response) {
          const obj = {
            Sunday: true,
            Monday: true,
            Tuesday: true,
            Wednesday: true,
            Thursday: true,
            Friday: true,
            Saturday: true,
          };
          _storeData("campus_week_schedule", JSON.stringify(obj)).then(() => {
            globalActions.setCampusWeekSchedule(obj);
          });
        }
      });
    }
    if (isFaculty && fetchCampusSchedule) {
      props.client
        .query({
          query: getCampusScheduleQuery,
          fetchPolicy: "network-only",
          variables: { type: "get" },
        })
        .then((result) => {
          if (Object.keys(result.data.covidWeeklyCampusSchedule).length >= 7) {
            _storeData(
              "campus_week_schedule",
              JSON.stringify(result.data.covidWeeklyCampusSchedule)
            ).then(() => {
              globalActions.setCampusWeekSchedule(
                result.data.covidWeeklyCampusSchedule
              );
              setFetchCampusSchedule(false);
            });
          } else {
            // Error Handling
            const obj = {
              Sunday: false,
              Monday: true,
              Tuesday: true,
              Wednesday: true,
              Thursday: true,
              Friday: true,
              Saturday: false,
            };
            _storeData("campus_week_schedule", JSON.stringify(obj)).then(() => {
              globalActions.setCampusWeekSchedule(obj);
              setFetchCampusSchedule(false);
            });
          }
        });
    }
  }, [isStudent, isFaculty, fetchCampusSchedule]);

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

  const _storeData = async (key, whatToSave) => {
    try {
      await AsyncStorage.setItem(key, whatToSave);
      return true;
    } catch (error) {
      return false;
    }
  };

  const pressMainHandler = (displayType) => {
    setLoading(true);
    // const { navigate } = props.navigation;
    // navigate("DailyHealthCheck", {previousScreen: "Home", previousSection: "live-cards"});
    // console.log("HITTING HERE !@#");
    // console.log("Display Type:", displayType);
    analyticsRef.current.sendData({
      "action-type": "click",
      "starting-screen": displayType === "livecard" ? "home" : "covid-wellness",
      "starting-section": displayType === "livecard" ? "live-cards" : null,
      target: "submit-health-check",
      "resulting-screen": "covid-daily-health-check-modal",
      "resulting-section": null,
    });
    setShowCheckModal(true);
  };

  return (
    <View style={covidCardStyles.CardContainer}>
      <Analytics ref={analyticsRef} />
      {props.displayType === "livecard" && (
        <View style={covidCardStyles.imageContainer}>
          <ImageBackground
            source={require("../assets/live-card-covid-2x.png")}
            style={covidCardStyles.backgroundImageContainer}
            resizeMode="cover"
          >
            <View style={covidCardStyles.textContainer}>
              <View>
                <Text allowFontScaling={false} style={covidCardStyles.header}>
                  ASU Daily
                </Text>
                <Text
                  allowFontScaling={false}
                  style={covidCardStyles.headerBig}
                >
                  Health Check
                </Text>
              </View>
              <View style={covidCardStyles.middleTextContainer}>
                <Text
                  allowFontScaling={false}
                  style={covidCardStyles.middleText}
                >
                  Look out for one another's well being by checking for COVID-19
                  symptoms everyday before heading to campus.
                </Text>
              </View>
            </View>
            <View style={covidCardStyles.textContainer}>
              <TouchableOpacity
                disabled={submitButton.disabled}
                onPress={() => pressMainHandler(props.displayType)}
              >
                <View style={[covidCardStyles.cardButton, submitButton.color]}>
                  {loading && (
                    <ActivityIndicator
                      size="small"
                      color="maroon"
                      style={{ marginRight: 5 }}
                    />
                  )}
                  <Text
                    allowFontScaling={false}
                    style={covidCardStyles.cardButtonText}
                  >
                    {submitButton.text}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      )}

      <View style={covidCardStyles.mainContainer}>
        <TouchableWithoutFeedback
          onPress={() => {
            globalActions.setPreviousScreenAndSection({
              screen:
                props.displayType === "livecard" ? "home" : "covid-wellness",
              section: props.displayType === "livecard" ? "live-cards" : null,
            });
            globalActions.setShowCampusModal(true);
          }}
        >
          <View>
            <View style={WHCStyles.header}>
              <Text allowFontScaling={false} style={WHCStyles.title}>
                DAILY HEALTH CHECK
              </Text>
              {props.displayType === "wellness" && (
                <Text allowFontScaling={false} style={WHCStyles.headerBold}>
                  Be sure to submit your Daily Health Check
                </Text>
              )}
            </View>
            <View style={WHCStyles.weekContainer}>
              {props.weeklyHealthCheckup.covidGetWeeklyHealthCheckupProd &&
                displayWeek &&
                days.map((day, index) => {
                  if (day == today) {
                    return (
                      <View style={WHCStyles.todayContainer} key={index}>
                        <View
                          style={[
                            WHCStyles.todayBubble,
                            colorScheme[displayWeek[day]],
                          ]}
                        >
                          <Text
                            allowFontScaling={false}
                            style={WHCStyles.bubbleText}
                          >
                            {day.charAt(0)}
                          </Text>
                        </View>
                        <View style={WHCStyles.todayDot} />
                      </View>
                    );
                  } else {
                    return (
                      <View
                        style={[
                          WHCStyles.bubble,
                          colorScheme[displayWeek[day]],
                        ]}
                        key={index}
                      >
                        <Text
                          allowFontScaling={false}
                          style={WHCStyles.bubbleText}
                        >
                          {day.charAt(0)}
                        </Text>
                      </View>
                    );
                  }
                })}
            </View>
          </View>
        </TouchableWithoutFeedback>
        {isFaculty && <WeeklyHealthModal />}
        {showCheckModal && (
          <DHC
            {...props}
            toggleParent={(e) => {
              setShowCheckModal(e);
            }}
            stopLoading={(e) => {
              setLoading(false);
            }}
            displayType={props.displayType}
          />
        )}
      </View>
    </View>
  );
}

export default WeeklyHealthCheckComponent = AppSyncComponent(
  WeeklyHealthCheck,
  getWeeklyHealthCheckUpDetails
);
