import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { DefaultText as Text } from "../../presentational/DefaultText.js";
import PropTypes from "prop-types";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth
} from "react-native-responsive-dimensions";
import {
  getFriendPermissions,
  ignoreFriendRequest,
  acceptFriendRequest,
  verifyRequestSent,
  verifyFriendStatus,
  getUserInformation,
  iSearchHandler
} from "../../../Queries";
import { SettingsContext } from "../../achievement/Settings/Settings";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { FriendButton } from "./FriendButton";
import { EmailFriend } from "./EmailFriend";
import { CallFriend } from "./CallFriend";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { DirectMessage } from "../../functional/chat/DirectMessage/DirectMessage";
import _ from "lodash";

import { Auth } from "../../../services";

/**
 * List item for the friends list
 */
class SingleUserX extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      name: "",
      self: false,
      friendStatus: false,
      requestStatus: false,
      student_status: false
    };

    this.obscure = this.obscure.bind(this);
  }

  static defaultProps = {
    asurite: null,
    friendStatus: false,
    requestStatus: false,
    ownerStudentStatus: false,
    rightSide: null,
    repaint: () => null,
    data: null,
    ignoreRequest: () => null,
    acceptRequest: () => null,
    user_info: {}
  };

  // componentDidMount() {
  //   console.log("DID MOUNT")
  //   Auth().getSession().then(tokens => {
  //     this.setState({
  //       ownerStudentStatus: tokens.roleList.indexOf("student") > -1
  //     })
  //   })
  // }

  pressHandler() {
    let isearch = iSearchHandler(this.props.asurite, this.props.user_info);
    let { navigate } = this.props.navigation;
    this.refs.analytics.sendData({
      "action-type": "click",
      "target": "friend",
      "starting-screen": this.props.previousScreen?this.props.previousScreen:null,
      "starting-section": this.props.previousSection?this.props.previousSection:null,
      "resulting-screen": "profile", 
      "resulting-section": null,
      "target-id":this.props.asurite.toString(),
      "action-metadata":{
        "target-id":this.props.asurite.toString(),
        "displayName":isearch.displayName,
        "friendStatus": this.props.friendStatus,
        "requestStatus": this.props.requestStatus
      }
    });
    tracker.trackEvent("Click", "SingleUser_ViewProfile");
    if (this.props.invoker !== this.props.asurite) {
      navigate("UserProfile", {
        data: {
          photoUrl: isearch.photoUrl,
          displayName: isearch.displayName,
          friendStatus: this.props.friendStatus,
          requestStatus: this.props.requestStatus,
          asuriteId: this.props.asurite,
          permissions: this.props.permissions,
          repaint: this.props.repaint,
          phone: isearch.phone,
          student: isearch.student_status,
          affiliations: isearch.affiliations,
        },
        previousScreen: this.props.previousScreen,
        previousSection: this.props.previousSection
      });
    } else {
      navigate("MyProfile", { 
        previousScreen: this.props.previousScreen,
        previousSection: this.props.previousSection
      });
    }
  }

  render() {
    let RIGHT = this.props.rightSide;
    let isearch = iSearchHandler(this.props.asurite, this.props.user_info);

    if (
      this.state.obscure ||
      (!__DEV__ && (isearch.displayName == null || isearch.displayName == ""))
    ) {
      return <Analytics ref="analytics" />;
    } else {
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: responsiveWidth(3)
          }}
        >
          <Analytics ref="analytics" />
          <TouchableOpacity
            onPress={() => this.pressHandler()}
            style={{ flex: 1 }}
            accessibilityRole="button"
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                height: responsiveHeight(13),
                borderBottomColor: "#EDEDED",
                borderBottomWidth: 1
              }}
            >
              {/* LEFT PICTURE */}
              <View>
                {isearch.photoUrl == null || isearch.photoUrl == "" ? (
                  <Image
                    style={styles.image}
                    source={require("../assets/placeholder.png")}
                  />
                ) : (
                  <Image
                    style={styles.image}
                    source={{ uri: isearch.photoUrl }}
                  />
                )}
              </View>
              {/* NAME */}
              <View style={{ marginLeft: responsiveWidth(5), flex: 1 }}>
                <Text style={{ fontSize: responsiveFontSize(1.5) }}>
                  {isearch.displayName}
                </Text>
                <Text style={{ fontSize: responsiveFontSize(1.25) }}>
                  {this.getProfileLine()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          {RIGHT ? (
            <RIGHT
              ignoreRequest={this.props.ignoreRequest}
              acceptRequest={this.props.acceptRequest}
              obscure={this.obscure}
              asurite={this.props.asurite}
            />
          ) : (
            <View style={styles.iconsContainer}>
              <View style={styles.iconsBox}>
                <FriendButton
                  displayName={isearch.displayName}
                  photoUrl={isearch.photoUrl}
                  student_status={isearch.student_status}
                  asurite={this.props.asurite}
                  ownerStudentStatus={this.props.ownerStudentStatus}
                  mini={true}
                  previousScreen={this.props.previousScreen}
                  previousSection={this.props.previousSection}
                />
              </View>
              <View style={styles.iconsBox}>
                <CallFriend
                  asurite={this.props.asurite}
                  phone={isearch.phone}
                  student={isearch.student_status}
                  affiliations={isearch.affiliations}
                  previousScreen={this.props.previousScreen}
                  previousSection={this.props.previousSection}
                />
              </View>
              <View style={styles.iconsBox}>
                <EmailFriend asurite={this.props.asurite}
                  previousScreen={this.props.previousScreen}
                  previousSection={this.props.previousSection} />
              </View>
              <SettingsContext.Consumer>
                {settings =>
                  settings.chatSettings &&
                  !settings.chatSettings.chatDeactivated ? (
                    <View style={styles.iconsBox}>
                      <DirectMessage
                        btnType="directory"
                        navigation={this.props.navigation}
                        asurite={this.props.asurite}
                        previousScreen={this.props.previousScreen?this.props.previousScreen:"asu-directory"}
                        title={
                          isearch && isearch.displayName
                            ? isearch.displayName
                            : null
                        }
                      />
                    </View>
                  ) : null
                }
              </SettingsContext.Consumer>
            </View>
          )}
        </View>
      );
    }
  }

  obscure() {
    this.setState({
      obscure: true
    });
  }

  getProfileLine() {
    let isearch = iSearchHandler(this.props.asurite, this.props.user_info);
    if (isearch.student_status) {
      if (isearch.majors.length > 0) {
        return isearch.majors[0];
      } else if (isearch.primaryDeptId && isearch.primaryDeptId !== "") {
        return isearch.primaryDeptId;
      }
    } else {
      if (isearch.primaryDeptId && isearch.primaryDeptId !== "") {
        return isearch.primaryDeptId;
      }
    }
    return isearch.affiliations && isearch.affiliations[0]
      ? isearch.affiliations[0]
      : "";
  }
}

export const SingleUser = AppSyncComponent(
  SingleUserX,
  verifyRequestSent,
  verifyFriendStatus,
  getFriendPermissions,
  getUserInformation,
  ignoreFriendRequest,
  acceptFriendRequest
);

const styles = StyleSheet.create({
  image: {
    height: responsiveWidth(16),
    borderRadius: responsiveWidth(8),
    width: responsiveWidth(16),
    alignItems: "center",
    marginTop: 5
  },
  iconsContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row"
  },
  iconsBox: {
    marginLeft: responsiveWidth(0.5)
  }
});
