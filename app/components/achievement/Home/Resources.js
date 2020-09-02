import React from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import PropTypes from "prop-types";
import axios from "axios";
import { Api } from "../../../services/api";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Analytics from "./../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { getUserInformation, getResources } from "../../../Queries";
import { SettingsContext } from "../Settings/Settings";

// Resources Home Section
class ResourcesContentX extends React.Component {
  static defaultProps = {
    asurite: "",
    user_info: {},
    iSearchData: {},
    roles: [],
    resources: []
  };

  render() {
    let { resources } = this.props;
    if (resources && resources.length > 0) {
      return (
        <View
          style={{
            flex: 1,
            margin: 20,
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-start",
            marginBottom: responsiveHeight(5)
          }}
        >
          <Analytics ref="analytics" />
          {resources.map(data => {
            return (
              <TouchableOpacity
                key={"ReourceKey" + data.title.replace(" ", "")}
                onPress={() => {
                  
                  this.refs.analytics.sendData({
                    "action-type": "click",
                    "target": "Resources Item",
                    "starting-screen": "Home",
                    "starting-section": "resources",
                    "resulting-screen": "in-app-browser", 
                    "resulting-section": null,
                    "target-id":data.title,
                    "action-metadata":{
                      "target-id":data.title,
                    }
                  });
                  tracker.trackEvent(
                    "Click",
                    `Resources - title: ${data.title}`
                  );
                  this.props.navigation.navigate("InAppLink", {
                    url: data.url,
                    title: data.title
                  });
                }}
                accessibilityLabel={data.title}
                accessibilityRole="link"
              >
                <View
                  style={{
                    height: responsiveHeight(13),
                    margin: responsiveWidth(2),
                    width: responsiveWidth(25),
                    alignItems: "center",
                    marginBottom: responsiveHeight(5)
                  }}
                >
                  <Image style={styles.image} source={{ uri: data.image }} />
                  <View
                    style={{
                      justifyContent: "flex-start",
                      alignItems: "center"
                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsiveFontSize(1.4),
                        color: "black",
                        fontWeight: "bold",
                        textAlign: "center",
                        paddingTop: responsiveHeight(1),
                        fontFamily: "Roboto"
                      }}
                    >
                      {data.title}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    } else {
      return (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            paddingTop: 20,
            paddingBottom: 20
          }}
        >
          <Analytics ref="analytics" />
          <ActivityIndicator
            size="large"
            animating={this.props.resources.length <= 0}
            color="maroon"
          />
        </View>
      );
    }
  }
}

const ResourcesContent = AppSyncComponent(
  ResourcesContentX,
  getUserInformation,
  getResources
);

export class Resources extends React.PureComponent {
  render() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <ResourcesContent {...this.props} roles={settings.roles} />
        )}
      </SettingsContext.Consumer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  image: {
    height: responsiveWidth(22),
    borderRadius: responsiveWidth(3),
    width: responsiveWidth(22),
    alignItems: "center",
    marginTop: 5
  }
});
