import React, { PureComponent, useState, useEffect, useContext } from "react";
import {
  KeyboardAvoidingView,
  View,
  ScrollView,
  Clipboard,
  Platform
} from "react-native";
import _ from "lodash";
import { responsiveHeight } from "react-native-responsive-dimensions";
import {
  getConversationAdminStatusQuery,
  getBlockedStatusQuery,
  getInviteStatusQuery
} from "../gql/Queries";
import {
  createMessageMutation,
  updateLastSeenMutation,
  hideMessageForAllMutation,
  ignoreMessageMutation
} from "../gql/Mutations";
import { AppSyncComponent } from "../../authentication/auth_components/appsync/AppSyncApp";
import { SettingsContext } from "../../../achievement/Settings/Settings";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import ChatOptions, { ChatOptionDelete } from "./ChatOptions";
import { ErrorWrapper } from "../../error/ErrorWrapper";
import Analytics from "../../analytics";

/**
 * Chat Screen that will house actual conversation content.
 *
 * <Chat /> itself is a wrapper component that we use to capture navigation state
 * and get the conversation ID if the conversation is still generating.
 * This will happen on invites and fresh conversations between friends.
 *
 * It also houses elevated state for the Chat subcomponents so that we
 * can modify the list of messages from said subcomponents.
 * Ie. ChatInput, ChatOptions, ChatMessages, etc..
 */

let chatRef = React.createRef();

export default function Chat(props) {
  const { navigation } = props;
  const [convoId, setConvoId] = useState();
  const settings = useContext(SettingsContext);

  useEffect(() => {
    if (settings.freshChatConvoId) {
      settings
        .getChatConvoIdOverride()
        .then(newCid => {
          setConvoId(newCid);
        })
        .catch(e => {
          console.log(e);
        });
    } else {
      setConversationId();
    }
  });

  const setConversationId = () => {
    const convoPromise = _.get(navigation, "state.params.convoPromise");
    let cid = _.get(navigation, "state.params.convoId");
    if (convoPromise) {
      convoPromise
        .then(resp => {
          const invitePromise = _.get(resp, "data.inviteDirectMessage.convoId");
          const startPromise = _.get(resp, "data.startDirectMessage.convoId");
          if (!cid) {
            cid = startPromise || invitePromise;
          }
          setConvoId(cid);
        })
        .catch(e => {
          console.log(e);
        });
    } else if (cid) {
      setConvoId(cid);
    }
  };

  let sunnyConvo = false;
  if (navigation && navigation.state && navigation.state.params) {
    sunnyConvo =
      props.navigation.state.params.sunnyConvo &&
      props.navigation.state.params.title === "Sunny";
  }

  return (
    <ErrorWrapper>
      <View style={{ flex: 1 }}>
        <ChatAS
          navigation={navigation}
          convoId={convoId}
          limit={30}
          asurite={settings.user}
          setToast={settings.SetToast}
          getTokens={settings.getTokens}
          chatSettings={settings.chatSettings}
          sunnyConvo={sunnyConvo}
        />
      </View>
    </ErrorWrapper>
  );
}

/**
 * Receives actual content from AppSync and renders messages related to a chat
 */
class ChatContent extends PureComponent {
  state = {
    selected: [],
    showOptions: false,
    showDelete: false
  };

  lastSeen = null;

  componentDidMount(){
    chatRef.current.sendData({
      "eventtime": new Date().getTime(),
      "action-type": "view",
      "starting-screen": this.props.navigation.state.params
          ? this.props.navigation.state.params.previousScreen
          : null,
      "starting-section": this.props.navigation.state.params
      ? this.props.navigation.state.params.previousSection
      : null,
      "target": this.props.navigation.state.params
      ? this.props.navigation.state.params.target
      : null,
      "resulting-screen": "conversation", 
      "resulting-section": null,
    });
  }

  static defaultProps = {
    asurite: "",
    nextToken: null,
    limit: null,
    convoId: null,
    admin_status: false,
    setToast: () => null,
    createMessage: () => null,
    updateLastSeen: () => null,
    hideMessageForAll: () => null,
    ignoreMessage: () => null
  };

  _copySelectedMessages = () => {
    const { selected } = this.state;
    const { setToast } = this.props;
    if (selected) {
      let copyString = "";
      for (let i = 0; i < selected.length; i++) {
        const message = selected[i];
        // eslint-disable-next-line no-unused-expressions
        message.content ? (copyString += message.content) : null;
        // eslint-disable-next-line no-unused-expressions
        i < selected.length - 1 ? (copyString += "\n") : null;
      }
      Clipboard.setString(copyString);
      setToast("messages copied to clipboard", 2000);
      this._cancelSelection();
    }
  };

