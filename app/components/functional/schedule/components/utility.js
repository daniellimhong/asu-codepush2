import { AsyncStorage } from "react-native";
import moment from "moment";
import _ from "lodash";
import { Api as ApiService } from "../../../../services/api";

/**
 * The home screen of the app has a limit on the number of days that can be viewed at once.
 * Here we cut that data down.
 *
 * Limit as of writing is 3 days
 *
 * @param {*} data
 */
export function limitSchedule(data, limit = null) {
  if (limit && limit > 0) {
    if (data && data.length > limit) {
      data = data.slice(0, limit);
    }
  }

  return data;
}

/**
 * Some locations are incorrect or should not be rendered.
 * ie. Online, none, undecided
 *
 * We check for those here and determine whether or not to attempt rendering
 *
 * @param {*} location
 */
export function checkProhibitedLocations(location) {
  var prohibitedLocations = ["http", "online", ".com", "tbd", "no location"];
  for (var i = 0; i < prohibitedLocations.length; i++) {
    if (location.toLowerCase().indexOf(prohibitedLocations[i]) !== -1) {
      return true;
    }
  }
  return false;
}

/**
 * Attempt to find an address from campus bird by searching their API for a search term.
 *
 * @param {*} searchedText
 */
export function searchedAdresses(searchedText) {
  return fetch(
    `https://api.concept3d.com/search?map=120&key=fde41084dc57952320ce083606e77533&q=${searchedText}&ppage=5`
  ).then(response => {
    return response.json();
  });
}

/**
 * Compare the schedule state with the props to determine whether we should
 * refresh the state with the props
 *
 * @param {*} propSchedule
 * @param {*} stateSchedule
 */
export function shouldRefreshScheduleDays(propSchedule, stateSchedule) {
  if (
    stateSchedule &&
    stateSchedule.length <= 0 &&
    propSchedule &&
    propSchedule.length > 0
  ) {
    // Check first build
    return true;
  } else if (propSchedule && propSchedule.length) {
    // Start comparison of schedule days
    for (var i = 0; i < propSchedule.length; i++) {
      let propDay = propSchedule[i];
      let stateDay = stateSchedule[i];
      if ((!stateDay && propDay) || propDay.title !== stateDay.title) {
        // If the day timestamp is different
        return true;
      } else {
        if (shouldRefreshScheduleGranular(propDay, stateDay)) {
          // If event values during the days are different
          return true;
        }
      }
    }
  } else if (
    propSchedule &&
    propSchedule.length === 0 &&
    stateSchedule &&
    stateSchedule.length !== 0
  ) {
    return true;
  }

  return false;
}

export function shouldRefreshScheduleOnline(propSchedule, stateSchedule) {
  if (
    stateSchedule &&
    stateSchedule.length <= 0 &&
    propSchedule &&
    propSchedule.length > 0
  ) {
    // Check first build
    return true;
  } else if (propSchedule && propSchedule.length) {
    // Start comparison of schedule days
    for (var i = 0; i < propSchedule.length; i++) {
      let propDay = propSchedule[i];
      let stateDay = stateSchedule[i];
      if ((!stateDay && propDay) || propDay.className !== stateDay.className) {
        // If the day timestamp is different
        return true;
      }
    }
  }

  return false;
}

/**
 * Compare individual events in a day to determin whether we need
 * to refresh the state from the props
 *
 * @param {*} propDay
 * @param {*} stateDay
 */
function shouldRefreshScheduleGranular(propDay, stateDay) {
  let propData = propDay.data;
  let stateData = stateDay.data;

  if (propData.length !== stateData.length) {
    return true;
  }

  for (var i = 0; i < propData.length; i++) {
    if (!stateData[i]) {
      return true;
    }
    if (propData[i].type !== stateData[i].type) {
      // Type mismatch
      return true;
    }
    if (propData[i].type === "academic") {
      if (propData[i].course_id != stateData[i].course_id) {
        // Academic ID incorrect
        return true;
      }
    } else {
      if (propData[i].id != stateData[i].id) {
        // Event ID incorrect
        return true;
      }
    }
  }

  return false;
}

/**
 * Utilize apollo-provided props to create the schedule on our home screen.
 *
 * @param {*} academic
 * @param {*} events
 */
