import React, { PureComponent } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PropTypes from "prop-types";
import axios from "axios";
import GameDayCompanionAlert from "./GameDayCompanionAlert";
import Scoreboard from "./Scoreboard";
import GameDayCompanionMenu from "./GameDayCompanionMenu";
import GameStats from "./GameStats";
import { preGameData, earlyGameData } from "./test";

export default class GameDayCompanion extends PureComponent {
  state = {
    scoreboardData: null
  };
  componentDidMount = async () => {
    this.setState({ scoreboardData: await this.getScoreboardData() });
    this.scoreboardDataInterval = setInterval(async () => {
      this.setState({ scoreboardData: await this.getScoreboardData() });
    }, 10000);
  };

  componentWillUnmount() {
    clearInterval(this.scoreboardDataInterval);
  }
  getScoreboardData = async () => {
    const response = await axios.get(
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/athletics/scoreboard"
      // "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/athletics/scoreboard-test"
    );
    if (response.status === 200) {
      console.log("response.data", response.data);
      // console.log("stringified", JSON.stringify(response.data.data.fbgame)); // for saving stats
      // response.data.data.fbgame = preGameData; // before game stats section
      // response.data.data.fbgame = earlyGameData; // early game stats section
      return response.data;
    } else {
      console.log("error with ", response);
      return null;
    }
  };
  render() {
    const { scoreboardData } = this.state;
    const scoreboard = scoreboardData ? (
      <Scoreboard
        scoreboardData={scoreboardData}
        awayTeamName={scoreboardData.awayTeamName}
        awayTeamId={scoreboardData.awayTeamId}
        awayTeamScore={scoreboardData.awayTeamScore}
        homeTeamName={scoreboardData.homeTeamName}
        homeTeamId={scoreboardData.homeTeamId}
        homeTeamScore={scoreboardData.homeTeamScore}
        qtr={scoreboardData.qtr}
        qtrNumber={scoreboardData.qtrNumber}
        gameTime={scoreboardData.gameTime}
        down={scoreboardData.down}
        toGo={scoreboardData.toGo}
        hasBall={scoreboardData.hasBall}
        scoreboardImg={scoreboardData.scoreboardImg}
      />
    ) : (
      <Scoreboard scoreboardData={scoreboardData} />
    );
    const scoreboardAlert = scoreboardData ? (
      <GameDayCompanionAlert
        scoreboardData={scoreboardData}
        lastPlayText={scoreboardData.lastPlayText}
      />
    ) : null;
    return (
      <View style={styles.container}>
        {scoreboardAlert}
        {scoreboard}
        {this.state.scoreboardData && this.state.scoreboardData.data ? (
          <GameStats data={this.state.scoreboardData} />
        ) : null}
        <GameDayCompanionMenu navigation={this.props.navigation} />
      </View>
    );
  }
}

GameDayCompanion.propTypes = {
  navigation: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
