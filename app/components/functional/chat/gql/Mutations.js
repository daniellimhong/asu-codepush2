import gql from "graphql-tag";
import { graphql } from "react-apollo";
import _ from "lodash";
import Toast from "react-native-easy-toast";
import {
  addConversationOnInviteAccept,
  addConversationOnCreate,
  removeInviteOnAccept,
  addMessageWhenSent,
  removeConversationOnLeave,
  removeConversationOnDelete,
  removeInviteOnIgnore,
  updateDirectMessageId,
  updateLastSeenOnUpdate,
  removeMessage
} from "./utility";

export const REPORT_USER_MUTATION = gql`
  mutation reportUser(
    $reportee: String
    $reason: String
    $convoId: String
    $contact: String
  ) {
    reportUser(
      reportee: $reportee
      reason: $reason
      convoId: $convoId
      contact: $contact
    ) {
      reporter
      reportee
      reason
      convoId
      __typename
    }
  }
`;

export const reportUserMutation = graphql(REPORT_USER_MUTATION, {
  props: props => ({
    reportUser: (reportee, reason, convoId, contact) => {
      return props.mutate({
        variables: {
          reportee,
          reason,
          convoId,
          contact
        },
        optimisticResponse: {
          reportUser: {
            reportee,
            reason,
            convoId,
            contact,
            __typename: "Report"
          }
        }
      });
    }
  })
});

export const DELETE_CONVERSATION_MUTATION = gql`
  mutation($convoId: String) {
    deleteConversation(convoId: $convoId) {
      convoId
      asurite
      __typename
    }
  }
`;

export const deleteConversationMutation = graphql(
  DELETE_CONVERSATION_MUTATION,
  {
    props: props => ({
      deleteConversation: (convoId, asurite) => {
        return props.mutate({
          variables: {
            convoId
          },
          optimisticResponse: {
            deleteConversation: {
              convoId,
              asurite,
              __typename: "UserConversation"
            }
          },
          update: (store, resp) => {
            removeConversationOnDelete(store, resp);
          }
        });
      }
    })
  }
);

export const CREATE_CONVERSATION_MUTATION = gql`
  mutation($name: String) {
    createConversation(name: $name) {
      convoId
      asurite
      __typename
    }
  }
`;

export const createConversationMutation = graphql(
  CREATE_CONVERSATION_MUTATION,
  {
    props: props => ({
      createConversation: name => {
        props
          .mutate({
            variables: {
              name
            },
            update: (store, resp) => {
              try {
                addConversationOnCreate(store, resp.data.createConversation);
              } catch (e) {
                console.log(e);
              }
            }
          })
          .then(userConvo => {
            console.log("Create conversation response: ", userConvo);
          })
          .catch(e => {
            console.log(e);
          });
      }
    })
  }
);

export const ACCEPT_CONVERSATION_INVITE_MUTATION = gql`
  mutation($convoId: String) {
    acceptConversationInvite(convoId: $convoId) {
      convoId
      asurite
      name
      lastSeen
      latest
      __typename
    }
  }
`;

export const acceptConversationInviteMutation = graphql(
  ACCEPT_CONVERSATION_INVITE_MUTATION,
  {
    props: props => ({
      acceptConversationInvite: convoId => {
        props
          .mutate({
            variables: {
              convoId
            },
            update: (store, resp) => {
              addConversationOnInviteAccept(store, resp);
              removeInviteOnAccept(store, resp);
            }
          })
          .then(userConvo => {
            console.log("Join conversation: ", userConvo);
          })
          .catch(e => {
            console.log(e);
          });
      }
    })
  }
);

export const IGNORE_CONVERSATION_INVITE_MUTATION = gql`
  mutation($convoId: String) {
    ignoreConversationInvite(convoId: $convoId) {
      convoId
      recipient
      sender
      ignored
      __typename
    }
  }
`;

export const ignoreConversationInviteMutation = graphql(
  IGNORE_CONVERSATION_INVITE_MUTATION,
  {
    props: props => ({
      ignoreConversationInvite: convoId => {
        props
          .mutate({
            variables: {
              convoId
            },
            optimisticResponse: {
              ignoreConversationInvite: {
                convoId,
                recipient: "loading",
                sender: "loading",
                ignored: true,
                __typename: "Conversation_Invite"
              }
            },
            update: (store, resp) => {
              removeInviteOnIgnore(store, resp);
            }
          })
          .then(invite => {
            console.log("Ignore please: ", invite);
          })
          .catch(e => {
            console.log(e);
          });
      }
    })
  }
);

export const REMOVE_FROM_CONVERSATION_MUTATION = gql`
  mutation($convoId: String, $asurite: String) {
    removeFromConversation(convoId: $convoId, asurite: $asurite) {
      convoId
      asurite
      __typename
    }
  }
`;

export const removeFromConversationMutation = graphql(
  REMOVE_FROM_CONVERSATION_MUTATION,
  {
    props: props => ({
      removeFromConversation: ({ convoId, asurite }) => {
        props
          .mutate({
            variables: {
              convoId,
              asurite
            }
          })
          .then(userConvo => {
            console.log("Remove from conversation: ", userConvo);
          })
          .catch(e => {
            console.log(e);
          });
      }
    })
  }
);

