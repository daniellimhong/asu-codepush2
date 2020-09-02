import React from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput
} from "react-native";
import { DefaultText as Text } from "../../presentational/DefaultText.js";
import {
  createMaterialTopTabNavigator,
  createAppContainer
} from "react-navigation";
import axios from "axios";
import PropTypes from "prop-types";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Auth, Api } from "../../../services";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { SingleUser } from "./SingleUser";
import { SettingsContext } from "../Settings/Settings";
import Search from "./Search";

/**
 * The screen for viewing all of your friends or requests
 *
 */

export class InviteFriends extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      invoker: ""
    };
  }

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "click",
      "target": "Invite Friends",
      "starting-screen": "friends",
      "starting-section": "friends-header-add-button", 
      "resulting-screen": "invite-friends", 
      "resulting-section": null
    });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        <SettingsContext.Consumer>
          {settings => (
            <View style={{ flex: 1 }}>
              <InviteNav
                screenProps={{
                  navigation: this.props.navigation,
                  invoker: settings.user
                }}
              />
            </View>
          )}
        </SettingsContext.Consumer>
      </View>
    );
  }
}

/**
 * All official friends. These users have accepted your friend request
 */
class MyClassRosterContent extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      curr_name: "",
      curr_id: 0,
      courses: [],
      curr_list: [],
      curr_index: 0,
      course_holder: [],
      loading: true,
      admin_settings: {}
    };
  }

  static defaultProps = {
    settings: {}
  };

  componentDidMount() {
    let { settings } = this.props;
    this.refs.analytics.sendData({
      "action-type": "click",
      "target": "Classes",
      "starting-screen": "invite-friends",
      "starting-section": "tab-bar", 
      "resulting-screen": "invite-friends", 
      "resulting-section": "classes-tab"
    });
    tracker.trackEvent("View", "InviteFriends_MyClassRoster");
    this.context
      .getTokens()
      .then(tokens => {
        if (tokens.username && tokens.username !== "guest") {
          // console.log(tokens);
          let payload = {
            type: "getMyClassesForced"
          };

          let apiService = new Api(
            "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
            tokens
          );

          apiService.post("/classes", payload).then(response => {
            // console.log("HERR",response);
            var courses = [];
            for (var i = 0; i < response.length; ++i) {
              courses.push({
                name: response[i].subject,
                id: response[i].class_nbr
              });
            }

            if (courses.length > 0) {
              this.setState({
                courses: courses,
                curr_name: courses[0].name,
                curr_id: courses[0].id,
                loading: true,
                ownerStudentStatus: tokens.roleList.indexOf("student") > -1
              });
              this.getCurrList();
            } else {
              this.setState({
                loading: false,
                ownerStudentStatus: tokens.roleList.indexOf("student") > -1
              });
            }
          });
        }
      })
      .catch(e => {
        console.log(e);
      });

    settings
      .getAdminSettings()
      .then(adminSettings => {
        if (adminSettings && adminSettings.roster) {
          this.setState({
            admin_settings: adminSettings,
            student_status: settings.student
          });
        }
      })
      .catch();
  }

  getCurrList() {
    this.context
      .getTokens()
      .then(tokens => {
        if (tokens.username && tokens.username !== "guest") {
          let payload = {
            type: "getRoster",
            course_nbr: this.state.curr_id
          };

          let apiService = new Api(
            "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
            tokens
          );

          apiService
            .post("/classes", payload)
            .then(response => {
              var asurites = [];
              var asuriteCheck = /^[a-z]+[0-9]*$/;

              var temp = this.state.course_holder.slice();

              for (var i = 0; i < response.length; ++i) {
                if (asuriteCheck.test(response[i].ASURITE)) {
                  asurites.push({ friend: response[i].ASURITE });
                }
              }

              asurites = asurites.sort(function(a, b) {
                if (a.friend < b.friend) return -1;
                if (a.friend > b.friend) return 1;
                return 0;
              });

              temp[this.state.curr_index] = asurites;

              this.setState({
                curr_list: asurites,
                loading: false,
                course_holder: temp,
                ownerStudentStatus: tokens.roleList.indexOf("student") > -1
              });
            })
            .catch(error => {
              console.log(error);
              throw error;
            });
        }
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    if (
      this.props.settings &&
      this.props.settings.student &&
      this.state.admin_settings.roster
    ) {
      return (
        <View style={{ flex: 1 }}>
          <Analytics ref="analytics" />
          <View
            style={[
              styles.classTitle,
              { flexDirection: "row", alignItems: "center" }
            ]}
          >
            <TouchableOpacity
              style={{ width: responsiveWidth(20) }}
              onPress={() => {
                this.refs.analytics.sendData({
                  "action-type": "click",
                  "target": "Classes - Back Arrow",
                  "starting-screen": "invite-friends",
                  "starting-section": "tab-bar", 
                  "resulting-screen": "invite-friends", 
                  "resulting-section": "classes-tab"
                });
                tracker.trackEvent("Click", "MyClassRoster_ChangeClassBack");
                this.changeClass("back");
              }}
              accessibilityLabel="Previous class"
              accessibilityRole="button"
            >
              <MaterialIcons
                name="keyboard-arrow-left"
                size={32}
                style={{ paddingLeft: 20 }}
                color="#929292"
              />
            </TouchableOpacity>
            <View style={{ width: responsiveWidth(60), alignItems: "center" }}>
              <Text style={[styles.classTitleText]}>
                {this.state.curr_name}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                width: responsiveWidth(20),
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "flex-end"
              }}
              onPress={() => {
                this.refs.analytics.sendData({
                  "action-type": "click",
                  "target": "Classes - Next Arrow",
                  "starting-screen": "invite-friends",
                  "starting-section": "tab-bar", 
                  "resulting-screen": "invite-friends", 
                  "resulting-section": "classes-tab"
                });
                tracker.trackEvent("Click", "MyClassRoster_ChangeClassNext");
                this.changeClass("next");
              }}
              accessibilityLabel="Next class"
              accessibilityRole="button"
            >
              <MaterialIcons
                name="keyboard-arrow-right"
                size={32}
                style={{ paddingRight: 20 }}
                color="#929292"
              />
            </TouchableOpacity>
          </View>
          {this.loadCourses()}
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Analytics ref="analytics" />
          <View
            style={[
              styles.classTitle,
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center"
              }
            ]}
          >
            <Text>No classes available</Text>
          </View>
        </View>
      );
    }
  }

  loadCourses() {
    if (this.state.loading) {
      return (
        <View style={{ flex: 1, padding: 30, backgroundColor: "white" }}>
          <Text
            style={{
              textAlign: "center",
              fontSize: responsiveFontSize(2),
              color: "black"
            }}
          >
            Loading
          </Text>
        </View>
      );
    } else {
      if (this.state.curr_list.length == 0) {
        return (
          <View style={{ flex: 1, padding: 30, backgroundColor: "white" }}>
            <Text
              style={{
                textAlign: "center",
                fontSize: responsiveFontSize(2),
                color: "black"
              }}
            >
              Roster not found
            </Text>
          </View>
        );
      } else {
        return (
          <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
            <FlatList
              data={this.state.curr_list}
              renderItem={this._renderFriend}
              keyExtractor={(item, index) => index.toString()}
            />
          </ScrollView>
        );
      }
    }
  }

  _renderFriend = ({ item }) => {
    const { navigate } = this.props.navigation;
    return (
      <SingleUser
        navigation={this.props.screenProps.navigation}
        ownerStudentStatus={this.state.ownerStudentStatus}
        asurite={item.friend}
        previousScreen={"invite-friends"}
        previousSection={null}
      />
    );
  };

  // <ClassRoster class_number={this.state.curr_id} />
  changeClass(type) {
    console.log("Made it in changeClass");

    var i = this.state.curr_index;
    var len = this.state.courses.length;

    if (type == "back" && i > 0) i--;
    else if (type == "back" && i == 0) i = len - 1;
    else if (type == "next" && i < len - 1) i++;
    else if (type == "back" && i == len - 1) i = 0;

    if (this.state.courses[i]) {
      if (this.state.course_holder[this.state.courses[i].id]) {
        this.setState({
          curr_name: this.state.courses[i].name,
          curr_id: this.state.courses[i].id,
          curr_index: i,
          curr_list: this.course_holder[this.state.courses[i].id],
          loading: false
        });
      } else {
        this.setState({
          curr_name: this.state.courses[i].name,
          curr_id: this.state.courses[i].id,
          curr_index: i,
          curr_list: [],
          loading: true
        });
        this.getCurrList();
      }
    }
  }
}

