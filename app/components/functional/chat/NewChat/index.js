import React, { PureComponent } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator
} from "react-native";
import axios from "axios";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { EventRegister } from "react-native-event-listeners";
import NewChatUser from "./NewChatUser";
import NewChatFriend from "./NewChatFriend";
import { AppSyncComponent } from "../../authentication/auth_components/appsync/AppSyncApp";
import { getFriendList } from "../../../../Queries";
import { bubbleFriendsAndFilter, isUserApprovedForChat } from "../utility";
import { DirectMessage } from "../DirectMessage/DirectMessage";
import { SettingsContext } from "../../../achievement/Settings/Settings";
import { ErrorWrapper } from "../../error/ErrorWrapper";

class NewChatContent extends PureComponent {
  // For showing a set number of users per page render.
  // When a user wants more, we move to a higher index.
  // Not rendering whole list for performance.
  showIndex = 0;

  state = {
    user_search: "",
    users: [],
    showUsers: [],
    selected_user: null,
    searching: false,
    displayDM: false
  };

  checkedTimes = 0;

  static defaultProps = {
    friends_list: []
  };

  componentDidMount() {
    this.listener = EventRegister.addEventListener("displayDM", data => {
      this.setState({ displayDM: data });
    });
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);
  }

  /**
   * Using axios so that we can auto search without
   * needing to hit a send button. If a request is
   * in progress then we can cancel it with axios.
   */
  searchForUsers = () => {
    const { searching, user_search } = this.state;
    const { friends_list } = this.props;
    if (typeof this._source !== typeof undefined) {
      this._source.cancel("Operation canceled due to new request.");
    }

    if (!searching) {
      this.setState({
        searching: true
      });
    }

    // save the new request for cancellation
    this._source = axios.CancelToken.source();

    axios
      .get(
        `https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/user-details?displayName=${encodeURI(
          user_search
        )}`,
        { cancelToken: this._source.token }
      )
      .then(response => {
        // console.log(response);
        this.showIndex = 0;
        //const users = bubbleFriendsAndFilter(response.data, friends_list);
        const users = response.data;
        const addition = [];

        for (let i = this.showIndex; i < this.showIndex + 10; i++) {
          if (users[i]) {
            addition.push(users[i]);
          } else {
            break;
          }
        }
        this.showIndex += 10;

        this.setState({
          users,
          showUsers: addition,
          searching: false
        });
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          console.log("Request canceled", error);
        } else {
          this.setState({
            searching: false
          });
          console.log(error);
        }
      });
  };

  showTenMoreUsers = () => {
    const { users, showUsers } = this.state;
    const addition = [];

    for (let i = this.showIndex; i < this.showIndex + 10; i++) {
      if (users[i]) {
        addition.push(users[i]);
      } else {
        break;
      }
    }
    this.showIndex += 10;
    this.setState({
      showUsers: showUsers.concat(addition)
    });
  };

  updateMessageState = text => {
    const { user_search } = this.state;
    this.setState({ selected_user: null, user_search: text }, () => {
      if (user_search && user_search.length > 1) {
        this.searchForUsers();
      } else {
        this.setState({
          showUsers: []
        });
      }
    });
  };

  showEmptyListView = () => {
    return (
      <View
        style={{
          flex: 1,
          height: responsiveHeight(80),
          marginTop: responsiveHeight(10),
          // justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white"
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            color: "#b3b3b3",
            textAlign: "center",
            fontSize: responsiveFontSize(2),
            fontFamily: "Roboto"
            // padding: 50
          }}
        >
          No users
        </Text>
        <Text
          style={{
            fontWeight: "bold",
            color: "#b3b3b3",
            textAlign: "center",
            padding: 50,
            fontFamily: "Roboto"
          }}
        >
          Use the search bar above to find friends to chat with. Attempting to
          chat with users who aren&apost friends will still create a
          conversation but they will receive an invite rather than message
          updates.
        </Text>
      </View>
    );
  };

  _renderFriend = ({ item }) => {
    const { navigation } = this.props;
    const { selected_user } = this.state;
    return (
      <SettingsContext.Consumer>
        {settings => (
          <NewChatFriend
            navigation={navigation}
            invokerAsurite={settings.user}
            friendStatus
            asurite={item.friend}
            selected_user={selected_user}
            select_user={user => {
              this.setState({
                selected_user: user
              });
            }}
          />
        )}
      </SettingsContext.Consumer>
    );
  };

  _renderItem = ({ item }) => {
    const { friends_list, navigation } = this.props;
    const { selected_user } = this.state;
    const source = item._source;
    let isFriend = false;

    const index = friends_list.findIndex(friend => {
      return friend.friend === source.asuriteId;
    });

    if (index > -1) {
      isFriend = true;
    }
    return (
      <SettingsContext.Consumer>
        {settings => (
          <NewChatUser
            navigation={navigation}
            invokerAsurite={settings.user}
            friendStatus={isFriend}
            user={source}
            selected_user={selected_user}
            select_user={user => {
              this.setState({
                selected_user: user
              });
            }}
          />
        )}
      </SettingsContext.Consumer>
    );
  };

  // checkIfUserApprovedForChat() {
  //   this.checkedTimes++;
  //   if (this.checkedTimes > 2) {
  //     this.checkedTimes = 0;
  //   } else {
  //     const { selected_user } = this.state;
  //     if (selected_user) {
  //       isUserApprovedForChat(selected_user.asuriteId).then(result => {
  //         if (result) {
  //           this.setState({
  //             displayDM: true
  //           });
  //         } else {
  //           this.setState({
  //             displayDM: false
  //           });
  //         }
  //       });
  //     }
  //   }
  // }

  render() {
    // this.checkIfUserApprovedForChat();
    const {
      user_search,
      showUsers,
      searching,
      displayDM,
      selected_user
    } = this.state;
    const { friends_list, navigation } = this.props;
    return (
      <ErrorWrapper>
        <View style={{ flex: 1, backgroundColor: "#e8e8e8" }}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              fontSize: 16,
              paddingVertical: 20,
              paddingHorizontal: 10,
              backgroundColor: "white"
            }}
            value={user_search}
            placeholder="Search for users"
            onChangeText={this.updateMessageState}
          />
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              marginHorizontal: responsiveWidth(3),
              marginTop: responsiveWidth(3)
            }}
          >
            {!showUsers.length ? (
              <FlatList
                style={{
                  paddingBottom: 40,
                  flex: 1
                }}
                data={friends_list}
                renderItem={this._renderFriend}
                keyExtractor={item => item.friend}
                ListEmptyComponent={this.showEmptyListView()}
              />
            ) : (
              <FlatList
                style={{
                  paddingBottom: 40,
                  flex: 1
                }}
                data={showUsers}
                renderItem={this._renderItem}
                keyExtractor={item => item._id}
                ListEmptyComponent={this.showEmptyListView()}
                onEndReached={() => {
                  this.showTenMoreUsers();
                }}
                onEndReachedThreshold={0.3}
              />
            )}
            {searching ? (
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0)",
                  position: "absolute",
                  zIndex: 100,
                  bottom: 0,
                  width: "100%",
                  alignItems: "center"
                }}
              >
                <ActivityIndicator size="large" animating color="maroon" />
              </View>
            ) : null}
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              width: responsiveWidth(100),
              justifyContent: "flex-end",
              flexDirection: "row",
              padding: 20
            }}
            pointerEvents="box-none"
          >
            {selected_user && displayDM ? (
              <View
                style={{
                  backgroundColor: "#AF183D",
                  height: responsiveWidth(14),
                  width: responsiveWidth(14),
                  borderRadius: responsiveHeight(6),
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <DirectMessage
                  navigation={navigation}
                  arrow
                  asurite={selected_user.asuriteId}
                  title={
                    selected_user.displayName
                      ? selected_user.displayName
                      : selected_user.asuriteId
                  }
                />
              </View>
            ) : null}
          </View>
        </View>
      </ErrorWrapper>
    );
  }
}

const NewChat = AppSyncComponent(NewChatContent, getFriendList);

export default NewChat;
