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
import Icon from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { getLikedEvents } from "../../../Queries/Activities";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { LikesBlockX } from "./LikesBlock";
import Analytics from "../../functional/analytics";

let LikesBlock = AppSyncComponent(LikesBlockX, getLikedEvents);

/**
 * Screen for personal checkins.
 *
 * This wrapper is necessary so we can properly handle the checkin queries and reuse
 * the CheckinsBlockX component.
 */
export class MyLikes extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "my-profile",
      "starting-section": null, 
      "target": "My Likes",
      "resulting-screen": "my-likes", 
      "resulting-section": null,
    });
  }

  render() {
    return (
      <View
        style={{
          flex: 1
        }}
      >
        <Analytics ref="analytics" />
        <LikesBlock self={true} navigation={this.props.navigation} />
      </View>
    );
  }
}
