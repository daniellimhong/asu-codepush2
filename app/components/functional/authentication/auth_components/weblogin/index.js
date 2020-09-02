import React from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  AccessibilityInfo,
  findNodeHandle,
  UIManager,
  AsyncStorage,
  Linking
} from "react-native";
import { WebView } from "react-native-webview";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Auth } from "../../../../../services";
import { Api } from "../../../../../services/api";
import Analytics from "../../../analytics";
import { HeaderQuick } from "../../../../achievement/Header/HeaderQuick";
import { updateCookies, purgeCookies, handleStartupCookies, callApi } from "./cookies";
import base64 from "react-native-base64";
import RNRestart from "react-native-restart";

import axios from "axios";
import DeviceInfo from "react-native-device-info";

const auth = new Auth();

/**
 * patchPostMessageFunction
 *
 * Allows us to get around React Native WebView postMessage
 * problems
 */
const patchPostMessageFunction = function() {
  // var originalPostMessage = window.postMessage;
  // var patchedPostMessage = function(message, targetOrigin, transfer) {
  //   originalPostMessage(message, targetOrigin, transfer);
  // };
  // patchedPostMessage.toString = function() {
  //   return String(Object.hasOwnProperty).replace(
  //     "hasOwnProperty",
  //     "postMessage"
  //   );
  // };
  // window.postMessage = patchedPostMessage;
  window.postMessage = function(data) {
    window.ReactNativeWebView.postMessage(data);
  };
};

/**
 * injectScript
 *
 * Allows us to get around React Native WebView postMessage
 * problems
 */
const injectScript = "(" + String(patchPostMessageFunction) + ")();true";

export const AuthContext = React.createContext();

export class WebLogin extends React.Component {
  static navigationOptions = ({ navigation, screenProps }) => ({
    title: "WebLogin",
  });

  // route: ["splash", "webview", "app", "logout"]

  constructor(props) {
    super(props);
    this.state = {
      firstLoad: true,
      signedIn: false,
      route: "splash",
      guest: true,
      usedApp: false,
      tokens: {},
      api: null,
    };
    this._onMessage.bind(this);
    this.logout.bind(this);
  }

  guestStatus = () => {
    return this.state.guest;
  };

  /**
   * Token wrapper to be used by child components that want to access tokens
   * through context
   */
  tokenManager = () => {
    if (typeof this.state.tokens == "object") {
      return auth
        .validateTokens(
          this.props.appid,
          Object.entries(this.state.tokens),
          this.props.refresh
        )
        .then((response) => {
          if (this.state.tokens.SessionToken !== response) {
            this.state.tokens = response;
          }
          return Promise.resolve(response);
        })
        .catch((error) => {
          if (this.state.guest == false) {
            this.logout();
          } else {
            callApi({"message": "failed validating tokens and making guest"})
            return auth.getGuestSession().then((tokens) => {
              this.state.tokens = tokens;
              return Promise.resolve(tokens);
            });
          }
        });
    } else {
      this.logout();
    }
  };

  /**
   * Logout function clears local session and removes weblogin cookies
   *
   *  === Some Testing Code For Logout Button ===
   *    clearWebviewCookies()
   *    .then(() => {
   *      handleStartupCookies()
   *    })
   */
  logout() {
    auth.clearSession();
    purgeCookies();

    this.setState({
      guest: true,
      signedIn: false,
      tokens: {},
      route: "logout",
    });
  }

  getChildContext() {
    let lgt = this.logout;

    return {
      logout: lgt.bind(this),
      getTokens: this.tokenManager,
      guestStatus: this.guestStatus,
    };
  }

  /**
   * Check for existing session using Auth service.
   * If getSession() is bad user must sign in
   */

