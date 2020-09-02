import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Linking,
  Image,
  Dimensions
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Icon from "react-native-vector-icons/MaterialIcons";
import ResponsiveImage from "react-native-responsive-image";
import PropTypes from "prop-types";
import HTMLView from "react-native-htmlview";
import moment from "moment";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { DefaultText as Text } from "../../presentational/DefaultText.js";
import Analytics from "../../functional/analytics";
import { HeaderQuick } from "../Header/HeaderQuick";
import { TagColorMap } from "../../../services";
import { checkSaved } from "../../../Queries";
import { CheckinCount } from "../Checkins/CheckinCount";
import LikeButton from "./buttons/LikeButton";
import CalendarButton from "./buttons/CalendarButton";
import { tracker } from "../google-analytics.js";
import { SettingsContext } from "../Settings/Settings";

/**
 * Individual Item view for News/Events from the Home screen
 */
class CFCardContent extends React.PureComponent {
  static navigationOptions = {
    header: null
  };

  state = {
    saved: "calendar-plus-o",
    savedIds: []
  };

  static defaultProps = {
    saveEvent: () => null,
    asurite: "",
    eventSchedule: [],
    likedItems: []
  };

  componentDidMount() {
    const { params } = this.props.navigation.state;
    var target_id = (isNaN(params.data.key)&&params.data.field_original_url)?
      params.data.field_original_url.replace("https://",""):params.data.key.toString();
    console.log("############### 22 target id:"+target_id);
    this.refs.analytics.sendData({
      "action-type": "view",
      "target": this.props.navigation.state.params.target?this.props.navigation.state.params.target:"Details Card",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null,
      "resulting-screen": "core-feature-card", 
      "resulting-section": params.feed_type?params.feed_type:null,
      "action-metadata": {
        "target-id": target_id,
        "title": params.data.title
      },
      "target-id": target_id,
    });
  }

  /**
   * Render tags over image
   */
  imageTag() {
    const { params } = this.props.navigation.state;
    if (params.feed_type == "news") {
      const inStyle = {
        backgroundColor: TagColorMap[params.data.category],
        position: "absolute",
        bottom: 0,
        paddingVertical: 2,
        paddingHorizontal: 5,
        margin: 20
      };

      return (
        <View style={inStyle}>
          <Text
            style={{
              backgroundColor: "rgba(0,0,0,0)",
              color: "white",
              fontWeight: "bold",
              fontFamily: "Roboto"
            }}
          >
            {params.data.category}
          </Text>
        </View>
      );
    } else {
      const inStyle = {
        backgroundColor: "#931E42",
        position: "absolute",
        color: "white",
        fontWeight: "bold",
        fontFamily: "Roboto",
        bottom: 0,
        paddingVertical: 2,
        paddingHorizontal: 5,
        margin: 20
      };

      return <Text style={inStyle}>{params.start_date}</Text>;
    }
  }

  shareMessage(title, message, url) {
    Share.share(
      {
        title,
        subject: title,
        message: `${title}: ${url}`
      },
      {
        dialogTitle: "Sharing News from ASU Mobile App"
      }
    )
      .then
      // console.log("Shared")
      ()
      .catch(err => console.log(err));
    const { params } = this.props.navigation.state;
    var target_id = (isNaN(params.data.key)&&params.data.field_original_url)?
      params.data.field_original_url.replace("https://",""):params.data.key.toString();
    console.log("############### 3 target id:"+target_id);
    this.refs.analytics.sendData({
      "action-type": "click",
      "target": "Share Message",
      "starting-screen": "core-feature-card",
      "starting-section": null,
      "resulting-screen": "core-feature-card", 
      "resulting-section": "share",
      "action-metadata": {
        "target-id": target_id,
        "title": title
      },
      "target-id": target_id,
    });
    let myType = `, type: ${this.props.navigation.state.params.feed_type}`;
    if (myType === `, type: ${undefined}`) {
      myType = "";
    }
    tracker.trackEvent(
      "Click",
      `CFCard_shareMessage - key: ${this.props.navigation.state.params.key}${myType}`
    );
  }