  /**
   * This should prevent the selection of items that are already in the
   * list of selected items.
   */
  _selectMessage = message => {
    const { selected } = this.state;
    const newSelected = [...selected];

    const index = newSelected.findIndex(
      msg => msg.messageId === message.messageId
    );

    if (index === -1) {
      newSelected.push(message);
      this.setState({
        selected: newSelected,
        showOptions: true
      });
    }
  };

  _deselectMessage = message => {
    const { selected } = this.state;
    const newSelected = [...selected];
    let { showOptions } = this.state;

    const index = newSelected.findIndex(
      msg => msg.messageId === message.messageId
    );

    if (index > -1) {
      newSelected.splice(index, 1);
      if (newSelected.length < 1) {
        showOptions = false;
      }
      this.setState({
        selected,
        showOptions
      });
    }
  };

  /**
   * Deselect all items.
   * Hide message options.
   * Hide any overlays related to message actions.
   */
  _cancelSelection = () => {
    this.setState({
      selected: [],
      showDelete: false,
      showOptions: false
    });
  };

  _showDeleteModal = () => {
    this.setState({
      showDelete: true
    });
  };

  /**
   * Loop through all selected messages and run the ignore mutation
   *
   * Because this includes an appsync cache update we check to see whether this
   * is the first invocation to avoid multiple unnecessary cache updates across
   * many message removals.
   */
  _ignoreMessage = () => {
    const { selected } = this.state;
    const { ignoreMessage } = this.props;

    if (selected) {
      for (let i = 0; i < selected.length; i++) {
        let proceed = false;
        if (i === 0) {
          proceed = true;
        }
        ignoreMessage(
          selected[i].convoId,
          selected[i].createdAt,
          selected,
          proceed
        );

        this._cancelSelection();
      }
    }
  };

  /**
   * Hide messages for all users in a conversation.
   *
   * Note that they must all be owned by you, or you
   * must be an admin to delete them.
   * There is a backend check for this but we also need to update the UI
   */
  _hideMessageForAll = () => {
    const { selected } = this.state;
    const { hideMessageForAll } = this.props;
    if (selected) {
      for (let i = 0; i < selected.length; i++) {
        hideMessageForAll(
          selected[i].convoId,
          selected[i].content,
          selected[i].createdAt,
          selected[i].messageId,
          selected[i].sender,
          selected[i].obscure,
          selected,
          true
        );

        this._cancelSelection();
      }
    }
  };

  render() {
    const {
      asurite,
      admin_status,
      createMessage,
      convoId,
      isConversationBlocked,
      amIBlocked,
      recipientChatDeactivated,
      isInvitePending,
      getTokens,
      sunnyConvo,
      chatSettings
    } = this.props;
    const { showOptions, selected, showDelete } = this.state;
    const platformconfig =
      Platform.OS === "ios"
        ? { behavior: "padding", keyboardVerticalOffset: 100 }
        : {};

    return (
      <View
        style={{
          flex: 1
        }}
      >
        <Analytics ref={chatRef} />
        <ChatOptions
          show={showOptions}
          selected={selected}
          showDeleteModal={this._showDeleteModal}
          cancelSelection={this._cancelSelection}
          copySelectedMessages={this._copySelectedMessages}
          isInvitePending={isInvitePending}
        />
        <ScrollView
          ref={c => {
            this.scrollRef = c;
          }}
          scrollEnabled={false}
          contentContainerStyle={{
            flex: 1,
            marginTop: this.props.sunnyConvo ? responsiveHeight(1) : 0
          }}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flex: 1
            }}
          >
            <ChatOptionDelete
              asurite={asurite}
              admin_status={admin_status}
              messages={selected}
              show={showDelete}
              ignoreMessage={this._ignoreMessage}
              hideMessageForAll={this._hideMessageForAll}
            />
            <ChatMessages
              asurite={asurite}
              selectMessage={this._selectMessage}
              deselectMessage={this._deselectMessage}
              sunnyConvo={sunnyConvo}
              createMessage={createMessage}
              selected={selected}
              convoId={convoId}
              getTokens={getTokens}
            />
            <KeyboardAvoidingView {...platformconfig}>
              <ChatInput
                asurite={asurite}
                convoId={convoId}
                createMessage={createMessage}
                isConversationBlocked={isConversationBlocked}
                recipientChatDeactivated={recipientChatDeactivated}
                amIBlocked={amIBlocked}
                isInvitePending={isInvitePending}
                chatDeactivated={!sunnyConvo && chatSettings.chatDeactivated}
                {...this.props}
                scrollRef={this.scrollRef}
              />
            </KeyboardAvoidingView>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const ChatAS = AppSyncComponent(
  ChatContent,
  createMessageMutation,
  getConversationAdminStatusQuery,
  getBlockedStatusQuery,
  getInviteStatusQuery,
  hideMessageForAllMutation,
  ignoreMessageMutation,
  updateLastSeenMutation
);
