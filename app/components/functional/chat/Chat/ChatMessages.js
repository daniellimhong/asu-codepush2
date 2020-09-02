import React, { PureComponent } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  AppState
} from "react-native";
import moment from "moment";
import PropTypes from "prop-types";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Modal from "react-native-modal";
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";
import _ from "lodash";
import { EventRegister } from "react-native-event-listeners";
import { groupMessages, makeAutoId } from "../utility";
import { AppSyncComponent } from "../../authentication/auth_components/appsync/AppSyncApp";
import {
  getConversationMessagesQuery,
  CONVERSATIONS_QUERY
} from "../gql/Queries";
import { Api } from "../../../../services/api";
import { client } from "../../../../app";
import { setManagedConvo } from "../gql/utility";

var { height, width } = Dimensions.get("window");

class ChatMessagesX extends PureComponent {
  state = {
    subbd: false,
    appState: "active"
  };

  static defaultProps = {
    asurite: "",
    recipient: null,
    messages: [],
    nextToken: null,
    limit: null,
    loadMore: () => null,
    selectMessage: () => null,
    deselectMessage: () => null,
    subscribeToMessages: () => null,
    createMessage: () => null,
    subscribeToDeletedMessages: () => null
  };

  componentDidMount() {
    this.trySub();
    setTimeout(() => {
      this.softUpdateLastSeen();
    }, 300);
  }

  componentDidUpdate(prevProps) {
    const { messages } = this.props;
    this.trySub();
    if (
      messages &&
      prevProps.messages &&
      prevProps.messages.length < messages.length
    ) {
      this.softUpdateLastSeen();
    }
  }

  softUpdateLastSeen = () => {
    if (AppState.currentState === "active") {
      const { messages, convoId, getTokens } = this.props;
      const timestamp = new Date().getTime();
      if (
        !this.lastSeen ||
        (messages[0] && this.lastSeen < messages[0].createdAt)
      ) {
        this.lastSeen = timestamp;
        getTokens()
          .then((tokens) => {
            const apiService = new Api(
              "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod",
              tokens
            );

            const payload = {
              convoId,
              timestamp
            };
            if (payload.convoId) {
              apiService
                .post("/chat", payload)
                .then((response) => {})
                .catch((e) => {
                  console.log("Bad lastSeen update: ", e);
                });
            }
          })
          .catch((e) => {
            console.log(e);
          });
      }

      try {
        const data = client.readQuery({
          query: CONVERSATIONS_QUERY,
          variables: {
            limit: null,
            nextToken: null
          }
        });
        let convos = data.allUserConversations.userConversations;
        for (let i = 0; i < convos.length; i++) {
          if (convos[i].convoId === convoId) {
            convos[i].lastSeen = timestamp;
            break;
          }
        }
        convos = _.sortBy(convos, ["latest"]).reverse();
        EventRegister.emit("updateConvos", convos);
        client.writeQuery({
          query: CONVERSATIONS_QUERY,
          variables: {
            limit: null,
            nextToken: null
          },
          data: {
            allUserConversations: {
              userConversations: convos,
              nextToken: null,
              __typename: "UserConverstationsConnection"
            }
          }
        });
      } catch (e) {
        console.log("SENDING");
      }
    }
  };

  // _renderItem = ({ item }) => {
  _renderItem = (item, index, messages) => {
    const { sunnyConvo } = this.props;
    if (item.file) {
      try {
        item.file = JSON.parse(item.file);
      } catch (e) {}
    }

    return (
      <Message
        group={groupMessages(messages, index)}
        msgInd={index}
        {...this.props}
        message={item}
        isLastMsg={index === 0}
        sunnyConvo={sunnyConvo}
      />
    );
  };

