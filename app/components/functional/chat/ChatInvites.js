import React, { PureComponent, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ImageBackground,
  TouchableOpacity,
  Animated,
  StyleSheet
} from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";
import PropTypes from "prop-types";
import _ from "lodash";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  acceptConversationInviteMutation,
  ignoreConversationInviteMutation
} from "./gql/Mutations";
import { getMyConversationInvitesQuery } from "./gql/Queries";
import { getUserInformation, iSearchHandler } from "../../../Queries";
import { AppSyncComponent } from "../authentication/auth_components/appsync/AppSyncApp";
import Analytics from "./../analytics";

const placeholder = require("../../achievement/assets/placeholder.png");

class ChatInvitesContentX extends PureComponent {
  state = {
    heightAnim: new Animated.Value(0),
    rowHeight: responsiveHeight(15),
    subbd: false
  };

  static defaultProps = {
    nextToken: null,
    limit: null,
    invites: [],
    loadMore: () => null,
    acceptConversationInvite: () => null,
    ignoreConversationInvite: () => null,
    subscribeToInvites: () => null,
    subscribeDMToInvites: () => null
  };

  componentDidMount() {
    this.trySub();
  }

  trySub = () => {
    const { subbd } = this.state;
    const { subscribeToInvites, subscribeDMToInvites } = this.props;

    if (!subbd) {
      this.setState({ subbd: true }, () => {
        subscribeToInvites();
        subscribeDMToInvites();
      });
    }
  };

  _loadMore = () => {
    const { loadMore, nextToken } = this.props;
    loadMore({
      variables: {
        nextToken
      },
      updateQuery: (prev, more) => {
        const res = {
          ...prev,
          getConversationInvites: {
            ...prev.getConversationInvites,
            conversationInvites: [
              ...prev.getConversationInvites.conversationInvites
            ]
          }
        };

        const conversationInvites = _.get(
          more,
          "fetchMoreResult.getConversationInvites.conversationInvites"
        );
        const newNextToken = _.get(
          more,
          "fetchMoreResult.getConversationInvites.nextToken"
        );

        if (conversationInvites) {
          conversationInvites.forEach(inv => {
            const invites = res.getConversationInvites.conversationInvites;
            const index = invites.findIndex(c => c.convoId === inv.convoId);
            if (index === -1) {
              res.getConversationInvites.conversationInvites.push(inv);
            }
          });
        }
        if (newNextToken) {
          res.getConversationInvites.nextToken = newNextToken;
        }
        return res;
      }
    });
  };

  _measureRow = event => {
    const { rowHeight } = this.state;
    if (rowHeight === responsiveHeight(15)) {
      this.setState({
        rowHeight: event.nativeEvent.layout.height
      });
    }
  };

  _renderItem = ({ item }) => {
    const { acceptConversationInvite, ignoreConversationInvite } = this.props;
    return (
      <View onLayout={event => this._measureRow(event)}>
        <InviteRow
          {...item}
          asurite={item.sender}
          onPress={acceptConversationInvite}
          ignore={ignoreConversationInvite}
        />
      </View>
    );
  };

  toggle = () => {
    const { heightAnim, rowHeight } = this.state;
    const { invites } = this.props;
    if (heightAnim._value > 0) {
      Animated.timing(
        // Animate over time
        heightAnim, // The animated value to drive
        {
          toValue: 0,
          duration: 300
        }
      ).start();
    } else {
      Animated.timing(
        // Animate over time
        heightAnim, // The animated value to drive
        {
          toValue: invites && invites.length > 1 ? rowHeight * 2 : rowHeight,
          duration: 300
        }
      ).start();
    }
  };

  render() {
    const { heightAnim } = this.state;
    const { invites } = this.props;
    if (invites && invites.length) {
      return (
        <View
          style={{
            backgroundColor: "white",
            borderBottomColor: "#e8e8e8",
            borderBottomWidth: 1
          }}
        >
          <View
            style={{
              paddingBottom: responsiveWidth(3),
              paddingHorizontal: responsiveWidth(4)
            }}
          >
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center"
              }}
              onPress={() => {
                this.toggle();
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#a50023",
                    fontSize: responsiveFontSize(1.8)
                  }}
                >
                  You have pending invites
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: "flex-end"
                }}
              >
                <Icon name="chevron-down" color="#777" size={15} />
              </View>
            </TouchableOpacity>
          </View>
          <Animated.View
            style={{
              height: heightAnim
            }}
          >
            <FlatList
              data={invites}
              renderItem={this._renderItem}
              keyExtractor={item => item.convoId}
            />
          </Animated.View>
        </View>
      );
    } else {
      return null;
    }
  }
}

