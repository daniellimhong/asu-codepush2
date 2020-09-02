import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator
} from "react-native";
import axios from "axios";
import moment from "moment";
import _ from "lodash";
import { responsiveHeight } from "react-native-responsive-dimensions";

import TransitionView from "../../universal/TransitionView";
import { DefaultText as Text } from "../../presentational/DefaultText";
import EventCard from "./EventCard";
import { ErrorWrapper } from "../error/ErrorWrapper";
import { SettingsContext } from "../../achievement/Settings/Settings";

const header365 = require("./assets/365header.png");

const eventsApi =
  "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod/365events/";

/**
 * Community Union Wrapper
 *
 * Wrapper component to provide error boundary & settings context
 * @param {*} props
 */
export default function CommunityUnion(props) {
  return (
    <ErrorWrapper>
      <SettingsContext.Consumer>
        {settings => {
          return (
            <CommunityUnionContent
              {...props}
              asurite={settings.user}
              roles={settings.roles}
              sendAnalytics={settings.sendAnalytics}
            />
          );
        }}
      </SettingsContext.Consumer>
    </ErrorWrapper>
  );
}

/**
 * Community Union Content
 *
 * Get and store events to render
 * @param {*} props
 */
function CommunityUnionContent(props) {
  const { sendAnalytics, roles, navigation, asurite } = props;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    props.sendAnalytics({
      "action-type": "click",
      "starting-screen": props.navigation.state.params.previousScreen?props.navigation.state.params.previousScreen:null,
      "starting-section": props.navigation.state.params.previousSection?props.navigation.state.params.previousSection:null,
      "target":"365 Community Union",
      "resulting-screen": "365-community-union",
      "resulting-section": null
    });
    fetchEvents(setEvents, setFirstLoad);
  }, []);

  /**
   * Async get events and add through events state hook
   *
   * @param {*} setEvents
   */
  const fetchEvents = async (_setEvents, _setFirstLoad) => {
    try {
      const _events = await getEvents(eventsApi);
      setLoading(false);
      _setEvents(_events);
    } catch (e) {
      console.log(e);
      _setEvents([]);
    }
    _setFirstLoad(false);
  };

  /**
   * Given a URL corresponding to the 365 events api
   * order the events
   * prune out inactive
   * return active upcoming events
   *
   * @param {} url
   */
  async function getEvents(url) {
    const activeEvents = [];
    const _events = await axios.get(url);
    const allEvents = _.orderBy(_events.data.Items, ["machinetime.N"], ["asc"]);

    for (let i = 0; i < allEvents.length; i++) {
      if (
        moment().isSameOrBefore(allEvents[i].enddate.S, "day") &&
        moment().isSameOrAfter(allEvents[i].startdate.S, "day") &&
        // eslint-disable-next-line no-undef
        (allEvents[i].active.BOOL === true || __DEV__)
      ) {
        activeEvents.push(allEvents[i]);
      }
    }
    return activeEvents;
  }

  const renderItem = ({ item, index }) => {
    return (
      <TransitionView
        index={index}
        animation="fadeInUp"
        duration={750}
        delay={375 * index}
        key={item.title.S}
      >
        <EventCard
          sendAnalytics={sendAnalytics}
          isStudent={roles.includes("student")}
          navigation={navigation}
          asurite={asurite}
          eventDetails={item}
        />
      </TransitionView>
    );
  };

  const showEmptyListView = () => {
    return (
      <View>
        {firstLoad ? null : (
          <Text style={styles.placeholderText}>
            Please stay tuned for future events!
          </Text>
        )}
      </View>
    );
  };

  const CUHeader = () => {
    return (
      <TransitionView style={styles.imageContainer}>
        <Image source={header365} style={styles.eventImage} />
        <View style={styles.descriptionContainer}>
          <View style={styles.spacer} />
          <View style={styles.pageTitle} accessible>
            <View style={styles.threeSixFive}>
              <Text style={styles.titleLeft}>365</Text>
            </View>
            <View style={styles.communityUnion}>
              <Text style={styles.titleRight}>Community</Text>
              <Text style={styles.titleRight}>Union</Text>
            </View>
          </View>
        </View>
      </TransitionView>
    );
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <CUHeader />
        {loading ? (
          <ActivityIndicator
            style={{ marginTop: responsiveHeight(10) }}
            size="large"
            color="maroon"
          />
        ) : (
          <FlatList
            data={events}
            renderItem={renderItem}
            keyExtractor={item => item.id.S}
            ListEmptyComponent={showEmptyListView()}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  placeholderText: {
    paddingTop: 50,
    alignItems: "center",
    textAlign: "center"
  },
  pageTitle: {
    flexDirection: "row"
  },
  imageContainer: {
    flex: 1,
    height: 225,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  descriptionContainer: {
    justifyContent: "flex-end",
    flex: 1,
    paddingBottom: 20
  },
  eventImage: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0
  },
  titleLeft: {
    textAlign: "center",
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0)",
    fontSize: 75,
    fontWeight: "900",
    fontFamily: "Roboto",
    justifyContent: "center",
    alignItems: "center"
  },
  titleRight: {
    textAlign: "left",
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0)",
    fontSize: 28,
    fontWeight: "600",
    fontFamily: "Roboto",
    justifyContent: "center",
    alignItems: "center"
  },
  communityUnion: {
    padding: 12
  }
});
