import React from "react";
import { View, StyleSheet } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

import Analytics from "../../functional/analytics";
import { DefaultText as Text } from "../../presentational/DefaultText.js";
import { Images } from "../Images";
import { ProfileTag } from "../Tags";
import TransitionView from "../../universal/TransitionView";

export class ProfessorProfile extends React.PureComponent {
  static defaultProps = {
    leftText: "",
    count: 0,
    navigation: null
  };

  renderProfilePic = () => {
    if (this.props.image) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginRight: responsiveWidth(5)
          }}
        >
          <Images
            defaultSource={require("../assets/placeholder.png")}
            borderColor="white"
            source={[
              { uri: this.props.image },
              require("../assets/placeholder.png")
            ]}
          />
        </View>
      );
    } else {
      return null;
    }
  };

  renderName = () => {
    if (this.props.name) {
      return (
        <View>
          <TransitionView index={1}>
            <Text
              style={[styles.whiteText, { fontSize: responsiveFontSize(1.9) }]}
            >
              Instructor
            </Text>
          </TransitionView>
          <TransitionView index={2}>
            <Text
              style={[
                styles.whiteText,
                { fontSize: responsiveFontSize(2.5), fontWeight: "bold",fontFamily: "Roboto" }
              ]}
            >
              {this.props.name}
            </Text>
          </TransitionView>
        </View>
      );
    } else {
      return null;
    }
  };

  renderLocation = () => {
    if (this.props.location) {
      return (
        <Text style={[styles.whiteText, { fontSize: responsiveFontSize(2.2) }]}>
          {this.props.location}
        </Text>
      );
    } else {
      return null;
    }
  };

  renderEmail = () => {
    const { asurite, navigation, ownerAsurite } = this.props;
    if (asurite && navigation && ownerAsurite) {
      return (
        <TransitionView index={1}>
          <ProfileTag
            text={asurite + "@asu.edu"}
            color="white"
            link={"mailto:" + asurite + "@asu.edu"}
            linkText="Email"
            navigation={navigation}
            asurite={asurite}
            ownerAsurite={ownerAsurite}
            icon="envelope"
            previousSection={"professor-profile"}
            previousScreen={"profile"}
          />
        </TransitionView>
      );
    } else {
      return null;
    }
  };

  renderPhone = () => {
    const { asurite, navigation, ownerAsurite, phone } = this.props;
    if (phone && navigation && asurite && ownerAsurite) {
      return (
        <ProfileTag
          text={this.props.phone}
          color="white"
          link={"tel://" + this.props.phone}
          linkText="Phone"
          navigation={this.props.navigation}
          asurite={this.props.asurite}
          ownerAsurite={this.props.ownerAsurite}
          icon="phone"
          previousSection={"professor-profile"}
          previousScreen={"profile"}
        />
      );
    } else {
      return null;
    }
  };

  render() {
    return (
      <View
        style={{
          backgroundColor: "#0099d6",
          flexDirection: "row",
          padding: responsiveHeight(3)
        }}
      >
        <Analytics ref="analytics" />
        {this.renderProfilePic()}
        <View style={{ flex: 4 }}>
          <TransitionView index={1}>
            {this.renderName()}
            {this.renderLocation()}
            <View style={styles.tagCont}>
              {this.renderEmail()}
              {this.renderPhone()}
            </View>
          </TransitionView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  whiteText: {
    color: "white"
  },
  tagCont: {
    flexDirection: "row",
    paddingTop: responsiveHeight(1),
    paddingBottom: responsiveHeight(1),
    flexWrap: "wrap"
  }
});
