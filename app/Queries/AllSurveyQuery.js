/**
 * Pull ALL surveys
 * Paginated.
 */
import gql from "graphql-tag";

export default gql`
  query AllSurvey {
    allSurvey(count: 5) {
      survey {
        id
        timestamp
        question
        options
      }
      nextToken
    }
  }
`;

/**
 * Example export for multi-query file.
 * Maybe we fit all relevant feature queries into a single query file?
 */
export const GetSurveyQuery = gql`
  query GetSurvey {
    getSurvey {
      id
      timestamp
      question
      options
    }
  }
`;

export const SubmitResponseMutation = gql`
  mutation SubmitResponse(
    $other: String
    $selection: String
    $timestamp: ID
    $id: ID
  ) {
    submitResponse(
      other: $other
      selection: $selection
      timestamp: $timestamp
      id: $id
    ) {
      timestamp
      selection
      other
      asurite
    }
  }
`;

export const EnabledSurveySubscription = gql`
  subscription EnabledSurveySubscription {
    enabledSurvey {
      id
      timestamp
      options
      question
      enabled
    }
  }
`;
