import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Share,
  Image,
  LayoutAnimation,
  AsyncStorage,
  ActivityIndicator
} from "react-native";
import PropTypes from "prop-types";
import axios from "axios";
import moment from "moment";
import _ from "lodash";
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { EventCheckinButton } from "../../../achievement/Checkins/CheckinButtonNewUI";
import { CheckinCount } from "../../../achievement/Checkins/CheckinCount";
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";
import {
  urldecode,
  searchedAdresses,
  checkProhibitedLocations,
  parseCourseNum
} from "./utility";
import { FavoriteIcon } from "./FavoriteIcon";
import ReminderDropdown from "../Reminders/ReminderDropdown";
import ReminderInfo from "../Reminders/ReminderInfo";
import { DefaultText as Text } from "../../../presentational/DefaultText.js";
import { Api } from "../../../../services";
import { AppSyncComponent } from "../../authentication/auth_components/appsync/AppSyncApp";
import { removeReminder } from "../../../../Queries";
import { deleteUserCalEvent } from "./ModalHelpers/gql/mutations";
import { CanvasNotif } from "../../../achievement/Class/CanvasNotif";
import { CanvasModal } from "./CanvasModal";
import { comparer } from "./utility";
export class SingleScheduleX extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      opened: false,
      height: 0,
      showDrop: false,
      showRemove: false,
      showFavAlert: false,
      resetNum: 0,
      displayCanvasModal: false,
      newAnnouncements: false,
      loading: true,
      courseNumber: 0
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.resetNum !== this.props.resetNum) {
      this.setState({
        opened: false,
        height: 0
      });
    }
  }

  // ==================
  // HELPER FUNCTIONS:
  // ==================

  determineLocationButton = (item, btnType) => {
    if (btnType === "large") {
      return this.renderLocationButtonLarge(item);
    } else if (btnType === "small") {
      return this.renderLocationButton(item);
    }
  };

  academicLocationOnPress = item => {
    const { navigate } = this.props.navigation;
    const buildingCodeApi =
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/buildingcode";
    axios
      .post(buildingCodeApi, { buildingName: item.location })
      .then(response => {
        const formattedItem = {};
        if (response.data.Items[0].imageUrl) {
          formattedItem.mediaUrls = [response.data.Items[0].imageUrl];
        }
        formattedItem.description = response.data.Items[0].description;
        formattedItem.map_title = response.data.Items[0].name;
        formattedItem.buildingId = response.data.Items[0].id;
        formattedItem.map_coords = {
          lat: response.data.Items[0].lat,
          lng: response.data.Items[0].lon
        };
        navigate("Maps", {
          locationName: response.data.Items[0].name,
          previousScreen:this.props.previousScreen,
          previousSection:this.props.previousSection,
          target:"NAVIGATE",
          data:response.data.Items[0].name,
          item: {
            data: {
              data: formattedItem
            }
          }
        });
      });
  };

  phoneCalLocationOnPress = item => {
    const { navigate } = this.props.navigation;

    const lat = item.locationCoords.latitude;
    const lng = item.locationCoords.longitude;

    navigate("InAppLink", {
      url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      title: item.location
    });
  };

  static defaultProps = {
    navigation: {},
    item: {},
    title_var: "course_title",
    saveEvent: () => null,
    attendees: [],
    event_id: null
  };

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const tokens = await this.context.getTokens();
    if (tokens.username && tokens.username !== "guest") {
      const courseNumber = parseCourseNum(this.props.item.course_url)
        ? parseCourseNum(this.props.item.course_url)
        : 0;
      this.setState({ courseNumber, loading: true });
      const payload = {
        course_id: courseNumber
      };
      // console.log("payload ", payload);
      const apiService = new Api(
        "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
        tokens
      );
      try {
        const response = await apiService.post("/canvas/data", payload);
        // console.log("get data running", response);
        if (!response.errorMessage) {
          if(this.props.setCanvasAuthorized){this.props.setCanvasAuthorized(true);}
          const parsedAnnouncements = response.announcements.map(item => {
            const result = {
              date: moment(item.posted_at).format("MM-DD-YYYY"),
              dateMili: moment(item.posted_at).valueOf(),
              classId: courseNumber,
              id: item.id,
              title: item.title,
              itemTitle: item.title,
              url: item.url,
              posted_at: item.posted_at
            };
            return result;
          });
          // console.log("parsedAnnouncements ", parsedAnnouncements);
          // const parsedAnnouncements1 = [
          //   ...parsedAnnouncements,
          //   {
          //     classId: "92",
          //     date: "09-07-2019",
          //     dateMili: 1567782512000,
          //     id: 167,
          //     itemTitle: "test announcement 3",
          //     posted_at: "2019-09-06T15:08:32Z",
          //     title: "test announcement 3",
          //     url: "https://canvas-dev.asu.edu/courses/91/discussion_topics/166"
          //   }
          // ];
          const storedAnnouncements = await this.getStoredAnnouncements(
            courseNumber
          );
          const unseenAnnouncements = this.getUnseenAnnouncements(
            storedAnnouncements,
            parsedAnnouncements
            // parsedAnnouncements1
          );
          // console.log("stored ", storedAnnouncements, unseenAnnouncements);
          // this.storeSeenAnnouncements(parsedAnnouncements, courseNumber);
          const newAnnouncements =
            unseenAnnouncements.length > 0 ? true : false;
          this.setState({
            // announcements: parsedAnnouncements,
            newAnnouncements,
            parsedAnnouncements,
            courseNumber,
            loading: false
          });
        } else {
          console.log("getData error");
          if(this.props.setCanvasAuthorized){this.props.setCanvasAuthorized(false);}
          this.setState({ loading: false });
        }
      } catch (err) {
        console.log("getData error ", err);
        if(this.props.setCanvasAuthorized){this.props.setCanvasAuthorized(false);}
        this.setState({ loading: false });
      }
    }
  };
  getUnseenAnnouncements = (storedAnnouncements, newAnnouncements) => {
    if (storedAnnouncements) {
      const onlyInStored = storedAnnouncements.filter(
        comparer(newAnnouncements)
      );
      const onlyInNew = newAnnouncements.filter(comparer(storedAnnouncements));
      return onlyInStored.concat(onlyInNew);
    } else {
      return newAnnouncements;
    }
  };
  getStoredAnnouncements = async courseNumber => {
    try {
      const string = ("seenAnnouncements" + courseNumber).toString();
      const value = await AsyncStorage.getItem(string);
      if (value !== null) {
        // We have data!!
        return JSON.parse(value);
      }
    } catch (error) {
      // Error retrieving data
      console.log("getStoredAnnouncements error ", error);
      return false;
    }
  };
  storeSeenAnnouncements = async (arrayToStore, courseNumber) => {
    if (arrayToStore) {
      try {
        // console.log(
        //   "storing data as ",
        //   "seenAnnouncements" + courseNumber + "and what to save ",
        //   arrayToStore
        // );
        await AsyncStorage.setItem(
          `seenAnnouncements${courseNumber}`,
          JSON.stringify(arrayToStore)
        );
        // console.log("value ", value);
      } catch (error) {
        console.log("unable to store seenAnnouncements", error);
      }
    }
  };
  /**
   * Schedule navigation between events and classes is handled differently.
   * Make events touchable, while classes remain views.
   *
   * This is subject to change once canvas/blackboard links are available.
   * @param {*} jsxData
   */
  //UNUSED
  determineTouchable(jsxData) {
    let { navigate } = this.props.navigation;
    let item = this.props.item;
    if (item.type != "academic") {
      return (
        <TouchableOpacity
          onPress={() => {
            if (item.type != "academic") {
              navigate("Card", {
                nid: item.id,
                data: item.data,
                navigation: this.props.navigation,
                type: "events",
                saved: [item.id],
                previousScreen:this.props.previousScreen,
                previousScreen:this.props.previousSection,
                target: "Event Card",
              });
            }
          }}
        >
          {jsxData}
        </TouchableOpacity>
      );
    } else {
      return <View>{jsxData}</View>;
    }
  }

  resetShowRemove = () => {
    this.setState({
      showRemove: false
    });
  };

  resetShowDrop = () => {
    this.setState({
      showDrop: false
    });
  };

  resetShowFavAlert = () => {
    this.setState({
      showFavAlert: false
    });
  };

  eventOptions = () => {
    return null;
  };

  // ================
  // CORE FUNCTIONS:
  // ================

  renderLocationText = item => {
    let { navigation } = this.props;
    if (item.type && item.type == "academic") {
      item.location = item.meeting_patterns[0].meeting_location;
    }
    if (item.location) {
      let location = item.location,
        startIndex = 0,
        endIndex = 0,
        locationText = item.location;
      if (item.type != "custom_event") {
        startIndex = location.indexOf("(");
        if (startIndex > -1) {
          locationText = item.location.substring(0, startIndex);
        }
        return (
          <View
            style={{ flexDirection: "row", marginTop: responsiveHeight(0.6) }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {this.renderLocationBadge(item, "small")}
            </View>
            <Text style={styles.locationText}>{locationText}</Text>
            {this.renderBlankBadge()}
          </View>
        );
      } else {
        return (
          <View style={{ marginTop: responsiveHeight(0.6) }}>
            {this.renderDynamicLocationText(item.location, item, navigation)}
          </View>
        );
      }
    } else return null;
  };
  renderBlankBadge = () => {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: responsiveHeight(0.5),
          height: responsiveHeight(2.5)
        }}
      />
    );
  };
  renderTime = item => {
    let eventTime = moment(item.unixTime).format("h:mm a");
    let timeRemaining = moment(item.unixTime).fromNow();
    let activity_type = "academic";
    if (
      item.data &&
      (item.data.feed_type == "event" || item.data.feed_type == "news")
    ) {
      activity_type = "social";
    }
    if (item.data && item.data.type) {
      let feedType = item.data.type;
      if (
        feedType.toLowerCase() == "event" ||
        feedType.toLowerCase() == "news"
      ) {
        activity_type = "social";
      }
    }
    let mappedItem = { ...item.data };
    if (item.type == "academic") {
      let dateId = moment(item.unixTime).format("DDMMYYYY");
      let starttime = item.unixTime;
      mappedItem = {
        id: item.course_id + "-" + dateId,
        key: item.course_id + "-" + dateId,
        activity_type: activity_type,
        feed_type: item.type,
        title: item.course_title,
        starttime: starttime
      };
    }
    if (eventTime == "12:00 am") {
      return null;
    } else {
      return (
        <View style={styles.timeBlock}>
          <Text
            style={{ fontWeight: "bold", fontSize: responsiveFontSize(1.9) }}
          >
            {eventTime}
          </Text>
        </View>
      );
    }
  };
  renderTimeUntil = item => {
    let eventTime = moment(item.unixTime).format("h:mm a");
    let timeRemaining = moment(item.unixTime).fromNow();
    let activity_type = "academic";
    if (
      item.data &&
      (item.data.feed_type == "event" || item.data.feed_type == "news")
    ) {
      activity_type = "social";
    }
    if (item.data && item.data.type) {
      let feedType = item.data.type;
      if (
        feedType.toLowerCase() == "event" ||
        feedType.toLowerCase() == "news"
      ) {
        activity_type = "social";
      }
    }
    let mappedItem = { ...item.data };
    if (item.type == "academic") {
      let dateId = moment(item.unixTime).format("DDMMYYYY");
      let starttime = item.unixTime;
      mappedItem = {
        id: item.course_id + "-" + dateId,
        key: item.course_id + "-" + dateId,
        activity_type: activity_type,
        feed_type: item.type,
        title: item.course_title,
        starttime: starttime
      };
    }
    if (eventTime == "12:00 am") {
      return null;
    } else {
      return (
        <View style={styles.timeBlock}>
          <Text style={[styles.timeRemaining, { textAlignVertical: "top" }]}>
            {timeRemaining}
          </Text>
        </View>
      );
    }
  };
  renderTimeBlock = item => {
    let eventTime = moment(item.unixTime).format("h:mm a");
    let timeRemaining = moment(item.unixTime).fromNow();
    let activity_type = "academic";
    if (
      item.data &&
      (item.data.feed_type == "event" || item.data.feed_type == "news")
    ) {
      activity_type = "social";
    }
    if (item.data && item.data.type) {
      let feedType = item.data.type;
      if (
        feedType.toLowerCase() == "event" ||
        feedType.toLowerCase() == "news"
      ) {
        activity_type = "social";
      }
    }
    let mappedItem = { ...item.data };
    if (item.type == "academic") {
      let dateId = moment(item.unixTime).format("DDMMYYYY");
      let starttime = item.unixTime;
      mappedItem = {
        id: item.course_id + "-" + dateId,
        key: item.course_id + "-" + dateId,
        activity_type: activity_type,
        feed_type: item.type,
        title: item.course_title,
        starttime: starttime
      };
    }
    if (eventTime == "12:00 am" && item.type != "phone_cal") {
      return null;
    } else {
      return (
        <View style={styles.timeBlock}>
          <Text
            style={{ fontWeight: "bold", fontSize: responsiveFontSize(1.9) }}
          >
            {item.allDayEvent ? "All Day" : eventTime}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: responsiveHeight(1),
                height: responsiveHeight(2.5)
              }}
            />
            <Text style={[styles.timeRemaining, { textAlignVertical: "top" }]}>
              {item.allDayEvent ? null : timeRemaining}
            </Text>
          </View>
        </View>
      );
    }
  };
  renderDynamicLocationText = (location, item) => {
    let { navigation } = this.props;
    if (location.indexOf("http") !== -1) {
      return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.campusStyle}>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(location);
              }}
            >
              <Text style={{ fontWeight: "400", color: "maroon" }}>Online</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (
      location.toLowerCase().indexOf("online") !== -1 ||
      location.toLowerCase().indexOf(".com") !== -1
    ) {
      return (
        <View style={styles.campusStyle}>
          <Text style={{ fontSize: 12, color: "white", fontWeight: "bold" }}>
            Online
          </Text>
        </View>
      );
    } else {
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            width: responsiveWidth(55)
          }}
        >
          <View>
            <Text style={styles.locationText}>{location} </Text>
          </View>
          {/* <View style={{ marginLeft: 10 }}>
            <FavoriteIcon
              item={item}
              navigation={navigation}
              showAlert={this.state.showFavAlert}
              modalDone={this.resetShowFavAlert.bind(this)}
            />
          </View> */}
        </View>
      );
    }
  };
  renderLocationBadge = (item, btnType) => {
    // console.log("RENDER ITEM --> ", item);
    if (!item.location && item.type == "academic") {
      item.location = item.meeting_patterns[0].meeting_location;
    }
    if (item.type === "academic") {
      return this.determineLocationButton(item, btnType);
    } else if (item.type == "custom_event") {
      return null;
    } else if (item.type == "phone_cal") {
      if (item.locationCoords) {
        return this.determineLocationButton(item, btnType);
      } else {
        return null;
      }
    } else {
      if (item.location && !checkProhibitedLocations(item.location)) {
        return this.determineLocationButton(item, btnType);
      } else {
        return null;
      }
    }
  };
  determineLocationButton = (item, btnType) => {
    if (btnType === "large") {
      return this.renderLocationButtonLarge(item);
    } else if (btnType === "small") {
      return this.renderLocationButton(item);
    }
  };
  academicLocationOnPress = item => {
    const { navigate } = this.props.navigation;    
    let buildingCodeApi =
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/buildingcode";
    axios
      .post(buildingCodeApi, { buildingName: item.location })
      .then(response => {
        let formattedItem = {};
        if (response.data.Items[0].imageUrl) {
          formattedItem.mediaUrls = [response.data.Items[0].imageUrl];
        }
        formattedItem.description = response.data.Items[0].description;
        formattedItem.map_title = response.data.Items[0].name;
        formattedItem.buildingId = response.data.Items[0].id;
        formattedItem.map_coords = {
          lat: response.data.Items[0].lat,
          lng: response.data.Items[0].lon
        };
        navigate("Maps", {
          locationName: response.data.Items[0].name,
          previousScreen:this.props.previousScreen,
          previousSection:this.props.previousSection,
          target:"NAVIGATE",
          data:response.data.Items[0].name,
          item: {
            data: {
              data: formattedItem
            }
          }
        });
      });
  };
  //UNUSED
  renderAcademicLocation = item => {
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.locationBadge}>
        <TouchableOpacity
          onPress={() => {
            this.academicLocationOnPress(item);
          }}
          style={styles.locationSquare}
          accessibilityLabel="Navigate here"
          accessibilityRole="button"
        >
          <Icon name={"location-arrow"} size={15} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };
  phoneCalLocationOnPress = item => {
    const { navigate } = this.props.navigation;
    var lat = item.locationCoords.latitude;
    var lng = item.locationCoords.longitude;
    navigate("InAppLink", {
      url: "https://www.google.com/maps/search/?api=1&query=" + lat + "," + lng,
      title: item.location
    });
  };
  eventLocationOnPress = item => {
    const { navigate } = this.props.navigation;
    var map_coords = null;
    if (item.map_lat && item.map_lng) {
      map_coords = {
        lat: item.map_lat,
        lng: item.map_lng
      };
    }
    searchedAdresses(item.location).then(response => {
      let formattedItem = {};
      if (response && response[0].mediaUrls && response[0].mediaUrls[0]) {
        formattedItem.mediaUrls = response[0].mediaUrls;
      }
      formattedItem.description = response[0].description;
      formattedItem.map_title = response[0].name;
      if (!map_coords) {
        formattedItem.map_coords = {
          lat: response[0].lat,
          lng: response[0].lng
        };
      } else {
        formattedItem.map_coords = map_coords;
      }
      navigate("Maps", {
        locationName: item.location,
        previousScreen:this.props.previousScreen,
        previousSection:this.props.previousSection,
        target:"NAVIGATE",
        data:item.location,
        item: { data: { data: formattedItem } }
      });
    });
  };
  renderLocationButtonLarge = item => {
    var myStyle = "locationFullHidden";
    if (this.state.opened) {
      myStyle = "locationFull";
    }
    return (
      <View style={[styles.locationBadgeFull, { overflow: "hidden" }]}>
        <TouchableOpacity
          style={styles.locationFull}
          onPress={() => {
            if (item.type === "academic") {
              this.academicLocationOnPress(item);
            } else if (item.type === "phone_cal") {
              this.phoneCalLocationOnPress(item);
            } else {
              this.eventLocationOnPress(item);
            }
          }}
          accessibilityLabel="Navigate here"
          accessibilityRole="button"
        >
          <Icon name={"location-arrow"} size={15} color="#8A1E41" />
          <Text
            style={{
              color: "#8A1E41",
              fontSize: responsiveFontSize(1.3),
              marginLeft: 2
            }}
          >
            NAVIGATE
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  renderLocationButton = item => {
    var myStyle = "locationSquare";
    if (this.state.opened) {
      myStyle = "locationSquareHidden";
    }
    return (
      <View style={styles.locationBadge}>
        <TouchableOpacity
          style={[styles[myStyle]]}
          onPress={() => {
            // console.log("type",item.type)
            if (item.type === "academic") {
              this.academicLocationOnPress(item);
            } else if (item.type === "phone_cal") {
              this.phoneCalLocationOnPress(item);
            } else {
              this.eventLocationOnPress(item);
            }
          }}
          accessibilityLabel="Navigate here"
          accessibilityRole="button"
        >
          <Icon name={"location-arrow"} size={15} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };
  //UNUSED
  renderEventLocation = item => {
    const { navigate } = this.props.navigation;
    if (item.location && !checkProhibitedLocations(item.location)) {
      return (
        <View style={styles.locationBadge}>
          <TouchableOpacity
            style={styles.locationSquare}
            onPress={() => {
              this.eventLocationOnPress(item);
            }}
            accessibilityLabel="Navigate here"
            accessibilityRole="button"
          >
            <Icon name={"location-arrow"} size={15} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    } else return null;
  };
  showOpenedOptions = item => {
    let activity_type = "academic";
    if (
      item.data &&
      (item.data.feed_type == "event" || item.data.feed_type == "news")
    ) {
      activity_type = "social";
    }
    if (item.data && item.data.type) {
      let feedType = item.data.type;
      if (
        feedType.toLowerCase() == "event" ||
        feedType.toLowerCase() == "news"
      ) {
        activity_type = "social";
      }
    }
    let mappedItem = { ...item.data };
    if (item.type == "academic") {
      let dateId = moment(item.unixTime).format("DDMMYYYY");
      let starttime = item.unixTime;
      mappedItem = {
        id: item.course_id + "-" + dateId,
        key: item.course_id + "-" + dateId,
        activity_type: activity_type,
        feed_type: item.type,
        title: item.course_title,
        starttime: starttime
      };
    }
    return (
      <View style={[{ height: this.state.height }]}>
        <View style={styles.openedBody}>
          <View style={styles.buttonsOptions}>
            <View style={styles.buttonItem}>
              {this.renderLocationBadge(item, "large")}
            </View>
            <View style={[styles.buttonItem]}>
              <View
                style={{
                  alignSelf: "flex-end",
                  justifyContent: "flex-end",
                  overflow: "hidden"
                }}
              >
                <EventCheckinButton
                  data={mappedItem}
                  activity_type={activity_type}
                  previousSection={this.props.previousSection}
                  previousScreen={this.props.previousScreen}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };
  determineIcon = (icon, iconType) => {
    if (iconType == "fontawesome") {
      return <Icon name={icon} size={responsiveHeight(2)} color="#fff" />;
    } else if (iconType == "material") {
      return (
        <MaterialIcons name={icon} size={responsiveHeight(2.7)} color="#fff" />
      );
    } else if (iconType == "canvas") {
      return (
        <Image
          source={require("./assets/canvas.png")}
          style={{
            resizeMode: "contain",
            alignSelf: "center",
            width: responsiveHeight(2.7),
            height: responsiveHeight(2.7)
          }}
        />
      );
    } else {
      return null;
    }
  };
  basicListItem = (item, title, icon, iconType, clickFunction) => {
    let { navigate } = this.props.navigation;
    const notificationCircle =
      title === "View Class Profile" && this.state.newAnnouncements ? (
        <View style={styles.notificationIndicator} />
      ) : null;
    return (
      <TouchableOpacity
        style={{
          borderTopColor: "#e3e3e3",
          borderTopWidth: 1,
          flexDirection: "row",
          paddingVertical: 7,
          justifyContent: "center",
          alignItems: "center"
        }}
        onPress={() => {
          clickFunction(item);
        }}
        accessibilityLabel={title}
        accessible={true}
        accessibilityRole={"button"}
      >
        <View style={styles.iconHolder}>
          {this.determineIcon(icon, iconType)}
        </View>
        <Text style={[styles.basicTitle, { flex: 1 }]}>{title}</Text>
        {notificationCircle}
      </TouchableOpacity>
    );
  };
  customOptions = item => {
    var allRows = [];

    if (item.alert_amount) {
      reminder = this.basicListItem(
        item,
        "Reminder Set (" + item.alert_amount + ")",
        "alarm-on",
        "material",
        function(item) {
          this.setState({ showRemove: true });
        }.bind(this)
      );
    } else {
      reminder = this.basicListItem(
        item,
        "Add Reminder",
        "add-alarm",
        "material",
        function(item) {
          this.setState({ showDrop: true });
        }.bind(this)
      );
    }

    const in15 = moment().add(15, "minutes");
    let classTime = item.unixTime;

    if (moment(classTime).isAfter(in15)) {
      allRows.push(reminder);
    }

    return <View style={{ paddingTop: 10 }}>{allRows}</View>;
  };
  onlineOptions = item => {
    var courseLink = null;
    var allRows = [];
    let profile = this.basicListItem(
      item,
      "View Class Profile",
      "university",
      "fontawesome",
      function(item) {
        this.setState({ newAnnouncements: false });
        this.storeSeenAnnouncements(
          this.state.parsedAnnouncements,
          this.state.courseNumber
        );
        this.props.navigation.navigate("Class", {
          previousScreen:this.props.previousScreen, 
          previousSection:this.props.previousSection,
          data: item
        });
      }.bind(this)
    );

    allRows.push(profile);

    if (item.course_url) {
      courseLink = this.basicListItem(
        item,
        "View Course in Canvas",
        "canvas",
        "canvas",
        function(item) {
          this.navigatetoExternalSite(item.course_url, item.title);
        }.bind(this)
      );
      allRows.push(courseLink);
    }

    if (item.slack_url) {
      courseLink = this.basicListItem(
        item,
        "View Course Slack Channel",
        "slack",
        "fontawesome",
        function(item) {
          this.navigatetoExternalSite(item.slack_url, item.title, true);
        }.bind(this)
      );
      allRows.push(courseLink);
    }

    let roster = this.basicListItem(
      item,
      "View Class Roster",
      "users",
      "fontawesome",
      function(item) {
        this.storeSeenAnnouncements(
          this.state.parsedAnnouncements,
          this.state.courseNumber
        );
        this.props.navigation.navigate("ClassRoster", {
          name: item.title,
          course_number: item.class_number,
          previousSection: this.props.previousSection,
          previousScreen: this.props.previousScreen
        });
      }.bind(this)
    );
    allRows.push(roster);

    return <View style={{ paddingTop: 10 }}>{allRows}</View>;
  };

  academicOptions = item => {
    var courseLink = null;
    var allRows = [];

    let profile = this.basicListItem(
      item,
      "View Class Profile",
      "university",
      "fontawesome",
      function(item) {
        this.setState({ newAnnouncements: false });
        this.props.setCanvasAuthorized(true);
        if(this.props.setCanvasAuthorized){this.props.setCanvasAuthorized(true);}
        this.storeSeenAnnouncements(
          this.state.parsedAnnouncements,
          this.state.courseNumber
        );
        this.props.navigation.navigate("Class", {
          previousScreen:this.props.previousScreen, 
          previousSection:this.props.previousSection,
          data:item
        });
      }.bind(this)
    );

    allRows.push(profile);

    if (item.course_url) {
      courseLink = this.basicListItem(
        item,
        "View Course in Canvas",
        "canvas",
        "canvas",
        function(item) {
          this.navigatetoExternalSite(item.course_url, item.title);
        }.bind(this)
      );
      allRows.push(courseLink);
    }

    if (item.slack_url) {
      courseLink = this.basicListItem(
        item,
        "View Course Slack Channel",
        "slack",
        "fontawesome",
        function(item) {
          this.navigatetoExternalSite(item.slack_url, item.title, true);
        }.bind(this)
      );
      allRows.push(courseLink);
    }
    var reminderTitle = "Add Reminder";
    var reminderIcon = "clock";
    let reminder = null;

    if (item.alert_amount) {
      reminder = this.basicListItem(
        item,
        "Reminder Set (" + item.alert_amount + ")",
        "alarm-on",
        "material",
        function(item) {
          this.setState({ showRemove: true });
        }.bind(this)
      );
    } else {
      reminder = this.basicListItem(
        item,
        "Add Reminder",
        "add-alarm",
        "material",
        function(item) {
          this.setState({ showDrop: true });
        }.bind(this)
      );
    }

    const in15 = moment().add(15, "minutes");
    let classTime = item.unixTime;

    if (moment(classTime).isAfter(in15)) {
      allRows.push(reminder);
    }

    let roster = this.basicListItem(
      item,
      "View Class Roster",
      "users",
      "fontawesome",
      function(item) {
        this.props.navigation.navigate("ClassRoster", {
          name: item.title,
          course_number: item.class_number,
          previousSection: item.title,
          previousScreen: this.props.previousScreen
        });
      }.bind(this)
    );
    allRows.push(roster);

    return <View style={{ paddingTop: 10 }}>{allRows}</View>;
  };

  eventOptions = item => {
    return null;
  };

  shouldShowDelete = item => {
    if (
      item.type !== "academic" &&
      item.type !== "phone_cal" &&
      item.type !== "online"
    ) {
      if (item.type !== "custom_event") {
        return (
          <FavoriteIcon
            item={item}
            navigation={this.props.navigation}
            showAlert={this.state.showFavAlert}
            modalDone={this.resetShowFavAlert.bind(this)}
          />
        );
      } else {
        return (
          <TouchableOpacity
            onPress={() => {
              this.props.deleteUserCalEvent({ eventId: item.eventId });
            }}
          >
            <Text style={[styles.shareDeleteText]}>Delete</Text>
          </TouchableOpacity>
        );
      }
    } else {
      return <View />;
    }
  };

  deleteShareBtns = item => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          marginTop: 7,
          paddingTop: 15,
          borderTopColor: "#e3e3e3",
          borderTopWidth: 1
        }}
      >
        <View style={{ flex: 1 }}>{this.shouldShowDelete(item)}</View>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              this.shareItem(item);
            }}
          >
            <Text
              style={[
                styles.shareDeleteText,
                { textAlign: "right", marginRight: 3 }
              ]}
            >
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  deleteItem = item => {
    console.log("Hit delete");
  };
  shareItem = item => {
    var messageStr = "Join me ";
    if (item.location) {
      messageStr += "at " + item.location + " ";
    } else if (item.type == "online") {
      messageStr += "online ";
    }
    messageStr += "for " + item.title;
    if (item.unixTime && item.type != "online") {
      messageStr += " on " + moment(item.unixTime).format("LLLL");
    }
    var content = {
      message: messageStr,
      title: item.title
    };
    Share.share(content);
  };
  showOpenedList = item => {
    if (item.type == "academic") {
      return this.academicOptions(item);
    } else if (item.type == "online") {
      return this.onlineOptions(item);
    } else if (item.type == "phone_cal" || item.type == "custom_event") {
      return this.customOptions(item);
    } else if (!item.type && item.feed_type == "events") {
      return this.eventOptions(item);
    }
  };
  toggle = () => {
    LayoutAnimation.easeInEaseOut();
    if (this.state.opened) {
      this.setState({
        opened: false,
        height: 0
      });
    } else {
      this.setState({
        opened: true,
        height: "auto"
      });
    }
  };
  resetShowRemove = () => {
    this.setState({
      showRemove: false
    });
  };
  resetShowDrop = () => {
    this.setState({
      showDrop: false
    });
  };
  resetShowFavAlert = () => {
    this.setState({
      showFavAlert: false
    });
  };
  onPressHandler = () => this.setState({ displayCanvasModal: false });
  render() {
    // console.log("SingleSchedule props", this.props);
    let { navigate } = this.props.navigation;
    let item = this.props.item;
    if (item.type && item.type == "academic") {
      item.title = item[this.props.title_var];
    }
    let jsxData = (
      <View style={styles.itemBody}>
        <View style={styles.scheduleRow}>
          <View style={styles.titleBlock}>
            <View
              style={{
                flexDirection: "row"
              }}
            >
              <Text style={styles.eventTitle}>
                {item.title ? item.title : item.className}
              </Text>
            </View>
            {this.renderLocationText(item, this.props.navigation)}
          </View>
          {this.renderTimeBlock(item)}
        </View>
        <CanvasModal
          displayCanvasModal={this.state.displayCanvasModal}
          onPressHandler={this.onPressHandler}
          parent={this}
        />
        <ReminderDropdown
          item={item}
          showDrop={this.state.showDrop}
          finishedInfo={this.resetShowDrop.bind(this)}
        />
        <ReminderInfo
          item={item}
          showRemove={this.state.showRemove}
          finishedInfo={this.resetShowRemove.bind(this)}
        />
        <View style={{ height: this.state.height, overflow: "hidden" }}>
          {!this.props.canvasAuthorized &&
          !this.state.loading &&
          item &&
          item.class_number ? (
            <CanvasNotif this={this} scheduleItem={true} />
          ) : null}
          {this.state.loading && item && item.class_number ? (
            <ActivityIndicator size="large" />
          ) : null}
          {this.showOpenedOptions(item)}
          {this.showOpenedList(item)}
          {this.deleteShareBtns(item)}
        </View>
      </View>
    );
    return (
      <TouchableOpacity
        style={{ overflow: "hidden" }}
        onPress={() => {
          this.toggle();
        }}
      >
        {jsxData}
      </TouchableOpacity>
    );
  }
  navigatetoExternalSite(url, title, isExternal) {
    if (!isExternal) {
      this.props.navigation.navigate("InAppLink", { url: url, title: title });
    } else {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        }
      });
    }
  }
}
SingleScheduleX.contextTypes = {
  getTokens: PropTypes.func
};
export const SingleSchedule = AppSyncComponent(
  SingleScheduleX,
  deleteUserCalEvent
);
const styles = StyleSheet.create({
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  timeRemaining: {
    color: "#999999"
  },
  itemBody: {
    margin: 10,
    paddingVertical: 6,
    backgroundColor: "#FFF"
  },
  titleBlock: {
    justifyContent: "space-between",
    flex: 2
  },
  eventTitle: {
    fontWeight: "bold",
    fontSize: responsiveFontSize(1.9)
  },
  eventTitleUnder: {
    fontWeight: "bold",
    fontSize: responsiveFontSize(1.8),
    textDecorationLine: "underline"
  },
  timeBlock: {
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  locationText: {
    color: "#939393",
    textAlignVertical: "bottom"
  },
  locationSquare: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
    width: responsiveHeight(2.5),
    height: responsiveHeight(2.5),
    backgroundColor: "#8A1E41",
    marginRight: 5,
    borderRadius: 2
  },
  locationSquareHidden: {
    borderWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    width: responsiveHeight(0),
    height: responsiveHeight(0),
    backgroundColor: "#FFF",
    marginRight: 1,
    borderRadius: 0
  },
  locationFull: {
    borderWidth: 1,
    borderColor: "#8A1E41",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: responsiveWidth(4),
    width: "auto",
    alignSelf: "flex-start",
    height: responsiveHeight(3.7),
    backgroundColor: "#FFF",
    marginLeft: 0,
    overflow: "hidden",
    borderRadius: responsiveHeight(1.7),
    flexDirection: "row"
  },
  locationFullHidden: {
    borderWidth: 0,
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    width: 0,
    height: responsiveHeight(2.5),
    backgroundColor: "#FFF",
    borderRadius: 10,
    flexDirection: "row"
  },
  favoriteRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlignVertical: "bottom"
  },
  campusStyle: {
    paddingVertical: responsiveWidth(1.5),
    borderRadius: responsiveWidth(1),
    alignSelf: "flex-start",
    backgroundColor: "#9F9F9F",
    marginRight: 5,
    flexDirection: "row",
    width: responsiveWidth(16),
    justifyContent: "center",
    alignItems: "center"
  },
  iconHolder: {
    backgroundColor: "#b0b0b0",
    borderRadius: responsiveHeight(2.5),
    borderWidth: 1,
    borderColor: "#b0b0b0",
    height: responsiveHeight(4),
    width: responsiveHeight(4),
    justifyContent: "center",
    alignItems: "center"
  },
  basicTitle: {
    fontSize: responsiveFontSize(1.7),
    color: "#777",
    textAlignVertical: "center",
    marginLeft: responsiveWidth(2),
    height: responsiveHeight(4),
    justifyContent: "center",
    lineHeight: responsiveHeight(4)
  },
  shareDeleteText: {
    fontSize: responsiveFontSize(1.5),
    color: "#b0b0b0",
    fontWeight: "bold"
  },
  buttonsOptions: {
    flexDirection: "row",
    paddingTop: responsiveHeight(1.5)
  },
  buttonItem: {
    flex: 1
  },
  openedBody: {},
  notificationIndicator: {
    height: responsiveHeight(1.6),
    width: responsiveHeight(1.6),
    backgroundColor: "maroon",
    borderRadius: responsiveHeight(0.8),
    margin: responsiveWidth(3)
  }
});
