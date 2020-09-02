import React, { PureComponent } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth
} from "react-native-responsive-dimensions";

export default class ChatOptions extends PureComponent {
  static defaultProps = {
    selected: [],
    show: false,
    showDeleteModal: () => null,
    cancelSelection: () => null,
    copySelectedMessages: () => null
  };

  render() {
    const {
      show,
      selected,
      showDeleteModal,
      copySelectedMessages,
      cancelSelection
    } = this.props;
    if (show) {
      return (
        <View
          style={{
            borderBottomColor: "#b2b2b2",
            backgroundColor: "#fff",
            borderBottomWidth: 1
          }}
        >
          <View
            style={{
              flexDirection: "row",
              padding: responsiveHeight(1.8)
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2),
                fontWeight: "bold",
                flex: 1,
                fontFamily: "Roboto"
              }}
            >
              {selected.length}
            </Text>
            <TouchableOpacity
              onPress={() => {
                showDeleteModal();
              }}
            >
              <FontAwesome
                style={{
                  paddingHorizontal: responsiveHeight(2)
                }}
                name="trash"
                size={25}
                color="#464646"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                copySelectedMessages();
              }}
            >
              <FontAwesome
                style={{
                  paddingHorizontal: responsiveHeight(2)
                }}
                name="clone"
                size={25}
                color="#464646"
              />
            </TouchableOpacity>
            {/* <FontAwesome
              style={{
                paddingHorizontal: responsiveHeight(2)
              }}
              name="share"
              size={25}
              color="#464646"
            /> */}
            <TouchableOpacity
              onPress={() => {
                cancelSelection();
              }}
            >
              <FontAwesome
                style={{
                  paddingLeft: responsiveHeight(1)
                }}
                name="times"
                size={25}
                color="#464646"
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return null;
    }
  }
}

export class ChatOptionDelete extends PureComponent {
  static defaultProps = {
    show: false,
    asurite: "",
    admin_status: false,
    messages: [],
    ignoreMessage: () => null,
    hideMessageForAll: () => null
  };

  render() {
    const {
      show,
      messages,
      asurite,
      hideMessageForAll,
      ignoreMessage
    } = this.props;
    if (show) {
      return (
        <View
          style={{
            position: "absolute",
            height: responsiveHeight(100),
            width: responsiveWidth(100),
            alignItems: "center",
            zIndex: 1000,
            backgroundColor: "rgba(0,0,0,0.4)",
            paddingTop: responsiveHeight(25)
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              width: responsiveWidth(90),
              height: responsiveWidth(30),
              padding: responsiveWidth(6)
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(1.9),
                fontWeight: "bold",
                fontFamily: "Roboto"
              }}
            >
              Delete
              {""}
              {messages && messages.length ? ` ${messages.length}` : ""} Message
              {messages && messages.length > 1 ? "s" : ""}?
            </Text>
            <View style={{ flexDirection: "row", flex: 1 }}>
              {ownsAllMessages(messages, asurite) ? (
                <TouchableOpacity
                  style={{
                    flex: 1.5,
                    color: "#D20946",
                    alignItems: "flex-start",
                    justifyContent: "flex-end"
                  }}
                  onPress={() => {
                    hideMessageForAll();
                  }}
                >
                  <Text
                    style={{
                      color: "#D20946",
                      fontWeight: "bold",
                      fontFamily: "Roboto"
                    }}
                  >
                    DELETE FOR EVERYBODY
                  </Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: "flex-end",
                  justifyContent: "flex-end"
                }}
                onPress={() => {
                  ignoreMessage();
                }}
              >
                <Text
                  style={{
                    color: "#D20946",
                    fontWeight: "bold",
                    fontFamily: "Roboto"
                  }}
                >
                  DELETE FOR ME
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    } else {
      return null;
    }
  }
}

function ownsAllMessages(messages, asurite) {
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].sender !== asurite) {
      return false;
    }
  }
  return true;
}
