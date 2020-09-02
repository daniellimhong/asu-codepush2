import React, { PureComponent } from "react";
import { View, Text, Animated, TouchableOpacity } from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import DeviceInfo from "react-native-device-info";
import { deactivateConversationMutation } from "./gql/Mutations";
import { AppSyncComponent } from "../authentication/auth_components/appsync/AppSyncApp";
import { SettingsContext } from "../../achievement/Settings/Settings";
import { setManagedConvo } from "./gql/utility";

class ChatRowOptionsContent extends PureComponent {
  openHeight = responsiveHeight(15);

  state = {
    heightAnim: new Animated.Value(0)
  };

  static defaultProps = {
    asurite: "",
    show: false,
    convoId: null,
    deactivateConversationForMe: () => null,
    setToast: () => null
  };

  componentDidUpdate = () => {
    const { show } = this.props;
    if (!show) {
      this.close();
    } else if (show) {
      this.open();
    }
  };

  open = () => {
    const { heightAnim } = this.state;
    Animated.timing(
      // Animate over time
      heightAnim, // The animated value to drive
      {
        toValue: this.openHeight,
        duration: 200
      }
    ).start();
  };

  close = () => {
    const { heightAnim } = this.state;
    Animated.timing(
      // Animate over time
      heightAnim, // The animated value to drive
      {
        toValue: 0,
        duration: 200
      }
    ).start();
  };

  render() {
    const { heightAnim } = this.state;
    const {
      deactivateConversationForMe,
      convoId,
      asurite,
      setToast,
      navigation
    } = this.props;
    return (
      <Animated.View
        style={{
          height: heightAnim,
          overflow: "hidden",
          backgroundColor: "#f2f2f2"
        }}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%"
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Report", { convoId, asurite });
            }}
          >
            <View
              style={{
                alignItems: "center",
                width: responsiveWidth(70),
                paddingHorizontal: responsiveWidth(5),
                paddingVertical: responsiveWidth(2),
                backgroundColor: "#AF183D",
                borderRadius: responsiveWidth(1),
                height:
                  DeviceInfo.getFontScale() > 1.4
                    ? responsiveHeight(5)
                    : responsiveHeight(4)
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize:
                    DeviceInfo.getFontScale() > 1.4
                      ? responsiveFontSize(0.7)
                      : responsiveFontSize(1.2)
                }}
              >
                Report a Concern
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{ padding: 6 }} />
          <TouchableOpacity
            onPress={() => {
              deactivateConversationForMe(convoId, asurite).then(() => {
                setManagedConvo([], convoId, true);
                setToast("Conversation deleted");
              });
            }}
          >
            <View
              style={{
                alignItems: "center",
                width: responsiveWidth(70),
                paddingHorizontal: responsiveWidth(5),
                paddingVertical: responsiveWidth(2),
                backgroundColor: "#AF183D",
                borderRadius: responsiveWidth(1),
                height:
                  DeviceInfo.getFontScale() > 1.4
                    ? responsiveHeight(5)
                    : responsiveHeight(4)
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize:
                    DeviceInfo.getFontScale() > 1.4
                      ? responsiveFontSize(0.7)
                      : responsiveFontSize(1.2)
                }}
              >
                Delete Conversation
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }
}

const ChatRowOptionsAS = AppSyncComponent(
  ChatRowOptionsContent,
  deactivateConversationMutation
);

export default class ChatRowOptions extends PureComponent {
  render() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <ChatRowOptionsAS {...this.props} setToast={settings.SetToast} />
        )}
      </SettingsContext.Consumer>
    );
  }
}
