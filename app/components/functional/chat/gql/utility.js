import gql from "graphql-tag";
import _ from "lodash";
import { EventRegister } from "react-native-event-listeners";
/**
 * Various utility functions for update the AppSync cache when
 * Mutations get things done.
 */

import {
  CONVERSATIONS_QUERY,
  CONVERSATION_INVITES_QUERY,
  CONVERSATION_MESSAGES_QUERY,
  CONVERSATION_RELATION_QUERY
} from "./Queries";

let managedConvo = {};

export function setManagedConvo(messages, convoId, forced) {
  if (forced) {
    managedConvo[convoId] = messages;
    return;
  }
  if (!managedConvo[convoId]) managedConvo[convoId] = [];

  if (messages.length >= managedConvo[convoId].length) {
    managedConvo[convoId] = messages;
  }
}

export function getMessages(messages, convoId) {
  // console.log(messages);
  // console.log(managedConvo[convoId]);
  if (!managedConvo[convoId]) managedConvo[convoId] = [];
  if (messages && messages.length >= managedConvo[convoId].length) {
    managedConvo[convoId] = messages;
    return messages;
  } else {
    return managedConvo[convoId];
  }
}

function updateConvoListStore(convos) {
  EventRegister.emit("updateConvos", convos);
}

/**
 * When a user creates a conversation, we add it to their
 * list of conversations
 */
export function addConversationOnCreate(store, newConvo) {
  try {
    const data = store.readQuery({
      query: CONVERSATIONS_QUERY,
      variables: {
        limit: null,
        nextToken: null
      }
    });

    const index = data.allUserConversations.userConversations.findIndex(
      (convo) => convo.convoId === newConvo.convoId
    );
    if (index === -1) {
      data.allUserConversations.userConversations = [
        newConvo,
        ...data.allUserConversations.userConversations
      ];
    }

    const newData = {
      ...data,
      allUserConversations: {
        ...data.allUserConversations,
        userConversations: [...data.allUserConversations.userConversations]
      }
    };
    updateConvoListStore(newData.allUserConversations.userConversations);

    store.writeQuery({
      query: CONVERSATIONS_QUERY,
      variables: {
        limit: null,
        nextToken: null
      },
      data: newData
    });
  } catch (e) {
    console.log(e);
  }
}

/**
 * When sending a new message, prepend the new message to
 * the list of messages being displayed in the chat window.
 * @param {*} store
 * @param {*} resp
 * @param {*} props
 */
export function addMessageWhenSent(store, resp) {
  try {
    const message = resp.data.createMessage;
    const ConvoMessages = gql`
      query($convoId: String) {
        convoMessages(convoId: $convoId) {
          messages {
            convoId
            createdAt
            messageId
            file
            obscure
            sender
            content
            agentAction
            agentAsurite
            agentName
            __typename
          }
          __typename
        }
      }
    `;

    const data = store.readQuery({
      query: ConvoMessages,
      variables: {
        convoId: message.convoId
      }
    });

    let m = data.convoMessages.messages;
    let messages = getMessages(m, message.convoId);

    let found = false;
    for (let i = 0; i < messages.length; i++) {
      if (messages[i] && messages[i].messageId === message.messageId) {
        found = true;
        break;
      }
    }

    let writeMessages = messages;

    if (!found) {
      writeMessages = [message, ...messages].sort(function sortMessages(a, b) {
        return b.createdAt - a.createdAt;
      });
    }

    setManagedConvo(writeMessages, message.convoId);
    data.convoMessages.messages = writeMessages;

    const newData = {
      convoMessages: {
        ...data.convoMessages,
        messages: writeMessages
      }
    };
    let prevConvos = [];

    try {
      const convoData = store.readQuery({
        query: CONVERSATIONS_QUERY,
        variables: {
          limit: null,
          nextToken: null
        }
      });
      prevConvos = convoData.allUserConversations.userConversations;
    } catch (e) {
      console.log("COULD NOT CONVO QUERY");
    }

    for (let i = 0; i < prevConvos.length; i++) {
      if (prevConvos[i].convoId === message.convoId) {
        prevConvos[i].latest = message.createdAt;
        break;
      }
    }

    prevConvos = _.sortBy(prevConvos, ["latest"]).reverse();

    store.writeQuery({
      query: CONVERSATIONS_QUERY,
      variables: {
        limit: null,
        nextToken: null
      },
      data: {
        allUserConversations: {
          userConversations: prevConvos,
          nextToken: null,
          __typename: "UserConverstationsConnection"
        }
      }
    });

    updateConvoListStore(prevConvos);

    store.writeQuery({
      query: ConvoMessages,
      variables: {
        convoId: message.convoId
      },
      data: newData
    });
  } catch (e) {
    console.log(e);
  }
}

