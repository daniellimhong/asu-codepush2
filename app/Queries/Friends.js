import gql from "graphql-tag";
import { graphql } from "react-apollo";
import _ from "lodash";

export const GetBlockedUsersQuery = gql`
  query {
    getBlockedUsers
  }
`;

export const getBlockedUsers = graphql(GetBlockedUsersQuery, {
  options: {
    fetchPolicy: "cache-and-network"
  },
  props: props => {
    return {
      blocked_users: _.get(props, "data.getBlockedUsers")
        ? _.get(props, "data.getBlockedUsers")
        : []
    };
  }
});

export const UNBLOCK_USER_MUTATION = gql`
  mutation($asurite: String) {
    unblockUser(asurite: $asurite)
  }
`;

export const unblockUserMutation = graphql(UNBLOCK_USER_MUTATION, {
  props: props => ({
    unblockUser: asurite => {
      props.mutate({
        variables: {
          asurite
        },
        update: (store, resp) => {
          try {
            let data = store.readQuery({
              query: GetBlockedUsersQuery
            });
            if (data.getBlockedUsers && data.getBlockedUsers.length) {
              let index = data.getBlockedUsers.indexOf(resp.data.unblockUser);
              if (index !== -1) {
                data.getBlockedUsers.splice(index, 1);
                data.getBlockedUsers = [...data.getBlockedUsers];
                store.writeQuery({
                  query: GetBlockedUsersQuery,
                  data
                });
              }
            }
          } catch (e) {
            console.log(e);
          }
        }
      });
    }
  })
});

export const BLOCK_USER_MUTATION = gql`
  mutation($asurite: String) {
    blockUser(asurite: $asurite)
  }
`;

export const blockUserMutation = graphql(BLOCK_USER_MUTATION, {
  props: props => ({
    blockUser: asurite => {
      props.mutate({
        variables: {
          asurite
        },
        update: (store, resp) => {
          try {
            const data = store.readQuery({
              query: GetBlockedUsersQuery
            });
            if (!data.getBlockedUsers || !data.getBlockedUsers.length) {
              data.getBlockedUsers = [resp.data.blockUser];
            } else if (
              data.getBlockedUsers &&
              data.getBlockedUsers.length > 0
            ) {
              data.getBlockedUsers.push(resp.data.blockUser);
              data.getBlockedUsers = _.uniq(data.getBlockedUsers);
            }

            store.writeQuery({
              query: GetBlockedUsersQuery,
              data
            });
          } catch (e) {
            console.log(e);
          }
        }
      });
    }
  })
});

export const VerifyFriendStatusQuery = gql`
  query($asurite: String) {
    verifyFriends(asurite: $asurite)
  }
`;

export const VerifyFriendRequestSentQuery = gql`
  query($asurite: String) {
    verifyRequestSent(asurite: $asurite)
  }
`;

export const FriendsListQuery = gql`
  query($count: Int, $nextToken: String) {
    getFriendsList(count: $count, nextToken: $nextToken) {
      friends {
        friend
        permissions {
          social
          academic
          checkins
          share
        }
      }
      nextToken
      __typename
    }
  }
`;

export const FriendRequestsQuery = gql`
  query($count: Int, $nextToken: String) {
    getFriendRequests(count: $count, nextToken: $nextToken) {
      requests {
        requester
        message
        ignore
      }
      nextToken
    }
  }
`;

export const OutgoingFriendRequestsQuery = gql`
  query {
    getOutgoingFriendRequests {
      outgoing_requests {
        requestee
        __typename
      }
    }
  }
`;

export const AllFriendRequestsQuery = gql`
  query {
    getAllFriendRequests {
      requester
      ignore
      message
    }
  }
`;

export const SendFriendRequestMutation = gql`
  mutation(
    $asurite: String!
    $message: String
    $permissions: Permissions_Input
  ) {
    sendFriendRequest(
      asurite: $asurite
      message: $message
      permissions: $permissions
    ) {
      asurite
      requester
      message
      ignore
    }
  }
`;

