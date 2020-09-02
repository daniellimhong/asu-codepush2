import React, { useState, useEffect, useContext } from "react";
import { TouchableOpacity } from "react-native";
import { compose, graphql } from "react-apollo";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import _ from "lodash";
import PushNotification from "react-native-push-notification";
import { AppSyncComponent } from "../../../functional/authentication/auth_components/appsync/AppSyncApp";
import { removeReminder } from "../../../../Queries/ReminderQueries";
import { save, remove } from "./utility";
import {
  AllEventFlatQuery,
  SaveEventPureMutation,
  RemoveEventPureMutation,
  checkSaved
} from "../../../../Queries";
import { AuthRender } from "../../../functional/authentication/auth_components/weblogin";
import { SettingsContext } from "../../Settings/Settings";

function CalendarButtonContent(props) {
  const [active, setActive] = useState(false);
  const {
    navigation,
    data,
    eventSchedule,
    saveEventPure,
    removeEventPure
  } = props;
  const { sendAnalytics, SetToast } = useContext(SettingsContext);

  const start = data.startTime ? data.startTime : data.starttime;
  const end = data.endTime ? data.endTime : data.endtime;
  const id = data.nid + getUnixNumDOW(start);
  const happenedAlready = moment(end).isBefore(new Date().getTime());

  const mutateData = {
    data,
    eventSchedule,
    saveEventPure,
    removeEventPure,
    sendAnalytics,
    SetToast,
    removeReminder,
    feed_type: _.get(navigation, "state.params.feed_type")
  };

  useEffect(() => {
    if (data && !checkSaved(data.nid, eventSchedule)) {
      setActive(false);
    } else if (data) {
      setActive(true);
    }
  }, [eventSchedule]);

  if (happenedAlready || props.data.feed_type != "event") {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={() => {
        if (active) {
          remove(mutateData,props.previousScreen,props.previousSection);
          PushNotification.cancelLocalNotifications({ id });
          removeReminder({ id });
        } else {
          save(mutateData,props.previousScreen,props.previousSection);
        }
      }}
      style={{ flex: 0, marginRight: 20 }}
      accessibilityLabel={
        active ? "Remove event from calendar" : "Add event to calendar"
      }
      accessibilityRole="button"
    >
      <FontAwesome
        name={active ? "calendar-check-o" : "calendar-plus-o"}
        size={25}
        color="#464646"
      />
    </TouchableOpacity>
  );
}

export default function CalendarButton(props) {
  return (
    <AuthRender>
      <CalendarButtonAAS2 {...props} />
    </AuthRender>
  );
}

const getUnixNumDOW = unixTimestamp => {
  const dowNumber = moment(unixTimestamp).format("e");
  return dowNumber;
};

