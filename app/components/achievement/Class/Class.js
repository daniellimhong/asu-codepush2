/* eslint-disable react/destructuring-assignment */
import React from "react";
import {
  View,
  ScrollView,
  StyleSheet
  // WebView as WKWebView
} from "react-native";
import PropTypes from "prop-types";
import moment from "moment";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

import Analytics from "../../functional/analytics";
import { DefaultText as Text } from "../../presentational/DefaultText";
import { InfoBlock } from "../Profile/blocks/InfoBlock";
import { LinkBlock } from "../Profile/blocks/LinkBlock";
import { ProfessorProfile } from "./ProfessorProfile";
import { CanvasContext } from "../../functional/authentication/canvas_context/CanvasContext";
import { CanvasModal } from "../../functional/schedule/components/CanvasModal";
import { CanvasNotif } from "./CanvasNotif";
import { ClassTop } from "./ClassTop";
import TransitionView from "../../universal/TransitionView";
import {
  configDates,
  setClassDetails,
  courseResourceDetails,
  parseText
} from "./utility";
import { Api } from "../../../services";

export class ClassX extends React.PureComponent {
  static defaultProps = {
    course_title: null,
    meeting_patterns: null,
    class_nbr: null,
    course_url: null,
    slack_url: null,
    location: null,
    navigation: null
  };

  static navigationOptions = () => ({
    header: () => {
      return null;
    }
  });

  canvasResource = {
    id: "canvas",
    img: "circle-o-notch",
    url: this.props.course_url,
    text: "Canvas",
    bgColor: "#e43c30",
    imgUrl:
      "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/profile-images/icons/canvas@2x.png",
    useImgUrl: true
  };

  slackResource = {
    id: "slack",
    img: "circle-o-notch",
    url: this.props.slack_url,
    text: "Slack",
    bgColor: "#e43c30",
    imgUrl:
      "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/profile-images/icons/slack@2x.png",
    useImgUrl: true
  };

  constructor(props) {
    super(props);
    this.state = {
      title: this.props.course_title ? this.props.course_title : "",
      location: this.props.location ? this.props.location : "",
      season_string: "",
      meeting_string: "",
      time_string: "",
      num_students: null,
      asurite: "",
      class_schedule: [],
      class_count: null,
      courseTeachers: null,
      profilePicUrl: "",
      announcements: [],
      events: [],
      assignments: [],
      quizzes: [],
      displayCanvasNotif: false,
      displayCanvasModal: false,
      loadedTeachers: false
    };
  }

  componentDidMount = () => {
    this.getData();
    configDates(this);
    setClassDetails(this);
  };

  parseCourseNum = url => {
    if (!url || !url.includes("https://asu.instructure.com/courses/")) {
      console.log(
        "course url is falsey or malformed, and doesn't support canvas."
      );
      return null;
    } else {
      return url.replace("https://asu.instructure.com/courses/", "");
    }
  };

  getData = () => {
    console.log("within get data");
    this.context.getTokens().then(tokens => {
      if (tokens.username && tokens.username !== "guest") {
        console.log("course_url", this.props.course_url);
        const payload = {
          course_id: this.parseCourseNum(this.props.course_url)
        };
        const apiService = new Api(
          "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
          tokens
        );
        try {
          apiService.post("/canvas/data", payload).then(response => {
            console.log(response);
            if (!response.errorMessage) {
              this.setState({ displayCanvasNotif: false });
              const parsedAnnouncements = response.announcements.map(item => {
                const result = {
                  date: moment(item.posted_at).format("MM-DD-YYYY"),
                  text: parseText(item.message),
                  id: item.id,
                  title: item.title,
                  itemTitle: item.title,
                  url: item.url,
                  posted_at: item.posted_at
                };
                return result;
              });
              this.setState({ announcements: parsedAnnouncements });

              const parsedEvents = response.events.map(item => {
                const date = moment(item.start_at).format("MM-DD-YYYY");
                const result = {
                  date,
                  text: parseText(item.description),
                  id: item.id,
                  title: item.title,
                  itemTitle: item.title,
                  location_name: item.location_name,
                  location_address: item.location_address,
                  all_day: item.all_day,
                  start_at: item.start_at,
                  url: item.html_url
                };
                return result;
              });
              this.setState({ events: parsedEvents });

              const parsedAssignments = response.assignments.map(item => {
                const date = moment(item.due_at).format("MM-DD-YYYY");
                const result = {
                  date: date === "Invalid date" ? "Not Specified" : date,
                  text: parseText(item.name),
                  id: item.id,
                  title: item.name,
                  itemTitle: item.name,
                  url: item.html_url
                };
                return result;
              });
              this.setState({ assignments: parsedAssignments });

              const parsedQuizzes = response.quizzes.map(item => {
                const date = moment(item.due_at).format("MM-DD-YYYY");
                const result = {
                  date: date === "Invalid date" ? "Not Specified" : date,
                  text: parseText(item.title),
                  id: item.id,
                  title: item.title,
                  itemTitle: item.title,
                  url: item.mobile_url
                };
                return result;
              });
              this.setState({ quizzes: parsedQuizzes });

              this.setState({
                courseTeachers: response.teachers,
                loadedTeachers: true
              });
              this.teacherProfilePic();
            } else {
              this.setState({ displayCanvasNotif: true });
            }
          });
        } catch (err) {
          this.setState({ displayCanvasNotif: true });
        }
      }
    });
  };

