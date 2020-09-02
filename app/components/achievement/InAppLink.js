import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  WebView as WKWebView
} from "react-native";
import { HeaderQuick } from "./Header/HeaderQuick";
import { WebView } from "react-native-webview";
import {
  responsiveHeight,
  responsiveWidth
} from "react-native-responsive-dimensions";
import { Icon } from "react-native-elements";
import url from "url";
import PropTypes from "prop-types";
import SafariView from "react-native-safari-view";
import { Api } from "../../services/api";
import Analytics from "./../functional/analytics";
import { handleStartupCookies } from "./../functional/authentication/auth_components/weblogin/cookies";
/**
 * iOS WebView hack
 * Due to limitations within the WebView implementation for iOS, this is
 * necessary to prevent red screens during the development process.
 *
 * This block of code will be used in the associated component below.
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
const injectScript = "(" + String(patchPostMessageFunction) + ")();true";

/**
 * In app WebView component that will allow users to utilize the app's login session.
 *
 * Will also serve as a bridge for any other functionality that needs to be pushed
 * into the webviews.
 *
 * We track the history depth by using "this.navd". Incrementing when navigating and decrementing when hitting the back button.
 * Note:  At the time, the WebView's goBack functionality doesn't fire any events or return any values when we run out of "backable" history.
 *        the this.navd increment/decrement is a workaround for this and allows us to go back to the app when the webview returns to the start.
 */
