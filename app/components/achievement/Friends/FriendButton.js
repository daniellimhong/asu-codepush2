import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { DefaultText as Text } from "../../presentational/DefaultText.js";
import Icon from "react-native-vector-icons/FontAwesome";
import Icon5 from "react-native-vector-icons/FontAwesome5";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import {
  sendFriendRequest,
  removeFriend,
  cancelFriendRequest,
  verifyRequestSent,
  verifyFriendStatus
} from "../../../Queries/Friends";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { Images } from "../Images";
import { SettingsContext } from "../Settings/Settings";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

/**
 * Button to be placed allowing users to send friend requests
 * to other users, given an asurite.
 */
class FriendButtonContentX extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      friends: false,
      request: false,
      newRequest: false,
      load: false
    };
    this.addPress = this.addPress.bind(this);
    this.sendReq = this.sendReq.bind(this);
  }

  static defaultProps = {
    asurite: null,
    verifyFriends: false,
    verifyRequestSent: false,
    ownerStudentStatus: true,
    checkFriendStatus: () => null,
    checkRequestStatus: () => null,
    sendFriendRequest: () => null,
    cancelFriendRequest: () => null,
    repaint: () => null,
    mini: false,
    student_status: false,
    displayName: null,
    photoUrl: "",
    settings: {}
  };

  render() {
    let friend = this.props.verifyFriends;
    let request = this.props.verifyRequestSent;
    let buttons = null;
    /**
     * If the user is not a student remove the friend button altogether
     */
    if (this.props.asurite !== "jjdoe" && (!this.props.student_status && this.props.ownerStudentStatus || !this.props.ownerStudentStatus )) {
      return null;
    }

    if (this.state.load) {
      return (
        <TouchableOpacity
          onPress={() => {
            this.props.press();
          }}
        >
          <View
            style={{
              marginTop: responsiveHeight(1),
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              height: responsiveHeight(5),
              width: responsiveWidth(10),
              borderWidth: 1,
              borderColor: "white",
              backgroundColor: "transparent",
              borderRadius: responsiveWidth(5)
            }}
          >
            <ActivityIndicator size={"small"} animating={true} color="maroon" />
          </View>
        </TouchableOpacity>
      );
    }

    if (friend) {
      buttons = (
        <CurrentFriendButton
          navigation={this.props.navigation}
          asurite={this.props.asurite}
          image={this.props.photoUrl}
          name={this.props.displayName}
          mini={this.props.mini}
        />
      );
    } else if (!friend && request) {
      buttons = (
        <RequestedFriendButton
          asurite={this.props.asurite}
          mini={this.props.mini}
        />
      );
    } else {
      buttons = (
        <AddFriendButton
          mini={this.props.mini}
          press={this.addPress}
          asurite={this.props.asurite}
          repaint={this.props.repaint}
        />
      );
    }

    return <View>{__DEV__ || this.props.student_status ? buttons : null}</View>;
  }

  setLoadToFalse = () => {
    this.setState({ load: false });
  };

  addPress() {
    let { photoUrl, displayName, asurite } = this.props;

    let modalProps = {
      displayName: displayName,
      asurite: asurite,
      photoUrl: photoUrl,
      sendReq: this.sendReq,
      setLoadToFalse: this.setLoadToFalse
    };

    this.setState({
      load: true
    });

    this.context.setModalContent(AddFriendModal, modalProps);
    this.context.setModalVisible(true);
  }

  sendReq(permissions) {
    this.props
      .sendFriendRequest({
        asurite: this.props.asurite,
        permissions: permissions
      })
      .then(resp => {
        if (!resp.data.error) {
          this.setState({
            newRequest: true,
            load: false
          });
          this.context.SetToast("Friend Request Sent");
          this.props.repaint();
        } else {
          this.setState({
            newRequest: false,
            load: false
          });
          this.context.SetToast("User has not installed the app");
        }
      })
      .catch(e => {
        console.log("error", e);
        this.setState({
          newRequest: false,
          load: false
        });
        this.context.SetToast("User has not installed the app.");
      });
  }
}

FriendButtonContentX.contextTypes = {
  SetToast: PropTypes.func,
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func
};