  /**
   * Load additional chat messages
   */
  _loadMore = () => {
    const { loadMore, limit, convoId, nextToken } = this.props;
    loadMore({
      variables: {
        nextToken,
        limit,
        convoId
      },
      updateQuery: (prev, more) => {
        const res = {
          ...prev,
          allConversationMessages: {
            ...prev.allConversationMessages,
            messages: [...prev.allConversationMessages.messages]
          }
        };

        const messages = _.get(
          more,
          "fetchMoreResult.allConversationMessages.messages"
        );
        const newNextToken = _.get(
          more,
          "fetchMoreResult.allConversationMessages.nextToken"
        );

        if (messages) {
          messages.forEach((message) => {
            const prevMessages = res.allConversationMessages.messages;
            const index = prevMessages.findIndex(
              (m) => m.messageId === message.messageId
            );
            if (index === -1) {
              res.allConversationMessages.messages.push(message);
            }
          });
        }
        if (newNextToken) {
          res.allConversationMessages.nextToken = newNextToken;
        }
        return res;
      }
    });
  };

  showEmptyListView = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            color: "#b3b3b3",
            fontFamily: "Roboto"
          }}
        >
          No messages here
        </Text>
      </View>
    );
  };

  trySub() {
    const { subbd } = this.state;
    const {
      convoId,
      subscribeToMessages,
      subscribeToDeletedMessages
    } = this.props;
    if (convoId && !subbd) {
      this.setState({ subbd: true }, () => {
        subscribeToMessages();
        subscribeToDeletedMessages();
      });
    }
  }

  render() {
    let { messages } = this.props;
    const { sunnyConvo, convoId } = this.props;
    let viewMessages = JSON.parse(JSON.stringify(messages));
    viewMessages = _.uniqBy(viewMessages, "messageId");
    viewMessages = _.orderBy(viewMessages, ["createdAt"], ["desc"]);

    const messagesToRender = messages;

    setManagedConvo(messagesToRender, convoId, true);

    return (
      <FlatList
        inverted={!!messages.length}
        data={messagesToRender}
        renderItem={({ item, index }) =>
          this._renderItem(item, index, messagesToRender)
        }
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            this._loadMore();
          }
        }}
        scrollEventThrottle={400}
        style={{
          paddingHorizontal: 10,
          paddingBottom: 10
        }}
        contentContainerStyle={{
          paddingBottom: 10
        }}
        keyExtractor={(item) => item.messageId}
        ListEmptyComponent={this.showEmptyListView()}
        ListHeaderComponent={() => {
          return messages && messages.length && sunnyConvo === false ? (
            <Text
              style={{
                marginBottom: 5,
                textAlign: "center",
                color: "#848484",
                backgroundColor: "#fff"
              }}
            >
              Tap and hold on a message for more options
            </Text>
          ) : null;
        }}
      />
    );
  }
}

class Message extends PureComponent {
  state = {
    imgH: responsiveHeight(1),
    imgW: responsiveHeight(1),
    fullSize: [0, 0],
    showLargeImage: false,
    showImage: true
  };

  static defaultProps = {
    message: {},
    msgInd: 10,
    group: false
  };

