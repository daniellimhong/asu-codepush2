import React from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Linking,
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  UIManager,
  TextInput
} from "react-native";
import {
  createMaterialTopTabNavigator,
  createAppContainer
} from "react-navigation";
import axios from "axios";
import { HeaderQuick } from "../../achievement/Header/HeaderQuick";
import { EventCheckinButton } from "../../achievement/Checkins/CheckinButton";
import { graphql } from "react-apollo";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth
} from "react-native-responsive-dimensions";
import moment from "moment";
import moment2 from "moment-timezone";
import _ from "lodash";
import Icon from "react-native-vector-icons/FontAwesome";
import { Api, User } from "../../../services";
import PropTypes from "prop-types";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Analytics from "../analytics";
import { tracker } from "../../achievement/google-analytics.js";
import { ErrorWrapper } from "../error/ErrorWrapper";
import { DefaultText as Text } from "../../presentational/DefaultText.js";

/**
 * The screen for viewing all of your friends or requests
 *
 */

const KEYS_TO_FILTERS = [
  "title",
  "description",
  "location",
  "organization_name"
];

class SunDevilSyncContent extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null,
      "target":"Clubs",
      "resulting-screen": "clubs",
      "resulting-section": null
    });
    this.setAccessibilityFocus();
  }

  componentWillUnmount() {
    clearTimeout(this.focusTimeout);
  }

  setAccessibilityFocus() {
    const FOCUS_ON_VIEW = 8;
    const nodeHandle = findNodeHandle(this.focusHeading);
    this.focusTimeout = setTimeout(() => {
      Platform.OS === "ios"
        ? AccessibilityInfo.setAccessibilityFocus(nodeHandle)
        : UIManager.sendAccessibilityEvent(nodeHandle, FOCUS_ON_VIEW);
    }, 300);
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        <View
          style={{
            height: 80,
            backgroundColor: "#25262a",
            paddingTop: 20,
            paddingBottom: 20,
            flexDirection: "row"
          }}
        >
          <View style={{ flex: 1, paddingLeft: 10, marginTop: 10 }}>
            <TouchableOpacity
              style={{ flex: 0, justifyContent: "center" }}
              onPress={() => {
                this.props.navigation.goBack();
              }}
              accessibilityLabel="back"
              accessibilityRole="button"
            >
              <Icon name="chevron-left" size={25} color="white" />
            </TouchableOpacity>
          </View>
          <View
            style={{ flex: 2, justifyContent: "center", alignItems: "center" }}
            ref={focusHeading => {
              this.focusHeading = focusHeading;
            }}
            accessible={true}
            accessibilityRole="header"
          >
            <Text
              style={{
                color: "white",
                fontSize: 24,
                textAlign: "center",
                textAlignVertical: "center"
              }}
            >
              Clubs
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              flex: 1,
              marginTop: 10
            }}
          >
            <View
              style={{ flex: 1, flexDirection: "column", alignItems: "center" }}
            />
          </View>
        </View>
        <SunDevilSyncNav screenProps={{ navigation: this.props.navigation }} />
      </View>
    );
  }
}

export class SunDevilSync extends React.Component {
  render() {
    return (
      <ErrorWrapper>
        <SunDevilSyncContent {...this.props} />
      </ErrorWrapper>
    );
  }
}

