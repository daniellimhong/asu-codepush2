import gql from "graphql-tag";
import { graphql } from "react-apollo";

export const getCovid19OnboardingCardsContentQuery = gql`
query {
    covidOnboardingCardsContent{
      id
      box_text
      box_text_title
      image_name
      show_terms
      show_privacy
      show_proximity_consent
      show_consent_auth
      policyText
      page
      paragraphs
      paragraphs_bold
      enabled
      titleText
      firstLineText
      secondLineText
      privacySettings
    }
  }
`;

export const getCovid19OnboardingCardsContent = graphql(getCovid19OnboardingCardsContentQuery, {
    options: props => ({
      fetchPolicy: "network-only"
    }),
    props: props => {
      if (props.data.error) {
        console.log(props.data.error);
      }
      return {
        covidOnboarding: props.data
      };
    }
  });

export const setCovidOnboardPermissionsMutation = gql`
  mutation setCovidOnboardPermissions($type: String, $payload: covid_permission_input){
    setCovidOnboardPermissions(type: $type, payload: $payload) {
      share_location
      share_health_records
    }
  }
`;

export const getCovidOnboardPermissionsQuery = gql`
  query getCovidOnboardPermissions($type: String){
    getCovidOnboardPermissions(type: $type){
      share_location
      share_health_records
    }
  }
`;

export const getCovidOnboardPermissions = graphql(getCovidOnboardPermissionsQuery, {
  options: props => ({
    fetchPolicy: "network-only",
    variables: {
      type: "get"
    }
  }),
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    return {
      covidPermissions: props.data
    };
  }
});