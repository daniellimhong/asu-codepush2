import gql from "graphql-tag";
import { graphql } from "react-apollo";
import _ from "lodash";
import {
  OnSetCovidPermissions
} from "./Subscriptions";

export const getCovidPermissionsContentQuery = gql`
  query {
    getCovidPermissionsContent{
      screen
      contents
    }
  }
`;

export const getCovidPermissionsContent = graphql(getCovidPermissionsContentQuery, {
    options: props => ({
      fetchPolicy: "network-only"
    }),
    props: props => {
      // console.log("Call successful covidPermissionsContent", props.data.getCovidPermissionsContent);
      if (props.data.error) {
        console.log("Error in covidPermissionsContent", props.data.error);
      }
      return {
        covidPermissionsContent: props.data.getCovidPermissionsContent
      };
    }
  });

export const getCovidPermissionsQuery = gql`
  query getCovidOnboardPermissions($type: String){
    getCovidOnboardPermissions(type: $type){
      share_location
      share_health_records
      push_notifications
      email_notifications
    }
  }
`;

export const getCovidPermissions = graphql(getCovidPermissionsQuery, {
  options: props => ({
    fetchPolicy: "network-only",
    variables: {
      type: "get"
    }
  }),
  props: props => {
    // console.log("Call successful in Queries", props.data);
    if (props.data.error) {
      console.log("ERROR IN permissions subscription:", props.data.error);
    }
    const covidPermissions = _.get(
      props,
      "data.getCovidOnboardPermissions"
    );
    return {
      covidPermissions: covidPermissions || null,
      subscribeToPermissionUpdates: () => {
        props.data.subscribeToMore({
          document: OnSetCovidPermissions,
          variables: {
            type: "get"
          },
          updateQuery: (prev, permissionsData) => {
            const permissionsDataNew = _.get(
              permissionsData,
              "subscriptionData.data"
            );
            // console.log("########## New data:", permissionsDataNew);
            if (!permissionsDataNew) return prev;
            return permissionsDataNew;
          }
        });
      },
    };
  }
});