class MyClubEvents extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      eventList: [],
      dataLoaded: false
    };
  }

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "view",
      "starting-screen": "clubs",
      "starting-section": "my-club-events", 
      "target":"My Club Events",
      "resulting-screen": "clubs",
      "resulting-section": "my-club-events"
    });
    tracker.trackEvent("View", "My_Club_Events");
  }

  componentWillMount() {
    this.context.getTokens().then(tokens => {
      if (tokens.username && tokens.username !== "guest") {
        let payload = {
          operation: "getMyEvents"
        };
        let apiService = new Api(
          "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
          tokens
        );

        apiService
          .post("/orgsync", payload)
          .then(response => {
            var eventList = [];
            if (response) {
              for (var i = 0; i < response.length; i++) {
                var item = response[i];
                if (item.very_start_date > moment().format()) {
                  eventList.push(getFormattedItem(item));
                }
              }
              eventList = _.sortBy(eventList, "startTime");
              // console.log("this is eventList ", eventList);
              this.setState({ eventList: eventList, dataLoaded: true });
            } else {
              this.setState({ eventList: [], dataLoaded: true });
            }
          })
          .catch(error => {
            throw error;
          });
      }
    });
  }

  buttonInsert(event) {
    let CheckinConditionalButton = () => {
      if (event.feed_type == "event") {
        let mappedEvent = { ...event };
        mappedEvent.starttime = mappedEvent.startTime;
        mappedEvent.endtime = mappedEvent.endTime;
        mappedEvent.id = mappedEvent.key;
        return (
          <EventCheckinButton
            data={mappedEvent}
            style={"big"}
            activity_type={"social"}
            previousSection={"club-events"}
            previousScreen={"clubs"}
          />
        );
        // return null
      } else {
        return null;
      }
    };

    return (
      <View style={{ flexDirection: "row", padding: responsiveWidth(3) }}>
        <View
          style={{
            flex: 1,
            alignItems: "flex-start",
            justifyContent: "center"
          }}
        >
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(event.url ? event.url : "https://www.asu.edu");
            }}
            accessibilityRole="button"
          >
            <View
              style={{
                justifyContent: "center",
                backgroundColor: "#D40546",
                height: responsiveHeight(7),
                width: responsiveWidth(35)
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  textAlign: "center",
                  color: "white"
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
          <CheckinConditionalButton />
        </View>
      </View>
    );
  }

  render() {
    let { navigate } = this.props.screenProps.navigation;
    let locationInsert = null;
    if (this.state.dataLoaded) {
      if (this.state.eventList.length == 0) {
        return (
          <View style={styles.blankSchedule}>
            <Analytics ref="analytics" />
            <View style={{ marginBottom: 20 }}>
              <Icon name={"calendar"} size={100} color="#c7c7c7" />
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontFamily: "Roboto",
                  fontSize: 25
                }}
              >
                No Upcoming Events!
              </Text>
            </View>
          </View>
        );
      } else {
        return (
          <View style={{ flex: 1 }}>
            <Analytics ref="analytics" />
            <ScrollView style={{ backgroundColor: "white" }}>
              {this.state.eventList.map((item, index) => {
                let buttonInsert = this.buttonInsert(item);
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => {
                      this.refs.analytics.sendData({
                        "action-type": "click",
                        "starting-screen": "clubs",
                        "starting-section": "my-club-events", 
                        "target":"Event Preview",
                        "resulting-screen": "core-feature-card",
                        "resulting-section": "event-details",
                        "action-metadata": {
                          "title": item.title?item.title:JSON.stringify(item)
                        }
                      });
                      navigate("Card", {
                        nid: item.nid,
                        data: item,
                        navigation: this.props.screenProps.navigation,
                        saved: null,
                        location: null,
                        footer: buttonInsert,
                        previousScreen:"clubs",
                        previousSection:"my-club-events",
                        target: "Event Card",
                      });
                    }}
                  >
                    <View style={styles.eventRowContainer}>
                      <View style={styles.eventDateContainer}>
                        <View style={styles.dateContainer}>
                          <Image
                            style={{
                              height: "50%",
                              width: "100%",
                              paddingRight: 10
                            }}
                            resizeMode="stretch"
                            source={{ uri: item.picture }}
                          />
                        </View>
                      </View>
                      <View style={styles.eventTextContainer}>
                        <Text style={styles.eventTitle}>{item.title}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            Linking.openURL(
                              item.organization_website_url
                                ? item.organization_website_url
                                : "https://www.asu.edu"
                            );
                          }}
                        >
                          <View style={styles.dateLocContainer}>
                            <Icon
                              name={"users"}
                              size={18}
                              color="maroon"
                              style={{ marginRight: 10 }}
                            />
                            <Text style={{ color: "maroon" }}>
                              {item.organization_name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        {renderEndTime(item)}
                        <View style={styles.dateLocContainer}>
                          <Icon
                            name={"map-marker"}
                            size={22}
                            color="#AAAAAA"
                            style={{ marginRight: 10, marginLeft: 4 }}
                          />
                          {renderLocation(item.location)}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        );
      }
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Analytics ref="analytics" />
          <View
            style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
          >
            <ActivityIndicator
              size="large"
              animating={!this.state.dataLoaded}
              color="maroon"
            />
          </View>
        </View>
      );
    }
  }
}

MyClubEvents.contextTypes = {
  getTokens: PropTypes.func
};

