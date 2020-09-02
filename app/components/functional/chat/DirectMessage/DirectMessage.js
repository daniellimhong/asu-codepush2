import React, { PureComponent } from "react";
import { View, TouchableOpacity, AsyncStorage, StyleSheet } from "react-native";
import _ from "lodash";
import Icon from "react-native-vector-icons/AntDesign";
import {
  responsiveFontSize,
  responsiveWidth
} from "react-native-responsive-dimensions";
import { getConversationRelationQuery } from "../gql/Queries";
import {
  startDirectMessageMutation,
  inviteDirectMessageMutation,
  reactivateConversationForMeMutation
} from "../gql/Mutations";
import { AppSyncComponent } from "../../authentication/auth_components/appsync/AppSyncApp";
import { makeAutoId } from "../utility";
import { SettingsContext } from "../../../achievement/Settings/Settings";
import Analytics from "../../analytics";

export class DirectMessage extends PureComponent {
  render() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <DirectMessageAS setToast={settings.SetToast} {...this.props} />
        )}
      </SettingsContext.Consumer>
    );
  }
}

/**
 * A button that will navigate to, or generate a new DM conversation between users
 */
class DirectMessageContent extends PureComponent {
  static defaultProps = {
    dmConvoId: null,
    arrow: false,
    startDirectMessage: () => Promise.resolve(),
    inviteDirectMessage: () => Promise.resolve(),
    reactivateConversationForMe: () => Promise.resolve(),
    setToast: () => null,
    asurite: "",
    title: null
  };

  /**
   * If conversation ID is available for a direct message then we want
   * to navigate directly to the conversation with the DMs
   */
  _directMessage = (target) => {
    const {
      dmConvoId,
      title,
      asurite,
      reactivateConversationForMe,
      btnType,
      previousScreen
    } = this.props;
    const navigate = _.get(this.props, "navigation.navigate");
    var startingScreen = (previousScreen)?previousScreen:
    (btnType==="directory")? "asu-directory":
    (btnType==="profile")?"user-profile":
    (btnType==="sunny")?"chat-manager":"new-conversation";

    if (navigate) {
      reactivateConversationForMe(dmConvoId)
        .then(() => {
          navigate("Chat", {
            convoId: dmConvoId,
            sunnyConvo: asurite === "ASU-sunnybot",
            title: title || asurite,
            previousScreen: startingScreen,
            previousSection: null,
            target: target
          });
        })
        .catch(e => {
          navigate("Chat", {
            convoId: dmConvoId,
            sunnyConvo: asurite === "ASU-sunnybot",
            title: title || asurite,
            previousScreen: startingScreen,
            previousSection: null,
            target: target
          });
        });
    }
  };

  /**
   * When there is no DM conversation we want to start one "with friends only".
   * For smoothness, navigate to the chat page and pass a promise for the new
   * conversation that will return the generated conversation ID from our backend
   */
  _startDM = (target) => {
    const { asurite, title, startDirectMessage, btnType, previousScreen } = this.props;
    const navigate = _.get(this.props, "navigation.navigate");
    var startingScreen = (previousScreen)?previousScreen:
    (btnType==="directory")? "asu-directory":
    (btnType==="profile")?"user-profile":
    (btnType==="sunny")?"chat-manager":"new-conversation";

    if (navigate) {
      navigate("Chat", {
        convoPromise: startDirectMessage(asurite),
        sunnyConvo: asurite === "ASU-sunnybot",
        title: title || asurite,
        recipient: asurite,
        previousScreen: startingScreen,
        previousSection: null,
        target: target
      });
    }
  };

  /**
   * For users that aren't friends, we don't want to start up DMs automatically.
   * Create an instance of a dm conversation and send an invite to the recipient.
   */
  _inviteDM = (target) => {
    const { asurite, inviteDirectMessage, title, setToast, btnType, previousScreen } = this.props;
    const navigate = _.get(this.props, "navigation.navigate");
    setToast(`${title} has been sent a chat invite`);
    if (navigate) {
      var startingScreen = (previousScreen)?previousScreen:
      (btnType==="directory")? "asu-directory":
      (btnType==="profile")?"user-profile":
      (btnType==="sunny")?"chat-manager":"new-conversation";
  
      navigate("Chat", {
        convoPromise: inviteDirectMessage({
          sunnyConvo: asurite === "ASU-sunnybot",
          recipient: asurite,
          convoId: makeAutoId(),
          previousScreen: startingScreen,
          previousSection: null,
          target: target
        })
          .then(resp => {
            /**
             * Being a little tricky here. We send an invite, but we also want
             * to store a name inside of AsyncStorage for the chat.
             * This is because users will probably see the chat head before
             * the invitee accepts the invite. In this case we store the saved title.
             */
            try {
              const convoId = _.get(resp, "data.inviteDirectMessage.convoId");
              AsyncStorage.setItem(convoId, title || asurite);
            } catch (e) {
              console.log(e);
            }
            return resp;
          })
          .catch(e => {
            console.log(e);
            setToast(`Invite to ${title} failed`);
          }),
        title: title || asurite,
        recipient: asurite
      });
    }
  };

