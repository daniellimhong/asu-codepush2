import gql from "graphql-tag";
import { graphql } from "react-apollo";

export const setCovidOnboardPermissionsMutation = gql`
  mutation setCovidOnboardPermissions($type: String, $payload: covid_permission_input){
    setCovidOnboardPermissions(type: $type, payload: $payload) {
      share_location
      share_health_records
      push_notifications
      email_notifications
    }
  }
`;
