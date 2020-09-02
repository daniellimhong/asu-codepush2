import React, { PureComponent } from "react";
import {
  NativeModules,
  View,
  StyleSheet,
  Image,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  AsyncStorage,
  AppState
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import _ from "lodash";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { EventRegister } from "react-native-event-listeners";
import { getMyConversationsQuery } from "./gql/Queries";
import { createConversationMutation } from "./gql/Mutations";
import { AppSyncComponent } from "../authentication/auth_components/appsync/AppSyncApp";
import ChatRow from "./ChatRow";
import ChatInvites from "./ChatInvites";
import { DirectMessage } from "./DirectMessage/DirectMessage";
import Testers from "../../../services/shared/testers";
import DeviceInfo from "react-native-device-info";
import { SettingsContext } from "../../achievement/Settings/Settings";
import Analytics from "./../analytics";

const { UIManager } = NativeModules;

// eslint-disable-next-line no-unused-expressions
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

let chatRef = React.createRef();

/**
 * A List component to render all of a user's participating conversations
 * along with some descriptive data so that they know roughly what is going
 * on in each conversation.
 */
class ChatsContent extends React.PureComponent {
  state = {
    subbd: false,
    asurite: null,
    sunnyConvoId: null,
    filter: "",
    displayChatWithSunny: false,
    conversations: [],
    appState: AppState.currentState
  };

  static defaultProps = {
    asurite: "",
    conversations: [],
    nextToken: null,
    limit: null,
    loadMore: () => {},
    createConversation: () => null,
    subscribeToChatUpdates: () => null,
    subscribeToNewDMs: () => null
  };

  componentDidMount() {
    const { getTokens } = this.context;
    getTokens().then(tokens => {
      this.setState({
        asurite: tokens.username
      });
    });
    this.trySub();
    this.shouldDisplayChatbot();
    this.listener = EventRegister.addEventListener("updateConvos", data => {
      this.setState({ conversations: data });
      this.forceUpdate();
    });
    //AppState.addEventListener("change", this._handleAppStateChange);
  }

  // shouldComponentUpdate(nextProps, nextState) {}

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);
    //AppState.removeEventListener("change", this._handleAppStateChange);
  }

  // _handleAppStateChange = nextAppState => {
  //   if (
  //     this.state.appState.match(/inactive|background/) &&
  //     nextAppState === "active"
  //   ) {
  //     console.log("App has come to the foreground!");
  //     //this.forceUpdate();
  //   }
  //   this.setState({ appState: nextAppState });
  // };

  updateMessageState = text => {
    this.setState({ filter: text });
  };

  trySub = () => {
    const { subbd } = this.state;
    const { subscribeToChatUpdates, subscribeToNewDMs } = this.props;
    if (!subbd) {
      this.setState({ subbd: true }, () => {
        subscribeToChatUpdates();
        subscribeToNewDMs();
      });
    }
  };

  /**
   * Function leveraging props to load more rather than maintain state manually.
   *
   * We should apply this in other areas where possible so that less assumptions
   * are made in the presence of AppSync and Apollo
   */
  _loadMore = () => {
    const { loadMore, nextToken } = this.props;
    loadMore({
      variables: {
        nextToken
      },
      updateQuery: (prev, more) => {
        const res = {
          ...prev,
          allUserConversations: {
            ...prev.allUserConversations,
            userConversations: [...prev.allUserConversations.userConversations]
          }
        };

        const userConversations = _.get(
          more,
          "fetchMoreResult.allUserConversations.userConversations"
        );
        const newNextToken = _.get(
          more,
          "fetchMoreResult.allUserConversations.nextToken"
        );

        if (userConversations) {
          userConversations.forEach(function pushNonexistentConvos(convo) {
            const conversations = res.allUserConversations.userConversations;
            const index = conversations.findIndex(
              c => c.convoId === convo.convoId
            );
            if (index === -1) {
              res.allUserConversations.userConversations.push(convo);
            }
          });
        }
        if (newNextToken) {
          res.allUserConversations.nextToken = newNextToken;
        }
        return res;
      }
    });
  };

  setSunnyId = convoId => {
    this.setState({
      sunnyConvoId: convoId
    });
  };

  _onPress = () => {
    const { navigation } = this.props;
    chatRef.current.sendData({
      eventtime: new Date().getTime(),
      "action-type": "click",
      "starting-screen": "chat-manager",
      "starting-section": null,
      target: "new-chat-button",
      "resulting-screen": "new-chat",
      "resulting-section": null
    });
    navigation.navigate("NewChat");
  };

  _renderItem = ({ item }) => {
    const { filter, asurite } = this.state;
    const { navigation } = this.props;
    return (
      <ChatRow
        {...item}
        filter={filter}
        asurite={asurite}
        navigation={navigation}
        setSunnyId={this.setSunnyId.bind(this)}
      />
    );
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
            fontFamily: "Roboto"
          }}
        >
          No chats
        </Text>
      </View>
    );
  };

  shouldDisplayChatbot() {
    const testersInstance = Testers.getInstance();
    const testers = testersInstance.getTesters();
    for (let i = 0; i < testers.length; i++) {
      if (testers[i].asurite === this.props.asurite && testers[i].isActive) {
        this.setState({ displayChatWithSunny: true });
      }
    }
  }

  render() {
    const { asurite, conversations, navigation } = this.props;
    const { filter, sunnyConvoId } = this.state;
    const displayConversations =
      this.state.conversations.length > 0
        ? this.state.conversations
        : conversations;
    if (asurite) {
      return (
        <SettingsContext.Consumer>
          {settings => (
            <View
              style={{
                flex: 1
              }}
            >
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  fontSize: 16,
                  paddingVertical: 20,
                  paddingHorizontal: 10,
                  backgroundColor: "white"
                }}
                value={filter}
                placeholder="Filter Conversations"
                onChangeText={this.updateMessageState}
              />
              {settings.chatSettings.chatDeactivated ? (
                <TouchableOpacity
                  onPress={() => {
                    chatRef.current.sendData({
                      eventtime: new Date().getTime(),
                      "action-type": "click",
                      "starting-screen": "chat-manager",
                      "starting-section": "chat-disabled",
                      target: "go-to-settings",
                      "resulting-screen": "profile-settings",
                      "resulting-section": null
                    });
                    navigation.navigate("ProfileSettings", {
                      previousScreen: "chat",
                      previousSection: "status-bar",
                      target: "Settings"
                    });
                  }}
                  style={{
                    backgroundColor: "#990032",
                    paddingVertical: 20,
                    paddingHorizontal: 10,
                    fontSize: 16,
                    textAlign: "center"
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      textAlignVertical: "center",
                      textAlign: "center"
                    }}
                  >
                    Chat is disabled. Go to settings to enable.
                  </Text>
                </TouchableOpacity>
              ) : null}
              <View
                style={{
                  flex: 1,
                  padding: responsiveWidth(4),
                  margin: responsiveWidth(3),
                  backgroundColor: "white"
                }}
              >
                <Analytics ref={chatRef} />
                <ChatInvites asurite={asurite} navigation={navigation} />
                <FlatList
                  data={displayConversations}
                  // data={this.props.conversations}
                  renderItem={this._renderItem}
                  keyExtractor={item => item.convoId}
                  ListEmptyComponent={this.showEmptyListView()}
                  onEndReached={() => {
                    this._loadMore();
                  }}
                  onEndReachedThreshold={0.3}
                />
              </View>
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: responsiveWidth(100),
                  justifyContent: "flex-end",
                  flexDirection: "row",
                  right:
                    DeviceInfo.getFontScale() > 1 ? responsiveWidth(10) : 0,
                  padding: 20
                }}
                pointerEvents="box-none"
              >
                {this.state.displayChatWithSunny ? (
                  <ChatWithSunny
                    navigation={navigation}
                    sunnyConvoId={sunnyConvoId}
                    chatref={this.chatRef}
                  />
                ) : null}

                {!settings.chatSettings.chatDeactivated ? (
                  <CreateChatButton onPress={this._onPress} />
                ) : null}
              </View>
            </View>
          )}
        </SettingsContext.Consumer>
      );
    } else {
      return (
        <View>
          <Analytics ref={chatRef} />
        </View>
      );
    }
  }
}