MyClassRosterContent.contextTypes = {
  getTokens: PropTypes.func,
  getAdminSettings: PropTypes.func
};

class MyClassRoster extends React.PureComponent {
  render() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <MyClassRosterContent {...this.props} settings={settings} />
        )}
      </SettingsContext.Consumer>
    );
  }
}

/**
 * Tab Nav on friends page
 */
const InviteNav = createAppContainer(
  createMaterialTopTabNavigator(
    {
      InviteFriendsDirectory: {
        screen: Search,
        navigationOptions: {
          title: "Directory Search"
        }
      },
      InviteFriendsClasses: {
        screen: MyClassRoster,
        navigationOptions: {
          title: "Classes"
        }
      }
    },
    {
      // tabBarComponent: createTabBarTop,
      tabBarPosition: "top",
      tabBarOptions: {
        activeTintColor: "#8C1B35",
        inactiveTintColor: "#696969",
        labelStyle: {
          fontSize: responsiveFontSize(2.0),
          fontWeight: "bold",
          paddingTop: 7,
          fontFamily: "Roboto"
        },
        style: {
          backgroundColor: "white",
          height: responsiveHeight(10),
          borderTopColor: "white"
        },
        indicatorStyle: {
          backgroundColor: "#8C1B35"
        }
      },
      lazy: true
    }
  )
);

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  image: {
    height: responsiveWidth(16),
    borderRadius: responsiveWidth(8),
    width: responsiveWidth(16),
    alignItems: "center",
    marginTop: 5
  },
  classTitle: {
    height: 75,
    backgroundColor: "#f2f2f2"
  },
  classTitleText: {
    fontSize: responsiveFontSize(3),
    color: "black",
    paddingTop: 0,
    textAlign: "center"
  },
  directoryButton: {},
  directoryUserInfoRow: {},
  directoryUserInfoRowTitle: {},
  directoryUserInfoRowContent: {}
});

function objectsAreSame(x, y) {
  var objectsAreSame = true;
  for (var propertyName in x) {
    if (x[propertyName] !== y[propertyName]) {
      objectsAreSame = false;
      break;
    }
  }
  return objectsAreSame;
}