  saveEventNewsFlat(item, action, path) {
    const data = { ...this.props.navigation.state.params.data };

    let flatData = {};
    let process = false;
    let active;

    if (action == "save") {
      if (!checkSaved(data.key, this.props.eventSchedule)) {
        process = true;
      } else {
        process = false;
      }
      active = 1;
    } else {
      process = true;
      active = 0;
    }

    if (process) {
      flatData = {
        feed_type: data.feed_type,
        id: path,
        active
      };

      if (data.feed_type == "event") {
        const { savedIds } = this.state;
        let saved;
        let toastVal;

        flatData.starttime = data.startTime ? data.startTime : data.starttime;
        flatData.endtime = data.endTime ? data.endTime : data.endtime;
        flatData.location = data.location;
        flatData.description = data.description;
        flatData.map_title =
          data.map_title && data.map_title[0] ? data.map_title[0] : null;
        flatData.map_type = data.map_type;
        flatData.map_lat =
          data.map_coords && data.map_coords.lat ? data.map_coords.lat : null;
        flatData.map_lng =
          data.map_coords && data.map_coords.lng ? data.map_coords.lng : null;
        flatData.key = data.key;
        flatData.nid = data.nid;
        flatData.picture = data.picture;
        flatData.teaser = data.teaser;
        flatData.title = data.title;
        flatData.url = data.url;

        if (action == "save") {
          saved = "calendar-check-o";
          toastVal = "Event added to Calendar";
        } else {
          saved = "calendar-plus-o";
          toastVal = "Event removed from Calendar";
        }

        try {
          this.props.SetToast(toastVal);
          this.setState({
            saved
            // savedIds: savedIds
          });

          this.props.saveEvent(flatData);
        } catch (e) {
          console.log(e);
        }
      }
    }
    const { params } = this.props.navigation.state;
    var target_id = (isNaN(params.data.key)&&params.data.field_original_url)?
      params.data.field_original_url.replace("https://",""):params.data.key.toString();
    console.log("############### 4 target id:"+target_id);
    this.refs.analytics.sendData({
      "action-type": "click",
      "target": action+" Calender",
      "starting-screen": "core-feature-card",
      "starting-section": null,
      "resulting-screen": "core-feature-card", 
      "resulting-section": params.feed_type?params.feed_type:null,
      "action-metadata": {
        "target-id": target_id,
        "title": params.data.title
      },
      "target-id": target_id,
    });
    let myType = `, type: ${this.props.navigation.state.params.feed_type}`;
    if (myType === `, type: ${undefined}`) {
      myType = "";
    }
    tracker.trackEvent(
      "Click",
      `CFCard_${action}_Item - key: ${path}${myType}`
    );
  }

