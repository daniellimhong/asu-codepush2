import gql from "graphql-tag";
import { graphql } from "react-apollo";
import _ from "lodash";
import { EventRegister } from "react-native-event-listeners";
import {
  CREATED_MESSAGE_SUBSCRIPTION,
  INVITED_TO_CONVERSATION_SUBSCRIPTION,
  INVITED_DIRECT_MESSAGE_SUBSCRIPTION,
  STARTED_DIRECT_MESSAGE_SUBSCRIPTION,
  SENT_CHAT_UPDATE_SUBSCRIPTION,
  DELETED_MESSAGE_SUBSCRIPTION
} from "./Subscriptions";
import { setManagedConvo, getMessages } from "./utility";

export const BLOCKED_STATUS_QUERY = gql`
  query($convoId: String) {
    getBlockedStatus(convoId: $convoId) {
      isConversationBlocked
      amIBlocked
      recipientChatDeactivated
    }
  }
`;

export const getBlockedStatusQuery = graphql(BLOCKED_STATUS_QUERY, {
  options: props => ({
    fetchPolicy: "network-only",
    variables: {
      convoId: props.convoId
    }
  }),
  props: props => {
    return {
      isConversationBlocked: _.get(
        props,
        "data.getBlockedStatus.isConversationBlocked"
      ),
      amIBlocked: _.get(props, "data.getBlockedStatus.amIBlocked"),
      recipientChatDeactivated: _.get(
        props,
        "data.getBlockedStatus.recipientChatDeactivated"
      )
    };
  }
});

export const INVITE_STATUS_QUERY = gql`
  query($convoId: String) {
    getInviteStatus(convoId: $convoId) {
      isInvitePending
    }
  }
`;

export const getInviteStatusQuery = graphql(INVITE_STATUS_QUERY, {
  options: props => ({
    fetchPolicy: "network-only",
    variables: {
      convoId: props.convoId
    }
  }),
  props: props => {
    return {
      isInvitePending: _.get(props, "data.getInviteStatus.isInvitePending")
    };
  }
});

export const CONVERSATIONS_QUERY = gql`
  query($nextToken: String, $limit: Int) {
    allUserConversations(nextToken: $nextToken, limit: $limit)
      @connection(key: "userConvos") {
      userConversations {
        convoId
        name
        lastSeen
        latest
        asurite
        __typename
      }
      nextToken
      __typename
    }
  }
`;

export const getMyConversationsQuery = graphql(CONVERSATIONS_QUERY, {
  options: props => ({
    fetchPolicy: "cache-and-network",
    variables: {
      limit: props.limit ? props.limit : null,
      nextToken: props.nextToken ? props.nextToken : null
    }
  }),
  props: props => {
    const userConvos = _.get(
      props,
      "data.allUserConversations.userConversations"
    );
    const nextToken = _.get(props, ".data.allUserConversations.nextToken");
    return {
      conversations: userConvos || [],
      nextToken,
      loadMore: props.data.fetchMore,
      subscribeToChatUpdates: () => {
        props.data.subscribeToMore({
          document: SENT_CHAT_UPDATE_SUBSCRIPTION,
          variables: {
            asurite: props.ownProps.asurite
          },
          updateQuery: (prev, sub) => {
            const chatUpdate = _.get(
              sub,
              "subscriptionData.data.sentChatUpdate"
            );

            let userConversations = _.get(
              prev,
              "allUserConversations.userConversations"
            );

            if (userConversations && chatUpdate) {
              const index = userConversations.findIndex(
                convo => convo.convoId === chatUpdate.convoId
              );

              if (index === -1) {
                userConversations = [chatUpdate, ...userConversations];
              } else {
                userConversations[index].latest = chatUpdate.latest;
                userConversations.sort(function sortConversations(x, y) {
                  return x.latest > y.latest ? -1 : 1;
                });
              }
            }
            EventRegister.emit("updateConvos", userConversations);
            return {
              ...prev,
              allUserConversations: {
                ...prev.allUserConversations,
                userConversations: [...userConversations]
              }
            };
          }
        });
      },
      subscribeToNewDMs: () => {
        props.data.subscribeToMore({
          document: STARTED_DIRECT_MESSAGE_SUBSCRIPTION,
          variables: {
            recipient: props.ownProps.asurite
          },
          updateQuery: (prev, sub) => {
            const newConvo = _.get(
              sub,
              "subscriptionData.data.startedDirectMessage"
            );

            let userConversations = _.get(
              prev,
              "allUserConversations.userConversations"
            );
            if (userConversations && newConvo) {
              const index = userConversations.findIndex(
                convo => convo.convoId === newConvo.convoId
              );

              if (index === -1) {
                userConversations = [newConvo, ...userConversations];
              }
            }
            EventRegister.emit("updateConvos", userConversations);
            return {
              ...prev,
              allUserConversations: {
                ...prev.allUserConversations,
                userConversations: [...userConversations]
              }
            };
          }
        });
      }
    };
  }
});