/**
 * When sending a new message, prepend the new message to
 * the list of messages being displayed in the chat window.
 * @param {*} store
 * @param {*} resp
 * @param {*} props
 */
export function updateSingleMessagePreview(store, resp) {
  try {
    const message = resp.data.createMessage;

    const data = store.readQuery({
      query: CONVERSATION_MESSAGES_QUERY,
      variables: {
        convoId: message.convoId,
        limit: 1,
        nextToken: null
      }
    });
    const convoMessages = _.get(data, "allConversationMessages.messages");

    if (Array.isArray(convoMessages)) {
      convoMessages.unshift(message);

      const newData = {
        ...data,
        allConversationMessages: {
          ...data.allConversationMessages,
          messages: [...convoMessages]
        }
      };
      store.writeQuery({
        query: CONVERSATION_MESSAGES_QUERY,
        variables: {
          convoId: message.convoId,
          limit: 1,
          nextToken: null
        },
        data: newData
      });
    }
  } catch (e) {
    console.log(e);
  }
}

/**
 * When sending a new message, update the containing conversation's
 * "latest" message value for comparison against lastSeen
 * @param {*} store
 * @param {*} resp
 * @param {*} props
 */
export function updateLatestWhenSent(store, resp, props) {
  const UserConvo = gql`
    query {
      userConvos {
        userConversations {
          convoId
          name
          lastSeen
          latest
          asurite
          __typename
        }
      }
    }
  `;
  try {
    const data = store.readQuery({
      query: UserConvo
    });

    const index = data.userConvos.userConversations.findIndex(
      (convo) => convo.convoId === props.convoId
    );

    if (index > -1) {
      data.userConvos.userConversations[index].latest =
        resp.data.createMessage.createdAt;
    }

    const newData = {
      ...data,
      userConvos: {
        ...data.userConvos,
        userConversations: [...data.userConvos.userConversations].sort(
          function sortUserConversations(x, y) {
            return x.latest > y.latest ? -1 : 1;
          }
        )
      }
    };

    store.writeQuery({
      query: UserConvo,
      data: newData
    });
  } catch (e) {
    console.log(e);
  }
}

/**
 * When a user accepts a conversation invite, we add it
 * to their list of active conversations
 * @param {*} store
 * @param {*} resp
 */
export function addConversationOnInviteAccept(store, resp) {
  try {
    const newConvo = resp.data.acceptConversationInvite;

    const data = store.readQuery({
      query: CONVERSATIONS_QUERY,
      variables: {
        limit: null,
        nextToken: null
      }
    });

    const newData = {
      ...data,
      allUserConversations: {
        ...data.allUserConversations,
        userConversations: [...data.allUserConversations.userConversations]
      }
    };

    const index = data.allUserConversations.userConversations.findIndex(
      (c) => c.convoId === newConvo.convoId
    );
    if (index === -1) {
      newData.allUserConversations.userConversations = [
        newConvo,
        ...data.allUserConversations.userConversations
      ];
    }
    updateConvoListStore(newData.allUserConversations.userConversations);
    store.writeQuery({
      query: CONVERSATIONS_QUERY,
      variables: {
        limit: null,
        nextToken: null
      },
      data: newData
    });
  } catch (e) {
    console.log(e);
  }
}

