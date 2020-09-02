import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  // TouchableWithoutFeedback,
  Modal,
  Platform,
  Linking,
  AsyncStorage,
} from "react-native";

import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

import IonIcons from "react-native-vector-icons/Ionicons";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { getCampusScheduleQuery, setCampusScheduleMutation } from "./Queries";
import useGlobal from "../../functional/global-state/store";
import Analytics from "../../functional/analytics";

const WHMStyles = StyleSheet.create({
  modalBubble: {
    borderRadius: 50,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "maroon",
    backgroundColor: "white",
  },
  modalBubbleText: {
    color: "maroon",
  },
  modalBubbleSelected: {
    borderRadius: 50,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "maroon",
    backgroundColor: "maroon",
  },
  modalBubbleSelectedText: {
    color: "white",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(52, 52, 52, 0.8)",
    paddingTop: responsiveHeight(6),
    fontFamily: "Roboto",
  },
  modal: {
    flex: 1,
    backgroundColor: "white",
    margin: 10,
    marginTop: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topDiv: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mainDivContainer: {
    padding: "5%",
    flex: 1,
  },
  mainDiv: {
    padding: 5,
  },
  Date: {
    backgroundColor: "#FFC627",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "black",
    fontSize: responsiveFontSize(2),
    fontFamily: "Roboto",
    fontWeight: "bold",
    fontFamily: "Roboto",
    alignSelf: "center",
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  DHCTitle: {
    alignSelf: "center",
    textAlign: "center",
    marginTop: "5%",
    fontSize: responsiveFontSize(3),
    fontFamily: "Roboto",
    fontWeight: "900",
    color: "black",
  },
  closeIcon: {
    padding: 5,
  },
  questionText: {
    alignSelf: "center",
    textAlign: "center",
    fontSize: responsiveFontSize(1.75),
    fontFamily: "Roboto",
    fontWeight: "600",
    color: "black",
  },
  modalHelpText: {
    alignSelf: "center",
    textAlign: "center",
    fontSize: responsiveFontSize(2),
    fontFamily: "Roboto",
    color: "black",
  },
  footer: {
    justifyContent: "center",
    padding: 10,
    alignItems: "center",
    flex: 0.2,
  },
  footerButton: {
    backgroundColor: "#DBDBDB",
    borderRadius: 20,
    width: responsiveWidth(40),
    fontFamily: "Roboto",
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "black",
    fontFamily: "Roboto"
  },
  modalTextContainerBottom: {
    // marginBottom: "5%",
    flex: 0.5,
    // paddingHorizontal: 20,
  },
  modalTextContainerTop: {
    marginTop: "10%",
    flex: 0.5,
    // paddingHorizontal: 20,
  },
  importantTextContainer: {
    marginTop: 20,
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // paddingVertical: 20,
    // paddingHorizontal: 20,
  },
});

export function WeeklyHealthModalComponent(props) {
  const [globalState, globalActions] = useGlobal();
  const [isModalVisible, setModalVisible] = useState(
    globalState.showCampusModal
  );
  const [modalWeek, setModalWeek] = useState(globalState.campusWeekSchedule);
  let analyticsRef = useRef(null);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    if (globalState.showCampusModal && globalState.preferenceValues) {
      analyticsRef.current.sendData({
        "action-type": "click",
        "starting-screen": globalState.preferenceValues.screen,
        "starting-section": globalState.preferenceValues.section,
        target: "covid-set-weekly-health-check-modal-open",
        "resulting-screen": globalState.preferenceValues.screen,
        "resulting-section": "covid-set-weekly-health-check-modal",
      });
    }
    setModalVisible(globalState.showCampusModal);
  }, [globalState.showCampusModal, globalState.preferenceValues]);

  useEffect(() => {
    setModalWeek(props.modalWeekItems);
  }, [props.modalWeekItems]);

  useEffect(() => {
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
            setModalWeek(result.data.covidWeeklyCampusSchedule);
            globalActions.setCampusWeekSchedule(
              result.data.covidWeeklyCampusSchedule
            );
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
            setModalWeek(obj);
            globalActions.setCampusWeekSchedule(obj);
          });
        }
      });
  }, []);

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

  return (
    <Modal
      visible={globalState.showCampusModal}
      animationType="slide"
      transparent
    >
      <View style={WHMStyles.modalContainer}>
        <Analytics ref={analyticsRef} />
        <View style={WHMStyles.modal}>
          <View style={WHMStyles.topDiv}>
            <TouchableOpacity
              onPress={() => {
                analyticsRef.current.sendData({
                  "action-type": "click",
                  "starting-screen": globalState.preferenceValues.screen,
                  "starting-section": globalState.preferenceValues.section,
                  target: "covid-set-weekly-health-check-modal-close",
                  "resulting-screen": globalState.preferenceValues.screen,
                  "resulting-section": null,
                  "action-metadata": {
                    "button-type": "icon",
                  },
                });
                globalActions.setShowCampusModal(false);
              }}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
            >
              <View style={WHMStyles.closeIcon}>
                <IonIcons
                  style={{
                    alignSelf: "center",
                  }}
                  name="md-close"
                  size={23}
                  color="black"
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={WHMStyles.mainDivContainer}>
            <View
              style={{
                display: "flex",
                flex: 0.25,
                justifyContent: "center",
                alignItems: "center",
                // paddingHorizontal: 20,
              }}
            >
              <Text allowFontScaling={false} style={WHMStyles.Date}>
                Weekly Prep
              </Text>
              <Text allowFontScaling={false} style={WHMStyles.DHCTitle}>
                Daily Health Check
              </Text>
            </View>
            <View style={WHMStyles.modalTextContainerTop}>
              <Text allowFontScaling={false} style={WHMStyles.questionText}>
                What days are you scheduled to work this week? This
                includes days that you will be working remotely or coming to
                campus for any reason.
              </Text>
            </View>
            <View style={WHMStyles.modalTextContainerBottom}>
              <Text allowFontScaling={false} style={WHMStyles.modalHelpText}>
                We'll send you a daily health check reminder on the days you
                select to ensure you remain in compliance with ASU HR's COVID
                policies.
              </Text>
            </View>
            <View style={WHMStyles.weekContainer}>
              {modalWeek &&
                days.map((day, index) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        const temp = JSON.parse(JSON.stringify(modalWeek));
                        temp[day] = !modalWeek[day];
                        setModalWeek(temp);
                      }}
                      key={index}
                    >
                      <View
                        style={
                          modalWeek[day]
                            ? WHMStyles.modalBubbleSelected
                            : WHMStyles.modalBubble
                        }
                      >
                        <Text
                          allowFontScaling={false}
                          style={
                            modalWeek[day]
                              ? WHMStyles.modalBubbleSelectedText
                              : WHMStyles.modalBubbleText
                          }
                        >
                          {day.charAt(0)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
          <View style={WHMStyles.footer}>
            <TouchableOpacity
              onPress={() => {
                // console.log(modalWeek);
                analyticsRef.current.sendData({
                  "action-type": "click",
                  "starting-screen": globalState.preferenceValues.screen,
                  "starting-section": globalState.preferenceValues.section,
                  target: "set-weekly-health-check-modal-next",
                  "resulting-screen": globalState.preferenceValues.screen,
                  "resulting-section": null,
                  "action-metadata": {
                    weekly_data: JSON.stringify(modalWeek),
                  },
                });
                const send_payload = JSON.parse(JSON.stringify(modalWeek));
                delete send_payload.__typename;
                props.client
                  .mutate({
                    mutation: setCampusScheduleMutation,
                    fetchPolicy: "no-cache",
                    variables: {
                      type: "put",
                      payload: send_payload,
                    },
                  })
                  .then((response) => {
                    if (response.data.setCampusSchedule.result) {
                      _storeData(
                        "campus_week_schedule",
                        JSON.stringify(modalWeek)
                      ).then(() => {
                        globalActions.setCampusWeekSchedule(modalWeek);
                      });
                      globalActions.setShowCampusModal(false);
                    }
                  })
                  .catch((error) => {
                    console.log("Error", error);
                  });
              }}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <View style={WHMStyles.footerButton}>
                <Text
                  allowFontScaling={false}
                  style={WHMStyles.footerButtonText}
                >
                  Close 
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Linking.openURL("https://healthcheck.asu.edu/");
              }}
            >
              {/* <View style={WHMStyles.importantTextContainer}>
                <Text>Why is this important?</Text>
              </View> */}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default WeeklyHealthModal = AppSyncComponent(WeeklyHealthModalComponent);