  teacherProfilePic = () => {
    // Returning null for dev purposes - will refactor to pull profile pic from iSearch api...
    return null;
    // Profile pic of Leslie Knowpe for testing purposes:
    // return "https://amp.businessinsider.com/images/5824aa9046e27a1c008b5eec-750-563.jpg";
  };

  teacherName = () => {
    if (this.state.courseTeachers) {
      return this.state.courseTeachers[0].user.short_name;
    } else {
      return null;
    }
  };

  teacherAsurite = () => {
    if (this.state.courseTeachers) {
      return this.state.courseTeachers[0].user.login_id;
    } else {
      return null;
    }
  };

  teacherLocation = () => {
    // At the moment, location is hardcoded because I can't find it through canvas
    return null;
  };

  teacherPhone = () => {
    // At the moment, phone is hardcoded because I can't find it through canvas
    return null;
  };

  // renderWebView = () => {
  //   return (
  //     <View style={{ flex: 1, overflow: "hidden" }}>
  //       {this.state.loading && (
  //         <ActivityIndicator
  //           style={styles.activityIndicator}
  //           size="large"
  //           color="#8C1D40"
  //         />
  //       )}
  //       <WKWebView
  //         source={{ uri: CANVAS_URL }}
  //         style={styles.webview}
  //         onNavigationStateChange={navState =>
  //           onNavigationStateChange(this, navState)
  //         }
  //         scrollEnabled={false}
  //         onLoad={() => this.setState({ loading: false })}
  //       />
  //     </View>
  //   );
  // };

  whitelistCourseDetails = () => {
    const resources = courseResourceDetails(this);
    resources.splice(1, 0, this.canvasResource);
    if (this.props.slack_url && this.props.slack_url !== "") {
      resources.splice(1, 0, this.slackResource);
    }
    return resources;
  };

  onPressHandler = () => this.setState({ displayCanvasModal: false });

