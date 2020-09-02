import React from "react";
import { ScrollView, View, Text, Platform } from "react-native";
import { createDrawerNavigator } from "react-navigation";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import _ from "lodash";
import PropTypes from "prop-types";

import styles from "./styles";
import DrawerHeaderContent from "./DrawerHeader";
import CustomDrawerItems, { RenderTag } from "./CustomDrawerItems";
import HomeStack from "./HomeStack";
import { Bookstore } from "../../functional/bookstore/Bookstore";
import { AuthRender } from "../../functional/authentication/auth_components/weblogin/index";
import { Logout } from "../../functional/authentication/auth_components/logout/index";
import { SettingsContext } from "../Settings/Settings";
import DeviceInfo from 'react-native-device-info';
import Wellness from "../wellness/Wellness";

const greyIconColor = "#9a9a9a";

export default AppDrawer = createDrawerNavigator(
  {
    // HomeStack: HomeStack,
    Card: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    MayoClinicLibrary: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    Home: {
      screen: HomeStack,
      params: {
        quickLinkLabel: "Home",
      },
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    Class: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    ClassRoster: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    ClassSchedule: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    InAppLink: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    HomeSettings: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    HomeInterests: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        title: "Interests",
        header: null,
      },
    },
    MyCheckins: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    UserCheckins: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    MyLikes: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    UserLikes: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    MyProfile: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    UserProfile: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    MyFriends: {
      screen: HomeStack,
      params: {
        quickLinkLabel: "Friends",
      },
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    FriendSet: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    InviteFriends: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    Actions: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    Directory: {
      screen: HomeStack,
      params: {
        quickLinkLabel: "Directory",
      },
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    UserInfo: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    OrganizationsHome: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => null,
        header: null,
      },
    },
    // DRAWER ITEMS
    ChatManager: {
      screen: HomeStack,
      params: {
        quickLinkLabel: "Chat",
      },
      navigationOptions: {
        // title: "CHAT",
        drawerLabel: () => null,
        header: null,
      },
    },
    LawSchool: {
      screen: HomeStack,
      navigationOptions: {
        title: "LAW SCHOOL",
        header: null,
        drawerLabel: () => {
          return (
            <AuthRender type="law">
              <View
                style={styles.drawerItem}
                accessibilityLabel="Law School. Button"
                accessibilityTraits="button"
              >
                <View style={styles.drawerIconContainer}>
                  <Icon name="gavel" size={25} color={greyIconColor} />
                </View>
                <Text style={styles.drawerText}>LAW SCHOOL</Text>
              </View>
            </AuthRender>
          );
        },
      },
    },
    AppList: {
      screen: HomeStack,
      navigationOptions: {
        title: "ASU APPS",
        drawerLabel: () => {
          return (
            <View
              style={styles.drawerItem}
              accessible
              accessibilityLabel="ASU Apps. Button"
              accessibilityTraits="button"
            >
              <View style={styles.drawerIconContainer}>
                <MaterialCommunityIcons
                  size={25}
                  color={greyIconColor}
                  name={"apps"}
                />
              </View>
              <Text style={styles.drawerSpecial}>ASU Apps</Text>
            </View>
          );
        },
        header: null,
      },
    },
    WHCParent: {
      screen: HomeStack,
      params: {
        role: "not_online",
        group: "wellness",
        groupLabel: "Wellness",
        groupTag: "New!",
        groupIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5 name="heartbeat" size={25} color={greyIconColor} />
          </View>
        ),
      },
      navigationOptions: {
        title: "ASU COVID-19 Wellness Center",
        header: null,
        drawerLabel: () => {
          return (
            <AuthRender
             type="not_online"
            >
              <View
                style={styles.drawerItem}
                accessible
                accessibilityLabel="ASU COVID-19 Wellness Center. Button"
                accessibilityTraits="button"
              >
                <View style={styles.drawerIconContainer}>
                  <FontAwesome5
                    name="hospital"
                    size={25}
                    color={greyIconColor}
                    solid={true}
                  />
                </View>
                <Text allowFontScaling={false} style={styles.drawerSpecial}>
                  ASU COVID-19 Wellness Center
                </Text>
              </View>
            </AuthRender>
          );
        },
      },
    },
    OnlineWellness: {
      screen: HomeStack,
      params: {
        role: "online_notstaff",
        group: "onlineWellness",
        groupLabel: "Wellness",
        groupTag: "New!",
        groupIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5 name="heartbeat" size={25} color={greyIconColor} />
          </View>
        ),
      },
      navigationOptions: {
        title: "Online Wellness",
        header: null,
        drawerLabel: () => {
          return (
            <AuthRender type="online_notstaff">
              <View
                style={styles.drawerItem}
                accessible
                accessibilityLabel="Online Wellness. Button"
                accessibilityTraits="button"
              >
                <View style={styles.drawerIconContainer}>
                  <FontAwesome5
                    name="hospital"
                    size={25}
                    color={greyIconColor}
                    solid={true}
                  />
                </View>
                <Text allowFontScaling={false} style={styles.drawerSpecial}>
                  Online Wellness
                </Text>
              </View>
            </AuthRender>
          );
        },
      },
    },
    COVIDResources: {
      screen: HomeStack,
      params: {
        role: "online",
        group: "onlineWellness",
        groupLabel: "Wellness",
        groupTag: "New!",
        groupIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5 name="heartbeat" size={25} color={greyIconColor} />
          </View>
        ),
      },
      navigationOptions: {
        title: "COVID Resources",
        header: null,
        drawerLabel: () => {
          return (
            <AuthRender
            // type="not_online"
            >
              <View
                style={styles.drawerItem}
                accessible
                accessibilityLabel="COVID Resources. Button"
                accessibilityTraits="button"
              >
                <View style={styles.drawerIconContainer}>
                  <FontAwesome5
                    name="hospital"
                    size={25}
                    color={greyIconColor}
                    solid={true}
                  />
                </View>
                <Text allowFontScaling={false} style={styles.drawerSpecial}>
                  COVID Resources
                </Text>
              </View>
            </AuthRender>
          );
        },
      },
    },
    // Wellness: {
    //   screen: HomeStack,
    //   params: {
    //     quickLinkLabel: "Wellness",
    //   },
    //   navigationOptions: {
    //     title: "WELLNESS",
    //     header: null,
    //     drawerLabel: () => (
    //       <AuthRender type="online">
    //         <View
    //           style={styles.drawerItem}
    //           accessibilityLabel="WELLNESS. Button"
    //           accessibilityTraits="button"
    //         >
    //           <View style={styles.drawerIconContainer}>
    //             <MaterialCommunityIcons
    //               size={25}
    //               color={greyIconColor}
    //               name={"heart-pulse"}
    //             />
    //           </View>
    //           <Text style={styles.drawerText}>WELLNESS</Text>
    //           {RenderTag("New!")}
    //         </View>
    //       </AuthRender>
    //     ),
    //   },
    // },
    Athletics: {
      screen: HomeStack,
      navigationOptions: {
        title: "ATHLETICS",
        drawerIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5 name="swimmer" size={25} color={greyIconColor} />
          </View>
        ),
        header: null,
      },
    },
    /* // moved into WHCParent.js
    MayoClinicLibrary: {
      screen: HomeStack,
      navigationOptions: {
        title: "Mayo Clinic Library",
        drawerIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5 name="swimmer" size={25} color={greyIconColor} />
          </View>
        ),
        header: null,
      },
    },
    */
    DiningAndMeals: {
      screen: HomeStack,
      navigationOptions: {
        title: "DINING SERVICES",
        header: null,
        drawerLabel: () => {
          return (
            <AuthRender>
              <View
                style={styles.drawerItem}
                accessibilityLabel="Dining and Meals. Button"
                accessibilityTraits="button"
              >
                <View style={styles.drawerIconContainer}>
                  <FontAwesome5
                    name="utensils"
                    size={25}
                    color={greyIconColor}
                  />
                </View>
                <Text style={styles.drawerText}>{"DINING & MEALS"}</Text>
              </View>
            </AuthRender>
          );
        },
      },
    },
    Library: {
      screen: HomeStack,
      navigationOptions: {
        title: "LIBRARY",
        drawerIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5 name="book-reader" size={25} color={greyIconColor} />
          </View>
        ),
        header: null,
      },
    },

    EventsOrRecommend: {
      screen: HomeStack,
      params: {
        group: "newsAndEvents",
        groupLabel: "News & Events",
        quickLinkLabel: "Events",
        groupIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5
              name="calendar-check"
              size={25}
              color={greyIconColor}
            />
          </View>
        ),
      },
      navigationOptions: {
        title: "EVENTS",
        drawerIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5
              name="calendar-plus"
              size={25}
              color={greyIconColor}
            />
          </View>
        ),
        header: null,
      },
    },
    Maps: {
      screen: HomeStack,
      params: {
        group: "mapsAndTransit",
        groupLabel: "Maps & Transit",
        groupIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5
              name="map-marker-alt"
              size={25}
              color={greyIconColor}
            />
          </View>
        ),
        quickLinkLabel: "Maps",
      },
      navigationOptions: {
        title: "MAPS",
        drawerIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5
              name="map-marked-alt"
              size={25}
              color={greyIconColor}
            />
          </View>
        ),
      },
    },
    SunDevilSync: {
      screen: HomeStack,
      navigationOptions: {
        title: "CLUBS",
        header: null,
        drawerLabel: () => {
          return (
            <AuthRender>
              <View
                style={styles.drawerItem}
                accessibilityLabel="CLUBS. Button"
                accessibilityTraits="button"
              >
                <View style={styles.drawerIconContainer}>
                  <FontAwesome5
                    size={25}
                    color={greyIconColor}
                    name="sync-alt"
                  />
                </View>
                <Text style={styles.drawerText}>CLUBS</Text>
              </View>
            </AuthRender>
          );
        },
      },
    },
    NewsOrRecommend: {
      screen: HomeStack,
      params: {
        group: "newsAndEvents",
        groupLabel: "News & Events",
        groupIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5
              name="calendar-check"
              size={25}
              color={greyIconColor}
            />
          </View>
        ),
      },
      navigationOptions: {
        title: "NEWS",
        drawerIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5 name="rss" size={25} color={greyIconColor} />
          </View>
        ),
        header: null,
      },
    },
    SunDevilRewards: {
      screen: HomeStack,
      navigationOptions: {
        title: "SUN DEVIL REWARDS",
        header: null,
        drawerLabel: () => {
          return (
            <AuthRender>
              <View
                style={styles.drawerItem}
                accessible
                accessibilityLabel="SUN DEVIL REWARDS. Button"
                accessibilityTraits="button"
              >
                <View style={styles.drawerIconContainer}>
                  <FontAwesome5
                    name="hand-peace"
                    size={25}
                    color={greyIconColor}
                    solid={true}
                  />
                </View>
                <Text style={styles.drawerText}>SUN DEVIL REWARDS</Text>
              </View>
            </AuthRender>
          );
        },
      },
    },
    Schedule: {
      screen: HomeStack,
      params: {
        role: "not_guest",
        group: "academics",
        groupLabel: "Academics",
        groupIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5 name="newspaper" size={25} color={greyIconColor} />
          </View>
        ),
      },
      navigationOptions: {
        title: "SCHEDULE",
        header: null,
        drawerLabel: () => {
          return (
            <AuthRender>
              <View
                style={styles.drawerItem}
                accessible
                accessibilityLabel="SCHEDULE. Button"
                accessibilityTraits="button"
              >
                <View style={styles.drawerIconContainer}>
                  <FontAwesome5
                    name="calendar-alt"
                    size={25}
                    color={greyIconColor}
                  />
                </View>
                <Text style={styles.drawerText}>SCHEDULE</Text>
              </View>
            </AuthRender>
          );
        },
      },
    },
    Bookstore: {
      screen: Bookstore,
      navigationOptions: {
        title: "BOOKSTORE",
        header: null,
        drawerLabel: () => {
          return (
            <AuthRender>
              <View
                style={styles.drawerItem}
                accessible
                accessibilityLabel="BOOKSTORE. Button"
                accessibilityTraits="button"
              >
                <View style={styles.drawerIconContainer}>
                  <MaterialCommunityIcons
                    size={25}
                    color={greyIconColor}
                    name="book-open-variant"
                  />
                </View>
                <Text style={styles.drawerText}>BOOKSTORE</Text>
              </View>
            </AuthRender>
          );
        },
      },
    },
    "ASU Shuttles": {
      screen: HomeStack,
      params: {
        group: "mapsAndTransit",
        groupLabel: "Maps & Transit",
        groupIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5
              name="map-marker-alt"
              size={25}
              color={greyIconColor}
            />
          </View>
        ),
      },
      navigationOptions: {
        title: "ASU SHUTTLES",
        drawerLabel: () => {
          return (
            <View
              style={styles.drawerItem}
              accessible
              accessibilityLabel="ASU Apps. Button"
              accessibilityTraits="button"
            >
              <View style={styles.drawerIconContainer}>
                <FontAwesome5
                  name="bus-alt"
                  size={25}
                  color={greyIconColor}
                  solid={true}
                />
              </View>
              <Text style={styles.drawerSpecial}>ASU Shuttles</Text>
            </View>
          );
        },
        header: null,
      },
    },
    CommunityUnion: {
      screen: HomeStack,
      params: {
        role: "not_guest",
        group: "campusLife",
        groupLabel: "Campus Life",
        groupIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5 name="user-friends" size={25} color={greyIconColor} />
          </View>
        ),
      },
      navigationOptions: {
        title: "365 COMMUNITY UNION",
        header: null,
        drawerLabel: () => {
          return (
            <AuthRender>
              <View
                style={styles.drawerItem}
                accessibilityLabel="CommunityUnion. Button"
                accessibilityTraits="button"
              >
                <View style={styles.drawerIconContainer}>
                  <FontAwesome5
                    name="compass"
                    size={25}
                    color={greyIconColor}
                  />
                </View>
                <Text style={styles.drawerText}>365 COMMUNITY UNION</Text>
              </View>
            </AuthRender>
          );
        },
      },
    },
    Links: {
      screen: HomeStack,
      navigationOptions: {
        title: "LINKS",
        drawerIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5 name="link" size={25} color={greyIconColor} />
          </View>
        ),
        header: null,
      },
    },
    Feedback: {
      screen: HomeStack,
      navigationOptions: {
        title: "FEEDBACK",
        drawerIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5 name="comment-alt" size={25} color={greyIconColor} />
          </View>
        ),
        header: null,
      },
    },
    ProfileSettings: {
      screen: HomeStack,
      params: {
        quickLinkLabel: "Preferences",
      },
      navigationOptions: {
        title: "PREFERENCES",
        drawerIcon: () => (
          <View style={styles.drawerIconContainer}>
            <FontAwesome5 name="cogs" size={25} color={greyIconColor} />
          </View>
        ),
        header: null,
      },
    },
    // IVS: {
    //   screen: HomeStack,
    //   navigationOptions: {
    //     title: "IVS",
    //     drawerIcon: () => (
    //       <View style={styles.drawerIconContainer}>
    //         <FontAwesome5 name="star" size={25} color={greyIconColor} />
    //       </View>
    //     ),
    //     header: null,
    //   },
    // },
  },
  {
    defaultNavigationOptions: {
      header: null,
    },
    initialRouteName: "Home",
    drawerPosition: "left",
    drawerWidth: responsiveWidth(100),
    drawerBackgroundColor: "#ffffff",
    contentOptions: {
      activeTintColor: "#4f4f4f",
      inactiveTintColor: "#2e2e2e",
    },
    contentComponent: (props) => {
      const buildVersion = Platform.OS !== "ios" ? DeviceInfo.getVersion() : DeviceInfo.getBuildNumber();

      const headerQuickLinks = [
        "Home",
        "ChatManager",
        "Directory",
        "MyFriends",
        "ProfileSettings",
        "Maps",
      ];
      const quickItems = [];

      props.items.forEach((item) => {
        if (headerQuickLinks.includes(item.key)) {
          quickItems.push(item);
        }
      });

      return (
        <SettingsContext.Consumer>
          {(settings) => (
            <ScrollView style={styles.fullWidth}>
              <DrawerHeaderContent
                navigation={props.navigation}
                quickItems={quickItems}
                settings={settings}
              />
              <CustomDrawerItems
                {...props}
                settings={settings}
              ></CustomDrawerItems>
              <ExtendedLogout />
              <Text
                style={{
                  color: "#808080",
                  fontSize: responsiveFontSize(1.5),
                  margin: 5,
                }}
              >
                v{buildVersion}
              </Text>
            </ScrollView>
          )}
        </SettingsContext.Consumer>
      );
    },
  }
);

class ExtendedLogout extends React.PureComponent {
  render() {
    return (
      <View>
        <Logout
          includeLogoutProcess={() => {
            this.refs.analytics.sendData({
              eventtime: new Date().getTime(),
              "action-type": "click",
              "starting-screen": currentScreenName,
              "starting-section": "drawer-menu",
              target: "Logout",
              "resulting-screen": "login",
              "resulting-section": null,
            });
            this.context.AppSyncClients.authClient.clearStore();
          }}
        />
      </View>
    );
  }
}
ExtendedLogout.contextTypes = {
  AppSyncClients: PropTypes.object,
};
