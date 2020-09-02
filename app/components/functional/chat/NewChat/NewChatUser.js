import React, { PureComponent } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet
} from "react-native";
import {
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome";
import { EventRegister } from "react-native-event-listeners";
import { isUserApprovedForChat } from "../utility";
import NewChatUserOptions from "./NewChatUserOptions";

const placeholder = require("../../../achievement/assets/placeholder.png");

export default class NewChatUser extends PureComponent {
  state = {
    show: false
  };

  static defaultProps = {
    invokerAsurite: null,
    friendStatus: false,
    user: {},
    selected_user: null,
    select_user: () => null
  };

  checkIfUserApprovedForChat(user) {
    const { select_user } = this.props;
    isUserApprovedForChat(user.asuriteId).then(result => {
      if (result) {
        select_user(user);
        EventRegister.emit("displayDM", true);
      } else {
        EventRegister.emit("displayDM", false);
        select_user(null);
      }
    });
  }

  render() {
    const {
      user,
      selected_user,
      select_user,
      friendStatus,
      navigation,
      invokerAsurite
    } = this.props;

    const { show } = this.state;

    return (
      <View
        style={{
          backgroundColor: "white"
        }}
      >
        <TouchableOpacity
          onPress={() => {
            this.checkIfUserApprovedForChat(user);
          }}
          onLongPress={() => {
            this.setState({
              show: !show
            });
          }}
        >
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
                <Image style={styles.image} source={{ uri: user.photoUrl }} />
                {selected_user && selected_user.asuriteId === user.asuriteId ? (
                  <View
                    style={[
                      styles.image,
                      {
                        position: "absolute",
                        backgroundColor: "#4A90E2",
                        alignItems: "center",
                        justifyContent: "center"
                      }
                    ]}
                  >
                    <Icon
                      name="check"
                      color="white"
                      size={responsiveFontSize(3)}
                    />
                  </View>
                ) : null}
              </ImageBackground>
            </View>
            <View>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.8)
                }}
              >
                {user.displayName}
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.5)
                }}
              >
                {user.asuriteId ? <Text>{user.asuriteId}@asu.edu</Text> : null}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {user && user.asuriteId ? (
          <NewChatUserOptions
            navigation={navigation}
            show={show}
            asurite={user.asuriteId}
            invokerAsurite={invokerAsurite}
            isearch={user}
          />
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    height: responsiveWidth(13),
    borderRadius: responsiveWidth(6.5),
    width: responsiveWidth(13),
    alignItems: "center"
  }
});
