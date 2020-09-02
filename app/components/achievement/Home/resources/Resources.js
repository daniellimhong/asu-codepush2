import React, { PureComponent } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

import Analytics from "../../../functional/analytics";
import { tracker } from "../../google-analytics";
import { AppSyncComponent } from "../../../functional/authentication/auth_components/appsync/AppSyncApp";
import { getUserInformation } from "../../../../Queries";
import { createResourceIcon } from "./utility";
import {
  getRoleResources,
  getUserResources,
  getResourceItems
} from "./gql/Queries";
import { setUserResources } from "./gql/Mutations";

export class Resourcesx extends PureComponent {
  static defaultProps = {
    asurite: "",
    userResources: []
  };

  getDefaultResources = () => {
    let { defaultResources, roles, asurite } = this.props;
    // asurite === "guest" ? (role = "guest") : (role = roles[0]);
    if (asurite === "guest") {
      roles = ["guest"];
    }
    const defaultRoleResources = defaultResources.filter(
      res => res.name === roles[0]
    );
    const result = defaultRoleResources[0].data;
    return result;
  };

  _onPressResourceHandler = data => {
    const { navigate } = this.props.navigation;
    const { title, url, inapp, screen } = data;
    if (screen) {
      //Code change here; instead of opening URL open another screen #Mishal
      navigate(screen,{previousScreen: "Home", previousSection: "resources"});
    } else if (inapp) {
      navigate("InAppLink", { url, title });
      this.refs.analytics.sendData({
        "action-type": "click",
        "target": "Resources Item",
        "starting-screen": "Home",
        "starting-section": null,
        "resulting-screen": "in-app-browser", 
        "resulting-section": null,
        "target-id":data.title,
        "action-metadata":{
          "title":data.title,
          "target-id":data.title,
        }
      });
    } else {
      this.refs.analytics.sendData({
        "action-type": "click",
        "target": "Resources Item",
        "starting-screen": "Home",
        "starting-section": null,
        "resulting-screen": "preferences", 
        "resulting-section": "home-feed",
        "target-id":data.title,
        "action-metadata":{
          "title":data.title,
          "target-id":data.title,
        }
      });
      tracker.trackEvent("Click", `Resources - title: ${title}`);

      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.error("Don't know how to open URI: " + url);
        }
      });
    }
  };

  _editButtonHandler = () => {
    this.refs.analytics.sendData({
      "action-type": "click",
      "target": "Edit Button",
      "starting-screen": "Home",
      "starting-section": "resources",
      "resulting-screen": "preferences", 
      "resulting-section": "resources"
    });
    tracker.trackEvent("Edit", "Clicked edit button from homescreen resources");

    const { navigate } = this.props.navigation;
    navigate("HomeSettings", { 
      resourcesTab: true, 
      previousScreen:"Home",
      previousSection:"resources-edit-button" });
  };

  mapResources = () => {
    const { userResources, defaultResources, resourceItems } = this.props;
    let resources = [];
    if (userResources && userResources.length) {
      resources = userResources;
    } else if (defaultResources && defaultResources.length) {
      resources = this.getDefaultResources();
    }

    return resources.map((data, index) => {
      if (resourceItems && resourceItems.length > 0) {
        for (let i = 0; i < resourceItems.length; i++) {
          if (data.title === resourceItems[i].name) {
            data.inapp = resourceItems[i].inapp;
            data.isNew = resourceItems[i].isNew;
            data.url = resourceItems[i].url;
            data.screen = resourceItems[i].screen;
          }
        }
      }
      return (
        <TouchableOpacity
          key={index}
          onPress={() => this._onPressResourceHandler(data)}
          accessibilityLabel={data.title}
          accessibilityRole="link"
        >
          <View style={styles.resourceContainer}>
            {createResourceIcon(data.title, responsiveWidth(22), false, true)}
            <View style={styles.textContainer}>
              <Text style={styles.text}>{data.title}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    });
  };

  editButton = () => {
    if (this.props.asurite === "guest") {
      return null;
    } else {
      return (
        <TouchableOpacity
          onPress={() => this._editButtonHandler()}
          accessible={true}
          accessibilityTraits="button"
          accessibilityComponentType="button"
        >
          <View style={styles.editButton}>
            <Text style={styles.editButtonText}>EDIT</Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  // ========
  // RENDER:
  // ========

  render() {
    if (
      (this.props.defaultResources && this.props.defaultResources.length > 0) ||
      (this.props.userResources && this.props.userResources.length > 0)
    ) {
      return (
        <View style={styles.container}>
          <Analytics ref="analytics" />
          {this.mapResources()}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center"
            }}
          >
            <View style={{ flex: 1 }} />
            {this.editButton()}
            <View style={{ flex: 1 }} />
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.loadingContainer}>
          <Analytics ref="analytics" />
          <ActivityIndicator size="large" animating={true} color="#8C1D40" />
        </View>
      );
    }
  }
}

export const Resources = AppSyncComponent(
  Resourcesx,
  getUserInformation,
  getResourceItems,
  getUserResources,
  getRoleResources,
  setUserResources
);

// ============
// STYLESHEET:
// ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    padding: responsiveWidth(6),
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "white"
  },
  resourceContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: responsiveWidth(25),
    margin: responsiveWidth(2),
    marginBottom: responsiveHeight(3)
  },
  textContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: responsiveHeight(2)
  },
  text: {
    fontSize: responsiveFontSize(1.4),
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Roboto"
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20
  },
  editButton: {
    marginVertical: 15,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    width: responsiveWidth(25),
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#a5a5a5",
    padding: responsiveWidth(1.75),
    marginBottom: responsiveHeight(3)
  },
  editButtonText: {
    color: "black",
    fontSize: responsiveFontSize(1.4),
    fontWeight: "bold",
    fontFamily: "Roboto"
  }
});
