import moment from "moment";

export default (confirmationOptions = (
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
) => {
  return [
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
        removeSingleNotification();

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
    },
    {
      text: `Repeat Every ${dow}`,
      onPress: () => {
        removeSingleNotification();
        setTimeout(function() {
          createPushNotificationWeekly(item, value, dowNum);
        }, 1000);
        toaster(
          `Weekly reminder set for ${item.title} ${value} before it starts.`
        );
      }
    },
    {
      text: "Single Reminder",
      onPress: () => {
        removeSingleNotification();
        setTimeout(function() {
          createPushNotificationSingle(item, value, dowNum);
        }, 1000);
        toaster(
          `Single reminder set for ${item.title} ${value} before it starts.`
        );
      }
    }
  ];
});
