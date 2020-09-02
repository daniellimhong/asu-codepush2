import React from "react";
import {
  View,
  AsyncStorage,
  NativeModules,
  StyleSheet,
  Platform,
  AppState,
  PermissionsAndroid
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import PropTypes from "prop-types";
import Permissions from "react-native-permissions";
import { graphql } from "react-apollo";
import { CFList } from "../CoreFeature/CFList";
import { NotificationSetup } from "../../functional/notifications/notificationSetup";
import { Geolocation } from "../../functional/geolocation";
import { Heartbeat } from "../../functional/geolocation/heartbeat";
import { Survey } from "../Survey";
import { SimpleSurvey } from "../Engagements/EngagementSurvey";
import { User } from "../../../services";
import { SettingsContext } from "../Settings/Settings";
import { Auth } from "../../../services/auth";
import { Api } from "../../../services/api";
import {
  GetSurveyQuery,
  SubmitResponseMutation
} from "../../../Queries/AllSurveyQuery";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import BackgroundGeolocation from "react-native-background-geolocation-android";
import PushNotification from "react-native-push-notification";

let runningCheck = 0;
let started = false;
let checkCount = 0;
/**
 * AppSync Augment components
 */
const submitSurveyEngagement = graphql(SubmitResponseMutation, {
  props: props => ({
    submit: submission => {
      // console.log("SUBMISSION HERE", submission);

      props
        .mutate({
          variables: {
            ...submission
          }
          // optimisticResponse: () => ({submitResponse: {...submission, __typename: "SurveyResponse"}}) // Comment when debugging
        })
        .then(resp => {
          console.log("mutation response", resp); // Debug option
        })
        .catch(e => {
          console.log("submission error", e);
          // throw e;
        });
    }
  })
});
/** Augmenting Survey component with GQL */
// Get survey and subscribe
const getSurvey = graphql(GetSurveyQuery, {
  options: {
    fetchPolicy: "network-only"
  },
  props: props => {
    return {
      // Note here, getSurvey corresponds with the query name. While survey is the local prop
      survey: props.data.getSurvey
    };
  }
});

// Survey response submission
const submitResponse = graphql(SubmitResponseMutation, {
  props: props => ({
    submit: submission => {
      props
        .mutate({
          variables: {
            ...submission
          }
        })
        .then(resp => {
          console.log("mutation response", resp); // Debug option
        })
        .catch(e => {
          console.log("submission error", e);
          // throw e;
        });
    }
  })
});
const SurveyWithData = AppSyncComponent(Survey, submitResponse, getSurvey);
const SimpleSurveyWithData = AppSyncComponent(
  SimpleSurvey,
  submitSurveyEngagement
);

/**
 * Home screen of the app.
 */
export default class HomeScreen extends React.PureComponent {
  static navigationOptions = () => ({
    header: null
  });

  constructor(props) {
    super(props);
    this.state = {
      asurite: undefined
    };
  }

  componentWillMount() {
    PushNotification.cancelAllLocalNotifications();
    User("Home").then(username => {
      asurite = username;
      this.setState({ asurite });
      console.log("TOKEN: will set up")
      new NotificationSetup({
        data: this.props.navigation,
        username,
        getTokens: this.context.getTokens
      });
      AsyncStorage.getItem("locationrequest").
        then(status => {
          console.log("HAVE STATUS",status);
          // if (status == null) {
            AsyncStorage.setItem('locationrequest', "true");
            if (Platform.OS != "ios") {
              this.checkForAndroid(username);
            } else {
              this.readyForPerms(username);
            }
          // }
        });
    });

    this.checkForMessagesOnOpen();

    AppState.addEventListener("change", this._checkStatus);

    Auth()
    .getSession()
    .then((tokens) => {
      let apiService = new Api(
        "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod",
        tokens
      );
      apiService.get("/role").then(response => {
        if (response) {
          console.log("ROLESS",response);
          AsyncStorage.setItem("roles",JSON.stringify(response))
          
        }
      }).catch (err =>  {
          console.log("ROLE ERR",err)
          Auth()
          .getSession()
          .then((tokens) => {
            console.log("TOKEN ROLES",tokens.roleList);
            AsyncStorage.setItem("roles",JSON.stringify(tokens.roleList))
          });
      });
  
     
    });
  }

  _checkStatus = state => {
    if (state == "active") {
      console.log("CANCELLING MESSAGES")
      runningCheck = 0;
      started = false;
      this.checkForMessagesFromBg();
      PushNotification.cancelAllLocalNotifications();
    }
  };

  checkForMessagesFromBg() {
    if (!started) {
      // Block for multiple hits at once
      started = true;
      AsyncStorage.multiGet(["goToPage", "actionsData"]).then(resp => {
        const name = resp[0][1];
        const data = resp[1][1];
        if (name) {
          AsyncStorage.multiRemove(["goToPage", "actionsData"]).then(resp => {
            started = false;
            checkCount = 0;
            const parsedData = JSON.parse(data);
            this.context.setChatConvoIdOverride(parsedData.convoId);

            if( parsedData.title === "ASU-sunnybot" ) {
              parsedData.sunnyConvo = true;
              parsedData.title = "Sunny";
            }


            // console.log("PARSED DATA",parsedData);
            this.props.navigation.navigate(name, parsedData);
          });
        } else if (checkCount < 10) {
          // check a few times before assuming null
          started = false;
          checkCount++;
          setTimeout(() => {
            this.checkForMessagesFromBg();
          }, 200);
        } else {
          checkCount = 0;
        }
      });
    }
  }

  checkForMessagesOnOpen() {
    this._interval = setInterval(() => {
      if (!runningCheck) {
        runningCheck = true;
        AsyncStorage.multiGet(["goToPage", "actionsData"]).then(resp => {
          const name = resp[0][1];
          const data = resp[1][1];
          if (name) {
            this.killInterval();
            AsyncStorage.multiRemove(["goToPage", "actionsData"]).then(resp => {
              runningCheck = false;
              const parsedData = JSON.parse(data);
              this.context.setChatConvoIdOverride(parsedData.convoId);
              if( parsedData.title === "ASU-sunnybot" ) {
                parsedData.sunnyConvo = true;
                parsedData.title = "Sunny";
              }
              console.log("PARSED DATA",parsedData);
              this.props.navigation.navigate(name, parsedData);
            });
          } else {
            runningCheck = false;
          }
        });
      }
    }, 2000);

    // Auto kill interval for push after a few seconds
    setTimeout(() => {
      this.killInterval();
    }, 10000);
  }

  componentWillUnmount() {
    clearInterval(this._interval);
  }

  killInterval() {
    clearInterval(this._interval);
  }

  readyForPerms = user => {
    AsyncStorage.getItem("onboarding")
      .then(status => {
        if (status == "aboard") {
          let location;
          let motion;
          Permissions.checkMultiple(["location", "motion"]).then(response => {
            // response is an object mapping type to permission
            console.log('LOCATION CHECK: ',response)
            if (
              response.location == "undetermined" ||
              response.motion == "undetermined"
            ) {
              new Geolocation(user); // Use original transistorsoft plugin for ios only
              new Heartbeat(user);
            } else if (
              response.location == "authorized" ||
              response.motion == "authorized"
            ) {
              new Geolocation(user); // Use original transistorsoft plugin for ios only
              new Heartbeat(user);
            } else {
              console.log("LOCATION BASED DIDNT CATCH OPTION",response);
              BackgroundGeolocation.removeGeofences().then((success) => {
                console.log("[removeGeofences] success");
              }).catch((error) => {
                console.log("[removeGeofences] FAILURE: ", error);
              });
              BackgroundGeolocation.stop();
            }
          });
        } else {
          setTimeout(user => {
            this.readyForPerms(user);
          }, 1000);
        }
      })
      .catch(error => {
        console.log("ERRROR HERE", error);
      });
  };

  checkForAndroid = user => {
    AsyncStorage.getItem("onboarding")
      .then(status => {
        if (status == "aboard") {
          this.getPerms();
        } else {
          setTimeout(user => {
            this.checkForAndroid(user);
          }, 1000);
        }
      })
      .catch(error => {
        console.log("ERRROR HERE", error);
      });
  };

  render() {
    const { navigate } = this.props.navigation;
    /** End - Augmenting Survey component with GQL */
    if (!this.state.asurite) {
      return null;
    }
    return (
      <SettingsContext.Consumer>
        {settings => (
          <View style={styles.container} accessibilityViewIsModal>
            <SimpleSurveyWithData />
            <SurveyWithData />
            <CFList
              homeOrder={settings.homeOrder}
              config={settings.homeScreenConfig}
              isearch={settings.isearchData}
              navigation={this.props.navigation}
              asurite={this.state.asurite}
              roles={settings.roles}
            />
          </View>
        )}
      </SettingsContext.Consumer>
    );
  }

  getPerms = async () => {
    try {

      // [
      //   PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      //   PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      //   PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
      // ]

      // This will not ask all the time
      // If it is denied, it will ask one more time and the
      // user has the option of "never ask again"
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);

      console.log("ANDROID LOCATIONS",granted,PermissionsAndroid.RESULTS.GRANTED);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        NetInfo.isConnected.fetch().then(isConnected => {
          if (isConnected) {
            NativeModules.LocationModule.init();
            navigator.geolocation.getCurrentPosition(
              position => {
                NativeModules.GeofenceModule.init(
                  position.coords.latitude,
                  position.coords.longitude
                );
              },
              error => {
                console.log("Don't have location", error);
                console.log(error);
              }
            );
          } else {
            console.log(
              "ANDROID NOT CONNECTED ************************************ "
            );
          }
        });
      } else {
        console.log(
          "Denied Android Permission ************************************ s"
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };
}

HomeScreen.contextTypes = {
  getTokens: PropTypes.func,
  setChatConvoIdOverride: PropTypes.func,
  client: PropTypes.object,
  AppSyncClients: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDEDED"
  }
});
