import React from "react";
import {
  View,
  Image,
  Dimensions,
  Keyboard,
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
import axios from "axios";
import ResponsiveImage from "react-native-responsive-image";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { withApollo, graphql, ApolloProvider, compose } from "react-apollo";
import { GetEventActivities } from "../../../Queries/Activities";
import { AppSyncComponent } from "../../functional/authentication/auth_components/weblogin/index";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { DefaultText as Text } from "../../presentational/DefaultText.js";

/**
 * Flat List that renders every user activity.
 *
 * ToDo: Add Likes to the list as well as checkins
 */
export class LikesBlockX extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    likedItems: null,
    count: null,
    nextToken: null,
    self: false
  };

  render() {

    // console.log("LIKED ITEMS",this.props.likedItems)

    if (this.props.likedItems && this.props.likedItems.length > 0) {
      return (
        <ScrollView style={{ backgroundColor: "white" }}>
          {this.props.header ? (
            <LikesHeader
              self={this.props.self}
              asurite={this.props.asurite}
              navigation={this.props.navigation}
            />
          ) : null}
          <FlatList
            data={
              this.props.count
                ? [...this.props.likedItems].slice(0, this.props.count)
                : [...this.props.likedItems]
            }
            renderItem={({ item }) => {
              return (
                <LikeItem navigation={this.props.navigation} data={item} />
              );
            }}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
      );
    } else {
      return (
        <View style={{ backgroundColor: "white", justifyContent: "center", alignItems: "center", flex: 1}}>
          <View style={{justifyContent: "center", alignItems: "center"}}>
            <FontAwesome
              name="heart"
              size={responsiveFontSize(10)}
              color="#c1c1c1"
            />
            <View style={{ paddingVertical: 10 }}>
              <Text style={{fontSize: responsiveFontSize(3.5), color: "#c1c1c1"}}>
                No Likes Found
              </Text>
            </View>
          </View>
        </View>
      );
    }
  }
}

/**
 * Individual activity Item to be rendered by the list.
 */
class LikeItem extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    data: null
  };

  render() {
    let { data } = this.props;
    let { navigate } = this.props.navigation;
    let faButton = "calendar";
    let faBackground = "#FF7D42";

    if (data.feed_type == "news") {
      faButton = "newspaper-o";
      faBackground = "#46A1DD";
    }
    return (
      <TouchableOpacity
        onPress={() => {
          this.refs.analytics.sendData({
            "action-type": "click",
            "starting-screen": "my-likes",
            "starting-section": null, 
            "target": "Likes:"+data.title,
            "resulting-screen": "core-feature-card", 
            "resulting-section": null,
            "target-id": data.id,
            "action-metadata": {
              "target-id": data.id,
            }
          });
          navigate("Card", {
            nid: data.id,
            data: data,
            navigation: this.props.navigation,
            previousScreen:"my-likes",
            previousSection:null,
            target: "Event Card",
          });
        }}
      >
        <Analytics ref="analytics" />
        <View
          style={{
            flexDirection: "row",
            borderBottomColor: "#c4c4c4",
            borderBottomWidth: 1
          }}
        >
          <View>
            <Image
              resizeMethod={"resize"}
              style={{
                height: responsiveHeight(8),
                width: responsiveWidth(25),
                margin: responsiveHeight(2)
              }}
              source={{ uri: urldecode(data.picture) }}
            />
          </View>
          <View
            style={{
              padding: responsiveHeight(2),
              width: responsiveWidth(50)
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2.2)
              }}
            >
              {urldecode(data.title)}
            </Text>
            {/* }}>{urldecode(data.title)}</Text> */}
          </View>
          <View
            style={{
              width: responsiveWidth(10),
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: faBackground,
                height: responsiveHeight(6),
                width: responsiveHeight(6),
                borderRadius: responsiveHeight(3)
              }}
            >
              <FontAwesome
                name={faButton}
                size={responsiveFontSize(3)}
                color="white"
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

/**
 * Header that sits on top of the checkins block of the profile page.
 *
 * ToDo: If not SELF, navigate to UserCheckins page instead
 */
class LikesHeader extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    self: false,
    asurite: null
  };

  render() {
    let { navigate } = this.props.navigation;

    return (
      <TouchableOpacity
        style={styles.seeAllBarMain}
        onPress={() => {
          if (this.props.self) {
            this.refs.analytics.sendData({
              "action-type": "click",
              "starting-screen": "my-likes",
              "starting-section": "header", 
              "target": "My Likes",
              "resulting-screen": "my-likes", 
              "resulting-section": null,
            });
            navigate("MyLikes");
          } else {
            this.refs.analytics.sendData({
              "action-type": "click",
              "starting-screen": "my-likes",
              "starting-section": "header", 
              "target": "User Likes",
              "resulting-screen": "user-likes", 
              "resulting-section": null,
            });
            navigate("UserLikes", { asurite: this.props.asurite });
          }
        }}
      >
        <Analytics ref="analytics" />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: responsiveWidth(60) }}>
            <Text style={[styles.seeAllBarTextLeft]}>LIKES</Text>
          </View>
          <View
            style={{
              width: responsiveWidth(40),
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "flex-end"
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

const styles = StyleSheet.create({
  seeAllBar: {
    flexDirection: "row"
  },
  seeAllBarMain: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f1f1",
    flexDirection: "row",
    height: responsiveHeight(10),
    borderBottomWidth: 0.5,
    // borderTopWidth: 0.5,
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
  }
});

/**
 * We had to encode(escape) several of the event fields in order to avoid
 * GQL bugs on submission.
 * @param {*} url
 */
function urldecode(url) {
  if (url) {
    return decodeURIComponent(url.replace(/\+/g, " "));
  }
  return null;
}