class AllClubEvents extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      eventList: [],
      eventListFiltered: [],
      dataLoaded: false
    };
  }

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "view",
      "starting-screen": "clubs",
      "starting-section": "all-club-events", 
      "target":"All Club Events",
      "resulting-screen": "clubs",
      "resulting-section": "all-club-events"
    });
    tracker.trackEvent("View", "All_Club_Events");
    axios
      .post(
        "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/orgsync",
        {
          operation: "getAllOrgsyncEvents"
        }
      )
      .then(response => {
        var eventList = [];
        for (var i = 0; i < response.data.length; i++) {
          var item = response.data[i]._source;
          if (
            moment(item.very_start_date).format("YYYY-MM-DD") >=
            moment().format("YYYY-MM-DD")
          ) {
            eventList.push(getFormattedItem(item));
          }
        }
        eventList = _.sortBy(eventList, "startTime");
        this.setState({
          eventList: eventList,
          eventListFiltered: eventList,
          dataLoaded: true
        });
      });
  }

  searchUpdated(term) {
    let originalArray = this.state.eventList;
    let arrayWithSearchTerm = [];
    let lowerCaseTerm = term.toLowerCase();
    for (let i = 0; i < originalArray.length; i++) {
      let title = originalArray[i].title.toLowerCase();
      let description = originalArray[i].description.toLowerCase();
      let location = originalArray[i].location.toLowerCase();
      let organization_name = originalArray[i].organization_name.toLowerCase();
      if (
        title.includes(lowerCaseTerm) ||
        description.includes(lowerCaseTerm) ||
        location.includes(lowerCaseTerm) ||
        organization_name.includes(lowerCaseTerm)
      ) {
        arrayWithSearchTerm.push(originalArray[i]);
      }
    }
    //console.log('arrayWithSearchTerm ', arrayWithSearchTerm)
    this.setState({ eventListFiltered: arrayWithSearchTerm });
  }

  buttonInsert(event) {
    let CheckinConditionalButton = () => {
      if (event.feed_type == "event") {
        let mappedEvent = { ...event };
        mappedEvent.starttime = mappedEvent.startTime;
        mappedEvent.endtime = mappedEvent.endTime;
        mappedEvent.id = mappedEvent.key;
        return (
          <EventCheckinButton
            data={mappedEvent}
            style={"big"}
            activity_type={"social"}
            previousSection={"club-events"}
            previousScreen={"clubs"}
          />
        );
        // return null
      } else {
        return null;
      }
    };

    return (
      <View style={{ flexDirection: "row", padding: responsiveWidth(3) }}>
        <View
          style={{
            flex: 1,
            alignItems: "flex-start",
            justifyContent: "center"
          }}
        >
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(event.url ? event.url : "https://www.asu.edu");
            }}
            accessibilityRole="button"
          >
            <View
              style={{
                justifyContent: "center",
                backgroundColor: "#D40546",
                height: responsiveHeight(7),
                width: responsiveWidth(35)
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  textAlign: "center",
                  color: "white"
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
          <CheckinConditionalButton />
        </View>
      </View>
    );
  }

  render() {
    let { navigate } = this.props.screenProps.navigation;
    if (this.state.dataLoaded) {
      if (this.state.eventList.length == 0) {
        return (
          <View style={styles.blankSchedule}>
            <Analytics ref="analytics" />
            <View style={{ marginBottom: 20 }}>
              <Icon name={"calendar"} size={100} color="#c7c7c7" />
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontFamily: "Roboto",
                  fontSize: 25
                }}
              >
                No Upcoming Events!
              </Text>
            </View>
          </View>
        );
      } else {
        const filteredEvents = this.state.eventListFiltered;
        return (
          <View style={{ flex: 1 }}>
            <Analytics ref="analytics" />
            <View style={styles.searchBarContainer}>
              <TextInput
                onChangeText={term => {
                  this.searchUpdated(term);
                }}
                style={styles.searchInput}
                placeholder="SEARCH EVENT"
              />
            </View>
            <ScrollView style={{ backgroundColor: "white" }}>
              {filteredEvents.map((item, index) => {
                let buttonInsert = this.buttonInsert(item);
                return (
                  <View key={item.key}>
                    <View style={styles.eventRowContainer}>
                      <View style={styles.event}>
                        <TouchableOpacity
                          style={styles.dateContainer}
                          onPress={() => {
                            this.refs.analytics.sendData({
                              "action-type": "click",
                              "starting-screen": "clubs",
                              "starting-section": "all-club-events", 
                              "target":"Event Preview",
                              "resulting-screen": "core-feature-card",
                              "resulting-section": "event-details",
                              "action-metadata": {
                                "title": item.title?item.title:JSON.stringify(item)
                              }
                            });
                            navigate("Card", {
                              nid: item.nid,
                              data: item,
                              navigation: this.props.screenProps.navigation,
                              saved: null,
                              location: null,
                              footer: buttonInsert,
                              previousScreen:"clubs",
                              previousSection:"all-club-events",
                              target: "Event Card",
                            });
                          }}
                          accessibilityRole="imagebutton"
                        >
                          <Image
                            style={{
                              height: "50%",
                              width: "100%",
                              paddingRight: 10
                            }}
                            resizeMode="stretch"
                            source={{ uri: item.picture }}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.eventTextContainer}>
                        <TouchableOpacity
                          onPress={() => {
                            this.refs.analytics.sendData({
                              "action-type": "click",
                              "starting-screen": "clubs",
                              "starting-section": "all-club-events", 
                              "target":"Event Preview",
                              "resulting-screen": "core-feature-card",
                              "resulting-section": "event-details",
                              "action-metadata": {
                                "title": item.title?item.title:JSON.stringify(item)
                              }
                            });
                            navigate("Card", {
                              nid: item.nid,
                              data: item,
                              navigation: this.props.screenProps.navigation,
                              saved: null,
                              location: null,
                              footer: buttonInsert,
                              previousScreen:"clubs",
                              previousSection:"all-club-events",
                              target: "Event Card",
                            });
                          }}
                          accessibilityRole="link"
                        >
                          <Text style={styles.eventTitle}>{item.title}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            Linking.openURL(
                              item.organization_website_url
                                ? item.organization_website_url
                                : "https://www.asu.edu"
                            );
                          }}
                          accessibilityRole="link"
                        >
                          <View style={styles.dateLocContainer}>
                            <Icon
                              name={"users"}
                              size={18}
                              color="maroon"
                              style={{ marginRight: 10 }}
                            />
                            <Text style={{ color: "maroon" }}>
                              {item.organization_name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            this.refs.analytics.sendData({
                              "action-type": "click",
                              "starting-screen": "clubs",
                              "starting-section": "all-club-events", 
                              "target":"Event Preview",
                              "resulting-screen": "core-feature-card",
                              "resulting-section": "event-details",
                              "action-metadata": {
                                "title": item.title?item.title:JSON.stringify(item)
                              }
                            });
                            navigate("Card", {
                              nid: item.nid,
                              data: item,
                              navigation: this.props.screenProps.navigation,
                              saved: null,
                              location: null,
                              footer: buttonInsert,
                              previousScreen:"clubs",
                              previousSection:"all-club-events",
                              target: "Event Card",
                            });
                          }}
                          accessibilityRole="button"
                        >
                          {renderEndTime(item)}
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            this.refs.analytics.sendData({
                              "action-type": "click",
                              "starting-screen": "clubs",
                              "starting-section": "all-club-events", 
                              "target":"Event Preview",
                              "resulting-screen": "core-feature-card",
                              "resulting-section": "event-details",
                              "action-metadata": {
                                "title": item.title?item.title:JSON.stringify(item)
                              }
                            });
                            navigate("Card", {
                              nid: item.nid,
                              data: item,
                              navigation: this.props.screenProps.navigation,
                              saved: null,
                              location: null,
                              footer: buttonInsert,
                              previousScreen:"clubs",
                              previousSection:"all-club-events",
                              target: "Event Card",
                            });
                          }}
                          accessibilityRole="button"
                        >
                          <View style={styles.dateLocContainer}>
                            <Icon
                              name={"map-marker"}
                              size={22}
                              color="#AAAAAA"
                              style={{ marginRight: 10, marginLeft: 4 }}
                            />
                            {renderLocation(item.location)}
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        );
      }
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Analytics ref="analytics" />
          <View
            style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
          >
            <ActivityIndicator
              size="large"
              animating={!this.state.dataLoaded}
              color="maroon"
            />
          </View>
        </View>
      );
    }
  }
}

