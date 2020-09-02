import React from "react";
import {
  View,
  AsyncStorage,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { DefaultText as Text } from "../../presentational/DefaultText.js";
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
import {
  StagedSurveyQuery,
  RemoveAdminEngagementMutation,
  AdminEngagementsQuery
} from "../../../Queries";

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
export class SimpleSurvey extends React.Component {
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
    this.handleAdd = this.handleAdd.bind(this);
    this.completeSurvey = this.completeSurvey.bind(this);
  }

  _interval = null;

  static defaultProps = {
    submit: () => null,
    survey: null,
    survey_id: null
  };

  componentDidMount() {
    this._interval = setInterval(() => {
      this.queryAdminEngagements();
    }, 10000);
  }

  /**
   * Submits a surveyResponse mutation
   */
  handleAdd = data => {
    const { id, timestamp, selection, other } = data;

    this.removeEngagementMutation(data.index)
      .then(resp => {
        // console.log(resp)
      })
      .catch(err => {
        console.log("failed to remove", err);
      });

    this.setState(this.initState, () => {
      this.props.submit({ other, selection, timestamp, id });
    });
  };

  componentWillUnmount() {
    clearInterval(this._interval);
  }

  /**
    Check to see if there are any surveys existing in the users
    list of amdin engagements.
   */
  queryAdminEngagements() {
    if (this.props.client) {
      this.props.client
        .query({
          fetchPolicy: "network-only",
          query: AdminEngagementsQuery
        })
        .then(response => {
          let engagements = response.data.getAdminEngagements;
          let surveys = this.pruneAdminEngagements(engagements);
          this.attemptSurveyEngagement(surveys);
        });
    }
  }

  /**
    Only grab the surveys from the list of admin engagements.
    Return an array of objects with the index of the surveys and their engagement
    information.

    index: The array location of the engagement. Important for removal on completion
    or denial of an engagement.
    engagement: Engagement info with a reference to content elsewhere. EX: Id reference to a survey
   */
  pruneAdminEngagements(engagements) {
    let surveys = [];
    if (engagements && engagements.length > 0) {
      for (var i = 0; i < engagements.length; i++) {
        if (engagements[i].type == "survey") {
          surveys.push({
            index: i,
            engagement: engagements[i]
          });
        }
      }
    }
    return surveys;
  }

  /**
    Given an array of survey engagements, convert the engagement to its proper survey
    and attempt to start a survey;
   */
  attemptSurveyEngagement(surveys) {
    if (surveys && surveys.length > 0) {
      for (var i = 0; i < surveys.length; i++) {
        let engagement = surveys[i].engagement;
        let index = surveys[i].index;

        let now = new Date().getTime();
        if (!engagement.expire || engagement.expire > now) {
          this.getSurveyFromEngagement(engagement, index);
        } else {
          this.removeEngagementMutation(index);
        }
        break;
      }
    }
  }

  /**
   * Query the table of surveys for a specific ID referenced by the engagement
   *
   * @param {*} engagement
   * @param {*} index
   */
  getSurveyFromEngagement(engagement, index) {
    if (this.props.client) {
      this.props.client
        .query({
          query: StagedSurveyQuery,
          variables: { id: engagement.id }
        })
        .then(response => {
          if (response.data.getStagedSurvey) {
            this.checkSurveys(response.data.getStagedSurvey, index);
          }
        });
    }
  }

  /**
    Clears an engagement from the user's list of engagements.
   */
  removeEngagementMutation(index = null) {
    if (this.props.client && index >= 0) {
      return this.props.client
        .mutate({
          mutation: RemoveAdminEngagementMutation,
          variables: {
            index: index
          }
        })
        .then(resp => {
          // console.log("mutation response", resp); // Debug option
        })
        .catch(e => {
          console.log("submission error", e);
        });
    } else {
      return Promise.reject("No client");
    }
  }

  /**
   * Checking whether we can display a survey or not.
   *
   * Is another modal in the way? Have we done it already? Has the user opted out? etc..
   * If we are good to go then trigger the modal
   */
  checkSurveys(survey = null, index = null) {
    this.checkOnboarded().then(clear => {
      // If user is not going through onboarding
      if (clear) {
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
                      let surveyWithCallbacks = {
                        index: index,
                        id: survey.id,
                        options: survey.options,
                        question: survey.question,
                        timestamp: Number(survey.timestamp),
                        handleAdd: this.handleAdd,
                        completeSurvey: this.completeSurvey
                      };

                      this.context.setModalContent(
                        SurveyModal,
                        surveyWithCallbacks
                      );
                      this.context.setModalVisible(true);
                      this.context.setModalHeight(responsiveHeight(90));
                    })
                    .catch(error => {
                      throw error;
                    });
                } else {
                  console.log("Survey already done");
                  this.removeEngagementMutation(index);
                }
              })
              .catch(e => {
                throw error;
              });
          }
        } else {
          console.log("modal is in use");
        }
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

SimpleSurvey.contextTypes = {
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func,
  setModalFlex: PropTypes.func,
  setModalHeight: PropTypes.func,
  getModalStatus: PropTypes.func,
  renderOtherElement: PropTypes.func
};

/**
 * Modal content to be passed into the HomeModal in order to grab user feedback
 */
class SurveyModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: null,
      radio: null,
      other: null,
      text: null
    };
  }

  submit() {
    let textvalue = this.state.text ? this.state.text : "empty";
    this.props.handleAdd({
      index: this.props.index,
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
                justifyContent: "center"
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
                    accessible={true}
                    accessibilityLabel={"double tap to select"}
                    accessibilityRole="button"
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
                      accessibilityLabel={"double tap to select"}
                    />
                    <RadioButtonLabel
                      obj={obj}
                      index={i}
                      labelHorizontal={true}
                      onPress={onPress}
                      labelStyle={{
                        textAlignVertical: "center",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: responsiveFontSize(2.2),
                        color: "#464646",
                        height: responsiveFontSize(5.0),
                        lineHeight: responsiveFontSize(2.3)
                      }}
                      labelWrapStyle={{
                        alignItems: "center",
                        width: responsiveWidth(60)
                      }}
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
                  marginVertical: 12,
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
                  accessibilityRole="button"
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
  renderOtherElement: PropTypes.func
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
    padding: responsiveWidth(10)
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
