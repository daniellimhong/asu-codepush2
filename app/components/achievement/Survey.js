import React from "react";
import {
  View,
  Text,
  AsyncStorage,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import PropTypes from "prop-types";
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel
} from "react-native-simple-radio-button";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

/**
 * The Survey component pulls surveys from the backend once per
 * hour for users to take. The system prioritizes the latest
 * survey each time
 *
 * Users can opt out. Surveys will not fire if onboarding isn't complete.
 *
 * To add new surveys, add entries to the surveys DynamoDB table.
 * Limit 4 "options"
 */
export class Survey extends React.Component {
  initState = {
    timestamp: 0,
    selection: "",
    other: ""
  };

  constructor(props) {
    super(props);
    this.state = {
      timestamp: 0,
      selection: "",
      other: ""
    };
  }

  static defaultProps = {
    submit: () => null,
    subscribeToNewSurveys: () => null,
    subscribeFriendRequests: () => null
  };
  _interval = null;

  /**
   * Submits a srurveyResponse mutation
   */
  handleAdd = data => {
    const { id, timestamp, selection, other } = data;

    this.setState(this.initState, () => {
      this.props.submit({ id, other, selection, timestamp });
    });
  };

  componentWillMount() {
    this.props.subscribeToNewSurveys(); // Corresponds to AppSync subscription from the graphql() call in Home.js
  }

  componentDidMount() {
    this._interval = setInterval(() => {
      this.runSurvey();
    }, 10000);

    this.checkSurveys();
  }

  /**
   * Triggered by survey subscription.
   *
   * If there is a survey being passed then we want to trigger the checkSurvey
   * function in order to display the survey, pending checks.
   * @param {*} props
   */
  componentWillReceiveProps(props) {
    this.runSurvey(props);
  }

  runSurvey(props = this.props) {
    // console.log("Received survey props", props);
    if (props.survey) {
      this.checkSurveys(props.survey);
    }
  }

  /**
   * Checking whether we can display a survey or not.
   *
   * Is another modal in the way? Have we done it already? Has the user opted out? etc..
   * If we are good to go then trigger the modal
   */
  checkSurveys(survey = null) {
    survey ? survey : this.props.survey;

    this.checkOnboarded().then(clear => {
      // If user is not going through onboarding
      if (clear) {
        AsyncStorage.getItem("surveyTime")
          .then(time => {
            // Check if survey time is greater than or equal to 1 hour
            let now = new Date().getTime();
            if ((time && now - Number(time) >= 60 * 60 * 1000) || !time) {
              // if(time && (now - Number(time) >= (0)) || !time){ // uncomment this one for testing

              let stats = this.context.getModalStatus(); // If modal is not already in use
              if (!stats.modalVisible) {
                if (survey) {
                  this.checkCompletedSurveys(survey.id)
                    .then(complete => {
                      if (!complete) {
                        let timestamp = new Date().getTime().toString();
                        AsyncStorage.setItem("surveyTime", timestamp)
                          .then(status => {
                            // Starting a survey
                            console.log("Doing a survey");
                          })
                          .catch(error => {
                            throw error;
                          });

                        if (survey) {
                          let surveyWithCallbacks = {
                            id: survey.id,
                            options: survey.options,
                            question: survey.question,
                            timestamp: Number(survey.timestamp),
                            handleAdd: this.handleAdd.bind(this),
                            completeSurvey: this.completeSurvey.bind(this)
                          };

                          this.context.setModalContent(
                            SurveyModal,
                            surveyWithCallbacks
                          );
                          this.context.setModalVisible(true);
                          this.context.setModalHeight(responsiveHeight(90));
                        }
                      } else {
                        console.log("Survey already done");
                      }
                    })
                    .catch(e => {
                      throw error;
                    });
                } else {
                  // console.log("No surveys");
                }
              } else {
                console.log("modal is in use");
              }
            } else {
              console.log("Not enough time has passed for a survey", now, time);
            }
          })
          .catch(error => {
            throw error;
          });
      } else {
        console.log("User is going through onboarding");
      }
    });
  }

  /**
   * Check whether a survey ID has already been processed as completed
   * by the user.
   * @param {*} id
   */
  checkCompletedSurveys(id) {
    // return new Promise.resolve(false) // For debug
    var id = id.toString();
    return AsyncStorage.getItem("completedSurveys")
      .then(surveys => {
        if (surveys) {
          surveys = surveys.split(",");
          if (surveys.indexOf(id) >= 0) {
            return true;
          }
        }
        return false;
      })
      .catch(error => {
        throw error;
      });
  }

  /**
   * Store the survey ID as completed by the user to prevent appsync
   * subscription issues.
   * @param {*} id
   */
  completeSurvey(id) {
    var id = id.toString();
    var complete = [];
    return AsyncStorage.getItem("completedSurveys")
      .then(surveys => {
        if (surveys) {
          complete = surveys.split(",");
        }
        if (complete.indexOf(id) < 0) {
          complete.push(id);
        }
        complete = complete.toString();
        return AsyncStorage.setItem("completedSurveys", complete)
          .then(status => {
            // Starting a survey
            console.log("Recorded complete survey");
            return status;
          })
          .catch(error => {
            throw error;
          });
      })
      .catch(error => {
        throw error;
      });
  }

