import React, { PureComponent } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Text
} from "react-native";
import _ from "lodash";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Analytics from "./../analytics";
import { News } from "./index";
import { SettingsContext } from "../../achievement/Settings/Settings";

export default class RecommendedNews extends PureComponent {

  render() {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: "#e8e8e8" }}>
        <Analytics ref="analytics" />
        <SettingsContext.Consumer>
          {settings => (
            <News
              navigation={this.props.navigation}
              // roles={["alumni"]}
              roles={settings.roles}
              previousScreen={"recommended-news"}
            />
          )}
        </SettingsContext.Consumer>
      </ScrollView>
    );
  }
}

let styles = StyleSheet.create({
  header: {
    marginVertical: 10,
    backgroundColor: "white",
    padding: responsiveWidth(4),
    paddingVertical: responsiveWidth(6)
  },
  headerText: {
    marginBottom: responsiveHeight(0.5),
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  headerBlurb: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: "100",
    fontFamily: 'Roboto',
  }
});
