import React from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Linking
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from "moment";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { EventCheckinButton } from "./CheckinButton";
import { DefaultText as Text } from "../../presentational/DefaultText.js";

/**
 * Flat List that renders every user activity.
 *
 * ToDo: Add Likes to the list as well as checkins
 */
export class CheckinsBlockX extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    checkins_list: [],
    academicCheckins: [],
    count: null,
    nextToken: null,
    self: false
  };

  render() {
    let checkins = this.props.checkins_list.concat(this.props.academicCheckins);

    checkins.sort(function(a, b) {
      a1 = { ...a };
      b1 = { ...b };
      a1.timestamp = moment(a1.starttime).format("x");
      b1.timestamp = moment(b1.starttime).format("x");

      if (moment(a1.starttime).isValid()) {
        a1.timestamp = moment(a1.starttime).format("x");
      } else {
        a1.timestamp = a1.starttime;
      }
      if (moment(b1.starttime).isValid()) {
        b1.timestamp = moment(b1.starttime).format("x");
      } else {
        b1.timestamp = b1.starttime;
      }

      return a1.timestamp < b1.timestamp
        ? 1
        : b1.timestamp < a1.timestamp
        ? -1
        : 0;
    });

    console.log("CHECKIN ITEMS",this.props.checkins_list)

    if (checkins && checkins.length > 0) {
      return (
        <ScrollView style={{ backgroundColor: "white" }}>
          {this.props.header ? (
            <CheckinsHeader
              self={this.props.self}
              asurite={this.props.asurite}
              navigation={this.props.navigation}
              previousScreen={this.props.previousScreen}
              previousSection={this.props.previousSection}
            />
          ) : null}
          <FlatList
            data={
              this.props.count
                ? [...checkins].slice(0, this.props.count)
                : [...checkins]
            }
            renderItem={({ item }) => {
              return (
                <CheckinItem 
                  navigation={this.props.navigation} 
                  data={item}
                  previousScreen={this.props.previousScreen}
                  previousSection={this.props.previousSection}
                  self={this.props.self}
                />
              );
            }}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
      );
    } else {
      return (
        <View style={{ backgroundColor: "white", justifyContent: "center", alignItems: "center", flex: 1}}>
          <View style={{justifyContent: "center", alignItems: "center"}}>
            <FontAwesome
              name="check-circle"
              size={responsiveFontSize(10)}
              color="#c1c1c1"
            />
            <View style={{ paddingVertical: 10 }}>
              <Text style={{fontSize: responsiveFontSize(3.5), color: "#c1c1c1"}}>
                No Check-ins Found
              </Text>
            </View>
          </View>
        </View>
      );
    }
  }
}

/**
 * Individual activity Item to be rendered by the list.
 */
