import React from "react";
import { AsyncStorage, View, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import Toast from "react-native-easy-toast";

import _ from "lodash";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth
} from "react-native-responsive-dimensions";
import { EventRegister } from "react-native-event-listeners";
import axios from "axios";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { AuthContext } from "../../functional/authentication/auth_components/weblogin/index";
import Analytics from "../../functional/analytics";
import { CFSources, computeCFRender } from "./Utility";
import { Api as ApiService } from "../../../services/api/index";
import { getUserInformation, iSearchHandler } from "../../../Queries";
import { GetHiddenScreensQuery } from "../Home/resources/gql/Queries";
import { client } from "../../../app";
import Testers from "../../../services/shared/testers";

export const SettingsContext = React.createContext();

/**
 * Wrapper component to contain an application inside of
 * it's context, in order to contextualize authenticated
 * user settings and provide personalized experiences
 * on shared devices.
 */
class SettingsContent extends React.PureComponent {
  state = {
    developerRegistry: CFSources,
    homeScreenConfig: [],
    homeOrder: [],
    user: "guest",
    isearchData: {},
    contextualized: false,
    student: false,
    admin_settings: {},
    roles: [],
    chatConvoId: null,
    freshChatConvoId: false,
    getChatConvoIdOverride: () => null,
    setChatConvoIdOverride: () => null,
    HomeScreenFeaturesSet: () => null,
    SetToast: () => null,
    setChatStatus: () => null,
    getAdminSettings: () => null,
    getTokens: () => Promise.resolve(),
    sendAnalytics: () => Promise.resolve()
  };

  static defaultProps = {
    user_info: {},
    asurite: null,
    roles: [],
    tokens: () => Promise.resolve()
  };

  getChildContext() {
    return {
      SetToast: this.setToast,
      getAdminSettings: this.getAdminSettings,
      setChatConvoIdOverride: this.setChatConvoIdOverride,
      setChatStatus: this.setChatStatus
    };
  }

  componentDidMount() {
    const vm = this;
    this.setState({
      HomeScreenFeaturesSet: this.HomeScreenFeaturesSet,
      SetToast: this.setToast,
      getAdminSettings: this.getAdminSettings,
      sendAnalytics: this.sendAnalytics,
      getTokens: this.props.tokens,
      setChatConvoIdOverride: this.setChatConvoIdOverride,
      getChatConvoIdOverride: this.getChatConvoIdOverride,
      setChatStatus: this.setChatStatus
    });
    setTimeout(() => {
      this.checkiIfChatDeactivated();
    }, 1000);
  }

  componentDidUpdate() {
    let isearch = iSearchHandler(this.props.asurite, this.props.user_info);
    if (!_.isEqual(this.state.isearchData, isearch)) {
      this.setUserSettingsContext();
    }
  }

  setChatConvoIdOverride = (convoId) => {
    if (convoId) {
      this.setState({
        freshChatConvoId: true,
        chatConvoId: convoId
      });
    }
  };

  getChatConvoIdOverride = () => {
    const { chatConvoId } = this.state;
    const thisr = this;
    return new Promise(function giveConvoId(resolve) {
      thisr.setState(
        {
          freshChatConvoId: false
        },
        () => {
          resolve(chatConvoId);
        }
      );
    });
  };

  /**
   * Send Analytics using the Analytics ref
   * of form
   * {
   *   eventName: "View_CommunityUnion",
   *   eventType: "View",
   *   action: "Loaded Community Union page"
   * }
   */
  sendAnalytics = (data) => {
    this.refs.analytics.sendData({
      ...data
    });
  };

  /**
   * Sets a namespace for the settings to prevent issues when
   * multiple users save settings to the device.
   */
  setUserSettingsContext = () => {
    let { asurite, roles } = this.props;
    let isearch = iSearchHandler(this.props.asurite, this.props.user_info);
    let hiddenRoutes = [];
    if (asurite && asurite !== "guest") {
      if (
        this.state.user !== asurite ||
        this.state.student !== roles.indexOf("student") > -1 ||
        !_.isEqual(this.state.isearchData, isearch)
      ) {
        // console.log("within setUserSettingsContext");
        client
          .query({
            query: GetHiddenScreensQuery,
            fetchPolicy: "network-only",
            variables: {
              roleName: roles[0]
            }
          })
          .then((response) => {
            if (response.data.getRoleRoutes) {
              hiddenRoutes = response.data.getRoleRoutes.hiddenRoutes;
            }
            this.setState(
              {
                roles,
                student: roles.indexOf("student") > -1,
                user: asurite,
                isearchData: isearch,
                contextualized: true,
                hiddenRoutes
              },
              () => {
                this.HomeScreenFeatures()
                  .then((resp) => {
                    let homeOrder = computeCFRender(resp, asurite);
                    this.setState({
                      homeScreenConfig: resp,
                      homeOrder
                    });
                  })
                  .catch((e) => {
                    console.log("Error getting home screen order", e);
                  });
              }
            );
          })
          .catch((e) => {
            console.log(e);
          });
      }
    } else {
      this.contextualizeAsGuest();
    }
  };

  contextualizeAsGuest = () => {
    let homeOrder = computeCFRender(CFSources, "guest");
    if (this.state.user == "guest" && !this.state.contextualized) {
      // console.log("Guest pass: ", this.state);
      this.setState({
        contextualized: true,
        homeOrder
      });
    }
  };

