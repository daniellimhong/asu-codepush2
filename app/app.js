/**
 * Arizona State University - Official Mobile App
 * https://www.asu.edu
 * @2017
 */

import React, { Component } from "react";
import { Platform, StyleSheet, View, SafeAreaView } from "react-native";

import { Settings } from "./components/achievement/Settings/Settings";
import AppNav from "./components/achievement/appNavigation";
import { Onboarding } from "./components/achievement/Onboarding";
import { WebLogin } from "./components/functional/authentication/auth_components/weblogin/index";
import { HomeModal } from "./components/achievement/Home/HomeModal";
import { Auth } from "./services";
import AppSyncApp from "./components/functional/authentication/auth_components/appsync/AppSyncApp";
import { awsAuthConfig } from "./aws-exports";
import RNExitApp from "react-native-exit-app";
import { Crashlytics } from "react-native-fabric";
import SplashScreen from "react-native-splash-screen";
import { MenuProvider } from "react-native-popup-menu";
import { defaultDataIdFromObject } from "apollo-cache-inmemory";
import { CanvasProvider } from "./components/functional/authentication/canvas_context/CanvasContext";
import Covid19Onboarding from "./components/achievement/Home/covid19Wellness/Covid19onboarding";
import { callApi } from "./components/functional/authentication/auth_components/weblogin/cookies";
import AWSAppSyncClient from "aws-appsync";
import codePush from "react-native-code-push";

const id = "N2FtUnNrUXJ0S3pBYWNoaWV2ZW1lbnQ=";
const ref =
  "https://mcuwjen7gc.execute-api.us-west-2.amazonaws.com/prod/orefresh";
  const auth = new Auth();

export const client = new AWSAppSyncClient({
  url: awsAuthConfig.graphqlEndpoint,
  region: awsAuthConfig.region,
  disableOffline: false,
  auth: {
    type: "AWS_IAM",
    credentials: () => {
      return auth
        .getSession(id, ref)
        .then((tokens) => {
          return {
            accessKeyId: tokens.AccessKeyId,
            secretAccessKey: tokens.SecretAccessKey,
            sessionToken: tokens.SessionToken,
          };
        })
        .catch((e) => {
          try {
            callApi({"message": "auth tokens did fail for appsync"})
          } catch(e) {}

          // console.log("Client spinup failed: ", e);
        });
    },
  },
  cacheOptions: {
    dataIdFromObject: (object) => {
      switch (object.__typename) {
        case "Message":
          return "Message:" + object.messageId; // use `key` as the primary key
        default:
          return defaultDataIdFromObject(object); // fall back to default handling
      }
    },
  },
});

console.disableYellowBox = true;

export class App extends Component {
  _timeout = null;

  componentDidCatch(error, info) {
    this.setState({ hasError: true });

    if (Platform.OS === "ios") {
      Crashlytics.recordError(error.toString());
    } else {
      Crashlytics.logException(error.toString());
    }

    this._timeout = setTimeout(() => {
      if (!__DEV__) {
        RNExitApp.exitApp();
      }
    }, 200);
  }

  componentWillMount() {
    setTimeout(() => {
      SplashScreen.hide();
    }, 2000);
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <MenuProvider>
          <View style={styles.container}>
            <WebLogin appid={id} refresh={ref}>
              <AppSyncApp client={client}>
                <Settings>
                  <HomeModal>
                    {/* <Onboarding style={{ flex: 1 }}> */}
                    <Covid19Onboarding />
                    <CanvasProvider>
                      <AppNav />
                    </CanvasProvider>
                    {/* </Onboarding> */}
                  </HomeModal>
                </Settings>
              </AppSyncApp>
            </WebLogin>
          </View>
        </MenuProvider>
      </SafeAreaView>
    );
  }
}

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
};

export default codePush(codePushOptions)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
