import React, { PureComponent } from "react";
import { View, Text, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { getPercent } from "./utility";

export default class GameStatsTeam extends PureComponent {
  _renderTeamStats = (home, opponent) => {
    if (home && opponent) {
      const teamRecord = home.$ && home.$.record ? home.$.record : "";
      const opponentTeamRecord =
        opponent.$ && opponent.$.record ? opponent.$.record : "";
      const us = home.totals && home.totals[0] ? home.totals[0] : "";
      const them =
        opponent.totals && opponent.totals[0] ? opponent.totals[0] : "";
      const usThirdPercentage =
        us.conversions &&
        us.conversions[0] &&
        us.conversions[0].$ &&
        us.conversions[0].$.thirdconv
          ? getPercent(
              us.conversions[0].$.thirdconv,
              us.conversions[0].$.thirdatt
            )
          : "";
      const themThirdPercentage =
        them.conversions &&
        them.conversions[0] &&
        them.conversions[0].$ &&
        them.conversions[0].$.thirdconv
          ? getPercent(
              them.conversions[0].$.thirdconv,
              them.conversions[0].$.thirdatt
            )
          : "";
      const usFourthPercentage =
        us.conversions &&
        us.conversions[0] &&
        us.conversions[0].$ &&
        us.conversions[0].$.fourthconv
          ? getPercent(
              us.conversions[0].$.fourthconv,
              us.conversions[0].$.fourthatt
            )
          : "";
      const themFourthPercentage =
        them.conversions &&
        them.conversions[0] &&
        them.conversions[0].$ &&
        them.conversions[0].$.fourthconv
          ? getPercent(
              them.conversions[0].$.fourthconv,
              them.conversions[0].$.fourthatt
            )
          : "";
      const valuesToDisplay = [
        { home: teamRecord, middle: "-", away: opponentTeamRecord },
        {
          home: us.$ && us.$.totoff_plays ? us.$.totoff_plays : "0",
          middle: "Total Plays",
          away: them.$ && them.$.totoff_plays ? them.$.totoff_plays : "0",
          showRow:
            us.$ && us.$.totoff_plays && them.$ && them.$.totoff_plays
              ? true
              : false,
          id: 0
        },
        {
          home: us.$ && us.$.totoff_yards ? us.$.totoff_yards : "",
          middle: "Total Yards",
          away: them.$ && them.$.totoff_yards ? them.$.totoff_yards : "",
          showRow:
            us.$ && us.$.totoff_yards && them.$ && them.$.totoff_yards
              ? true
              : false,
          id: 1
        },
        {
          home:
            us.firstdowns && us.firstdowns[0].$ && us.firstdowns[0].$.no
              ? us.firstdowns[0].$.no
              : "",
          middle: "First Downs",
          away:
            them.firstdowns && them.firstdowns[0].$ && them.firstdowns[0].$.no
              ? them.firstdowns[0].$.no
              : "",
          showRow:
            us.firstdowns &&
            us.firstdowns[0].$ &&
            us.firstdowns[0].$.no &&
            them.firstdowns &&
            them.firstdowns[0].$ &&
            them.firstdowns[0].$.no
              ? true
              : false,
          id: 2
        },
        {
          home:
            us.conversions &&
            us.conversions[0] &&
            us.conversions[0].$ &&
            us.conversions[0].$.thirdatt &&
            us.conversions[0].$.thirdconv
              ? `${us.conversions[0].$.thirdconv}-${us.conversions[0].$.thirdatt} (${usThirdPercentage}%)`
              : "0%",
          middle: "Third Downs",
          away:
            them.conversions &&
            them.conversions[0] &&
            them.conversions[0].$ &&
            them.conversions[0].$.thirdatt &&
            them.conversions[0].$.thirdconv
              ? `${them.conversions[0].$.thirdconv}-${them.conversions[0].$.thirdatt} (${themThirdPercentage}%)`
              : "0%",
          showRow:
            us.conversions &&
            us.conversions[0] &&
            us.conversions[0].$ &&
            us.conversions[0].$.thirdatt &&
            us.conversions[0].$.thirdconv &&
            them.conversions &&
            them.conversions[0] &&
            them.conversions[0].$ &&
            them.conversions[0].$.thirdatt &&
            them.conversions[0].$.thirdconv
              ? true
              : false,
          id: 3
        },
        {
          home:
            us.conversions &&
            us.conversions[0] &&
            us.conversions[0].$ &&
            us.conversions[0].$.fourthatt &&
            us.conversions[0].$.fourthconv
              ? `${us.conversions[0].$.fourthconv}-${us.conversions[0].$.fourthatt} (${usFourthPercentage}%)`
              : "0%",
          middle: "Fourth Downs",
          away:
            them.conversions &&
            them.conversions[0] &&
            them.conversions[0].$ &&
            them.conversions[0].$.fourthatt &&
            them.conversions[0].$.fourthconv
              ? `${them.conversions[0].$.fourthconv}-${them.conversions[0].$.fourthatt} (${themFourthPercentage}%)`
              : "0%",
          showRow:
            us.conversions &&
            us.conversions[0] &&
            us.conversions[0].$ &&
            us.conversions[0].$.fourthatt &&
            us.conversions[0].$.fourthconv &&
            them.conversions &&
            them.conversions[0] &&
            them.conversions[0].$ &&
            them.conversions[0].$.fourthatt &&
            them.conversions[0].$.fourthconv
              ? true
              : false,
          id: 4
        },
        {
          home:
            us.pass &&
            us.pass[0] &&
            us.pass[0].$ &&
            us.pass[0].$.comp &&
            us.pass[0].$.att &&
            us.pass[0].$.yds
              ? `${us.pass[0].$.comp}/${us.pass[0].$.att} - ${us.pass[0].$.yds}`
              : 0,
          middle: "Passing",
          away:
            them.pass &&
            them.pass[0] &&
            them.pass[0].$ &&
            them.pass[0].$.comp &&
            them.pass[0].$.att &&
            them.pass[0].$.yds
              ? `${them.pass[0].$.comp}/${them.pass[0].$.att} - ${them.pass[0].$.yds}`
              : 0,
          showRow:
            us.pass &&
            us.pass[0] &&
            us.pass[0].$ &&
            us.pass[0].$.comp &&
            us.pass[0].$.att &&
            us.pass[0].$.yds &&
            them.pass &&
            them.pass[0] &&
            them.pass[0].$ &&
            them.pass[0].$.comp &&
            them.pass[0].$.att &&
            them.pass[0].$.yds
              ? true
              : false,
          id: 5
        },
        {
          home:
            us.pass &&
            us.pass[0] &&
            us.pass[0].$ &&
            us.pass[0].$.td &&
            us.pass[0].$.int
              ? `${us.pass[0].$.td}/${us.pass[0].$.int}`
              : "0/0",
          middle: "TD/INT",
          away:
            them.pass &&
            them.pass[0] &&
            them.pass[0].$ &&
            them.pass[0].$.td &&
            them.pass[0].$.int
              ? `${them.pass[0].$.td}/${them.pass[0].$.int}`
              : "0/0",
          showRow:
            us.pass &&
            us.pass[0] &&
            us.pass[0].$ &&
            us.pass[0].$.td &&
            us.pass[0].$.int &&
            them.pass &&
            them.pass[0] &&
            them.pass[0].$ &&
            them.pass[0].$.td &&
            them.pass[0].$.int
              ? true
              : false,
          small: true,
          id: 5
        },
        {
          home:
            us.rush &&
            us.rush[0] &&
            us.rush[0].$ &&
            us.rush[0].$.att &&
            us.rush[0].$.yds
              ? `${us.rush[0].$.att} - ${us.rush[0].$.yds} yds`
              : "0 - 0",
          middle: "Rushing",
          away:
            them.rush &&
            them.rush[0] &&
            them.rush[0].$ &&
            them.rush[0].$.att &&
            them.rush[0].$.yds
              ? `${them.rush[0].$.att} - ${them.rush[0].$.yds} yds`
              : "0 - 0",
          showRow:
            us.$ &&
            us.rush &&
            us.rush[0] &&
            us.rush[0].$ &&
            us.rush[0].$.att &&
            us.rush[0].$.yds &&
            them.rush &&
            them.rush[0] &&
            them.rush[0].$ &&
            them.rush[0].$.att &&
            them.rush[0].$.yds
              ? true
              : false,
          id: 6
        },
        {
          home:
            us.rush && us.rush[0] && us.rush[0].$
              ? `${us.rush[0].$.td ? us.rush[0].$.td : 0}/${
                  us.fumbles[0].$.lost ? us.fumbles[0].$.lost : 0
                }`
              : "0/0",
          middle: "TD/FMBL",
          away:
            them.rush && them.rush[0] && them.rush[0].$
              ? `${them.rush[0].$.td ? them.rush[0].$.td : 0}/${
                  them.fumbles[0].$.lost ? them.fumbles[0].$.lost : 0
                }`
              : "0/0",
          showRow:
            us.rush &&
            us.rush[0] &&
            us.rush[0].$ &&
            them.rush &&
            them.rush[0] &&
            them.rush[0].$
              ? true
              : false,
          small: true,
          id: 6
        },
        {
          home:
            us.penalties &&
            us.penalties[0] &&
            us.penalties[0].$ &&
            us.penalties[0].$.no &&
            us.penalties[0].$.yds
              ? `${us.penalties[0].$.no}-${us.penalties[0].$.yds}`
              : "0-0",
          middle: "Penalties",
          away:
            them.penalties &&
            them.penalties[0] &&
            them.penalties[0].$ &&
            them.penalties[0].$.no &&
            them.penalties[0].$.yds
              ? `${them.penalties[0].$.no}-${them.penalties[0].$.yds}`
              : "0-0",
          showRow:
            us.penalties &&
            us.penalties[0] &&
            us.penalties[0].$ &&
            us.penalties[0].$.no &&
            us.penalties[0].$.yds &&
            them.penalties &&
            them.penalties[0] &&
            them.penalties[0].$ &&
            them.penalties[0].$.no &&
            them.penalties[0].$.yds
              ? true
              : false,
          id: 7
        },
        {
          home:
            us.misc && us.misc[0] && us.misc[0].$ && us.misc[0].$.top
              ? us.misc[0].$.top
              : "",
          middle: "Posession",
          away:
            them.misc && them.misc[0] && them.misc[0].$ && them.misc[0].$.top
              ? them.misc[0].$.top
              : "",
          showRow:
            us.misc &&
            us.misc[0] &&
            us.misc[0].$ &&
            us.misc[0].$.top &&
            them.misc &&
            them.misc[0] &&
            them.misc[0].$ &&
            them.misc[0].$.top
              ? true
              : false,
          id: 8
        }
      ];

      return valuesToDisplay.map((v, i) => {
        const greyed = i % 2 === 1 ? "transparent" : "rgba(189, 189, 189, 0.5)";
        if (v.showRow) {
          return (
            <View
              style={[styles.teamStatsBox, { backgroundColor: greyed }]}
              key={i}
            >
              <Text style={[styles.normalText, { textAlign: "left" }]}>
                {v.home}
              </Text>
              <Text
                style={
                  v.small
                    ? [
                        styles.normalText,
                        { fontSize: responsiveFontSize(1.25) }
                      ]
                    : styles.normalTextBold
                }
              >
                {v.middle}
              </Text>
              <Text style={[styles.normalText, { textAlign: "right" }]}>
                {v.away}
              </Text>
            </View>
          );
        } else {
          return null;
        }
      });
    } else {
      return <Text>Error retreiving data</Text>;
    }
  };
  render() {
    const { home, opponent } = this.props;
    const team = home.$.name;
    const opponentTeam = opponent.$.name;
    return (
      <View style={styles.teamStats}>
        <View style={[styles.teamStatsBox]}>
          <Text style={[styles.titleText, { textAlign: "left" }]}>{team}</Text>
          <Text style={styles.titleText}>vs</Text>
          <Text style={[styles.titleText, { textAlign: "right" }]}>
            {opponentTeam}
          </Text>
        </View>
        {this._renderTeamStats(home, opponent)}
      </View>
    );
  }
}

GameStatsTeam.propTypes = {
  home: PropTypes.object.isRequired,
  opponent: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  teamStats: {
    marginHorizontal: responsiveWidth(2),
    marginVertical: responsiveWidth(3)
  },
  teamStatsBox: {
    paddingHorizontal: responsiveWidth(2),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  titleText: {
    flex: 1,
    fontSize: responsiveFontSize(1.5),
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: "black",
    paddingVertical: responsiveHeight(0.3),
    textAlign: "center"
  },
  normalText: {
    flex: 1,
    fontSize: responsiveFontSize(1.5),
    fontWeight: "400",
    fontFamily: "Roboto",
    color: "black",
    paddingVertical: responsiveHeight(0.2),
    textAlign: "center"
  },
  normalTextBold: {
    flex: 1,
    fontSize: responsiveFontSize(1.4),
    fontWeight: "600",
    fontFamily: "Roboto",
    color: "black",
    paddingVertical: responsiveHeight(0.2),
    textAlign: "center"
  }
});
