import gql from "graphql-tag";
import { graphql } from "react-apollo";
import _ from "lodash";

export const GetRoleResourcesQuery = gql`
  query {
    getRoleResources {
      name
      enabled
      title
      data {
        image
        inapp
        title
        url
        isNew
      }
    }
  }
`;

export const getRoleResources = graphql(GetRoleResourcesQuery, {
  options: () => ({
    fetchPolicy: "cache-and-network"
  }),
  props: props => {
    let resources = _.get(props, "data.getRoleResources");
    return {
      defaultResources: resources ? resources : []
    };
  }
});

export const GetUserResourcesQuery = gql`
  query {
    getUserResources {
      image
      inapp
      url
      title
      isNew
    }
  }
`;

export const getUserResources = graphql(GetUserResourcesQuery, {
  options: () => ({
    fetchPolicy: "network-only"
  }),
  props: props => {
    let resources = _.get(props, "data.getUserResources");
    return {
      userResources: resources ? resources : null
    };
  }
});

export const GetResourceItemsQuery = gql`
  query {
    getResourceItems {
      name
      inapp
      url
      isNew
      screen
      image
    }
  }
`;

export const getResourceItems = graphql(GetResourceItemsQuery, {
  options: () => ({
    fetchPolicy: "cache-and-network"
  }),
  props: props => {
    return { resourceItems: props.data.getResourceItems };
  }
});

export const GetHiddenScreensQuery = gql`
  query($roleName: String!) {
    getRoleRoutes(roleName: $roleName) {
      hiddenRoutes
    }
  }
`;
