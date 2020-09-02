import gql from "graphql-tag";
import _ from "lodash";
import { graphql } from "react-apollo";
import DeviceInfo from "react-native-device-info";
import { Platform } from "react-native";

export const GetInboxNotificationsQuery = gql`
  query($platform: String, $appId: String, $uuid: String) {
    getInboxNotifications(platform: $platform, appId: $appId, uuid: $uuid) {
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

export const GetActivityNotificationsQuery = gql`
  query($platform: String, $appId: String, $uuid: String) {
    getActivityNotifications(platform: $platform, appId: $appId, uuid: $uuid) {
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

export const getInboxMsgs = graphql(GetInboxNotificationsQuery, {
  options: props => ({
    fetchPolicy: "cache-and-network",
    variables: {
      platform: Platform.OS,
      appId: "edu.asu.asumobileapp",
      uuid: DeviceInfo.getUniqueID()
    }
  }),
  props: props => {
    return {
      inbox: _.get(props, "data.getInboxNotifications")
        ? _.get(props, "data.getInboxNotifications")
        : []
    };
  }
});

export const getActivityMsgs = graphql(GetActivityNotificationsQuery, {
  options: props => ({
    fetchPolicy: "cache-and-network",
    variables: {
      platform: Platform.OS,
      appId: "edu.asu.asumobileapp",
      uuid: DeviceInfo.getUniqueID()
    }
  }),
  props: props => {
    return {
      activity: _.get(props, "data.getActivityNotifications")
        ? _.get(props, "data.getActivityNotifications")
        : []
    };
  }
});