/**
 * When a user accepts a conversation invite, we remove
 * it from their list of invites.
 * @param {*} store
 * @param {*} resp
 */
export function removeInviteOnAccept(store, resp) {
  try {
    const newConvo = resp.data.acceptConversationInvite;

    const data = store.readQuery({
      query: CONVERSATION_INVITES_QUERY,
      variables: {
        limit: null,
        nextToken: null
      }
    });

    const newData = {
      ...data,
      getConversationInvites: {
        ...data.getConversationInvites,
        conversationInvites: [
          ...data.getConversationInvites.conversationInvites
        ]
      }
    };

    newData.getConversationInvites.conversationInvites = data.getConversationInvites.conversationInvites.filter(
      (convo) => {
        return newConvo.convoId !== convo.convoId;
      }
    );

    store.writeQuery({
      query: CONVERSATION_INVITES_QUERY,
      variables: {
        limit: null,
        nextToken: null
      },
      data: newData
    });
  } catch (e) {
    console.log(e);
  }
}

/**
 * When a user ignores a conversation invite, we remove
 * it from their list of invites.
 * @param {*} store
 * @param {*} resp
 */
export function removeInviteOnIgnore(store, resp) {
  try {
    const newConvo = resp.data.ignoreConversationInvite;

    const data = store.readQuery({
      query: CONVERSATION_INVITES_QUERY,
      variables: {
        limit: null,
        nextToken: null
      }
    });

    const newData = {
      ...data,
      getConversationInvites: {
        ...data.getConversationInvites,
        conversationInvites: [
          ...data.getConversationInvites.conversationInvites
        ]
      }
    };

    newData.getConversationInvites.conversationInvites = data.getConversationInvites.conversationInvites.filter(
      (convo) => {
        return newConvo.convoId !== convo.convoId;
      }
    );

    store.writeQuery({
      query: CONVERSATION_INVITES_QUERY,
      variables: {
        limit: null,
        nextToken: null
      },
      data: newData
    });
  } catch (e) {
    console.log(e);
  }
}

/**
 * Remove conversation from local cache when leaving the group
 * @param {*} store
 * @param {*} resp
 */
