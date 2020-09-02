import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform
} from "react-native";
import PropTypes from "prop-types";
import { Api as ApiService } from "../../services/api/index";
import { WLHOC } from "../functional/authentication/auth_components/weblogin/index";
import Analytics from "./../functional/analytics";
import { tracker } from "./google-analytics.js";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { DefaultText as Text } from "../presentational/DefaultText.js";
const IS_IOS = Platform.OS === "ios";
const IS_ANDROID = Platform.OS === "android";
/**
 * Feedback page
 *
 * This component requires that the HomeModal component be somewhere above it in the app hierarchy,
 * as it utilizes that component to display the modal for feedback..
 */
export class Feedback extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "click",
      "target": "Feedback",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null,
      "resulting-screen": "feedback", 
      "resulting-section": null
    });
  }
  /**
   * Activate the HomeModal parent
   */
  activate() {
    this.context.setModalContent(FeedbackModal);
    this.context.setModalHeight(responsiveHeight(50));
    this.context.renderOtherElement(<View />);
    this.context.setModalVisible(true);
  }
  render() {
    // Conditionally display the feedback section because the API requires authentication.
    let feedback = () => {
      return (
        <View style={{ flex: 1 }}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              style={{
                color: "white",
                fontSize: responsiveFontSize(2.5),
                textAlign: "center",
                fontWeight: "100",
                fontFamily: 'Roboto',
              }}
            >
              Are there things we could improve or new features you'd like to
              see?
            </Text>
          </View>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <TouchableOpacity
              onPress={() => {
                this.refs.analytics.sendData({
                  "action-type": "click",
                  "target": "Give Feedback",
                  "starting-screen": "feedback",
                  "starting-section": null, 
                  "resulting-screen": "feedback", 
                  "resulting-section": "feedback-modal"
                });
                tracker.trackEvent("Click", "GiveFeedBack");
                this.activate();
              }}
              accessibilityRole="button"
            >
              <View
                style={{
                  width: responsiveWidth(54),
                  padding: responsiveHeight(1.75),
                  alignSelf: "center",
                  alignContent: "center",
                  justifyContent: "center",
                  borderRadius: 50,
                  borderColor: "white",
                  borderWidth: 1
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: responsiveFontSize(1.75),
                    textAlign: "center",
                    backgroundColor: "rgba(0,0,0,0)",
                    fontFamily: "Roboto"
                  }}
                >
                  GIVE FEEDBACK
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    };
    let HOCFeedback = WLHOC(feedback);
    return (
      <View style={styles.container}>
        <Analytics ref="analytics" />
        <View style={{ flex: 1 }}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              adjustsfontsizetofit
              style={{
                color: "white",
                fontSize: responsiveFontSize(2.5),
                fontWeight: "bold",
                textAlign: "center",
                fontFamily: "Roboto"
              }}
            >
              If you like the ASU Mobile App, please give us a rating. Thanks!
            </Text>
          </View>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <TouchableOpacity
              onPress={() => {
                if (IS_ANDROID) {
                  this.refs.analytics.sendData({
                    "action-type": "click",
                    "target": "Rate Now",
                    "starting-screen": "feedback",
                    "starting-section": null, 
                    "resulting-screen": "play-store", 
                    "resulting-section": null
                  });
                  tracker.trackEvent("Click", "RateNow Android_Device");
                  Linking.openURL(
                    "market://details?id=edu.asu.mobile.android.test"
                  );
                } else if (IS_IOS) {
                  this.refs.analytics.sendData({
                    "action-type": "click",
                    "target": "Rate Now",
                    "starting-screen": "feedback",
                    "starting-section": null, 
                    "resulting-screen": "app-store", 
                    "resulting-section": null
                  });
                  tracker.trackEvent("Click", "RateNow Android_Device");
                  Linking.openURL(
                    "itms://itunes.apple.com/us/app/apple-store/id453761080?mt=8"
                  );
                }
              }}
              accessibilityRole="button"
            >
              <View
                style={{
                  width: responsiveWidth(54),
                  padding: responsiveHeight(1.75),
                  justifyContent: "center",
                  alignSelf: "center",
                  backgroundColor: "white",
                  borderRadius: 50
                }}
              >
                <Text
                  style={{
                    color: "#AC0347",
                    fontWeight: "bold",
                    fontSize: responsiveFontSize(1.75),
                    textAlign: "center",
                    backgroundColor: "transparent",
                    fontFamily: "Roboto"
                  }}
                >
                  RATE NOW
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <HOCFeedback />
        <View style={{ flex: 1 }} />
      </View>
    );
  }
}
Feedback.contextTypes = {
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func,
  renderOtherElement: PropTypes.func,
  setModalHeight: PropTypes.func
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A20145",
    alignItems: "center",
    justifyContent: "center",
    padding: 50
  }
});
/**
 * Modal content to be passed into the HomeModal in order to grab user feedback
 */