  renderLocation(location) {
    if (location.indexOf("http") !== -1) {
      return (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(location);
            }}
          >
            <Text style={{ fontWeight: "400", fontFamily: 'Roboto', color: "#990033" }}>Online</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return <Text style={{ fontWeight: "400", fontFamily: 'Roboto' }}>{location}</Text>;
    }
  }

  renderClubRow() {
    const { params } = this.props.navigation.state;
    if (params.data.eventType === "orgsync") {
      return (
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(
              params.data.organization_website_url
                ? params.data.organization_website_url
                : "https://www.asu.edu"
            );
          }}
        >
          <View style={styles.clubRow}>
            <FontAwesome
              name="users"
              size={14}
              color="#990033"
              style={{ marginRight: 10 }}
            />
            <Text style={{ color: "#990033" }}>
              {params.data.organization_name}
            </Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  }

  render() {
    const { params } = this.props.navigation.state;
    let button;
    let scheduleaction;
    let faButton;

    if (
      checkSaved(
        this.props.navigation.state.params.data.key,
        this.props.eventSchedule
      )
    ) {
      scheduleaction = "remove";
      faButton = "calendar-check-o";
      faButtonAccessibility = "Remove from calendar";
    } else {
      scheduleaction = "save";
      faButton = "calendar-plus-o";
      faButtonAccessibility = "Add to Calendar";
    }

    // console.log("this is in CFCard ", params.data, "authd ", this.state.authd);
    if (
      params.data.feed_type == "event" ||
      params.data.feed_type == "events" ||
      params.data.feed_type == "event" ||
      params.data.type == "events"
    ) {
      if (this.state.authd) {
        button = (
          <TouchableOpacity
            onPress={() =>
              this.saveEventNewsFlat(
                "saveEvent",
                scheduleaction,
                params.data.key,
                params.data.title,
                params.data.description,
                params.data.url
              )
            }
            style={{ flex: 0, marginRight: 20 }}
          >
            <FontAwesome
              name={faButton}
              size={25}
              color="#464646"
              accessibilityLabel={faButtonAccessibility}
              accessibilityRole="button"
            />
          </TouchableOpacity>
        );
      }
    }

    const rightNav = (
      <View
        style={{ flexDirection: "row", flex: 1, justifyContent: "flex-end" }}
      >
        <TouchableOpacity
          onPress={() =>
            this.shareMessage(
              params.data.title,
              params.data.description,
              params.data.url
            )
          }
          style={{ flex: 0, marginRight: 20 }}
        >
          <Icon
            name="share"
            size={25}
            color="#464646"
            accessibilityLabel="Share"
            accessibilityRole="button"
          />
        </TouchableOpacity>
        <CalendarButton 
          data={params.data} 
          navigation={this.props.navigation}
          previousScreen="core-feature-card"
          previousSection={null}/>
        <LikeButton 
          data={params.data} 
          navigation={this.props.navigation}
          previousScreen="core-feature-card"
          previousSection={null}/>
      </View>
    );

    let inStyle = {
      backgroundColor: "#931E42",
      position: "absolute",
      color: "white",
      fontWeight: "bold",
      fontFamily: "Roboto",
      bottom: 0,
      paddingVertical: 2,
      paddingHorizontal: 5,
      margin: 20
    };

    if (params.data.feed_type == "news") {
      inStyle = {
        backgroundColor: TagColorMap[params.data.category],
        position: "absolute",
        bottom: 0,
        color: "white",
        fontWeight: "bold",
        paddingVertical: 2,
        paddingHorizontal: 5,
        margin: 20,
        fontFamily: "Roboto"
      };
    }

    const DateLocTag = () => {
      if (params.data.feed_type == "news") {
        const isAFutureEvent = moment(params.data.rawDate).isAfter();
        const { interests } = params.data;
        let inter = null;
        if (interests != null) {
          inter = params.data.interests.split(",")[0];
        }
        const time = moment(params.data.rawDate).fromNow(true);
        let dateSection = (
          <Text style={{ color: "#A9A9A9" }}>
            | {isAFutureEvent ? "In" : ""} {time} {isAFutureEvent ? "" : "ago"}
          </Text>
        );
        if (time === "Invalid date") {
          dateSection = null;
        }
        console.log(
          "is a future event? ",
          moment(params.data.rawDate).isAfter()
        );
        return (
          <View
            style={{ alignSelf: "flex-start", padding: 3, marginBottom: 10 }}
          >
            <Text style={{ color: "#A9A9A9" }}>
              <Text style={{ color: "#990033" }}>{interests}</Text>{" "}
              {dateSection}
            </Text>
          </View>
        );
      } else {
        let stringDate = null;
        // if there is no specific time do not display 12:00 am display just date instead
        if (typeof params.data.startTime !== "undefined") {
          if (moment(params.data.startTime).format("h:mm a") == "12:00 am") {
            stringDate = null;
          } else if (typeof params.data.endTime !== "undefined") {
            if (moment(params.data.endTime).format("h:mm a") === "") {
              stringDate = moment(params.data.startTime).format("h:mm a");
            } else {
              stringDate = `${moment(params.data.startTime).format(
                "h:mm a"
              )} - ${moment(params.data.endTime).format("h:mm a")}`;
            }
          } else {
            stringDate = moment(params.data.startTime).format("h:mm a");
          }
        }
        let comma = ",";
        if (!stringDate) {
          comma = "";
        }
        // let date = params.data.date_time ? params.data.date_time : params.data.newsDate;
        const date = params.data.startTime || params.data.newsDate;
        const stringDateText = (
          <Text>
            {moment(date).format("dddd, MMMM Do")}
            {comma} {stringDate}
          </Text>
        );

        return (
          <View style={{ marginBottom: 10 }}>
            {stringDateText}
            {params.data.location &&
            params.data.location !=
              "No location has been entered for this event." ? (
              <Text>{this.renderLocation(params.data.location)}</Text>
            ) : null}
          </View>
        );
      }
    };

    const checkinSection = this.state.user === "guest" ? null : params.header;
    const imageStyle = params.imageHeight
      ? { marginBottom: 10, flex: 1, height: params.imageHeight }
      : { marginBottom: 10 };
    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        <HeaderQuick navigation={this.props.navigation} right={rightNav} />
        <ScrollView style={styles.eventDetailsContainer}>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <ResponsiveImage
              defaultSource={require("../assets/placeholder.png")}
              source={{
                uri: urldecode(params.data.picture).replace(
                  "asuevents.asu.edu",
                  "d2wi8c5c7yjfp0.cloudfront.net"
                )
              }}
              initWidth="415"
              initHeight={responsiveHeight(45)}
              style={imageStyle}
              resizeMode="contain"
            />
          </View>
          <View
            style={{
              flex: 3,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: responsiveWidth(5)
            }}
          >
            <Text style={[styles.itemTitle, { fontSize: 25 }]}>
              {urldecode(params.data.title)}
            </Text>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "flex-end"
              }}
            >
              <CheckinCount
                data={params.data}
                navigation={this.props.navigation}
                event_id={params.data.key}
                previousSection={null}
                previousScreen={"core-features-card"}
              />
            </View>
          </View>
          {this.renderClubRow()}
          <View style={{ marginLeft: responsiveWidth(5) }}>
            <DateLocTag />
          </View>
          {params.location}
          {checkinSection}
          <View style={styles.htmlContainer}>
            <HTMLView
              value={urldecode(params.data.description)}
              stylesheet={htmlStyles}
              // add a line break between <p> tags like this:
              paragraphBreak={`
              `}
            />
          </View>
          {params.footer}
        </ScrollView>
      </View>
    );
  }
}

