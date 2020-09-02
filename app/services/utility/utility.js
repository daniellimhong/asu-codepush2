/**
 * GLOBAL CONSTANTS
 */

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december"
];

const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];

const constants = {
  MONTHS: MONTHS,
  DAYS: DAYS
};

/**
 * Change asu events machine date to a react native useable date format
 * @return {object} Object with standard date data
 */
function getStandardDateFromMachine(machine_date) {
  var date_time_split = machine_date.split("T");
  var date_split = date_time_split[0].split("-");
  var time_split = date_time_split[1].split("-");
  var new_date_string = date_time_split[0] + "T" + time_split[0];
  var iso_date = new Date(new_date_string);

  var date = {
    unix_timestamp: Date.parse(iso_date),
    time: time_split[0],
    year: parseInt(date_split[0]),
    month: {
      num: parseInt(date_split[1]),
      word: MONTHS[parseInt(date_split[1]) - 1]
    },
    day: date_split[2],
    date_iso: iso_date
  };

  // DEBUG PRINTS
  // console.log("date_time_split:",date_time_split);
  // console.log("date_split:",date_split);
  // console.log("time_split:",time_split);
  // console.log("new_date_string:",new_date_string);
  // console.log("iso_date:",iso_date);
  // console.log("date:",date);

  return date;
}

/**
 * Returns a full date object with year, month, day, and time to seconds given a valid timestamp
 * @param  {Integer} epoch_timestamp this is the getTime() of a js date object
 * @return {[type]}                 [description]
 */
function getDateFromTimestamp(unix_timestamp) {
  // unix_timestamp = '1515619442687';

  var new_date = new Date(parseInt(unix_timestamp));

  var date_time_split = new_date.toISOString().split("T");
  var date_split = date_time_split[0].split("-");
  var time_split = date_time_split[1].split("-");
  var new_date_string = date_time_split[0] + "T" + time_split[0];

  var full_date = {
    unix_timestamp: unix_timestamp,
    time: time_split[0],
    year: parseInt(date_split[0]),
    month: {
      num: parseInt(date_split[1]),
      word: MONTHS[parseInt(date_split[1]) - 1]
    },
    day: date_split[2],
    date_iso: new_date,
    date_string: new_date.toDateString()
  };

  return full_date;
}

/**
 * Returns meridiem denoted time from military time_split
 * @param  {String} military_time Three 2-length integers, colone delimited ie "02:00:00"
 * @return {String}               Meridiem append time ie 1:00pm or 10:00am. Note: single digit hours have leading-zeroes removed
 */
function getMeridiemTimeFromMilitary(military_time) {
  // 3 two length integers, colon delimited as a string: ie. "02:00:00"
  // console.log("getMeridiemTimeFromMilitary()");
  // military_time = "02:00:00"; // sample data

  var new_time;
  var time_split = military_time.split(":");
  time_split = time_split.slice(0, time_split.length - 1);
  var meridiem = "am";

  if (parseInt(time_split[0]) >= 12) {
    // time is 12th hour or after
    // needs pm meridiem
    meridiem = "pm";

    // subtract 12 for conversion if greater than 12
    if (parseInt(time_split[0]) > 12) {
      time_split[0] -= 12;
    }
  } else if (time_split[0] === "00") {
    time_split[0] = "12";
  } else if (time_split[0][0] === "0") {
    time_split[0] = time_split[0].slice(1);
  }

  new_time = time_split.join(":") + meridiem;

  // console.log("time_split:",time_split);
  // console.log("new_time:",new_time);

  return new_time;
}

function getCampus(latitude, longitude) {
  var campusCoordinates = [
    {
      lat: 33.42184849843031,
      lon: -111.9283177883301,
      campusName: "Tempe",
      campusRadius: 1
    },
    {
      lat: 34.472362999999994,
      lon: -114.32183099999997,
      campusName: "Lake Havasu",
      campusRadius: 3
    },
    {
      lat: 33.46387500000001,
      lon: -111.92400399999997,
      campusName: "Skysong",
      campusRadius: 1
    },
    {
      lat: 33.34149389022663,
      lon: -111.89817340740967,
      campusName: "Research Park",
      campusRadius: 1
    },
    {
      lat: 33.60560202626335,
      lon: -112.16131285054018,
      campusName: "West",
      campusRadius: 1
    },
    {
      lat: 33.4517422046421,
      lon: -112.06978201586912,
      campusName: "Downtown Phoenix",
      campusRadius: 1
    },
    {
      lat: 33.30463351165877,
      lon: -111.67764695106507,
      campusName: "Polytechnic",
      campusRadius: 3
    },
    {
      lat: 33.6224937,
      lon: -112.1847479,
      campusName: "Thunderbird",
      campusRadius: 1
    },
    {
      lat: 38.9011342,
      lon: -77.0441517,
      campusName: "Washington DC",
      campusRadius: 5
    }
  ];

  var coord2 = {
    lat: latitude,
    lon: longitude
  };
  for (var j = 0; j < campusCoordinates.length; j++) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(coord2.lat - campusCoordinates[j].lat);
    var dLon = deg2rad(coord2.lon - campusCoordinates[j].lon);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(campusCoordinates[j].lat)) *
        Math.cos(deg2rad(coord2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c * 0.62137; // Distance in miles
    if (d < campusCoordinates[j].campusRadius) {
      return campusCoordinates[j].campusName;
      break;
    } else {
      if (j == campusCoordinates.length - 1) {
        return "Tempe"; // currently return Tempe as default campus if user lat/lon does not correspond to any campus
      }
    }
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}

export {
  getStandardDateFromMachine,
  constants,
  getMeridiemTimeFromMilitary,
  getDateFromTimestamp,
  getCampus
};
