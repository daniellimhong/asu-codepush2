import React from "react";
import {
  View,
  Dimensions,
  ImageBackground,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image
} from "react-native";

import PropTypes from "prop-types";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { FriendButton } from "../Friends/FriendButton";
import { CallFriend } from "../Friends/CallFriend";
import { EmailFriend } from "../Friends/EmailFriend";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { Images } from "../Images";
import { BigImages } from "../BigImages";
import { getUserInformation, iSearchHandler } from "../../../Queries";
import { ErrorWrapper } from "../../functional/error/ErrorWrapper";
import { DirectMessage } from "../../functional/chat/DirectMessage/DirectMessage";
import { isUserApprovedForChat } from "../../functional/chat/utility";
import { ProfileTag } from "../Tags";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import _ from "lodash";
import { ProfilePopup } from "./settings/ProfilePopup";

import { Api, Auth } from "../../../services";

var { height, width } = Dimensions.get("window");

// let getFriendRequestStatus = graphql(VerifyFriendRequestSentQuery, ());
/**
 * Profile component.
 * Accepts data from either the MyProfile or UserProfile navigation paths to render data
 *
 * When this is done it should be props based
 */
export class Profile extends React.PureComponent {
  static navigationOptions = ({ navigation, screenProps }) => ({
    header: () => {
      return null;
    }
  });

  constructor(props) {
    super(props);

    this.state = {
      displayName: null,
      affiliations: [],
      asurite: null,
      photoUrl: "",
      student: false,
      roles: [],
      isearch: {}
    };
  }

