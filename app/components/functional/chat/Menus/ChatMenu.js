import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu";
import { EventRegister } from "react-native-event-listeners";
import PropTypes from "prop-types";
import { AppSyncComponent } from "../../authentication/auth_components/appsync/AppSyncApp";
import {
  blockUserMutation,
  getBlockedUsers,
  unblockUserMutation
} from "../../../../Queries/Friends";
import { getConversationUsersQuery } from "../gql/Queries";
import {
  deactivateConversationMutation,
  reportUserMutation
} from "../gql/Mutations";
import { SettingsContext } from "../../../achievement/Settings/Settings";
import { setManagedConvo } from "../gql/utility";
import Analytics from "../../analytics";

class ChatMenuContent extends React.PureComponent {
  static defaultProps = {
    blockUser: () => null,
    unblockUser: () => null,
    deactivateConversationForMe: () => null,
    reportUser: () => null,
    setToast: () => null,
    blocked_users: [],
    users: null,
    asurite: null
  };

  sendBlockUserAnalyticsEvent(isBlocked, asurite){
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "conversation",
      "starting-section": "conversation-menu",
      target: isBlocked?"Unblock User":"Block User",
      "resulting-screen": "conversation",
      "resulting-section": null,
      "action-metadata":{
        "asurite": asurite
      }
    });
  }

  blockOption = () => {
    const {
      asurite,
      users,
      blocked_users,
      blockUser,
      unblockUser
    } = this.props;
    if (Array.isArray(users) && users.length <= 2) {
      let foundUser = null;
      users.forEach(user => {
        if (user !== asurite) {
          foundUser = user;
        }
      });
      return blocked_users &&
        blocked_users.length &&
        blocked_users.indexOf(foundUser) > -1 ? (
        <MenuOption
          onSelect={() => {
            unblockUser(foundUser);
            this.sendBlockUserAnalyticsEvent(true, foundUser);
            EventRegister.emit("blockedStatusEvent", "unblocked");
          }}
        >
          <Text style={styles.popupText}>Unblock User</Text>
        </MenuOption>
      ) : (
        <MenuOption
          onSelect={() => {
            blockUser(foundUser);
            this.sendBlockUserAnalyticsEvent(false, foundUser);
            EventRegister.emit("blockedStatusEvent", "blocked");
          }}
        >
          <Text style={styles.popupText}>Block User</Text>
        </MenuOption>
      );
    } else {
      /**
       * Navigate to list of users in chat here
       */
      return null;
    }
  };

  /**
   * Return the asurite of a single user for blocking/reporting.
   * If there are multiple possible users, null
   */
  getFirstTarget = () => {
    const { users, asurite } = this.props;
    if (Array.isArray(users) && users.length <= 2) {
      for (let i = 0; i < users.length; i++) {
        if (users[i] !== asurite) {
          return users[i];
        }
      }
    }
    return null;
  };

  render() {
    const {
      convoId,
      asurite,
      deactivateConversationForMe,
      setToast,
      reportUser,
      navigation,
      users
    } = this.props;
    const { setModalContent, setModalVisible } = this.context;
    return (
      <View>
        <Analytics ref="analytics" />
        <Menu>
          <MenuTrigger onPress={() => {
                this.refs.analytics.sendData({
                  "action-type": "click",
                  "starting-screen": "conversation",
                  "starting-section": null,
                  target: "conversation-menu",
                  "resulting-screen": "conversation",
                  "resulting-section": "conversation-menu",
                  "action-metadata":{
                    "conversation-id":convoId,
                    "asurite": asurite
                  }
                });
              }}>
            <Icon name="more-vert" size={responsiveFontSize(3)} color="white" />
          </MenuTrigger>
          <MenuOptions customStyles={optionsStyles}>
            <MenuOption
              onSelect={() => {
                if (convoId) {
                  this.refs.analytics.sendData({
                    "action-type": "click",
                    "starting-screen": "conversation",
                    "starting-section": "conversation-menu",
                    target: "Delete Conversation",
                    "resulting-screen": "chat-manager",
                    "resulting-section": null,
                    "action-metadata":{
                      "conversation-id":convoId,
                      "asurite": asurite
                    }
                  });
                  deactivateConversationForMe(convoId, asurite)
                    .then(() => {
                      setManagedConvo([], convoId, true);
                      navigation.goBack(null);
                      setToast("Conversation deleted");
                    })
                    .catch(e => console.log(e));
                }
              }}
            >
              <Text style={styles.popupText}>Delete Conversation</Text>
            </MenuOption>
            {this.blockOption()}
            {Array.isArray(users) && users.length > 1 ? (
              <MenuOption
                onSelect={() => {
                  this.refs.analytics.sendData({
                    "action-type": "click",
                    "starting-screen": "conversation",
                    "starting-section": "conversation-menu",
                    target: "Report a concern",
                    "resulting-screen": "report-concern",
                    "resulting-section": null,
                    "action-metadata":{
                      "conversation-id":convoId,
                      "asurite": asurite
                    }
                  });
                  navigation.navigate("Report", { convoId, asurite });
                  // if (Array.isArray(users) && users.length <= 2) {
                  //   const user = this.getFirstTarget();
                  //   if (user) {
                  //     setModalContent(ReportModal, {
                  //       setToast,
                  //       close: setModalVisible,
                  //       reportUser,
                  //       convoId,
                  //       reportee: user,
                  //       asurite
                  //     });
                  //     setModalVisible(true);
                  //   }
                  // }
                }}
              >
                <Text style={styles.popupText}>Report a concern</Text>
              </MenuOption>
            ) : null}
          </MenuOptions>
        </Menu>
      </View>
    );
  }
}

class ChatMenuWrapper extends React.PureComponent {
  render() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <ChatMenuContent
            asurite={settings.user}
            setToast={settings.SetToast}
            {...this.props}
          />
        )}
      </SettingsContext.Consumer>
    );
  }
}

const ChatMenu = AppSyncComponent(
  ChatMenuWrapper,
  blockUserMutation,
  unblockUserMutation,
  getBlockedUsers,
  getConversationUsersQuery,
  deactivateConversationMutation,
  reportUserMutation
);

ChatMenuContent.contextTypes = {
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func
};

const styles = StyleSheet.create({
  popupText: {
    fontSize: responsiveFontSize(1.8),
    margin: 5
  }
});

const optionsStyles = {
  optionsContainer: {
    width: responsiveWidth(50),
    borderRadius: 10
  },
  optionsWrapper: {
    padding: 5
  },
  optionWrapper: {},
  optionTouchable: {},
  optionText: {}
};

export default ChatMenu;
