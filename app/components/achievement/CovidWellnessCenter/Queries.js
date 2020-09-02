import gql from "graphql-tag";
import { graphql } from "react-apollo";

export const getWeeklyHealthCheckUpDetailsQuery = gql`
    query {
        covidGetWeeklyHealthCheckupProd{
            dayStatus
            colorScheme
            today
        }
    }
`;

export const getWeeklyHealthCheckUpDetails = graphql(getWeeklyHealthCheckUpDetailsQuery, {
    options: props => ({
      fetchPolicy: "network-only"
    }),
    props: props => {
      if (props.data.error) {
        console.log(props.data.error);
      }
      return {
        weeklyHealthCheckup: props.data
      };
    }
  });

export const getCampusScheduleQuery = gql `
  query($type: String!){
      covidWeeklyCampusSchedule(type: $type){
          Sunday
          Monday
          Tuesday
          Wednesday
          Thursday
          Friday
          Saturday
      }
  }
`;

export const setCampusScheduleMutation = gql `
  mutation($type: String, $payload: campus_schedule_input){
    setCampusSchedule(type: $type, payload: $payload){
      result
    }
  }
`;

export const getCovidWellnessResourcesQuery = gql`
  query getCovidResources {
    getCovidWellnessResources{
      id
      image_name
      link
      student_link
      employee_link
      text
      type
      order
    }
  }
`;

export const getCovidWellnessResources = graphql(getCovidWellnessResourcesQuery, {
  options: props => ({
    fetchPolicy: "network-only"
  }),
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    return {
      getCovidWellnessResources: props.data
    };
  }
});