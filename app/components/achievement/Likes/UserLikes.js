import React from "react";
import {
  View,
  Image,
  Dimensions,
  Keyboard,
  Text,
  AsyncStorage,
  TextInput,
  Button,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Linking,
  Platform,
  SectionList
} from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { withApollo, graphql, ApolloProvider, compose } from "react-apollo";
import { getFriendLikes } from "../../../Queries/Activities";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { LikesBlockX } from "./LikesBlock";
import Analytics from "../../functional/analytics";

let LikesBlock = AppSyncComponent(LikesBlockX, getFriendLikes);

/**
 * Screen for personal checkins.
 *
 * This wrapper is necessary so we can properly handle the checkin queries and reuse
 * the CheckinsBlockX component.
 */
export class UserLikes extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "user-profile",
      "starting-section": null, 
      "target": "User Likes",
      "resulting-screen": "user-likes", 
      "resulting-section": null,
    });
  }

  render() {
    let { asurite } = this.props.navigation.state.params;

    return (
      <View
        style={{
          flex: 1
        }}
      >
        <Analytics ref="analytics" />
        <LikesBlock asurite={asurite} navigation={this.props.navigation} />
      </View>
    );
  }
}