  _branchDM = () => {
    const { dmConvoId, friendStatus, asurite, btnType, previousScreen } = this.props;

  var startingScreen = (previousScreen)?previousScreen:
      (btnType==="directory")? "asu-directory":
      (btnType==="profile")?"user-profile":
      (btnType==="sunny")?"chat-manager":"new-conversation";
    var target = (asurite === "ASU-sunnybot")?"chat-with-chatbot":
        (dmConvoId || !friendStatus)?"open-conversation":"new-conversation";
        
    this.refs.analytics.sendData({
      "eventtime": new Date().getTime(),
      "action-type": "click",
      "starting-screen": startingScreen,
      "starting-section": null,
      "target": target,
      "resulting-screen": "conversation",
      "resulting-section": null,
      "action-metadata": {
        "asurite": asurite,
        "conversation-id": dmConvoId,
        "friend-status":friendStatus,
        "button-type":btnType
      }
    });
    if (asurite === "ASU-sunnybot") {
      this._startDM(target);
    } else if (dmConvoId) {
      this._directMessage(target);
    } else if (friendStatus) {
      this._startDM(target);
    } else {
      this._inviteDM(target);
    }
  };

  render() {
    const { blocked, btnType, arrow, chatDeactivated } = this.props;

    if (blocked || chatDeactivated) {
      return null;
    }

    if (btnType === "profile") {
      return (
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center"
          }}
          onPress={this._branchDM}
        >
          <View>
            <Analytics ref="analytics" />
            <Icon
              name={arrow ? "right" : "message1"}
              size={responsiveFontSize(2.6)}
              color={arrow ? "white" : "black"}
              style={{ backgroundColor: "transparent" }}
            />
          </View>
        </TouchableOpacity>
      );
    } else if (btnType === "directory") {
      return (
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center"
          }}
          onPress={this._branchDM}
        >
          <View
            style={{
              height: responsiveWidth(10),
              width: responsiveWidth(10),
              borderRadius: responsiveWidth(5),
              borderColor: "#B1B1B1",
              borderWidth: 3,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Analytics ref="analytics" />
            <Icon
              name={arrow ? "right" : "message1"}
              size={responsiveFontSize(2.6)}
              color="#B1B1B1"
              style={{ backgroundColor: "transparent" }}
            />
          </View>
        </TouchableOpacity>
      );
    } else if (btnType === "sunny") {
      return (
        <TouchableOpacity onPress={this._branchDM}>
          <View>
            <Analytics ref="analytics" />
            {this.props.customButton}
            {
              // <View
              //   style={{
              //     backgroundColor: "#00000000",
              //     height: responsiveWidth(14),
              //     width: responsiveWidth(14),
              //     borderRadius: responsiveHeight(6),
              //     alignItems: "center",
              //     justifyContent: "center"
              //   }}
              // >
              //   <Image
              //     style={styles.image}
              //     source={require("./SunnySmall.gif")}
              //     resizeMode="contain"
              //   />
              // </View>
            }
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
          onPress={this._branchDM}
        >
          <View>
            <Analytics ref="analytics" />
            <Icon
              name={arrow ? "right" : "message1"}
              size={responsiveFontSize(2.6)}
              color={arrow ? "white" : "#B1B1B1"}
              style={{ backgroundColor: "transparent" }}
            />
          </View>
        </TouchableOpacity>
      );
    }
  }
}

const styles = StyleSheet.create({
  image: {
    height: responsiveWidth(20),
    width: responsiveWidth(20),
    alignItems: "center"
  }
});

export const DirectMessageAS = AppSyncComponent(
  DirectMessageContent,
  getConversationRelationQuery,
  startDirectMessageMutation,
  inviteDirectMessageMutation,
  reactivateConversationForMeMutation
);