  static defaultProps = {
    friends_list: [],
    checkins_list: [],
    likedItems: [],
    academicCheckins: [],
    asurite: null,
    InsertSection: () => null,
    InfoSection: () => null,
    repaint: () => null,
    CheckinsBlock: () => null,
    FriendsBlock: () => null,
    LinkBlock: () => null,
    BioBlock: () => null,
    LikesBlock: () => null,
    AppInteractionBlock: () => null,
    self: false,
    student_status: false,
    user_info: {},
    previousScreen:null,
    previousSection:null
  };

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "view",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null,
      "target": this.props.viewPage?this.props.viewPage:null,
      "resulting-screen": "profile",
      "resulting-section": this.props.viewPage,
      "target-id":this.props.asurite,
      "action-metadata":{
        "target-id":this.props.asurite,
      }
    });
    Auth()
      .getSession()
      .then(tokens => {
        this.setState({
          asurite: tokens.username,
          ownerRoles: tokens.roleList
        });
      });
  }

  componentDidUpdate(prevProps, prevState) {
    let isearch = iSearchHandler(this.props.asurite, this.props.user_info);
    if (!_.isEqual(isearch, this.state.isearch)) {
      this.setState({
        isearch
      });
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //
  //   console.log(nextProps.asurite, this.props.asurite, nextState.asurite, this.state.asurite)
  //
  //   return true;
  // }

  render() {
    // console.log(
    //   "inside render on profile: ",
    //   this.props.asurite,
    //   this.state.asurite
    // );

    let { isearch } = this.state;

    let { navigate } = this.props.navigation;
    let {
      CheckinsBlock,
      LikesBlock,
      InsertSection,
      FriendsBlock,
      LinkBlock,
      BioBlock,
      AppInteractionBlock
    } = this.props;

    var viewingSelf = this.props.asurite === this.state.asurite ? true : false;

    var connToShow = 0;

    if (this.props.profile_blocks.connections) {
      let t = this.props.profile_blocks.connections.details;

      for (var i = 0; i < t.length; ++i) {
        if (t[i].url) {
          connToShow++;
        }
      }
    }

    var randomNum = Math.floor(Math.random() * 100) + 1;

    return (
      <ErrorWrapper>
        <Analytics ref="analytics" />
        <ScrollView style={{ flex: 1 }}>
          <ProfileTop
            navigation={this.props.navigation}
            asurite={this.props.asurite}
            repaint={this.props.repaint}
            self={this.props.self}
            requestStatus={this.props.requestStatus}
            friendStatus={this.props.friendStatus}
            InfoSection={this.props.InfoSection}
            phone={this.props.phone}
            student={this.props.student}
            affiliations={this.props.affiliations}
            roles={this.props.roles}
          />

          {this.props.friendStatus || this.props.verifyFriends ? (
            <InsertSection
              navigation={this.props.navigation}
              asurite={this.props.asurite}
            />
          ) : null}

          <View
            style={{
              backgroundColor: "#ededed",
              minHeight: responsiveHeight(46)
            }}
          >
            {this.props.profile_blocks.biography ? (
              <BioBlock
                details={this.props.profile_blocks.biography.details}
                tryNum={randomNum}
                roles={this.props.roles}
                canAddBio={this.props.profile_blocks.biography.canAddBio}
                viewingSelf={viewingSelf}
                title={this.props.profile_blocks.biography.title}
                asurite={this.props.asurite}
                ownerAsurite={this.state.asurite}
                navigation={this.props.navigation}
              />
            ) : null}

            <AppInteractionBlock
              roles={this.props.roles}
              viewingSelf={viewingSelf}
              id="Profile_AppInteraction"
              asurite={this.props.asurite}
              ownerAsurite={this.state.asurite}
              navigation={this.props.navigation}
              student_status={isearch.student_status}
              like_count={
                this.props.likedItems ? this.props.likedItems.length : 0
              }
              checkin_count_social={
                this.props.checkins_list ? this.props.checkins_list.length : 0
              }
              checkin_count_academic={
                this.props.academicCheckins
                  ? this.props.academicCheckins.length
                  : 0
              }
              friend_count={
                this.props.friends_list ? this.props.friends_list.length : 0
              }
              previousScreen={viewingSelf?"my-profile":"user-profile"}
              previousSection="app-interaction-block"
            />

            {this.props.profile_blocks.connections ? (
              <LinkBlock
                details={this.props.profile_blocks.connections.details}
                roles={this.props.roles}
                viewingSelf={viewingSelf}
                title={this.props.profile_blocks.connections.title}
                id="Profile_Connections"
                actualLastNum={connToShow}
                asurite={this.props.asurite}
                ownerAsurite={this.state.asurite}
                navigation={this.props.navigation}
                previousScreen={viewingSelf?"my-profile":"user-profile"}
                previousSection="connections"
              />
            ) : null}

            {this.props.profile_blocks.careerresources && viewingSelf ? (
              <LinkBlock
                details={this.props.profile_blocks.careerresources.details}
                roles={this.props.roles}
                title={this.props.profile_blocks.careerresources.title}
                id="Profile_CareerResources"
                asurite={this.props.asurite}
                ownerAsurite={this.state.asurite}
                navigation={this.props.navigation}
                previousScreen={viewingSelf?"my-profile":"user-profile"}
                previousSection="career-resources"
              />
            ) : null}
          </View>
        </ScrollView>
      </ErrorWrapper>
    );
  }
}

// {this.props.friendStatus ? (
//   <InsertSection
//     navigation={this.props.navigation}
//     asurite={this.props.asurite}
//   />
// ) : null}
// {this.props.show_friends ? (
//   <FriendsBlock showHead={true} navigation={this.props.navigation} />
// ) : null }

// <CheckinsBlock
//   header={true}
//   self={this.props.self}
//   asurite={this.props.asurite}
//   count={5}
//   navigation={this.props.navigation}
// />
// <LikesBlock
//   self={this.props.self}
//   header={true}
//   asurite={this.props.asurite}
//   count={5}
//   navigation={this.props.navigation}
// />

/**
 * Top section of a profile page. Incuding image and name
 */
export class ProfileTopX extends React.PureComponent {
  constructor(props) {
    super(props);

    let isearch = iSearchHandler(props.asurite, props.user_info);
    isearch = isearch ? isearch : {};

    this.state = {
      requestStatus: false,
      bgImage: {
        uri: this.getImageUrl(isearch)
      }
    };
  }

  static defaultProps = {
    image: "", // Must be empty because the BG image cant handle the change
    name: "",
    friend_count: 0,
    checkin_count_social: 0,
    checkin_count_academic: 0,
    like_count: 0,
    asurite: null,
    department: null,
    degree: null,
    campus: null,
    roles: [],
    verifyFriends: false,
    verifyRequestSent: false,
    repaint: () => null,
    student_status: false,
    displayName: null,
    InfoSection: () => null,
    workingTitle: null,
    user_info: {}
  };

  componentDidMount() {
    this.context.getTokens().then(tokens => {
      this.setState({
        asurite: tokens.username,
        student_status: tokens.roleList.indexOf("student") > -1
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asurite != prevProps.asurite) {
      let isearch = iSearchHandler(this.props.asurite, this.props.user_info);
      isearch = isearch ? isearch : {};

      this.setState({
        bgImage: {
          uri: this.getImageUrl(isearch)
        }
      });
    }
  }

  render() {
    let { InfoSection } = this.props;
    let isearch = iSearchHandler(this.props.asurite, this.props.user_info);
    isearch = isearch ? isearch : {};

    // console.log("WILL ISEARCH: ", isearch);

    let showEmailCallFriendSection = null;
    var viewOther = false;

    if (this.state.asurite !== this.props.asurite) {
      viewOther = true;
    }

    return (
      <View>
        <View
          style={{
            position: "absolute",
            zIndex: 100,
            right: 10,
            top: 10
          }}
        >
          <ProfilePopup asurite={this.props.asurite} />
        </View>
        <ImageBackground
          style={styles.imgBackground}
          source={this.state.bgImage}
          onError={e => {
            this.setState({
              bgImage: Image.resolveAssetSource(
                require("../assets/profbgbackup.png")
              )
            });
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row" }} accessible={true}>
              <View style={styles.imgForegroundWrapper}>
                <BigImages
                  style={styles.imgForeground}
                  defaultSource={Image.resolveAssetSource(
                    require("../assets/placeholder.png")
                  )}
                  source={[
                    { uri: isearch.photoUrl ? isearch.photoUrl : "" },
                    Image.resolveAssetSource(
                      require("../assets/placeholder.png")
                    )
                  ]}
                />
              </View>
              <View
                style={{
                  alignItems: "flex-start",
                  justifyContent: "center",
                  flex: 2
                }}
              >
                <Text style={styles.nameText}>{isearch.displayName}</Text>

                {isearch.majors && isearch.majors.length > 0 ? (
                  <View style={{ alignItems: "flex-start" }}>
                    <Text
                      style={{
                        color: "white",
                        fontSize: responsiveFontSize(2),
                        textAlign: "left",
                        marginTop: 5
                      }}
                    >
                      {isearch.majors[0]}
                    </Text>
                    {isearch.programs && isearch.programs.length > 0 ? (
                      <Text
                        style={{
                          color: "white",
                          fontSize: responsiveFontSize(2)
                        }}
                      >
                        ({isearch.programs[0]})
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <View style={{ alignItems: "flex-start" }}>
                    <Text
                      style={{
                        color: "white",
                        fontSize: responsiveFontSize(2),
                        textAlign: "left",
                        marginTop: 5
                      }}
                    >
                      {isearch.workingTitle}
                    </Text>
                    {isearch.primaryDeptId ? (
                      <Text
                        style={{
                          color: "white",
                          fontSize: responsiveFontSize(2)
                        }}
                      >
                        ({isearch.primaryDeptId})
                      </Text>
                    ) : null}
                  </View>
                )}
                <View style={[styles.tagCont]}>
                  {this.props.roles.map((item, index) => {
                    return (
                      <ProfileTag
                        key={item + index}
                        text={item}
                        color="blue"
                        navigation={this.props.navigation}
                      />
                    );
                  })}
                </View>
              </View>
              {this.props.self ? null : null}
            </View>
          </View>
        </ImageBackground>
        {/* Friend, Checkin, Like Info */}
        <InfoSection
          asurite={this.props.asurite}
          navigation={this.props.navigation}
          ownerAsurite={this.state.asurite}
          viewOther={viewOther}
          isearch={isearch}
          ownerIsStudent={this.state.student_status}
        />
      </View>
    );
  }

  getImageUrl(s) {
    let imageUrl =
      "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/profile-bg-images/";

    if (s.programs && s.programs.length > 0) {
      // console.log(" ******************** STEP 0: ", s.programs[0]);
      var tempUrl = s.programs[0].replace(/\./g, "");
      tempUrl = tempUrl.replace(/\'/g, "");
      tempUrl = tempUrl.replace(/\//g, "");
      imageUrl += tempUrl.replace(/ /g, "-").toLowerCase() + ".png";
    } else if (s.primaryDeptId != null) {
      imageUrl += s.primaryDeptId.replace(/ /g, "-").toLowerCase() + ".png";
    } else {
      imageUrl += "Default.jpg";
    }

    // console.log("Image Url: ", imageUrl, s);
    return imageUrl;
  }
}

// (
//   <View
//     style={{
//       marginVertical: responsiveHeight(1)
//     }}
//   >
//     <FriendButton
//       navigation={this.props.navigation}
//       displayName={isearch.displayName}
//       photoUrl={isearch.image ? isearch.image : ""}
//       repaint={this.props.repaint}
//       student_status={isearch.student_status}
//       friendStatus={this.props.friendStatus}
//       requestStatus={this.props.requestStatus}
//       asurite={this.props.asurite}
//     />
//   </View>
// )

ProfileTopX.contextTypes = {
  getTokens: PropTypes.func
};

export const ProfileTop = AppSyncComponent(ProfileTopX, getUserInformation);

export class ProfileSection extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    onPress: () => {},
    leftText: ""
  };

  render() {
    return (
      <TouchableOpacity
        style={styles.seeAllBarMain}
        onPress={() => {
          this.refs.analytics.sendData({
            "action-type": "click",
            "starting-screen": "profile",
            "starting-section": "my-profile", 
            "target": "Friends",
            "resulting-screen": "my-friends",
            "resulting-section": null
          });
          tracker.trackEvent("Click", "Profile_MyFriends");
          this.props.onPress();
        }}
        accessibilityRole="button"
      >
        <Analytics ref="analytics" />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.seeAllBarTextLeft]}>
              {this.props.leftText}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center"
            }}
          >
            <Text style={[styles.seeAllBarTextRight]}>SEE ALL</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={32}
              style={{ paddingRight: 20 }}
              color="#929292"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

export class InfoSection extends React.PureComponent {
  state = {
    displayChat: false
  };

  static defaultProps = {
    friend_count: 0,
    checkin_count_academic: 0,
    checkin_count_social: 0,
    viewOther: false,
    isearch: null,
    like_count: 0
  };

  componentDidMount() {
    setTimeout(this.checkIfChatApproved.bind(this), 0);
  }

  checkIfChatApproved() {
    const vm = this;
    Promise.all([
      isUserApprovedForChat(this.props.asurite),
      isUserApprovedForChat(this.props.ownerAsurite)
    ]).then(function(resp) {
      if (resp[0] && resp[1]) {
        // console.log("display the chat");
        vm.setState({ displayChat: true });
      }
    });
  }

  render() {
    var checkinCount =
      this.props.checkin_count_social + this.props.checkin_count_academic;
    // {this.countBlock("FRIENDS",this.props.friend_count,true)}
    var likesBorder = this.props.viewOther ? true : false;

    var emailLink = "mailto:" + this.props.asurite + "@asu.edu";
    // console.log(this.props);

    return (
      <View style={[styles.infoBlock]}>
        {this.props.viewOther &&
        this.props.isearch.student_status &&
        this.props.ownerIsStudent ? (
          <View
            style={{
              flex: 2,
              borderRightWidth: 1,
              borderColor: "#ededed"
            }}
            accessible={true}
          >
            <FriendButton
              navigation={this.props.navigation}
              displayName={this.props.isearch.displayName}
              photoUrl={
                this.props.isearch.image ? this.props.isearch.image : ""
              }
              repaint={this.props.repaint}
              student_status={this.props.isearch.student_status}
              friendStatus={this.props.friendStatus}
              requestStatus={this.props.requestStatus}
              asurite={this.props.asurite}
              previousScreen={"profile"}
              previousSection={null}
            />
          </View>
        ) : null}

        {this.props.viewOther
          ? this.iconBlock("envelope", true, emailLink, "Email")
          : null}

        {this.props.viewOther && this.state.displayChat
          ? this.chatBlock(false)
          : null}
      </View>
    );
  }

  countBlock(title, count, border) {
    return (
      <View
        style={{
          flex: 5,
          paddingTop: 10,
          paddingBottom: 10,
          borderRightWidth: border ? 1 : 0,
          borderColor: border ? "#ededed" : null
        }}
        accessible={true}
      >
        <Text style={[styles.blockInfo, styles.bolded]}>{count}</Text>
        <Text style={[styles.blockInfo]}>{title}</Text>
      </View>
    );
  }

  chatBlock(border) {
    return (
      <View
        style={{
          flex: 2,
          paddingTop: 10,
          paddingBottom: 10,
          alignItems: "center",
          justifyContent: "center",
          borderRightWidth: border ? 1 : 0,
          borderColor: border ? "#ededed" : null
        }}
        accessible={true}
      >
        <DirectMessage
          btnType="profile"
          navigation={this.props.navigation}
          asurite={this.props.asurite}
          title={
            this.props.isearch && this.props.isearch.displayName
              ? this.props.isearch.displayName
              : null
          }
        />
        <Text style={[styles.blockInfo]}>CHAT</Text>
      </View>
    );
  }

  iconBlock(icon, border, link, id) {
    return (
      <View
        style={{
          flex: 2,
          paddingTop: 10,
          paddingBottom: 10,
          alignItems: "center",
          justifyContent: "center",
          borderRightWidth: border ? 1 : 0,
          borderColor: border ? "#ededed" : null
        }}
        accessible={true}
      >
        <Analytics ref="analytics" />
        <TouchableOpacity
          style={{ justifyContent: "center", alignItems: "center" }}
          onPress={() => {
            var analyticsPay = {
              eventName: "Profile_HeaderButton",
              eventType: "click",
              asurite: this.props.ownerAsurite,
              addnData: {
                item: id,
                asurite: this.props.asurite
              }
            };
            this.refs.analytics.sendData({
              "action-type": "click",
              "starting-screen": "profile",
              "starting-section": "profile-header", 
              "target": "Email",
              "resulting-screen": "external-browser",
              "resulting-section": "link",
              "target-id":id,
              "action-metadata":{
                "target-id":id,
                "item": id,
                "asurite": this.props.asurite,
                "link": link
              }
            });
            tracker.trackEvent(
              "Click",
              `${this.props.fullId?this.props.fullId:"null"} - ${analyticsPay.addnData}`
            );

            this.openLink(link);
          }}
        >
          <FontAwesome
            name={icon}
            size={responsiveFontSize(2.2)}
            color="#444444"
            style={{ backgroundColor: "transparent" }}
          />
          <Text style={[styles.blockInfo, { textAlign: "center" }]}>
            {id.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  openLink(l) {
    if (l.indexOf("mailto") > -1) {
      Linking.canOpenURL(l).then(supported => {
        if (supported) {
          Linking.openURL(l);
        } else {
          console.log("Don't know how to open URI");
        }
      });
    } else {
      this.props.navigation.navigate(l);
    }
  }

  // {this.props.friend_count > 0 ? (
  //   <View
  //     style={{
  //       flex: 5,
  //       borderRightWidth: 1,
  //       borderStyle: "solid",
  //       borderColor: "#ededed"
  //     }}
  //     accessible={true}
  //   >
  //
  //     <Text style={[styles.blockInfo, styles.bolded]}>{this.props.friend_count}</Text>
  //     <Text style={[styles.blockInfo]}>FRIENDS</Text>
  //
  //   </View>
  // ) : null}
  // {this.props.checkin_count_social >= 0 ||
  // this.props.checkin_count_academic >= 0 ? (
  //   <View
  //     style={{
  //       flex: 5,
  //       borderRightWidth: 1,
  //       borderStyle: "solid",
  //       borderColor: "#ededed"
  //     }}
  //     accessible={true}
  //   >
  //     <Text style={[styles.blockInfo, styles.bolded]}>
  //       {this.props.checkin_count_social +
  //         this.props.checkin_count_academic}
  //     </Text>
  //     <Text style={[styles.blockInfo]}>CHECK-INS</Text>
  //   </View>
  // ) : null}
  // {this.props.like_count > 0 ? (
  //   <View style={{ flex: 5 }} accessible={true}>
  //     <Text style={[styles.blockInfo, styles.bolded]}>{this.props.like_count}</Text>
  //     <Text style={[styles.blockInfo]}>LIKES</Text>
  //   </View>
  // ) : null}
  //
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    margin: 50
  },
  iconContainer: {
    width: width * 0.08,
    height: width * 0.08,
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 50
  },
  friendCirle: {
    flexDirection: "row",
    padding: 5,
    width: width * 0.2,
    justifyContent: "center",
    alignItems: "center"
  },
  circleImgArea: {
    backgroundColor: "white",
    flex: 1
  },
  listText: {
    color: "black",
    fontSize: responsiveFontSize(2.2)
  },
  listItem: {
    flexDirection: "row",
    padding: 10
  },
  settingsTxt: {
    fontSize: responsiveFontSize(2.0),
    paddingTop: 2,
    paddingLeft: 5
  },
  seeAllBar: {
    // flex: 1,
    flexDirection: "row",
    padding: 20
  },
  seeAllBarMain: {
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    flexDirection: "row",
    height: responsiveHeight(10),
    // paddingTop: 25,
    // paddingBottom: 25,
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: "#626262"
  },
  seeAllBarTextLeft: {
    fontSize: responsiveFontSize(2.0),
    paddingLeft: 20,
    color: "black"
  },
  seeAllBarTextRight: {
    fontSize: responsiveFontSize(2.0),
    color: "#696969"
  },
  blackText: {
    color: "black"
  },
  rightText: {
    alignSelf: "flex-end"
  },
  nameText: {
    fontSize: responsiveFontSize(3.3),
    fontWeight: "bold",
    color: "white",
    textAlign: "left",
    fontFamily: "Roboto"
  },
  imgBackground: {
    height: responsiveHeight(33)
  },
  imgForeground: {
    alignItems: "center",
    marginTop: 5
  },
  imgForegroundWrapper: {
    height: responsiveHeight(33),
    width: responsiveWidth(50),
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  imgCont: {
    // overflow: 'hidden',
    justifyContent: "center",
    alignItems: "center",
    paddingTop: height * 0.05
  },
  bodyText: {
    fontSize: responsiveFontSize(2),
    fontFamily: "Roboto-Light",
    fontSize: 18,
    fontWeight: "100",
    fontFamily: "Roboto",
    color: "black"
  },
  infoBlock: {
    backgroundColor: "#ffffff",
    flexDirection: "row"
  },
  blockInfo: {
    color: "black",
    textAlign: "center",
    fontSize: responsiveFontSize(1.6)
  },
  bolded: {
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  tagCont: {
    flexDirection: "row",
    marginTop: 10
  },
  iconsBox: {
    flex: 1,
    flexDirection: "row",
    width: "35%",
    alignItems: "center",
    justifyContent: "space-around",
    alignSelf: "center",
    marginVertical: responsiveHeight(1)
  }
});
