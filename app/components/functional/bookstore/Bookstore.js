import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import { InAppLink } from "../../achievement/InAppLink";
import Analytics from "../analytics";

export class Bookstore extends Component {
  render() {
    return (
        <InAppLink
          url={
            "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod/redirect?url=https://cas-conn.betterknow.com/cas-conn/asu-sl/redirectTosl"
          }
          navigation={this.props.navigation}
          title={"Bookstore"}
          sendAnalytics={true}
        />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