export class CFCard extends React.PureComponent {
  componentDidMount() {
    console.log("CFCard props plz: ", this.props);
  }

  render() {
    // return null;
    return (
      <SettingsContext.Consumer>
        {settings => (
          <CFCardContent
            {...this.props}
            asurite={settings.user}
            SetToast={settings.SetToast}
          />
        )}
      </SettingsContext.Consumer>
    );
  }
}

const styles = StyleSheet.create({
  eventDetailsContainer: {
    flex: 1,
    backgroundColor: "white"
  },
  sectionHeader: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: "800",
    fontFamily: 'Roboto',
  },
  item: {
    marginLeft: 60,
    margin: 5,
    padding: 5,
    paddingTop: 5,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.05)"
  },
  itemTitle: {
    fontWeight: "800",
    fontFamily: 'Roboto',
    fontSize: 20,
    color: "black"
  },
  itemDate: {
    paddingTop: 5
  },
  currentPage: {
    alignItems: "center",
    justifyContent: "center"
  },
  eventDescription: {
    padding: 10
  },
  eventPager: {
    height: 40,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.05)"
  },
  htmlContainer: {
    paddingLeft: 15,
    paddingRight: 15
  },
  clubRow: {
    flexDirection: "row",
    marginBottom: responsiveHeight(0.5),
    marginLeft: 15
  }
});

const htmlStyles = StyleSheet.create({
  p: {
    color: "#575757",
    fontFamily: "Roboto",
    lineHeight: responsiveFontSize(1.9),
    fontSize: responsiveFontSize(1.7),
    margin: 0,
    padding: 0
  }
});

function urldecode(url) {
  try {
    return decodeURIComponent(url.replace(/\+/g, " ").replace(/\r?\n|\r/g, ""));
  } catch (e) {
    // console.log("BAD URL", url, e)
    return url;
  }
}
