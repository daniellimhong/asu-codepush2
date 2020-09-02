/* eslint-disable import/prefer-default-export */
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import _ from "lodash";
import { ACTIVATED_TRIVIA_SUBSCRIPTION } from "./Subscriptions";

export const TRIVIA_GAMES_QUERY = gql`
  query($type: String, $active: Boolean) {
    getTriviaGames(type: $type, active: $active) {
      gameId
      title
      type
      active
    }
  }
`;

export const getTriviaGamesQuery = graphql(TRIVIA_GAMES_QUERY, {
  options: props => ({
    fetchPolicy: "cache-and-network",
    variables: {
      type: props.type,
      active: props.active
    }
  }),
  props: props => {
    return {
      games: _.get(props, "data.getTriviaGames")
    };
  }
});

export const ACTIVE_TRIVIA_QUESTIONS_QUERY = gql`
  query($gameId: String) {
    getActiveTriviaQuestions(gameId: $gameId) {
      gameId
      triviaId
      timestamp
      trivia {
        triviaId
        question
        answers
      }
    }
  }
`;

export const getActiveTriviaQuestionsQuery = graphql(
  ACTIVE_TRIVIA_QUESTIONS_QUERY,
  {
    options: props => ({
      fetchPolicy: "cache-and-network",
      variables: {
        gameId: props.gameId
      }
    }),
    props: props => {
      // console.log("hoot: ", props);
      const refetch = _.get(props, "data.refetch");
      return {
        questions: _.get(props, "data.getActiveTriviaQuestions"),
        refetch: refetch || (() => null),
        subscribeToActivatedTriviaQuestions: () => {
          props.data.subscribeToMore({
            document: ACTIVATED_TRIVIA_SUBSCRIPTION,
            variables: {
              gameId: props.ownProps.gameId
            },
            updateQuery: (prev, sub) => {
              // console.log("Did hit sub: ", prev, sub);
              const activatedTrivia = _.get(
                sub,
                "subscriptionData.data.activatedTrivia"
              );
              const activeTriviaQuestions = _.get(
                prev,
                "getActiveTriviaQuestions"
              );

              if (activatedTrivia) {
                return {
                  ...prev,
                  getActiveTriviaQuestions: [activatedTrivia]
                };
              } else {
                return {
                  ...prev,
                  getActiveTriviaQuestions: [...activeTriviaQuestions]
                };
              }
            }
          });
        }
      };
    }
  }
);