class AddFriendModal extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    asurite: null,
    displayName: null,
    photoUrl: "",
    sendReq: () => null
  };

  render() {
    let addText = "Would you like to add this user as a friend?";

    if (this.props.displayName) {
      addText =
        "Would you like to request to add " +
        this.props.displayName +
        " as a friend?";
    }

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Image
          style={[styles.image, { padding: responsiveWidth(5) }]}
          source={{ uri: this.props.photoUrl }}
        />
        <Text
          style={{
            fontSize: responsiveFontSize(2.2),
            marginVertical: responsiveHeight(10),
            padding: responsiveWidth(5),
            paddingHorizontal: responsiveWidth(10),
            textAlign: "center"
          }}
        >
          {addText}
        </Text>

        <View
          style={{
            flexDirection: "row"
          }}
        >
          <TouchableOpacity
            onPress={() => {
              this.context.setModalVisible(false);
              this.props.setLoadToFalse();
            }}
            style={[
              styles.modalButton,
              { borderRightWidth: 1, borderRightColor: "rgba(0,0,0,0.3)" }
            ]}
          >
            <View>
              <Text
                style={{
                  fontSize: responsiveFontSize(2.5),
                  fontWeight: "bold",
                  fontFamily: "Roboto"
                }}
              >
                Cancel
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              let modalProps = {
                displayName: this.props.displayName,
                asurite: this.props.asurite,
                sendReq: this.props.sendReq
              };
              this.context.setModalContent(
                AddFriendPermissionsModal,
                modalProps
              );
            }}
            style={styles.modalButton}
          >
            <View>
              <Text
                style={{
                  fontSize: responsiveFontSize(2.5),
                  fontWeight: "bold",
                  fontFamily: "Roboto"
                }}
              >
                Add Friend
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

AddFriendModal.contextTypes = {
  SetToast: PropTypes.func,
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func
};

class CancelRequestModalX extends React.PureComponent {
  static defaultProps = {
    cancelFriendRequest: () => null,
    asurite: null
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(3),
            textAlign: "center"
          }}
        >
          Would you like to cancel this friend request?
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginVertical: responsiveHeight(5)
          }}
        >
          <TouchableOpacity
            onPress={() => {
              this.props.cancelFriendRequest(this.props.asurite);
              this.context.setModalVisible(false);
            }}
          >
            <Text style={styles.cancelRequestButtons}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.context.setModalVisible(false);
            }}
          >
            <Text style={styles.cancelRequestButtons}>No</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

CancelRequestModalX.contextTypes = {
  SetToast: PropTypes.func,
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func,
  setModalHeight: PropTypes.func
};

let CancelRequestModal = AppSyncComponent(
  CancelRequestModalX,
  cancelFriendRequest
);

