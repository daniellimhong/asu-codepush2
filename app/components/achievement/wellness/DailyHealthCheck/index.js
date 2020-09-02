import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  AsyncStorage,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  ScrollView,
  AppState,
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import IonIcons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/AntDesign";
import { ErrorWrapper } from "../../../functional/error/ErrorWrapper";
import {
  covid_questions,
  covid_questions_response,
  covidstatus,
  today_status,
  covid_firstQues,
  covid_secondQues,
} from "./DailyHealthQuery";
import { AppSyncComponent } from "../../../functional/authentication/auth_components/appsync/AppSyncApp";
import CircleSlider from "./CircleSlider";
import { Auth } from "../../../../services/auth";
import useGlobal from "../../../functional/global-state/store";
import Analytics from "../../../functional/analytics";

const icon_mask = require("../assets/masks.png");
const icon_symptoms = require("../assets/icon_symptons.png");
const icon_record = require("../assets/icon_record.png");

function Covid_questionnaire(props) {
  const [globalState, globalActions] = useGlobal();
  console.log("globalState: ", globalState);
  const analytics_Ref = useRef(null);

  const date = new Date().getDate();
  const day = new Date().getDay();
  const month = new Date().getMonth();
  const hours = new Date().getHours(); // To get the Current Hours
  const min = new Date().getMinutes(); // To get the Current Minutes
  const dayName = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthname = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [Initial, setInitial] = useState(false);
  const [num_days, setnum_days] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [question_num, setQuestionNumber] = useState(1);
  const [question, setQuestion] = useState("");
  const [loading, setloading] = useState(false);
  const [symptom, setSymptoms] = useState([]);
  const [additional_symp, setadditional_symp] = useState([]);
  const [refresh, setrefresh] = useState(false);
  const [response_obj, setResponse] = useState({
    payload: {
      additionalSymptoms: [],
      nbOfDaysExperiencingSymptom: 0,
      nbOfDaysNotExperiencingSymptom: 0,
      symptoms: [],
      temperature: 0,
    },
  });
  const [first, setfirst] = useState(true);
  const [coming_today, setcoming] = useState(true);
  const [yesPressed, setyesPressed] = useState(false);
  const [noPressed, setnoPressed] = useState(false);
  const [fever, setfever] = useState(false);
  const [cough, setcough] = useState(false);
  const [Short_Breath, SetShort_Breath] = useState(false);
  const [None1, setNone1] = useState(false);
  const [chills, setchills] = useState(false);
  const [Vomiting, setVomiting] = useState(false);
  const [Sore, setsore] = useState(false);
  const [Diarrhea, setDiarrhea] = useState(false);
  const [Lossofsmell, setlossofsmell] = useState(false);
  const [Muscle, setMuscle] = useState(false);
  const [None2, setNone2] = useState(false);
  const [degree, setdegree] = useState(0);
  const [isStudent, setStudent] = useState(false);
  const [finishedinitial, setfinishedinitial] = useState(false);
  const [finishedsecond, setfinishedsecond] = useState(false);
  const [question_name, setName] = useState("");
  const [firstQues, setfirstQues] = useState("");
  const [secondQues, setsecondQues] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  // Role Check for displaying appropriate question

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
    _retrieveData("roles")
      .then((roles) => {
        if (roles) {
          if (roles.indexOf("employee") == -1) {
            if (roles.indexOf("student") > -1) {
              setStudent(true);
            } else {
              setStudent(false);
            }
          } else if (roles.indexOf("online") > -1) {
            setStudent(false);
          } else if (roles.indexOf("student") > -1) {
            setStudent(true);
          }
        } else {
          Auth()
            .getSession()
            .then((tokens) => {
              setStudent(tokens.roleList.indexOf("student") > -1);
            });
        }
      })
      .catch((err) => {
        Auth()
          .getSession()
          .then((tokens) => {
            setStudent(tokens.roleList.indexOf("student") > -1);
          });
      });
  }, []);

  useEffect(() => {
    if (
      question_name === "not_coming_today" ||
      question_name === "APPROVED" ||
      question_name === "SECURE_TESTING"
    ) {
      globalActions.setSurveySubmitted(true);
    }
  }, [question_name]);

  const toggleInitial = () => {
    setInitial(!Initial);
    if (props.toggleParent) {
      props.toggleParent(!Initial);
    }
    if (props.stopLoading) {
      props.stopLoading();
    }
  };
  const toggleQuestionNumber = () => {
    setQuestionNumber((question_num) => question_num + 1);
  };
  const toggleplusdays = () => {
    return num_days != 21 ? setnum_days((num_days) => num_days + 1) : "";
  };
  const toggleminusdays = () => {
    return num_days != 0 ? setnum_days((prev) => prev - 1) : "";
  };
  const toggleplusTemperature = () => {
    degree != 106
      ? setdegree((prev) => Math.round((prev + 0.1) * 1e12) / 1e12)
      : "";
  };
  const toggleminusTemperature = () => {
    degree != 95
      ? setdegree((prev) => Math.round((prev - 0.1) * 1e12) / 1e12)
      : "";
  };

  // initial get operation to create user in SAFE USER system
  const manageQuestions = () => {
    props.client
      .query({
        query: covid_questions,
        fetchPolicy: "network-only",
      })
      .then((response) => {
        triggermodal(response.data.covidGetQuestionnaireTest);
      });
    const triggermodal = (changed_ques) => {
      if (changed_ques && changed_ques.question != null) {
        const obj = {
          question: changed_ques.question,
          question_name: changed_ques.question_name,
        };

        _storeData("Daily_Health_Check_Question", JSON.stringify(obj));
        setQuestion(changed_ques.question);
        setName(changed_ques.question_name);
        setloading(false);
      }
    };
  };
  // get next question based on prev question response
  const managePostQuestions = () => {
    _retrieveData("Covid_Response_Object").then((response) => {
      props.client
        .mutate({
          mutation: covid_questions_response,
          fetchPolicy: "no-cache",
          variables: { type: "post", payload: JSON.parse(response) },
        })
        .then((response) => {
          triggermodal(response.data.covidQuestionnaireResponseTest);
        });
    });
    const triggermodal = (changed_response) => {
      if (changed_response && changed_response.question != null) {
        const obj = {
          question: changed_response.question,
          question_name: changed_response.question_name,
        };

        _storeData("Daily_Health_Check_Question", JSON.stringify(obj));
        setQuestion(changed_response.question);
        setName(changed_response.question_name);
        setloading(false);
      } else if (changed_response && changed_response.result != null) {
        const obj = {
          question: "completed",
          question_name: changed_response.result,
        };
        _storeData("Daily_Health_Check_Question", JSON.stringify(obj));
        setQuestion("completed");
        // Here delete all local push notifications for the day.
        analytics_Ref.current.sendData({
          "action-type": "click",
          "starting-screen": "covid-daily-health-check-modal",
          "starting-section": null,
          target: "daily-health-check-modal-completed",
          "resulting-screen": "covid-daily-health-check-modal",
          "resulting-section": null,
          "action-metadata": {
            isStudent,
          },
        });
        globalActions.setRefetchWeeklySchedule(true);
        setName(changed_response.result);
        setloading(false);
      }
    };
  };

  // calculate day and date suffix
  const nth = function(d) {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
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

  useEffect(() => {
    if (additional_symp === []) {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
  }, [additional_symp]);

  useEffect(() => {
    analytics_Ref.current.sendData({
      "action-type": "view",
      "starting-screen":
        props.displayType === "livecard" ? "home" : "covid-wellness",
      "starting-section":
        props.displayType === "livecard" ? "live-cards" : null,
      target: "daily-health-check-modal-open",
      "resulting-screen": "covid-daily-health-check-modal",
      "resulting-section": null,
    });
    props.client
      .query({
        query: covidstatus,
        fetchPolicy: "no-cache",
      })
      .then((response) => {
        triggerStatusCheck(response.data.getCovidDailyHealthStatusProd.status);
      });
    const triggerStatusCheck = (User_status) => {
      if (User_status == "Not started" || User_status == "started") {
        setloading(true);
        setTimeout(() => {
          setloading(false);
        }, 10);

        _storeData("Daily_Health_Check_Question", "").then(() => {
          // setQuestion("");
          _storeData(
            "Covid_Response_Object",
            JSON.stringify(response_obj.payload)
          );
        });
        toggleInitial();
      }
    };
  }, []);

  useEffect(() => {
    if (!props.covid_firstQues.getCovidInitialQuestions) {
      setfirstQues("");
    }
    if (!props.covid_secondQues.getCovidInitialQuestions) {
      setsecondQues("");
    }

    // if (hours == 8 && min == 0) {
    //   setInitial(true);
    // }
  });

  useEffect(() => {
    if (!props.covid_firstQues.getCovidInitialQuestions) {
      setfirstQues("");
    } else {
      const firstquestion =
        props.covid_firstQues.getCovidInitialQuestions.question;
      setfirstQues(firstquestion);
    }
  }, [props.covid_firstQues.getCovidInitialQuestions]);

  useEffect(() => {
    if (!props.covid_secondQues.getCovidInitialQuestions) {
      setsecondQues("");
    } else {
      const secondquestion =
        props.covid_secondQues.getCovidInitialQuestions.question;
      setsecondQues(secondquestion);
    }
  }, [props.covid_secondQues.getCovidInitialQuestions]);

  useEffect(() => {
    if (isStudent) {
      manageQuestions();
    }
  }, [isStudent]);

  // get the payload object from async and call API for displaying next question
  useEffect(() => {
    _retrieveData("Daily_Health_Check_Question").then((response) => {
      if (!response) {
        console.log("First time user");
      } else if (refresh) {
        _storeData(
          "Covid_Response_Object",
          JSON.stringify(response_obj.payload)
        ).then(() => {
          managePostQuestions();
        });
      }
    });
  }, [response_obj]);

  // deselect option for all symptoms
  useEffect(() => {
    if (fever) {
      setSymptoms((symptom) => symptom.concat("FEVER"));
    } else if (!fever) {
      const index = symptom.indexOf("FEVER");
      if (index !== -1) {
        symptom.splice(index, 1);
      }
    }
  }, [fever]);

  useEffect(() => {
    if (cough) {
      setSymptoms((symptom) => symptom.concat("COUGHING"));
    } else if (!cough) {
      const index = symptom.indexOf("COUGHING");
      if (index !== -1) {
        symptom.splice(index, 1);
      }
    }
  }, [cough]);

  useEffect(() => {
    if (Short_Breath) {
      setSymptoms((symptom) => symptom.concat("SHORTNESS_OF_BREATH"));
    } else if (!Short_Breath) {
      const index = symptom.indexOf("SHORTNESS_OF_BREATH");
      if (index !== -1) {
        symptom.splice(index, 1);
      }
    }
  }, [Short_Breath]);

  useEffect(() => {
    if (None1) {
      setSymptoms((symptom) => symptom.concat("NONE"));
    } else if (!None1) {
      const index = symptom.indexOf("NONE");
      if (index !== -1) {
        symptom.splice(index, 1);
      }
    }
  }, [None1]);

  useEffect(() => {
    if (chills) {
      setadditional_symp((additional_symp) => additional_symp.concat("CHILLS"));
    } else if (!chills) {
      const index = additional_symp.indexOf("CHILLS");
      if (index !== -1) {
        additional_symp.splice(index, 1);
      }
    }
  }, [chills]);

  useEffect(() => {
    if (Vomiting) {
      setadditional_symp((additional_symp) =>
        additional_symp.concat("VOMITING")
      );
    } else if (!Vomiting) {
      const index = additional_symp.indexOf("VOMITING");
      if (index !== -1) {
        additional_symp.splice(index, 1);
      }
    }
  }, [Vomiting]);

  useEffect(() => {
    if (Sore) {
      setadditional_symp((additional_symp) =>
        additional_symp.concat("SORE_THROAT")
      );
    } else if (!Sore) {
      const index = additional_symp.indexOf("SORE_THROAT");
      if (index !== -1) {
        additional_symp.splice(index, 1);
      }
    }
  }, [Sore]);

  useEffect(() => {
    if (Diarrhea) {
      setadditional_symp((additional_symp) =>
        additional_symp.concat("DIARRHEA")
      );
    } else if (!Diarrhea) {
      const index = additional_symp.indexOf("DIARRHEA");
      if (index !== -1) {
        additional_symp.splice(index, 1);
      }
    }
  }, [Diarrhea]);

  useEffect(() => {
    if (Lossofsmell) {
      setadditional_symp((additional_symp) =>
        additional_symp.concat("LOSS_OF_SMELL_OR_TASTE")
      );
    } else if (!Lossofsmell) {
      const index = additional_symp.indexOf("LOSS_OF_SMELL_OR_TASTE");
      if (index !== -1) {
        additional_symp.splice(index, 1);
      }
    }
  }, [Lossofsmell]);

  useEffect(() => {
    if (Muscle) {
      setadditional_symp((additional_symp) =>
        additional_symp.concat("MUSCLE_PAIN")
      );
    } else if (!Muscle) {
      const index = additional_symp.indexOf("MUSCLE_PAIN");
      if (index !== -1) {
        additional_symp.splice(index, 1);
      }
    }
  }, [Muscle]);

  useEffect(() => {
    if (None2) {
      setadditional_symp((additional_symp) => additional_symp.concat("NONE"));
    } else if (!None2) {
      const index = additional_symp.indexOf("NONE");
      if (index !== -1) {
        additional_symp.splice(index, 1);
      }
    }
  }, [None2]);

  // display value with decimal for temperature
  useEffect(() => {
    const init = temperature / 3.26;
    const n = Math.trunc(init);
    const final_val = n / 10 + 95.0;
    setdegree(final_val);
  }, [temperature]);

  return (
    <View>
      <Analytics ref={analytics_Ref} />
      <Modal visible={Initial} animationType="slide" transparent>
        {question_name != "APPROVED" &&
          question_name != "SECURE_TESTING" &&
          question_name != "not_coming_today" &&
          coming_today && (
            <View style={styles.container}>
              <View style={styles.modal}>
                <View style={styles.topDiv}>
                  <TouchableOpacity
                    onPress={() => {
                      analytics_Ref.current.sendData({
                        "action-type": "click",
                        "starting-screen": "covid-daily-health-check-modal",
                        "starting-section": null,
                        target: "daily-health-check-modal-close",
                        "resulting-screen": "covid-daily-health-check-modal",
                        "resulting-section": null,
                        "action-metadata": {
                          "button-type": "icon",
                        },
                      });
                      toggleInitial();
                    }}
                    accessibilityLabel="Close modal"
                    accessibilityRole="button"
                  >
                    <View style={styles.closeIcon}>
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
                <View style={styles.mainDivContainer}>
                  <Text allowFontScaling={false} style={styles.Date}>
                    {dayName[day]}, {monthname[month]} {date}
                    {nth(date)}
                  </Text>
                  <Text allowFontScaling={false} style={styles.DHCTitle}>
                    Daily Health Check
                  </Text>
                  {loading && (
                    <View
                      style={{ alignItems: "center", paddingVertical: "30%" }}
                    >
                      <ActivityIndicator size="large" color="maroon" />
                    </View>
                  )}
                  {!loading &&
                    question_num == 1 &&
                    coming_today &&
                    !finishedinitial &&
                    !isStudent && (
                      <ScrollView>
                        <Text
                          allowFontScaling={false}
                          style={styles.questionText}
                        >
                          {firstQues}
                        </Text>
                        <View style={{ marginVertical: "10%" }}>
                          <TouchableOpacity
                            style={
                              yesPressed
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                            onPress={() => {
                              setnoPressed(false);
                              setyesPressed(!yesPressed);
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                yesPressed
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              Yes
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={
                              noPressed
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                            onPress={() => {
                              setyesPressed(false);
                              setnoPressed(!noPressed);
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                noPressed
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              No
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: "3%" }}>
                          <TouchableOpacity
                            style={[
                              styles.containerGreyFilled,
                              {
                                backgroundColor:
                                  yesPressed || noPressed
                                    ? "#D9D9D9"
                                    : "#F3F3F3",
                              },
                            ]}
                            disabled={!!(!yesPressed && !noPressed)}
                            onPress={() => {
                              if (yesPressed) {
                                toggleQuestionNumber();
                                setfinishedinitial(true);
                                setyesPressed(!yesPressed);
                              } else if (noPressed) {
                                setcoming(false);
                                analytics_Ref.current.sendData({
                                  "action-type": "click",
                                  "starting-screen":
                                    "covid-daily-health-check-modal",
                                  "starting-section": null,
                                  target: "daily-health-check-modal-next",
                                  "resulting-screen":
                                    "covid-daily-health-check-modal",
                                  "resulting-section": null,
                                  "action-metadata": {
                                    isStudent,
                                  },
                                });
                                props.client
                                  .query({
                                    query: today_status,
                                    fetchPolicy: "no-cache",
                                  })
                                  .then((response) => {
                                    _storeData(
                                      "Daily_Health_Check_Question",
                                      JSON.stringify({
                                        question: "completed",
                                        question_name: "not_coming_today",
                                      })
                                    );
                                    analytics_Ref.current.sendData({
                                      "action-type": "click",
                                      "starting-screen":
                                        "covid-daily-health-check-modal",
                                      "starting-section": null,
                                      target:
                                        "daily-health-check-modal-completed",
                                      "resulting-screen":
                                        "covid-daily-health-check-modal",
                                      "resulting-section": null,
                                      "action-metadata": {
                                        isStudent,
                                      },
                                    });
                                    // Here delete all local push notifications for the day.
                                    globalActions.setRefetchWeeklySchedule(
                                      true
                                    );
                                  });
                                setnoPressed(!noPressed);
                              }
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={[
                                styles.textGreyFilled,
                                {
                                  color:
                                    yesPressed || noPressed ? "black" : "grey",
                                },
                              ]}
                            >
                              Next
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            accessibilityLabel="Link to CDC Guidelines Website"
                            accessibilityRole="button"
                            onPress={() => {
                              Linking.openURL(
                                "https://www.cdc.gov/coronavirus/2019-ncov/hcp/guidance-risk-assesment-hcp.html"
                              );
                            }}
                          >
                            <Text style={styles.linkText}>CDC Guidelines</Text>
                          </TouchableOpacity>
                        </View>
                      </ScrollView>
                    )}
                  {question_num == 2 &&
                    coming_today &&
                    finishedinitial &&
                    !finishedsecond &&
                    !isStudent && (
                      <ScrollView>
                        <Text
                          allowFontScaling={false}
                          style={styles.questionText}
                        >
                          {secondQues}
                        </Text>
                        <View style={{ marginVertical: "10%" }}>
                          <TouchableOpacity
                            style={
                              yesPressed
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                            onPress={() => {
                              setnoPressed(false);
                              setyesPressed(!yesPressed);
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                yesPressed
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              Yes
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={
                              noPressed
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                            onPress={() => {
                              setyesPressed(false);
                              setnoPressed(!noPressed);
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                noPressed
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              No
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: "3%" }}>
                          <TouchableOpacity
                            style={[
                              styles.containerGreyFilled,
                              {
                                backgroundColor:
                                  yesPressed || noPressed
                                    ? "#D9D9D9"
                                    : "#F3F3F3",
                              },
                            ]}
                            disabled={!!(!yesPressed && !noPressed)}
                            onPress={() => {
                              analytics_Ref.current.sendData({
                                "action-type": "click",
                                "starting-screen":
                                  "covid-daily-health-check-modal",
                                "starting-section": null,
                                target: "daily-health-check-modal-next",
                                "resulting-screen":
                                  "covid-daily-health-check-modal",
                                "resulting-section": null,
                                "action-metadata": {
                                  isStudent,
                                },
                              });
                              if (yesPressed) {
                                setloading(true);
                                setfinishedsecond(true);
                                toggleQuestionNumber();
                                manageQuestions();
                              } else if (noPressed) {
                                setcoming(false);
                                props.client
                                  .query({
                                    query: today_status,
                                    fetchPolicy: "no-cache",
                                  })
                                  .then((response) => {
                                    _storeData(
                                      "Daily_Health_Check_Question",
                                      JSON.stringify({
                                        question: "completed",
                                        question_name: "not_coming_today",
                                      })
                                    );
                                    analytics_Ref.current.sendData({
                                      "action-type": "click",
                                      "starting-screen":
                                        "covid-daily-health-check-modal",
                                      "starting-section": null,
                                      target:
                                        "daily-health-check-modal-completed",
                                      "resulting-screen":
                                        "covid-daily-health-check-modal",
                                      "resulting-section": null,
                                      "action-metadata": {
                                        isStudent,
                                      },
                                    });
                                    // Here delete all local push notifications for the day.
                                    globalActions.setRefetchWeeklySchedule(
                                      true
                                    );
                                  });
                              }
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={[
                                styles.textGreyFilled,
                                {
                                  color:
                                    yesPressed || noPressed ? "black" : "grey",
                                },
                              ]}
                            >
                              Next
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            accessibilityLabel="Link to CDC Guidelines Website"
                            accessibilityRole="button"
                            onPress={() => {
                              Linking.openURL(
                                "https://www.cdc.gov/coronavirus/2019-ncov/hcp/guidance-risk-assesment-hcp.html"
                              );
                            }}
                          >
                            <Text style={styles.linkText}>CDC Guidelines</Text>
                          </TouchableOpacity>
                        </View>
                      </ScrollView>
                    )}

                  {!loading &&
                    ((question ==
                      "Are you experiencing new or worsening onset of any of the following?" &&
                      ((!isStudent && finishedsecond && finishedinitial) ||
                        isStudent) &&
                      question_name == "symptoms") ||
                      (question == "" && question_name == "")) &&
                    first &&
                    question_name == "symptoms" && (
                      <ScrollView>
                        <Text
                          allowFontScaling={false}
                          style={styles.questionText}
                        >
                          {question}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setfever(!fever);
                            if (None1) setNone1(!None1);
                          }}
                        >
                          <View
                            style={
                              fever
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                fever
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              Fever
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setcough(!cough);
                            if (None1) setNone1(!None1);
                          }}
                        >
                          <View
                            style={
                              cough
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                cough
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              Cough
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            SetShort_Breath(!Short_Breath);
                            if (None1) setNone1(!None1);
                          }}
                        >
                          <View
                            style={
                              Short_Breath
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                Short_Breath
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              Shortness of Breath
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setNone1(!None1);
                            if (!None1) {
                              setfever(false);
                              setcough(false);
                              SetShort_Breath(false);
                            }
                          }}
                        >
                          <View
                            style={
                              None1
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                None1
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              None
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <View style={styles.Submitsection}>
                          <TouchableOpacity
                            style={[
                              styles.containerGreyFilled,
                              {
                                backgroundColor:
                                  fever || cough || Short_Breath || None1
                                    ? "#D9D9D9"
                                    : "#F3F3F3",
                              },
                            ]}
                            disabled={
                              !!(!fever && !cough && !Short_Breath && !None1)
                            }
                            onPressIn={() => {
                              analytics_Ref.current.sendData({
                                "action-type": "click",
                                "starting-screen":
                                  "covid-daily-health-check-modal",
                                "starting-section": null,
                                target: "daily-health-check-modal-next",
                                "resulting-screen":
                                  "covid-daily-health-check-modal",
                                "resulting-section": null,
                                "action-metadata": {
                                  isStudent,
                                },
                              });
                              if (None1 || Short_Breath || cough || fever) {
                                _retrieveData("Covid_Response_Object")
                                  .then((response) => {
                                    const data = JSON.parse(response);
                                    data.symptoms = symptom;
                                    if (!data.symptoms.length) {
                                      return null;
                                    } else {
                                      setloading(true);
                                      setfirst(false);
                                      setrefresh(true);
                                      toggleQuestionNumber();
                                      setResponse({
                                        ...response_obj,
                                        payload: data,
                                      });
                                    }
                                  })
                                  .catch((err) => console.log(err));
                              }
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={[
                                styles.textGreyFilled,
                                {
                                  color:
                                    fever || cough || Short_Breath || None1
                                      ? "black"
                                      : "grey",
                                },
                              ]}
                            >
                              Next
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            accessibilityLabel="Link to CDC Guidelines Website"
                            accessibilityRole="button"
                            onPress={() => {
                              Linking.openURL(
                                "https://www.cdc.gov/coronavirus/2019-ncov/hcp/guidance-risk-assesment-hcp.html"
                              );
                            }}
                          >
                            <Text style={styles.linkText}>CDC Guidelines</Text>
                          </TouchableOpacity>
                        </View>
                      </ScrollView>
                    )}
                  {!loading &&
                    question ==
                      "How many days have you experienced these symptoms?" && (
                      <ScrollView>
                        <Text
                          allowFontScaling={false}
                          style={styles.questionText}
                        >
                          {question}
                        </Text>
                        <Text
                          allowFontScaling={false}
                          style={styles.day_number}
                        >
                          {num_days}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignSelf: "center",
                            marginTop: 5,
                            marginBottom: "5%",
                          }}
                        >
                          <TouchableOpacity
                            style={styles.plus_minus}
                            accessibilityLabel="decrease days"
                            accessibilityRole="button"
                            onPress={() => {
                              toggleminusdays();
                            }}
                          >
                            <Icon
                              style={{
                                alignSelf: "center",
                              }}
                              name="minus"
                              size={45}
                              color="grey"
                              paddingRight="20%"
                              allowFontScaling={false}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.plus_minus}
                            accessibilityLabel="Increase days"
                            accessibilityRole="button"
                            onPress={() => {
                              toggleplusdays();
                            }}
                          >
                            <Icon
                              style={{
                                alignSelf: "center",
                              }}
                              name="plus"
                              size={45}
                              color="grey"
                              allowFontScaling={false}
                            />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.Submitsection}>
                          <TouchableOpacity
                            style={[
                              styles.containerGreyFilled,
                              {
                                backgroundColor:
                                  num_days == 0 ? "#F3F3F3" : "#D9D9D9",
                              },
                            ]}
                            disabled={num_days == 0}
                            onPressIn={() => {
                              analytics_Ref.current.sendData({
                                "action-type": "click",
                                "starting-screen":
                                  "covid-daily-health-check-modal",
                                "starting-section": null,
                                target: "daily-health-check-modal-next",
                                "resulting-screen":
                                  "covid-daily-health-check-modal",
                                "resulting-section": null,
                                "action-metadata": {
                                  isStudent,
                                },
                              });
                              if (num_days > 0) {
                                setloading(true);
                                setfirst(false);
                                setrefresh(true);
                                toggleQuestionNumber();
                                _retrieveData("Covid_Response_Object").then(
                                  (response) => {
                                    const data = JSON.parse(response);
                                    data.nbOfDaysExperiencingSymptom = num_days;
                                    setResponse({
                                      ...response_obj,
                                      payload: data,
                                    });
                                  }
                                );
                              }
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={[
                                styles.textGreyFilled,
                                { color: num_days == 0 ? "grey" : "black" },
                              ]}
                            >
                              Next
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            accessibilityLabel="Link to CDC Guidelines Website"
                            accessibilityRole="button"
                            onPress={() => {
                              Linking.openURL(
                                "https://www.cdc.gov/coronavirus/2019-ncov/hcp/guidance-risk-assesment-hcp.html"
                              );
                            }}
                          >
                            <Text style={styles.linkText}>CDC Guidelines</Text>
                          </TouchableOpacity>
                        </View>
                      </ScrollView>
                    )}
                  {!loading && question == "What is your temperature (F)?" && (
                    <View>
                      <Text
                        allowFontScaling={false}
                        style={styles.questionText}
                      >
                        What is your temperature?
                      </Text>
                      <View style={styles.outercircle}>
                        <CircleSlider
                          value={temperature}
                          onValueChange={(value) => {
                            setTemperature(value);
                          }}
                        />
                        <View
                          style={{
                            position: "absolute",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                          }}
                        >
                          <TouchableOpacity
                            accessibilityLabel="Increase Temperature"
                            accessibilityRole="button"
                            onPress={() => {
                              toggleplusTemperature();
                            }}
                          >
                            <Icon
                              style={{
                                alignSelf: "center",
                              }}
                              name="up"
                              size={30}
                              color="grey"
                            />
                          </TouchableOpacity>
                          <Text
                            allowFontScaling={false}
                            style={styles.temp_value}
                          >
                            {degree == 0 ? "95.0" : degree}
                            {"\u00b0"}
                          </Text>
                          <TouchableOpacity
                            accessibilityLabel="Decrease Temperature"
                            accessibilityRole="button"
                            onPress={() => toggleminusTemperature()}
                          >
                            <Icon
                              style={{
                                alignSelf: "center",
                              }}
                              name="down"
                              size={30}
                              color="grey"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.Submitsection}>
                        <TouchableOpacity
                          style={[
                            styles.containerGreyFilled,
                            {
                              backgroundColor:
                                degree == 95 && temperature == 0
                                  ? "#F3F3F3"
                                  : "#D9D9D9",
                            },
                          ]}
                          disabled={!!(temperature == 0 && degree == 95)}
                          onPressIn={() => {
                            analytics_Ref.current.sendData({
                              "action-type": "click",
                              "starting-screen":
                                "covid-daily-health-check-modal",
                              "starting-section": null,
                              target: "daily-health-check-modal-next",
                              "resulting-screen":
                                "covid-daily-health-check-modal",
                              "resulting-section": null,
                              "action-metadata": {
                                isStudent,
                              },
                            });
                            setloading(true);
                            setfirst(false);
                            setrefresh(true);
                            toggleQuestionNumber();
                            _retrieveData("Covid_Response_Object").then(
                              (response) => {
                                const data = JSON.parse(response);
                                data.temperature = degree == 95 ? 0 : degree;
                                setResponse({ ...response_obj, payload: data });
                              }
                            );
                          }}
                        >
                          <Text
                            allowFontScaling={false}
                            style={[
                              styles.textGreyFilled,
                              {
                                color:
                                  degree == 95 && temperature == 0
                                    ? "grey"
                                    : "black",
                              },
                            ]}
                          >
                            Next
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          accessibilityLabel="Link to CDC Guidelines Website"
                          accessibilityRole="button"
                          onPress={() => {
                            Linking.openURL(
                              "https://www.cdc.gov/coronavirus/2019-ncov/hcp/guidance-risk-assesment-hcp.html"
                            );
                          }}
                        >
                          <Text style={styles.linkText}>CDC Guidelines</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  {!loading &&
                    question ==
                      "Are you experiencing new or worsening onset of any of the following?" &&
                    question_name == "additionalSymptoms" && (
                      <ScrollView>
                        <Text allowFontScaling={false} style={styles.LastQues}>
                          {question}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setchills(!chills);
                            if (None2) setNone2(!None2);
                          }}
                        >
                          <View
                            style={
                              chills
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                chills
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              Chills
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setVomiting(!Vomiting);
                            if (None2) setNone2(!None2);
                          }}
                        >
                          <View
                            style={
                              Vomiting
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                Vomiting
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              Vomiting
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setsore(!Sore);
                            if (None2) setNone2(!None2);
                          }}
                        >
                          <View
                            style={
                              Sore
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                Sore
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              Sore Throat
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setDiarrhea(!Diarrhea);
                            if (None2) setNone2(!None2);
                          }}
                        >
                          <View
                            style={
                              Diarrhea
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                Diarrhea
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              Diarrhea
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setlossofsmell(!Lossofsmell);
                            if (None2) setNone2(!None2);
                          }}
                        >
                          <View
                            style={
                              Lossofsmell
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                Lossofsmell
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              Loss of smell or taste
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setMuscle(!Muscle);
                            if (None2) setNone2(!None2);
                          }}
                        >
                          <View
                            style={
                              Muscle
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                Muscle
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              Muscle Pain
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setNone2(!None2);
                            if (!None2) {
                              setchills(false);
                              setVomiting(false);
                              setsore(false);
                              setDiarrhea(false);
                              setlossofsmell(false);
                              setMuscle(false);
                            }
                          }}
                        >
                          <View
                            style={
                              None2
                                ? styles.containerMaroonFilled
                                : styles.containerMaroonOutlined
                            }
                          >
                            <Text
                              allowFontScaling={false}
                              style={
                                None2
                                  ? styles.textMaroonFilled
                                  : styles.textMaroonOutlined
                              }
                            >
                              None
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <View style={styles.Submitsection}>
                          <TouchableOpacity
                            style={[
                              styles.containerGreyFilled,
                              {
                                backgroundColor:
                                  chills ||
                                  Vomiting ||
                                  Sore ||
                                  Diarrhea ||
                                  Lossofsmell ||
                                  Muscle ||
                                  None2 ||
                                  buttonDisabled
                                    ? "#D9D9D9"
                                    : "#F3F3F3",
                              },
                            ]}
                            disabled={
                              !!(
                                (!chills &&
                                  !Vomiting &&
                                  !Sore &&
                                  !Diarrhea &&
                                  !Lossofsmell &&
                                  !Muscle &&
                                  !None2) ||
                                buttonDisabled
                              )
                            }
                            onPressIn={async () => {
                              if (
                                None2 ||
                                chills ||
                                Vomiting ||
                                Sore ||
                                Diarrhea ||
                                Lossofsmell ||
                                Muscle
                              ) {
                                if (additional_symp === []) {
                                  return null;
                                }
                                await _retrieveData("Covid_Response_Object")
                                  .then((response) => {
                                    const data = JSON.parse(response);
                                    data.additionalSymptoms = additional_symp;
                                    if (
                                      !data.additionalSymptoms.length ||
                                      !data.symptoms.length
                                    ) {
                                      return null;
                                    } else {
                                      setResponse({
                                        ...response_obj,
                                        payload: data,
                                      });

                                      setloading(true);
                                      setfirst(false);
                                      setrefresh(true);
                                      toggleQuestionNumber();
                                    }
                                  })
                                  .catch((err) => console.log(err));
                              }
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={[
                                styles.textGreyFilled,
                                {
                                  color:
                                    chills ||
                                    Vomiting ||
                                    Sore ||
                                    Diarrhea ||
                                    Lossofsmell ||
                                    Muscle ||
                                    None2 ||
                                    buttonDisabled
                                      ? "black"
                                      : "grey",
                                },
                              ]}
                            >
                              Submit
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            accessibilityLabel="Link to CDC Guidelines Website"
                            accessibilityRole="button"
                            onPress={() => {
                              Linking.openURL(
                                "https://www.cdc.gov/coronavirus/2019-ncov/hcp/guidance-risk-assesment-hcp.html"
                              );
                            }}
                          >
                            <Text style={styles.linkText}>CDC Guidelines</Text>
                          </TouchableOpacity>
                        </View>
                      </ScrollView>
                    )}
                </View>
              </View>
            </View>
          )}

        {/* submitted health check and sounds safe for student */}
        {question_name == "APPROVED" && !loading && isStudent && (
          <View style={styles.container}>
            <View style={styles.modal}>
              <View style={styles.topDiv}>
                <TouchableOpacity
                  onPress={() => {
                    analytics_Ref.current.sendData({
                      "action-type": "click",
                      "starting-screen": "covid-daily-health-check-modal",
                      "starting-section": null,
                      target: "daily-health-check-modal-close",
                      "resulting-screen": "covid-daily-health-check-modal",
                      "resulting-section": null,
                      "action-metadata": {
                        "button-type": "icon",
                      },
                    });
                    toggleInitial();
                  }}
                  accessibilityLabel="Close modal"
                  accessibilityRole="button"
                >
                  <View style={styles.closeIcon}>
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
              <ScrollView style={styles.mainDivContainer}>
                <Image style={styles.iconImage} source={icon_mask} />
                <Text allowFontScaling={false} style={styles.questionText}>
                  Thank you for submitting your daily health check!
                </Text>
                <Text allowFontScaling={false} style={styles.ResultNote}>
                  In addition to these questions, if you believe you were
                  exposed in the last 14 days to someone who was positive for
                  COVID-19, you should not come to school and notify ASU Health
                  Services
                </Text>
                <TouchableOpacity
                  style={styles.containerGoldFilled}
                  onPress={() => {
                    Linking.openURL("https://eoss.asu.edu/health");
                  }}
                >
                  <Text allowFontScaling={false} style={styles.textGoldFilled}>
                    ASU Health Services
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.containerGreyFilled}
                  onPress={() => {
                    analytics_Ref.current.sendData({
                      "action-type": "click",
                      "starting-screen": "covid-daily-health-check-modal",
                      "starting-section": null,
                      target: "daily-health-check-modal-close",
                      "resulting-screen": "covid-daily-health-check-modal",
                      "resulting-section": null,
                      "action-metadata": {
                        "button-type": "button",
                      },
                    });
                    toggleInitial();
                  }}
                >
                  <Text allowFontScaling={false} style={styles.textGreyFilled}>
                    Close
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="Link to CDC Guidelines Website"
                  accessibilityRole="button"
                  onPress={() => {
                    Linking.openURL(
                      "https://www.cdc.gov/coronavirus/2019-ncov/hcp/guidance-risk-assesment-hcp.html"
                    );
                  }}
                >
                  <Text style={styles.linkText}>CDC Guidelines</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        )}

        {/* submitted health check and sounds safe for not student */}
        {question_name == "APPROVED" && !loading && !isStudent && (
          <View style={styles.container}>
            <View style={styles.modal}>
              <View style={styles.topDiv}>
                <TouchableOpacity
                  onPress={() => {
                    analytics_Ref.current.sendData({
                      "action-type": "click",
                      "starting-screen": "covid-daily-health-check-modal",
                      "starting-section": null,
                      target: "daily-health-check-modal-close",
                      "resulting-screen": "covid-daily-health-check-modal",
                      "resulting-section": null,
                      "action-metadata": {
                        "button-type": "icon",
                      },
                    });
                    toggleInitial();
                  }}
                  accessibilityLabel="Close modal"
                  accessibilityRole="button"
                >
                  <View style={styles.closeIcon}>
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
              <ScrollView style={styles.mainDivContainer}>
                <Image style={styles.iconImage} source={icon_mask} />
                <Text allowFontScaling={false} style={styles.questionText}>
                  Thank you for submitting your daily health check!
                </Text>
                <Text allowFontScaling={false} style={styles.ResultNote}>
                  In addition to these questions, if you believe you were
                  exposed in the last 14 days to someone who was currently
                  positive for COVID-19, you should not come to work and notify
                  ASU Employee Wellness.
                </Text>
                <TouchableOpacity
                  style={styles.containerGoldFilled}
                  onPress={() => {
                    if (Platform.OS !== "android") {
                      var phoneNumber = `telprompt:${4807276517}`;
                    } else {
                      var phoneNumber = `tel:${4807276517}`;
                    }
                    Linking.openURL(phoneNumber);
                  }}
                >
                  <Text allowFontScaling={false} style={styles.textGoldFilled}>
                    ASU Employee Wellness
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.containerGreyFilled}
                  onPress={() => {
                    analytics_Ref.current.sendData({
                      "action-type": "click",
                      "starting-screen": "covid-daily-health-check-modal",
                      "starting-section": null,
                      target: "daily-health-check-modal-close",
                      "resulting-screen": "covid-daily-health-check-modal",
                      "resulting-section": null,
                      "action-metadata": {
                        "button-type": "button",
                      },
                    });
                    toggleInitial();
                  }}
                >
                  <Text allowFontScaling={false} style={styles.textGreyFilled}>
                    Close
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="Link to CDC Guidelines Website"
                  accessibilityRole="button"
                  onPress={() => {
                    Linking.openURL(
                      "https://www.cdc.gov/coronavirus/2019-ncov/hcp/guidance-risk-assesment-hcp.html"
                    );
                  }}
                >
                  <Text style={styles.linkText}>CDC Guidelines</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        )}

        {/* showing symptoms of covid-19 for student */}
        {!loading && question_name == "SECURE_TESTING" && isStudent && (
          <View style={styles.container}>
            <View style={styles.modal}>
              <View style={styles.topDiv}>
                <TouchableOpacity
                  onPress={() => {
                    analytics_Ref.current.sendData({
                      "action-type": "click",
                      "starting-screen": "covid-daily-health-check-modal",
                      "starting-section": null,
                      target: "daily-health-check-modal-close",
                      "resulting-screen": "covid-daily-health-check-modal",
                      "resulting-section": null,
                      "action-metadata": {
                        "button-type": "icon",
                      },
                    });
                    toggleInitial();
                  }}
                  accessibilityLabel="Close modal"
                  accessibilityRole="button"
                >
                  <View style={styles.closeIcon}>
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
              <ScrollView style={styles.mainDivContainer}>
                <Image style={styles.iconImage} source={icon_symptoms} />
                <Text allowFontScaling={false} style={styles.questionText2}>
                  We're sorry to hear that you're not feeling well.
                </Text>
                <Text allowFontScaling={false} style={styles.ResultNote2}>
                  Your symptoms may be related to COVID-19. Please self-isolate
                  and schedule a telehealth appointment with ASU Health
                  Services.
                </Text>
                <TouchableOpacity
                  style={styles.containerGoldFilled}
                  onPress={() => {
                    analytics_Ref.current.sendData({
                      "action-type": "click",
                      "starting-screen": "covid-daily-health-check-modal",
                      "starting-section": null,
                      target: "My Health Portal",
                      "resulting-screen": "external-link",
                      "resulting-section": null,
                      "action-metadata": {
                        url: "https://eoss.asu.edu/health/portal",
                      },
                    });
                    Linking.openURL("https://eoss.asu.edu/health/portal");
                  }}
                >
                  <Text allowFontScaling={false} style={styles.textGoldFilled}>
                    My Health Portal
                  </Text>
                </TouchableOpacity>
                <View style={{ marginTop: "2%" }}>
                  <TouchableOpacity
                    style={styles.containerGreyFilled}
                    onPress={() => {
                      analytics_Ref.current.sendData({
                        "action-type": "click",
                        "starting-screen": "covid-daily-health-check-modal",
                        "starting-section": null,
                        target: "daily-health-check-modal-close",
                        "resulting-screen": "covid-daily-health-check-modal",
                        "resulting-section": null,
                        "action-metadata": {
                          "button-type": "button",
                        },
                      });
                      toggleInitial();
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={styles.textGreyFilled}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityLabel="Link to CDC Guidelines Website"
                    accessibilityRole="button"
                    onPress={() => {
                      Linking.openURL(
                        "https://www.cdc.gov/coronavirus/2019-ncov/hcp/guidance-risk-assesment-hcp.html"
                      );
                    }}
                  >
                    <Text style={styles.linkText}>CDC Guidelines</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
        {/* showing symptoms of covid-19 for staff */}
        {!loading && question_name == "SECURE_TESTING" && !isStudent && (
          <View style={styles.container}>
            <View style={styles.modal}>
              <View style={styles.topDiv}>
                <TouchableOpacity
                  onPress={() => {
                    analytics_Ref.current.sendData({
                      "action-type": "click",
                      "starting-screen": "covid-daily-health-check-modal",
                      "starting-section": null,
                      target: "daily-health-check-modal-close",
                      "resulting-screen": "covid-daily-health-check-modal",
                      "resulting-section": null,
                      "action-metadata": {
                        "button-type": "icon",
                      },
                    });
                    toggleInitial();
                  }}
                  accessibilityLabel="Close modal"
                  accessibilityRole="button"
                >
                  <View style={styles.closeIcon}>
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
              <ScrollView style={styles.mainDivContainer}>
                <Image style={styles.iconImage} source={icon_symptoms} />
                <Text allowFontScaling={false} style={styles.questionText2}>
                  We're sorry to hear that you're not feeling well.
                </Text>
                <Text allowFontScaling={false} style={styles.ResultNote2}>
                  Your symptoms may be related to COVID-19. Please self-isolate
                  and contact your health care provider for further
                  instructions. You also should notify your supervisor that you
                  will not be at work today.
                </Text>
                <Text
                  allowFontScaling={false}
                  style={{ textAlign: "center", marginBottom: "1%" }}
                >
                  On-site testing is available for employees
                </Text>
                <TouchableOpacity
                  style={styles.containerGoldFilled}
                  onPress={() => {
                    analytics_Ref.current.sendData({
                      "action-type": "click",
                      "starting-screen": "covid-daily-health-check-modal",
                      "starting-section": null,
                      target: "Testing Information",
                      "resulting-screen": "external-link",
                      "resulting-section": null,
                      "action-metadata": {
                        url: "https://cfo.asu.edu/employee-testing",
                      },
                    });
                    Linking.openURL("https://cfo.asu.edu/employee-testing");
                  }}
                >
                  <Text allowFontScaling={false} style={styles.textGoldFilled}>
                    Testing Information
                  </Text>
                </TouchableOpacity>
                <View style={{ marginTop: "5%" }}>
                  <TouchableOpacity
                    style={styles.containerGreyFilled}
                    onPress={() => {
                      analytics_Ref.current.sendData({
                        "action-type": "click",
                        "starting-screen": "covid-daily-health-check-modal",
                        "starting-section": null,
                        target: "daily-health-check-modal-close",
                        "resulting-screen": "covid-daily-health-check-modal",
                        "resulting-section": null,
                        "action-metadata": {
                          "button-type": "button",
                        },
                      });
                      toggleInitial();
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={styles.textGreyFilled}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityLabel="Link to CDC Guidelines Website"
                    accessibilityRole="button"
                    onPress={() => {
                      Linking.openURL(
                        "https://www.cdc.gov/coronavirus/2019-ncov/hcp/guidance-risk-assesment-hcp.html"
                      );
                    }}
                  >
                    <Text style={styles.linkText}>CDC Guidelines</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        )}

        {/* not coming today to campus */}
        {(question_name == "not_coming_today" || !coming_today) && (
          <View style={styles.container}>
            <View style={styles.modal}>
              <View style={styles.topDiv}>
                <TouchableOpacity
                  onPress={() => {
                    analytics_Ref.current.sendData({
                      "action-type": "click",
                      "starting-screen": "covid-daily-health-check-modal",
                      "starting-section": null,
                      target: "daily-health-check-modal-close",
                      "resulting-screen": "covid-daily-health-check-modal",
                      "resulting-section": null,
                      "action-metadata": {
                        "button-type": "icon",
                      },
                    });
                    toggleInitial();
                  }}
                  accessibilityLabel="Close modal"
                  accessibilityRole="button"
                >
                  <View style={styles.closeIcon}>
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
              <ScrollView style={styles.mainDivContainer}>
                <Image style={styles.iconImage} source={icon_record} />
                <Text allowFontScaling={false} style={styles.questionText}>
                  In that case, you're done!
                </Text>
                <Text allowFontScaling={false} style={styles.ResultNote}>
                  Thank you for doing everything you can to keep our Sun Devil
                  community healthy.
                </Text>
                <TouchableOpacity
                  style={styles.containerGreyFilled}
                  onPress={() => {
                    analytics_Ref.current.sendData({
                      "action-type": "click",
                      "starting-screen": "covid-daily-health-check-modal",
                      "starting-section": null,
                      target: "daily-health-check-modal-close",
                      "resulting-screen": "covid-daily-health-check-modal",
                      "resulting-section": null,
                      "action-metadata": {
                        "button-type": "button",
                      },
                    });
                    toggleInitial();
                  }}
                >
                  <Text allowFontScaling={false} style={styles.textGreyFilled}>
                    Close
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="Link to CDC Guidelines Website"
                  accessibilityRole="button"
                  onPress={() => {
                    Linking.openURL(
                      "https://www.cdc.gov/coronavirus/2019-ncov/hcp/guidance-risk-assesment-hcp.html"
                    );
                  }}
                >
                  <Text style={styles.linkText}>CDC Guidelines</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}
export const DHC = AppSyncComponent(
  Covid_questionnaire,
  covid_firstQues,
  covid_secondQues
);
export class DailyHealthCheck extends React.Component {
  render() {
    return (
      <ErrorWrapper>
        <DHC {...this.props} />
      </ErrorWrapper>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(52, 52, 52, 0.8)",
    paddingTop: responsiveHeight(6),
  },
  modal: {
    flex: 1,
    backgroundColor: "white",
    margin: "5%",
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
    backgroundColor: "white",
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
    marginTop: "5%",
    marginBottom: "7%",
    fontSize: responsiveFontSize(3),
    fontFamily: "Roboto",
    fontWeight: "900",
    color: "black",
  },
  questionText: {
    alignSelf: "center",
    textAlign: "center",
    marginHorizontal: "5%",
    marginBottom: "10%",
    fontSize: responsiveFontSize(2.5),
    fontFamily: "Roboto",
    fontWeight: "600",
    color: "black",
  },
  LastQues: {
    alignSelf: "center",
    textAlign: "center",
    marginHorizontal: "5%",
    marginBottom: "3%",
    fontSize: responsiveFontSize(2.1),
    fontFamily: "Roboto",
    fontWeight: "600",
    color: "black",
  },
  questionText2: {
    alignSelf: "center",
    textAlign: "center",
    marginHorizontal: "7%",
    marginBottom: "7%",
    fontSize: responsiveFontSize(2.5),
    fontFamily: "Roboto",
    fontWeight: "600",
    color: "black",
  },
  ResultNote: {
    alignSelf: "center",
    textAlign: "center",
    marginHorizontal: "7%",
    marginBottom: "8%",
    fontSize: responsiveFontSize(2),
    fontFamily: "Roboto",
    fontWeight: "600",
    color: "black",
  },
  ResultNote2: {
    alignSelf: "center",
    textAlign: "center",
    marginHorizontal: "5%",
    marginBottom: "5%",
    fontSize: responsiveFontSize(1.8),
    fontFamily: "Roboto",
    fontWeight: "600",
    color: "black",
  },

  Submitsection: {
    marginTop: "5%",
  },
  plus_minus: {
    borderRadius: 100,
    width: 80,
    height: 80,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    color: "black",
    backgroundColor: "#f3f3f3",
    marginHorizontal: 20,
  },
  day_number: {
    marginVertical: responsiveHeight(2.5),
    fontSize: responsiveFontSize(7.5),
    fontFamily: "Roboto",
    fontWeight: "900",
    alignSelf: "center",
    color: "black",
  },
  temp_value: {
    fontSize: responsiveFontSize(5.5),
    fontFamily: "Roboto",
    fontWeight: "800",
    color: "black",
  },

  outercircle: {
    alignSelf: "center",
    borderRadius:
      Math.round(
        Dimensions.get("window").width + Dimensions.get("window").height
      ) / 4,
    width: Dimensions.get("window").width * 0.6,
    height: Dimensions.get("window").width * 0.6,
    borderColor: "grey",
    borderWidth: 0.25,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  closeIcon: {
    padding: 5,
  },
  containerMaroonFilled: {
    backgroundColor: "#991E32",
    borderColor: "#991E32",
    width: "65%",
    alignSelf: "center",
    // height:"30%",
    alignItems: "center",
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: "1%",
    position: "relative",
  },
  containerGreyFilled: {
    backgroundColor: "#D9D9D9",
    borderColor: "#D9D9D9",
    width: "65%",
    alignSelf: "center",
    alignItems: "center",
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: "1%",
    position: "relative",
  },
  containerGoldFilled: {
    backgroundColor: "#FDC426",
    borderColor: "#FDC426",
    width: "65%",
    alignSelf: "center",
    alignItems: "center",
    paddingVertical: 7,
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 20,
    position: "relative",
  },
  containerMaroonOutlined: {
    backgroundColor: "transparent",
    borderColor: "#991E32",
    width: "65%",
    alignSelf: "center",
    alignItems: "center",
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: "1%",
    position: "relative",
  },
  textMaroonFilled: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: "500",
    color: "white",
    fontFamily: "Roboto",
    fontWeight: "700",
  },
  textMaroonOutlined: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: "500",
    color: "#991E32",
    fontFamily: "Roboto",
    fontWeight: "700",
  },
  textGreyFilled: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: "500",
    color: "black",
    fontFamily: "Roboto",
    fontWeight: "700",
  },
  textGoldFilled: {
    fontSize: responsiveFontSize(1.5),
    fontFamily: "Roboto",
    fontWeight: "500",
    color: "black",
    fontWeight: "700",
  },
  iconImage: {
    alignSelf: "center",
    aspectRatio: 0.5,
    width: 175,
    height: 175,
    resizeMode: "contain",
  },
  linkText: {
    alignSelf: "center",
    marginTop: "5%",
    textDecorationLine: "underline",
    color: "maroon",
  },
});
