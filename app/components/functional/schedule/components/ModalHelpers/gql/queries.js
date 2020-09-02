import gql from "graphql-tag";
import _ from "lodash";
import { graphql } from "react-apollo";
import {
  findEvents, findEventsPostQuery, updateStore, simpleTest
} from "./utility"

export const GetAllCustomCalEvents = gql`
  query {
    getAllCustomCalEvents {
      eventId
      title
      location
      unixTime
      allDayEvent
    }
  }
`;

export const getCustomCalEvents = graphql(GetAllCustomCalEvents, {
  options: {
    fetchPolicy: "network-only"
  },
  props: props => {
    return {
      customCal: _.get(props, "data.getAllCustomCalEvents")
        ? _.get(props, "data.getAllCustomCalEvents")
        : []
    };
  }
});

export const GetSavedCalendars = gql`
  query {
    getSavedCalendars
  }
`;

export const getSavedCalendars = graphql(GetSavedCalendars, {
  options: {
    fetchPolicy: "network-only"
  },
  props: props => {

    return {
      phoneCal: _.get(props, "data.getSavedCalendars")
        ? _.get(props, "data.getSavedCalendars")
        : []
    };

  }
});
