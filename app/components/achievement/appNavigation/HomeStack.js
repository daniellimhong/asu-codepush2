import React from "react";
import { View, TouchableOpacity } from "react-native";
import { createStackNavigator } from "react-navigation";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { responsiveFontSize } from "react-native-responsive-dimensions";
import _ from "lodash";
// import axios from "axios";

import styles from "./styles";
import HomeScreen from "../Home/Home";
import { HomeSettings } from "../Home/HomeSettings";
import { HomeInterests } from "../Home/HomeInterests";
import { CFCard } from "../CoreFeature/CFCard";
import { Notifications } from "../../functional/notifications/index";
import { Events } from "../../functional/events/index";
import { News } from "../../functional/news/index";
import { SunDevilRewards } from "../sundevilrewards/index";

// .........................START : ADDED FOR TESTING PURPOSES. NEED TO REMOVE THESE BEFORE MERGING
// import { EarnPitchforks } from "./SDR/EarnPirchforks";
// import { SDRFutureFeatures } from "./SDR/FutureFeatures";
// .........................END : TESTING CODE
import NewsOrRecommend from "../../functional/news/NewsOrRecommend";
import EventsOrRecommend from "../../functional/events/EventsOrRecommend";
import RecommendedEvents from "../../functional/events/RecommendedEvents";
import RecommendedNews from "../../functional/news/RecommendedNews";
import { Milestones } from "../../functional/milestones/Milestones";
import { Transit } from "../../functional/transit/Transit";
import Library from "../../functional/library";
import Locations from "../../functional/library/Locations";
import StudyRooms from "../../functional/library/StudyRooms/index";
import MyAccount from "../../functional/library/MyAccount";
import { ViewAllList } from "../../functional/library/MyAccount/ViewAllList";
import { ViewAllListFines } from "../../functional/library/MyAccount/ViewAllListFines";
import { SchedulePage } from "../../functional/schedule";
import { Bookstore } from "../../functional/bookstore/Bookstore";
import CommunityUnion from "../../functional/community-union/CommunityUnion";
import Ticket from "../../functional/community-union/Ticket";
import { Actions } from "../../functional/notifications/actions/index";
import { Logout } from "../../functional/authentication/auth_components/logout/index";
import { Maps } from "../../functional/maps/index";
import { SunDevilSync } from "../../functional/SunDevilSync/index";
import { Feedback } from "../Feedback";
import AppList from "../../functional/app-list/index";
import { Links } from "../Links";
import { InAppLink } from "../InAppLink";
import { UserInfo } from "../UserInfo";
import { Athletics } from "../Athletics/Athletics";
import DiningAndMeals from "../../functional/meal-plans/home-screen/DiningAndMeals";
import DiningVenues from "../../functional/meal-plans/dining-venues/DiningVenues";
import DiningVenue from "../../functional/meal-plans/dining-venues/DiningVenue";
import { DiningServices } from "../../functional/meal-plans/dining-services/DiningServices";
import LostCard from "../../functional/meal-plans/dining-services/LostCard";
import ChooseMealPlans from "../../functional/meal-plans/meal-plans/ChooseMealPlans";
import MealPlansBuy from "../../functional/meal-plans/meal-plans/MealPlansBuy";
import MaroonAndGold from "../../functional/meal-plans/maroon-gold/MaroonAndGold";
import AllTransactions from "../../functional/meal-plans/dining-services/AllTransactions";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { MyProfile } from "../Profile/MyProfile";
import { UserProfile } from "../Profile/UserProfile";
import { EditBlock } from "../Profile/Edit";
import { MyFriends } from "../Friends/my_friends/MyFriends";
import { InviteFriends } from "../Friends/InviteFriends";
import { FriendSet } from "../Friends/FriendSet";
import { ProfileSettings } from "../Profile/settings/ProfileSettings";
import { MyCheckins } from "../Checkins/MyCheckins";
import { UserCheckins } from "../Checkins/UserCheckins";
import { MyLikes } from "../Likes/MyLikes";
import { FullInfoView } from "../FullInfoView";
import { ViewInfoDetails } from "../ViewInfoDetails";
import { UserLikes } from "../Likes/UserLikes";
import Search from "../Friends/Search";
import { getGlobalPermissions, setGlobalPermissions } from "../../../Queries";
import { ClassWrapper } from "../Class/ClassWrapper";
import { ClassRoster } from "../Class/ClassRoster";
import { FullClassBlock } from "../Class/ClassBlock";
import { OrganizationsHome } from "../../functional/SunDevilSync/organizations";
import { LightGame } from "../Athletics/LightGame";
import GameDayCompanion from "../Athletics/GameDayCompanion/GameDayCompanion";
import { HeaderQuick } from "../Header/HeaderQuick";
import TransparentHeader from "../Header/TransparentHeader";
import { withLocation } from "../../../services/withLocation";
import ChatManager from "../../functional/chat";
import NewChat from "../../functional/chat/NewChat";
import Chat from "../../functional/chat/Chat";
import ChatSettings from "../../functional/chat/ChatSettings";
import Report from "../../functional/chat/Report";
import { updateUserProfile } from "../Profile/gql/Mutations";
import ChatMenu from "../../functional/chat/Menus/ChatMenu";
import FootballTrivia from "../Athletics/FootballTrivia";
import Wellness from "../wellness/Wellness";
import { DailyHealthCheck } from "../../achievement/wellness/DailyHealthCheck";
import ContactTracingComponent from "../../functional/covid/contactTracing";
import WHCParent from "../../achievement/CovidWellnessCenter/WHCParent";
import COVIDResources from "../../achievement/CovidWellnessCenter/WHCParentOS";
import IVS from "../../functional/ivs";

