import React from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { Profile } from "./Profile";
import PropTypes from "prop-types";
import { AppInteractionBlock } from "./blocks/AppInteractionBlock";
import { LinkBlock } from "./blocks/LinkBlock";
import { BioBlockX } from "./blocks/BioBlockX";
import { getProfileBlocks } from "./gql/Queries.js";
import { SettingsContext } from "../Settings/Settings";
let BioBlock = AppSyncComponent(
  BioBlockX,
  getUserInformation,
  getProfileBlocks
);
import {
  removeFriend,
  updatePermissions,
  getFriendPermissions
} from "../../../Queries/Friends";
import {
  getFriendLikes,
  getSocialCheckinActivities,
  getSocialCheckinActivitiesCount,
  getAcademicCheckinActivities,
  getFriendAcademicCheckinActivitiesCount,
  getFriendLikesCount,
  getUserInformation,
  iSearchHandler,
  verifyFriendStatus,
  verifyRequestSent
} from "../../../Queries";
import { CheckinsBlockX } from "../Checkins/CheckinsBlock";
import { LikesBlockX } from "../Likes/LikesBlock";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { InfoSection } from "./Profile";
let LikesBlock = AppSyncComponent(LikesBlockX, getFriendLikes);
let CheckinsBlock = AppSyncComponent(
  CheckinsBlockX,
  getSocialCheckinActivities,
  getAcademicCheckinActivities
);
let ProfileWithData = AppSyncComponent(
  Profile,
  getUserInformation,
  verifyFriendStatus,
  verifyRequestSent,
  getProfileBlocks
);
let InfoSectionWithData = AppSyncComponent(
  InfoSection,
  getSocialCheckinActivitiesCount,
  getFriendAcademicCheckinActivitiesCount,
  getFriendLikesCount
);
let AppInteractionBlockWithData = AppSyncComponent(
  AppInteractionBlock,
  getSocialCheckinActivitiesCount,
  getFriendAcademicCheckinActivitiesCount,
  getFriendLikesCount
);
/**
 * The navigation path to get to some user's profile page
 */
export class UserProfile extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      name: "User",
      permissions: {},
      repaint: () => null
    };
  }
  componentDidMount() {
    if (this.props.navigation.state.params) {
      let { data } = this.props.navigation.state.params;
      fetch(
        "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/user-details?asurite=" +
          data.asuriteId
      ).then(resp => resp.json())
       .then(data => {
          try {
            this.setState({
              roles: data.roleList
            });
          } catch (e) {
            console.log("failed!!!!!", e);
          }
      });
      // this.setState({
      //   username: data.asurite,
      //   permissions: data.permissions,
      //   name: data.name,
      //   repaint: data.repaint
      // })
    }
  }
  render() {
    let { data } = this.props.navigation.state.params;
    // console.log("this is the data passed down ", data);
    return (
      <SettingsContext.Consumer>
        {settings => (
          <View style={{ flex: 1 }}>
            <ProfileWithData
              InfoSection={InfoSection}
              navigation={this.props.navigation}
              CheckinsBlock={CheckinsBlock}
              LikesBlock={LikesBlock}
              LinkBlock={LinkBlock}
              BioBlock={BioBlock}
              AppInteractionBlock={AppInteractionBlockWithData}
              repaint={data.repaint}
              InsertSection={FriendPermissions}
              asurite={data.asuriteId}
              permissions={data.permissions}
              name={data.displayName}
              image={data.photoUrl}
              friendStatus={data.friendStatus}
              requestStatus={data.requestStatus}
              phone={data.phone}
              student={data.student}
              affiliations={data.affiliations}
              roles={this.state.roles}
              viewPage="user-profile"
              previousScreen={this.props.previousScreen}
              previousSection={this.props.previousSection}
            />
          </View>
        )}
      </SettingsContext.Consumer>
    );
  }
}
/**
 * The friend permission section of a profile page. We inject it here
 */
