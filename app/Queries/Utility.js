import gql from "graphql-tag";
import { graphql, ApolloProvider, compose } from "react-apollo";
import { checkSaved } from "../Queries";

export const AdminSettingsQuery = gql`
  query {
    getAdminSettings {
      adminNotification
      checkinCounts
      roster
      ticketing
      gameDay
      adminNotification
    }
  }
`;

export const getAdminSettings = graphql(AdminSettingsQuery, {
  options: {
    fetchPolicy: "network-only",
    pollInterval: 120000
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    return {
      admin_settings: props.data.getAdminSettings
    };
  }
});

export const UserInformationQuery = gql`
  query($asurite: String!) {
    getUserESInformation(asurite: $asurite) {
      asuriteId
      displayName
      photoUrl
      primaryDeptid
      majors
      programs
      majorCampuses
      affiliations
      workingTitle
      phone
    }
  }
`;

export const getUserInformation = graphql(UserInformationQuery, {
  options: props => {
    return {
      fetchPolicy: "cache-first",
      variables: {
        asurite: props.asurite
      }
    };
  },
  props: props => {
    return {
      user_info: props.data.getUserESInformation
    };
  }
});

export const GetResourcesQuery = gql`
  query($roles: [String]) {
    getResources(roles: $roles) {
      image
      inapp
      title
      url
    }
  }
`;

export const getResources = graphql(GetResourcesQuery, {
  options: props => {
    return {
      fetchPolicy: "cache-first",
      variables: {
        roles: props.roles
      }
    };
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    return {
      resources: props.data.getResources
    };
  }
});