  handleOpenURL = (url) => {
    console.log("url: ", url);
    if (url && url.url && url.url.indexOf("home" > -1)) {
      var b64 = url.url.split("asumobile://home/")[1];
      var decode = base64.decode(b64);
      this.getLoginFromExternal(decode);
    } else if (url && url.indexOf("home" > -1)) {
      var b64 = url.split("asumobile://home/")[1];
      var decode = base64.decode(b64);
      this.getLoginFromExternal(decode);
    } else {
      callApi({"message": "invalid url attempted to open"})
      console.log("INVALID URL: ", url);
    }
  };
  handleDeepLinkingRequests = () => {
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          this.handleOpenURL(url);
        }
      })
      .catch((error) => {
        callApi({"message": "did fail handling deep linking"})
        console.log(error);
      });
  };
  componentDidMount() {
    var status = false;
    var guest = true;
    var route = "splash";
    if (Platform.OS === "android") {
      Linking.addEventListener("url", this.handleOpenURL);
      this.handleDeepLinkingRequests();
    }
    auth
      .getSession(this.props.appid, this.props.refresh)
      .then((data) => {
        if (data && data.SessionToken !== null && data.SessionToken !== false) {
          status = true;
          route = "app";

          if (data.username !== "guest") {
            guest = false;
          }
        }

        this.setState(
          {
            signedIn: status,
            usedApp: status,
            tokens: data,
            guest: guest,
            route: route,
            firstLoad: false,
          },
          () => {
            handleStartupCookies();
          }
        );
      })
      .catch((error) => {
        console.log("Unable to get session on start", error, this.state);

        this.setState(
          {
            firstLoad: false,
          },
          () => {
            handleStartupCookies();
          }
        );
      });
  }

  componentDidUpdate() {}

  /**
   * Remove connectionChange listener when component is unavailable
   */
  componentWillUnmount() {
    clearTimeout(this.focusTimeout);
  }

  /**
   * When a message is returned we want to parse the data for success
   * and handle any possible errors or update the sign in status after
   * storing the data
   *
   * In the case of an error we tell the component to log out of CAS.
   *
   * @param {*} message
   */
  _onLoadEnd() {
    this.handleNavigationChange();
  }

  _onLogoutEnd() {
    RNRestart.Restart();
  }

  getLoginFromExternal(e) {
    let tokens = JSON.parse(e);
    console.log("TOKENS?",tokens)
    tokens = tokens.AccessKeyId ? tokens : JSON.parse(tokens);
    if (tokens.AccessKeyId) {
      var response = tokens; // unverified response
      auth
        .setSession(tokens)
        .then((data) => {
          if (data) {
            this.setState(
              {
                signedIn: true,
                tokens: response, // if setSession was successful then the response was verified as valid
                guest: false,
                route: "app",
                usedApp: true,
              },
              () => {
                updateCookies();
              }
            );
          }
        })
        .catch((error) => {
          callApi({"message": "failed getting session for getLoginFromExternal"})
          this.logout();
          throw error;
        });
    }
  }
  handleNavigationChange() {
    const script = `
      var bodyText = document.getElementsByTagName("BODY")[0].innerHTML;
      if (bodyText.includes("You must give permission")) {
        window.ReactNativeWebView.postMessage(JSON.stringify({guestRedirect: true}))
      }
      if(document.getElementById("ASUTokenHolderGo")){
        window.ReactNativeWebView.postMessage(document.getElementById("ASUTokenHolderGo").innerHTML)
      } else if(document.getElementById("logout_complete")){

        function checkComplete(){
          if(document.getElementById("logout_complete").style && document.getElementById("logout_complete").style.display == "block"){
            i = null;
            window.ReactNativeWebView.postMessage(JSON.stringify({logoutComplete: true}))
          }
        }

        function setIntervalAndExecute(fn, t) {
          fn();
          return(setInterval(fn, t));
        }

        var i = setIntervalAndExecute(checkComplete, 500);
      }
    `;
    thisWebView && thisWebView.injectJavaScript(script);
  }
  _onMessage(e) {
    try {
      if (JSON.parse(e).guestRedirect) {
        setTimeout(() => {
          this.setState({
            signedIn: false,
            tokens: {}, // if setSession was successful then the response was verified as valid
            guest: true,
            usedApp: false,
            route: "app",
          });
        }, 2000);
      } else if (JSON.parse(e).logoutComplete) {
        this.setState({
          signedIn: false,
          tokens: {}, // if setSession was successful then the response was verified as valid
          guest: true,
          usedApp: false,
          route: "splash",
        });
      } else {
        let tokens = JSON.parse(e);
        tokens = tokens.AccessKeyId ? tokens : JSON.parse(tokens);
        if (tokens.AccessKeyId) {
          var response = tokens; // unverified response
          auth
            .setSession(tokens)
            .then((data) => {
              callApi({"message": "did set session"})
              if (data) {
                this.setState(
                  {
                    signedIn: true,
                    tokens: response, // if setSession was successful then the response was verified as valid
                    guest: false,
                    route: "app",
                    usedApp: true,
                  },
                  () => {
                    updateCookies();
                  }
                );
              }
            })
            .catch((error) => {
              callApi({"message": "failed setting session, forcing logout"})
              this.logout();
              throw error;
            });
        }
      }
    } catch (e) {
      this.logout();
    }
  }

  setAccessibilityFocus() {
    const FOCUS_ON_VIEW = 8;
    const nodeHandle = findNodeHandle(this.firstButton);
    this.focusTimeout = setTimeout(() => {
      Platform.OS === "ios"
        ? AccessibilityInfo.setAccessibilityFocus(nodeHandle)
        : UIManager.sendAccessibilityEvent(nodeHandle, FOCUS_ON_VIEW);
    }, 500);
  }


  onNavigationStateChange(navState) {
    var data = navState.title;
    if (data == "https://app.m.asu.edu/auth?error=access_denied") {
      setTimeout(() => {
        auth
          .getGuestSession()
          .then((tokens) => {
            this.refs.analytics.sendData({
              "action-type": "view",
              target: "Continue as Guest",
              "starting-screen": "login",
              "starting-section": null,
              "resulting-screen": "Home",
              "resulting-section": null,
            });
            this.setState({
              tokens: tokens,
              route: "app",
              signedIn: false,
              guest: true,
              usedApp: false,
            });
          })
          .catch((e) => {
            console.log(e);
          });
      }, 3000);
    }
  }
  _onNavigationStateChange(nav) {
    var data = nav.title;
    if (data == "" && !this.state.usedApp) {
      this.setState({
        route: "webview",
      });
    } else if (this.state.usedApp) {
      setTimeout(() => {
        this.setState({
          route: "splash",
        });
      }, 2000);
    }
  }
  render() {

    if (this.state.firstLoad) {
      callApi({"message": "did hit first load"})
      return <View style={{ flex: 1, backgroundColor: "white" }} />;
    }
    if (this.state.route == "webview") {
      callApi({"message": "did open webview"})
      let leftNav = (
        <TouchableWithoutFeedback
          onPress={() => {
            this.setState({
              route: "splash",
            });
          }}
          style={{ flex: 0 }}
        >
          <Icon name="navigate-before" size={40} color="black" />
        </TouchableWithoutFeedback>
      );

      if (Platform.OS == "android") {
        Linking.openURL(
          "https://weblogin.asu.edu/serviceauth/oauth2/native/allow?client_id=asu-mobile-app&code_challenge_method=plain&scope=test&redirect_uri=https://app.m.asu.edu/auth&response_type=code&code_challenge=test&state=android"
        );
        return (
          <View style={{ flex: 1 }}>
            <HeaderQuick left={leftNav} title={"ASU Login"} />
            <Analytics ref="analytics" />
            <View>
              <Text>Logging In..</Text>
            </View>
          </View>
        );
      } else {
        return (
          <View style={{ flex: 1 }}>
            <HeaderQuick left={leftNav} title={"ASU Login"} />
            <Analytics ref="analytics" />

            <WebView
              source={{
                uri:
                  "https://weblogin.asu.edu/serviceauth/oauth2/native/allow?client_id=asu-mobile-app&code_challenge_method=plain&scope=test&redirect_uri=https://app.m.asu.edu/auth&response_type=code&code_challenge=test&state=test",
              }}
              sendCookies={true}
              ref={(webview) => {
                thisWebView = webview;
              }}
              onLoadEnd={this._onLoadEnd.bind(this)}
              injectedJavaScript={injectScript}
              onMessage={(event) => this._onMessage(event.nativeEvent.data)}
              onNavigationStateChange={this.onNavigationStateChange.bind(this)}
            />
          </View>
        );
      }
    } else if (this.state.route == "logout") {
      callApi({"message": "did logout"})
      let leftNav = (
        <TouchableWithoutFeedback
          onPress={() => {
            this.setState({
              route: "splash",
            });
          }}
          style={{ flex: 0 }}
        >
          <Icon name="navigate-before" size={40} color="black" />
        </TouchableWithoutFeedback>
      );
      if (Platform.OS == "android") {
        Linking.openURL("https://webapp4.asu.edu/myasu/Signout");
        this.setState({
          signedIn: false,
          tokens: {}, // if setSession was successful then the response was verified as valid
          guest: true,
          usedApp: false,
          route: "splash",
        });
        RNRestart.Restart();
        return (
          <View style={{ flex: 1 }}>
            <HeaderQuick left={leftNav} title={"ASU Login"} />
            <Text>Logging out..</Text>
          </View>
        );
      } else {
        return (
          <View style={{ flex: 1 }}>
            <HeaderQuick left={leftNav} title={"ASU Login"} />

            <WebView
              source={{ uri: "https://webapp4.asu.edu/myasu/Signout" }}
              sendCookies={true}
              thirdPartyCookiesEnabled
              ref={(webview) => {
                thisWebView = webview;
              }}
              onLoadEnd={this._onLogoutEnd.bind(this)}
              injectedJavaScript={injectScript}
              onMessage={(event) => this._onMessage(event.nativeEvent.data)}
              onNavigationStateChange={this._onNavigationStateChange.bind(this)}
            />
          </View>
        );
      }
    } else if (this.state.route == "app") {
      callApi({"message": "did set app route"})
      return (
        <AuthContext.Provider value={this.tokenManager}>
          <View style={styles.contentContainer}>{this.props.children}</View>
        </AuthContext.Provider>
      );
    } else {

      AsyncStorage.getAllKeys().then((keys) => {

        callApi({"message": "is clearing storage"})
        var final = []

        var ignoreKeys = [
          "covid_onboarding",
          "username",
          "AccessKeyId",
          "SecretAccessKey",
          "SessionToken",
          "Expiration",
          "Refresh",
          "role",
          "roleList",
          "oauthRefresh",
        ];
        keys.map((item) => {
          if (ignoreKeys.indexOf(item) === -1) {
            final.push(item);
          }
        });
        console.log(final);
        AsyncStorage.multiRemove(final);
      });

      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
          }}
        >
          <Analytics ref="analytics" />
          <View style={{ flex: 1 }} />
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flex: 2,
            }}
          >
            <Image
              style={{
                height: responsiveHeight(40),
                width: responsiveWidth(80),
              }}
              resizeMode="contain"
              source={require("./asu-logo.png")}
            />
          </View>
          <View
            style={{
              flex: 1,
            }}
          >
            <View
              style={{
                backgroundColor: "#B72746",
                paddingHorizontal: 30,
                borderRadius: 50,
                width: responsiveWidth(65),
              }}
            >
              <TouchableWithoutFeedback
                onPress={() => {
                  this.refs.analytics.sendData({
                    "action-type": "click",
                    target: "ASU Login",
                    "starting-screen": "login",
                    "starting-section": null,
                    "resulting-screen": "in-app-browser",
                    "resulting-section": "web-login",
                  });
                  this.setState({
                    route: "webview",
                  });
                }}
                ref={(firstButton) => {
                  this.firstButton = firstButton;
                }}
                accesible={true}
                accessibilityRole="button"
              >
                <View
                  style={{
                    padding: responsiveWidth(4),
                    alignContent: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    accessibilityLabel="A.S.U. Log In"
                    accessibilityRole="button"
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: 15,
                      textAlign: "center",
                      fontFamily: "Roboto",
                    }}
                  >
                    ASU LOG IN
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>

            <View style={{ paddingTop: 20 }}>
              <TouchableWithoutFeedback
                onPress={() => {
                  auth
                    .getGuestSession()
                    .then((tokens) => {
                      this.refs.analytics.sendData({
                        "action-type": "view",
                        target: "Continue as Guest",
                        "starting-screen": "login",
                        "starting-section": null,
                        "resulting-screen": "Home",
                        "resulting-section": null,
                      });
                      this.setState({
                        tokens: tokens,
                        route: "app",
                        signedIn: false,
                        guest: true,
                        usedApp: false,
                      });
                    })
                    .catch((e) => {
                      console.log(e);
                    });
                }}
                accessibilityRole="button"
              >
                <View
                  style={{
                    height: 45,
                    alignContent: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    accessibilityRole="button"
                    style={{
                      fontSize: 15,
                      textAlign: "center",
                      color: "#808080",
                    }}
                  >
                    Continue as Guest
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          <View style={{ flex: 1 }} />
        </View>
      );
    }
  }
}

