import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Permissions from "react-native-permissions";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PropTypes from "prop-types";

let Torch = null;

export class LightGameBanner extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      gameDay: false
    };
    Torch = require("react-native-torch").default;
  }

  componentDidMount() {
    this.context
      .getAdminSettings()
      .then(settings => {
        if (settings && settings.gameDay == true) {
          this.setState({
            gameDay: settings.gameDay
          });
        }
      })
      .catch(e => {
        console.log("Error getting game day settings", e);
      });
  }

  render() {
    let { navigate } = this.props.navigation;
    // if(this.state.gameDay === true){
    return (
      <TouchableOpacity
        onPress={() => {
          navigate("LightGame");
        }}
      >
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text
              style={styles.bannerText}
              accessibilityLabel="Light it up"
              accessibilityRole="button"
            >
              LIGHT IT UP!
            </Text>
            <FontAwesome
              name="angle-double-right"
              color="white"
              size={responsiveFontSize(5)}
              style={{
                marginLeft: responsiveWidth(2)
              }}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
    // } else {
    //   return null
    // }
  }
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#941E41",
    alignItems: "center",
    justifyContent: "center",
    padding: responsiveWidth(10),
    margin: responsiveWidth(5)
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  bannerText: {
    color: "white",
    fontSize: responsiveFontSize(5.5),
    fontWeight: "bold",
    fontFamily: "Roboto"
  }
});

LightGameBanner.contextTypes = {
  getAdminSettings: PropTypes.func
};
