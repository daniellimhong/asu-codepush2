import gql from "graphql-tag";
import _ from "lodash";
import { graphql } from "react-apollo";
import {
  GetActivityNotificationsQuery,
  GetInboxNotificationsQuery
} from "./Queries.js";
import DeviceInfo from "react-native-device-info";
import { Platform } from "react-native";

export const OpenedNotificationMutation = gql`
  mutation(
    $pushId: String
    $deviceId: String
    $timeOpened: String
    $openedFrom: String
    $inboxType: String
    $appId: String
  ) {
    openedNotification(
      pushId: $pushId
      deviceId: $deviceId
      timeOpened: $timeOpened
      openedFrom: $openedFrom
      inboxType: $inboxType
      appId: $appId
    ) {
      pushId
      title
      body
      actions {
        link
        action_id
        text
        type
      }
      action
      seen
      type
      image
      link
      link2
      date {
        start
        end
      }
    }
  }
`;

export const DeleteNotificationMutation = gql`
  mutation($pushId: String, $uuid: String, $appId: String, $inboxType: String) {
    deleteNotification(
      pushId: $pushId
      uuid: $uuid
      appId: $appId
      inboxType: $inboxType
    ) {
      pushId
      title
      body
      actions {
        link
        action_id
        text
        type
      }
      action
      seen
      type
      image
      link
      link2
      date {
        start
        end
      }
    }
  }
`;

export const ClickedActionMutation = gql`
  mutation(
    $pushId: String
    $deviceId: String
    $action: String
    $inboxType: String
    $appId: String
  ) {
    clickedAction(
      pushId: $pushId
      deviceId: $deviceId
      action: $action
      inboxType: $inboxType
      appId: $appId
    ) {
      pushId
      title
      body
      actions {
        link
        action_id
        text
        type
      }
      action
      seen
      type
      image
      link
      link2
      date {
        start
        end
      }
    }
  }
`;

export const deleteNotification = graphql(DeleteNotificationMutation, {
  props: props => ({
    deleteNotification: payload => {
      return props.mutate({
        variables: payload,
        optimisticResponse: {
          deleteNotification: {
            pushId: payload.pushId,
            title: null,
            body: null,
            actions: {
              link: null,
              action_id: null,
              text: null,
              type: null
            },
            action: null,
            seen: null,
            type: null,
            image: null,
            link: null,
            link2: null,
            date: {
              start: null,
              end: null
            }
          }
        },
        update: (store, resp) => {
          payload.markForDelete = true;
          updateStore(store, resp, payload);
        }
      });
    }
  })
});

export const openedNotification = graphql(OpenedNotificationMutation, {
  props: props => ({
    openedNotification: payload => {
      return props.mutate({
        variables: payload,
        optimisticResponse: {
          openedNotification: {
            pushId: payload.pushId,
            title: null,
            body: null,
            actions: {
              link: null,
              action_id: null,
              text: null,
              type: null
            },
            action: null,
            seen: null,
            type: null,
            image: null,
            link: null,
            link2: null,
            date: {
              start: null,
              end: null
            }
          }
        },
        update: (store, resp) => {
          updateStore(store, resp, payload);
        }
      });
    }
  })
});

export const clickedAction = graphql(ClickedActionMutation, {
  props: props => ({
    clickedAction: payload => {
      return props.mutate({
        variables: payload,
        clickedAction: {
          openedNotification: {
            pushId: payload.pushId,
            title: null,
            body: null,
            actions: {
              link: null,
              action_id: null,
              text: null,
              type: null
            },
            action: null,
            seen: null,
            type: null,
            image: null,
            link: null,
            link2: null,
            date: {
              start: null,
              end: null
            }
          }
        },
        update: (store, resp) => {
          updateStore(store, resp, payload);
        }
      });
    }
  })
});

export function updateStore(store,resp,payload) {

  // console.log("UPDATING STORE",payload);

  let dataItem = "get"+payload.inboxType+"Notifications";

  let data = store.readQuery({
    query: payload.inboxType === "Activity" ? GetActivityNotificationsQuery : GetInboxNotificationsQuery,
    variables: {
      platform: Platform.OS,
      appId: "edu.asu.asumobileapp",
      uuid: DeviceInfo.getUniqueID()
    }
  });

  let temp = data[dataItem];
  let unseen = [];
  let seen = [];

  for( let i = 0; i < temp.length; ++i ) {

    let shouldAdd = true;

    if( temp[i].pushId == payload.pushId ) {
      temp[i].seen = true;

      if( payload.action && payload.action !== temp[i].action ) {
        // console.log(" ** Setting action ** ");
        temp[i].action = payload.action;
      }

      if( payload.markForDelete === true ) {
        shouldAdd = false;
      }

    }

    if( shouldAdd ) {
      if( temp[i].seen === true ) {
        seen.push(temp[i]);
      } else {
        unseen.push(temp[i]);
      }
    }


  }

  seen.sort( function(a,b) {
    return new Date(b.date.start) - new Date(a.date.start);
  });

  unseen.sort( function(a,b) {
    return new Date(b.date.start) - new Date(a.date.start);
  });

  data[dataItem] = unseen.concat(seen);

  store.writeQuery({
    query: payload.inboxType === "Activity" ? GetActivityNotificationsQuery : GetInboxNotificationsQuery,
    variables: {
      platform: Platform.OS,
      appId: "edu.asu.asumobileapp",
      uuid: DeviceInfo.getUniqueID()
    },
    data
  });

}

export function updateActivity(store, resp, type) {
  try {
    // console.log("Start Update Activity");
    let respData = resp.data[type];

    let data = store.readQuery({
      query: GetActivityNotificationsQuery,
      variables: {
        platform: Platform.OS,
        appId: "edu.asu.asumobileapp",
        uuid: DeviceInfo.getUniqueID()
      }
    });

    // console.log("data", data);
    data.getActivityNotifications = respData;

    store.writeQuery({
      query: GetActivityNotificationsQuery,
      variables: {
        platform: Platform.OS,
        appId: "edu.asu.asumobileapp",
        uuid: DeviceInfo.getUniqueID()
      },
      data
    });

    // console.log("data", store);
  } catch (e) {
    console.log(e);
  }
}

export function updateInbox(store, resp, type) {
  try {
    let respData = resp.data[type];

    let data = store.readQuery({
      query: GetInboxNotificationsQuery,
      variables: {
        platform: Platform.OS,
        appId: "edu.asu.asumobileapp",
        uuid: DeviceInfo.getUniqueID()
      }
    });

    data.getInboxNotifications = respData;

    store.writeQuery({
      query: GetInboxNotificationsQuery,
      variables: {
        platform: Platform.OS,
        appId: "edu.asu.asumobileapp",
        uuid: DeviceInfo.getUniqueID()
      },
      data
    });
  } catch (e) {
    console.log(e);
  }
}