  /**
   * Make sure the onboarding window isnt in the way
   */
  checkOnboarded() {
    return AsyncStorage.getItem("onboarding")
      .then(status => {
        if (status == null) {
          return false;
        } else {
          return true;
        }
      })
      .catch(error => {
        throw error;
      });
  }

  render() {
    return null;
  }
}

Survey.contextTypes = {
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func,
  setModalFlex: PropTypes.func,
  setModalHeight: PropTypes.func,
  getModalStatus: PropTypes.func,
  renderOtherElement: PropTypes.func,
  getTokens: PropTypes.func
};

/**
 * Modal content to be passed into the HomeModal in order to grab user feedback
 */
class SurveyModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      radio: null,
      other: null,
      text: null
    };
  }

  submit() {
    let textvalue = this.state.text ? this.state.text : "empty";
    this.props.handleAdd({
      id: this.props.id,
      other: textvalue,
      selection: this.state.radio,
      timestamp: Number(this.props.timestamp)
    });
    this.props.completeSurvey(this.props.id);
  }

  render() {
    let radio_props = [];
    if (this.props.options) {
      this.props.options.forEach(option => {
        radio_props.push({
          label: option,
          value: option
        });
      });
      return (
        <View style={styles.modal}>
          <Text style={styles.header}>Quick Question</Text>
          <Text style={styles.question}>{this.props.question}</Text>
          <View style={styles.radios}>
            <RadioForm
              style={{
                flex: 1,
                alignItems: "flex-start",
                justifyContent: "center",
                width: responsiveWidth(70)
              }}
              formHorizontal={false}
              animation={false}
            >
              {radio_props.map((obj, i) => {
                var onPress = (value, index) => {
                  this.setState({
                    radio: value,
                    value3: value,
                    value3Index: index
                  });
                };
                return (
                  <RadioButton
                    style={{ marginVertical: responsiveHeight(0.5) }}
                    labelHorizontal={true}
                    key={i}
                  >
                    {/*  You can set RadioButtonLabel before RadioButtonInput */}
                    <RadioButtonInput
                      obj={obj}
                      index={i}
                      isSelected={this.state.value3Index === i}
                      onPress={onPress}
                      borderWidth={1}
                      buttonInnerColor={"#464646"}
                      buttonOuterColor={
                        this.state.value3Index === i ? "#464646" : "#AEAEAE"
                      }
                      buttonSize={responsiveFontSize(3)}
                      buttonOuterSize={responsiveFontSize(4)}
                      buttonStyle={{}}
                      buttonWrapStyle={{ marginLeft: 10 }}
                    />
                    <RadioButtonLabel
                      obj={obj}
                      index={i}
                      labelHorizontal={true}
                      onPress={onPress}
                      labelStyle={{
                        fontSize: responsiveFontSize(2.3),
                        color: "#464646",
                        lineHeight: responsiveHeight(4)
                      }}
                      labelWrapStyle={{}}
                    />
                  </RadioButton>
                );
              })}
            </RadioForm>
          </View>
          <View style={{ flex: 1, width: "100%", justifyContent: "center" }}>
            <TextInput
              style={{
                textAlignVertical: "top",
                flex: 1,
                padding: 10,
                borderColor: "#bbbbbb",
                borderWidth: 1,
                marginLeft: 10,
                marginRight: 10
              }}
              underlineColorAndroid={"transparent"}
              multiline={true}
              maxLength={150}
              onChangeText={t => this.setState({ text: t })}
              placeholder="Tell us more.."
              value={this.state.text}
            />
          </View>
          <View>
            <TouchableOpacity
              onPress={() => {
                if (this.state.radio !== null) {
                  this.submit();
                  this.context.setModalVisible(false);
                  this.context.SetToast("Survey submitted. Thank you!");
                } else {
                  this.context.SetToast(
                    "Please select an option or exit the survey"
                  );
                }
              }}
            >
              <View
                style={{
                  marginVertical: 20,
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 200,
                  height: responsiveHeight(7),
                  borderRadius: 30,
                  borderWidth: 1,
                  borderColor: "#D40546"
                }}
              >
                <Text
                  style={{ color: "#D40546", fontSize: responsiveFontSize(2) }}
                >
                  SUBMIT
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return null;
    }
  }
}

SurveyModal.contextTypes = {
  SetToast: PropTypes.func,
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func,
  setModalFlex: PropTypes.func,
  setModalHeight: PropTypes.func,
  getModalStatus: PropTypes.func,
  renderOtherElement: PropTypes.func,
  getTokens: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  modal: {
    backgroundColor: "white",
    flex: 1,
    alignItems: "center",
    marginTop: responsiveHeight(2),
    padding: responsiveWidth(5)
  },
  header: {
    fontSize: responsiveFontSize(3),
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0)",
    fontFamily: "Roboto"
  },
  question: {
    // flex:0.5,
    alignSelf: "center",
    fontSize: responsiveFontSize(2.5),
    textAlign: "center",
    marginVertical: responsiveHeight(2),
    backgroundColor: "rgba(0,0,0,0)",
    color: "#464646"
  },
  radios: {
    marginHorizontal: responsiveWidth(2),
    flex: 1.5
    // alignItems: "flex-start",
    // justifyContent: "flex-start"
  }
});