class AddFriendPermissionsModalX extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      social: true,
      academic: true
    };
  }
  static defaultProps = {
    sendFriendRequest: () => null, // Maybe unnecessary since we are using the parent
    sendReq: () => null,
    displayName: null,
    asurite: null
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextState.social !== this.state.social ||
      nextState.academic !== this.state.academicsocial
    ) {
      return true;
    }

    if (
      nextProps.sendFriendRequest !== this.props.sendFriendRequest ||
      nextProps.asurite !== this.props.asurite ||
      nextProps.displayName !== this.props.displayName
    ) {
      return true;
    }
    return false;
  }

  render() {
    let firstName = this.props.displayName ? this.props.displayName : "";
    if (firstName && typeof firstName == "string") {
      firstName = firstName.split(" ")[0];
    }

    let academicStatusBG = styles.shareOnBG;
    let academicStatusFG = styles.shareOnFG;
    if (!this.state.academic) {
      academicStatusBG = styles.shareOffBG;
      academicStatusFG = styles.shareOffFG;
    }

    let socialStatusBG = styles.shareOnBG;
    let socialStatusFG = styles.shareOnFG;
    if (!this.state.social) {
      socialStatusBG = styles.shareOffBG;
      socialStatusFG = styles.shareOffFG;
    }

    return (
      <View
        style={{
          paddingVertical: responsiveWidth(10),
          paddingHorizontal: responsiveWidth(10),
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(2.3),
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Roboto"
          }}
        >
          Choose what you would like to share with {firstName}
        </Text>
        <Text
          style={{
            fontSize: responsiveFontSize(2.1),
            marginVertical: responsiveHeight(5),
            textAlign: "center"
          }}
        >
          If you share academic activity your friends can view your class
          check-ins.
        </Text>

        <View style={styles.shareRow}>
          <TouchableOpacity
            onPress={() => {
              this.setState({
                academic: !this.state.academic
              });
            }}
          >
            <View style={[styles.shareButton, academicStatusBG]}>
              <Icon
                name="check"
                size={responsiveFontSize(3)}
                style={[academicStatusFG, { backgroundColor: "rgba(0,0,0,0)" }]}
              />
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: responsiveFontSize(2.5) }}>
            SHARE ACADEMICS
          </Text>
        </View>

        <Text
          style={{
            fontSize: responsiveFontSize(2.1),
            marginVertical: responsiveHeight(5),
            textAlign: "center"
          }}
        >
          If you share Event activity your friends will see things like event
          check-ins and likes
        </Text>

        <View style={[styles.shareRow, { marginBottom: responsiveHeight(5) }]}>
          <TouchableOpacity
            onPress={() => {
              this.setState({
                social: !this.state.social
              });
            }}
          >
            <View style={[styles.shareButton, socialStatusBG]}>
              <Icon
                name="check"
                size={responsiveFontSize(3)}
                style={[socialStatusFG, { backgroundColor: "rgba(0,0,0,0)" }]}
              />
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: responsiveFontSize(2.5) }}>
            SHARE SOCIAL
          </Text>
        </View>
        {/* Bottom Buttons */}
        <View
          style={{
            flexDirection: "row"
          }}
        >
          <TouchableOpacity
            onPress={() => {
              this.props.sendReq({
                academic: this.state.academic,
                social: this.state.social
              });
              this.context.setModalVisible(false);
            }}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: responsiveWidth(5)
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: responsiveFontSize(2.3),
                  fontWeight: "bold",
                  fontFamily: "Roboto"
                }}
              >
                Choose Later
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.props.sendReq({
                academic: this.state.academic,
                social: this.state.social
              });
              this.context.setModalVisible(false);
            }}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: responsiveWidth(5)
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: responsiveFontSize(2.3),
                  fontWeight: "bold",
                  fontFamily: "Roboto"
                }}
              >
                Confirm
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

AddFriendPermissionsModalX.contextTypes = {
  SetToast: PropTypes.func,
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func
};

let AddFriendPermissionsModal = AppSyncComponent(
  AddFriendPermissionsModalX,
  sendFriendRequest
);

class RemoveFriendModalX extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    removeFriend: () => null,
    image: "",
    name: "",
    asurite: null,
    navigation: null
  };

  render() {
    let displayName = "this user";
    if (this.props.name && this.props.name !== "") {
      displayName = this.props.name;
    }

    let displayText =
      "If you change your mind, you'll have to request to follow " +
      displayName +
      " again";
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <View
          style={{
            paddingVertical: responsiveHeight(8),
            padding: responsiveHeight(8)
          }}
        >
          <Images
            source={[
              { uri: this.props.image },
              require("../assets/placeholder.png")
            ]}
          />
        </View>
        <Text
          style={{
            textAlign: "center",
            fontSize: responsiveFontSize(2.3),
            paddingHorizontal: responsiveWidth(5),
            marginBottom: responsiveHeight(1)
          }}
        >
          {displayText}
        </Text>
        <View
          style={{
            // paddingVertical:responsiveHeight(),
            flexDirection: "row",
            marginTop: responsiveHeight(5),
            justifyContent: "center",
            alignItems: "center",
            borderTopWidth: 1,
            borderTopColor: "rgba(0,0,0,0.2)",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(0,0,0,0.2)"
          }}
        >
          <TouchableOpacity
            onPress={() => {
              this.context.setModalVisible(false);
            }}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              height: responsiveHeight(10),
              borderRightWidth: 1,
              borderRightColor: "rgba(0,0,0,0.2)"
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2.3),
                fontWeight: "bold",
                fontFamily: "Roboto"
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.props.removeFriend(this.props.asurite);
              this.context.setModalVisible(false);
              this.context.SetToast("Friend Removed");
              this.props.navigation.goBack();
            }}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              height: responsiveHeight(10)
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2.3),
                fontWeight: "bold",
                fontFamily: "Roboto"
              }}
            >
              Unfollow
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

