import gql from "graphql-tag";
import { graphql } from "react-apollo";

export const covid_questions = gql`
  query covidGetQuestionnaireTest {
    covidGetQuestionnaireTest(type: "get") {
      question
      result
      question_name
    }
  }
`;

export const covid_questions_response = gql`
  mutation covidQuestionnaireResponseTest(
    $type: String
    $payload: CovidQuestionnairePayload
  ) {
    covidQuestionnaireResponseTest(type: $type, payload: $payload) {
      question
      result
      question_name
    }
  }
`;

export const covidstatus = gql`
  query getCovidDailyHealthStatusProd {
    getCovidDailyHealthStatusProd {
      status
    }
  }
`;

export const today_status = gql`
  query covidUpdateTodayProd {
    covidUpdateTodayProd(type: "not_coming") {
      updated
    }
  }
`;

export const covid_firstQuesQuery = gql`
query{
  getCovidInitialQuestions(id:"screen_1"){
    id
    name
    question
    screen
  }
}
`
;

export const covid_firstQues = graphql(covid_firstQuesQuery, {
  options: props => ({
    fetchPolicy: "network-only"
  }),
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    return {
      covid_firstQues: props.data
    };
  }
});

export const covid_secondQuesQuery = gql`
query{
  getCovidInitialQuestions(id:"screen_2"){
    id
    name
    question
    screen
  }
}
`
;

export const covid_secondQues = graphql(covid_secondQuesQuery, {
  options: props => ({
    fetchPolicy: "network-only"
  }),
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    return {
      covid_secondQues: props.data
    };
  }
});

