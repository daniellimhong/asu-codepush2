
import moment from "moment";

export default (confirmationOptionsIOS = (
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
  removeAllNotifications,
  addReminder
) => {
  // must put addReminder functions to replace old ones
  return [
    {
      text: "Cancel",
      onPress: () => {
        toaster();
        return false;
      },
      style: "cancel"
    },
    {
      text: "Single Reminder",
      onPress: () => {
        removeSingleNotification();
        setTimeout(() => {
          createPushNotificationSingle(item, value, dowNum);
        }, 1000);
        toaster(
          `Single reminder set for ${item.title} ${value} before it starts.`
        );
      }
    },
    {
      text: `Repeat Every ${dow}`,
      onPress: () => {
        removeSingleNotification();
        setTimeout(() => {
          createPushNotificationWeekly(item, value, dowNum);
        }, 1000);
        toaster(
          `Weekly reminder set for ${item.title} ${value} before it starts.`
        );
      }
    },
    {
      text: "Repeat for All Days",
      onPress: () => {
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

        let startOfClass = moment(
          item.meeting_patterns[0].start_time,
          "hh.mm.ss.SSSSSS"
        ).format("x");

        let today = moment().day();

        removeAllNotifications();
        setTimeout(function() {
          for (let i = 0; i <= scheduledDays.length; i++) {
            let dowIdFlag = scheduledDays[i];
            if (today < scheduledDays[i]) {
              createPushNotificationAllDays(
                item,
                value,
                alertTime(scheduledDays[i] - today, startOfClass, alertAmount),
                dowIdFlag
              );
              toaster(
                `Reminder set for all instances of ${
                  item.title
                } ${value} before it starts.`
              );
            } else if (today > scheduledDays[i]) {
              createPushNotificationAllDays(
                item,
                value,
                alertTime(7-(scheduledDays[i] - today), startOfClass, alertAmount),
                dowIdFlag
              );
              toaster(
                `Reminder set for all instances of ${
                  item.title
                } ${value} before it starts.`
              );
            } else if (today === scheduledDays[i]) {
              createPushNotificationAllDays(
                item,
                value,
                alertTime(0, startOfClass, alertAmount),
                dowIdFlag
              );
              toaster(
                `Reminder set for all instances of ${
                  item.title
                } ${value} before it starts.`
              );
            }
          }
        }, 1);
      }
    }
  ];
});
