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

export default class NewsOrRecommend extends PureComponent {
  
  componentDidMount = () => {    
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null,
      "target": "News",
      "resulting-screen": "news-list",
      "resulting-section": null,
    });
  };

  recommendedHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>Recommended</Text>
        <Text style={styles.headerBlurb}>Based on your affiliations</Text>
      </View>
    );
  };

  headlineHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>Headlines</Text>
        <Text style={styles.headerBlurb}>News around the University</Text>
      </View>
    );
  };

  render() {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: "#e8e8e8" }}>
        <Analytics ref="analytics" />
        <SettingsContext.Consumer>
          {settings => (
            <News
              navigation={this.props.navigation}
              limit={3}
              // roles={["alumni"]}
              roles={settings.roles}
              showHeader={this.recommendedHeader()}
            />
          )}
        </SettingsContext.Consumer>
        <View
          style={{
            marginVertical: 7
          }}
        />
        <News
          navigation={this.props.navigation}
          limit={10}
          showHeader={this.headlineHeader()}
        />
      </ScrollView>
    );
  }
}

let styles = StyleSheet.create({
  header: {
    marginVertical: 5,
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