class CheckinItem extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    data: null
  };

  headerInsert(event) {
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
            previousSection={"header"}
            previousScreen={"checkins"}
          />
        );
        // return null
      } else {
        return <View />;
      }
    };

    return (
      <View
        style={{ flexDirection: "row", flex: 1, padding: responsiveWidth(3) }}
      >
        <CheckinConditionalButton />
      </View>
    );
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
            previousSection={"footer"}
            previousScreen={"checkins"}
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
          {/* <CheckinConditionalButton /> */}
        </View>
      </View>
    );
  }

  render() {
    let { data } = this.props;
    let { navigate } = this.props.navigation;
    // console.log("Checkin Infor", data);
    let dateInfo = data.starttime;
    if (data.feed_type == "academic") {
      try {
        let date = data.key.split("-")[1];
        dateInfo = moment(date, "DDMMYYYY").format("L");
        // console.log("DUNIT", dateInfo)
      } catch (e) {
        console.log(e);
      }
    } else {
      dateInfo = moment(data.starttime).format("L");
    }

    let headerInsert = null;
    let buttonInsert = null;
    if (data.feed_type !== "academic") {
      headerInsert = this.headerInsert(data);
      buttonInsert = this.buttonInsert(data);
      return (
        <TouchableOpacity
          onPress={() => {
            this.refs.analytics.sendData({
              "eventtime": new Date().getTime(),
              "action-type": "click",
              "target": "Checkin Event Card",
              "starting-screen": this.props.self?"my-checkins":"user-checkins",
              "starting-section": null,
              "resulting-screen": "core-feature-card", 
              "resulting-section": "event"
            });
            tracker.trackEvent("Click", "Card_Checkin");
            
            navigate("Card", {
              nid: data.nid,
              data: data,
              navigation: this.props.navigation,
              type: "events",
              header: headerInsert,
              footer: buttonInsert,
              previousScreen: this.props.self?"my-checkins":"user-checkins",
              previousSection: null, 
              target: "Event Card", 
            });
          }}
          accessibilityRole="button"
        >
          <Analytics ref="analytics" />
          <View
            style={{
              flexDirection: "row",
              borderBottomColor: "#c4c4c4",
              borderBottomWidth: 1
            }}
          >
            <View>
              <Image
                resizeMethod={"resize"}
                style={{
                  height: responsiveHeight(9),
                  width: responsiveWidth(25),
                  margin: responsiveHeight(2)
                }}
                source={{ uri: data.picture }}
              />
            </View>
            <View
              style={{
                padding: responsiveHeight(2),
                width: responsiveWidth(50)
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(2.2)
                }}
              >
                {data.title}
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.5),
                  color: "#454545",
                  marginTop: 3
                }}
              >
                {dateInfo}
              </Text>
            </View>
            <View
              style={{
                width: responsiveWidth(10),
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#FF7D42",
                  height: responsiveHeight(6),
                  width: responsiveHeight(6),
                  borderRadius: responsiveHeight(3)
                }}
              >
                <FontAwesome
                  name="calendar"
                  size={responsiveFontSize(3)}
                  color="white"
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity onPress={() => {}}>
          <View
            style={{
              flexDirection: "row",
              borderBottomColor: "#c4c4c4",
              borderBottomWidth: 1
            }}
          >
            <View
              style={{
                width: responsiveWidth(25),
                height: responsiveHeight(9),
                margin: responsiveHeight(2),
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#A20235",
                  height: responsiveHeight(9),
                  width: responsiveHeight(9),
                  borderRadius: responsiveHeight(5)
                }}
              >
                <FontAwesome
                  name="graduation-cap"
                  size={responsiveFontSize(4.5)}
                  color="white"
                />
              </View>
            </View>
            <View
              style={{
                padding: responsiveHeight(2),
                width: responsiveWidth(60),
                // alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(2.2)
                }}
              >
                {data.title}
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.5),
                  color: "#454545",
                  marginTop: 3
                }}
              >
                {dateInfo}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  }
}

/**
 * Header that sits on top of the checkins block of the profile page.
 *
 * ToDo: If not SELF, navigate to UserCheckins page instead
 */
class CheckinsHeader extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    self: false
  };

  render() {
    let { navigate } = this.props.navigation;
    return (
      <TouchableOpacity
        style={styles.seeAllBarMain}
        onPress={() => {
          if (this.props.self) {
            this.refs.analytics.sendData({
              "eventtime": new Date().getTime(),
              "action-type": "click",
              "target": "My Checkins",
              "starting-screen": "my-checkins",
              "starting-section": "header",
              "resulting-screen": "my-checkins", 
              "resulting-section": null
            });
            tracker.trackEvent("Click", "MyCheckins");
            navigate("MyCheckins",
            { 
              asurite: this.props.asurite,
              previousScreen: "my-checkins",
              previousSection: "header",
            });
          } else {
            this.refs.analytics.sendData({
              "eventtime": new Date().getTime(),
              "action-type": "click",
              "target": "User Checkins",
              "starting-screen": "user-checkins",
              "starting-section": "header",
              "resulting-screen": "user-checkins", 
              "resulting-section": null
            });
            tracker.trackEvent("Click", "UserCheckins");
            navigate("UserCheckins",
              { 
                asurite: this.props.asurite,
                previousScreen: "user-checkins",
                previousSection: "header",
              }
            );
          }
        }}
        accessibilityRole="button"
      >
        <Analytics ref="analytics" />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: responsiveWidth(60) }}>
            <Text style={[styles.seeAllBarTextLeft]}>CHECK-INS</Text>
          </View>
          <View
            style={{
              width: responsiveWidth(40),
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "flex-end"
            }}
          >
            <Text style={[styles.seeAllBarTextRight]}>SEE ALL</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={32}
              style={{ paddingRight: 20 }}
              color="#929292"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  seeAllBar: {
    flexDirection: "row"
  },
  seeAllBarMain: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f1f1",
    flexDirection: "row",
    height: responsiveHeight(10),
    borderBottomWidth: 0.5,
    // borderTopWidth: 0.5,
    borderColor: "#626262"
  },
  seeAllBarTextLeft: {
    fontSize: responsiveFontSize(2.0),
    paddingLeft: 20,
    color: "black"
  },
  seeAllBarTextRight: {
    fontSize: responsiveFontSize(2.0),
    color: "#696969"
  }
});