const ChatInvitesContent = AppSyncComponent(
  ChatInvitesContentX,
  acceptConversationInviteMutation,
  getMyConversationInvitesQuery,
  ignoreConversationInviteMutation
);

/**
 * Single invite row
 * @param {*} props
 */
function InviteRowContent(props) {
  const { asurite, user_info, convoId, onPress, ignore } = props;
  const [isearch, setIsearch] = useState({});
  let chatRef = React.createRef();

  useEffect(() => {
    const newIsearch = iSearchHandler(asurite, user_info);
    if (!isearch || isearch.asuriteId !== newIsearch.asuriteId) {
      setIsearch(newIsearch);
    }
  }, [asurite]);

  return (
    <View
      style={{
        borderBottomColor: "#e8e8e8",
        borderBottomWidth: 1,
        paddingBottom: 15
      }}
    >
      <Analytics ref={chatRef} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: responsiveWidth(3)
        }}
      >
        <View
          style={{
            marginRight: responsiveWidth(2)
          }}
        >
          <ImageBackground
            style={styles.image}
            imageStyle={styles.image}
            source={placeholder}
          >
            <Image style={styles.image} source={{ uri: isearch.photoUrl }} />
          </ImageBackground>
        </View>
        <View>
          <Text
            style={{
              fontSize: responsiveFontSize(1.7)
              // fontWeight: "bold",
              // fontFamily: "Roboto"
            }}
          >
            {isearch.displayName ? isearch.displayName : asurite}
          </Text>
          <Text
            style={{
              fontSize: responsiveFontSize(1.5),
              color: "#777"
            }}
          >
            Pending Chat Request
          </Text>
        </View>
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <TouchableOpacity
          onPress={() => {
            chatRef.current.sendData({
              "eventtime": new Date().getTime(),
              "action-type": "click",
              "starting-screen": "chat-manager",
              "starting-section": null,
              "target": "accept-invite",
              "resulting-screen": "chat-manager", 
              "resulting-section": null,
              "action-metadata":{
                "conversation-id":convoId,
                "asurite":asurite
              }
            });
            onPress(convoId);
          }}
          style={{
            // flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 5,
            paddingHorizontal: 40,
            marginHorizontal: 5,
            backgroundColor: "#870000",
            borderColor: "#870000",
            borderRadius: 50,
            borderWidth: 1
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(1.7),
              color: "white"
            }}
          >
            ACCEPT
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            chatRef.current.sendData({
              "eventtime": new Date().getTime(),
              "action-type": "click",
              "starting-screen": "chat-manager",
              "starting-section": null,
              "target": "ignore-invite",
              "resulting-screen": "chat-manager", 
              "resulting-section": null,
              "action-metadata":{
                "conversation-id":convoId,
                "asurite":asurite
              }
            });
            ignore(convoId);
          }}
          style={{
            // flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 5,
            paddingHorizontal: 40,
            backgroundColor: "white",
            borderColor: "#870000",
            borderRadius: 50,
            borderWidth: 1
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(1.7),
              color: "#870000"
            }}
          >
            IGNORE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const InviteRow = AppSyncComponent(InviteRowContent, getUserInformation);

export default class ChatInvites extends PureComponent {
  static defaultProps = {
    asurite: null
  };

  render() {
    const { asurite } = this.props;
    if (asurite) {
      return <ChatInvitesContent asurite={asurite} />;
    } else {
      return null;
    }
  }
}

ChatInvites.contextTypes = {
  getTokens: PropTypes.func
};

const styles = StyleSheet.create({
  image: {
    height: responsiveWidth(13),
    borderRadius: responsiveWidth(6.5),
    width: responsiveWidth(13),
    alignItems: "center"
  }
});
