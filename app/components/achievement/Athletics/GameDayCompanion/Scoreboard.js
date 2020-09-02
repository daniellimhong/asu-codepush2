import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ActivityIndicator
} from "react-native";
import PropTypes from "prop-types";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome5";
import { addTh } from "./utility";

const footballIcon = (
  <Icon
    name="football-ball"
    color="white"
    light
    size={responsiveFontSize(1.5)}
    style={{
      paddingTop: responsiveHeight(0.5),
      paddingHorizontal: responsiveWidth(1)
    }}
  />
);

export default class Scoreboard extends PureComponent {
  render() {
    let scoreboard;
    // console.log("scoreboardData", this.props.scoreboardData);
    if (this.props.scoreboardData) {
      const {
        awayTeamName,
        awayTeamId,
        awayTeamScore,
        homeTeamName,
        homeTeamId,
        homeTeamScore,
        qtr,
        qtrNumber,
        gameTime,
        down,
        toGo,
        hasBall
      } = this.props;
      currentScore =
        !qtr || (gameTime === "00:00" && qtr === "4th") ? (
          <Text style={styles.scoreText}>FINAL</Text>
        ) : (
          <Text style={styles.scoreText}>
            {gameTime} {qtr ? "\u2022" : null} {qtr}
          </Text>
        );
      currentScore = !qtr ? (
        <Text style={styles.scoreText}> </Text>
      ) : (
        currentScore
      );
      const downAndToGo =
        !qtr || (gameTime === "00:00" && qtr === "4th") ? null : (
          <Text style={[styles.scoreText, { fontWeight: "400", fontFamily: "Roboto" }]}>
            {`${addTh(down)} & ${toGo}`}
          </Text>
        );
      const getMargin = score =>
        Number(score) > 9 ? responsiveWidth(10) : responsiveWidth(5);
      const homeHasBall = hasBall === homeTeamId ? true : false;
      const footballToShow =
        !hasBall || !qtr || (gameTime === "00:00" && qtr === "4th")
          ? null
          : footballIcon;
      scoreboard = (
        <View style={styles.innerContainer}>
          <Text
            style={[styles.titleText, { paddingBottom: responsiveHeight(1) }]}
          >
            SCORE
          </Text>
          <View style={styles.bottomBox}>
            <View style={[styles.bottomBoxItem, { flex: 1 }]}>
              <View style={styles.scoreView}>
                <View
                  style={{
                    position: "absolute",
                    right: getMargin(homeTeamScore)
                  }}
                >
                  {homeHasBall ? footballToShow : null}
                </View>
                <Text style={styles.titleText}>{homeTeamScore}</Text>
              </View>
              <Text style={styles.teamText}>Sun Devils</Text>
            </View>
            <View style={[styles.bottomBoxItem, { flex: 1.5 }]}>
              <View style={styles.innerBottomBoxItem}>
                <View style={styles.whiteLine} />
                <Text
                  style={[
                    styles.titleText,
                    { fontSize: responsiveFontSize(2.5) }
                  ]}
                >
                  {" "}
                  VS{" "}
                </Text>
                <View style={styles.whiteLine} />
              </View>
              {currentScore}
              {downAndToGo}
            </View>
            <View style={[styles.bottomBoxItem, { flex: 1 }]}>
              <View style={styles.scoreView}>
                <Text style={styles.titleText}>{awayTeamScore}</Text>
                <View
                  style={{
                    position: "absolute",
                    left: getMargin(awayTeamScore)
                  }}
                >
                  {!homeHasBall ? footballToShow : null}
                </View>
              </View>
              <Text style={styles.teamText}>{awayTeamName}</Text>
            </View>
          </View>
        </View>
      );
    } else {
      scoreboard = (
        <View style={styles.loadingView}>
          <ActivityIndicator color="white" size="large" />
        </View>
      );
    }
    return (
      <ImageBackground
        source={
          this.props.scoreboardImg
            ? { uri: this.props.scoreboardImg }
            : require("../../assets/companion-header.jpg")
        }
        style={styles.container}
        resizeMode="stretch"
      >
        {scoreboard}
      </ImageBackground>
    );
  }
}

Scoreboard.propTypes = {
  scoreboardData: PropTypes.object,
  scoreboardImg: PropTypes.string
};

const styles = StyleSheet.create({
  container: {
    width: "100%"
  },
  innerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(4)
  },
  bottomBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  bottomBoxItem: {
    justifyContent: "center",
    alignItems: "center",
    height: responsiveHeight(10)
  },
  innerBottomBoxItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  scoreView: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  titleText: {
    color: "white",
    fontSize: responsiveFontSize(3.4),
    fontWeight: "bold",
    fontFamily: 'Roboto',
  },
  teamText: {
    flex: 1,
    color: "white",
    fontSize: responsiveFontSize(1.8),
    fontWeight: "400",
    textAlign: "center",
    fontFamily: 'Roboto'
  },
  scoreText: {
    color: "white",
    fontSize: responsiveFontSize(1.8),
    fontWeight: "bold",
    fontFamily: 'Roboto',
  },
  whiteLine: {
    width: responsiveWidth(15),
    borderBottomColor: "white",
    borderBottomWidth: 0.5
  },
  loadingView: {
    padding: responsiveHeight(10),
    justifyContent: "center",
    alignItems: "center"
  }
});
