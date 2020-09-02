/* eslint-disable import/prefer-default-export */
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export const ACTIVATE_TRIVIA_MUTATION = gql`
  mutation($trivia: Trivia_Active_Input) {
    AdminOnly_activateTrivia(trivia: $trivia) {
      gameId
      triviaId
      length
      correctIndex
      trivia {
        triviaId
        question
        answers
      }
    }
  }
`;

export const TRIVIA_RESPONSE_MUTATION = gql`
  mutation($gameId: String, $triviaId: String, $answer: Int) {
    sendTriviaResponse(gameId: $gameId, triviaId: $triviaId, answer: $answer) {
      responseId
      gameId
      triviaId
      timestamp
      answer
    }
  }
`;

export const triviaResponseMutation = graphql(TRIVIA_RESPONSE_MUTATION, {
  props: props => ({
    sendTriviaResponse: ({ gameId, triviaId, answer }) => {
      return props.mutate({
        variables: {
          gameId,
          triviaId,
          answer
        },
        update: (store, resp) => {
          console.log("Update it", resp);
        }
      });
    }
  })
});
