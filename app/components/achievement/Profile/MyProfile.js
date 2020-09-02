import React from "react";
import { View, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { Profile } from "./Profile";
import { getFriendList, getFriendListCount } from "../../../Queries/Friends";
import {
  getLikedEvents,
  getEventActivities,
  getAcademicCheckins,
  getLikedEventsCount,
  getEventActivitiesCount,
  getAcademicCheckinsCount,
  getUserInformation
} from "../../../Queries";
import { getProfileBlocks } from "./gql/Queries.js";
import { CheckinsBlockX } from "../Checkins/CheckinsBlock";
import { FriendsBlock } from "../Friends/FriendsBlock";
import { LikesBlockX } from "../Likes/LikesBlock";
import { AppInteractionBlock } from "./blocks/AppInteractionBlock";
import { LinkBlock } from "./blocks/LinkBlock";
import { BioBlockX } from "./blocks/BioBlockX";
import { SettingsContext } from "../Settings/Settings";
// import { BioBlock } from "./BioBlock";
import Analytics from "../../functional/analytics";
import { InfoSection } from "./Profile";
let CheckinsBlock = AppSyncComponent(
  CheckinsBlockX,
  getEventActivities,
  getAcademicCheckins
);
let LikesBlock = AppSyncComponent(LikesBlockX, getLikedEvents);
let BioBlock = AppSyncComponent(
  BioBlockX,
  getUserInformation,
  getProfileBlocks
);
let FriendsBlockWithData = AppSyncComponent(FriendsBlock, getFriendList);
let InfoSectionWithData = AppSyncComponent(
  InfoSection,
  getLikedEventsCount,
  getEventActivitiesCount,
  getAcademicCheckinsCount,
  getFriendListCount
);
let AppInteractionBlockWithData = AppSyncComponent(
  AppInteractionBlock,
  getLikedEventsCount,
  getEventActivitiesCount,
  getAcademicCheckinsCount,
  getFriendListCount
);
let ProfileWithData = AppSyncComponent(
  Profile,
  getUserInformation,
  getProfileBlocks
);
/**
 * Wrapper component for Profile so that we can pipe the correct
 * profile data into the props of the Profile component
 */
export class MyProfile extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      image: "",
      name: ""
    };
  }
  // static defaultProps = {
  //   asurite: "kcoblent"
  // };
  componentDidMount() {
    this.context
      .getTokens()
      .then(tokens => {
        if (tokens.username && tokens.username !== "guest") {
          this.setState({
            username: tokens.username
          });
        }
      })
      .catch(e => {
        console.log(e);
      });
  }
  render() {
    let { navigate } = this.props.navigation;
    let rightNav = (
      <View
        style={{ flexDirection: "row", flex: 1, justifyContent: "flex-end" }}
      >
        <TouchableOpacity
          onPress={() => navigate("ProfileSettings",{
            previousScreen: this.props.previousScreen,
            previousSection: this.props.previousSection,
            target: "Settings",
          })}
          style={{ flex: 0 }}
          accessibilityLabel={"Profile Settings"}
          accessibilityRole="button"
        >
          <FontAwesome name="cog" size={25} color="#464646" />
        </TouchableOpacity>
      </View>
    );
    // <SettingsContext.Consumer>
    //   {settings => (
    //     <View style={{ flex: 1 }}>
    //       <ChatAS
    //         navigation={this.props.navigation}
    //         convoId={this.state.convoId}
    //         limit={75}
    //         asurite={settings.user}
    //       />
    //     </View>
    //   )}
    // </SettingsContext.Consumer>
    // <Analytics ref="analytics" />
    return (
      <SettingsContext.Consumer>
        {settings => (
          <View style={{ flex: 1 }}>
            <ProfileWithData
              navigation={this.props.navigation}
              asurite={this.state.username}
              roles={settings.roles}
              viewPage="my-profile"
              self
              show_friends
              // name={this.state.name}
              // image={this.state.image}
              // workingTitle={this.state.workingTitle}
              // student={this.state.student}
              // campus={this.state.campus}
              // degree={this.state.degree}
              // department={this.state.department}
              InfoSection={InfoSection}
              LikesBlock={LikesBlock}
              LinkBlock={LinkBlock}
              BioBlock={BioBlock}
              AppInteractionBlock={AppInteractionBlockWithData}
              CheckinsBlock={CheckinsBlock}
              FriendsBlock={FriendsBlockWithData}
              previousScreen={this.props.previousScreen}
              previousSection={this.props.previousSection}
            />
          </View>
        )}
      </SettingsContext.Consumer>
    );
  }
}
MyProfile.contextTypes = {
  getTokens: PropTypes.func
};