export const AcceptFriendRequestMutation = gql`
  mutation($asurite: String) {
    acceptFriendRequest(asurite: $asurite) {
      user
      asurite
      friend
      permissions {
        social
        academic
        __typename
      }
      __typename
    }
  }
`;

export const IgnoreFriendRequestMutation = gql`
  mutation($asurite: String) {
    ignoreFriendRequestv2(asurite: $asurite) {
      requester
      asurite
      message
      ignore
      __typename
    }
  }
`;

export const RemoveFriendMutation = gql`
  mutation($asurite: String) {
    removeFriend(asurite: $asurite) {
      asurite
      friend
      permissions {
        social
        academic
        __typename
      }
    }
  }
`;

/* 
Permissions payload as follows. To add more permission types,
simply update the GQL schema to allow for more Boolean values
for both Permissions and Permissions_Input

New values MUST be booleans

input Permissions_Input {
	social: Boolean
	academic: Boolean
	checkins: Boolean
	share: Boolean
} 
*/
export const UpdateFriendPermissionMutation = gql`
  mutation($asurite: String, $permissions: Permissions_Input) {
    updatePermissions(asurite: $asurite, permissions: $permissions) {
      social
      academic
      checkins
      share
      __typename
    }
  }
`;

export const SendFriendInviteMutation = gql`
  mutation($asurite: String, $event: Event_Data_Input1) {
    inviteFriendToEvent(asurite: $asurite, event: $event)
  }
`;

export const CancelFriendRequestMutation = gql`
  mutation($asurite: String) {
    cancelFriendRequest(asurite: $asurite) {
      requester
      message
      ignore
      __typename
    }
  }
`;

export const ShareNewsMutation = gql`
  mutation($asurite: String, $news: News_Input) {
    shareNewsWithFriend(asurite: $asurite, news: $news)
  }
`;

export const GetSharedNewsFromUserQuery = gql`
  query($asurite: String, $timestamp: String) {
    getSharedNewsFromUser(asurite: $asurite, timestamp: $timestamp) {
      timestamp
      subtype
      data {
        category
        description
        interests
        key
        newsDate
        picture
        rawDate
        teaser
        title
        type
        url
      }
    }
  }
`;

export const GetFriendPermissionsQuery = gql`
  query($asurite: String) {
    getFriendPermissions(asurite: $asurite) {
      social
      academic
      checkins
      share
      __typename
    }
  }
`;

export const GetRosterAsurite = gql`
  query($id: String) {
    getAsuriteFromRosterItem(id: $id) {
      asurite
      empl_id
    }
  }
`;

export const GetClassListQuery = gql`
  query($term: String) {
    getClassList(term: $term) {
      class_nbr
      course_name
      course_id
      subject
      location
      meeting_pattern
      start_time
      start_date
      end_time
      end_date
    }
  }
`;

export const SentFriendRequestSubscription = gql`
  subscription SentFriendRequestSubscription($asurite: String!) {
    sentFriendRequest(asurite: $asurite) {
      requester
      message
      ignore
    }
  }
`;

export const AcceptedFriendRequestSubscription = gql`
  subscription($asurite: String) {
    acceptedFriendRequest(asurite: $asurite) {
      asurite
      friend
      permissions {
        social
        academic
        __typename
      }
      __typename
    }
  }
`;

/**
 * asurite is the user who owns the friend list.
 * Friend is the person being removed
 */
export const RemovedFriendSubscription = gql`
  subscription($friend: String) {
    removedFriend(friend: $friend) {
      asurite
      friend
      permissions {
        social
        academic
        __typename
      }
      __typename
    }
  }
`;

export const IgnoredFriendRequestSubscription = gql`
  subscription($requester: String) {
    ignoredFriendRequest(requester: $requester) {
      requester
      asurite
      message
      ignore
      __typename
    }
  }
`;

