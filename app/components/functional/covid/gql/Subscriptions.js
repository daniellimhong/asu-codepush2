import gql from "graphql-tag";

export const OnSetCovidPermissions = gql`
  subscription onSetCovidPermissions {
    onSetCovidPermissions {
      share_location
      share_health_records
      push_notifications
      email_notifications
    }
  }
`;