import MayoClinicLibrary from "../../achievement/MayoClinicLibrary/MayoClinicLibrary"
import MayoContentViewer from "../../achievement/MayoClinicLibrary/MayoContentViewer"
//new import for the new functional screen law-school
import lawSchool from "../../functional/law-college/index";
import lawSchoolNormalScreen from "../../functional/law-college/Detail/Normal";
import lawSchoolEventScreen from "../../functional/law-college/Detail/Event";

const ProfileSettingsWithData = AppSyncComponent(
  ProfileSettings,
  getGlobalPermissions,
  setGlobalPermissions
);

let EditBlockAppSync = AppSyncComponent(EditBlock, updateUserProfile);
/**
 * Root Stack Navigator.
 * This is referenced by the drawer. Ie. the screen is always "HomeStack", while the drawer keys coincide with the stack keys.
 */
export default HomeStack = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: {
        header: () => <View />,
      },
    },
    Card: {
      screen: CFCard,
      navigationOptions: {
        header: null,
      },
    },
    MayoClinicLibrary: {
      screen: MayoClinicLibrary,
      navigationOptions: {
        header: null,
      },
    },
    MayoContentViewer: {
      screen: MayoContentViewer,
      navigationOptions: {
        header: null,
      },
    },
    ChatSettings: {
      screen: ChatSettings,
      navigationOptions: {
        header: ({ navigation }) => {
          // const { routes } = navigation.state;
          // const latest = routes[routes.length - 1];
          // let convoId = _.get(latest, "params.convoId");
          return (
            <HeaderQuick navigation={navigation} title="Chatroom Settings" />
          );
        },
      },
    },
    Chat: {
      screen: Chat,
      navigationOptions: {
        header: ({ navigation }) => {
          const { routes } = navigation.state;
          const latest = routes[routes.length - 1];
          const title = _.get(latest, "params.title");
          const convoId = _.get(latest, "params.convoId");
          const isSunny = _.get(latest, "params.sunnyConvo");
          const RightNav = () => {
            return <ChatMenu navigation={navigation} convoId={convoId} />;
          };

          if (!(isSunny && title === "Sunny")) {
            return (
              <HeaderQuick
                navigation={navigation}
                title={title}
                theme="dark"
                right={<RightNav />}
              />
            );
          } else {
            return (
              <HeaderQuick
                navigation={navigation}
                title={title}
                theme="sunny"
              />
            );
          }
        },
      },
    },
    ChatManager: {
      screen: ChatManager,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick navigation={navigation} theme="dark" title="Chat" />
          );
        },
      },
    },
    NewChat: {
      screen: NewChat,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick
              navigation={navigation}
              theme="dark"
              title="New Conversation"
            />
          );
        },
      },
    },
    Report: {
      screen: Report,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick
              navigation={navigation}
              theme="dark"
              title={"Report a Concern"}
            />
          );
        },
      },
    },
    Class: {
      screen: ClassWrapper,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Class Profile" />;
        },
      },
    },
    ClassRoster: {
      screen: ClassRoster,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Class Roster" />;
        },
      },
    },
    ClassSchedule: {
      screen: FullClassBlock,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Class Schedule" />;
        },
      },
    },
    InAppLink: {
      screen: InAppLink,
    },
    WHCParent: {
      screen: WHCParent,
    },
    Athletics: {
      screen: Athletics,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Athletics" />;
        },
      },
    },
    CovidContractTracing: {
      screen: ContactTracingComponent,
    },
    LawSchool: {
      screen: lawSchool,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Law School" />;
        },
      },
    },
    LawSchoolNormalScreen: {
      screen: lawSchoolNormalScreen,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Law School" />;
        },
      },
    },

    LawSchoolEventScreen: {
      screen: lawSchoolEventScreen,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Law School" />;
        },
      },
    },
    FootballTrivia: {
      screen: FootballTrivia,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick navigation={navigation} title="Trivia" theme="dark" />
          );
        },
      },
    },
    DiningAndMeals: {
      screen: withLocation(DiningAndMeals),
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick navigation={navigation} title="Dining and Meals" />
          );
        },
      },
    },
    DiningVenues: {
      screen: DiningVenues,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Dining Venues" />;
        },
      },
    },
    DiningVenue: {
      screen: DiningVenue,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Dining Venues" />;
        },
      },
    },
    DiningServices: {
      screen: DiningServices,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick navigation={navigation} title="Dining Services" />
          );
        },
      },
    },
    LostCard: {
      screen: LostCard,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick
              navigation={navigation}
              title="Lost or Stolen Sun Card"
            />
          );
        },
      },
    },
    ChooseMealPlans: {
      screen: ChooseMealPlans,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Meal Plans" />;
        },
      },
    },
    MealPlansBuy: {
      screen: MealPlansBuy,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Meal Plans" />;
        },
      },
    },
    MaroonAndGold: {
      screen: MaroonAndGold,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick
              navigation={navigation}
              title={"Maroon & Gold Dollars"}
            />
          );
        },
      },
    },
    AllTransactions: {
      screen: AllTransactions,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick navigation={navigation} title="All Transactions" />
          );
        },
      },
    },
    Notifications: {
      screen: Notifications,
    },
    HomeSettings: {
      screen: HomeSettings,
      navigationOptions: {
        header: null,
      },
    },
    HomeInterests: {
      screen: HomeInterests,
      navigationOptions: {
        title: "Interests",
      },
    },
    Schedule: {
      screen: SchedulePage,
      navigationOptions: {
        header: null,
      },
    },
    Bookstore: {
      screen: Bookstore,
      navigationOptions: {
        header: () => null,
      },
    },
    ViewAllList: {
      screen: ViewAllList,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="View All" />;
        },
      },
    },
    ViewAllListFines: {
      screen: ViewAllListFines,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="View All" />;
        },
      },
    },
    Events: {
      screen: Events,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Events" />;
        },
      },
    },
    News: {
      screen: News,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="News" />;
        },
      },
    },
    // EarnPitchforks: {
    //   screen: EarnPitchforks,
    //   navigationOptions: {
    //     header: ({ navigation }) => {
    //       return <HeaderQuick navigation={navigation} />;
    //     },
    //   },
    // },
    // SDRFutureFeatures: {
    //   screen: SDRFutureFeatures,
    //   navigationOptions: {
    //     header: ({ navigation }) => {
    //       return <HeaderQuick navigation={navigation} />;
    //     },
    //   },
    // },
    NewsOrRecommend: {
      screen: NewsOrRecommend,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Headlines" />;
        },
      },
    },

    RecommendedNews: {
      screen: RecommendedNews,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick navigation={navigation} title="Recommended News" />
          );
        },
      },
    },
    // RecommendedSdr: {
    //   screen: RecommendedSdr,
    //   navigationOptions: {
    //     header: ({ navigation }) => {
    //       return (
    //         <HeaderQuick navigation={navigation} title="Recommended News" />
    //       );
    //     }
    //   }
    // },

    EventsOrRecommend: {
      screen: EventsOrRecommend,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Events" />;
        },
      },
    },
    RecommendedEvents: {
      screen: RecommendedEvents,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick navigation={navigation} title="Recommended Events" />
          );
        },
      },
    },
    Milestones: {
      screen: Milestones,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick navigation={navigation} title="Career Milestones" />
          );
        },
      },
    },
    Links: {
      screen: Links,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Links" />;
        },
      },
    },
    LightGame: {
      screen: LightGame,
      navigationOptions: {
        header: null,
      },
    },
    GameDayCompanion: {
      screen: withLocation(GameDayCompanion),
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick
              navigation={navigation}
              title="Game Day Companion"
              theme="dark"
              // right={<RightNav />}
            />
          );
        },
      },
    },
    "ASU Shuttles": {
      screen: Transit,
      navigationOptions: {
        header: null,
      },
    },
    CommunityUnion: {
      screen: CommunityUnion,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick navigation={navigation} title="365 Community Union" />
          );
        },
      },
    },
    Ticket: {
      screen: Ticket,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Ticket" />;
        },
      },
    },
    Maps: {
      screen: Maps,
    },
    SunDevilSync: {
      screen: SunDevilSync,
      navigationOptions: {
        header: null,
      },
    },
    MyCheckins: {
      screen: MyCheckins,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Check-ins" />;
        },
      },
    },
    UserCheckins: {
      screen: UserCheckins,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Check-ins" />;
        },
      },
    },
    MyLikes: {
      screen: MyLikes,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Likes" />;
        },
      },
    },
    UserLikes: {
      screen: UserLikes,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Likes" />;
        },
      },
    },
    MyProfile: {
      screen: MyProfile,
      navigationOptions: {
        header: ({ navigation }) => {
          const { navigate } = navigation;
          return (
            <HeaderQuick
              navigation={navigation}
              right={
                <View style={styles.myProfileRight}>
                  <TouchableOpacity
                    onPress={() =>
                      navigate("ProfileSettings", {
                        previousScreen: "my-profile",
                        previousSection: "header",
                        target: "Settings",
                      })
                    }
                    style={styles.flexZero}
                    accessibilityLabel="Profile Settings"
                    accessibilityRole="button"
                  >
                    <FontAwesome5 name="cog" size={25} color="#464646" />
                  </TouchableOpacity>
                </View>
              }
              title={"Profile"}
            />
          );
        },
      },
    },
    UserProfile: {
      screen: UserProfile,
      navigationOptions: {
        header: ({ navigation }) => {
          let name = "";
          if (
            navigation.state &&
            navigation.state.params &&
            navigation.state.params.data &&
            navigation.state.params.data.displayName
          ) {
            name = navigation.state.params.data.displayName;
          }
          return <HeaderQuick navigation={navigation} title={name} />;
        },
      },
    },
    EditBlock: {
      screen: EditBlockAppSync,
    },
    FullInfoView: {
      screen: FullInfoView,
    },
    ViewInfoDetails: {
      screen: ViewInfoDetails,
    },
    MyFriends: {
      screen: MyFriends,
      navigationOptions: {
        header: ({ navigation }) => {
          const { navigate } = navigation;
          return (
            <HeaderQuick
              navigation={navigation}
              title="Friends"
              right={
                <TouchableOpacity
                  onPress={() => {
                    navigate("InviteFriends");
                  }}
                  accessibilityLabel="Add friends"
                  accessibilityRole="button"
                >
                  <View style={styles.myFriendsRight}>
                    <FontAwesome5
                      name="plus"
                      size={responsiveFontSize(2.5)}
                      color="#464646"
                      style={styles.myFriendsRightIcon}
                    />
                  </View>
                </TouchableOpacity>
              }
            />
          );
        },
      },
    },
    FriendSet: {
      screen: FriendSet,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick navigation={navigation} title="Friends Attending" />
          );
        },
      },
    },
    InviteFriends: {
      screen: InviteFriends,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Invite Friends" />;
        },
      },
    },
    ProfileSettings: {
      screen: ProfileSettingsWithData,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Preferences" />;
        },
      },
    },
    Actions: {
      screen: Actions,
    },
    Feedback: {
      screen: Feedback,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Feedback" />;
        },
      },
    },
    AppList: {
      screen: AppList,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Apps" />;
        },
      },
    },
    Directory: {
      screen: Search,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Directory" />;
        },
      },
    },
    UserInfo: {
      screen: UserInfo,
      navigationOptions: {
        header: ({ navigation }) => {
          let { navigate } = navigation;
          return <HeaderQuick navigation={navigation} title={"Directory"} />;
        },
      },
    },
    OrganizationsHome: {
      screen: OrganizationsHome,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="Organization" />;
        },
      },
    },
    Library: {
      screen: Library,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick
              navigation={navigation}
              title="Library"
              imageUrl="https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/library/Library-Header.png"
            />
          );
        },
      },
    },
    SunDevilRewards: {
      screen: SunDevilRewards,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick navigation={navigation} title="Sun Devil Rewards" />
          );
        },
      },
    },
    DailyHealthCheck: {
      screen: DailyHealthCheck,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick navigation={navigation} title="Daily Health Check" />
          );
        },
      },
    },
    Locations: {
      screen: Locations,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick
              navigation={navigation}
              title="Library"
              imageUrl="https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/library/Library-Header.png"
            />
          );
        },
      },
    },
    StudyRooms: {
      screen: StudyRooms,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick
              navigation={navigation}
              title="Study Rooms"
              imageUrl="https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/library/Library-Header.png"
            />
          );
        },
      },
    },
    MyAccount: {
      screen: MyAccount,
      navigationOptions: {
        header: ({ navigation }) => {
          return (
            <HeaderQuick
              navigation={navigation}
              title="Library"
              imageUrl="https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/library/Library-Header.png"
            />
          );
        },
      },
    },
    COVIDResources: {
      screen: COVIDResources,
      navigationOptions: {
        // header: ({ navigation }) => {
        //   return (
        //     <HeaderQuick navigation={navigation} title="COVID Resources" />
        //   );
        // },
      },
    },
    OnlineWellness: {
      screen: Wellness,
      navigationOptions: {
        header: ({ navigation }) => {
          return <HeaderQuick navigation={navigation} title="ASU Wellness" />;
        },
      },
    },
    IVS: {
      screen: IVS,
      navigationOptions: {
        header: ({ navigation }) => {
          return null;
        },
      },
    },
  },
  {
    // headerMode: 'none',
    defaultNavigationOptions: {
      header: null,
    },
  }
);