export const getFriendRequests = graphql(FriendRequestsQuery, {
  options: {
    fetchPolicy: "cache-and-network"
  },
  props: props => {
    return {
      requests: props.data.getFriendRequests,
      subscribeToNewRequests: () => {
        props.data.subscribeToMore({
          document: SentFriendRequestSubscription,
          variables: {
            asurite: props.ownProps.asurite
          },
          updateQuery: (prev, sub) => {
            let res = { ...prev };
            if (
              sub.subscriptionData &&
              sub.subscriptionData.data &&
              sub.subscriptionData.data.sentFriendRequest
            ) {
              let fr = sub.subscriptionData.data.sentFriendRequest;
              res = {
                ...prev,
                getFriendRequests: {
                  ...prev.getFriendRequests,
                  requests: [
                    ...prev.getFriendRequests.requests.filter(req => {
                      return req.requester !== fr.requester;
                    }),
                    fr
                  ]
                }
              };
            }
            return res;
          }
        });
      }
    };
  }
});
export const getOutgoingFriendRequests = graphql(OutgoingFriendRequestsQuery, {
  options: {
    fetchPolicy: "cache-and-network"
  },
  props: props => {
    return {
      outgoing_requests:
        props.data.getOutgoingFriendRequests &&
        props.data.getOutgoingFriendRequests.outgoing_requests &&
        props.data.getOutgoingFriendRequests.outgoing_requests.length
          ? props.data.getOutgoingFriendRequests.outgoing_requests
          : [],
      subscribeToIgnores: () => {
        /**
         * Subscribe to other people removing your friend requests
         */
        props.data.subscribeToMore({
          document: IgnoredFriendRequestSubscription,
          variables: {
            requester: props.ownProps.asurite
          },
          updateQuery: (prev, sub) => {
            // console.log("Ignore subscription fired", prev, sub);
            let target;
            try {
              if (sub.subscriptionData.data.ignoredFriendRequest.asurite) {
                target = sub.subscriptionData.data.ignoredFriendRequest.asurite;
              }
            } catch (e) {
              console.log(e);
              target = null;
            }
            let res = {
              ...prev,
              getOutgoingFriendRequests: {
                ...prev.getOutgoingFriendRequests,
                outgoing_requests: [
                  ...prev.getOutgoingFriendRequests.outgoing_requests.filter(
                    req => {
                      return req.requestee !== target;
                    }
                  )
                ]
              }
            };
            // console.log(res, target);
            return res;
          }
        });
      }
    };
  }
});

export const getFriendList = graphql(FriendsListQuery, {
  options: {
    fetchPolicy: "cache-and-network"
  },
  props: props => {
    return {
      friends_list:
        props.data.getFriendsList &&
        props.data.getFriendsList.friends &&
        props.data.getFriendsList.friends.length
          ? props.data.getFriendsList.friends
          : [],
      subscribeToNewFriends: asurite => {
        props.data.subscribeToMore({
          document: AcceptedFriendRequestSubscription,
          variables: {
            asurite: asurite
          },
          updateQuery: (prev, sub) => {
            let res = { ...prev };
            if (
              sub.subscriptionData &&
              sub.subscriptionData.data &&
              sub.subscriptionData.data.acceptedFriendRequest
            ) {
              let friend = sub.subscriptionData.data.acceptedFriendRequest;
              friend.asurite = asurite;
              friend.friend = friend.user;
              res.getFriendsList = { ...res.getFriendsList };
              res.getFriendsList.friends = [
                ...res.getFriendsList.friends.filter(item => {
                  return item.friend !== friend.friend;
                }),
                friend
              ];
            }
            return res;
          }
        });
      },
      subscribeToFriendRemoval: asurite => {
        props.data.subscribeToMore({
          document: RemovedFriendSubscription,
          variables: {
            friend: asurite
          },
          updateQuery: (prev, sub) => {
            let res = { ...prev };
            if (
              sub.subscriptionData &&
              sub.subscriptionData.data &&
              sub.subscriptionData.data.removedFriend
            ) {
              let remover = sub.subscriptionData.data.removedFriend;
              if (
                res.getFriendsList &&
                res.getFriendsList.friends &&
                res.getFriendsList.friends.length
              ) {
                let list = res.getFriendsList.friends;
                for (let i = 0; i < list.length; i++) {
                  if (list[i].friend == remover.asurite) {
                    list.splice(i, 1);
                    res.getFriendsList.friends = list;
                    break;
                  }
                }
              }
            }
            return res;
          }
        });
      }
    };
  }
});

