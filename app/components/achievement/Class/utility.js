import moment from "moment";
import { Api } from "../../../services/api";

//===============================
// Developer Notes:
// Utility file for Class.js. Serves to house bulky functions
// to help with code readability. The 'this' of Class.js is
// referred to as 'Class'.
//===============================

//=================
// CORE FUNCTIONS:
//=================

export const configDates = Class => {
  let mpat = Class.props.meeting_patterns ? Class.props.meeting_patterns : {};
  Class.setState({
    start_date: mpat.start_date,
    end_date: mpat.end_date,
    class_count: mpat.class_meeting_number
  });

  let pattern_str = "";
  let days = [];
  let time_str = "";
  if (mpat.mon == "Y") days.push("Monday");
  if (mpat.tues == "Y") days.push("Tuesday");
  if (mpat.wed == "Y") days.push("Wednesday");
  if (mpat.thurs == "Y") days.push("Thursday");
  if (mpat.fri == "Y") days.push("Friday");
  if (mpat.sat == "Y") days.push("Saturday");
  if (mpat.sun == "Y") days.push("Sunday");
  for (let i = 0; i < days.length; ++i) {
    pattern_str += days[i];
    if (i == days.length - 2) pattern_str += " & ";
    else if (i < days.length - 2) {
      pattern_str += ", ";
    }
  }
  Class.setState({ meeting_string: pattern_str, days });

  // let time = new Date(mpat.start_date,mpat.start_time);
  let temp = mpat.start_time ? mpat.start_time.split(".") : [];
  let str_ender = "AM";
  try {
    if (parseInt(temp[0]) > 12) {
      time_str += parseInt(temp[0]) - 12;
      str_ender = "PM";
    } else if (parseInt(temp[0]) == 12) {
      time_str += parseInt(temp[0]);
      str_ender = "PM";
    } else {
      time_str += parseInt(temp[0]);
    }
  } catch (e) {
    console.log(e);
  }

  time_str += ":" + temp[1] + " " + str_ender;
  Class.setState({ time_string: time_str });

  let end_date = new Date(mpat.end_date);
  let start_date = new Date(mpat.start_date);
  let curr_date = new Date();
  if (curr_date < start_date) curr_date = start_date;
  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dev"
  ];

  let schedule = [];
  while (curr_date <= end_date) {
    let weekDay = curr_date.getDay();
    let str = "";
    if (
      (mpat.sun == "Y" && weekDay == 0) ||
      (mpat.mon == "Y" && weekDay == 1) ||
      (mpat.tues == "Y" && weekDay == 2) ||
      (mpat.wed == "Y" && weekDay == 3) ||
      (mpat.thurs == "Y" && weekDay == 4) ||
      (mpat.fri == "Y" && weekDay == 5) ||
      (mpat.sat == "Y" && weekDay == 6)
    ) {
      switch (weekDay) {
        case 0:
          str += "Sunday, ";
          break;
        case 1:
          str += "Monday, ";
          break;
        case 2:
          str += "Tuesday, ";
          break;
        case 3:
          str += "Wednesday, ";
          break;
        case 4:
          str += "Thursday, ";
          break;
        case 5:
          str += "Friday, ";
          break;
        case 6:
          str += "Saturday, ";
          break;
      }
      str += months[curr_date.getMonth()] + " " + curr_date.getDate();
      if (curr_date.getDate() == 1) str += "st";
      else if (curr_date.getDate() == 2) str += "nd";
      else if (curr_date.getDate() == 3) str += "rd";
      else str += "th";
      let DateStrValid = true;
      try {
        let momentified = moment(str, "dddd, MMM Do");
        let startifify = moment(start_date);
        if (momentified.isValid()) {
          if (momentified.isBefore(startifify)) {
            DateStrValid = false;
          }
        }
      } catch (e) {
        console.log("Bad moment?", e);
      }

      if (DateStrValid) {
        schedule.push({
          dayStr: str,
          timeStr: time_str
        });
      }

      Class.setState({ class_schedule: schedule });
    }
    curr_date = new Date(
      curr_date.getFullYear(),
      curr_date.getMonth(),
      curr_date.getDate() + 1
    );
  }
};

export const setClassDetails = Class => {
  Class.context
    .getTokens()
    .then(tokens => {
      if (tokens.username && tokens.username !== "guest") {
        let payload = {
          type: "getRoster",
          course_nbr: Class.props.class_nbr
        };
        let apiService = new Api(
          "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
          tokens
        );
        apiService
          .post("/classes", payload)
          .then(response => {
            let asurites = [];
            let asuriteCheck = /^[a-z]+[0-9]*$/;
            for (let i = 0; i < response.length; ++i) {
              if (asuriteCheck.test(response[i].ASURITE)) {
                asurites.push({ friend: response[i].ASURITE });
              }
            }
            Class.context
              .getAdminSettings()
              .then(settings => {
                if (!settings || !settings.roster) {
                  settings = {};
                }
                Class.setState({
                  num_students: asurites.length,
                  asurites: asurites,
                  class_schedule: Class.state.class_schedule,
                  admin_settings: settings,
                  asurite: tokens.username
                });
              })
              .catch(e => {
                Class.setState({
                  num_students: asurites.length,
                  asurites: asurites,
                  class_schedule: Class.state.class_schedule,
                  admin_settings: settings,
                  asurite: tokens.username
                });
              });
          })
          .catch(error => {
            console.log(error);
            throw error;
          });
      }
    })
    .catch(e => {
      console.log(e);
    });
};

//=======
// MISC:
//=======

export const courseResourceDetails = Class => [
  {
    id: "booklist",
    img: "book",
    url: "https://list.follettdiscover.com/asu#!",
    text: "Book List",
    bgColor: "#00a3e0",
    imgUrl: "booklist.png",
    useImgUrl: false
  },
  // {
  //   id: "canvas",
  //   img: "circle-o-notch",
  //   url: Class.props.course_url,
  //   text: "Canvas",
  //   bgColor: "#e43c30",
  //   imgUrl:
  //     "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/profile-images/icons/canvas@2x.png",
  //   useImgUrl: true
  // },
  {
    id: "students",
    img: "users",
    url: "ClassRoster",
    text: "Class Roster",
    bgColor: "#990033",
    extraInfo: {
      name: Class.state.title,
      data: Class.state.asurites
    },
    imgUrl: "booklist.png",
    useImgUrl: false
  },
  {
    id: "schedule",
    img: "clipboard-list",
    url: "ClassSchedule",
    text: "Classes",
    bgColor: "#f26f21",
    extraInfo: {
      class_schedule: Class.state.class_schedule
    },
    imgUrl:
      "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/profile-images/icons/classes.png",
    useImgUrl: true
  }
];

export const parseText = text => {
  if (text && text.slice(0, 3) === "<p>" && text.slice(-4)) {
    return text.slice(3, -4);
  } else {
    console.log("Something went wrong parsing announcement text.");
    return text;
  }
};
