/* eslint-disable import/prefer-default-export */
import gql from "graphql-tag";

export const ACTIVATED_TRIVIA_SUBSCRIPTION = gql`
  subscription($gameId: String) {
    activatedTrivia(gameId: $gameId) {
      gameId
      triviaId
      length
      correctIndex
      trivia {
        triviaId
        question
        answers
        __typename
      }
      __typename
    }
  }
`;