class FeedbackModal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fresh: true,
      text: ""
    };
  }
  /**
   * Send the contents of the Feedback modal to the feedback system
   */
  submit(data) {
    return this.context.getTokens().then(tokens => {
      if (tokens.username && tokens.username !== "guest") {
        let apiService = new ApiService(
          "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com",
          tokens
        );
        var myInit = {
          body: {
            data: data
          }
        };
        return apiService
          .post("/prod/feedback", myInit.body)
          .then(response => {
            return response;
          })
          .catch(error => {
            throw error;
          });
      }
    });
  }
  closePressHandler = () => {
    this.context.setModalVisible(false);
  };
  /**
   * Only render the submit button if the user has not already sent the data.
   */
  renderSubmitButton() {
    if (this.state.fresh) {
      return (
        <View style={{ padding: 10 }}>
          <TouchableOpacity
            onPress={() => {
              this.refs.analytics.sendData({
                "action-type": "click",
                "target": "Submit Feedback",
                "starting-screen": "feedback",
                "starting-section": "feedback-modal", 
                "resulting-screen": "feedback", 
                "resulting-section": null,
                "action-metadata": {
                  "text":this.state.text,
                }
              });
              tracker.trackEvent("Click", "Feedback_Submit");
              if (
                this.state.text !== undefined &&
                this.state.text.trim() !== ""
              ) {
                this.submit(this.state.text).then(response => {
                  this.setState({ fresh: false });
                });
              }
              this.context.setModalVisible(false);
              this.context.SetToast("Feedback submitted. Thank you!");
            }}
            accessibilityRole="button"
          >
            <View
              style={{
                alignSelf: "center",
                alignItems: "center",
                justifyContent: "center",
                width: 200,
                height: 50,
                borderRadius: 30,
                borderWidth: 1,
                borderColor: "#D40546"
              }}
            >
              <Text style={{ color: "#D40546", fontSize: 15 }}>SUBMIT</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    } else {
      return null;
    }
  }
  render() {
    const used = (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 25, color: "#D40546" }}>Thank you!</Text>
      </View>
    );
    const fresh = (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <View style={{ marginBottom: 5 }}>
          <TouchableOpacity onPress={this.closePressHandler}>
            <FontAwesome
              style={{ alignSelf: "flex-end", right: responsiveWidth(3) }}
              name="times"
              size={25}
              color="#464646"
            />
          </TouchableOpacity>
          <Text style={{ alignSelf: "center", color: "#D40546", fontSize: 14 }}>
            Let us know what you think!
          </Text>
        </View>
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
          // value={this.state.text}
          accessibilityLabel="Type feedback here"
        />
        <Text style={{ alignSelf: "center", color: "#D40546", fontSize: 14 }}>
          {this.state.text.length ? this.state.text.length : "0"} / 150
        </Text>
      </View>
    );
    let content = null;
    if (this.state.fresh) {
      content = fresh;
    } else {
      content = used;
    }
    return (
      <View
        style={{ flex: 1, alignItems: "stretch", justifyContent: "center" }}
      >
        <Analytics ref="analytics" />
        <View style={{ flex: 1, paddingTop: 20 }}>
          {content}
          {this.renderSubmitButton()}
        </View>
      </View>
    );
  }
}
FeedbackModal.contextTypes = {
  getTokens: PropTypes.func,
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func,
  setModalHeight: PropTypes.func,
  SetToast: PropTypes.func
};
