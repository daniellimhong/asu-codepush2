import React from "react";
import { View, ImageBackground, Text, TouchableOpacity } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { Api } from "../../../services";
import Analytics from "./../../functional/analytics";
import { tracker } from "../google-analytics.js";
import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/SimpleLineIcons";
import { Images } from "../Images";
import { compose } from "react-apollo";
import { getUserInformation } from "../../../Queries/Utility";

class LCProfileX extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      student_status: false,
      button1Title: "MY ASU",
      button2Title: "BLACKBOARD",
      button3Title: "SEEK COUNSELING",
      button4Title: "CAREER SERVICES",
      button1Url: "https://my.asu.edu",
      button2Url:
        "https://myasucourses.asu.edu/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_2_1",
      button3Url: "https://eoss.asu.edu/counseling",
      button4Url: "https://eoss.asu.edu/cs"
    };
  }
  static defaultProps = { user_info: {}, iSearchData: {} };

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "view",
      "starting-screen": "Home",
      "starting-section": "live-cards", 
      "target": "Profile Card",
      "resulting-screen": "live-cards",
      "resulting-section": "profile-card"
    });
    tracker.trackEvent("View", "LC_Profile");
    this.context
      .getTokens()
      .then(tokens => {
        if (tokens.username && tokens.username !== "guest") {
          let copyOfButtonArray = [...this.props.data.articleData.button];
          let sortedButtons = copyOfButtonArray.sort((a, b) => {
            return a.order - b.order;
          });
          this.setState({
            button1Title: sortedButtons[0].title.toUpperCase(),
            button2Title: sortedButtons[1].title.toUpperCase(),
            button3Title: sortedButtons[2].title.toUpperCase(),
            button4Title: sortedButtons[3].title.toUpperCase(),
            button1Url: sortedButtons[0].url,
            button2Url: sortedButtons[1].url,
            button3Url: sortedButtons[2].url,
            button4Url: sortedButtons[3].url
          });

          let apiService = new Api(
            "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
            tokens
          );

          apiService
            .post("/socialstats", {})
            .then(response => {
              this.setState({
                likesCount: response.likesCount,
                checkinsCount:
                  response.socialCheckinsCount + response.academicCheckinsCount,
                friendsCount: response.friendsCount
              });
            })
            .catch(error => {
              throw error;
            });
        }
      })
      .catch(err => console.log(err));
  }

  navigatetoExternalSite(url, title) {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "Home",
      "starting-section": "live-cards", 
      "target": title,
      "resulting-screen": "in-app-browser",
      "resulting-section": title,
      "action-metadata":{
        "url":url
      }
    });
    this.props.navigation.navigate("InAppLink", { url: url, title: title });
  }

  render() {
    let { navigate } = this.props.navigation;
    let { iSearchData } = this.props;
    const {
      profileCardContainer,
      imageContainer,
      buttonContainer,
      buttonRow,
      maroonButton,
      maroonButtonText,
      greyButton,
      greyButtonText,
      backgroundImageContainer,
      profileContainer,
      statsContainer,
      affiliationContainer,
      title,
      department,
      middleStat,
      stat,
      statText
    } = styles;
    return (
      <View style={profileCardContainer}>
        <Analytics ref="analytics" />
        <View style={imageContainer}>
          <TouchableOpacity
            onPress={() => {
              this.refs.analytics.sendData({
                "action-type": "click",
                "starting-screen": "Home",
                "starting-section": "live-cards", 
                "target": "Profile",
                "resulting-screen": "my-profile",
                "resulting-section": null
              });
              navigate("MyProfile",{
                previousScreen: "Home",
                previousSection: "live-cards"
              });
            }}
          >
            <ImageBackground
              source={{
                uri:
                  "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/profile-background.jpg"
              }}
              style={backgroundImageContainer}
            >
              <View style={profileContainer}>
                <View>
                  <Images
                    style={{ height: 100, width: 100, borderRadius: 50 }}
                    defaultSource={require("../assets/placeholder.png")}
                    source={[
                      { uri: iSearchData.photoUrl },
                      require("../assets/placeholder.png")
                    ]}
                  />
                </View>
                <View style={affiliationContainer}>
                  <Text style={title}>
                    {iSearchData.student_status
                      ? iSearchData.majors[0]
                      : iSearchData.workingTitle}
                  </Text>
                  <Text style={department}>
                    {iSearchData.student_status
                      ? iSearchData.programs[0]
                      : iSearchData.primaryDeptId}
                  </Text>
                </View>
              </View>
              <View style={statsContainer}>
                <View style={stat}>
                  <Icon
                    name={"heart"}
                    color="white"
                    size={responsiveHeight(2.5)}
                  />
                  <Text style={statText}>{this.state.likesCount}</Text>
                </View>
                {iSearchData.student_status ? (
                  <View style={middleStat}>
                    <Icon
                      name={"people"}
                      color="white"
                      size={responsiveHeight(2.5)}
                    />
                    <Text style={statText}>{this.state.friendsCount}</Text>
                  </View>
                ) : null}
                <View style={stat}>
                  <Icon
                    name={"compass"}
                    color="white"
                    size={responsiveHeight(2.5)}
                  />
                  <Text style={statText}>{this.state.checkinsCount}</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>
        <View style={buttonContainer}>
          <View style={buttonRow}>
            <TouchableOpacity
              style={maroonButton}
              onPress={() => {
                this.navigatetoExternalSite(
                  this.state.button1Url,
                  this.state.button1Title
                );
              }}
            >
              <Text style={maroonButtonText}>{this.state.button1Title}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={maroonButton}
              onPress={() => {
                this.navigatetoExternalSite(
                  this.state.button2Url,
                  this.state.button2Title
                );
              }}
            >
              <Text style={maroonButtonText}>{this.state.button2Title}</Text>
            </TouchableOpacity>
          </View>
          <View style={buttonRow}>
            <TouchableOpacity
              style={greyButton}
              onPress={() => {
                this.navigatetoExternalSite(
                  this.state.button3Url,
                  this.state.button3Title
                );
              }}
            >
              <Text style={greyButtonText}>{this.state.button3Title}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={greyButton}
              onPress={() => {
                this.navigatetoExternalSite(
                  this.state.button4Url,
                  this.state.button4Title
                );
              }}
            >
              <Text style={greyButtonText}>{this.state.button4Title}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = {
  profileCardContainer: {
    flex: 1
  },
  imageContainer: {
    flex: 7
  },
  profileContainer: {
    flex: 8,
    justifyContent: "space-around",
    alignItems: "center"
  },
  statsContainer: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "space-around"
  },
  middleStat: {
    borderColor: "white",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: responsiveWidth(13),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "70%"
  },
  stat: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  statText: {
    color: "white",
    marginLeft: 5,
    fontSize: responsiveHeight(2.5)
  },
  affiliationContainer: {
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: {
    color: "white",
    fontSize: responsiveHeight(2.5),
    marginBottom: 10
  },
  department: {
    color: "white",
    fontSize: responsiveHeight(2.1)
  },
  backgroundImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0)"
  },
  buttonContainer: {
    flex: 3,
    justifyContent: "space-around",
    paddingTop: 15,
    paddingBottom: 15
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 13
  },
  maroonButton: {
    backgroundColor: "#990033",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: responsiveHeight(2.2),
    justifyContent: "center",
    alignItems: "center",
    width: responsiveWidth(40)
  },
  maroonButtonText: {
    fontSize: responsiveFontSize(1.43),
    color: "white",
    textAlign: "center",
    fontWeight: "900",
    fontFamily: 'Roboto',
  },
  greyButton: {
    backgroundColor: "white",
    borderColor: "#D5D5D5",
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: responsiveHeight(2.0),
    justifyContent: "center",
    alignItems: "center",
    width: responsiveWidth(40)
  },
  greyButtonText: {
    fontSize: responsiveFontSize(1.43),
    color: "#9C9C9C",
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "Roboto"
  }
};

LCProfileX.contextTypes = {
  getTokens: PropTypes.func
};

export const LCProfile = compose(getUserInformation)(LCProfileX);