class FriendPermissionsX extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      permissions: {}
    };
  }
  static defaultProps = {
    asurite: null,
    permissions: {},
    updatePermissions: () => null
  };
  componentDidUpdate(prevProps) {
    if (prevProps.permissions !== this.props.permissions) {
      this.setState({
        permissions: this.props.permissions
      });
    }
  }
  componentDidMount() {
    this.setState({
      permissions: this.props.permissions
    });
  }
  render() {
    let isearch = iSearchHandler(this.props.asurite, this.props.user_info);
    // console.log("ISEARCH", isearch);
    let width = responsiveWidth(100);
    let { permissions } = this.state;
    let academicBorder;
    let academicBackground;
    var eventsBorder;
    var eventsBackground;
    if (permissions && permissions.academic === false) {
      academicBorder = "white";
      academicBackground = "#3b3b3b";
    } else {
      academicBorder = "white";
      academicBackground = "white";
    }
    if (permissions && permissions.social === false) {
      eventsBorder = "white";
      eventsBackground = "#3b3b3b";
    } else {
      eventsBorder = "white";
      eventsBackground = "white";
    }
    return (
      <View
        style={{
          backgroundColor: "#3b3b3b"
        }}
      >
        <Analytics ref="analytics" />
        <View>
          <Text
            style={{
              color: "white",
              fontSize: responsiveFontSize(2.8),
              fontWeight: "bold",
              paddingTop: responsiveWidth(3.4),
              paddingHorizontal: responsiveWidth(5),
              fontFamily: "Roboto"
            }}
          >
            Share:
          </Text>
        </View>
        {/* SETTINGS */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: responsiveWidth(2),
            paddingBottom: responsiveWidth(3.4)
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              this.refs.analytics.sendData({
                "action-type": "click",
                "starting-screen": "profile",
                "starting-section": "user-profile", 
                "target": "Toggle Academics",
                "resulting-screen": "profile", 
                "resulting-section": "user-profile",
                "target-id": this.props.asurite,
                "action-metadata":{
                  "target-id":this.props.asurite,
                }
              });
              tracker.trackEvent("Click", "UserPermissions_ToggleAcademic");
              this.toggleAcaShare();
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <View
                style={[
                  styles.toggle,
                  {
                    borderWidth: 2,
                    borderColor: academicBorder,
                    backgroundColor: academicBackground
                  }
                ]}
              >
                <FontAwesome name="check" size={16} color="#3b3b3b" />
              </View>
              <Text style={[styles.settingsTxt]}>My Academics</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => {
              this.refs.analytics.sendData({
                "action-type": "click",
                "starting-screen": "profile",
                "starting-section": "user-profile", 
                "target": "Toggle Social",
                "resulting-screen": "profile", 
                "resulting-section": "user-profile",
                "target-id": this.props.asurite,
                "action-metadata":{
                  "target-id":this.props.asurite,
                }
              });
              tracker.trackEvent("Click", "UserPermissions_ToggleSocial");
              this.toggleEventShare();
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <View
                style={[
                  styles.toggle,
                  {
                    borderWidth: 2,
                    borderColor: eventsBorder,
                    backgroundColor: eventsBackground
                  }
                ]}
              >
                <FontAwesome name="check" size={16} color="#3b3b3b" />
              </View>
              <Text style={[styles.settingsTxt]}>My Events</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
  toggleEventShare = () => {
    let newPerms = { ...this.state.permissions };
    if (
      newPerms.social === undefined ||
      newPerms.social === null ||
      newPerms.social === true
    ) {
      newPerms.social = false;
    } else {
      newPerms.social = true;
    }
    this.setState({
      permissions: newPerms
    });
    this.props.updatePermissions({
      asurite: this.props.asurite,
      permissions: newPerms
    });
  };
  toggleAcaShare = () => {
    let newPerms = { ...this.state.permissions };
    if (
      newPerms.academic === undefined ||
      newPerms.academic === null ||
      newPerms.academic === true
    ) {
      newPerms.academic = false;
    } else {
      newPerms.academic = true;
    }
    this.setState({
      permissions: newPerms
    });
    this.props.updatePermissions({
      asurite: this.props.asurite,
      permissions: newPerms
    });
  };
}
/**
 * Section of user profile for friend removal.
 */
class RemoveFriendX extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      removeMessage: ["Remove Friend", "Click to Remove", ""],
      removeCount: 0
    };
  }
  static defaultProps = {
    removeFriend: () => null
  };
  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.refs.analytics.sendData({
            "action-type": "click",
            "starting-screen": "profile",
            "starting-section": "user-profile", 
            "target": "Remove Friend",
            "resulting-screen": "profile", 
            "resulting-section": "user-profile",
            "target-id": this.props.asurite,
            "action-metadata":{
              "target-id": this.props.asurite,
              "remove-count":this.state.removeCount
            }
          });
          tracker.trackEvent("Click", `RemoveFriend-${this.state.removeCount}`);
          this.doRemove();
        }}
      >
        <Analytics ref="analytics" />
        <View
          style={{
            height: responsiveHeight(10),
            borderBottomColor: "grey",
            borderBottomWidth: 1,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row"
          }}
        >
          <View>
            <FontAwesome
              name="remove"
              size={responsiveFontSize(3.5)}
              color="#c4466c"
            />
          </View>
          <View style={{ marginLeft: responsiveWidth(2) }}>
            <Text
              style={{ fontSize: responsiveFontSize(2.5), color: "#c4466c" }}
            >
              {this.state.removeMessage[this.state.removeCount]}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  doRemove() {
    if (this.state.removeCount < 1) {
      this.setState({
        removeCount: ++this.state.removeCount
      });
    } else {
      this.props
        .removeFriend(this.props.asurite)
        .then(resp => {
          this.context.SetToast("Friend Removed");
          this.props.navigation.goBack();
        })
        .catch(e => {
          this.context.SetToast("Unable to remove friend");
          this.props.navigation.goBack();
        });
    }
  }
}
RemoveFriendX.contextTypes = {
  SetToast: PropTypes.func
};
const RemoveFriend = AppSyncComponent(RemoveFriendX, removeFriend);
const FriendPermissions = AppSyncComponent(
  FriendPermissionsX,
  updatePermissions,
  getFriendPermissions
);
const styles = StyleSheet.create({
  seeAllBarMain: {
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    flexDirection: "row",
    height: responsiveHeight(10),
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: "#626262"
  },
  seeAllBarTextLeft: {
    fontSize: responsiveFontSize(2.0),
    paddingLeft: 20,
    color: "black"
  },
  toggle: {
    width: responsiveWidth(5),
    height: responsiveWidth(5),
    borderRadius: responsiveWidth(2.5),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: responsiveWidth(2)
  },
  settingsTxt: {
    color: "white",
    fontSize: responsiveFontSize(2.4)
  }
});
