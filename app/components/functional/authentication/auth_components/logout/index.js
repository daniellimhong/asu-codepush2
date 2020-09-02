import React, { useState, useEffect } from "react";
import {
  Button,
  Text,
  View,
  TouchableOpacity,
  AsyncStorage
} from "react-native";
import PropTypes from "prop-types";
import Axios from "axios";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { Api } from "../../../../../services/api";
import { CanvasContext } from "../../canvas_context/CanvasContext";

import useGlobal from "../../../global-state/store";
import {responsiveFontSize, responsiveWidth, responsiveHeight} from "react-native-responsive-dimensions";

/**
 * Logout component to be placed in application without knowledge
 * of application structure.
 *
 * Uses Context
 */


function LogOutGlobalState(props){
  const [globalState, globalActions] = useGlobal();

  useEffect(()=> {
    if(props.removeGlobal){
      globalActions.setSDRLoginStatus(false);
      globalActions.setCampusWeekSchedule(false);
      props.context.logout();
    }
  })
  return null;
}

export class LogoutX extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "LOG OUT",
      removeGlobal: false
    };
  }

  static defaultProps = {
    inludeLogoutProcess: () => null
  };

  componentDidMount() {
    this.context
      .getTokens()
      .then(tokens => {
        if (tokens.username == "guest") {
          this.setState({
            text: "LOG IN"
          });
        }
      })
      .catch(err => {
        this.setState({
          text: "LOG IN"
        });
      });
  }
  resetLiveCards = () => {
    return AsyncStorage.setItem("cachedCards", "")
      .then(resp => { })
      .catch(e => {
        console.log("Clear livecards failed: ", e);
      });
  };

  removeItem = async key => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (exception) {
      return false;
    }
  };

  onPressHandler = () => {
    this.setState({removeGlobal: true});
    const canvasLogoutRequest = Axios.create({
      baseURL: `https://canvas-dev.asu.edu/login/oauth2/token?expire_sessions=1`,
      headers: { Authorization: "Bearer " + this.props.context.access_token }
    });
    canvasLogoutRequest
      .delete("")
      .then(res => console.log("canvasLogout response: ", res))
      .catch(e => {
        // console.log("canvasLogout error: ", e);
        console.log("e.response: ", e.response);
      });
    // console.log("Posted delete request to canvas API to invalidate tokens.");

    this.removeItem("canvasRefreshToken");
    this.removeItem("canvasAuth");
    this.removeItem("dontRunCanvasAuth");
    this.removeItem("sdr_login_status");
    this.removeItem("campus_week_schedule");
    this.props.context.updateAccessToken("");

    this.context
      .getTokens()
      .then(tokens => {
        const myInit = {
          body: {
            remove_refresh_token: true
          }
        };
        let removeRefrTokRequest = new Api(
          "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com",
          tokens
        );
        removeRefrTokRequest
          .post("/prod/canvas", myInit.body)
          .catch(e => console.log("err 1: ", e));
      })
      .catch(e => console.log("err 2: ", e));

    try {
      this.context.AppSyncClients.authClient.resetStore();
      this.props.inludeLogoutProcess();
    } catch (e) {
      console.log("Failed to execute included logout function", e);
    }
    this.resetLiveCards();
    // this.context.logout();
  };

  render() {
    return (
      <TouchableOpacity
        onPress={() => this.onPressHandler()}
        // style={{ backgroundColor: "#A20235" }}
        accessible={true}
        accessibilityLabel={this.state.text}
        accessibilityRole="button"
      >
        <View
          style={{
            height: responsiveHeight(7.5),
            paddingHorizontal: 20,
            alignItems: "center",
            justifyContent: "flex-start",
            flexDirection: "row",
          }}
          accessible={true}
          accessibilityLabel={this.state.text}
          accessibilityRole="button"
        >
          <FontAwesome5Icon
            style={{
              marginRight: 3,
            }}
            size={25}
            color={"#9a9a9a"}
            name={this.state.text === "LOG IN" ? "sign-in-alt" : "sign-out-alt"}
          />
          <Text
            style={{
              fontWeight: "800",
              color: "#000000",
              letterSpacing: 1,
              fontFamily: "Roboto",
              marginLeft: responsiveWidth(5),
              textTransform: "capitalize",
              fontSize: responsiveFontSize(1.8),
              textAlign: "center",
            }}
          >
            {this.state.text}
          </Text>
        </View>
        <LogOutGlobalState
          removeGlobal={this.state.removeGlobal}
          context={this.context}
        />
      </TouchableOpacity>
      // <Button title="logout" onPress={() => {this.context.logout()}} />
    );
  }
}

LogoutX.contextTypes = {
  logout: PropTypes.func,
  getTokens: PropTypes.func,
  AppSyncClients: PropTypes.object
};

export const Logout = props => (
  <CanvasContext.Consumer>
    {context => {
      return <LogoutX {...props} context={context} />;
    }}
  </CanvasContext.Consumer>
);