  /**
   * Comprehensive array of CoreFeature settings on
   * the home page. Array order corresponds to render
   * order.
   * Props correspond to display settings.
   * Ie. Title, Color, Enabled/Disabled
   */
  HomeScreenFeatures = () => {
    return AsyncStorage.multiGet([this.state.user + "HomeScreenFeatures"])
      .then((features) => {
        if (features[0][1] !== null) {
          return Promise.resolve(JSON.parse(features[0][1]));
        } else {
          return Promise.resolve([]);
        }
      })
      .catch((error) => {
        throw error;
      });
  };

  // IMPORTANT FOR RESOURCES REDESIGN
  HomeScreenFeaturesSet = (features) => {
    let homeOrder = computeCFRender(features, this.props.asurite);
    this.setState({
      homeScreenConfig: features,
      homeOrder
    });
    return AsyncStorage.multiSet([
      [this.props.asurite + "HomeScreenFeatures", JSON.stringify(features)]
    ])
      .then(() => {
        return Promise.resolve(true);
      })
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Taking care of Toast here for now
   * @param {*} text
   */
  setToast = (text, length = 5000, position) => {
    let defaultPosition = "bottom";
    try {
      if (position === "center") {
        this.refs.toastCenter.show(text, length);
      } else {
        this.refs.toast.show(text, length);
      }
    } catch (e) {
      console.log("Bad toast from guest probably", e);
    }
  };

  setChatStatus = async (status) => {
    const tokens = await this.props.tokens();
    this.setState(
      {
        chatSettings: {
          chatDeactivated: status,
          optedOut: status
        }
      },
      () => {
        EventRegister.emit("chatStatusUpdated", {});
      }
    );
    const apiService = new ApiService(
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com",
      tokens
    );
    try {
      await apiService.post("/prod/settings/chat-status", {
        chatStatus: status
      });
    } catch (e) {
      console.log(e);
    }
  };

  getAdminSettings = () => {
    let apiService = new ApiService(
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com",
      {}
    );

    return apiService
      .post("/prod/settings", {})
      .then((response) => {
        // If good response, do something
        if (response) {
          response = JSON.parse(response);
          return response;
        } else {
          return {};
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  checkiIfChatDeactivated() {
    const apiService = new ApiService(
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com",
      {}
    );

    return apiService
      .get(`/prod/settings/chat-status?asurite=${this.props.asurite}`)
      .then((response) => {
        this.setState({
          chatSettings: response
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    if (this.state.contextualized) {
      return (
        <SettingsContext.Provider value={this.state}>
          <View style={styles.contentContainer}>
            <Analytics ref="analytics" />
            {this.props.children}
            <Toast
              ref="toast"
              position={"bottom"}
              style={{ backgroundColor: "rgba(0,0,0,0.8)", borderRadius: 15 }}
              textStyle={{ color: "white", fontFamily: "Roboto" }}
            />
            <Toast
              ref="toastCenter"
              positionValue={responsiveHeight(70)}
              style={{ backgroundColor: "rgba(0,0,0,0.8)", borderRadius: 15 }}
              textStyle={{ color: "white", fontFamily: "Roboto" }}
            />
          </View>
        </SettingsContext.Provider>
      );
    } else {
      return <Analytics ref="analytics" />;
    }
  }
}

SettingsContent.childContextTypes = {
  SetToast: PropTypes.func,
  setChatConvoIdOverride: PropTypes.func,
  getAdminSettings: PropTypes.func,
  setChatStatus: PropTypes.func
};

const SettingsAS = AppSyncComponent(SettingsContent, getUserInformation);

/**
 * Settings wrapper component to compose the Settings with the logged in user's asurite
 * via the AuthContext.
 */
class SettingsUser extends React.PureComponent {
  state = {
    asurite: "",
    roles: []
  };

  componentDidMount() {
    this.props
      .tokens()
      .then((tokens) => {
        this.setState({
          asurite: tokens.username,
          roles: orderRoleList(tokens.roleList)
        });
      })
      .catch((e) => {
        console.log("Error in settings wrapper", e);
      });
    this.setTesters();
  }

  setTesters = () => {
    axios
      .get(
        "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/testers"
      )
      .then(function(data) {
        let instance = Testers.getInstance();
        instance.setTesters(data.data.Items);
      });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <SettingsAS
          tokens={this.props.tokens}
          asurite={this.state.asurite}
          roles={this.state.roles}
        >
          {this.props.children}
        </SettingsAS>
      </View>
    );
  }
}

/**
 * Settings wrapper to compose components with the AuthContext
 */
export class Settings extends React.PureComponent {
  render() {
    return (
      <AuthContext.Consumer>
        {(tokens) => (
          <View style={{ flex: 1 }}>
            <SettingsUser tokens={tokens}>{this.props.children}</SettingsUser>
          </View>
        )}
      </AuthContext.Consumer>
    );
  }
}
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1
  }
});

/**
 * Reducer function to order the roles by rendering importance.
 * Ex. A Faculty member that is also a student will get the Faculty
 * experience because their role has a higher priority.
 * @param {*} roles
 */
function orderRoleList(roles = []) {
  const rolePriority = [
    "alumni",
    "graduating",
    "online",
    "student",
    "faculty",
    "staff"
  ];

  try {
    return roles.sort(function(a, b) {
      return rolePriority.indexOf(a) - rolePriority.indexOf(b);
    });
  } catch (e) {
    return ["student"];
  }
}