RemoveFriendModalX.contextTypes = {
  SetToast: PropTypes.func,
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func
};

let RemoveFriendModal = AppSyncComponent(RemoveFriendModalX, removeFriend);

/**
 * Render if the user is not a friend and has not received a friend request
 */
class AddFriendButton extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    press: () => null,
    mini: false
  };

  render() {
    if (!this.props.mini) {
      return (
        <TouchableOpacity
          onPress={() => {
            this.props.press();
          }}
        >
          <Analytics ref="analytics" />
          <View
            style={{
              paddingTop: 10,
              paddingBottom: 10,
              alignItems: "center",
              justifyContent: "center"  }}
            accessible={true}>

            <MaterialIcons
              name="add-circle-outline"
              size={responsiveFontSize(2.4)}
              style={{ backgroundColor: "transparent", borderColor: "black"}}
            />

            <Text style={[styles.blockInfo,{color: "black"}]}>ADD FRIEND</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          onPress={() => {
            this.refs.analytics.sendData({
              "action-type": "view",
              "target": "Add Friend",
              "starting-screen": this.props.previousScreen?this.props.previousScreen:null,
              "starting-section": this.props.previousSection?this.props.previousSection:null,
              "resulting-screen": this.props.previousScreen?this.props.previousScreen:null, 
              "resulting-section": "add-friend",
              "target-id":this.props.asurite.toString(),
              "action-metadata":{
                "target-id":this.props.asurite.toString(),
              }
            });
            tracker.trackEvent("Click", "FriendButton_AddFriend");
            this.props.press();
          }}
          accessibilityLabel="Add friend"
          accessibilityRole="button"
        >
          <Analytics ref="analytics" />
          <View
            style={{
              height: responsiveWidth(10),
              width: responsiveWidth(10),
              borderRadius: responsiveWidth(5),
              borderColor: "#B1B1B1",
              borderWidth: 3,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Icon
              name={"plus"}
              size={responsiveFontSize(2.6)}
              color="#B1B1B1"
              style={{ backgroundColor: "transparent" }}
            />
          </View>
        </TouchableOpacity>
      );
    }
  }
}

/**
 * Render if the user is already a friend
 */
class CurrentFriendButton extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    onPress: () => null,
    mini: false,
    name: null,
    image: "",
    asurite: null
  };

  render() {
    if (!this.props.mini) {
      return (
        <TouchableOpacity
          onPress={() => {
            let porpous = {
              image: this.props.image,
              name: this.props.name,
              asurite: this.props.asurite,
              navigation: this.props.navigation
            };
            this.context.setModalContent(RemoveFriendModal, porpous);
            this.context.setModalHeight(responsiveHeight(50));
            this.context.setModalVisible(true);
          }}
        >

        <View
          style={{
            paddingTop: 12,
            paddingBottom: 12,
            backgroundColor: "#379acb",
            alignItems: "center",
            justifyContent: "center"  }}
          accessible={true}>

          <Icon
            name="check-circle"
            size={responsiveFontSize(2.4)}
            color="white"
            style={{ backgroundColor: "transparent"}}
          />
          <Text style={[styles.blockInfo]}>FRIENDS</Text>
        </View>


        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity>
          <View
            style={{
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              height: responsiveWidth(10),
              width: responsiveWidth(10),
              borderWidth: 1,
              borderColor: "white",
              backgroundColor: "#D40546",
              borderRadius: responsiveWidth(5)
            }}
          >
            <Icon
              name={"check"}
              size={22}
              color="white"
              style={{ backgroundColor: "transparent" }}
            />
          </View>
        </TouchableOpacity>
      );
    }
  }
}

// <View
//   style={{
//     alignSelf: "center",
//     justifyContent: "center",
//     alignItems: "center",
//     height: responsiveHeight(5),
//     width: responsiveWidth(33),
//     borderWidth: 1,
//     borderColor: "white",
//     backgroundColor: "#D40546",
//     borderRadius: responsiveWidth(5)
//   }}
// >
//   <Text
//     style={{
//       color: "white",
//       fontSize: responsiveFontSize(1.8),
//       fontWeight: "bold",
    // fontFamily: "Roboto"