/**
 * Example implementation of a button that could be used to create
 * a chat.
 */
class CreateChatButton extends PureComponent {
  static defaultProps = {
    onPress: () => null
  };

  render() {
    const { onPress } = this.props;
    return (
      <TouchableOpacity
        onPress={() => {
          onPress();
        }}
      >
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
          <Icon
            name="commenting"
            size={responsiveFontSize(2.5)}
            color="white"
          />
        </View>
      </TouchableOpacity>
    );
  }
}

class ChatWithSunny extends PureComponent {
  static defaultProps = {
    onPress: () => null
  };

  chatWithSunny = () => {
    const { navigation, sunnyConvoId } = this.props;
    chatRef.current.sendData({
      eventtime: new Date().getTime(),
      "action-type": "click",
      "starting-screen": "chat-manager",
      "starting-section": null,
      target: "chat-with-chatbot",
      "resulting-screen": "conversation",
      "resulting-section": null
    });
    navigation.navigate("Chat", {
      convoId: sunnyConvoId,
      recipient: "ASU-sunnybot",
      sunnyConvo: true,
      title: "Sunny",
      previousScreen: "chat-manager",
      previousSection: "chat-with-chatbot-button",
      target: "chat-with-chatbot"
    });
  };

  render() {
    const { navigation, sunnyConvoId } = this.props;
    const button = (
      <View
        style={{
          backgroundColor: "#00000000",
          height: responsiveWidth(14),
          width: responsiveWidth(14),
          borderRadius: responsiveHeight(6),
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Image
          style={styles.image}
          source={require("../assets/sunny/sunnysmile.png")}
          resizeMode="contain"
        />
      </View>
    );

    if (sunnyConvoId) {
      return (
        <TouchableOpacity
          onPress={() => {
            this.chatWithSunny();
          }}
        >
          {button}
        </TouchableOpacity>
      );
    } else {
      return (
        <View>
          <DirectMessage
            btnType="sunny"
            navigation={navigation}
            asurite="ASU-sunnybot"
            customButton={button}
            title="Sunny"
          />
        </View>
      );
    }
  }
}

ChatsContent.contextTypes = {
  getTokens: PropTypes.func
};

const Chats = AppSyncComponent(
  ChatsContent,
  getMyConversationsQuery,
  createConversationMutation
);

const styles = StyleSheet.create({
  image: {
    height: responsiveWidth(14),
    width: responsiveWidth(14),
    marginRight: responsiveWidth(2),
    alignItems: "center"
  }
});

export default Chats;