export function removeConversationOnLeave(store, resp, left = null) {
  try {
    // const left = resp.data.leaveConversation;

    const data = store.readQuery({
      query: CONVERSATIONS_QUERY,
      variables: {
        limit: null,
        nextToken: null
      }
    });
    if (left) {
      data.allUserConversations.userConversations = data.allUserConversations.userConversations.filter(
        (convo) => {
          return convo.convoId !== left.convoId;
        }
      );

      const newData = {
        ...data,
        allUserConversations: {
          ...data.allUserConversations,
          userConversations: [...data.allUserConversations.userConversations]
        }
      };

      updateConvoListStore(newData.allUserConversations.userConversations);

      store.writeQuery({
        query: CONVERSATIONS_QUERY,
        variables: {
          limit: null,
          nextToken: null
        },
        data: newData
      });

      store.writeQuery({
        query: CONVERSATION_MESSAGES_QUERY,
        variables: {
          convoId: left.convoId
        },
        data: {
          allConversationMessages: {
            messages: [],
            __typename: "MessageConnection",
            nextToken: null
          }
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
}

/**
 * If a user deletes(leaves) a conversation we want to remove
 * it from the local list of conversations.
 * @param {*} store
 * @param {*} resp
 */
export function removeConversationOnDelete(store, resp) {
  try {
    const left = resp.data.deleteConversation;

    const data = store.readQuery({
      query: CONVERSATIONS_QUERY,
      variables: {
        limit: null,
        nextToken: null
      }
    });

    data.allUserConversations.userConversations = data.allUserConversations.userConversations.filter(
      (convo) => {
        return convo.convoId !== left.convoId;
      }
    );

    const newData = {
      ...data,
      allUserConversations: {
        ...data.allUserConversations,
        userConversations: [...data.allUserConversations.userConversations]
      }
    };

    updateConvoListStore(newData.allUserConversations.userConversations);

    store.writeQuery({
      query: CONVERSATIONS_QUERY,
      variables: {
        limit: null,
        nextToken: null
      },
      data: newData
    });
  } catch (e) {
    console.log(e);
  }
}

/**
 * When sending a brand new DM conversation invite
 * we don't have the new convoId locally, so we generate a temporary
 * one.
 * When we get a response from AppSync we want to update
 * our local conversation to reflect that new ID.
 * @param {*} store
 * @param {*} dm
 */
export function updateDirectMessageId(store, dm) {
  try {
    const data = store.readQuery({
      query: CONVERSATION_RELATION_QUERY,
      variables: {
        asurite: dm.recipient
      }
    });

    const newData = {
      ...data,
      getConversationRelation: {
        ...data.getConversationRelation,
        dmConvoId: dm.convoId
      }
    };

    store.writeQuery({
      query: CONVERSATION_RELATION_QUERY,
      variables: {
        asurite: dm.recipient
      },
      data: newData
    });
  } catch (e) {
    console.log(e);
  }
}

/**
 * When we get to see new messages in the chat window
 * we need to make sure to update the "lastSeen" value
 * for comparison with the "latest" value.
 * This allows us to show UX flags around conversation viewed status.
 * @param {*} store
 * @param {*} resp
 */
export function updateLastSeenOnUpdate(store, resp) {
  const UserConvo = gql`
    query {
      userConvos {
        userConversations {
          convoId
          name
          lastSeen
          latest
          asurite
          __typename
        }
      }
    }
  `;
  try {
    const data = store.readQuery({
      query: UserConvo
    });

    const index = data.userConvos.userConversations.findIndex(
      (convo) => convo.convoId === resp.convoId
    );

    if (index > -1) {
      if (data.userConvos.userConversations[index].lastSeen < resp.lastSeen) {
        data.userConvos.userConversations[index].lastSeen = resp.lastSeen;

        const newData = {
          ...data,
          userConvos: {
            ...data.userConvos,
            userConversations: [...data.userConvos.userConversations]
          }
        };

        store.writeQuery({
          query: UserConvo,
          data: newData
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
}

/**
 *
 * @param {*} store
 * @param {*} resp
 * @param {*} selected All messages to be removed
 */
export function removeMessage(store, resp, selected = [], type) {
  const ConvoMessages = gql`
    query($convoId: String) {
      convoMessages(convoId: $convoId) {
        messages {
          convoId
          createdAt
          messageId
          sender
          content
          obscure
          __typename
        }
        __typename
      }
    }
  `;

  try {
    if (selected.length) {
      const data = store.readQuery({
        query: ConvoMessages,
        variables: {
          convoId: selected[0].convoId
        }
      });

      if (type !== "all") {
        for (let i = selected.length - 1; i > -1; i--) {
          const index = data.convoMessages.messages.findIndex(
            (message) => message.createdAt === selected[i].createdAt
          );
          if (index > -1) {
            if (!data.convoMessages.messages[index].obscure) {
              data.convoMessages.messages.splice(index, 1);
            }
          }
        }
      }

      const newData = {
        ...data,
        convoMessages: {
          ...data.convoMessages,
          messages: [...data.convoMessages.messages]
        }
      };

      setManagedConvo(
        newData.convoMessages.messages,
        selected[0].convoId,
        true
      );

      store.writeQuery({
        query: ConvoMessages,
        variables: {
          convoId: selected[0].convoId
        },
        data: newData
      });
    }
  } catch (e) {
    console.log(e);
  }
}