export const getFriendListCount = graphql(FriendsListQuery, {
  options: {
    fetchPolicy: "network-only",
    pollInterval: 10000
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    if (
      props.data.getFriendsList &&
      props.data.getFriendsList.friends &&
      props.data.getFriendsList.friends.length > 0
    ) {
      return {
        friend_count: props.data.getFriendsList.friends.length
      };
    } else {
      return {
        friend_count: 0
      };
    }
  }
});

export const ignoreFriendRequest = graphql(IgnoreFriendRequestMutation, {
  props: props => ({
    ignoreRequest: request => {
      props
        .mutate({
          variables: {
            asurite: request
          },
          update: (store, { resp }) => {
            try {
              let data = store.readQuery({
                query: FriendRequestsQuery,
                variables: {
                  count: null,
                  nextToken: null
                }
              });

              if (
                data.getFriendRequests.requests &&
                data.getFriendRequests.requests.length > 0
              ) {
                data.getFriendRequests.requests = data.getFriendRequests.requests.filter(
                  req => {
                    return req.requester !== request;
                  }
                );
                store.writeQuery({
                  query: FriendRequestsQuery,
                  variables: {
                    count: null,
                    nextToken: null
                  },
                  data
                });
              }
            } catch (e) {
              console.log(e);
            }
          }
        })
        .then(resp => {
          console.log("Ignore response", resp);
        })
        .catch(e => {
          console.log(e);
        });
    }
  })
});

export const sendFriendRequest = graphql(SendFriendRequestMutation, {
  props: props => ({
    sendFriendRequest: request => {
      return props
        .mutate({
          variables: {
            ...request
          },
          update: (store, { resp }) => {
            try {
              let data = store.readQuery({
                query: VerifyFriendRequestSentQuery,
                variables: {
                  asurite: props.ownProps.asurite
                }
              });

              data.verifyRequestSent = true;

              store.writeQuery({
                query: VerifyFriendRequestSentQuery,
                variables: {
                  asurite: props.ownProps.asurite
                },
                data
              });
            } catch (e) {
              console.log(e);
            }
          }
        })
        .then(resp => {
          return new Promise.resolve(resp);
        })
        .catch(e => {
          return new Promise.reject(e);
        });
    }
  })
});

export const cancelFriendRequest = graphql(CancelFriendRequestMutation, {
  props: props => ({
    cancelFriendRequest: asurite => {
      return props
        .mutate({
          variables: {
            asurite: asurite
          },
          update: (store, { resp }) => {
            try {
              let data = store.readQuery({
                query: VerifyFriendRequestSentQuery,
                variables: {
                  asurite: props.ownProps.asurite
                }
              });

              data.verifyRequestSent = false;

              store.writeQuery({
                query: VerifyFriendRequestSentQuery,
                variables: {
                  asurite: props.ownProps.asurite
                },
                data
              });
            } catch (e) {
              console.log(e);
            }
          }
        })
        .then(resp => {
          // console.log("Cancel worked");
          return new Promise.resolve(resp);
        })
        .catch(e => {
          console.log("Cancel failed", e);
          return new Promise.reject(e);
        });
    }
  })
});

export const verifyFriendStatus = graphql(VerifyFriendStatusQuery, {
  options: props => ({
    fetchPolicy: "network-only",
    variables: { asurite: props.asurite }
  }),
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    return {
      verifyFriends: props.data.verifyFriends
    };
  }
});

