import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import {
  responsiveHeight,
  responsiveWidth
} from "react-native-responsive-dimensions";
import {
  getUserInformation,
  iSearchHandler,
  verifyRequestSent,
  verifyFriendStatus
} from "../../../Queries";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { ProfileSection } from "../Profile/Profile";
import { Images } from "../Images";
/**
 * Render a list of Friends.
 *
 * Friends list is passed via props.
 */
export class FriendsBlock extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    asurite: "",
    friends_list: [],
    numberToRender: null,
    isearch: () => null,
    showHead: false,
    subscribeToNewFriends: () => null
  };

  componentDidMount() {
    this.props.subscribeToNewFriends();
  }

  render() {
    var data = this.props.friends_list;
    let { navigate } = this.props.navigation;
    data = [...data].splice(0, 15);
    if (data.length) {
      return (
        <View
          style={{
            backgroundColor: "white",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-start"
          }}
        >
          {this.props.showHead ? (
            <ProfileSection
              leftText={this.props.friends_list.length + " FRIENDS"}
              onPress={() => {
                navigate("MyFriends",{
                  previousScreen:"checked-in-friends",
                  previousSection:"header"
                });
              }}
            />
          ) : null}
          {data.map((item, index) => {
            return (
              <FriendPicWithData
                key={"FriendPic" + item.friend + index}
                navigation={this.props.navigation}
                asurite={item.friend}
                permissions={item.permissions}
                arrIndex={index}
              />
            );
          })}
        </View>
      );
    } else {
      return null;
    }
  }
}

/**
 * Render a single clickable friend image
 */
class FriendPicture extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      // image: undefined,
      name: "",
      requestStatus: false,
      friendStatus: false,
      asurite: null
    };
  }

  static defaultProps = {
    isearch: () => null,
    asurite: null,
    friendStatus: false,
    requestStatus: false,
    user_info: {}
  };

  render() {
    let isearch = iSearchHandler(this.props.asurite, this.props.user_info);
    let { navigate } = this.props.navigation;

    return (
      <View
        accessible={true}
        accessibilityLabel={this.props.asurite}
        accessibilityRole="button"
      >
        <TouchableOpacity
          key={"FriendKey" + this.props.asurite}
          onPress={() => {
            if (this.props.asurite !== null) {
              this.refs.analytics.sendData({
                "action-type": "click",
                "target": "firend-list-item",
                "starting-screen": "friends",
                "starting-section": "friend-list-item", 
                "resulting-screen": "profile", 
                "resulting-section": "user-profile",
                "target-id": isearch.asuriteId.toString(),
                "action-metadata": {
                  "target-id": isearch.asuriteId.toString(),
                  "data": isearch.toString()
                },
              });
              tracker.trackEvent("Click", "FriendsBlock_UserProfile");
              navigate("UserProfile", { 
                data: isearch,
                previousScreen: "friends",
                previousSection: "friend-list-item",
              });
            }
          }}
        >
          <Analytics ref="analytics" />
          <View
            style={{
              height: responsiveHeight(10),
              width: responsiveWidth(18),
              margin: responsiveWidth(1),
              alignItems: "center"
            }}
          >
            <Images
              style={styles.image}
              defaultSource={require("../assets/placeholder.png")}
              source={[
                { uri: isearch.photoUrl },
                require("../assets/placeholder.png")
              ]}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

let FriendPicWithData = AppSyncComponent(
  FriendPicture,
  getUserInformation,
  verifyRequestSent,
  verifyFriendStatus
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  image: {
    height: responsiveWidth(16),
    borderRadius: responsiveWidth(8),
    width: responsiveWidth(16),
    alignItems: "center",
    marginTop: 5
  }
});