WebLogin.contextTypes = {
  children: PropTypes.element,
  signedIn: PropTypes.bool,
  tokens: PropTypes.object,
};

WebLogin.childContextTypes = {
  logout: PropTypes.func,
  getTokens: PropTypes.func,
  guestStatus: PropTypes.func,
};

export class AuthStatus extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      authd: false,
    };
  }
  componentDidMount() {
    this.context
      .getTokens()
      .then((tokes) => {
        if (tokes.username && tokes.username !== "guest") {
          this.setState({
            authd: true,
          });
        }
      })
      .catch((e) => {});
  }

  activate() {
    const ModalContent = () => {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 30,
            marginTop: 20,
          }}
        >
          <View style={{ flex: 1 }}>
            <Image
              resizeMode="contain"
              style={{ height: responsiveHeight(15) }}
              source={require("./asu-logo.png")}
            />
          </View>
          <View style={{}}>
            <Text
              style={{
                fontSize: 25,
                fontWeight: "bold",
                fontFamily: "Roboto",
                color: "#941E41",
              }}
            >
              Welcome!
            </Text>
          </View>
          <View style={{ flex: 1, marginTop: 10 }}>
            <Text style={{ textAlign: "center", lineHeight: 20 }}>
              You are currently viewing this app as a guest
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ textAlign: "center", lineHeight: 20 }}>
              For a more personalized experience including customized news
              feeds, interests and events, please login below.
            </Text>
          </View>

          <View style={{ flex: 1, paddingTop: 20 }}>
            <View
              style={{
                backgroundColor: "#941E41",
                paddingHorizontal: 30,
                borderRadius: 10,
              }}
            >
              <TouchableWithoutFeedback
                onPress={() => {
                  this.context.logout();
                }}
                accessibilityRole="button"
              >
                <View
                  style={{
                    height: 45,
                    alignContent: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: 15,
                      textAlign: "center",
                      fontFamily: "Roboto",
                    }}
                  >
                    ASU Affiliate Login
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>

            <View style={{ paddingTop: 10 }}>
              <TouchableWithoutFeedback
                onPress={() => {
                  this.context.setModalVisible(false);
                }}
                accessibilityRole="button"
              >
                <View
                  style={{
                    height: 45,
                    alignContent: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 15, textAlign: "center" }}>
                    Continue as Guest
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
      );
    };

    this.context.setModalContent(ModalContent);
    this.context.setModalVisible(true);
  }

  render() {
    if (!this.state.authd) {
      return (
        <TouchableWithoutFeedback
          onPress={() => {
            this.activate();
          }}
          accessibilityRole="button"
        >
          <View
            style={{
              backgroundColor: "#A20336",
              height: 50,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "white" }}>Viewing as Guest.</Text>
              <Text
                style={{
                  marginLeft: 5,
                  color: "white",
                  fontWeight: "bold",
                  fontFamily: "Roboto",
                }}
              >
                Learn More ...
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      return null;
    }
  }
}

