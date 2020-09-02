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
import _ from "lodash";
import { EventRegister } from "react-native-event-listeners";
import { isUserApprovedForChat } from "../utility";
import { AppSyncComponent } from "../../authentication/auth_components/appsync/AppSyncApp";
import { getUserInformation, iSearchHandler } from "../../../../Queries";
import NewChatUserOptions from "./NewChatUserOptions";

const placeholder = require("../../../achievement/assets/placeholder.png");

class NewChatFriendContent extends PureComponent {
  state = {
    isearch: {},
    show: false
  };

  static defaultProps = {
    asurite: "",
    invokerAsurite: null,
    user_info: {},
    selected_user: null,
    select_user: () => null
  };

  componentDidMount() {
    this.setIsearch();
  }

  componentDidUpdate() {
    this.setIsearch();
  }

  setIsearch() {
    const { asurite, user_info } = this.props;
    const { isearch } = this.state;
    const newIsearch = iSearchHandler(asurite, user_info);
    if (!_.isEqual(newIsearch, isearch)) {
      this.setState({
        isearch: newIsearch
      });
    }
  }

  checkIfUserApprovedForChat(user) {
    const { isearch } = this.state;
    const { select_user } = this.props;
    isUserApprovedForChat(user).then(result => {
      if (result) {
        EventRegister.emit("displayDM", true);
        select_user(isearch);
      } else {
        EventRegister.emit("displayDM", false);
        select_user(null);
      }
    });
  }

  render() {
    const { asurite, selected_user, navigation, invokerAsurite } = this.props;
    const { isearch, show } = this.state;

    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            this.checkIfUserApprovedForChat(asurite);
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
                <Image
                  style={styles.image}
                  source={{ uri: isearch.photoUrl }}
                />
                {selected_user &&
                selected_user.asuriteId === isearch.asuriteId ? (
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
                {isearch.displayName}
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.5)
                }}
              >
                {isearch.asuriteId ? (
                  <Text>
                    {isearch.asuriteId}
                    @asu.edu
                  </Text>
                ) : null}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {isearch && isearch.asuriteId ? (
          <NewChatUserOptions
            navigation={navigation}
            show={show}
            asurite={isearch.asuriteId}
            invokerAsurite={invokerAsurite}
            isearch={isearch}
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

const NewChatFriend = AppSyncComponent(
  NewChatFriendContent,
  getUserInformation
);

export default NewChatFriend;
