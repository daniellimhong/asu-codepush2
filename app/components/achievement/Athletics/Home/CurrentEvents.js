import React, { PureComponent } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import AthleticsButton from "../AthleticsButton";
import PressedWrapper from "../../../presentational/PressedWrapper";
import Analytics from "../../../functional/analytics";

export default class CurrentEvents extends PureComponent {
  render() {
    if (!this.props.nextGame) {
      return null;
    } else {
      const {
        ticketmasterUrl,
        imgUrl,
        opponent,
        timeToShow,
        tv,
        gameLink,
        fansWear,
        location
      } = this.props.nextGame;
      const splitTime = timeToShow.split("/");
      const tvString = tv ? `/TV: ${tv}` : "";
      const fansWearSection = fansWear ? (
        <Text style={styles.opponentText}>
          Fans Wear:{" "}
          <Text style={{ fontWeight: "400", fontFamily: "Roboto" }}>
            {fansWear}
          </Text>
        </Text>
      ) : null;

      return (
        <View style={styles.container}>
          <Analytics ref="analytics" />
          <View style={styles.box}>
            <Text style={styles.titleText}>Current Events</Text>
          </View>
          <View style={[styles.box, { justifyContent: "flex-start" }]}>
            <PressedWrapper
              style={[styles.innerContainer, { paddingVertical: 0 }]}
              onPress={() => {
                  this.refs.analytics.sendData({
                    "eventtime": new Date().getTime(),
                    "action-type": "click",
                    "starting-screen": "athletics",
                    "starting-section": "current-events", 
                    "target": "Game Details vs "+opponent,
                    "resulting-screen": "in-app-browser", 
                    "resulting-section": "ESPN: Game Vs "+opponent
                  });
                  this.props.navigation.navigate("InAppLink", {
                    url: gameLink,
                    title: `ASU VS. ${opponent}`
                  })
                }
              }
            >
              <Image
                style={styles.image}
                source={{ uri: imgUrl }}
                resizeMode="contain"
              />
              <View style={{ flex: 4, paddingLeft: responsiveWidth(2) }}>
                <Text style={styles.opponentTitleText}>{opponent}</Text>
                <Text style={styles.opponentText}>
                  {splitTime[0]}{" "}
                  <Text style={{ fontWeight: "400", fontFamily: "Roboto" }}>
                    / {splitTime[1]}
                  </Text>
                </Text>
                <Text style={styles.opponentText}>
                  {location ? location : "TEMPE, AZ"}
                  <Text style={{ fontWeight: "400", fontFamily: "Roboto" }}>
                    {tvString}
                  </Text>
                </Text>
                {fansWearSection}
              </View>
            </PressedWrapper>
          </View>
          {ticketmasterUrl ? (
            <View style={styles.innerContainer}>
              <AthleticsButton
                text={"VIEW TICKETS"}
                onPress={() => 
                  {
                    this.refs.analytics.sendData({
                      "eventtime": new Date().getTime(),
                      "action-type": "click",
                      "starting-screen": "athletics",
                      "starting-section": "current-events", 
                      "target": "Game Details vs "+opponent,
                      "resulting-screen": "in-app-browser", 
                      "resulting-section": "ticketmaster",
                    });
                    this.props.navigation.navigate("InAppLink", {
                      url: ticketmasterUrl ? ticketmasterUrl : "",
                      title: `Tickets VS. ${opponent}`
                    })
                  }
                }
              />
              {
                // <AthleticsButton
                //   text={"CLOSED CAPTIONING"}
                //   onPress={() => console.log("Pressed button")}
                //   isWhite={true}
                //   />
              }
            </View>
          ) : null}
        </View>
      );
    }
  }
}

CurrentEvents.propTypes = {
  nextGame: PropTypes.object,
  navigation: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  container: {
    margin: 15,
    paddingHorizontal: responsiveWidth(5),
    borderColor: "rgb(232, 232, 232)",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    shadowColor: "rgb(232, 232, 232)",
    backgroundColor: "white"
  },
  box: {
    borderBottomWidth: 1,
    borderBottomColor: "rgb(210, 210, 210)",
    marginBottom: responsiveHeight(1.5)
  },
  innerContainer: {
    flexDirection: "row",
    paddingVertical: responsiveHeight(1),
    justifyContent: "space-around",
    alignItems: "center"
  },
  image: {
    flex: 1,
    width: responsiveWidth(20),
    height: responsiveWidth(20)
  },
  titleText: {
    color: "black",
    fontSize: responsiveFontSize(1.9),
    fontWeight: "bold",
    fontFamily: "Roboto",
    marginVertical: responsiveHeight(1),
    marginTop: responsiveHeight(1)
  },
  opponentTitleText: {
    color: "black",
    fontSize: responsiveFontSize(1.4),
    fontWeight: "700",
    fontFamily: "Roboto"
  },
  opponentText: {
    color: "grey",
    fontSize: responsiveFontSize(1.4),
    fontWeight: "bold",
    fontFamily: "Roboto"
  }
});
