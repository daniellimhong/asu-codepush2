import React from "react";
import {
  View,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import FontAwesome from "react-native-vector-icons/FontAwesome";
// import { StaticMap } from "../../functional/maps/staticMap";
import Analytics from "./../../functional/analytics";
import { tracker } from "../google-analytics.js";
import moment from "moment";
import PropTypes from "prop-types";
import { deleteBrackets, formatEvent, createCardId } from "./utility";

const NO_LOCATION_ENTERED = "No location has been entered for this event.";

/**
 * Live Card to pull highlighted events from
 * the app's backend RDS instance
 *
 * ToDo - basic placeholders. Hit the RDS instance
 */
export class LCEvents extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      image: "",
      headline: null,
      savedEvents: [],
    };
  }

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "view",
      "starting-screen": "Home",
      "starting-section": "live-cards",
      target: "Event Card",
      "resulting-screen": "live-cards",
      "resulting-section": null,
      "target-id": this.props.data.articleData.nid,
      "action-metadata": {
        "target-id": this.props.data.articleData.nid,
        title: this.props.data.articleData.title,
      },
    });
    tracker.trackEvent("View", "LCEvents");
    this.storeRemoteEvents(this.props.data);
  }

  componentDidUpdate() {
    this.storeRemoteEvents(this.props.data);
  }

  storeRemoteEvents(response) {
    if (
      (response.articleData && !this.state.data) ||
      (response.articleData &&
        response.articleData.title &&
        this.state.data &&
        this.state.data.title &&
        response.articleData.title !== this.state.data.title)
    ) {
      response.articleData.type = "events";
      this.setState({
        data: response.articleData,
        image: response.articleData.image_url[0].replace(
          "asuevents.asu.edu",
          "d2wi8c5c7yjfp0.cloudfront.net"
        ),
        headline: deleteBrackets(response.articleData.title),
        date: response.articleData.date_time || undefined,
        location:
          response.articleData.locations &&
          response.articleData.locations.length
            ? response.articleData.locations[0]
            : "",
        savedEvents: null,
      });
    }
  }

  buttonInsert(event) {
    return (
      <View style={{ flexDirection: "row", padding: responsiveWidth(3) }}>
        <View
          style={{
            flex: 1,
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(
                event.alias[0] ? event.alias[0] : "https://www.asu.edu"
              );
            }}
            accessibilityRole="button"
          >
            <View
              style={{
                justifyContent: "center",
                backgroundColor: "#D40546",
                height: responsiveHeight(7),
                width: responsiveWidth(35),
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: responsiveFontSize(2),
                  textAlign: "center",
                  color: "white",
                }}
              >
                MORE INFO
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{ flex: 1, alignItems: "flex-end", justifyContent: "center" }}
        >
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate("Maps", {
                locationName: formatEvent(event).location,
                item: { data: { data: event } },
                previousScreen: "live-cards-event",
                previousSection: null,
                target: "DIRECTIONS",
                data: formatEvent(event).location,
              });
            }}
          >
            <View
              style={{
                justifyContent: "center",
                borderColor: "#D40546",
                borderWidth: 1,
                height: responsiveHeight(7),
                width: responsiveWidth(35),
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: responsiveFontSize(2),
                  textAlign: "center",
                  color: "#D40546",
                }}
              >
                DIRECTIONS
              </Text>
            </View>
            {/* <Text style={{textAlign:"center"}}>DIRECTIONS</Text> */}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  locationInsert(event) {
    return null;
  }

  pressHandler = () => {
    const { navigate } = this.props.navigation;
    let locationInsert = this.locationInsert(this.state.data);
    let buttonInsert = this.buttonInsert(this.state.data);

    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "Home",
      "starting-section": "live-cards",
      target: "Event Card",
      "resulting-screen": "core-feature-card",
      "resulting-section": null,
      "target-id": this.props.data.articleData.nid,
      "action-metadata": {
        "target-id": this.props.data.articleData.nid,
        title: this.props.data.articleData.title,
      },
    });
    tracker.trackEvent("Click", `LiveCard_Events - item: ${this.state.data}`);
    // console.log(
    //   "this is data passed into CFCard from LCNews ",
    //   formatEvent(this.state.data)
    // );
    navigate("Card", {
      data: formatEvent(this.state.data),
      navigation: this.props.navigation,
      type: "events",
      saved: this.state.savedEvents,
      location: locationInsert,
      footer: buttonInsert,
      previousScreen: "Home",
      previousSection: "live-cards-event",
      target: "Event Card",
    });
  };

  getEventTime = () => {
    if (!this.state.data.start_date[0] || !this.state.data.end_date[0]) {
      console.log("LCEvent doesn't have a start_date and/or end_date");
      return null;
    } else {
      let startTime = moment(
        this.state.data.start_date[0],
        "MMM D YYYY - hh:mma"
      ).format("hh:mma");
      let endTime = moment(
        this.state.data.end_date[0],
        "MMM D YYYY - hh:mma"
      ).format("hh:mma");

      return `${startTime} - ${endTime}`;
    }
  };

  truncateLocation = (location) => {
    if (!location) {
      return null;
    } else if (location.length > 32) {
      return location.slice(0, 32) + "...";
    } else {
      return location;
    }
  };

  render() {
    let eventLocation =
      this.state.location === NO_LOCATION_ENTERED ? null : (
        <Text allowFontScaling={false} style={styles.locationText}>
          {this.truncateLocation(this.state.location)}
        </Text>
      );

    if (this.state.headline) {
      return (
        <View style={{ flex: 1 }}>
          <Analytics ref="analytics" />
          <TouchableWithoutFeedback onPress={this.pressHandler}>
            <View key={"LiveCardNews"} style={styles.container}>
              <ImageBackground
                style={[styles.imageBox]}
                source={{ uri: this.state.image }}
                blurRadius={9}
                resizeMode="stretch"
              >
                <Image
                  style={styles.articleImage}
                  source={{ uri: this.state.image }}
                  resizeMode="contain"
                />
              </ImageBackground>
              <View style={styles.bottomTextBox}>
                <View style={styles.dateCategoryBox}>
                  <View style={styles.categoryBox}>
                    <Text allowFontScaling={false} style={styles.categoryText}>
                      FEATURED EVENT
                    </Text>
                  </View>
                  <View style={styles.spacer} />
                </View>
                <View style={styles.headlineBox}>
                  <View
                    style={{
                      flexDirection: "column",
                      flex: 4,
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        allowFontScaling={false}
                        adjustsfontsizetofit
                        numberOfLines={1}
                        style={styles.headlineText}
                      >
                        {this.state.headline}
                      </Text>
                      <Text
                        allowFontScaling={false}
                        adjustsfontsizetofit
                        numberOfLines={1}
                        style={styles.timeOfEvent}
                      >
                        {this.getEventTime()}
                      </Text>
                    </View>

                    <View style={styles.locationBox}>{eventLocation}</View>
                  </View>

                  <View style={styles.date}>
                    <Text allowFontScaling={false} style={styles.dateTextTop}>
                      {moment(this.state.date).format("D")}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.dateTextBottom}
                    >
                      {moment(this.state.date)
                        .format("MMM")
                        .toUpperCase()}
                    </Text>
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
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <Analytics ref="analytics" />
          <ActivityIndicator size="large" color="maroon" />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBox: {
    flex: 2,
  },
  articleImage: {
    width: "100%",
    height: "100%",
  },
  bottomTextBox: {
    flex: 1,
    paddingHorizontal: responsiveWidth(6),
  },
  date: {
    flex: 0.75,
    flexDirection: "column",
  },
  dateTextTop: {
    fontWeight: "300",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(4.5),
    color: "#9A9A9A",
    alignSelf: "center",
  },
  dateTextBottom: {
    fontWeight: "700",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(2.25),
    color: "#9A9A9A",
    alignSelf: "center",
  },
  dateCategoryBox: {
    flex: 0.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  categoryBox: {
    alignItems: "center",
    padding: responsiveHeight(1),
    backgroundColor: "#9A1C33",
  },
  categoryText: {
    fontSize: responsiveFontSize(1.5),
    color: "white",
    fontFamily: "Roboto",
    fontWeight: "700",
    fontFamily: "Roboto",
  },
  locationBox: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    alignSelf: "flex-start",
  },
  locationText: {
    fontSize: responsiveFontSize(1.5),
    color: "black",
  },
  headlineBox: {
    flex: 1,
    flexDirection: "row",
  },
  headlineText: {
    flex: 3,
    fontSize: responsiveFontSize(1.75),
    fontWeight: "700",
    fontFamily: "Roboto",
    color: "black",
  },
  timeOfEvent: {
    flex: 3,
    fontSize: responsiveFontSize(1.5),
    color: "black",
  },
  spacer: {
    flex: 1,
  },
});
