import React, { PureComponent } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { responsiveFontSize } from "react-native-responsive-dimensions";
import { EventRegister } from "react-native-event-listeners";
import { makeAutoId } from "../utility";
import { SettingsContext } from "../../../achievement/Settings/Settings";

/**
 * Bottom section of the chat page. Houses the actual input and send options.
 */
class ChatInputX extends PureComponent {
  state = {
    newMessage: "",
    blockedState: null
  };

  recipientBlocked = "This recipient is not accepting messages.";

  unblockRecipient = "You need to unblock the recipient.";

  recipientAcceptChatInvite = "Recipient needs to accept the chat invite.";

  static defaultProps = {
    asurite: "",
    convoId: null,
    scrollRef: null,
    createMessage: () => null
  };

  componentDidMount() {
    this.listener = EventRegister.addEventListener(
      "blockedStatusEvent",
      data => {
        this.setState({ blockedState: data });
      }
    );
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);
  }

  updateMessageState = text => {
    this.setState({ newMessage: text });
  };

  sendMessage = () => {
    const { newMessage } = this.state;
    const { convoId, createMessage, setToast } = this.props;
    const msg = newMessage;
    if (convoId && msg && msg.length) {
      this.setState(
        {
          newMessage: ""
        },
        () => {
          createMessage(
            {
              convoId,
              content: msg,
              file: JSON.stringify({}),
              messageId: makeAutoId(),
              obscure: false,
              agentAction: null,
              agentAsurite: null,
              agentName: null,
              __typename: "Message"
            },
            this.props
          ).then(data => {
            if (data) {
              if (data === "blocked" || data === "deactivated") {
                setToast(this.recipientBlocked, 5000, "center");
              }
            }
          });
        }
      );
    }
  };

  render() {
    const { newMessage, blockedState } = this.state;
    let { isConversationBlocked, navigation } = this.props;
    const {
      amIBlocked,
      isInvitePending,
      recipientChatDeactivated,
      chatDeactivated
    } = this.props;

    if (blockedState !== null && !amIBlocked) {
      if (blockedState === "blocked") {
        isConversationBlocked = true;
        if (newMessage !== this.unblockRecipient) {
          this.setState({ newMessage: this.unblockRecipient });
        }
      } else {
        isConversationBlocked = false;
        if (newMessage === this.unblockRecipient) {
          this.setState({ newMessage: "" });
        }
      }
    } else if (isConversationBlocked) {
      if (!amIBlocked) {
        this.setState({ newMessage: this.unblockRecipient });
      } else {
        this.setState({
          newMessage: this.recipientBlocked
        });
      }
    } else if (recipientChatDeactivated) {
      this.setState({
        newMessage: this.recipientBlocked
      });
    } else if (
      newMessage === this.unblockRecipient ||
      newMessage === this.recipientBlocked ||
      newMessage === this.recipientAcceptChatInvite
    ) {
      this.setState({ newMessage: "" });
    }

    if (isInvitePending) {
      this.setState({ newMessage: this.recipientAcceptChatInvite });
    }

    if (chatDeactivated) {
      this.setState({
        newMessage: "Chat is disabled. Go to settings to enable."
      });
    }

    return (
      <View>
        <View
          style={[
            styles.textInputContainer,
            isConversationBlocked ||
            isInvitePending ||
            recipientChatDeactivated ||
            chatDeactivated
              ? styles.disabledTextInput
              : ""
          ]}
        >
          <TextInput
            style={[styles.text]}
            multiline
            maxLength={1000}
            value={newMessage}
            editable={
              !isConversationBlocked &&
              !isInvitePending &&
              !recipientChatDeactivated &&
              !chatDeactivated
            }
            placeholder="Message..."
            returnKeyType="next"
            blurOnSubmit={false}
            onChangeText={this.updateMessageState}
          />
          <TouchableOpacity
            disabled={
              isConversationBlocked ||
              isInvitePending ||
              recipientChatDeactivated ||
              chatDeactivated
            }
            style={{
              justifyContent: "center",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 15,
              marginHorizontal: 5,
              marginVertical: 15
            }}
            onPress={() => {
              this.sendMessage();
            }}
          >
            <Icon name="send" color="#3C3C3C" size={responsiveFontSize(3)} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default class ChatInput extends React.PureComponent {
  render() {
    return (
      <SettingsContext.Consumer>
        {() => <ChatInputX {...this.props} />}
      </SettingsContext.Consumer>
    );
  }
}

const styles = StyleSheet.create({
  textInputContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderTopColor: "#ccc",
    borderTopWidth: 1,
    textAlign: "center"
  },
  disabledTextInput: {
    backgroundColor: "#e6e6e6"
  },
  text: {
    fontSize: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    flex: 1
  }
});
