import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager
} from "react-native";
import PropTypes from "prop-types";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome5";
import Analytics from "./../../../functional/analytics";
import { tracker } from "../../google-analytics.js";
import GameStatsTeam from "./GameStatsTeam";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GREY = "rgba(173, 173, 173, 0.57)";
const openIcon = (
  <Icon name="chevron-down" size={responsiveFontSize(1.8)} color="white" />
);
const closeIcon = (
  <Icon name="chevron-up" size={responsiveFontSize(1.8)} color="white" />
);

export default class GameStats extends PureComponent {
  state = {
    whichTab: "homeTeam"
  };
  _renderStats = (home, opponent) => {
    const { whichTab } = this.state;
    const team = home.$.name;
    const opponentTeam = opponent.$.name;
    let dataToShow;
    if (whichTab !== "teamStats" && home.player && opponent.player) {
      const stats = whichTab === "homeTeam" ? home : opponent;
      const teamPlayerStats = stats.player;
      const defense = teamPlayerStats.filter(
        v => v.defense && v.defense[0].$.tot_tack
      );
      const passing = teamPlayerStats.filter(v => v.pass && v.pass[0].$.yds);
      const rushing = teamPlayerStats.filter(v => v.rush && v.rush[0].$.yds);
      const receiving = teamPlayerStats.filter(v => v.rcv && v.rcv[0].$.yds);
      const kicking = teamPlayerStats.filter(v => v.fg && v.fg[0].$.made);
      const punting = teamPlayerStats.filter(v => v.punt && v.punt[0].$.yds);
      dataToShow = (
        <View>
          {this._renderSectionStats(passing, "Passing")}
          {this._renderSectionStats(rushing, "Rushing")}
          {this._renderSectionStats(receiving, "Receiving")}
          {this._renderSectionStats(defense, "Defense")}
          {this._renderSectionStats(kicking, "Kicking")}
          {this._renderSectionStats(punting, "Punting")}
        </View>
      );
    } else if (!home.player && !opponent.player) {
      dataToShow = (
        <Text style={styles.noGameDataText}>There is no game data yet.</Text>
      );
    } else {
      const teamRecord = home.$.record;
      const opponentTeamRecord = opponent.$.record;
      dataToShow = <GameStatsTeam home={home} opponent={opponent} />;
    }
    return (
      <View style={styles.teamContainer}>
        <View style={styles.headerView}>
          <TouchableOpacity
            style={[
              styles.headerViewBox,
              {
                backgroundColor: whichTab === "homeTeam" ? "transparent" : GREY
              }
            ]}
            onPress={() => this.setState({ whichTab: "homeTeam" })}
          >
            <Text style={styles.headerViewText}>{team}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.headerViewBox,
              {
                backgroundColor: whichTab === "teamStats" ? "transparent" : GREY
              }
            ]}
            onPress={() => this.setState({ whichTab: "teamStats" })}
          >
            <Text style={styles.headerViewText}>Team Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.headerViewBox,
              {
                backgroundColor: whichTab === "awayTeam" ? "transparent" : GREY
              }
            ]}
            onPress={() => this.setState({ whichTab: "awayTeam" })}
          >
            <Text style={styles.headerViewText}>{opponentTeam}</Text>
          </TouchableOpacity>
        </View>
        {dataToShow}
      </View>
    );
  };

  _renderSectionStats = (arrayOfPlayers, header) => {
    if (arrayOfPlayers && arrayOfPlayers.length > 0) {
      return (
        <View style={styles.sectionView}>
          <Text style={styles.sectionHeaderText}>{header}</Text>
          <View style={styles.table}>
            {this[`_render${header}HeaderRow`]()}
            {this[`_render${header}Rows`](arrayOfPlayers)}
          </View>
        </View>
      );
    } else {
      return null;
    }
  };

  _renderPassingHeaderRow = () => {
    return (
      <View style={styles.tableHeaderRow}>
        <View style={{ flex: 3, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>NAME</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>C/ATT</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>YDS</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>TD</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>INT</Text>
        </View>
      </View>
    );
  };

  _renderPassingRows = arrayOfPlayers => {
    arrayOfPlayers = arrayOfPlayers.sort(
      (a, b) => Number(b.pass[0].$.yds) - Number(a.pass[0].$.yds)
    );
    return arrayOfPlayers.map((v, i) => {
      const completions = Number(
        v.pass[0] && v.pass[0].$.comp ? v.pass[0].$.comp : 0
      );
      const attempts = Number(
        v.pass[0] && v.pass[0].$.att ? v.pass[0].$.att : 0
      );
      const completionsAttempts = `${completions}/${attempts}`;
      const yards = Number(v.pass[0] && v.pass[0].$.yds ? v.pass[0].$.yds : 0);
      const tds = Number(v.pass[0] && v.pass[0].$.td ? v.pass[0].$.td : 0);
      const ints = Number(v.pass[0] && v.pass[0].$.int ? v.pass[0].$.int : 0);
      const greyed = i % 2 === 1 ? "rgba(189, 189, 189, 0.5)" : "transparent";
      return (
        <View style={[, styles.tableRow, { backgroundColor: greyed }]} key={i}>
          <View style={{ flex: 3, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>
              {v.$.name} - #{v.$.uni}
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{completionsAttempts}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{yards}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{tds}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{ints}</Text>
          </View>
        </View>
      );
    });
  };

  _renderRushingHeaderRow = () => {
    return (
      <View style={styles.tableHeaderRow}>
        <View style={{ flex: 3, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>NAME</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>CAR</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>YDS</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>YPC</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>TD</Text>
        </View>
      </View>
    );
  };

  _renderRushingRows = arrayOfPlayers => {
    arrayOfPlayers = arrayOfPlayers.sort(
      (a, b) => Number(b.rush[0].$.yds) - Number(a.rush[0].$.yds)
    );
    return arrayOfPlayers.map((v, i) => {
      const carries = Number(
        v.rush[0] && v.rush[0].$.att ? v.rush[0].$.att : 0
      );
      const yards = Number(v.rush[0] && v.rush[0].$.yds ? v.rush[0].$.yds : 0);
      const tds = Number(v.rush[0] && v.rush[0].$.td ? v.rush[0].$.td : 0);
      const ypc = (yards / carries).toFixed(1);
      const greyed = i % 2 === 1 ? "rgba(189, 189, 189, 0.5)" : "transparent";
      return (
        <View style={[, styles.tableRow, { backgroundColor: greyed }]} key={i}>
          <View style={{ flex: 3, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>
              {v.$.name} - #{v.$.uni}
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{carries}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{yards}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{ypc}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{tds}</Text>
          </View>
        </View>
      );
    });
  };

  _renderReceivingHeaderRow = () => {
    return (
      <View style={styles.tableHeaderRow}>
        <View style={{ flex: 3, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>NAME</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>REC</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>YDS</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>YPR</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>LONG</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>TD</Text>
        </View>
      </View>
    );
  };

  _renderReceivingRows = arrayOfPlayers => {
    arrayOfPlayers = arrayOfPlayers.sort(
      (a, b) => Number(b.rcv[0].$.yds) - Number(a.rcv[0].$.yds)
    );
    return arrayOfPlayers.map((v, i) => {
      const receptions = Number(v.rcv[0] && v.rcv[0].$.no ? v.rcv[0].$.no : 0);
      const yards = Number(v.rcv[0] && v.rcv[0].$.yds ? v.rcv[0].$.yds : 0);
      const tds = Number(v.rcv[0] && v.rcv[0].$.td ? v.rcv[0].$.td : 0);
      const longest = Number(v.rcv[0] && v.rcv[0].$.long ? v.rcv[0].$.long : 0);
      const ypr = (yards / receptions).toFixed(1);
      const greyed = i % 2 === 1 ? "rgba(189, 189, 189, 0.5)" : "transparent";
      return (
        <View style={[, styles.tableRow, { backgroundColor: greyed }]} key={i}>
          <View style={{ flex: 3, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>
              {v.$.name} - #{v.$.uni}
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{receptions}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{yards}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{ypr}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{longest}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{tds}</Text>
          </View>
        </View>
      );
    });
  };

  _renderDefenseHeaderRow = () => {
    return (
      <View style={styles.tableHeaderRow}>
        <View style={{ flex: 3, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>NAME</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>TCKL</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>SOLO</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>TFL</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>SACK</Text>
        </View>
      </View>
    );
  };

  _renderDefenseRows = arrayOfPlayers => {
    arrayOfPlayers = arrayOfPlayers.sort(
      (a, b) =>
        Number(b.defense[0].$.tot_tack) - Number(a.defense[0].$.tot_tack)
    );
    return arrayOfPlayers.map((v, i) => {
      const totTack =
        v.defense[0] && v.defense[0].$.tot_tack ? v.defense[0].$.tot_tack : 0;
      const soloTack =
        v.defense[0] && v.defense[0].$.tackua ? v.defense[0].$.tackua : 0;
      const tFLUnassisted =
        v.defense[0] && v.defense[0].$.tflua ? v.defense[0].$.tflua : 0;
      const tFLAssisted =
        v.defense[0] && v.defense[0].$.tfla ? v.defense[0].$.tfla : 0;
      const tackForLoss = Number(tFLUnassisted) + Number(tFLAssisted * 0.5);
      const sackUnassisted =
        v.defense[0] && v.defense[0].$.sackua ? v.defense[0].$.sackua : 0;
      const sackAssisted =
        v.defense[0] && v.defense[0].$.sacka ? v.defense[0].$.sacka : 0;
      const sacks = Number(sackUnassisted) + Number(sackAssisted * 0.5);
      const greyed = i % 2 === 1 ? "rgba(189, 189, 189, 0.5)" : "transparent";
      return (
        <View style={[, styles.tableRow, { backgroundColor: greyed }]} key={i}>
          <View style={{ flex: 3, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>
              {v.$.name} - #{v.$.uni}
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{totTack}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{soloTack}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{tackForLoss}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{sacks}</Text>
          </View>
        </View>
      );
    });
  };

  _renderKickingHeaderRow = () => {
    return (
      <View style={styles.tableHeaderRow}>
        <View style={{ flex: 3, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>NAME</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>FG</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>PCT</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>LONG</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>BLKD</Text>
        </View>
      </View>
    );
  };

  _renderKickingRows = arrayOfPlayers => {
    arrayOfPlayers = arrayOfPlayers.sort(
      (a, b) => Number(b.fg[0].$.yds) - Number(a.fg[0].$.yds)
    );
    return arrayOfPlayers.map((v, i) => {
      const made = v.fg[0] && v.fg[0].$.made ? v.fg[0].$.made : 0;
      const attempted = v.fg[0] && v.fg[0].$.att ? v.fg[0].$.att : 0;
      const madeAttempted = `${made}/${attempted}`;
      const percentage = ((made / attempted) * 100).toFixed(1);
      const longest = v.fg[0] && v.fg[0].$.long ? v.fg[0].$.long : 0;
      const blkd = v.fg[0] && v.fg[0].$.blkd ? v.fg[0].$.blkd : 0;
      const greyed = i % 2 === 1 ? "rgba(189, 189, 189, 0.5)" : "transparent";
      return (
        <View style={[, styles.tableRow, { backgroundColor: greyed }]} key={i}>
          <View style={{ flex: 3, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>
              {v.$.name} - #{v.$.uni}
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{madeAttempted}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{percentage}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{longest}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{blkd}</Text>
          </View>
        </View>
      );
    });
  };
  _renderPuntingHeaderRow = () => {
    return (
      <View style={styles.tableHeaderRow}>
        <View style={{ flex: 3, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>NAME</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>PNTS</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>YDS</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>AVG</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Text style={styles.headerText}>LONG</Text>
        </View>
      </View>
    );
  };

  _renderPuntingRows = arrayOfPlayers => {
    arrayOfPlayers = arrayOfPlayers.sort(
      (a, b) => Number(b.punt[0].$.yds) - Number(a.punt[0].$.yds)
    );
    return arrayOfPlayers.map((v, i) => {
      const yds = v.punt[0] && v.punt[0].$.yds ? v.punt[0].$.yds : 0;
      const punts = v.punt[0] && v.punt[0].$.no ? v.punt[0].$.no : 0;
      const avg = (yds / punts).toFixed(1);
      const longest = v.punt[0] && v.punt[0].$.long ? v.punt[0].$.long : 0;
      const greyed = i % 2 === 1 ? "rgba(189, 189, 189, 0.5)" : "transparent";
      return (
        <View style={[styles.tableRow, { backgroundColor: greyed }]} key={i}>
          <View style={{ flex: 3, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>
              {v.$.name} - #{v.$.uni}
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{punts}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{yds}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{avg}</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={styles.tableText}>{longest}</Text>
          </View>
        </View>
      );
    });
  };

  pressHandler = () => {
    this.refs.analytics.sendData({
      "eventtime": new Date().getTime(),
      "action-type": "click",
      "starting-screen": "gameday-companion",
      "starting-section": null,
      "target": "View Game Statistics",
      "resulting-screen": null, 
      "resulting-section": "game_stats",
    });
    tracker.trackEvent("Click", `ViewGameStats`);
    this.setState({ showStats: this.state.showStats ? false : true });
    LayoutAnimation.easeInEaseOut();
  };

  render() {
    if (this.props.data) {
      // console.log("GameStats ", this.props.data.data.fbgame.team);
      const { showStats } = this.state;
      const stats = this.props.data.data.fbgame.team;
      const asu = stats[0].$.name === "Arizona State" ? 0 : 1;
      const opponent = asu === 0 ? 1 : 0;
      const expandTitle = showStats
        ? "   Close Game Statistics"
        : "   View Game Statistics";
      return (
        <View style={{}}>
          <Analytics ref="analytics" />
          <ScrollView
            style={[
              styles.container,
              { height: showStats ? responsiveHeight(35) : 0 }
            ]}
          >
            {this._renderStats(stats[asu], stats[opponent])}
          </ScrollView>
          <TouchableOpacity
            style={styles.headerBox}
            onPress={this.pressHandler}
          >
            <View style={{}}>{showStats ? closeIcon : openIcon}</View>
            <Text style={styles.headerBoxText}>{expandTitle}</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return <Analytics ref="analytics" />;
    }
  }
}

GameStats.propTypes = {
  data: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
    // borderBottomWidth: 2,
    // borderBottomColor: "black"
  },
  headerBox: {
    justifyContent: "center",
    alignItems: "center",
    padding: responsiveHeight(0.7),
    paddingHorizontal: responsiveWidth(12),
    borderTopWidth: 1,
    // borderTopColor: "rgb(93, 93, 93)rgb(120, 120, 120)",
    borderTopColor: "white",
    // borderBottomWidth: 1,
    // borderBottomColor: "rgb(93, 93, 93)",
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.9)"
  },
  headerBoxText: {
    fontSize: responsiveFontSize(1.9),
    color: "white",
    fontWeight: "600",
    fontFamily: "Roboto"
    // flex: 5
  },
  headerView: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  headerViewBox: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: responsiveHeight(1.5)
  },
  headerViewText: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: "black"
  },
  headerViewTextSmall: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: "400",
    fontFamily: "Roboto",
    color: "black"
  },
  sectionView: {
    margin: responsiveWidth(2),
    justifyContent: "center"
  },
  sectionHeaderText: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: "black",
    width: "100%",
    paddingVertical: responsiveWidth(1)
  },
  table: {},
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "black"
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: responsiveHeight(0.5)
  },
  headerText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: "black"
  },
  tableText: {
    fontSize: responsiveFontSize(1.2),
    color: "black"
  },
  noGameDataText: {
    fontSize: responsiveFontSize(1.8),
    flex: 1,
    padding: responsiveHeight(1),
    textAlign: "center",
    color: "black"
  }
});
