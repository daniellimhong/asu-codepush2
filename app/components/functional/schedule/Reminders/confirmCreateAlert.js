import { Alert, Platform } from "react-native";
import moment from "moment";
import _ from "lodash";

import confirmationOptionsAndroid from "./confirmationOptionsAndroid";
import confirmationOptionsIOS from "./confirmationOptionsIOS";
import PushNotification from "react-native-push-notification";

export default function confirmCreateAlert(
  item,
  value,
  removeSingleNotification,
  dow,
  dowNum,
  toaster,
  removeAllNotifications,
  addReminder
) {
  //=== HELPER FUNCTIONS & VARIABLES ===\\
  const createPushNotificationSingle = (item, value, dowNum) => {

    let alertAmount;
    if (value === "15 Minutes") {
      alertAmount = 15;
    } else if (value === "30 Minutes") {
      alertAmount = 30;
    } else if (value === "45 Minutes") {
      alertAmount = 45;
    } else if (value === "60 Minutes") {
      alertAmount = 60;
    }

    const alertTime = moment(item.unixTime).subtract(alertAmount, "minutes")._d;
    // const alertTime = moment().add(45,'seconds')._d; //Instant Send

    let conditionalID;
    if (item.type === "academic") {
      conditionalID = item.course_id;
    } else {
      conditionalID = item.id;
    }

    let id = conditionalID + dowNum;
    addReminder({
      push_id: id,
      course_id: conditionalID,
      alert_time: moment(item.unixTime)
        .subtract(alertAmount, "minutes")
        .format(),
      alert_amount: value,
      dow_num: dowNum,
      message: `${item.title} starts in ${value}.`,
      repeat_type: "single"
    });

    if (Platform.OS === "android") {
      PushNotification.localNotificationSchedule({
        message: `${item.title} starts in ${value}.`,
        date: alertTime,
        id,
        ownerGroup: "reminder"
      });
    } else if (Platform.OS === "ios") {
      PushNotification.localNotificationSchedule({
        message: `${item.title} starts in ${value}`,
        title: "Reminder",
        date: alertTime,
        userInfo: { id, ownerGroup: "reminder" }
      });
    }
  };

  const createPushNotificationWeekly = (item, value, dowNum) => {
    let alertAmount;
    if (value === "15 Minutes") {
      alertAmount = 15;
    } else if (value === "30 Minutes") {
      alertAmount = 30;
    } else if (value === "45 Minutes") {
      alertAmount = 45;
    } else if (value === "60 Minutes") {
      alertAmount = 60;
    }

    const alertTime = moment(item.unixTime)
      .subtract(alertAmount, "minutes")
      .startOf("minute")._d;

    addReminder({
      push_id: item.course_id + dowNum,
      course_id: item.course_id,
      alert_time: moment(item.unixTime)
        .subtract(alertAmount, "minutes")
        .format(),
      alert_amount: value,
      dow_num: dowNum,
      message: `${item.title} starts in ${value}.`,
      repeat_type: "weekly"
    });

    if (Platform.OS === "android") {
      PushNotification.localNotificationSchedule({
        message: `${item.title} starts in ${value}.`,
        date: alertTime,
        repeatType: "week",
        id: item.course_id + dowNum,
        ownerGroup: "reminder"
      });
    } else if (Platform.OS === "ios") {
      try {
        PushNotification.localNotificationSchedule({
          message: `${item.title} starts in ${value}.`,
          date: alertTime,
          repeatType: "week",
          userInfo: { id: item.course_id + dowNum },
          data: { ownerGroup: "reminder" }
        });
      } catch (error) {
        console.log("push notification error: ", error);
      }
    }
  };

  const alertTime = (dayCounter, startOfClass, alertAmount) => {
    let timeA = moment().startOf("day");
    let timeB = moment(parseInt(startOfClass));

    return moment()
      .startOf("day")
      .add(timeB.diff(timeA), "ms")
      .add(86400000 * dayCounter, "ms")
      .subtract(alertAmount, "minutes")._d;
  };

  const createPushNotificationAllDays = (item, value, alertTime, dowNum) => {
    addReminder({
      push_id: item.course_id + dowNum,
      course_id: item.course_id,
      alert_time: alertTime,
      alert_amount: value,
      dow_num: dowNum,
      message: `${item.title} starts in ${value}.`,
      repeat_type: "all"
    });

    if (Platform.OS === "android") {
      PushNotification.localNotificationSchedule({
        message: `${item.title} starts in ${value}.`,
        date: alertTime,
        repeatType: "week",
        id: item.course_id + dowNum,
        ownerGroup: "reminder"
      });
    } else if (Platform.OS === "ios") {
      PushNotification.localNotificationSchedule({
        message: `${item.title} starts in ${value}.`,
        date: alertTime,
        repeatType: "week",
        userInfo: { id: item.course_id + dowNum },
        data: { ownerGroup: "reminder" }
      });
    }
  };

  unixToDOW = unixTimestamp => {
    const dowNumber = moment(unixTimestamp).format("e");
    if (dowNumber === "0") {
      return "Sunday";
    } else if (dowNumber === "1") {
      return "Monday";
    } else if (dowNumber === "2") {
      return "Tuesday";
    } else if (dowNumber === "3") {
      return "Wednesday";
    } else if (dowNumber === "4") {
      return "Thursday";
    } else if (dowNumber === "5") {
      return "Friday";
    } else if (dowNumber === "6") {
      return "Saturday";
    }
  };

  numToDOW = num => {
    if (num === 0) {
      return "Sunday";
    } else if (num === 1) {
      return "Monday";
    } else if (num === 2) {
      return "Tuesday";
    } else if (num === 3) {
      return "Wednesday";
    } else if (num === 4) {
      return "Thursday";
    } else if (num === 5) {
      return "Friday";
    } else if (num === 6) {
      return "Saturday";
    }
  };

  //=== MAIN LOGIC ===\\
  if (item.type === "academic") {
    let Sunday = item.meeting_patterns[0].sun === "Y" ? 0 : null;
    let Monday = item.meeting_patterns[0].mon === "Y" ? 1 : null;
    let Tuesday = item.meeting_patterns[0].tues === "Y" ? 2 : null;
    let Wednesday = item.meeting_patterns[0].wed === "Y" ? 3 : null;
    let Thursday = item.meeting_patterns[0].thurs === "Y" ? 4 : null;
    let Friday = item.meeting_patterns[0].fri === "Y" ? 5 : null;
    let Saturday = item.meeting_patterns[0].sat === "Y" ? 6 : null;

    let totalDays = [
      Sunday,
      Monday,
      Tuesday,
      Wednesday,
      Thursday,
      Friday,
      Saturday
    ];

    let scheduledDays = [];
    for (let i = 0; i <= totalDays.length; i++) {
      if (totalDays[i] !== null) {
        scheduledDays.push(totalDays[i]);
      }
    }

    let confirmationOptions = () => {
      if (Platform.OS === "android") {
        return confirmationOptionsAndroid(
          item,
          value,
          removeSingleNotification,
          dow,
          dowNum,
          toaster,
          createPushNotificationSingle,
          createPushNotificationWeekly,
          createPushNotificationAllDays,
          scheduledDays,
          alertTime
        );
      } else if (Platform.OS === "ios") {
        return confirmationOptionsIOS(
          item,
          value,
          removeSingleNotification,
          dow,
          dowNum,
          toaster,
          createPushNotificationSingle,
          createPushNotificationWeekly,
          createPushNotificationAllDays,
          scheduledDays,
          alertTime,
          removeAllNotifications
        );
      }
    };

    setTimeout(() => {
      Alert.alert(
        "Confirm reminder",
        `Create reminder for ${item.title} ${value} before it starts?`,
        confirmationOptions(),
        {
          onDismiss: () => {
            return false;
          }
        }
      );
    }, 100);
  } else {
    setTimeout(() => {
      Alert.alert(
        "Confirm reminder",
        `Create a reminder for ${item.title} ${value} before it starts?`,
        [
          {
            text: "Cancel",
            onPress: () => {
              toaster()
              return false;
            },
            style: "cancel"
          },
          {
            text: "Confirm",
            onPress: () => {
              createPushNotificationSingle(item, value, dowNum);
              toaster(
                `Reminder set for ${item.title} ${value} before it starts.`
              );
            }
          },
          {
            onDismiss: () => {
              return false;
            }
          }
        ]
      );
    }, 100);
  }
}
