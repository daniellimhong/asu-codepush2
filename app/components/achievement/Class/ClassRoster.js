import React from "react";
import {
  View,
  Dimensions,
  ScrollView,
  FlatList,
  StyleSheet
} from "react-native";

import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { SingleUser } from "../Friends/SingleUser";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { Auth, Api } from "../../../services";
import Analytics from "../../functional/analytics";
import { getUserInformation } from "../../../Queries/Utility";
import { DefaultText as Text } from "../../presentational/DefaultText.js";

let SingleUserIsearch = AppSyncComponent(SingleUser, getUserInformation);

var { height, width } = Dimensions.get("window");

// let getFriendRequestStatus = graphql(VerifyFriendRequestSentQuery, ());
/**
 * Profile component.
 * Accepts data from either the MyProfile or UserProfile navigation paths to render data
 *
 * When this is done it should be props based
 */
export class ClassRoster extends React.PureComponent {
  static navigationOptions = ({ navigation, screenProps }) => ({
    header: () => {
      return null;
    }
  });

  constructor(props) {
    super(props);

    var asurites = props.navigation ? props.navigation.state.params.data : [];
    var name = props.navigation
      ? props.navigation.state.params.name
      : props.course_number;
    var course_num = props.course_number ? props.course_number : null;
    console.log("IN HERE props course", props.course_number, asurites);

    if( props.navigation && !course_num ){
      try {
        course_num = props.navigation.state.params.course_number
      } catch (e) {
        console.log("err",e);
      }
    }
    console.log("IN HERE props course",course_num);

    this.state = {
      asurites: asurites,
      name: name,
      course_num: course_num,
      forceUpdate: false
    };

  }

  static defaultProps = {};

  componentWillReceiveProps() {
    console.log("IN COMPONENT DID UPDATE", this.props, this.state);
    if (
      this.props.course_number != 0 &&
      this.props.course_number != null &&
      this.props.course_number != undefined
    ) {
      console.log("updaing");
      this.context
        .getTokens()
        .then(tokens => {
          if (tokens.username && tokens.username !== "guest") {
            // console.log(tokens);
            let payload = {
              type: "getRoster",
              course_nbr: this.props.course_number
            };

            let apiService = new Api(
              "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
              tokens
            );

            apiService
              .post("/classes", payload)
              .then(response => {
                var asurites = [];
                var asuriteCheck = /^[a-z]+[0-9]*$/;

                for (var i = 0; i < response.length; ++i) {
                  if (asuriteCheck.test(response[i].ASURITE)) {
                    asurites.push({ friend: response[i].ASURITE });
                  }
                }

                asurites = asurites.sort(function(a, b) {
                  if (a.friend < b.friend) return -1;
                  if (a.friend > b.friend) return 1;
                  return 0;
                });
                console.log(asurites);

                this.setState({
                  asurites: asurites,
                  ownerStudentStatus: tokens.roleList.indexOf("student") > -1
                });
              })
              .catch(error => {
                console.log(error);
                throw error;
              });
          }
        })
        .catch(e => {
          console.log(e);
        });
    }
  }

  componentDidMount() {
    console.log("############### 111111 target id:"+this.props.navigation.state.params.name);
    console.log(this.props.navigation.state.params);
    this.refs.analytics.sendData({
      "eventtime": new Date().getTime(),
      "action-type": "view",
      "target": "Class Roaster",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null,
      "resulting-screen": "class-roster", 
      "resulting-section": null,
      "target-id": this.props.navigation.state.params.name,
      "action-metadata":{
        "target-id": this.props.navigation.state.params.name,
      }
    });

    if( this.state.asurites === undefined ) {
      // console.log("MNade it",this.state.course_num)
      var number = this.state.course_num;

      if (
        number != 0 &&
        number != null &&
        number != undefined
      ) {
        console.log("updaing");
        this.context
          .getTokens()
          .then(tokens => {
            if (tokens.username && tokens.username !== "guest") {
              // console.log(tokens);
              let payload = {
                type: "getRoster",
                course_nbr: number
              };

              let apiService = new Api(
                "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
                tokens
              );

              apiService
                .post("/classes", payload)
                .then(response => {
                  var asurites = [];
                  var asuriteCheck = /^[a-z]+[0-9]*$/;

                  for (var i = 0; i < response.length; ++i) {
                    if (asuriteCheck.test(response[i].ASURITE)) {
                      asurites.push({ friend: response[i].ASURITE });
                    }
                  }

                  asurites = asurites.sort(function(a, b) {
                    if (a.friend < b.friend) return -1;
                    if (a.friend > b.friend) return 1;
                    return 0;
                  });
                  console.log(asurites);

                  this.setState({
                    asurites: asurites,
                    ownerStudentStatus: tokens.roleList.indexOf("student") > -1
                  });
                })
                .catch(error => {
                  console.log(error);
                  throw error;
                });
            }
          })
          .catch(e => {
            console.log(e);
          });
      }
    } else {
      Auth().getSession().then( tokens => {
        this.setState({
          ownerStudentStatus: tokens.roleList.indexOf("student") > -1
        });
      });
    }

    // console.log(this.props.navigation.state.params);
    // try {
    //   let asurites = this.props.navigation.state.params.data
    //   asurites = asurites.sort(function(a, b){
    //     if(a.friend < b.friend) return -1;
    //     if(a.friend > b.friend) return 1;
    //     return 0
    //   })
    //   console.log("Should set", asurites);
    //   this.setState({
    //     asurites: asurites
    //   })
    // } catch (e) {
    //   console.log(e)
    // }
  }

  generateHeader() {
    if (this.props.navigation) {
      return (
        <View style={[styles.classTitle]}>
          <Text style={[styles.classTitleText]}>{this.state.name}</Text>
        </View>
      );
    } else {
      return null;
    }
  }

  render() {
    // let {navigate} = this.props.navigation;
    // let {data} = this.props.navigation.state.params;

    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        {this.generateHeader()}
        <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
          <FlatList
            data={this.state.asurites}
            renderItem={this._renderFriend}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
      </View>
    );
  }

  _renderFriend = ({ item }) => {
    const { navigate } = this.props.navigation;
    // console.log("Isearch here", this.state.ownerStudentStatus);
    return (
      <SingleUser navigation={this.props.navigation} 
          ownerStudentStatus={this.state.ownerStudentStatus} 
          asurite={item.friend}
          previousScreen={"class-roster"}
          previousSection={"friend-list-item"} />
    );
  };
}

ClassRoster.contextTypes = {
  getTokens: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    margin: 50
  },
  classTitle: {
    height: 75,
    backgroundColor: "#f2f2f2"
  },
  classTitleText: {
    fontSize: responsiveFontSize(3),
    color: "black",
    paddingTop: 20,
    textAlign: "center"
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
    fontFamily: 'Roboto',
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