  render() {
    return (
      <ScrollView style={{ flex: 1 }}>
        <Analytics ref="analytics" />

        <TransitionView index={0} duration={2000}>
          <ClassTop
            title={this.state.title}
            season={this.state.season_string}
            meeting_string={this.state.meeting_string}
            time_string={this.state.time_string}
            location={this.state.location}
          />
        </TransitionView>

        <TransitionView index={1}>
          <View style={[styles.infoBlock]}>
            {this.state.num_students > 0 ? (
              <View
                accessible
                style={{
                  flex: 1,
                  borderRightWidth: 1,
                  borderStyle: "solid",
                  borderColor: "#61636f"
                }}
              >
                <TransitionView index={0} animation="fadeInLeft">
                  <Text style={[styles.blockInfo, { fontWeight: "bold", fontFamily: "Roboto" }]}>
                    {this.state.num_students}
                  </Text>
                  <Text style={[styles.blockInfo]}>STUDENTS</Text>
                </TransitionView>
              </View>
            ) : (
              <View
                accessible
                style={{
                  flex: 1,
                  borderRightWidth: 1,
                  borderStyle: "solid",
                  borderColor: "#61636f"
                }}
              />
            )}

            {this.state.class_count > 0 ? (
              <View accessible style={{ flex: 1 }}>
                <TransitionView index={3} animation="fadeInRight">
                  <Text style={[styles.blockInfo, { fontWeight: "bold", fontFamily: "Roboto"}]}>
                    {this.state.class_count}/{this.state.class_schedule.length}
                  </Text>
                  <Text style={[styles.blockInfo]}>CLASSES</Text>
                </TransitionView>
              </View>
            ) : null}
          </View>
        </TransitionView>

        {/* PROFESSOR INFORMATION */}
        {this.state.loadedTeachers ? (
          <TransitionView index={2}>
            <ProfessorProfile
              navigation={this.props.navigation}
              ownerAsurite={this.state.asurite}
              name={this.teacherName()}
              asurite={this.teacherAsurite()}
              phone={this.teacherPhone()}
              location={this.teacherLocation()}
              image={this.state.profilePicUrl}
              previousScreen="class-profile"
              previousSection="professor-profile"
              course_id={this.props.course_id}
            />
          </TransitionView>
        ) : null}

        {/* If user isn't authenticated for canvas, display this notification */}
        {this.state.displayCanvasNotif ? (
          <TransitionView index={3}>
            <CanvasNotif this={this} />
          </TransitionView>
        ) : null}

        {/* If user asks to authenticate canvas, display this modal */}
        <CanvasModal
          displayCanvasModal={this.state.displayCanvasModal}
          onPressHandler={this.onPressHandler}
          parent={this}
        />

        <TransitionView index={4}>
          <View
            style={{
              backgroundColor: "#ededed",
              minHeight: responsiveHeight(46)
            }}
          >
            {/* COURSE RESOURCES BLOCK */}
            <TransitionView index={5}>
              <LinkBlock
                // details={courseResourceDetails(this)}
                details={this.whitelistCourseDetails()}
                roles={this.state.roles}
                title="Course Resources"
                id="Class_CourseResources"
                previousScreen="class-profile"
                previousSection="course-resources"
                course_id={this.props.course_id}
                asurite={this.props.asurite}
                ownerAsurite={this.state.asurite}
                navigation={this.props.navigation}
              />
            </TransitionView>

            {/* ANNOUNCEMENTS BLOCK */}
            {
              <TransitionView index={6}>
                <InfoBlock
                  details={this.state.announcements}
                  roles={this.state.roles}
                  title="Announcements"
                  titleIcon="announcements@2x.png"
                  id="Class_Announcements"
                  asurite={this.state.asurite}
                  previousScreen="class-profile"
                  previousSection="announcements"
                  course_id={this.props.course_id}
                  navigation={this.props.navigation}
                />
              </TransitionView>
            }

            {/* EVENTS BLOCK */}
            {
              <TransitionView index={7}>
                <InfoBlock
                  details={this.state.events}
                  roles={this.state.roles}
                  title="Events"
                  titleIcon="events@2x.png"
                  id="Class_Events"
                  asurite={this.state.asurite}
                  previousScreen="class-profile"
                  previousSection="events"
                  course_id={this.props.course_id}
                  navigation={this.props.navigation}
                />
              </TransitionView>
            }

            {/* ASSIGNMENTS BLOCK */}
            {
              <TransitionView index={7}>
                <InfoBlock
                  details={this.state.assignments}
                  roles={this.state.roles}
                  title="Assignments"
                  titleIcon="assignment@2x.png"
                  id="Class_Assignments"
                  asurite={this.state.asurite}
                  previousScreen="class-profile"
                  previousSection="assignments"
                  course_id={this.props.course_id}
                  navigation={this.props.navigation}
                />
              </TransitionView>
            }

            {/* QUIZZES BLOCK */}
            {
              <TransitionView index={7}>
                <InfoBlock
                  details={this.state.quizzes}
                  roles={this.state.roles}
                  title="Quizzes"
                  titleIcon="quiz@2x.png"
                  id="Class_Quizzes"
                  asurite={this.state.asurite}
                  previousScreen="class-profile"
                  previousSection="quizzes"
                  course_id={this.props.course_id}
                  navigation={this.props.navigation}
                />
              </TransitionView>
            }
          </View>
        </TransitionView>
      </ScrollView>
    );
  }
}

// ==========
// Context:
// ==========

ClassX.contextTypes = {
  getTokens: PropTypes.func,
  getAdminSettings: PropTypes.func
};

export const Class = props => (
  <CanvasContext.Consumer>
    {context => {
      return <ClassX {...props} context={context} />;
    }}
  </CanvasContext.Consumer>
);

// =============
// StyleSheet:
// =============

export const styles = StyleSheet.create({
  infoBlock: {
    backgroundColor: "#25262a",
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 10
  },
  blockInfo: {
    color: "white",
    textAlign: "center",
    fontSize: responsiveFontSize(1.8)
  },
  activityIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center"
  },
  webview: {
    height: responsiveHeight(30),
    width: responsiveWidth(75),
    backgroundColor: "transparent"
  }
});
