import React from "react";
import {
  View,
  Image,
  ImageBackground,
  Dimensions,
  Keyboard,
  AsyncStorage,
  TextInput,
  Button,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  SectionList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking
} from "react-native";
import { Api, Auth, User } from "../../../../services";
import axios from "axios";
import moment from "moment";
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import PropTypes from "prop-types";
import ListSeperator from "../../../universal/list-seperator/index";
import Analytics from "../../analytics";
import { tracker } from "../../../achievement/google-analytics.js";
import { HeaderQuick } from "../../../achievement/Header/HeaderQuick";
import { EventCheckinButton } from "../../../achievement/Checkins/CheckinButton";
import { CheckinCount } from "../../../achievement/Checkins/CheckinCount";
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";
import { DefaultText as Text } from "../../../presentational/DefaultText.js";

export class EmptySchedule extends React.PureComponent {
  static defaultProps = {
    loadingError: false,
    scheduleList: []
  };
  render() {
    let { loadingError, scheduleList, navigation } = this.props;
    if (loadingError) {
      return <Text>There was an error in fetching schedule</Text>;
    } else {
      return (
        <View style={styles.blankSchedule}>
          <Analytics ref="analytics" />
          <View style={{ marginBottom: 20 }}>
            <Icon name={"calendar"} size={100} color="#c7c7c7" />
          </View>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", fontFamily: "Roboto", fontSize: 25 }}>
              It looks like your schedule is empty.
            </Text>
          </View>
          <View style={{ marginBottom: 30, alignSelf: "center" }}>
            <Text style={{ textAlign: "center" }}>
              Add events to your schedule by clicking the calendar icon next to any
              event.
            </Text>
          </View>
          <TouchableWithoutFeedback
            onPress={() => {
              navigation.navigate("Events",{
                previousScreen:"schedule-list",
                previousSection:"explore-events",
                target:"Explore Events"
              });
            }}
            accessible={true}
            accessibilityRole="button"
          >
            <View>
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
                <Text style={{ color: "#D40546", fontSize: 15 }}>
                  Explore Events
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    backgroundColor: "#FFF"
  },
  SectionHeaderStyle: {
    flex: 1,
    width: undefined,
    height: 40,
    backgroundColor: "#E2E2E2",
    justifyContent: "center",
    marginBottom: 10,
    padding: 10
  },
  SectionHeaderText: {
    fontSize: 17,
    padding: 5,
    color: "#000",
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  SectionHeaderIcon: {
    alignItems: "center"
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  timeRemaining: {
    color: "#999999",
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(2)
  },
  itemBody: {
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    backgroundColor: "#FFF"
  },
  lastItemBody: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#FFF"
  },
  titleBlock: {
    // justifyContent: 'space-between',
    width: responsiveWidth(60)
  },
  eventTitle: {
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  timeBlock: {
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  locationText: {
    color: "#939393"
  },
  locationCircle: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
    width: 25,
    height: 25,
    backgroundColor: "#8A1E41",
    borderRadius: 25
  },
  favoriteRow: {
    flexDirection: "row",
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
  errorMessage: {
    color: "maroon",
    fontSize: 20
  },
  loadButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    alignSelf: "center",
    width: 200,
    height: 50,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#D40546",
    marginTop: 5,
    marginBottom: 15
  },
  onlineItemBody: {
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    backgroundColor: "#FFF",
    borderBottomColor: "#D3D3D3",
    borderBottomWidth: 1
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
  }
});