/**
 * Tab Nav on SunDevil Sync page
 */
const SunDevilSyncNav = createAppContainer(
  createMaterialTopTabNavigator(
    {
      AllEvents: {
        screen: MyClubEvents,
        navigationOptions: {
          title: "My Club Events"
        }
      },
      Requests: {
        screen: AllClubEvents,
        navigationOptions: {
          title: "All Club Events"
        }
      }
    },
    {
      // tabBarComponent: createTabBarTop,
      tabBarPosition: "top",
      tabBarOptions: {
        activeTintColor: "#FFC627",

        labelStyle: {
          fontSize: 18,
          fontWeight: "bold",
          fontFamily: "Roboto",
          paddingVertical: 10
        },
        upperCaseLabel: false,
        style: {
          backgroundColor: "#25262a"
        }
      }
    }
  )
);

export function renderLocation(location) {
  if (location.indexOf("http") !== -1) {
    return (
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(location);
          }}
        >
          <Text
            style={{ fontWeight: "400", fontFamily: "Roboto", color: "maroon" }}
          >
            Online
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    return (
      <Text style={{ flexWrap: "wrap", color: "#2D2D2D" }}>{location}</Text>
    );
  }
}

export function renderEndTime(item) {
  if (moment(item.startTime).format("hh:mm a") === "12:00 am") {
    return (
      <View style={styles.dateLocContainer}>
        <Icon
          name={"clock-o"}
          size={22}
          color="#AAAAAA"
          style={{ marginRight: 10 }}
        />
        <Text style={{ color: "#2D2D2D" }}>
          {moment(item.startTime).format("MMM DD") + " - All Day"}
        </Text>
      </View>
    );
  } else {
    eventTimeASU = moment(item.startTime);
    eventUTC = moment.utc(eventTimeASU);
    eventLocal = eventUTC.local();

    eventEndTimeASU = moment(item.endTime);
    eventEndUTC = moment.utc(eventEndTimeASU);
    eventEndLocal = eventEndUTC.local();

    zone1 = moment2.tz.guess();
    zone1 = moment2.tz(zone1).format("z");
    return (
      <View style={styles.dateLocContainer}>
        <Icon
          name={"clock-o"}
          size={22}
          color="#AAAAAA"
          style={{ marginRight: 10 }}
        />
        <Text style={{ color: "#2D2D2D" }}>
          {eventLocal.format("MMM DD, h:mm a")} -{" "}
          {eventEndLocal.format("hh:mm a")} {zone1}
        </Text>
      </View>
    );
  }
}

