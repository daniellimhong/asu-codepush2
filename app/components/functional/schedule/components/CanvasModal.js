import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  WebView as WKWebView
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth
} from "react-native-responsive-dimensions";
import Modal from "react-native-modal";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";

import { onNavigationStateChange } from "./utility";
import { DefaultText as Text } from "../../../presentational/DefaultText.js";
import { Api } from "../../../../services/api";

// Environment Variables:
// import { CANVAS_URL } from "react-native-dotenv";

let CANVAS_URL = "";

export class CanvasModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    this.getApiInfo();
  }

  getApiInfo = () => {
    this.context.getTokens().then(tokens => {
      const myInit = {
        body: {
          get_api_info: true
        }
      };
      let getApiInfoRequest = new Api(
        "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com",
        tokens
      );
      getApiInfoRequest
        .post("/prod/canvas", myInit.body)
        .then(res => {
          if (res.CANVAS_URL) CANVAS_URL = res.CANVAS_URL;
        })
        .catch(e => console.log("err 1: ", e));
    });
  };

  renderWebView = () => {
    // console.log("CANVAS_URL: ", CANVAS_URL);
    return (
      <View style={{ flex: 1, overflow: "hidden" }}>
        {this.state.loading && (
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
            color="#8C1D40"
          />
        )}
        <WKWebView
          source={{ uri: CANVAS_URL }}
          style={styles.webview}
          onNavigationStateChange={navState =>
            onNavigationStateChange(this.props.parent, navState)
          }
          scrollEnabled={false}
          onLoad={() => this.setState({ loading: false })}
        />
      </View>
    );
  };

  render() {
    return (
      <Modal
        isVisible={this.props.displayCanvasModal}
        transparent={true}
        animationInTiming={1000}
        animationOutTiming={1000}
        backdropTransitionInTiming={1000}
        backdropTransitionOutTiming={1000}
        // useNativeDriver={true}
      >
        <View style={styles.modal}>
          <TouchableOpacity
            style={styles.xIcon}
            onPress={() => this.props.onPressHandler()}
          >
            <FontAwesome name="times" size={responsiveFontSize(2.3)} />
          </TouchableOpacity>
          <Text style={styles.text}>Canvas Authorization</Text>
          {this.renderWebView()}
        </View>
      </Modal>
    );
  }
}

CanvasModal.contextTypes = {
  getTokens: PropTypes.func
};

export const styles = StyleSheet.create({
  modal: {
    paddingVertical: responsiveWidth(5),
    backgroundColor: "white",
    top: responsiveHeight(5),
    bottom: responsiveHeight(5),
    left: responsiveWidth(2.5),
    right: responsiveWidth(2.5),
    alignItems: "center",
    position: "absolute",
    overflow: "visible",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 3.75
  },
  xIcon: {
    flex: 1,
    position: "absolute",
    top: responsiveWidth(2.75),
    right: responsiveWidth(2.75),
    resizeMode: "contain"
  },
  text: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(2.3)
  },
  activityIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center"
  },
  webview: {
    height: responsiveHeight(25),
    width: responsiveWidth(80),
    backgroundColor: "transparent",
    marginBottom: responsiveHeight(2)
  }
});
