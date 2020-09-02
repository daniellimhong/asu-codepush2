import React, { useState, useEffect } from "react";
import axios from "axios";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import ResponsiveImage from "react-native-responsive-image";
import AppLink from "react-native-app-link";
import { DefaultText as Text } from "../../presentational/DefaultText";
import Card from "../../universal/card/index";
import CardSection from "../../universal/card-section/index";
import { ErrorWrapper } from "../error/ErrorWrapper";
import { SettingsContext } from "../../achievement/Settings/Settings";

export default function AppList(props) {
  return (
    <ErrorWrapper>
      <SettingsContext.Consumer>
        {settings => {
          return (
            <AppListContent {...props} sendAnalytics={settings.sendAnalytics} />
          );
        }}
      </SettingsContext.Consumer>
    </ErrorWrapper>
  );
}

function AppListContent(props) {
  const { sendAnalytics } = props;
  const [appList, setAppList] = useState([]);

  useEffect(() => {
    // sendAnalytics({
    //   eventName: "Applist",
    //   eventType: "View",
    //   action: "Loaded App List page"
    // });
    sendAnalytics({
      "action-type": "click",
      "starting-screen": props.navigation.state.params.previousScreen?props.navigation.state.params.previousScreen:null,
      "starting-section": props.navigation.state.params.previousSection?props.navigation.state.params.previousSection:null,
      "target":"Apps",
      "resulting-screen": "asu-apps",
      "resulting-section": null
    });
    fetchAppList();
  }, []);

  async function fetchAppList() {
    const appListResult = await axios.get(
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/app-list"
    );
    setAppList(appListResult.data);
  }

  function renderAppList() {
    return appList.map(app => {
      return (
        <TouchableOpacity
          onPress={() => {
            sendAnalytics({
              "action-type": "click",
              "starting-screen": "asu-apps",
              "starting-section": null, 
              "target":app.appName,
              "resulting-screen": "app-link",
              "resulting-section": null
            });
            openApp(app);
          }}
          key={app.appName}
          accessibilityRole="link"
        >
          <Card>
            <CardSection>
              <View>
                <ResponsiveImage
                  source={{ uri: app.img }}
                  initWidth="80"
                  initHeight="80"
                />
              </View>
              <View
                style={styles.appNameContainer}
                accessible
                accessibilityLabel={`${app.appName}`}
                accessibilityRole="link"
              >
                <Text style={styles.appName}>{app.appName}</Text>
              </View>
            </CardSection>
          </Card>
        </TouchableOpacity>
      );
    });
  }

  function openApp(item) {
    var open = "xyz://"
    
    if(item.deepLink){
      open = item.deepLink
    }

    AppLink.maybeOpenURL(open, {
      appName: item.appName,
      appStoreId: item.appStoreId,
      playStoreId: item.playStoreId
    })
      .then(() => {})
      .catch(err => {
        console.log("error opening app", err);
      });
  }

  return <ScrollView style={styles.container}>{renderAppList()}</ScrollView>;
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    backgroundColor: "#F4F4F4",
    marginBottom: 20
  },
  appNameContainer: {
    flex: 3,
    justifyContent: "center",
    marginLeft: 40
  },
  appName: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  cardSection: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    backgroundColor: "black"
  }
});