export function mergeAcademicWithEvents(
  academic = {},
  events = {},
  customCal = [],
  phoneCal = []
) {
  let enrolledClasses = [];
  let startTime_var = "start_time";
  let title_var = "course_title";

  if (!academic.terms) {
    academic.terms = [];
  }

  for (let i = 0; i < academic.terms.length; i++) {
    if (academic.terms[i].termCode) {
      startTime_var = "classStartTime";
      title_var = "courseTitle";
    }
    if (
      academic.terms[i].term_code === academic.terms[i].currentTerm ||
      academic.terms[i].termCode === academic.terms[i].currentTerm
    ) {
      enrolledClasses = academic.terms[i].classes;
    }
  }

  var academicArray = formAcademicArray(
    enrolledClasses,
    academic.terms[0],
    startTime_var
  );

  for (let i = 0; i < customCal.length; ++i) {
    customCal[i].unixTime = parseInt(customCal[i].unixTime);
    customCal[i].type = "custom_event";
    customCal[i].id = customCal[i].eventId;
  }
  var eventArray = formEventsArray(events);
  var shortEvents = _.sortBy(eventArray, ["unixTime"]);
  var customEvents = _.sortBy(customCal, ["unixTime"]);
  var phoneEvents = _.sortBy(phoneCal, ["unixTime"]);

  var allSchedule = formScheduleArray(academicArray.schedule);
  allSchedule = formScheduleArray(shortEvents, allSchedule);
  allSchedule = formScheduleArray(customEvents, allSchedule);
  allSchedule = formScheduleArray(phoneEvents, allSchedule);

  return {
    startTime_var: startTime_var,
    title_var: title_var,
    scheduleList: _.sortBy(allSchedule, ["day"]),
    onlineClasses: academicArray.onlineClasses
  };
}

/**
 * Generate proper array for display from the academic schedule.
 * @param {*} academic
 */
function formAcademicArray(academic, term, startTime_var) {
  let startDate = term && term.term_begin_date ? term.term_begin_date : "";
  let endDate = term && term.term_end_date ? term.term_end_date : "";
  let schedule = [];
  let onlineClasses = [];
  for (let i = 0; i < academic.length; i++) {
    for (var k = 0; k < academic[i].meeting_patterns.length; k++) {
      let current = academic[i].meeting_patterns[k];
      let class_start_date = moment(current.start_date);
      let duration_diff = moment
        .duration(class_start_date.diff(moment()))
        .as("days");
      if (duration_diff > 40) {
        break;
      }
      if (current.meeting_location === "Internet") {
        onlineClasses.push({
          className: academic[i].course_title,
          title: academic[i].course_title,
          classNumber: academic[i].class_number,
          class_number: academic[i].class_number,
          course_id: academic[i].course_id,
          unixTime: new Date(2019, 1, 1, 0).getTime(),
          course_url: academic[i].course_url,
          slack_url: academic[i].slack_url,
          type: "online",
          meeting_patterns: [],
          ...academic[i]
        });
        onlineClasses = _.uniqBy(onlineClasses, "classNumber");
      } else {
        for (var key in current) {
          if (current.hasOwnProperty(key)) {
            let dayNumber = 0;
            if (current[key] === "Y") {
              switch (key) {
                case "mon":
                  dayNumber = 1;
                  break;
                case "tues":
                  dayNumber = 2;
                  break;
                case "wed":
                  dayNumber = 3;
                  break;
                case "thurs":
                  dayNumber = 4;
                  break;
                case "fri":
                  dayNumber = 5;
                  break;
              }
              let scheduleDate = moment()
                .day(dayNumber)
                .hours(current[startTime_var].substring(0, 2))
                .minutes(current[startTime_var].substring(3, 5));
              if (new Date(scheduleDate).getTime() < new Date().getTime()) {
                scheduleDate.add(1, "week");
              }
              var clone = _.clone(academic[i], true);
              if (scheduleDate.format("YYYY-MM-DD") < startDate) {
                var matchDay = scheduleDate.get("day");
                var daysToAdd =
                  Math.ceil((moment(startDate).day() - matchDay) / 7) * 7 +
                  matchDay;
                var proposedDate = moment(startDate)
                  .startOf("week")
                  .add(daysToAdd, "d")
                  .hours(current[startTime_var].substring(0, 2))
                  .minutes(current[startTime_var].substring(3, 5));
                clone.unixTime = new Date(proposedDate).getTime();
              } else {
                clone.unixTime = new Date(scheduleDate).getTime();
              }
              clone.type = "academic";
              if (moment().format("YYYY-MM-DD") <= endDate) {
                schedule.push(clone);
              }
            }
          }
        }
      }
    }
  }
  return {
    onlineClasses: onlineClasses,
    schedule: schedule
  };
}

/**
 * Generate proper array data to display for  the events data
 * @param {*} events
 */
