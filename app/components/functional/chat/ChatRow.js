import React, { PureComponent } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  AsyncStorage,
  ImageBackground,
  AppState
} from "react-native";
import _ from "lodash";
import {
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import {
  getConversationUsersQuery,
  getConversationMessagesQuery
} from "./gql/Queries";
import { getUserInformation, iSearchHandler } from "../../../Queries";
import { AppSyncComponent } from "../authentication/auth_components/appsync/AppSyncApp";
import { determineTimeFormat, showRow } from "./utility";
import ChatRowOptions from "./ChatRowOptions";
import Analytics from "./../analytics";

const placeholder = require("../../achievement/assets/placeholder.png");

class ChatRowX extends PureComponent {
  state = {
    storedTitle: null
  };

  static defaultProps = {
    asurite: null,
    convoId: null,
    filter: "",
    users: [],
    setSunnyId: () => {}
  };

  componentDidUpdate() {
    const { storedTitle } = this.state;
    const { convoId, users, setSunnyId } = this.props;
    if (!storedTitle) {
      if (convoId) {
        AsyncStorage.getItem(convoId)
          .then(title => {
            if (title) {
              this.setState({
                storedTitle: title
              });
            }
          })
          .catch(e => {
            console.log(e);
          });
      }
    }

    if (users && users.length > 0 && users.indexOf("ASU-sunnybot") > -1) {
      setSunnyId(convoId);
    }
  }

  render() {
    // console.log("within chat row render");
    const {
      name,
      convoId,
      lastSeen,
      latest,
      navigation,
      users,
      asurite,
      filter
    } = this.props;
    const { storedTitle } = this.state;

    let notify = false;
    notify = lastSeen < latest;
    const filteredUsers = users.filter(user => user !== asurite);

    // Get the main user for rendering
    let mainUser = "";
    if (filteredUsers.length) {
      [mainUser] = filteredUsers;
    }

    // Get any existent title for rendering
    let title = "";
    if (name) {
      title = name;
    } else if (storedTitle) {
      title = storedTitle;
    }

    return (
      <ChatRowGroup
        authAsurite={asurite}
        asurite={mainUser}
        navigation={navigation}
        titleText={title}
        convoId={convoId}
        notify={notify}
        latest={latest}
        lastSeen={lastSeen}
        filter={filter}
      />
    );
  }
}

/**
 * Call for and render chat information with one other user.
 * Type is always dm
 */
class ChatRowGroupX extends PureComponent {
  state = {
    isearch: {},
    show: false,
    subbd: false,
    appState: AppState.currentState
  };

  static defaultProps = {
    asurite: "",
    authAsurite: "",
    convoId: null,
    notify: false,
    user_info: {},
    lastSeen: null,
    titleText: null,
    filter: "",
    messages: [],
    subscribeToSingleChatUpdates: () => null,
    subscribeToMessages: () => null
  };

  componentDidMount() {
    this.updateIsearchValues();
    this.trySub();
    AppState.addEventListener("change", this._handleAppStateChange);
  }

  componentDidUpdate() {
    this.updateIsearchValues();
    this.trySub();
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  getLatestTimestamp() {
    const { messages } = this.props;
    let displayMessage;
    for (let i = 0; i < messages.length; i++) {
      if (!messages[i].obscure) {
        displayMessage = messages[i];
        break;
      }
    }
    if (displayMessage) {
      return displayMessage.createdAt;
    } else {
      return null;
    }
  }

  _handleAppStateChange = nextAppState => {
    const { subscribeToMessages, subscribeToSingleChatUpdates } = this.props;
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("App has come to the foreground!");
      subscribeToMessages();
      subscribeToSingleChatUpdates();
    }
    this.setState({ appState: nextAppState });
  };

  trySub = () => {
    const {
      subscribeToSingleChatUpdates,
      subscribeToMessages,
      authAsurite
    } = this.props;
    const { subbd } = this.state;
    if (!subbd && authAsurite) {
      this.setState({ subbd: true }, () => {
        subscribeToSingleChatUpdates();
        subscribeToMessages();
      });
    }
  };

  updateIsearchValues() {
    const { asurite, user_info } = this.props;
    const { isearch } = this.state;
    const newIsearch = iSearchHandler(asurite, user_info);
    if (!_.isEqual(isearch, newIsearch)) {
      this.setState({ isearch: newIsearch });
    }
  }

  displaySingleMessage() {
    const { messages, authAsurite, lastSeen, convoId } = this.props;
    let latest = this.props;
    let displayMessage;
    for (let i = 0; i < messages.length; i++) {
      if (!messages[i].obscure) {
        displayMessage = messages[i];
        break;
      }
    }
    if (displayMessage) {
      latest = displayMessage.createdAt;
    }
    const notify = latest > lastSeen;
    let previewStyle = styles.singleMessage;
    if (notify && displayMessage && displayMessage.sender !== authAsurite) {
      previewStyle = styles.boldSingleMessage;
    }
    if (messages && messages.length) {
      return (
        <View
          style={{
            paddingHorizontal: 7
          }}
        >
          <Text
            style={[
              previewStyle,
              {
                fontSize: responsiveFontSize(1.7)
              }
            ]}
            numberOfLines={1}
          >
            {displayMessage.content}
          </Text>
        </View>
      );
    } else {
      return null;
    }
  }

  render() {
    const {
      filter,
      convoId,
      navigation,
      asurite,
      authAsurite,
      titleText,
      latest
    } = this.props;
    const { isearch, show } = this.state;

    const showName =
      isearch && isearch.displayName ? isearch.displayName : asurite;
    let title = "";
    if (titleText) {
      title = titleText;
    } else if (showName) {
      title = showName;
    }

    if (showRow(title, filter, asurite)) {
      return (
        <View
          style={{
            backgroundColor: "white"
          }}
        >
          <Analytics ref="analytics" />
          <TouchableOpacity
            onPress={() => {
              this.refs.analytics.sendData({
                eventtime: new Date().getTime(),
                "action-type": "click",
                "starting-screen": "chat-manager",
                "starting-section": "null",
                target: "open-conversation",
                "resulting-screen": "conversation",
                "resulting-section": null,
                "action-metadata": {
                  asurite: asurite,
                  "conversation-id": convoId
                }
              });
              if (navigation) {
                navigation.navigate("Chat", {
                  convoId,
                  recipient: asurite,
                  title,
                  previousScreen: "chat-manager",
                  previousSection: null,
                  target: "open-conversation"
                });
              }
            }}
            onLongPress={() => {
              this.setState({
                show: !show
              });
            }}
          >
            <View
              style={{
                paddingVertical: 10,
                borderBottomColor: "#ccc",
                borderBottomWidth: 1
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start"
                }}
              >
                <View style={{ width: responsiveWidth(15) }}>
                  <ImageBackground
                    style={styles.image}
                    imageStyle={styles.image}
                    source={placeholder}
                  >
                    <Image
                      style={styles.image}
                      source={{ uri: isearch.photoUrl }}
                    />
                  </ImageBackground>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    width: responsiveWidth(70)
                  }}
                >
                  <View
                    style={{
                      flex: 1
                    }}
                  >
                    <Text style={styles.name}>{title || asurite}</Text>
                    {this.displaySingleMessage()}
                  </View>
                  <View
                    style={{
                      flex: 0.3,
                      alignItems: "flex-end"
                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsiveFontSize(1)
                      }}
                    >
                      {this.getLatestTimestamp()
                        ? determineTimeFormat(this.getLatestTimestamp())
                        : null}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <ChatRowOptions
            navigation={navigation}
            asurite={authAsurite}
            convoId={convoId}
            show={show}
          />
        </View>
      );
    } else {
      return null;
    }
  }
}

const ChatRowGroup = AppSyncComponent(
  ChatRowGroupX,
  getUserInformation,
  getConversationMessagesQuery
);

const styles = StyleSheet.create({
  boldSingleMessage: {
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  singleMessage: {
    fontWeight: "normal",
    fontFamily: "Roboto",
    color: "#4c4c4c"
  },
  image: {
    height: responsiveWidth(14),
    borderRadius: responsiveWidth(7),
    width: responsiveWidth(14),
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0)"
  },
  name: {
    fontSize: responsiveFontSize(1.8),
    // flex: 1,
    marginLeft: responsiveWidth(2)
  }
});

const ChatRow = AppSyncComponent(ChatRowX, getConversationUsersQuery);

export default ChatRow;
