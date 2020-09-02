import React, { PureComponent } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  FlatList,
  Text
} from "react-native";
import _ from "lodash";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Analytics from "../analytics";
import { Events } from "./index";
import { SettingsContext } from "../../achievement/Settings/Settings";
import EventsFilter, {
  EventsSearch,
  EventsFilterContext
} from "./Filter/EventsFilter";
import { generateEventKey } from "./utility";
import EventPreview from "./EventPreviewFunc";

class EventsOrRecommendContent extends PureComponent {
  waitForRender = false;

  static defaultProps = {
    searchedEvents: []
  };

  componentDidMount = () => {    
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null,
      "target": "Events",
      "resulting-screen": "events-list",
      "resulting-section": null,
    });
  };

  headlineHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>Events</Text>
        <Text style={styles.headerBlurb}>Current and Upcoming</Text>
      </View>
    );
  };

  contextFilter = events => {
    const { context } = this.props;

    if (events) {
      return events.filter(rawEvent => {
        const event = _.get(rawEvent, "_source");

        if (context.filter !== "all") {
          if (!event.campus || event.campus[0] !== context.filter) {
            return false;
          }
        }
        if (!context.showClubs) {
          if (event.org_id) {
            return false;
          }
        }
        return true;
      });
    } else {
      return [];
    }
  };

  _showEmptyListView = () => {
    const { searching } = this.props;
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginTop: 30
        }}
      >
        {searching ? (
          <ActivityIndicator size="large" animating color="maroon" />
        ) : (
          <Text>Sorry but no events meet the search criteria</Text>
        )}
      </View>
    );
  };

  _renderItem = ({ item, index }) => {
    const { navigation } = this.props;
    const data = _.get(item, "_source");
    return (
      <View style={index % 5 === 0 ? { marginTop: 20 } : {}}>
        <EventPreview
          itemIndex={index}
          navigation={navigation}
          data={data}
          displayType="full"
          previousScreen={this.props.previousScreen?this.props.previousScreen:this.props.navigation.state.params.previousScreen}
          previousSection={this.props.previousSection?this.props.previousSection:this.props.navigation.state.params.previousSection} 
        />
      </View>
    );
  };

  render() {
    const { searchedEvents, searchString, navigation, context } = this.props;
    if (
      (searchString && searchString.length) ||
      (context && context.filter && context.filter !== "all")
    ) {
      return (
        <View style={{ flex: 1, backgroundColor: "#e8e8e8" }}>
          <Analytics ref="analytics" />
          <FlatList
            style={{ backgroundColor: "white" }}
            data={this.contextFilter(searchedEvents)}
            renderItem={this._renderItem}
            ListEmptyComponent={() => <View>{this._showEmptyListView()}</View>}
          />
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        <Events
          context={context}
          feedId="events"
          ListHeaderComponent={() => (
            <RecommendedSection context={context} navigation={navigation} />
          )}
          navigation={navigation}
          showHeader={this.headlineHeader()}
        />
      </View>
    );
  }
}

export default class EventsOrRecommend extends PureComponent {
  render() {
    return (
      <EventsFilter>
        <EventsFilterContext.Consumer>
          {context => (
            <EventsSearch.Consumer>
              {evts => (
                <EventsOrRecommendContent
                  {...this.props}
                  context={context}
                  searchedEvents={evts.searchedEvents}
                  searchString={evts.searchString}
                  searching={evts.searching}
                />
              )}
            </EventsSearch.Consumer>
          )}
        </EventsFilterContext.Consumer>
      </EventsFilter>
    );
  }
}

function RecommendedSection(props) {
  const { context } = props;
  const recommendedHeader = () => {
    return (
      <View
        style={{
          padding: responsiveWidth(4),
          marginTop: responsiveHeight(2)
        }}
      >
        <Text style={styles.headerText}>Recommended For You</Text>
      </View>
    );
  };
  if (context && context.filter !== "all") {
    return null;
  }
  return (
    <SettingsContext.Consumer>
      {settings => (
        <Events
          feedId="recommended"
          minify
          ListHeaderComponent={() => recommendedHeader()}
          navigation={props.navigation}
          limit={1}
          // roles={["alumni"]}
          roles={settings.roles}
        />
      )}
    </SettingsContext.Consumer>
  );
}

let styles = StyleSheet.create({
  header: {
    marginVertical: 5,
    backgroundColor: "white",
    padding: responsiveWidth(4),
    paddingVertical: responsiveWidth(6)
  },
  headerText: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  headerBlurb: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: "100",
    fontFamily: 'Roboto',
  }
});