export const verifyRequestSent = graphql(VerifyFriendRequestSentQuery, {
  options: props => ({
    fetchPolicy: "network-only",
    variables: { asurite: props.asurite }
  }),
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    return {
      verifyRequestSent: props.data.verifyRequestSent
    };
  }
});
export const getFriendPermissions = graphql(GetFriendPermissionsQuery, {
  options: props => ({
    fetchPolicy: "network-only",
    variables: { asurite: props.asurite }
  }),
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    let filtered;
    if (props.data.getFriendPermissions === null) {
      filtered = {};
    } else {
      filtered = props.data.getFriendPermissions;
    }
    return {
      permissions: filtered
    };
  }
});
export const updatePermissions = graphql(UpdateFriendPermissionMutation, {
  props: props => ({
    updatePermissions: args => {
      for (var key in args.permissions) {
        if (args.permissions.hasOwnProperty(key)) {
          if (args.permissions[key] === null) {
            args.permissions[key] = true;
          }
          if (key === "__typename") {
            delete args.permissions[key];
          }
        }
      }
      props
        .mutate({
          variables: {
            ...args
          },
          update: (store, { resp }) => {
            try {
              let data = store.readQuery({
                query: GetFriendPermissionsQuery,
                variables: {
                  asurite: props.ownProps.asurite
                }
              });

              data.getFriendPermissions = {
                ...args.permissions,
                __typename: "Permissions"
              };

              store.writeQuery({
                query: GetFriendPermissionsQuery,
                variables: {
                  asurite: props.ownProps.asurite
                },
                data
              });
            } catch (e) {
              console.log(e);
            }
          }
        })
        .then(resp => {
          console.log("Mutation resp", resp);
        })
        .catch(e => {
          console.log("Mutation fail", e);
        });
    }
  })
});

export const removeFriend = graphql(RemoveFriendMutation, {
  props: props => ({
    removeFriend: asurite => {
      return props
        .mutate({
          variables: {
            asurite: asurite
          },
          optimisticResponse: () => ({
            removeFriend: {
              friend: asurite,
              permissions: {
                social: null,
                academic: null,
                __typename: "Permissions"
              },
              __typename: "Friend"
            }
          }),
          update: (store, { resp }) => {
            try {
              const data = store.readQuery({
                query: FriendsListQuery,
                variables: {
                  count: null,
                  nextToken: null
                }
              });

              let pruned = [];
              data.getFriendsList.friends.forEach(record => {
                if (record.friend !== asurite) {
                  pruned.push(record);
                }
              });

              data.getFriendsList.friends = pruned;

              store.writeQuery({
                query: FriendsListQuery,
                variables: {
                  count: null,
                  nextToken: null
                },
                data
              });
            } catch (e) {
              console.log(e);
            }
          }
        })
        .then(resp => {
          return new Promise.resolve(resp);
        })
        .catch(e => {
          console.log("ERR?", e);
          return new Promise.reject(e);
        });
    }
  })
});

export const acceptFriendRequest = graphql(AcceptFriendRequestMutation, {
  props: props => ({
    acceptRequest: request => {
      props
        .mutate({
          variables: {
            asurite: request
          },
          update: (store, { resp }) => {
            /**
             * Update Friends List store
             */
            try {
              addRequestAsFriend(store, request, resp);
              removeRequestFromCache(store, request, resp);
            } catch (e) {
              console.log(e);
            }
          }
        })
        .then(resp => {
          console.log("Accept response", resp);
        });
    }
  })
});

function addRequestAsFriend(store, request, resp) {
  let data = store.readQuery({
    query: FriendsListQuery,
    variables: {
      count: null,
      nextToken: null
    }
  });

  data.getFriendsList.friends.push({
    friend: request,
    permissions: {
      academic: null,
      social: null,
      checkins: null,
      share: null,
      __typename: "Permissions"
    },
    __typename: "Friend"
  });

  store.writeQuery({
    query: FriendsListQuery,
    variables: {
      count: null,
      nextToken: null
    },
    data
  });
}

function removeRequestFromCache(store, request, resp) {
  let data = store.readQuery({
    query: FriendRequestsQuery,
    variables: {
      count: null,
      nextToken: null
    }
  });

  let requests = data.getFriendRequests.requests;
  let pruned = [];
  for (var i = 0; i < requests.length; i++) {
    if (requests[i].requester !== request) {
      pruned.push(requests[i]);
    }
  }
  data.getFriendRequests.requests = pruned;
  store.writeQuery({
    query: FriendRequestsQuery,
    variables: {
      count: null,
      nextToken: null
    },
    data
  });
}
