import React from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Image,
  Dimensions
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import ProgressCircle from "../../functional/milestones/ProgressCircle";
import { TagColorMap } from "../../../services";
import Analytics from "./../../functional/analytics";
import { tracker } from "../google-analytics.js";
import moment from "moment";
import PropTypes from "prop-types";
import { formatNews, isUrl, createCardId } from "./utility";

const HEIGHT_OF_IMAGE = responsiveWidth(33.5);
const COLOR_OF_MILESTONES_BLUE = "rgb(47, 153, 222)";
const COLOR_OF_MILESTONES_YELLOW = "rgb(238, 200, 2)";
const COLOR_OF_MILESTONES_GREEN = "rgb(123, 199, 71)";
const fillerObj = {
  "5264f377-bff1-4d06-ade7-0ff60595d007": {
    milestoneId: "5264f377-bff1-4d06-ade7-0ff60595d007",
    value: "SEEN",
    statusByOutcome: { "47ce73aa-ff2f-4e4c-86e5-ce890a5ac142": "SEEN" }
  }
};

// Milestones Live Card
export class LCMilestones extends React.PureComponent {
  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "view",
      "starting-screen": "Home",
      "starting-section": "live-cards", 
      "target": "Milestone Card",
      "resulting-screen": "live-cards",
      "resulting-section": "milestone-card",
    });
    tracker.trackEvent("View", "LCMilestones");
  }

  getMilestonesCompleted = () => {
    let milestonesStatus = this.props.milestonesStatusData
      ? this.props.milestonesStatusData.statusByMilestone
      : fillerObj;
    let arrayOfMilestones = Object.keys(milestonesStatus).map(
      key => milestonesStatus[key]
    );
    let filteredMilestones = arrayOfMilestones.filter(v => {
      return v.value === "COMPLETED";
    });
    return filteredMilestones;
  };

  getCurrentMilestone = () => {
    let allMilestones = this.props.milestonesListData;
    let completedMilestones = this.getMilestonesCompleted(
      this.props.milestonesStatusData
        ? this.props.milestonesStatusData.statusByMilestone
        : fillerObj
    );
    for (let i = 0; i < completedMilestones.length; i++) {
      allMilestones = allMilestones.filter(v => {
        return v.id !== completedMilestones[i].milestoneId;
      });
    }
    if (allMilestones.length > 0) {
      return allMilestones[0].name;
    } else {
      return "Milestones Compled";
    }
  };

  pressHandler = (openFirst = false) => {
    const { navigate } = this.props.navigation;
    const linkUrl = this.props.data.articleData.field_original_url;
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "Home",
      "starting-section": "live-cards", 
      "target": "Milestones Card",
      "resulting-screen": "milestones",
      "resulting-section": null,
      "action-metadata":{
        "milestonesListData": this.props.milestonesListData,
      }
    });
    tracker.trackEvent("Click", `LiveCard_Milestones`);
    navigate("Milestones", {
      navigation: this.props.navigation,
      type: "Milestones",
      milestonesListData: this.props.milestonesListData,
      milestonesStatusData: this.props.milestonesStatusData
        ? this.props.milestonesStatusData
        : { statusByMilestone: fillerObj, completionPercentage: 0 },
      iSearchData: this.props.iSearchData,
      jwtToken: this.props.jwtToken,
      setMilestoneData: this.props.setMilestoneData,
      openFirst
    });
  };

  pressHandlerStartMilestones = () => {
    alert("Begun!");
  };

  render() {
    if (this.props.milestonesListData) {
      const completionPercentage = this.props.completionPercentage
        ? this.props.completionPercentage
        : 0;
      let circleColor;
      let textColor;
      let imageSource;
      if (completionPercentage < 34) {
        circleColor = COLOR_OF_MILESTONES_YELLOW;
        textColor = COLOR_OF_MILESTONES_YELLOW;
        imageSource = require("../assets/gold-header.png");
      } else if (completionPercentage >= 34 && completionPercentage < 67) {
        circleColor = COLOR_OF_MILESTONES_BLUE;
        textColor = COLOR_OF_MILESTONES_BLUE;
        imageSource = require("../assets/blue-header.png");
      } else {
        circleColor = COLOR_OF_MILESTONES_GREEN;
        textColor = COLOR_OF_MILESTONES_GREEN;
        imageSource = require("../assets/green-header.png");
      }
      return (
        <View style={{ flex: 1 }}>
          <Analytics ref="analytics" />
          <TouchableWithoutFeedback onPress={() => this.pressHandler()}>
            <View style={styles.container}>
              <Image
                style={{ width: "100%", height: HEIGHT_OF_IMAGE }}
                source={imageSource}
                resizeMode="cover"
              />
              <View style={styles.textContainer}>
                <View style={styles.imageTextBox}>
                  <Text style={styles.imageTextTop}>ARE YOU</Text>
                  <Text style={styles.imageTextBottom}>Career Ready?</Text>
                </View>
                <View style={styles.progressCircleBox}>
                  <ProgressCircle
                    percent={Math.round(completionPercentage)}
                    color={circleColor}
                    radius={responsiveHeight(10)}
                    borderWidth={responsiveHeight(2)}
                    shadowColor="#999"
                    bgColor="#fff"
                  />
                </View>
                <View style={styles.bottomTextContainer}>
                  <View style={styles.bottomTextBox}>
                    <Text style={styles.bottomText}>You're currently on</Text>
                    <Text style={[styles.bottomTextBold, { color: textColor }]}>
                      Career Milestone{" "}
                      {this.getMilestonesCompleted().length + 1}
                    </Text>
                    <Text style={styles.bottomText}>
                      {this.getCurrentMilestone()}
                    </Text>
                  </View>
                  <View style={{ flex: 0.5, justifyContent: "center" }}>
                    <TouchableOpacity
                      style={styles.bottomButton}
                      onPress={() => this.pressHandler(true)}
                    >
                      <Text style={styles.bottomButtonText}>KEEP GOING!</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      );
    } else if (
      !this.props.milestonesStatusData &&
      this.props.milestonesStartPage &&
      this.props.test
    ) {
      return (
        <View style={{ flex: 1 }}>
          <Analytics ref="analytics" />
          <TouchableWithoutFeedback onPress={() => this.pressHandler()}>
            <View style={styles.container}>
              <Image
                style={{ width: "100%", height: HEIGHT_OF_IMAGE }}
                source={require("../assets/gold-header.png")}
                resizeMode="cover"
              />
              <View style={styles.textContainer}>
                <View style={styles.imageTextBox}>
                  <Text style={styles.imageTextTop}>ARE YOU</Text>
                  <Text style={styles.imageTextBottom}>Career Ready?</Text>
                </View>
                <View style={styles.progressCircleBox}>
                  <ProgressCircle
                    percent={0}
                    color={COLOR_OF_MILESTONES_YELLOW}
                    radius={responsiveHeight(10)}
                    borderWidth={responsiveHeight(2)}
                    shadowColor="#999"
                    bgColor="#fff"
                  />
                </View>
                <View style={styles.bottomTextContainer}>
                  <View style={styles.bottomTextBox}>
                    <Text style={styles.bottomText}>
                      Are You Ready to Begin
                    </Text>
                    <Text
                      style={[
                        styles.bottomTextBold,
                        { color: COLOR_OF_MILESTONES_YELLOW }
                      ]}
                    >
                      Career Milestones?
                    </Text>
                  </View>
                  <View style={{ flex: 0.5, justifyContent: "center" }}>
                    <TouchableOpacity
                      style={styles.bottomButton}
                      onPress={() => this.pressHandlerStartMilestones()}
                    >
                      <Text style={styles.bottomButtonText}>Start!</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      );
    } else {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            height: "100%"
          }}
        >
          <Analytics ref="analytics" />
          <View>
            <ActivityIndicator
              style={{ alignSelf: "center", position: "absolute", bottom: 0 }}
              size="large"
              color="maroon"
            />
          </View>
        </View>
      );
    }
  }
}