AuthStatus.contextTypes = {
  getTokens: PropTypes.func,
  logout: PropTypes.func,
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func,
};

/**
 * A simple HOC to render/hide components when a user is unauthenticated
 * @param {*} Component
 */
export function WLHOC(Component) {
  class WLComp extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        authd: false,
      };
    }
    componentDidMount() {
      this.context
        .getTokens()
        .then((tokes) => {
          if (tokes.username && tokes.username !== "guest") {
            this.setState({
              authd: true,
            });
          }
        })
        .catch((e) => {});
    }
    render() {
      if (this.state.authd) {
        return <Component navigation={this.props.navigation} />;
      } else {
        return null;
      }
    }
  }
  WLComp.contextTypes = {
    getTokens: PropTypes.func,
  };

  return WLComp;
}

export class AuthRender extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      authd: false,
      username: null,
      roleList: [],
    };
  }

  static defaultProps = {
    type: null,
  };

  componentDidMount() {
    this.context
      .getTokens()
      .then((tokes) => {
          let apiService = new Api(
            "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod",
            tokes
          );
          apiService.get("/role").then(response => {
            if (response) {
              AsyncStorage.setItem("roles",JSON.stringify(response))
              this.setState({
                roleList: response
              })
            }
          }).catch (err =>  {
            this.setState({
                roleList: response
            })
          });
        if (tokes.username && tokes.username !== "guest") {
          this.setState({
            authd: true,
            username: tokes.username,
          });
        }
      })
      .catch((e) => {});
    // AsyncStorage.getItem("roleList").then((roleList) => {
    //   this.setState({ roleList });
    // });
  }

  render() {
    let { type } = this.props;
    if (this.state.authd) {
      if (type === "chat") {
        if (!this.state.roleList.includes("student")) {
          return null;
        }
      }
      if (type === "law") {
        if (!this.state.roleList.includes("law")) {
          return null;
        }
      }
      if (type === "online") {
        if (!this.state.roleList.includes("online")) {
          return null;
        }
      }

      if (type === "online_notstaff") {
        if (!this.state.roleList.includes("online")) {
          return null;
        } else {
          if (this.state.roleList.indexOf("employee") > -1) {
            return null;
          }
        }
      }

      if (type == "not_online") {
      if (this.state.roleList.indexOf("employee") == -1) {
        if (this.state.roleList.includes("online")) {
          return null;
        }
      }
      }
      return this.props.children;
    } else {
      return null;
    }
  }
}
AuthRender.contextTypes = {
  getTokens: PropTypes.func,
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
});