  render() {
    const {
      message,
      selected,
      group,
      asurite,
      selectMessage,
      deselectMessage,
      sunnyConvo,
      isLastMsg
    } = this.props;

    const time = moment(message.createdAt, "x").format("LT");
    const date = moment(message.createdAt, "x").format("l");
    let highlight = null;
    let chatStyle = styles.theirChat;
    let textStyle = styles.theirChatText;
    let timeStyle = styles.theirChatTime;
    if (asurite === message.sender) {
      chatStyle = styles.myChat;
      textStyle = styles.myChatText;
      timeStyle = styles.myChatTime;
    }
    if (message.sender === "adminmessage") {
      chatStyle = styles.adminChat;
      textStyle = styles.adminChatText;
      timeStyle = styles.adminChatTime;
    }
    if (message.obscure) {
      textStyle = styles.deletedChatText;
    }
    if (message.agentAction === "enter" || message.agentAction === "leave") {
      chatStyle = styles.chatbotBanner;
      textStyle = styles.chatbotBannerText;
    }
    const bgColor = sunnyConvo && asurite === message.sender ? "#01a2e0" : null;

    const index = selected.findIndex(
      (msg) => msg.messageId === message.messageId
    );
    if (index > -1) {
      highlight = true;
    }

    const styleArray = [chatStyle, message.obscure ? styles.deletedChat : ""];

    if (bgColor !== null) {
      styleArray.push({ backgroundColor: bgColor });
    }

    return (
      <View
        style={
          highlight
            ? { backgroundColor: "#rgba(230,230,230,0.8)" }
            : { backgroundColor: "rgba(0,0,0,0)" }
        }
      >
      <TouchableOpacity
        onLongPress={() => {
          if (message.obscure || sunnyConvo) {
            return false;
          }
          if (!highlight) {
            selectMessage(message);
          } else {
            deselectMessage(message);
          }
        }}
      >
        <View
          style={{
            flexDirection: message.sender === "ASU-sunnybot" ? "row" : null
          }}
        >
          <View
            style={
              group
                ? {
                    paddingHorizontal: 5,
                    marginHorizontal: 4
                  }
                : {
                    paddingBottom: 8,
                    paddingHorizontal: 5,
                    marginBottom: 4,
                    marginHorizontal: 4
                  }
            }
          >
            {this.hasImage(message.file, styleArray)}
            <View style={styleArray} pointerEvents="none">
              <Text style={textStyle} selectable>
                {message.obscure
                  ? "This message has been deleted"
                  : message.content}
              </Text>
            </View>
            {this.hasButtons(message.file)}
            {group ? null : (
              <Text style={timeStyle}>{`${date} ${time}`}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
        {sunnyConvo && message.sender !== "ASU-sunnybot" && isLastMsg ? (
          <Image
            style={styles.image}
            source={require("../../assets/sunny/SunnySmall.gif")}
            resizeMode="contain"
          />
        ) : null}
      </View>
    );
  }

  showImage = () => {
    this.setState({
      showLargeImage: true
    });
  };

  closeImage = () => {
    this.setState({
      showLargeImage: false
    });
  };

  hasImage = (f, styleArray) => {
    if (f && f.image) {
      let img = f.image;

      Image.getSize(
        img,
        (imgW, imgH) => {
          let maxWidth = responsiveWidth(50);
          let ratio = maxWidth / imgW;

          let style = {
            height: Math.ceil(imgH * ratio),
            width: Math.ceil(maxWidth)
          };

          this.setState({
            imgH: style.height,
            imgW: style.width,
            fullSize: [imgH, imgW]
          });
        },
        (error) => {
          console.log(`Couldn't get the image size: ${error.message}`);
          this.setState({
            showImage: false
          });
        }
      );

      if (this.state.showImage) {
        return (
          <TouchableOpacity style={styleArray} onPress={() => this.showImage()}>
            <View style={{ justifyContent: "flex-start" }}>
              <Image
                source={{ uri: img }}
                style={{ width: responsiveWidth(50), height: this.state.imgH }}
                resizeMode="cover"
              />
              <ImageModal
                showLargeImage={this.state.showLargeImage}
                closeImage={this.closeImage}
                img={img}
              />
            </View>
          </TouchableOpacity>
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  hasButtons = (f) => {
    if (this.props.isLastMsg && f && f.buttons) {
      try {
        f.buttons = JSON.parse(f.buttons);
      } catch (e) {}

      if (typeof f.buttons === "object") {
        return (
          <View>
            <FlatList
              data={f.buttons}
              renderItem={({ item, index }) => this._renderButton(item, index)}
              keyExtractor={(item) => item.messageId}
            />
          </View>
        );
      } else {
        return null;
      }
    }
    return null;
  };

  _renderButton = (item, index) => {
    return (
      <TouchableOpacity onPress={() => this.clickedBtn(item)}>
        <View style={styles.sunnyButton}>
          <Text style={styles.sunnyBtnText}>{item.match}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  clickedBtn = (e) => {
    let file = {
      buttonResponse: e,
      isCampaign: true
    };

    let content = e.match;

    this.props
      .createMessage(
        {
          convoId: this.props.convoId,
          content: content,
          file: JSON.stringify(file),
          messageId: makeAutoId(),
          obscure: false,
          agentAction: null,
          agentAsurite: null,
          agentName: null
        },
        this.props
      )
      .then((data) => {
        console.log(data);
      });
  };
}

class ImageModal extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  closePressHandler = () => {
    console.log("HITTING");
    this.props.closeImage();
  };

  render() {
    return (
      <Modal
        isVisible={this.props.showLargeImage}
        transparent={true}
        animationInTiming={1000}
        animationOutTiming={1000}
        backdropTransitionInTiming={1000}
        backdropTransitionOutTiming={1000}
      >
        <View style={{ flex: 1, justifyContent: "center", marginTop: 20 }}>
          <TouchableOpacity onPress={this.closePressHandler}>
            <View style={{ marginBottom: 5 }}>
              <FontAwesome
                style={{ alignSelf: "flex-end", right: responsiveWidth(3) }}
                name="times"
                size={25}
                color="white"
              />
            </View>
          </TouchableOpacity>
          <View style={{ flex: 10 }}>
            <Image
              source={{ uri: this.props.img }}
              style={{ width: "100%", height: responsiveHeight(50) }}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>
    );
  }
}

const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
  const paddingToTop = responsiveHeight(10);
  return (
    contentSize.height - paddingToTop <=
    contentOffset.y + layoutMeasurement.height
  );
};

const ChatMessagesAS = AppSyncComponent(
  ChatMessagesX,
  getConversationMessagesQuery
);

export default class ChatMessages extends React.PureComponent {
  render() {
    const {
      convoId,
      asurite,
      selectMessage,
      deselectMessage,
      sunnyConvo,
      selected,
      getTokens,
      createMessage
    } = this.props;
    return (
      <ChatMessagesAS
        convoId={convoId}
        asurite={asurite}
        selectMessage={selectMessage}
        deselectMessage={deselectMessage}
        sunnyConvo={sunnyConvo}
        selected={selected}
        createMessage={createMessage}
        getTokens={getTokens}
      />
    );
  }
}

let styles = StyleSheet.create({
  myChat: {
    backgroundColor: "#AF193D",
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: "white",
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 4
  },
  image: {
    height: responsiveWidth(20),
    width: responsiveWidth(20),
    alignItems: "center"
  },
  deletedChat: {
    backgroundColor: "#F2F2F2",
    color: "white",
    borderColor: "white"
  },
  deletedChatText: {
    color: "#b3b3b3",
    fontSize: responsiveFontSize(1.7)
  },
  myChatText: {
    color: "white",
    fontSize: responsiveFontSize(1.7)
  },
  myChatTime: {
    alignSelf: "flex-end",
    color: "#848484",
    fontSize: responsiveFontSize(1.2)
  },
  chatbotBanner: {
    backgroundColor: "#f2f2f2",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
    borderColor: "#a5a5a5",
    borderWidth: 1,
    marginBottom: 4,
    minWidth: "100%",
    textAlign: "center"
  },
  chatbotBannerText: {
    color: "#737373",
    fontSize: responsiveFontSize(1.5),
    textAlign: "center"
  },
  theirChat: {
    backgroundColor: "white",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    borderColor: "#a5a5a5",
    borderWidth: 1,
    marginBottom: 4
  },
  theirChatText: {
    color: "black",
    fontSize: responsiveFontSize(1.7)
  },
  theirChatTime: {
    alignSelf: "flex-start",
    color: "#848484",
    fontSize: responsiveFontSize(1.2)
  },
  adminChat: {
    alignSelf: "center",
    marginBottom: 4
  },
  adminChatText: {
    color: "#848484"
  },
  adminChatTime: {
    alignSelf: "center",
    color: "#848484",
    fontSize: responsiveFontSize(1.2)
  },
  sunnyBtnText: {
    textAlign: "center",
    color: "#4087df",
    textTransform: "capitalize",
    fontWeight: "bold"
  },
  sunnyButton: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 21,
    marginBottom: 4,
    borderColor: "#808080",
    borderWidth: 1,
    alignSelf: "flex-start"
  }
});
