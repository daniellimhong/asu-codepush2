import React, { PureComponent } from "react";
import { TextInput, Text, ScrollView, TouchableOpacity } from "react-native";
import _ from "lodash";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import {
  inviteToConversationMutation,
  leaveConversationMutation,
  deleteConversationMutation
} from "./gql/Mutations";
import { AppSyncComponent } from "../authentication/auth_components/appsync/AppSyncApp";

class ChatSettingsContentX extends PureComponent {
  state = {
    user: "" // User for invite
  };

  static defaultProps = {
    convoId: null, // convoId associated with currently viewed chat settings
    asurite: "", // Own asurite
    inviteToConversation: () => null,
    leaveConversation: () => null,
    deleteConversation: () => null
  };

  _deleteConversation = () => {
    const { convoId, asurite, deleteConversation } = this.props;
    deleteConversation(convoId, asurite).then(() => {});
  };

  _leaveConversation = () => {
    const { convoId, asurite, leaveConversation } = this.props;
    leaveConversation(convoId, asurite).then(() => {});
  };

  inviteUser = () => {
    const { convoId, inviteToConversation } = this.props;
    const { user } = this.state;
    inviteToConversation({
      convoId,
      asurite: user.toLowerCase()
    })
      .then(invite => {})
      .catch(e => {
        console.log(e);
      });
  };

  updateMessageState = text => {
    this.setState({
      user: text
    });
  };

  render() {
    const { user } = this.state;
    return (
      <ScrollView>
        {/* ======== Invite User to Chat ======== */}
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            fontSize: 16,
            padding: 10,
            height: 50
          }}
          value={user}
          onSubmitEditing={this.inviteUser}
          placeholder="Invite"
          onChangeText={this.updateMessageState}
        />
        <TouchableOpacity
          onPress={() => {
            this.inviteUser();
          }}
          style={{
            alignSelf: "center",
            backgroundColor: "#7e7e7e",
            padding: responsiveHeight(1),
            borderRadius: responsiveHeight(3),
            margin: 10,
            width: responsiveWidth(33),
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontFamily: "Roboto"
            }}
          >
            Send Invite
          </Text>
        </TouchableOpacity>
        {/* ======== Leave Chat ========= */}
        <TouchableOpacity
          onPress={() => {
            this._leaveConversation();
          }}
          style={{
            alignSelf: "center",
            backgroundColor: "maroon",
            padding: responsiveHeight(1),
            borderRadius: responsiveHeight(3),
            margin: 10,
            width: responsiveWidth(50),
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: responsiveFontSize(2),
              fontFamily: "Roboto"
            }}
          >
            Leave Chat
          </Text>
        </TouchableOpacity>

        {/* ======== Delete Chat ========= */}
        <TouchableOpacity
          onPress={() => {
            this._deleteConversation();
          }}
          style={{
            alignSelf: "center",
            backgroundColor: "red",
            padding: responsiveHeight(1),
            borderRadius: responsiveHeight(3),
            margin: 10,
            width: responsiveWidth(50),
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: responsiveFontSize(2),
              fontFamily: "Roboto"
            }}
          >
            DELETE Chat
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const ChatSettingsContent = AppSyncComponent(
  ChatSettingsContentX,
  inviteToConversationMutation,
  leaveConversationMutation,
  deleteConversationMutation
);

export default class ChatSettings extends PureComponent {
  state = {
    convoId: null,
    asurite: ""
  };

  componentDidMount() {
    const { getTokens } = this.context;
    getTokens()
      .then(tokens => {
        const convoId = _.get(this.props, "navigation.state.params.convoId");
        if (convoId) {
          this.setState({
            asurite: tokens.username,
            convoId
          });
        } else {
          this.setState({
            asurite: tokens.username
          });
        }
      })
      .catch();
  }

  render() {
    const { navigation } = this.props;
    const { convoId, asurite } = this.state;
    return (
      <ChatSettingsContent
        navigation={navigation}
        convoId={convoId}
        asurite={asurite}
      />
    );
  }
}

ChatSettings.contextTypes = {
  getTokens: PropTypes.func
};