export function getFormattedItem(item) {
  let format = {
    feed_type: "event",
    nid: item.nid ? item.nid[0] : "no id",
    key: item.nid ? item.nid[0] : "no id",
    picture: item.organization_pic_url
      ? item.organization_pic_url
      : "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/asu_sunburst_600.png",
    title: item.title[0],
    location: item.locations ? item.locations[0] : "No Location Available",
    category: "orgsync",
    description: item.full_body ? item.full_body[0] : "No Preview Available",
    teaser: item.body_summary ? item.body_summary[0] : "No Preview Available",
    url: item.alias[0] ? item.alias[0] : "https://www.asu.edu",
    startTime: item.very_start_date,
    endTime: item.very_end_date,
    map_title: item.map_title,
    map_coords: item.map_coords,
    map_type: item.map_type,
    type: "events",
    displayType: "full",
    eventType: "orgsync",
    organization_name: item.organization_name,
    organization_website_url: item.organization_website_url
  };
  if (format.picture == "/assets/icons/portals/no_org_profile_100.png") {
    format.picture =
      "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/asu_sunburst_600.png";
  }
  return format;
}
/*
<TouchableOpacity
              style={styles.organizationBrowse}
              onPress={() => {
                navigate("OrganizationsHome");
              }}>
              <View style={{flexDirection:'row', justifyContent: 'flex-end', alignItems:"center"}}>
                <Text style={{color:"#999999"}}></Text>
              </View>
            </TouchableOpacity>

*/
/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  eventRowContainer: {
    flex: 1,
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#C8C8C8",
    height: responsiveHeight(25)
  },
  eventDateContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 20
  },
  dateContainer: {
    flex: 1,
    alignItems: "flex-start",
    paddingRight: responsiveWidth(2.7),
    paddingTop: responsiveWidth(2.7),
    width: responsiveWidth(22),
    height: responsiveWidth(17)
  },
  monthContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 3,
    backgroundColor: "#DE6344"
  },
  dayContainer: {
    flex: 7,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F4F4"
  },
  image: {
    height: responsiveWidth(16),
    borderRadius: responsiveWidth(8),
    width: responsiveWidth(16),
    alignItems: "center",
    marginTop: 5
  },
  eventTextContainer: {
    flex: 8,
    justifyContent: "space-around"
  },
  eventTitle: {
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  dateLocContainer: {
    flexDirection: "row",
    paddingRight: responsiveWidth(8),
    alignItems: "center"
  },
  blankSchedule: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    height: "100%",
    backgroundColor: "#fff"
  },
  searchInput: {
    padding: 10,
    flex: 1,
    width: responsiveWidth(60)
  },
  searchBarContainer: {
    flexDirection: "row",
    height: responsiveHeight(7),
    backgroundColor: "#F4F4F4",
    alignItems: "center"
  },
  organizationBrowse: {
    flex: 0,
    alignItems: "center"
  }
});
