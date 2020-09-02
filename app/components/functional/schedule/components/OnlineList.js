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
import _ from "lodash";
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import PropTypes from "prop-types";
import ListSeperator from "../../../universal/list-seperator/index";
import ListSeperatorNewUI from "../../../universal/list-seperator/newUI";
import Analytics from "../../analytics";
import { tracker } from "../../../achievement/google-analytics.js";
import { HeaderQuick } from "../../../achievement/Header/HeaderQuick";
import { EventCheckinButton } from "../../../achievement/Checkins/CheckinButton";
import { CheckinCount } from "../../../achievement/Checkins/CheckinCount";
import { SectionHeader } from "./ModalHelpers/SectionHeader";
import { SingleSchedule } from "./SingleSchedule";
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";
import { DefaultText as Text } from "../../../presentational/DefaultText.js";

export class OnlineList extends React.PureComponent {
  static defaultProps = {
    onlineClasses: []
  };

  renderOnlineClassList() {
    return this.props.onlineClasses.map(item => {
      // console.log("ONLINE ITME", item);
      return (
        <View elevation={2} style={[styles.itemBody, { flexDirection: "row" }]}>
          <View style={{ flex: 1, backgroundColor: "#2aacf9" }} />
          <View style={{ backgroundColor: "#FFF", flex: 100, padding: 5 }}>
            <SingleSchedule item={item}
                  navigation={this.props.navigation}
                  previousScreen={this.props.previousScreen}
                  previousSection={this.props.previousSection}/>
          </View>
        </View>
      );
    });
  }
  renderOnlineClasses() {
    var info = {
      title: "Online Classes"
    };
    if (this.props.onlineClasses.length > 0) {
      // console.log("ONLINE LENGTH GREATER THAN 1", this.props.onlineClasses);

      let myData = [
        {
          title: "Online Classes",
          day: new Date().getTime(),
          data: this.props.onlineClasses
        }
      ];

      return (
        <SectionList
          sections={myData}
          listKey="onlineClasses"
          renderSectionHeader={({ section }) => (
            <SectionHeader section={info} showButton={false} />
          )}
          renderItem={({ item, index, section }) => {
            return (
              <View
                elevation={2}
                style={[styles.itemBody, { flexDirection: "row" }]}
              >
                <View style={{ flex: 1, backgroundColor: "#2aacf9" }} />
                <View
                  style={{ backgroundColor: "#FFF", flex: 100, padding: 5 }}
                >
                  <SingleSchedule
                    canvasAuthorized={this.props.canvasAuthorized}
                    setCanvasAuthorized={this.props.setCanvasAuthorized}
                    item={item}
                    navigation={this.props.navigation}
                    previousScreen={this.props.previousScreen}
                    previousSection={this.props.previousSection}
                  />
                </View>
              </View>
            );
          }}
          keyExtractor={(item, index) => item.className + index}
          ItemSeparatorComponent={() => <ListSeperatorNewUI />}
        />
      );
    } else {
      return null;
    }
  }
  render() {
    return <View>{this.renderOnlineClasses()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    backgroundColor: "#F4F4F4",
    marginBottom: 10
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
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  timeRemaining: {
    color: "#999999"
  },
  itemBody: {
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: "#FFF",
    shadowColor: "#d9d9d9",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 3,
    shadowOpacity: 1.0
  },
  lastItemBody: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#FFF"
  },
  titleBlock: {
    justifyContent: "space-between",
    flex: 2
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
    marginVertical: 15
  },
  eventTitle: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(1.8)
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
    width: responsiveHeight(3.5),
    height: responsiveHeight(3.5),
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
