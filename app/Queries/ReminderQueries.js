import gql from "graphql-tag";
import { graphql, ApolloProvider, compose } from "react-apollo";

// sample input:
// {
//   push_id: String!
//   course_id: String!
//   alert_time: String!
//   alert_amount: String!
//   dow_num: String!
//   message: String!
//   repeat_type: String!
// }

export const GetAllLocalNotifications = gql`
  query {
    getAllLocalNotifications {
      push_id
      course_id
      alert_time
      alert_amount
      dow_num
      message
      repeat_type
    }
  }
`;

export const GetSingleLocalNotification = gql`
  query($id: String) {
    getLocalNotification(id: $id) {
      push_id
      course_id
      alert_time
      alert_amount
      dow_num
      message
      repeat_type
    }
  }
`;

export const AddReminderMutation = gql`
  mutation($notification: Local_Notification_Input!) {
    setLocalNotification(notification: $notification) {
      push_id
      course_id
      alert_time
      alert_amount
      dow_num
      message
      repeat_type
    }
  }
`;

export const RemoveNotificationMutation = gql`
  mutation($id: String) {
    deleteLocalNotification(id: $id) {
      push_id
      course_id
      alert_time
      alert_amount
      dow_num
      message
      repeat_type
    }
  }
`;

// add one for each operation

export const getReminders = graphql(GetAllLocalNotifications, {
  options: {
    fetchPolicy: "network-only"
  },
  props: props => {
    // console.log("getAllLocalNotifications props: ", props);
    return {
      reminders: props.data.getAllLocalNotifications
    };
  }
});

export const getSingleReminder = graphql(GetSingleLocalNotification, {
  options: {
    fetchPolicy: "network-only"
  },
  props: props => {
    return {
      reminders: props.data.getLocalNotification
    };
  }
});

export const addReminder = graphql(AddReminderMutation, {
  props: props => ({
    addReminder: reminder => {
      try {
        props
          .mutate({
            variables: {
              notification: { ...reminder }
            },
            update: (store, { resp }) => {
              try {
                let data = store.readQuery({
                  query: GetAllLocalNotifications
                });
                data.getAllLocalNotifications.push({
                  ...reminder,
                  __typename: "Local_Notification"
                });

                store.writeQuery({
                  query: GetAllLocalNotifications,
                  data
                });
              } catch (e) {
                console.log("error updating", e);
              }
            }
            // return null
          })
          .then(resp => {
            console.log("addReminderMutation response: ", resp, reminder);
          })
          .catch(e => {
            console.log("submission error", e);
            // throw e;
          });
          return null;
      } catch (e) {
        console.log("addReminder error: ", e);
      }
    }
  })
});

export const removeReminder = graphql(RemoveNotificationMutation, {
  props: props => ({
    removeReminder: reminder => {
      try {
        props
          .mutate({
            variables: {
              ...reminder
            },
            update: (store, { resp }) => {
              try {
                let data = store.readQuery({
                  query: GetAllLocalNotifications
                });
                let pruned = [];
                data.getAllLocalNotifications.forEach(item => {
                  if (item.push_id !== reminder.id) {
                    pruned.push(item);
                  }
                });
                data.getAllLocalNotifications = pruned;
                store.writeQuery({
                  query: GetAllLocalNotifications,
                  data
                });
                // console.log("DONE REMOVING");
              } catch (e) {
                // console.log("------------------------------------");
                console.log("removeReminder error: ", e);
                // console.log("------------------------------------");
              }
            }
          })
          .then(resp => {
            // console.log("RemoveNotificationMutation response: ", resp);
          })
          .catch(e => {
            console.log("submission error", e);
            // throw e;
          });
      } catch (e) {
        console.log("removeReminder error: ", e);
      }
    }
  })
});