const CalendarButtonAAS = compose(
  graphql(AllEventFlatQuery, {
    options: {
      fetchPolicy: "cache-first"
    },
    props: props => {
      try {
        return {
          eventSchedule: props.data.getSavedEventsFlat
        };
      } catch (e) {
        return {
          eventSchedule: []
        };
      }
    }
  }),
  graphql(SaveEventPureMutation, {
    props: props => ({
      saveEventPure: event => {
        return props
          .mutate({
            variables: {
              ...event
            },
            optimisticResponse: () => ({
              saveEventPure: {
                active: "1",
                feed_type: event.feed_type ? event.feed_type : null,
                id: event.id ? event.id : null,
                timestamp: new Date().getTime(),
                endtime: event.endtime ? event.endtime : null,
                location: event.location ? event.location : null,
                starttime: event.starttime ? event.starttime : null,
                title: event.title ? event.title : null,
                url: event.url ? event.url : null,
                description: event.description ? event.description : null,
                key: event.key ? event.key : null,
                map_title: event.map_title ? event.map_title : null,
                map_type: event.map_type ? event.map_type : null,
                picture: event.picture ? event.picture : null,
                teaser: event.teaser ? event.teaser : null,
                map_lat: event.map_lat ? event.map_lat : null,
                map_lng: event.map_lng ? event.map_lng : null,
                nid: event.nid ? event.nid : null,
                category: event.category ? event.category : null,
                interests: event.interests ? event.interests : null,
                date: event.date ? event.date : null,
                rawDate: event.rawDate ? event.rawDate : null,
                __typename: "Event_News_flat"
              }
            }),
            update: store => {
              event = {
                active: "1",
                feed_type: event.feed_type ? event.feed_type : null,
                id: event.id ? event.id : null,
                timestamp: new Date().getTime(),
                endtime: event.endtime ? event.endtime : null,
                location: event.location ? event.location : null,
                starttime: event.starttime ? event.starttime : null,
                title: event.title ? event.title : null,
                url: event.url ? event.url : null,
                description: event.description ? event.description : null,
                key: event.key ? event.key : null,
                map_title: event.map_title ? event.map_title : null,
                map_type: event.map_type ? event.map_type : null,
                picture: event.picture ? event.picture : null,
                teaser: event.teaser ? event.teaser : null,
                map_lat: event.map_lat ? event.map_lat : null,
                map_lng: event.map_lng ? event.map_lng : null,
                nid: event.nid ? event.nid : null,
                category: event.category ? event.category : null,
                interests: event.interests ? event.interests : null,
                date: event.date ? event.date : null,
                rawDate: event.rawDate ? event.rawDate : null,
                __typename: "Event_News_flat"
              };

              try {
                const data = store.readQuery({
                  query: AllEventFlatQuery
                });

                if (!checkSaved(event.nid, data.getSavedEventsFlat)) {
                  data.getSavedEventsFlat.push(event);
                }

                store.writeQuery({
                  query: AllEventFlatQuery,
                  data
                });
              } catch (e) {
                console.log(e);
              }
            }
          })
          .then(resp => {
            // console.log("mutation response", resp); // Debug option
            return Promise.resolve(resp);
          })
          .catch(e => {
            console.log("submission error", e);
            return Promise.reject(e);
            // throw e;
          });
      }
    })
  }),
  graphql(RemoveEventPureMutation, {
    props: props => ({
      removeEventPure: event => {
        return props
          .mutate({
            variables: {
              id: event.key
            },
            optimisticResponse: () => ({
              removeEventPure: {
                active: "1",
                feed_type: event.feed_type ? event.feed_type : null,
                id: event.id ? event.id : null,
                timestamp: new Date().getTime(),
                endtime: event.endtime ? event.endtime : null,
                location: event.location ? event.location : null,
                starttime: event.starttime ? event.starttime : null,
                title: event.title ? event.title : null,
                url: event.url ? event.url : null,
                description: event.description ? event.description : null,
                key: event.key ? event.key : null,
                map_title: event.map_title ? event.map_title : null,
                map_type: event.map_type ? event.map_type : null,
                picture: event.picture ? event.picture : null,
                teaser: event.teaser ? event.teaser : null,
                map_lat: event.map_lat ? event.map_lat : null,
                map_lng: event.map_lng ? event.map_lng : null,
                nid: event.nid ? event.nid : null,
                category: event.category ? event.category : null,
                interests: event.interests ? event.interests : null,
                date: event.date ? event.date : null,
                rawDate: event.rawDate ? event.rawDate : null,
                __typename: "Event_News_flat"
              }
            }),
            update: store => {
              event = {
                active: "1",
                feed_type: event.feed_type ? event.feed_type : null,
                id: event.id ? event.id : null,
                timestamp: new Date().getTime(),
                endtime: event.endtime ? event.endtime : null,
                location: event.location ? event.location : null,
                starttime: event.starttime ? event.starttime : null,
                title: event.title ? event.title : null,
                url: event.url ? event.url : null,
                description: event.description ? event.description : null,
                key: event.key ? event.key : null,
                map_title: event.map_title ? event.map_title : null,
                map_type: event.map_type ? event.map_type : null,
                picture: event.picture ? event.picture : null,
                teaser: event.teaser ? event.teaser : null,
                map_lat: event.map_lat ? event.map_lat : null,
                map_lng: event.map_lng ? event.map_lng : null,
                nid: event.nid ? event.nid : null,
                category: event.category ? event.category : null,
                interests: event.interests ? event.interests : null,
                date: event.date ? event.date : null,
                rawDate: event.rawDate ? event.rawDate : null,
                __typename: "Event_News_flat"
              };

              try {
                const data = store.readQuery({
                  query: AllEventFlatQuery
                });

                const pruned = [];

                data.getSavedEventsFlat.forEach(item => {
                  if (item.id !== event.id && item.id !== event.nid) {
                    pruned.push(item);
                  }
                });
                data.getSavedEventsFlat = pruned;

                store.writeQuery({
                  query: AllEventFlatQuery,
                  data
                });
              } catch (e) {
                console.log(e);
              }
            }
          })
          .then(resp => {
            // console.log("mutation response", resp); // Debug option
            return Promise.resolve(resp);
          })
          .catch(e => {
            console.log("submission error", e);
            return Promise.reject(e);
            // throw e;
          });
      }
    })
  })
)(CalendarButtonContent);

const CalendarButtonAAS2 = AppSyncComponent(CalendarButtonAAS, removeReminder);