export class InAppLink extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true,
      tickets: false,
      injectScript: "",
      emplid: null,
      url: this.props.url,
      forceGoBack: this.props.navigation.state.params
        ? this.props.navigation.state.params.forceGoBack
        : false,
      weburl: this.props.navigation.state.params
        ? this.props.navigation.state.params.url
        : null
    };
    this.history = [];
    this.back = false;
    this.onBack = this.onBack.bind(this);
    this._onLoadEnd = this._onLoadEnd.bind(this);
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
    this.onError = this.onError.bind(this);
  }
  static navigationOptions = ({ navigation, screenProps }) => ({
    header: null
  });
  /**
   * Applied scripts should be duplicated inside of onLoadEnd to handle possible
   * race conditions that could result in your script not firing properly.
   */
  componentDidMount = () => {
    this.ticketsInjectedScript();
    if (this.props.sendAnalytics) {
      this.refs.analytics.sendData({
        "action-type": "click",
        target: "Bookstore",
        "starting-screen": this.props.navigation.state.params.previousScreen
          ? this.props.navigation.state.params.previousScreen
          : null,
        "starting-section": this.props.navigation.state.params.previousSection
          ? this.props.navigation.state.params.previousSection
          : null,
        "resulting-screen": "in-app-browser",
        "resulting-section": "bookstore",
        "action-metadata": {
          "screen-type": "webview"
        }
      });
    }
    handleStartupCookies();
  };
  /**
   * When navState changes, check that the WebView is finishing navigating.
   * If the navigation is finishing we increment the "navd" value.
   */
  onNavigationStateChange = navState => {
    if (!navState.navigationType && !navState.loading) {
      // These states mean that the webview firing this event for the last time
      this.back = navState.canGoBack;
    }
    if (navState.url.indexOf("list.follettdiscover.com") >= 0) {
      this.back = false;
    }
    if (
      navState.url.substring(0, 43) ===
      "https://oss.ticketmaster.com/media/passbook"
    ) {
      SafariView.isAvailable()
        .then(
          SafariView.show({
            url: navState.url
          })
        )
        .catch(error => {
          console.log("error opening safari view: ", error);
        });
    } else {
      this.setState({
        weburl: navState.url
      });
    }
  };
  /**
   * When on the Folett site we want to fire this script
   * so that we can get a student's required class books
   */
  handleClassBooks = () => {
    let idScript = function(emplid) {
      let interval = setInterval(function() {
        if (document.getElementById("studentId")) {
          document.getElementById("studentId").value = emplid;
          document.getElementById("submit_btn").click();
          quitIt();
        }
      }, 500);
      function quitIt() {
        clearInterval(interval);
      }
    };
    this.context
      .getTokens()
      .then(tokens => {
        let apiService = new Api(
          "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
          tokens
        );
        apiService.get("/emplid").then(response => {
          let emplid = response["empl_id"];
          let script = "(" + String(idScript) + ")(" + emplid + ");";
          this.setState({
            injectScript: script + injectScript,
            emplid
          });
        });
      })
      .catch(e => {
        console.log(e);
      });
  };
  ticketsInjectedScript = () => {
    let parsed = {
      host: "blank"
    };
    if (this.props.url) {
      parsed = url.parse(this.props.url);
    } else {
      parsed = url.parse(this.state.weburl);
    }
    let urlData = parsed.host;
    if (
      this.props.navigation.state.params &&
      typeof this.props.navigation.state.params.ticketpage != "undefined"
    ) {
      this.setState({
        tickets: true
      });
      if (this.props.navigation.state.params.creds.username != null) {
        let script =
          'if (document.getElementsByClassName("alert-error").length == 0) {let i=0; let a = setInterval(function() { ++i; if (i == 10) { clearInterval(a); } if (document.getElementById("email-login") != null) { document.getElementById("email-login").value = "' +
          this.props.navigation.state.params.creds.username +
          '"; document.getElementById("password").value = "' +
          this.props.navigation.state.params.creds.password +
          '";   document.getElementById("submit-button").click(); clearInterval(a); }},1000)}';
        this.setState({
          injectScript: script
        });
      }
    } else if (
      this.props.navigation.state.params &&
      this.props.navigation.state.params.viewBooks
    ) {
      this.handleClassBooks();
    } else {
      this.setState({
        injectScript: injectScript
      });
    }
  };
  _onLoadEnd = () => {
    if (
      this.props.navigation.state.params &&
      typeof this.props.navigation.state.params.ticketpage == "undefined"
    ) {
      this.handleNavigationChange();
    } else if (
      this.props.navigation.state.params &&
      typeof this.props.navigation.state.params.viewBooks
    ) {
      this.handleClassBooks();
    } else {
      this.tickets();
    }
  };
  handleNavigationChange = () => {
    const script = this.stringJS();
    thisWebView && thisWebView.injectJavaScript(script);
  };
  tickets = () => {
    const script = 'console.log("TEST!!!!")';
    thisWebView && thisWebView.injectJavaScript(script);
  };
  /**
   * Converts the contents of myjs into a String for injection into the WebView.
   */
  stringJS = () => {
    // Attempt to remove ugly Blackboard header on mobile devices
    let myjs = function() {
      try {
        document.getElementsByClassName("global-nav-bar-wrap")[0].remove();
        document.getElementsByClassName("brandingImgWrap")[0].remove();
        document.getElementById("globalNavPageNaletea").style.marginTop = 0;
      } catch (e) {}
      window.postMessage("gotem");
    };
    return "(" + myjs.toString() + ")();";
  };
  onError(error) {
    console.log(error);
    this.props.navigation.goBack();
    //thisWebView.goBack();
    //this.props.navigation.goBack();
  }
  /**
   * Simple function that allows us to use goBack in the WebView if there is history.
   * If there is no history then we navigate out of this component and back to the App itself.
   */
  onBack() {
    if (this.back && !this.state.forceGoBack) {
      thisWebView.goBack();
    } else {
      this.props.navigation.goBack();
    }
  }
  render() {
    const { params } = this.props.navigation.state;
    let url = "";
    let title = "";
    if (this.state.url) {
      url = this.state.url;
      title = this.props.title ? this.props.title : "";
    } else {
      url = params.url;
      title = params.title ? params.title : "";
    }
    let backButton = (
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center"
        }}
      >
        <TouchableOpacity onPress={this.onBack} style={{ width: 40 }}>
          <Icon name="keyboard-arrow-left" size={40} />
        </TouchableOpacity>
      </View>
    );
    return (
      <View style={styles.container}>
        <Analytics ref="analytics" />
        <HeaderQuick
          left={backButton}
          navigation={this.props.navigation}
          title={title}
        />
        {this.state.emplid &&
        this.state.weburl.indexOf("coursedetails") === -1 ? (
          <View
            style={{
              padding: responsiveHeight(1),
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white"
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                color: "#424242",
                fontFamily: "Roboto"
              }}
            >
              Student ID: {this.state.emplid}
            </Text>
          </View>
        ) : null}
        {!this.state.url &&
          this.state.weburl ==
            "https://authenticate.oss.ticketmaster.com/oauth/login?client_id=asustudents.app" &&
          this.props.navigation.state.params.creds.username != null && (
            <View
              style={{
                paddingHorizontal: 5,
                backgroundColor: "#FFFFFF",
                alignContent: "center"
              }}
            >
              <Text
                style={{
                  alignSelf: "center",
                  fontFamily: "Roboto",
                  fontWeight: "bold"
                }}
              >
                Email: {this.props.navigation.state.params.creds.username}{" "}
                Password: {this.props.navigation.state.params.creds.password}
              </Text>
            </View>
          )}
        <WebView
          ref={webview => {
            thisWebView = webview;
          }}
          onLoadStart={() => {
            this.setState({ loading: true });
          }}
          onLoadEnd={() => {
            this._onLoadEnd;
            this.setState({ loading: false });
          }}
          injectedJavaScript={this.state.injectScript}
          allowsInlineMediaPlayback="true"
          source={{ uri: url }}
          onMessage={event => {
            this.setState({ loading: false });
            console.log("on message");
          }}
          onError={this.onError}
          onNavigationStateChange={this.onNavigationStateChange}
        />
      </View>
    );
  }
}
InAppLink.contextTypes = {
  getTokens: PropTypes.func
};
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loading: {
    position: "absolute",
    backgroundColor: "white",
    zIndex: 1,
    top: 0,
    left: 0,
    height: responsiveHeight(100),
    width: responsiveWidth(100)
  }
});
