import React, { PureComponent } from "react";
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Image
  // Linking
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";

import { commonStyles } from "./Helpers/CommonStyles";
import { Auth } from "../../../services";
import Analytics from "./../analytics";

const refreshUrl =
  "https://mcuwjen7gc.execute-api.us-west-2.amazonaws.com/prod/orefresh";
const libWebsiteUrl = "https://lib.asu.edu";
const headerMain = require("../assets/library/header-main.png");
const locationsIcon = require("../assets/library/icon-locations.png");
const studyRoomsIcon = require("../assets/library/icon-study-rooms.png");
const MyAccountIcon = require("../assets/library/icon-my-account.png");

export default class Library extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: null
    };
  }

  componentDidMount = () => {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null,
      "target": "LIBRARY",
      "resulting-screen": "library", 
      "resulting-section": null
    });
    Auth()
      .getSession("edu.asu.asumobileapp", refreshUrl)
      .then(tokens => {
        this.setState({
          username: tokens.username
        });
      });
  };

  openUrl = () => {
    const { navigation } = this.props;
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "library",
      "starting-section": null, 
      "target": "Library Website",
      "resulting-screen": "in-app-browser", 
      "resulting-section": "asu-Library",
    });
    navigation.navigate("InAppLink", {
      url: libWebsiteUrl,
      title: "ASU Library"
    });
    // Linking.canOpenURL(libWebsiteUrl).then(supported => {
    //   if (supported) {
    //     Linking.openURL(libWebsiteUrl);
    //   } else {
    //     console.log("Don't know how to open URL");
    //   }
    // });
  };

  render = () => {
    const { navigation } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        <ImageBackground
          style={[styles.imageBgContainer, { justifyContent: "flex-end" }]}
          source={headerMain}
        >
          <View style={styles.header}>
            <Text style={styles.headerText} numberOfLines={2}>
              Welcome to the ASU Library
            </Text>
          </View>
          <TouchableOpacity
            style={styles.libWebsiteButton}
            onPress={this.openUrl}
          >
            <Text style={styles.libWebsiteText}>Library Website</Text>
            <MaterialIcon name="launch" style={styles.libWebsiteIcon} />
          </TouchableOpacity>
        </ImageBackground>

        <View style={styles.body}>
          <TouchableOpacity
            style={[styles.bodyTop, commonStyles.shadowBox]}
            onPress={() => {
              this.refs.analytics.sendData({
                "action-type": "click",
                "starting-screen": "library",
                "starting-section": null,
                "target": "Library locations",
                "resulting-screen": "library-locations", 
                "resulting-section": null,
              });
              navigation.navigate("Locations")
            }
          }
          >
            <View style={{ alignItems: "center" }}>
              <Image
                style={styles.icon}
                source={locationsIcon}
                resizeMode="contain"
              />
              <Text style={styles.titleText}>Library Locations</Text>
              <Text style={styles.subText}>
                Find hours, addresses, contact information, popular times,
                services, and help options available at each ASU campus.
              </Text>
            </View>
          </TouchableOpacity>

          {this.getOptions()}
        </View>
      </View>
    );
  };

  getOptions = () => {
    const { username } = this.state;
    const { navigation } = this.props;
    if (username === null) {
      return (
        <View style={[styles.loadingBody, { marginTop: responsiveHeight(5) }]}>
          <ActivityIndicator
            size="large"
            color="maroon"
            style={{ alignSelf: "center" }}
          />
        </View>
      );
    } else if (username === "guest") {
      return (
        <View style={styles.bodyBottom}>
          <TouchableOpacity
            style={[styles.bodyTop, commonStyles.shadowBox]}
            onPress={() =>
              {
                this.refs.analytics.sendData({
                  "action-type": "click",
                  "starting-screen": "library",
                  "starting-section": null, 
                  "target": "Study Rooms",
                  "resulting-screen": "in-app-browser", 
                  "resulting-section": "study-rooms",
                });
                navigation.navigate("InAppLink", {
                  url: "https://lib.asu.edu/studyzones",
                  title: "Study Rooms"
                })
              }
            }
          >
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Image
                style={styles.icon}
                source={studyRoomsIcon}
                resizeMode="contain"
              />
              <Text style={styles.titleText}>Study Rooms</Text>
              <Text style={styles.subText}>
                Learn how to reserve a study room at your favorite library.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.bodyBottom}>
          <TouchableOpacity
            style={[styles.bodyBottomLeft, commonStyles.shadowBox]}
            onPress={() => {
              this.refs.analytics.sendData({
                "action-type": "click",
                "starting-screen": "library",
                "starting-section": null, 
                "target": "Study Rooms",
                "resulting-screen": "in-app-browser", 
                "resulting-section": "study-rooms",
              });
              navigation.navigate("StudyRooms")
          }}
          >
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Image
                style={styles.icon}
                source={studyRoomsIcon}
                resizeMode="contain"
              />
              <Text style={styles.titleText}>Study Rooms</Text>
              <Text style={styles.subText}>
                Learn how to reserve a study room at your favorite library.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bodyBottomRight, commonStyles.shadowBox]}
            onPress={() => {
              this.refs.analytics.sendData({
                "action-type": "click",
                "starting-screen": "library",
                "starting-section": null, 
                "target": "My Account",
                "resulting-screen": "my-account", 
                "resulting-section": null,
              });
              navigation.navigate("MyAccount")
            }
          }
          >
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Image
                style={styles.icon}
                source={MyAccountIcon}
                resizeMode="contain"
                overFlow="hidden"
              />
              <Text style={styles.titleText}>My Account</Text>
              <Text style={styles.subText}>
                View your checked out items and requests, and learn about fines.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  };
}

