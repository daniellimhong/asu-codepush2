import React, { PureComponent } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Analytics from "./../../../functional/analytics";
import { tracker } from "../../google-analytics.js";
import PressedWrapper from "../../../presentational/PressedWrapper";
import { removeAt } from "./utility";

const GREEN = "rgb(13, 119, 0)";
const RED = "rgb(159, 23, 0)";

export default class GamesItem extends PureComponent {
  pressHandler = (gameLink, opponent) => {
    this.refs.analytics.sendData({
      "eventtime": new Date().getTime(),
      "action-type": "click",
      "starting-screen": "athletics",
      "starting-section": "games-schedule", 
      "target": "Game Vs "+opponent,
      "resulting-screen": "in-app-browser", 
      "resulting-section": "ESPN: Game Vs "+opponent
    });
    tracker.trackEvent("Click", `GameVs${opponent}`);
    this.props.navigation.navigate("InAppLink", {
      url: gameLink,
      title: `ASU VS ${opponent}`
    });
  };
  render() {
    const {
      ourScore,
      theirScore,
      opponent,
      timeToShow,
      imgUrl,
      isLast,
      ranked,
      home,
      gameLink
    } = this.props;
    const score = ourScore ? (
      <View style={styles.rightBox}>
        <Text
          style={[
            styles.scoreText,
            { color: ourScore >= theirScore ? GREEN : RED }
          ]}
        >
          {ourScore} - {theirScore}
        </Text>
      </View>
    ) : null;
    return (
      <View
        key={this.props.i}
        style={[styles.container, { borderBottomWidth: isLast ? 0 : 1 }]}
      >
        <Analytics ref="analytics" />
        <PressedWrapper
          style={styles.innerContainer}
          onPress={() => this.pressHandler(gameLink, opponent)}
        >
          <Image
            style={styles.imageBox}
            source={{
              uri: imgUrl
            }}
            resizeMode="contain"
          />
          <View style={styles.middleBox}>
            <Text style={styles.teamText}>
              {home ? "" : "@ "}
              {ranked ? `(${ranked})` : ""}
              {removeAt(opponent)}
            </Text>
            <Text style={[styles.timeText, { padding: 0 }]}>{timeToShow}</Text>
          </View>
          {score}
        </PressedWrapper>
      </View>
    );
  }
}

GamesItem.propTypes = {
  navigation: PropTypes.object.isRequired,
  ourScore: PropTypes.number,
  theirScore: PropTypes.number,
  opponent: PropTypes.string,
  timeToShow: PropTypes.string,
  imgUrl: PropTypes.string,
  isLast: PropTypes.bool,
  ranked: PropTypes.number,
  home: PropTypes.bool,
  i: PropTypes.number,
  gameLink: PropTypes.string
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: "rgb(214, 214, 214)",
    marginHorizontal: responsiveWidth(3)
  },
  innerContainer: {
    flexDirection: "row"
  },
  imageBox: {
    flex: 1,
    height: responsiveWidth(15),
    borderRadius: responsiveWidth(3),
    width: responsiveWidth(15),
    alignItems: "center",
    marginTop: 5,
    marginRight: responsiveWidth(4)
  },
  middleBox: {
    flex: 4,
    justifyContent: "center"
  },
  rightBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  teamText: {
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(1.4),
    fontWeight: "bold",
    fontFamily: "Roboto",
    padding: 0,
    color: "black"
  },
  timeText: {
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(1.4),
    padding: responsiveWidth(2),
    color: "black"
  },
  scoreText: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(1.4)
  }
});
