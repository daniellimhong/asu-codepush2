import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { DefaultText as Text } from "../../presentational/DefaultText.js";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { Class } from "./Class";
import Analytics from "../../functional/analytics";

var { height, width } = Dimensions.get("window");

// let getFriendRequestStatus = graphql(VerifyFriendRequestSentQuery, ());
/**
 * Profile component.
 * Accepts data from either the MyProfile or UserProfile navigation paths to render data
 *
 * When this is done it should be props based
 */
export class ClassWrapper extends React.PureComponent {
  static navigationOptions = ({ navigation, screenProps }) => ({
    header: () => {
      return null;
    }
  });

  constructor(props) {
    super(props);
    // console.log("Wrapper props",props);
  }

  static defaultProps = {};

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "click",
      "target": "View Class Profile",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null,
      "resulting-screen": "class-profile", 
      "resulting-section": null,
      "target-id":this.props.navigation.state.params.data.course_id?this.props.navigation.state.params.data.course_id.toString():"-1",
      "action-metadata":{
        "target-id":this.props.navigation.state.params.data.course_id?this.props.navigation.state.params.data.course_id.toString():"-1",
      }
    });
  }

  render() {
    let { navigate } = this.props.navigation;
    let { data } = this.props.navigation.state.params;
    
    // console.log(this.props);
    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        {data ? (
          <Class
            course_title={data.course_title}
            course_id={data.course_id}
            meeting_patterns={data.meeting_patterns[0]}
            class_nbr={data.class_number}
            course_url={data.course_url}
            slack_url={data.slack_url}
            location={data.location}
            navigation={this.props.navigation}
            previousScreen={this.props.previousScreen}
            previousSection={this.props.previousSection}
          />
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text>No class data</Text>
          </View>
        )}
      </View>
    );
  }
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
    fontSize: responsiveFontSize(3.5),
    color: "white",
    textAlign: "center"
  },
  imgBackground: {
    height: responsiveHeight(35)
  },
  imgForeground: {
    borderColor: "white",
    borderWidth: 3,
    height: responsiveWidth(20),
    borderRadius: responsiveWidth(10),
    width: responsiveWidth(20),
    alignItems: "center",
    marginTop: 5
  },
  imgForegroundWrapper: {
    height: responsiveHeight(18),
    width: responsiveWidth(100),
    margin: responsiveWidth(1),
    justifyContent: "center",
    alignItems: "center"
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
    color: "black"
  },
  infoBlock: {
    backgroundColor: "#25262a",
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 10
  },
  blockInfo: {
    color: "white",
    textAlign: "center",
    fontSize: responsiveFontSize(1.8)
  }
});
