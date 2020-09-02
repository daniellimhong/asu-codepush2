import gql from "graphql-tag";
import _ from "lodash";
import { graphql } from "react-apollo";
import { GetAllCustomCalEvents, GetSavedCalendars } from "./queries.js";
import RNCalendarEvents from "react-native-calendar-events";
import moment from "moment";
import { findEvents, updateStore } from "./utility";

export const AddEventMutation = gql`
  mutation(
    $eventId: String
    $title: String
    $location: String
    $unixTime: ID
    $allDayEvent: Boolean
  ) {
    addUserCalEvent(
      eventId: $eventId
      title: $title
      location: $location
      unixTime: $unixTime
      allDayEvent: $allDayEvent
    ) {
      eventId
      title
      location
      unixTime
      allDayEvent
    }
  }
`;

export const addUserCalEvent = graphql(AddEventMutation, {
  props: props => ({
    addUserCalEvent: myEvent => {
      // console.log("INSIDE ADD --- ",myEvent)
      try {
        props
          .mutate({
            variables: myEvent,
            update: (store, { resp }) => {
              try {
                let data = store.readQuery({
                  query: GetAllCustomCalEvents
                });

                // console.log("DATA FROM MUDATION",data);

                var curData = data.getAllCustomCalEvents;
                var found = false;
                for (var i = 0; i < curData.length; ++i) {
                  if (curData[i].eventId == myEvent.eventId) {
                    found = true;
                  }
                }

                // console.log("FOUND EVENT",found);

                if (!found) {
                  data.getAllCustomCalEvents.push({
                    ...myEvent,
                    __typename: "User_Events"
                  });
                  data.getAllCustomCalEvents = [...data.getAllCustomCalEvents];

                  store.writeQuery({
                    query: GetAllCustomCalEvents,
                    data
                  });
                }

              } catch (e) {
                console.log("error updating ---- ", e);
              }
            }
          })
          .then(resp => {
            console.log("mutation done");
          })
          .catch(e => {
            console.log("error", e);
            // throw e;
          });
      } catch (e) {
        console.log("error: ", e);
      }
    }
  })
});

export const DeleteEventMutation = gql`
  mutation($eventId: String) {
    deleteUserCalEvent(eventId: $eventId)
  }
`;

export const deleteUserCalEvent = graphql(DeleteEventMutation, {
  props: props => ({
    deleteUserCalEvent: myEvent => {
      try {
        props
          .mutate({
            variables: myEvent,
            update: (store, { resp }) => {
              try {
                let data = store.readQuery({
                  query: GetAllCustomCalEvents
                });

                var newSaved = [];
                for (var i = 0; i < data.getAllCustomCalEvents.length; ++i) {
                  if (
                    data.getAllCustomCalEvents[i].eventId !== myEvent.eventId
                  ) {
                    newSaved.push(data.getAllCustomCalEvents[i]);
                  }
                }

                data.getAllCustomCalEvents = newSaved;

                store.writeQuery({
                  query: GetAllCustomCalEvents,
                  data
                });
              } catch (e) {
                console.log("error updating ---- ", e);
              }
            }
          })
          .then(resp => {
            console.log("mutation done");
          })
          .catch(e => {
            console.log("error", e);
            // throw e;
          });
      } catch (e) {
        console.log("error: ", e);
      }
    }
  })
});

export const AddCalendarMutation = gql`
  mutation($calIds: [String]) {
    addCalendarEvent(calIds: $calIds)
  }
`;

export const addCalendarEvent = graphql(AddCalendarMutation, {
  props: props => ({
    addCalendarEvent: myEvent => {
      try {
        props
          .mutate({
            variables: myEvent,
            update: (store, { resp }) => {
              try {
                let data = store.readQuery({
                  query: GetSavedCalendars
                });

                data.getSavedCalendars = myEvent.calIds;

                store.writeQuery({
                  query: GetSavedCalendars,
                  data
                });
              } catch (e) {
                console.log("error updating ---- ", e);
              }
            }
          })
          .then(resp => {
            console.log("mutation done");
          })
          .catch(e => {
            console.log("error", e);
            // throw e;
          });
      } catch (e) {
        console.log("error: ", e);
      }
    }
  })
});
