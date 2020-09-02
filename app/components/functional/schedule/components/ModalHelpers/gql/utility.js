import gql from "graphql-tag";
import _ from "lodash";
import { graphql } from "react-apollo";
import {
  GetAllCustomCalEvents,
  GetSavedCalendars
} from "./queries.js";
import RNCalendarEvents from "react-native-calendar-events";
import moment from "moment";
import { Platform } from "react-native";

export function findEvents(calIds, store) {
  // var startDate = moment().format("YYYY-MM-DDTHH:mm:ss.sssZ");
  // var endDate = moment().add(7,'days').format("YYYY-MM-DDTHH:mm:ss.sssZ");

  var startDate = moment().toDate();
  var endDate = moment().add(7,'days').toDate();

  RNCalendarEvents.fetchAllEvents(startDate,endDate, calIds)
  .then(events => {
    var eventsToAdd = parseEvents(events);
    updateStore(eventsToAdd,store);
  })
  .catch(err => {
    // console.log("Failed getting events!!!",err)
  });
}

export function findEventsPostQuery(calIds) {
  var startDate = moment().format("YYYY-MM-DDTHH:mm:ss.sssZ");
  var endDate = moment().add(7,'days').format("YYYY-MM-DDTHH:mm:ss.sssZ");

  // var startDate = moment().toDate();
  // var endDate = moment().add(7,'days').toDate();

  return new Promise(function(resolve, reject) {

    if( calIds[0] == "none" ) {
      resolve([])
    } else {
      RNCalendarEvents.fetchAllEvents(startDate, endDate, calIds)
      .then(events => {
        var eventsToAdd = parseEvents(events);
        resolve(eventsToAdd)
      })
      .catch(err => {
        // console.log("Failed getting events!!!",err)
        reject(err)
      });
    }

  });
}

export function updateStore(events,store) {
  let data = store.readQuery({
    query: GetAllCustomCalEvents
  });

  var curData = data.getAllCustomCalEvents;
  var newData = [];

  //Filter out all old phone calendar events
  for( var i = 0; i < curData.length; ++i ) {
    if( curData[i].type !== "phone_cal" ) {
      newData.push(curData[i])
    }
  }

  newData = newData.concat(events);

  data.getAllCustomCalEvents = newData
  store.writeQuery({
    query: GetAllCustomCalEvents,
    data
  });

}

export function parseEvents(events) {

  var currentTime = new Date().getTime();

  var eventInfo = []
  for( var i = 0; i < events.length; ++i ) {

    var startDate = moment(events[i].startDate);
    var endDate = moment(events[i].endDate);
    var allDayEvent = endDate.diff(startDate,"h") >= 23;

    var dateTemp = events[i].startDate
    var eventTime = new Date(events[i].startDate).getTime();


    // Android All day events don't come back in correct time zone,
    // Need to manually alter them
    if( Platform.OS == "android" && events[i].allDay ) {

      var year = parseInt(dateTemp.slice(0,4));
      dateTemp = dateTemp.slice(5);
      var month = parseInt(dateTemp.slice(0,2))-1;
      dateTemp = dateTemp.slice(3);
      var day = parseInt(dateTemp.slice(0,2));

      eventTime = new Date(year,month,day).getTime();
    }

    var parentCalendar = null;
    var parentColor = null;

    if( events[i].calendar ) {
      parentCalendar = events[i].calendar.id;
      parentColor = events[i].calendar.color;
    }

    var locationTitle = null;
    var locationAddress = null;
    var locationCoords = null;

    if( events[i].structuredLocation ) {
      locationTitle = events[i].structuredLocation.title;
      locationCoords = events[i].structuredLocation.coords;
    } else if ( events[i].location ) {
      locationTitle = events[i].location;
    }


    if( currentTime < eventTime || allDayEvent ) {
      eventInfo.push({
        id: events[i].id,
        eventId: events[i].id,
        title: events[i].title,
        location: locationTitle,
        locationAddress: locationAddress,
        locationCoords: locationCoords,
        unixTime: eventTime,
        allDayEvent: allDayEvent,
        parentCalendar: parentCalendar,
        color: parentColor,
        type: "phone_cal",
        __typename: "phone_cal"
      })
    }

  }

  return eventInfo;

}