LCMilestones.contextTypes = {
  getTokens: PropTypes.func
};

LCMilestones.propTypes = {
  card: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  jwtToken: PropTypes.string,
  milestonesStatusData: PropTypes.object,
  milestonesListData: PropTypes.array,
  completionPercentage: PropTypes.number,
  setMilestoneData: PropTypes.func,
  iSearchData: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  textContainer: {
    position: "absolute",
    height: "100%",
    width: "100%",
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start"
  },
  imageTextBox: {
    height: responsiveHeight(7),
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: responsiveHeight(2.2)
  },
  imageTextTop: {
    color: "white",
    fontSize: responsiveFontSize(1.7),
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  imageTextBottom: {
    color: "white",
    fontSize: responsiveFontSize(2.9),
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  progressCircleBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20
  },
  bottomTextContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 20
  },
  bottomTextBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    padding: responsiveHeight(2)
  },
  bottomText: {
    fontSize: responsiveFontSize(1.9),
    color: "black"
  },
  bottomTextBold: {
    color: COLOR_OF_MILESTONES_BLUE,
    fontWeight: "900",
    fontFamily: 'Roboto',
    fontSize: 19,
    fontSize: responsiveFontSize(2.15)
  },
  bottomButton: {
    backgroundColor: "grey",
    color: "white",
    borderRadius: 30,
    paddingHorizontal: responsiveWidth(7),
    paddingVertical: responsiveHeight(1)
  },
  bottomButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: responsiveFontSize(1.5),
    fontFamily: "Roboto"
  }
});
