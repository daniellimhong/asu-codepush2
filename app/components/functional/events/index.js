import React, { Component, PureComponent } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  FlatList
} from "react-native";
import _ from "lodash";
import { responsiveWidth } from "react-native-responsive-dimensions";
import Analytics from "../analytics";
import { getEvents } from "../../../Queries";
import { formatRawEvent as formatIt, generateEventKey } from "./utility";
import { AppSyncComponent } from "../authentication/auth_components/appsync/AppSyncApp";
import { ErrorWrapper } from "../error/ErrorWrapper";
import { EventsFilterContext } from "./Filter/EventsFilter";

import EventPreview from "./EventPreview";

class EventsX extends Component {
  page = 0;

  static defaultProps = {
    feedId: null,
    minify: false, // Minify Event Preview Items
    shrink: false, // Shrink the whole think
    client: {},
    limit: null,
    events: [],
    roles: null,
    navigationOverride: null,
    showHeader: null,
    more: () => null,
    refresh: () => Promise.resolve()
  };

  componentDidMount = () => {    
    if(this.props.isHome){
      this.refs.analytics.sendData({
        "action-type": "view",
        "starting-screen": "Home",
        "starting-section": "events",
        "target": this.props.target?this.props.target:"Events",
        "resulting-screen": "events-list",
        "resulting-section": null,
      });
    } else {
      this.refs.analytics.sendData({
        "action-type": "view",
        "starting-screen": (this.props.navigation.state.params && this.props.navigation.state.params.previousScreen)?
          this.props.navigation.state.params.previousScreen:null,
        "starting-section": (this.props.navigation.state.params && this.props.navigation.state.params.previousSection)?
          this.props.navigation.state.params.previousSection:null,
        "target": this.props.target?this.props.target:"Events",
        "resulting-screen": "events-list",
        "resulting-section": null,
      });
    }
  };

  contextFilter = events => {
    const { context } = this.props;
    if (!context) {
      return events;
    }

    if (events) {
      return events.filter(event => {
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

  _renderItem = ({ item, index }) => {
    const { minify, navigation } = this.props;
    return (
      <View style={index % 5 === 0 ? { marginTop: 20 } : {}}>
        <EventPreview
          key={generateEventKey(item)}
          minify={minify}
          itemIndex={index}
          navigation={navigation}
          data={item}
          displayType="full"
          previousScreen={this.props.previousScreen?this.props.previousScreen:"events"}
          previousSection={this.props.previousSection?this.props.previousSection:null} 
        />
      </View>
    );
  };

  _loadMore = () => {
    const { context, loadMore } = this.props;
    const searchString = _.get(context, "searchString");

    if (!searchString) {
      loadMore({
        variables: {
          page: ++this.page
        },
        updateQuery: (prev, more) => {
          const res = {
            ...prev,
            getEvents: [...prev.getEvents]
          };

          const moreEvents = _.get(more, "fetchMoreResult.getEvents");

          if (Array.isArray(moreEvents) && moreEvents.length) {
            res.getEvents = res.getEvents.concat(moreEvents);
          }
          return res;
        }
      });
    }
  };

  _renderListHeader = () => {
    const { ListHeaderComponent, showHeader } = this.props;
    if (ListHeaderComponent || showHeader) {
      return (
        <View style={{ backgroundColor: "#e8e8e8" }}>
          {ListHeaderComponent ? (
            <View style={{ backgroundColor: "white", marginTop: 3 }}>
              <ListHeaderComponent />
            </View>
          ) : null}
          {showHeader || null}
        </View>
      );
    } else {
      return null;
    }
  };

  _showEmptyListView = () => {
    const { context } = this.props;
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          width: responsiveWidth(100),
          paddingVertical: 30
          // backgroundColor: "black"
        }}
      >
        {context && context.filter !== "all" ? (
          <Text>Sorry, but no events match the search criteria</Text>
        ) : (
          <ActivityIndicator size="large" animating color="maroon" />
        )}
      </View>
    );
  };

  render() {
    const {
      feedId,
      events,
      limit,
      navigation,
      roles,
      navigationOverride
    } = this.props;
    if (
      (Array.isArray(roles) && !roles.length) ||
      (Array.isArray(roles) && roles.length && limit && !events.length)
    ) {
      return (
        <View>
          <Analytics ref="analytics" />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        <FlatList
          style={{ backgroundColor: "white" }}
          data={
            limit && Array.isArray(events)
              ? events.slice(0, limit)
              : this.contextFilter(events)
          }
          renderItem={this._renderItem}
          keyExtractor={(item, index) => generateEventKey(item, feedId, index)}
          ListHeaderComponent={this._renderListHeader()}
          ListEmptyComponent={this._showEmptyListView()}
          onEndReached={() => {
            if (!limit) {
              this._loadMore();
            }
          }}
          onEndReachedThreshold={0.3}
        />
        <View style={{ backgroundColor: "white" }}>
          {limit && events && events.length ? (
            <TouchableOpacity
              onPress={() => {
                // eslint-disable-next-line no-unused-expressions
                this.refs.analytics.sendData({
                  "action-type": "click",
                  "starting-screen": this.props.previousScreen?this.props.previousScreen:"events",
                  "starting-section": this.props.previousSection?this.props.previousSection:null, 
                  "target":(roles && roles.length) ? "More Recommended" : "More Events",
                  "resulting-screen": (roles && roles.length)?(navigationOverride ||"recommended-events"):(navigationOverride || "events"),
                  "resulting-section": null,
                });
                roles && roles.length
                  ? navigation.navigate(
                      navigationOverride || "RecommendedEvents",{
                        previousScreen:"events",
                        previousSection:" "
                      }
                    )
                  : navigation.navigate(navigationOverride || "Events",{
                    previousScreen:"events",
                    previousSection:" "
                  });
              }}
              accessible
              accessibilityTraits="button"
              accessibilityComponentType="button"
            >
              <View
                style={{
                  marginVertical: 15,
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 200,
                  height: 40,
                  borderRadius: 30,
                  borderWidth: 1,
                  borderColor: "#D40546"
                }}
              >
                <Text
                  style={{ color: "#AE173C", fontSize: 15, fontWeight: "600", fontFamily: 'Roboto', }}
                >
                  {roles && roles.length ? "More Recommended" : "More Events"}
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }
}

export const formatRawEvent = formatIt;
const EventsContent = AppSyncComponent(EventsX, getEvents);

export class Events extends PureComponent {
  render() {
    return (
      <ErrorWrapper>
        <EventsFilterContext.Consumer>
          {context => {
            return <EventsContent {...this.props} context={context} />;
          }}
        </EventsFilterContext.Consumer>
      </ErrorWrapper>
    );
  }
}
