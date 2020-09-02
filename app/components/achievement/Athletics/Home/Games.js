import React, { PureComponent } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import GamesItem from "./GamesItem";
import { getFirstFive } from "./utility";
import Analytics from "./../../../functional/analytics";

export default class Games extends PureComponent {
  state = {
    minimizedGames: [],
    maximizedGames: [],
    minimized: true
  };

  componentDidUpdate(prevProps) {
    if (prevProps.games !== this.props.games) {
      this.setState({
        minimizedGames: getFirstFive(this.props.games)
          ? getFirstFive(this.props.games)
          : null,
        maximizedGames: this.props.games
      });
    }
  }

  pressHandler = () => {
    this.refs.analytics.sendData({
      "eventtime": new Date().getTime(),
      "action-type": "click",
      "starting-screen": "athletics",
      "starting-section": "games-schedule", 
      "target": "All Games",
      "resulting-screen": "athletics", 
      "resulting-section": "games-schedule",
    });
    this.setState({ minimized: this.state.minimized ? false : true });
  };

  render() {
    const whichArray = this.state.minimized
      ? this.state.minimizedGames
      : this.state.maximizedGames;
    const allGamesbutton = this.state.minimized ? (
      <TouchableOpacity style={styles.button} onPress={this.pressHandler}>
        <Text style={styles.buttonText}>All Games</Text>
      </TouchableOpacity>
    ) : null;
    return (
      <View>
        <Analytics ref="analytics" />
        {whichArray.map((u, i, array) => {
          const isLast = i !== array.length - 1 ? false : true;
          return (
            <GamesItem
              key={i}
              imgUrl={u.imgUrl}
              opponent={u.opponent}
              timeToShow={u.timeToShow}
              gameLink={u.gameLink}
              navigation={this.props.navigation}
              ourScore={u.ourScore}
              theirScore={u.theirScore}
              ranked={u.ranked}
              home={u.home}
              i={i}
              isLast={isLast}
            />
          );
        })}
        {allGamesbutton}
      </View>
    );
  }
}

Games.propTypes = {
  navigation: PropTypes.object.isRequired,
  games: PropTypes.array
};

const styles = StyleSheet.create({
  button: {
    borderTopWidth: 1,
    borderTopColor: "rgb(214, 214, 214)",
    justifyContent: "center",
    alignItems: "center",
    padding: responsiveHeight(2),
    paddingBottom: responsiveHeight(1)
  },
  buttonText: {
    color: "#941E41",
    fontSize: responsiveFontSize(1.7),
    fontWeight: "600",
    fontFamily: "Roboto"
  }
});
