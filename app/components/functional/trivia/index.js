import React from "react";
import { View, Text } from "react-native";
import Game from "./Game";
import { getTriviaGamesQuery } from "./gql/Queries";
import { AppSyncComponent } from "../authentication/auth_components/appsync/AppSyncApp";
/**
 * <Trivia type="football" active=<false/true>
 *
 * @param {*} props
 */
function TriviaComponent(props) {
  const {
    games = [],
    active = false,
    type = null,
    first = false,
    sendAnalytics = () => null
  } = props;

  if (active && type && games && games.length) {
    if (first) {
      return (
        <View>
          <Game type={type} {...games[0]} sendAnalytics={sendAnalytics} />
        </View>
      );
    } else {
      return (
        <View>
          <Text>Should return a list of all games of type</Text>
        </View>
      );
    }
  } else if (active && type) {
    return (
      <View>
        <Text>No trivia currently available</Text>
      </View>
    );
  } else {
    return (
      <View>
        <Text>No trivia currently available</Text>
      </View>
    );
  }
}

const Trivia = AppSyncComponent(TriviaComponent, getTriviaGamesQuery);

export default Trivia;