export const DEACTIVATE_CONVERSATION_FOR_ME_MUTATION = gql`
  mutation($convoId: String) {
    deactivateConversationForMe(convoId: $convoId) {
      convoId
      asurite
      __typename
    }
  }
`;

export const deactivateConversationMutation = graphql(
  DEACTIVATE_CONVERSATION_FOR_ME_MUTATION,
  {
    props: props => ({
      deactivateConversationForMe: (convoId, asurite) => {
        return props
          .mutate({
            variables: {
              convoId
            },
            optimisticResponse: {
              deactivateConversationForMe: {
                asurite,
                convoId,
                fresh: true,
                name: null,
                __typename: "UserConversation"
              }
            },
            update: (store, resp) => {
              removeConversationOnLeave(
                store,
                resp,
                resp.data.deactivateConversationForMe
              );
            }
          })
          .then(userConvo => {
            console.log("Leave conversation: ", userConvo);
          })
          .catch(e => {
            console.log(e);
          });
      }
    })
  }
);

export const REACTIVATE_CONVERSATION_FOR_ME_MUTATION = gql`
  mutation($convoId: String) {
    reactivateConversationForMe(convoId: $convoId) {
      convoId
      asurite
      __typename
    }
  }
`;

export const reactivateConversationForMeMutation = graphql(
  REACTIVATE_CONVERSATION_FOR_ME_MUTATION,
  {
    props: props => ({
      reactivateConversationForMe: convoId => {
        return props.mutate({
          variables: {
            convoId
          },
          update: (store, resp) => {
            addConversationOnCreate(
              store,
              resp.data.reactivateConversationForMe
            );
          }
        });
      }
    })
  }
);

export const LEAVE_CONVERSATION_MUTATION = gql`
  mutation($convoId: String) {
    leaveConversation(convoId: $convoId) {
      convoId
      asurite
      __typename
    }
  }
`;

export const leaveConversationMutation = graphql(LEAVE_CONVERSATION_MUTATION, {
  props: props => ({
    leaveConversation: (convoId, asurite) => {
      return props
        .mutate({
          variables: {
            convoId
          },
          optimisticResponse: {
            leaveConversation: {
              asurite,
              convoId,
              fresh: true,
              name: null,
              __typename: "UserConversation"
            }
          },
          update: (store, resp) => {
            removeConversationOnLeave(store, resp, resp.data.leaveConversation);
          }
        })
        .then(userConvo => {
          console.log("Leave conversation: ", userConvo);
        })
        .catch(e => {
          console.log(e);
        });
    }
  })
});

export const INVITE_TO_CONVERSATION_MUTATION = gql`
  mutation($convoId: String, $asurite: String) {
    inviteToConversation(convoId: $convoId, asurite: $asurite) {
      convoId
      recipient
      sender
      ignored
      __typename
    }
  }
`;

export const inviteToConversationMutation = graphql(
  INVITE_TO_CONVERSATION_MUTATION,
  {
    props: props => ({
      inviteToConversation: ({ convoId, asurite }) => {
        return props
          .mutate({
            variables: {
              convoId,
              asurite
            }
          })
          .then(invite => {
            return invite;
          })
          .catch(e => {
            throw e;
          });
      }
    })
  }
);

export const CREATE_MESSAGE_MUTATION = gql`
  mutation(
    $convoId: String
    $content: String
    $messageId: String
    $obscure: Boolean
    $file: String
    $agentAction: String
    $agentAsurite: String
    $agentName: String
  ) {
    createMessage(
      convoId: $convoId
      content: $content
      messageId: $messageId
      obscure: $obscure
      file: $file
      agentAction: $agentAction
      agentAsurite: $agentAsurite
      agentName: $agentName
    ) {
      content
      convoId
      createdAt
      messageId
      file
      sender
      obscure
      agentAction
      agentAsurite
      agentName
      __typename
    }
  }
`;

export const createMessageMutation = graphql(CREATE_MESSAGE_MUTATION, {
  props: props => ({
    createMessage: (
      {
        convoId,
        content,
        messageId,
        obscure,
        file,
        agentAction,
        agentAsurite,
        agentName
      },
      data
    ) => {
      const optim = `${new Date().getTime()}`;
      return props
        .mutate({
          variables: {
            convoId,
            content,
            messageId,
            file,
            obscure,
            agentAction,
            agentAsurite,
            agentName
          },
          optimisticResponse: {
            createMessage: {
              convoId,
              createdAt: optim,
              messageId,
              sender: data.asurite,
              content,
              file,
              obscure,
              agentAction,
              agentAsurite,
              agentName,
              __typename: "Message"
            }
          },
          update: (store, resp) => {
            addMessageWhenSent(store, resp, data);
          }
        })
        .then(message => {})
        .catch(e => {
          return e.graphQLErrors[0].message;
        });
    }
  })
});