//     }}
//   >
//     FRIENDS
//   </Text>
// </View>

CurrentFriendButton.contextTypes = {
  SetToast: PropTypes.func,
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func,
  setModalHeight: PropTypes.func
};

/**
 * Render if the user is not already a friend, and a request has already
 * been sent.
 */
class RequestedFriendButton extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    onPress: () => null,
    cancelFriendRequest: () => null,
    asurite: null,
    mini: false
  };

  render() {
    if (!this.props.mini) {
      return (
        <TouchableOpacity
          onPress={() => {
            let modalProps = {
              asurite: this.props.asurite
            };
            this.context.setModalContent(CancelRequestModal, modalProps);
            this.context.setModalVisible(true);
            this.context.setModalHeight(responsiveHeight(60));
          }}
        >

          <View
            style={{
              paddingTop: 10,
              paddingBottom: 10,
              backgroundColor: "gray",
              alignItems: "center",
              justifyContent: "center"  }}
            accessible={true}>

            <Icon
              name="clock-o"
              size={responsiveFontSize(2.4)}
              color="white"
              style={{ backgroundColor: "transparent"}}
            />
            <Text style={[styles.blockInfo]}>PENDING</Text>
          </View>

        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          onPress={() => {
            let modalProps = {
              asurite: this.props.asurite
            };
            this.context.setModalContent(CancelRequestModal, modalProps);
            this.context.setModalVisible(true);
            this.context.setModalHeight(responsiveHeight(60));
          }}
        >
          <View
            style={{
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              height: responsiveHeight(5),
              paddingHorizontal: responsiveWidth(5),
              backgroundColor: "grey",
              borderRadius: responsiveWidth(5)
            }}
          >
            <Text
              style={{
                backgroundColor: "transparent",
                color: "white",
                fontSize: responsiveFontSize(1.6),
                fontWeight: "bold",
                fontFamily: "Roboto"
              }}
            >
              PENDING
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  }
}

RequestedFriendButton.contextTypes = {
  SetToast: PropTypes.func,
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func,
  setModalHeight: PropTypes.func
};

const styles = StyleSheet.create({
  accept: {
    backgroundColor: "#8C1B35"
  },
  acceptText: {
    color: "white"
  },
  cancelRequestButtons: {
    marginHorizontal: responsiveWidth(10),
    fontWeight: "bold",
    fontSize: responsiveFontSize(3),
    fontFamily: "Roboto"
  },
  ignore: {
    borderWidth: 1,
    borderColor: "#696969",
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    alignItems: "center",
    justifyContent: "center"
  },
  button: {
    width: responsiveWidth(18),
    height: responsiveHeight(5),
    marginLeft: responsiveWidth(1),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: responsiveWidth(2)
  },
  blockInfo: {
    color: "white",
    textAlign: "center",
    fontSize: responsiveFontSize(1.6)
  },
  bolded: {
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  image: {
    height: responsiveWidth(24),
    borderRadius: responsiveWidth(12),
    width: responsiveWidth(24),
    alignItems: "center",
    marginTop: 5
  },
  modalButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(0,0,0,0.3)",
    borderBottomColor: "rgba(0,0,0,0.3)",
    padding: responsiveWidth(5)
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  shareButton: {
    height: responsiveWidth(10),
    width: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    alignItems: "center",
    justifyContent: "center",
    marginRight: responsiveWidth(5)
  },
  shareOnBG: {
    backgroundColor: "#FFB332"
  },
  shareOnFG: {
    color: "white"
  },
  shareOffBG: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#696969"
  },
  shareOffFG: {
    color: "white"
  }
});

const FriendButtonContent = AppSyncComponent(
  FriendButtonContentX,
  sendFriendRequest,
  verifyRequestSent,
  verifyFriendStatus
);

export class FriendButton extends React.PureComponent {
  render() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <FriendButtonContent {...this.props} settings={settings} />
        )}
      </SettingsContext.Consumer>
    );
  }
}
