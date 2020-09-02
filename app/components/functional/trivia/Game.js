/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AppState
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import DeviceInfo from "react-native-device-info";
import { getActiveTriviaQuestionsQuery } from "./gql/Queries";
import { triviaResponseMutation } from "./gql/Mutations";
import { AppSyncComponent } from "../authentication/auth_components/appsync/AppSyncApp";
/**
 * <Trivia type="football" activeOnly=<false/truex>
 * @param {*} props
 */
function GameComponent(props) {
  const {
    questions,
    subscribeToActivatedTriviaQuestions,
    refetch,
    sendTriviaResponse,
    type,
    gameId,
    sendAnalytics
  } = props;
  const [current, setCurrent] = useState({});
  const [selected, setSelected] = useState(null);

  // Subscribe to gameId once
  useEffect(() => {
    subscribeToActivatedTriviaQuestions();
    sendAnalytics({
      "action-type": "click",
      "starting-screen": "football-trivia",
      "starting-section": null, 
      "target":"Trivia Game Loaded",
      "resulting-screen": "football-trivia-game",
      "resulting-section": null,
      "target-id": gameId,
      "action-metadata":{
        "target-id": gameId,
        "type":type,
        "device": DeviceInfo.getUniqueID()
      }
    });
    AppState.addEventListener("change", handleAppStateChange);
    return function closeGame() {
      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);

  // Update selected question to latest whenever questions change
  useEffect(() => {
    if (questions && questions.length) {
      const sorted = questions.sort((a, b) => {
        return Number(b.timestamp) - Number(a.timestamp);
      });
      setSelected(null);
      setCurrent(sorted[0].trivia);
    }
  }, [questions]);

  const handleAppStateChange = nextAppState => {
    if (nextAppState === "active") {
      refetch();
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.question}>{current.question}</Text>
      {current.answers
        ? current.answers.map((answer, index) => {
            const [buttonStyle, buttonTextStyle] = computeStyles(
              selected,
              index
            );
            return (
              <TouchableOpacity
                key={`triviaOption${index}`}
                onPress={() => {
                  sendAnalytics({
                    "action-type": "click",
                    "starting-screen": "football-trivia-game",
                    "starting-section": null, 
                    "target":"Trivia Question Answered",
                    "resulting-screen": "football-trivia-game",
                    "resulting-section": null,
                    "target-id": current.triviaId,
                    "action-metadata":{
                      "target-id": current.triviaId,
                      "question": current.question,
                      "answer":answer,
                      "device": DeviceInfo.getUniqueID()
                    }
                  });
                  setSelected(index);
                  sendTriviaResponse({
                    gameId,
                    triviaId: current.triviaId,
                    answer: index
                  });
                }}
              >
                <View style={buttonStyle}>
                  <Text style={buttonTextStyle}>{answer}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        : null}
    </View>
  );
}

function computeStyles(selected, index) {
  const buttonStyle = [styles.button];
  const buttonTextStyle = [styles.buttonText];
  if (index === selected) {
    buttonStyle.push(styles.buttonSelected);
    buttonTextStyle.push(styles.buttonTextSelected);
  } else {
    buttonStyle.push(styles.buttonUnselected);
    buttonTextStyle.push(styles.buttonTextUnselected);
  }
  return [buttonStyle, buttonTextStyle];
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: "center",
    alignItems: "center",
    padding: responsiveWidth(7)
  },
  question: {
    fontSize: responsiveFontSize(3),
    fontWeight: "bold",
    fontFamily: 'Roboto',
    marginVertical: responsiveHeight(7),
    textAlign: "center"
  },
  button: {
    borderWidth: 1,
    borderRadius: responsiveWidth(10),
    width: responsiveWidth(90),
    margin: responsiveHeight(1),
    padding: responsiveWidth(3),
    justifyContent: "center",
    alignItems: "center",
    borderColor: "maroon"
  },
  buttonSelected: {
    backgroundColor: "maroon"
  },
  buttonUnselected: {
    backgroundColor: "white"
  },
  buttonText: {
    fontSize: responsiveFontSize(2.4)
  },
  buttonTextSelected: {
    color: "white"
  },
  buttonTextUnselected: {
    color: "maroon"
  }
});

const Game = AppSyncComponent(
  GameComponent,
  getActiveTriviaQuestionsQuery,
  triviaResponseMutation
);

export default Game;
