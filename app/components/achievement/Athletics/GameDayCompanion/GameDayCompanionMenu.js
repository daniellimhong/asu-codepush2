import React, { PureComponent } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PressedWrapper from "../../../presentational/PressedWrapper";
import Analytics from "./../../../functional/analytics";
import { tracker } from "../../google-analytics.js";

export default class GameDayCompanionMenu extends PureComponent {
  parkingPressHandler = () => {
    this.refs.analytics.sendData({
      "eventtime": new Date().getTime(),
      "action-type": "click",
      "starting-screen": "gameday-companion",
      "starting-section": null, 
      "target": "PARKING",
      "resulting-screen": "in-app-browser", 
      "resulting-section": "parking-map",
    });
    tracker.trackEvent("Click", `ParkingMap`);
    this.props.navigation.navigate("InAppLink", {
      url:
        "https://gis.m.asu.edu/asucampus/?id=120#!ce/6292?ct/6293,6307,6310,6311,6312,6313,6345,6348,6669,6670,24284",
      title: "Parking Map"
    });
  };

  lightGamePressHandler = () => {
    this.refs.analytics.sendData({
      "eventtime": new Date().getTime(),
      "action-type": "click",
      "starting-screen": "gameday-companion",
      "starting-section": null, 
      "target": "Light It Up",
      "resulting-screen": "light-game", 
      "resulting-section": null,
    });
    tracker.trackEvent("Click", `LightGame`);
    this.props.navigation.navigate("LightGame");
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <Analytics ref="analytics" />
        <PressedWrapper
          style={styles.box}
          onPress={() => {
            this.props.navigation.navigate("FootballTrivia");
          }}
        >
          <Image
            style={styles.image}
            source={require("../../assets/trivia-icon.png")}
            resizeMode="contain"
          />
          <View style={styles.boxItemRight}>
            <Text style={styles.blackText}>Play Trivia</Text>
            <Text style={styles.greyText}>
              Know your Sun Devils? Play trivia!
            </Text>
          </View>
        </PressedWrapper>
        <PressedWrapper style={styles.box} onPress={this.lightGamePressHandler}>
          <Image
            style={styles.image}
            source={require("../../assets/light-icon.png")}
            resizeMode="contain"
          />
          <View style={styles.boxItemRight}>
            <Text style={styles.blackText}>Light It Up</Text>
            <Text style={styles.greyText}>
              Participate in the crowd light show
            </Text>
          </View>
        </PressedWrapper>
        {
          // <PressedWrapper style={styles.box}>
          //   <Image
          //     style={styles.image}
          //     source={require("../../assets/cc-icon.png")}
          //     resizeMode="contain"
          //     />
          //   <View style={styles.boxItemRight}>
          //     <Text style={styles.blackText}>Closed Captioning</Text>
          //     <Text style={styles.greyText}>
          //       Watch live captioning of the broadcast
          //     </Text>
          //   </View>
          // </PressedWrapper>
        }
        <PressedWrapper style={styles.box} onPress={this.parkingPressHandler}>
          <Image
            style={styles.image}
            source={require("../../assets/parking-icon.png")}
            resizeMode="contain"
          />
          <View style={styles.boxItemRight}>
            <Text style={styles.blackText}>Parking</Text>
            <Text style={styles.greyText}>
              View nearby parking availability
            </Text>
          </View>
        </PressedWrapper>
        {
          // <PressedWrapper style={styles.box}>
          //   <Image
          //     style={styles.image}
          //     source={require("../../assets/broadcast-icon.png")}
          //     resizeMode="contain"
          //     />
          //   <View style={styles.boxItemRight}>
          //     <Text style={styles.blackText}>Home broadcast</Text>
          //     <Text style={styles.greyText}>Listen to the in-game broadcast</Text>
          //   </View>
          // </PressedWrapper>
        }
      </ScrollView>
    );
  }
}

GameDayCompanionMenu.propTypes = {
  navigation: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgb(201, 201, 201)"
  },
  box: {
    margin: responsiveWidth(2.5),
    marginBottom: 0,
    flexDirection: "row",
    backgroundColor: "white",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: responsiveHeight(1.5)
  },
  image: {
    flex: 1,
    width: responsiveWidth(16),
    height: responsiveWidth(16)
  },
  boxItemRight: {
    flex: 3,
    justifyContent: "center"
  },
  blackText: {
    fontSize: responsiveFontSize(1.8),
    color: "black"
  },
  greyText: {
    fontSize: responsiveFontSize(1.55),
    color: "grey"
  }
});