export const CONVERSATION_INVITES_QUERY = gql`
  query($nextToken: String, $limit: Int) {
    getConversationInvites(nextToken: $nextToken, limit: $limit) {
      conversationInvites {
        sender
        convoId
        recipient
        ignored
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getMyConversationInvitesQuery = graphql(
  CONVERSATION_INVITES_QUERY,
  {
    options: props => ({
      fetchPolicy: "cache-and-network",
      variables: {
        limit: props.limit ? props.limit : null,
        nextToken: props.nextToken ? props.nextToken : null
      }
    }),
    props: props => {
      return {
        invites: _.get(
          props,
          "data.getConversationInvites.conversationInvites"
        ),
        nextToken: _.get(props, "data.getConversationInvites.nextToken"),
        loadMore: props.data.fetchMore,
        subscribeToInvites: () => {
          props.data.subscribeToMore({
            document: INVITED_TO_CONVERSATION_SUBSCRIPTION,
            variables: {
              recipient: props.ownProps.asurite
            },
            updateQuery: (prev, sub) => {
              const invite = _.get(
                sub,
                "subscriptionData.data.invitedToConversation"
              );
              return {
                ...prev,
                getConversationInvites: {
                  ...prev.getConversationInvites,
                  conversationInvites: [
                    invite,
                    ...prev.getConversationInvites.conversationInvites.filter(
                      inv => {
                        return inv.convoId !== invite.convoId;
                      }
                    )
                  ]
                }
              };
            }
          });
        },
        subscribeDMToInvites: () => {
          props.data.subscribeToMore({
            document: INVITED_DIRECT_MESSAGE_SUBSCRIPTION,
            variables: {
              recipient: props.ownProps.asurite
            },
            updateQuery: (prev, sub) => {
              const invite = _.get(
                sub,
                "subscriptionData.data.invitedDirectMessage"
              );
              return {
                ...prev,
                getConversationInvites: {
                  ...prev.getConversationInvites,
                  conversationInvites: [
                    invite,
                    ...prev.getConversationInvites.conversationInvites.filter(
                      inv => {
                        return inv.convoId !== invite.convoId;
                      }
                    )
                  ]
                }
              };
            }
          });
        }
      };
    }
  }
);

export const CONVERSATION_MESSAGES_QUERY = gql`
  query($convoId: String, $nextToken: String, $limit: Int) {
    allConversationMessages(
      convoId: $convoId
      nextToken: $nextToken
      limit: $limit
    ) @connection(key: "convoMessages", filter: ["convoId"]) {
      messages {
        convoId
        createdAt
        file
        messageId
        sender
        content
        obscure
        agentAction
        agentAsurite
        agentName
        __typename
      }
      nextToken
      __typename
    }
  }