function formEventsArray(events = []) {
  let schedule = [];
  for (let i = 0; i < events.length; i++) {
    if (
      (moment(events[i].starttime).unix() * 1000 > new Date().getTime() ||
        moment(events[i].starttime).isSame(new Date(), "day")) &&
      events[i].active == 1 &&
      moment(events[i].endtime).unix() * 1000 > new Date().getTime()
    ) {
      schedule.push({
        unixTime: moment(events[i].starttime).unix() * 1000,
        title: urldecode(events[i].title),
        location: events[i].location,
        feed_type: "events",
        id: events[i].id,
        asurite: events[i].asurite,
        data: events[i],
        active: events[i].active,
        map_lat: events[i].map_lat,
        map_lng: events[i].map_lng
      });
    }
  }
  return schedule;
}
/**
 * Given input, add data to the final array for display.
 * Used to merge acadmeic and events while maintaining the sort order.
 *
 * @param {*} items
 * @param {*} allArray
 */
function formScheduleArray(items, allArray = []) {
  for (var i = 0; i < items.length; i++) {
    let stringScheduleDate = moment(items[i].unixTime).format(
      "dddd, MMMM Do, YYYY"
    );
    if (allArray.length == 0) {
      allArray.push({
        day: items[i].unixTime,
        title: stringScheduleDate,
        data: [items[i]]
      });
    } else {
      for (let k = 0; k < allArray.length; k++) {
        if (allArray[k].title == stringScheduleDate) {
          allArray[k].data.push(items[i]);
          allArray[k].data = _.sortBy(allArray[k].data, ["unixTime"]);
          allArray[k].data = floatUpAllDayEvents(allArray[k].data);
          break;
        } else if (k == allArray.length - 1) {
          allArray.push({
            day: items[i].unixTime,
            title: stringScheduleDate,
            data: [items[i]]
          });
          break;
        }
      }
    }
  }
  return allArray;
}

export function floatUpAllDayEvents(e) {
  var allDay = [];
  var normal = [];

  for (var i = 0; i < e.length; ++i) {
    if (e[i].allDayEvent) {
      allDay.push(e[i]);
    } else {
      normal.push(e[i]);
    }
  }

  allDay = _.sortBy(allDay, ["title"]);

  return allDay.concat(normal);
}

/**
 * Some of the event data is encoded. We need to handle that by decoding the data.
 *
 * @param {*} url
 */
export function urldecode(url) {
  try {
    return decodeURIComponent(url.replace(/\+/g, " "));
  } catch (e) {
    return url;
  }
}

/**
 * Generate a random ID
 *
 * @param {*} length
 */
export function makeid(length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-=";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

/**
 * Parse events when importing calendar
 *
 * @param {*} events
 */
export function parseEvents(events) {
  var eventInfo = [];
  for (var i = 0; i < events.length; ++i) {
    var startDate = moment(events[i].startDate);
    var endDate = moment(events[i].endDate);
    var allDayEvent = endDate.diff(startDate, "h") >= 23;

    var parentCalendar = null;
    var parentColor = null;

    if (events[i].calendar) {
      parentCalendar = events[i].calendar.id;
      parentColor = events[i].calendar.color;
    }

    var locationTitle = events[i].location;
    var locationAddress = null;

    if (events[i].location) {
      var locIndex = events[i].location.indexOf("\n");
      if (locIndex > -1) {
        locationTitle = events[i].location.slice(0, locIndex);
        locationAddress = events[i].location.slice(locIndex + 1);
      }
    }

    eventInfo.push({
      eventId: events[i].id,
      title: events[i].title,
      location: locationTitle,
      locationAddress: locationAddress,
      unixTime: new Date(events[i].startDate).getTime(),
      allDayEvent: allDayEvent,
      parentCalendar: parentCalendar,
      color: parentColor
    });
  }

  return eventInfo;
}

export const onNavigationStateChange = (This, navState) => {
  // console.log("navState.url: ", navState.url);
  if (navState.url.includes("error=")) {
    // console.log("navState.url includes 'error='");
    return This.setState({ displayCanvasModal: false });
  } else if (navState.url.includes("code=")) {
    // console.log("navState.url includes 'code='");
    This.context
      .getTokens()
      .then(tokens => {
        const params = {
          navStateUrl: navState.url
        };
        const getTokensApiService = new ApiService(
          "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com",
          tokens
        );
        getTokensApiService
          .post("/prod/canvas/handletokens", params)
          .then(res => {
            if (!res) {
              return;
            } else {
              This.setState({
                displayCanvasModal: false,
                displayCanvasNotif: false
              });
              This.getData();
            }
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));

    This.setState({ displayCanvasModal: false, displayCanvasNotif: false });
  }
};

export const parseCourseNum = url => {
  if (!url || !url.includes("https://asu.instructure.com/courses/")) {
    // console.log(
    //   "course url is falsey or malformed, and doesn't support canvas."
    // );
    return null;
  } else {
    return url.replace("https://asu.instructure.com/courses/", "");
  }
};

export const comparer = otherArray => {
  return current => {
    return (
      otherArray.filter(other => {
        return (
          other.date == current.date &&
          other.title == current.title &&
          other.id == current.id
        );
      }).length == 0
    );
  };
};