const styles = StyleSheet.create({
  body: {
    flex: 2,
    backgroundColor: "#E2E2E2"
  },
  header: {
    position: "absolute",
    margin: responsiveWidth(2.5),
    bottom: responsiveWidth(15),
    left: responsiveWidth(2.5)
  },
  headerText: {
    flex: 1,
    color: "white",
    fontSize: responsiveFontSize(3.3),
    fontWeight: "700",
    fontFamily: "Roboto",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  imageBgContainer: {
    flex: 1,
    backgroundColor: "grey"
  },
  bodyTop: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    margin: responsiveWidth(2.5),
    padding: responsiveWidth(2.5),
    backgroundColor: "#FFFFFF"
  },
  bodyBottom: {
    flex: 1,
    flexDirection: "row"
  },
  bodyBottomLeft: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: responsiveWidth(2.5),
    margin: responsiveWidth(2.5)
  },
  bodyBottomRight: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: responsiveWidth(2.5),
    margin: responsiveWidth(2.5)
  },
  titleText: {
    fontSize: responsiveFontSize(1.8),
    marginBottom: responsiveHeight(1),
    fontWeight: "600",
    fontFamily: "Roboto"
  },
  subText: {
    color: "#8B8B8B",
    fontSize: responsiveFontSize(1.3),
    lineHeight: responsiveFontSize(1.5),
    textAlign: "center"
  },
  icon: {
    height: responsiveWidth(22),
    width: responsiveWidth(22),
    borderRadius: responsiveWidth(3),
    alignItems: "center"
  },
  libWebsiteButton: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    padding: responsiveWidth(2.5),
    marginLeft: responsiveWidth(5),
    marginBottom: responsiveWidth(5),
    backgroundColor: "maroon",
    borderRadius: 4
  },
  libWebsiteText: {
    color: "white",
    fontSize: responsiveFontSize(1.75),
    fontWeight: "500"
  },
  libWebsiteIcon: {
    color: "white",
    fontSize: responsiveFontSize(1.75),
    marginLeft: responsiveWidth(2.5)
  }
});
