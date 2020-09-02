import React, { Component } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Text
} from "react-native";
import { HeaderQuick } from "../../achievement/Header/HeaderQuick";
import Icon from "react-native-vector-icons/MaterialIcons";
import _ from "lodash";
import PropTypes from "prop-types";
import Analytics from "./../analytics";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu";
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";
import { AppSyncComponent } from "../authentication/auth_components/appsync/AppSyncApp";
import {
  mergeAcademicWithEvents,
  shouldRefreshScheduleDays,
  shouldRefreshScheduleOnline
} from "./components/utility";
import { ScheduleList } from "./components/ScheduleList";
import { refreshAppTargets } from "../../achievement/CoreFeature/utility";
import {
  getAcademicSchedule,
  getEventSchedule,
  AcademicScheduleQuery,
  AllEventFlatQuery,
  saveEvent,
  getReminders,
  removeReminder
} from "../../../Queries";
import {
  getCustomCalEvents,
  getSavedCalendars,
  GetAllCustomCalEvents,
  GetSavedCalendars
} from "./components/ModalHelpers/gql/queries";
import { SettingsContext } from "../../achievement/Settings/Settings";
import { ErrorWrapper } from "../error/ErrorWrapper";
import { findEventsPostQuery } from "./components/ModalHelpers/gql/utility";

class ScheduleX extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingError: false,
      showManageCal: false,
      dataLoaded: false,
      startTime_var: "start_time",
      title_var: "course_title",
      scheduleList: [],
      onlineClasses: [],
      resetNum: 0
    };
  }
  static defaultProps = {
    saveEvent: () => null,
    attendees: [],
    academicSchedule: [],
    eventSchedule: [],
    reminders: [],
    limit: null
  };

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "view",
      "starting-screen": this.props.previousScreen?this.props.previousScreen:
          (this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null),
      "starting-section": this.props.previousSection?this.props.previousSection:
          (this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null),
      "target":"Schedule List",
      "resulting-screen": "schedule-list",
      "resulting-section": null
    });
    findEventsPostQuery(this.props.phoneCal)
      .then(resp => {
        this.buildSchedule(
          this.props.academicSchedule,
          this.props.eventSchedule,
          this.props.customCal,
          resp
        );
      })
      .catch(err => {
        this.buildSchedule(
          this.props.academicSchedule,
          this.props.eventSchedule,
          this.props.customCal,
          []
        );
      }
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.loadingError) {
      findEventsPostQuery(this.props.phoneCal)
        .then(resp => {
          this.buildSchedule(
            this.props.academicSchedule,
            this.props.eventSchedule,
            this.props.customCal,
            resp
          );
        })
        .catch(err => {
          this.buildSchedule(
            this.props.academicSchedule,
            this.props.eventSchedule,
            this.props.customCal,
            []
          );
        });
    }
  }

  buildSchedule(academicSchedule, eventSchedule, customCal, phoneCal) {
    try {
      let scheduleData = mergeAcademicWithEvents(
        academicSchedule,
        eventSchedule,
        customCal,
        phoneCal
      );

      let refresh = shouldRefreshScheduleDays(
        scheduleData.scheduleList,
        this.state.scheduleList
      );
      let refreshOnline = shouldRefreshScheduleOnline(
        scheduleData.onlineClasses,
        this.state.onlineClasses
      );

      if (refresh || refreshOnline) {
        this.setState({
          ...scheduleData,
          processing: false,
          dataLoaded: true,
          resetNum: this.state.resetNum + 1
        });
      }
    } catch (e) {
      console.log(e);
      this.setState({
        loadingError: true,
        dataLoaded: false,
        processing: false,
        scheduleList: []
      });
    }
  }

  resetManageCal = () => {
    this.setState({
      showManageCal: false
    });
  };

  // right={
  //   <Menu>
  //     <MenuTrigger>
  //       <Icon name="more-vert" size={30} color="#464646" />
  //     </MenuTrigger>
  //     <MenuOptions>
  //       <MenuOption
  //         onSelect={() => {this.setState({showManageCal: true});}}
  //       >
  //         <Text
  //           style={{
  //             fontSize: responsiveFontSize(1.4),
  //             margin: 5
  //           }}
  //         >
  //           Manage Calendar
  //         </Text>
  //       </MenuOption>
  //       <MenuOption
  //         onSelect={() => console.log("Hit searcg")}
  //       >
  //         <Text
  //           style={{
  //             fontSize: responsiveFontSize(1.4),
  //             margin: 5,
  //             marginTop: 0
  //           }}
  //         >
  //           Search
  //         </Text>
  //       </MenuOption>
  //
  //     </MenuOptions>
  //   </Menu>
  // }

  shouldShowHeader = limit => {
    if (limit) {
      return null;
    } else {
      return (
        <HeaderQuick navigation={this.props.navigation} title="Schedule" />
      );
    }
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.shouldShowHeader(this.props.limit)}
        <Analytics ref="analytics" />
        <ScheduleList
          storedLocalNotifications={this.props.reminders}
          limit={this.props.limit}
          loadingError={this.state.loadingError}
          scheduleList={this.state.scheduleList}
          resetNum={this.state.resetNum}
          onlineClasses={this.state.onlineClasses}
          previousScreen={this.props.previousScreen?this.props.previousScreen:
            ((this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null))}
          previousSection={this.props.previousSection?this.props.previousSection:
            (this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null)}
          navigation={this.props.navigation}
          attendees={this.props.attendees}
          showManageCal={this.state.showManageCal}
          phoneCal={this.props.phoneCal}
          closeModal={this.resetManageCal.bind(this)}
          roles
        />
      </View>
    );
  }
}

export const Schedule = AppSyncComponent(
  ScheduleX,
  getAcademicSchedule,
  getEventSchedule,
  getCustomCalEvents,
  getSavedCalendars,
  saveEvent,
  getReminders,
  removeReminder
);

/**
 * Basic schedule wrapper to allow for pull to refresh
 */
class SchedulePageContent extends React.Component {
  state = {
    refreshing: false
  };

  render() {
    return (
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={async () => {
              try {
                this.setState({
                  refreshing: true
                });
                refreshAppTargets(this.context, {
                  queries: [
                    {
                      query: AcademicScheduleQuery
                    },
                    {
                      query: AllEventFlatQuery
                    },
                    {
                      query: GetAllCustomCalEvents
                    },
                    {
                      query: GetSavedCalendars
                    }
                  ]
                })
                  .then(resp => {
                    this.setState({
                      refreshing: false
                    });
                  })
                  .catch(e => {
                    this.setState({
                      refreshing: false
                    });
                  });
              } catch (e) {
                this.setState({
                  refreshing: false
                });
              }
            }}
          />
        }
      >
        <Schedule navigation={this.props.navigation} {...this.props} />
      </ScrollView>
    );
  }
}

SchedulePageContent.contextTypes = {
  AppSyncClients: PropTypes.object
};

export class SchedulePage extends React.Component {
  render() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <ErrorWrapper>
            <SchedulePageContent {...this.props} roles={settings.roles} />
          </ErrorWrapper>
        )}
      </SettingsContext.Consumer>
    );
  }
}
