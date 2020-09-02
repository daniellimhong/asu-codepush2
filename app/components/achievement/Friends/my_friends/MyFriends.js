import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  AsyncStorage,
  StyleSheet
} from "react-native";
import { DefaultText as Text } from "../../../presentational/DefaultText.js";
import {
  createMaterialTopTabNavigator,
  createAppContainer
} from "react-navigation";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth
} from "react-native-responsive-dimensions";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { getFriendList } from "../../../../Queries";
import { AppSyncComponent } from "../../../functional/authentication/auth_components/appsync/AppSyncApp";
import Analytics from "../../../functional/analytics";
import { tracker } from "../../google-analytics.js";
import { AllFriendRequests } from "./";
import { SingleUser } from "../SingleUser";
import PropTypes from "prop-types";
import { SettingsContext } from "../../Settings/Settings";
import {Auth} from "../../../../services";


/**
 * The screen for viewing all of your friends or requests
 *
 */
export class MyFriends extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    AsyncStorage.multiRemove(["goToPage", "actionsData"]);
  }

  moreFriends = () => {
    let { navigate } = this.props.navigation;
    return (
      <TouchableOpacity
        onPress={() => {
          navigate("InviteFriends");
        }}
        accessibilityLabel="Add friends"
        accessibilityRole="button"
      >
        <View
          style={{
            borderWidth: 2,
            borderColor: "#464646",
            alignItems: "center",
            justifyContent: "center",
            width: responsiveWidth(8),
            height: responsiveWidth(8),
            borderRadius: responsiveWidth(4)
          }}
        >
          <FontAwesome
            name="plus"
            size={responsiveFontSize(2.5)}
            color="#464646"
            style={{ backgroundColor: "transparent" }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        <FriendsNav screenProps={{ navigation: this.props.navigation }} />
      </View>
    );
  }
}

/**
 * All official friends. These users have accepted your friend request
 */
class AllConfirmedFriendsContent extends React.PureComponent {
  state = {
    subbed: false,
    ownerStudentStatus: false
  };

  static defaultProps = {
    friends_list: [],
    refetch: () => null,
    subscribeToNewFriends: () => null,
    settings: {}
  };

  componentDidMount() {
    tracker.trackEvent("View", "MyFriends_AllConfirmedFriends");

    Auth().getSession().then(tokens => {
      this.setState({
        ownerStudentStatus: tokens.roleList.indexOf("student") > -1
      })
    })

  }

  componentDidUpdate() {
    if (
      !this.state.subbed &&
      this.props.settings &&
      this.props.settings.user &&
      this.props.settings.user !== "guest"
    ) {
      this.setState(
        {
          subbed: true
        },
        () => {
          this.props.subscribeToNewFriends(this.props.settings.user);
          this.props.subscribeToFriendRemoval(this.props.settings.user);
        }
      );
    }
  }

  render() {
    if (this.props.friends_list && this.props.friends_list.length > 0) {
      return (
        <View style={{ flex: 1 }}>
          <Analytics ref="analytics" />
          <ScrollView style={{ backgroundColor: "white" }}>
            {this.props.friends_list.map((item, index) => {
              return (
                <SingleUser
                  key={"SFIsrch" + item.friend + index}
                  friendStatus={true}
                  requestStatus={false}
                  navigation={this.props.screenProps.navigation}
                  ownerStudentStatus={this.state.ownerStudentStatus}
                  asurite={item.friend}
                  permissions={item.permissions}
                  previousScreen={"friends"}
                  previousSection={"confirmed-friends"}
                />
              );
            })}
          </ScrollView>
        </View>
      );
    } else {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: responsiveHeight(15),
            paddingHorizontal: responsiveWidth(15)
          }}
        >
          <Analytics ref="analytics" />
          <Text
            style={{
              fontSize: responsiveFontSize(3),
              marginBottom: responsiveHeight(5),
              textAlign: "center"
            }}
          >
            Get in touch with fellow Sun Devils!
          </Text>
          <Text
            style={{
              fontSize: responsiveFontSize(2.5),
              color: "#898989",
              textAlign: "center",
              flexWrap: "wrap"
            }}
          >
            Tap the icon above to find people you may know.
          </Text>
        </View>
      );
    }
  }

  _renderFriend = ({ item }) => {
    const { navigate } = this.props.navigation;
    return (
      <SingleUser
        friendStatus={true}
        requestStatus={false}
        navigation={this.props.screenProps.navigation}
        asurite={item.friend}
        permissions={item.permissions}
        ownerStudentStatus={this.state.ownerStudentStatus}
        previousScreen={"friends"}
        previousSection={"confirmed-friends"}
      />
    );
  };
}

let AllConfirmedFriendsData = AppSyncComponent(
  AllConfirmedFriendsContent,
  getFriendList
);
class AllConfirmedFriends extends React.PureComponent {
  render() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <AllConfirmedFriendsData settings={settings} {...this.props} />
        )}
      </SettingsContext.Consumer>
    );
  }
}

/**
 * Tab Nav on friends page
 */
const FriendsNav = createAppContainer(
  createMaterialTopTabNavigator(
    {
      AllFriends: {
        screen: AllConfirmedFriends,
        navigationOptions: {
          title: "All"
        }
      },
      Requests: {
        // screen: AllFriendRequestsData,
        screen: AllFriendRequests,
        navigationOptions: {
          title: "Requests"
        }
      }
    },
    {
      // tabBarComponent: createTabBarTop,
      tabBarPosition: "top",
      tabBarOptions: {
        activeTintColor: "#8C1B35",
        inactiveTintColor: "#696969",
        labelStyle: {
          fontSize: responsiveFontSize(2.2),
          fontWeight: "bold",
          paddingTop: 7,
          fontFamily: "Roboto"
        },
        style: {
          backgroundColor: "white",
          height: responsiveHeight(10),
          borderTopColor: "white"
        },
        indicatorStyle: {
          backgroundColor: "#8C1B35"
        }
      }
    }
  )
);

/**
 * Styles
 */
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