export const START_DIRECT_MESSAGE_MUTATION = gql`
  mutation($recipient: String) {
    startDirectMessage(recipient: $recipient) {
      convoId
      recipient
      sender
      ignored
      __typename
    }
  }
`;

export const startDirectMessageMutation = graphql(
  START_DIRECT_MESSAGE_MUTATION,
  {
    props: props => ({
      startDirectMessage: recipient => {
        return props.mutate({
          variables: {
            recipient
          },
          update: (store, resp) => {
            addConversationOnCreate(store, resp.data.startDirectMessage);
            updateDirectMessageId(store, resp.data.startDirectMessage);
          }
        });
      }
    })
  }
);

export const INVITE_DIRECT_MESSAGE_MUTATION = gql`
  mutation($recipient: String) {
    inviteDirectMessage(recipient: $recipient) {
      convoId
      recipient
      sender
      ignored
      __typename
    }
  }
`;

export const inviteDirectMessageMutation = graphql(
  INVITE_DIRECT_MESSAGE_MUTATION,
  {
    props: props => ({
      inviteDirectMessage: ({ recipient, convoId }) => {
        return props.mutate({
          variables: {
            recipient,
            convoId
          },
          optimisticResponse: {
            inviteDirectMessage: {
              convoId,
              recipient
            }
          },
          update: (store, resp) => {
            const time = new Date().getTime();
            const mockConversation = {
              convoId: resp.data.inviteDirectMessage.convoId,
              createdAt: time,
              latest: time,
              lastSeen: null,
              asurite: null,
              __typename: "UserConversation",
              name: null
            };
            addConversationOnCreate(store, mockConversation);
            updateDirectMessageId(store, resp.data.inviteDirectMessage);
          }
        });
      }
    })
  }
);

export const UPDATE_LAST_SEEN_MUTATION = gql`
  mutation updateLastSeen($convoId: String, $timestamp: String) {
    updateLastSeen(convoId: $convoId, timestamp: $timestamp) {
      asurite
      convoId
      name
      lastSeen
      latest
      __typename
    }
  }
`;

/**
 * Update the last seen message.
 *
 * Note: No optimistic response here due to the frequency of calls.
 * Optim resps here were leading to a memory leak.
 */
export const updateLastSeenMutation = graphql(UPDATE_LAST_SEEN_MUTATION, {
  props: props => ({
    updateLastSeen: (convoId, timestamp, updateStore = false) => {
      return props
        .mutate({
          variables: {
            convoId,
            timestamp
          },
          update: (store, resp) => {
            const data = _.get(resp, "data.updateLastSeen");
            if (updateStore && data) {
              updateLastSeenOnUpdate(store, data);
            }
          }
        })
        .catch(e => {
          console.log("Could not update last seen", e);
        });
    }
  })
});

export const IGNORE_MESSAGE_MUTATION = gql`
  mutation($convoId: String, $createdAt: String) {
    ignoreMessage(convoId: $convoId, createdAt: $createdAt) {
      content
      convoId
      createdAt
      messageId
      sender
      __typename
    }
  }
`;

export const ignoreMessageMutation = graphql(IGNORE_MESSAGE_MUTATION, {
  props: props => ({
    ignoreMessage: (convoId, createdAt, selected, proceed = false) => {
      return props.mutate({
        variables: {
          convoId,
          createdAt
        },
        optimisticResponse: {
          ignoreMessage: {
            convoId,
            createdAt
          }
        },
        update: (store, resp) => {
          // console.log("Ignore message update did fire: ", resp);
          if (proceed) {
            removeMessage(store, resp, selected);
          }
        }
      });
    }
  })
});

export const HIDE_MESSAGE_FOR_ALL_MUTATION = gql`
  mutation(
    $convoId: String
    $content: String
    $createdAt: String
    $messageId: String
    $sender: String
    $obscure: Boolean
  ) {
    hideMessageForAll(
      convoId: $convoId
      content: $content
      createdAt: $createdAt
      messageId: $messageId
      sender: $sender
      obscure: $obscure
    ) {
      content
      convoId
      createdAt
      messageId
      sender
      obscure
      __typename
    }
  }
`;

export const hideMessageForAllMutation = graphql(
  HIDE_MESSAGE_FOR_ALL_MUTATION,
  {
    props: props => ({
      hideMessageForAll: (
        convoId,
        content,
        createdAt,
        messageId,
        sender,
        obscure,
        selected,
        proceed
      ) => {
        // console.log(proceed);
        return props
          .mutate({
            variables: {
              convoId,
              content,
              createdAt,
              messageId,
              sender,
              obscure
            },
            optimisticResponse: {
              hideMessageForAll: {
                convoId,
                content,
                createdAt,
                messageId,
                sender,
                obscure,
                __typename: "Message"
              }
            },
            update: (store, resp) => {
              if (proceed) {
                removeMessage(store, resp, selected, "all");
              }
            }
          })
          .catch(e => {
            console.log(e);
          });
      }
    })
  }
);