`;

export const getConversationMessagesQuery = graphql(
  CONVERSATION_MESSAGES_QUERY,
  {
    options: props => ({
      fetchPolicy: "cache-and-network",
      variables: {
        convoId: props.convoId,
        limit: props.limit ? props.limit : null,
        nextToken: props.nextToken ? props.nextToken : null
      }
    }),
    props: props => {
      return {
        messages: _.get(props, "data.allConversationMessages.messages"),
        nextToken: _.get(props, "data.allConversationMessages.nextToken"),
        loadMore: props.data.fetchMore,
        subscribeToMessages: () => {
          props.data.subscribeToMore({
            document: CREATED_MESSAGE_SUBSCRIPTION,
            variables: {
              convoId: props.ownProps.convoId
            },
            updateQuery: (prev, sub) => {
              const message = _.get(
                sub,
                "subscriptionData.data.createdMessage"
              );
              // console.log(message);

              if (!message.hasOwnProperty("obscure")) {
                message.obscure = null;
              }
              if (!message.hasOwnProperty("file")) {
                message.file = "{}";
              }
              if (!message.hasOwnProperty("agentAction")) {
                message.file = null;
              }
              if (!message.hasOwnProperty("agentAsurite")) {
                message.file = null;
              }
              if (!message.hasOwnProperty("agentName")) {
                message.file = null;
              }

              const subStore = _.get(prev, "allConversationMessages.messages");
              const messages = getMessages(subStore, props.ownProps.convoId);

              try {
                let found = false;
                for (let i = 0; i < 20; i++) {
                  if (
                    messages[i] &&
                    messages[i].messageId === message.messageId
                  ) {
                    found = true;
                    break;
                  }
                }

                if (!found) {
                  let newMessages = [message, ...messages].sort(
                    function sortMessages(a, b) {
                      return b.createdAt - a.createdAt;
                    }
                  );
                  setManagedConvo(newMessages, props.ownProps.convoId);

                  return {
                    ...prev,
                    allConversationMessages: {
                      ...prev.allConversationMessages,
                      messages: newMessages
                    }
                  };
                }
              } catch (e) {
                console.log(e);
              }
              if (messages) {
                return {
                  ...prev,
                  allConversationMessages: {
                    ...prev.allConversationMessages,
                    messages: [...messages]
                  }
                };
              }
            }
          });
        },
        subscribeToSingleChatUpdates: () => {
          props.data.subscribeToMore({
            document: SENT_CHAT_UPDATE_SUBSCRIPTION,
            variables: {
              asurite: props.ownProps.asurite
            },
            updateQuery: (prev, sub) => {
              const chatUpdate = _.get(
                sub,
                "subscriptionData.data.sentChatUpdate"
              );
              let convoMessages = _.get(
                prev,
                "allConversationMessages.messages"
              );
              if (
                props.ownProps.convoId === chatUpdate.convoId &&
                chatUpdate &&
                convoMessages
              ) {
                const newMsg = {
                  convoId: chatUpdate.convoId,
                  content: chatUpdate.content,
                  createdAt: chatUpdate.latest,
                  file: chatUpdate.file,
                  messageId: chatUpdate.messageId,
                  sender: chatUpdate.sender,
                  obscure: null,
                  __typename: "Message"
                };
                let exists = false;

                for (let i = 0; i < 5; i++) {
                  if (
                    convoMessages[i] &&
                    convoMessages[i].messageId === newMsg.messageId
                  ) {
                    exists = true;
                    break;
                  }
                }

                if (!exists) {
                  convoMessages = [newMsg, ...convoMessages];
                }
              }

              convoMessages = _.uniqBy(convoMessages, "messageId");

              if (convoMessages && convoMessages.length > 0) {
                return {
                  ...prev,
                  allConversationMessages: {
                    ...prev.allConversationMessages,
                    messages: [...convoMessages]
                  }
                };
              }
            }
          });
        },
        subscribeToDeletedMessages: () => {
          props.data.subscribeToMore({
            document: DELETED_MESSAGE_SUBSCRIPTION,
            variables: {
              convoId: props.ownProps.convoId
            }
          });
        }
      };
    }
  }
);

export const CONVERSATION_RELATION_QUERY = gql`
  query($asurite: String) {
    getConversationRelation(asurite: $asurite) {
      dmConvoId
      blocked
      friendStatus
      chatDeactivated
      __typename
    }
  }
`;

export const getConversationRelationQuery = graphql(
  CONVERSATION_RELATION_QUERY,
  {
    options: ({ asurite }) => ({
      fetchPolicy: "cache-and-network",
      variables: {
        asurite
      }
    }),
    props: props => {
      return {
        dmConvoId: _.get(props, "data.getConversationRelation.dmConvoId"),
        blocked: _.get(props, "data.getConversationRelation.blocked"),
        friendStatus: _.get(props, "data.getConversationRelation.friendStatus"),
        chatDeactivated: _.get(
          props,
          "data.getConversationRelation.chatDeactivated"
        )
      };
    }
  }
);

export const CONVERSATION_USERS_QUERY = gql`
  query($convoId: String) {
    getConversationUsers(convoId: $convoId) {
      asurite
      __typename
    }
  }
`;

export const getConversationUsersQuery = graphql(CONVERSATION_USERS_QUERY, {
  options: ({ convoId }) => ({
    fetchPolicy: "cache-and-network",
    variables: {
      convoId
    }
  }),
  props: props => {
    let users = _.get(props, "data.getConversationUsers");
    if (users) {
      users = users.map(user => user.asurite);
    } else {
      users = [];
    }
    return {
      users
    };
  }
});

export const CONVERSATION_ADMIN_STATUS_QUERY = gql`
  query($convoId: String) {
    getConversationAdminStatus(convoId: $convoId)
  }
`;

export const getConversationAdminStatusQuery = graphql(
  CONVERSATION_ADMIN_STATUS_QUERY,
  {
    options: ({ convoId }) => ({
      fetchPolicy: "cache-and-network",
      variables: {
        convoId
      }
    }),
    props: props => {
      return {
        admin_status: !!props.data.getConversationAdminStatus
      };
    }
  }
);
