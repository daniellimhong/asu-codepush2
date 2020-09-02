import gql from "graphql-tag";

export const CREATED_MESSAGE_SUBSCRIPTION = gql`
  subscription($convoId: String) {
    createdMessage(convoId: $convoId) {
      convoId
      createdAt
      messageId
      file
      sender
      content
      obscure
      agentAction
      agentAsurite
      agentName
      __typename
    }
  }
`;

export const DELETED_MESSAGE_SUBSCRIPTION = gql`
  subscription($convoId: String) {
    deleteMessageForAll(convoId: $convoId) {
      convoId
      createdAt
      messageId
      sender
      content
      obscure
      agentAction
      agentAsurite
      agentName
      __typename
    }
  }
`;

export const ACCEPTED_CONVO_INVITE_SUBSCRIPTION = gql`
  subscription($convoId: String) {
    acceptedConversationInvite(convoId: $convoId) {
      asurite
      name
      convoId
      fresh
      __typename
    }
  }
`;

export const INVITED_TO_CONVERSATION_SUBSCRIPTION = gql`
  subscription($recipient: String) {
    invitedToConversation(recipient: $recipient) {
      convoId
      recipient
      sender
      ignored
      __typename
    }
  }
`;

export const INVITED_DIRECT_MESSAGE_SUBSCRIPTION = gql`
  subscription($recipient: String) {
    invitedDirectMessage(recipient: $recipient) {
      convoId
      recipient
      sender
      ignored
      __typename
    }
  }
`;

export const STARTED_DIRECT_MESSAGE_SUBSCRIPTION = gql`
  subscription($recipient: String) {
    startedDirectMessage(recipient: $recipient) {
      convoId
      recipient
      sender
      ignored
      __typename
    }
  }
`;

export const SENT_CHAT_UPDATE_SUBSCRIPTION = gql`
  subscription($asurite: String) {
    sentChatUpdate(asurite: $asurite) {
      asurite
      sender
      convoId
      content
      messageId
      latest
      createdAt
      __typename
    }
  }
`;
