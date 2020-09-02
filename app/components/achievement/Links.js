import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
  SectionList
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Analytics from "./../functional/analytics";
import { tracker } from "./google-analytics.js";
import axios from "axios";
import { ErrorWrapper } from "../functional/error/ErrorWrapper";
import { DefaultText as Text } from "../presentational/DefaultText.js";

/**
 * Simple page to pull any links we would like to render in the Links
 * menu item, in the drawer.
 */
class LinksContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }
  /**
   * On mount, get all the links we want
   */
  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null,
      "target": "Links",
      "resulting-screen": "links", 
      "resulting-section": null,
    });
    let links =
      "https://k7viviyvod.execute-api.us-west-2.amazonaws.com/prod/links";
    axios.get(links).then(response => {
      this.setState({
        data: response.data
      });
    });
  }

  render() {
    if (this.state.data.length > 0) {
      return (
        <View style={styles.container}>
          <Analytics ref="analytics" />
          <SectionList
            renderItem={item => {
              let link;
              if (item.item.inapp) {
                return null;
              } else {
                return (
                  <View style={{ flex: 1, marginVertical: 7, paddingLeft: 30 }}>
                    <TouchableOpacity
                      onPress={() => {
                        this.refs.analytics.sendData({
                          "action-type": "click",
                          "starting-screen": "links",
                          "starting-section": null, 
                          "target": item.item.title,
                          "resulting-screen": "external-browser", 
                          "resulting-section": null,
                        });
                        tracker.trackEvent(
                          "Click",
                          `Link to ${item.item.title}`
                        );
                        Linking.openURL(item.item.url);
                      }}
                      accessibilityRole="link"
                    >
                      <Text style={{ color: "maroon" }}>{item.item.title}</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
            }}
            renderSectionHeader={({ section }) => {
              return (
                <View
                  style={{
                    flexDirection: "row",
                    marginBottom: 10,
                    marginTop: 20,
                    alignItems: "center"
                  }}
                >
                  <Icon
                    accessible={false}
                    name={section.icon}
                    size={20}
                    color={"#464646"}
                  />
                  <Text
                    style={{
                      marginLeft: 10,
                      fontSize: 15,
                      fontFamily: "Roboto"
                    }}
                  >
                    {section.section}
                  </Text>
                </View>
              );
            }}
            sections={this.state.data}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      );
    } else {
      return <Analytics ref="analytics" />;
    }
  }
}

export class Links extends React.Component {
  render() {
    return (
      <ErrorWrapper>
        <LinksContent {...this.props} />
      </ErrorWrapper>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20
  }
});
