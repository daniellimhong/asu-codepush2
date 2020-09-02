import React, { PureComponent } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  ImageBackground,
  StyleSheet,
  FlatList,
  ScrollView
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { Api, User } from "../../../services";
import PropTypes from "prop-types";
import axios from "axios";
import moment from "moment";
import Analytics from "./../analytics";
import { HeaderQuick } from "../../achievement/Header/HeaderQuick";
import ProgressCircle from "./ProgressCircle";
import { ErrorWrapper } from "../error/ErrorWrapper";
import Icon from "react-native-vector-icons/MaterialIcons";
import MilestonesItem from "./MilestonesItem";
import { returnFirstName, isObjectEmpty } from "./utility";

const COLOR_OF_MILESTONES_BLUE = "rgb(47, 153, 222)";
const COLOR_OF_MILESTONES_YELLOW = "rgb(238, 200, 2)";
const COLOR_OF_MILESTONES_GREEN = "rgb(123, 199, 71)";

class MilestonesComponent extends PureComponent {
  state = {
    data: [],
    headerStatement: "draft a resume",
    percentCompleted: 0,
    circleColor: "blue"
  };
  componentDidMount() {
    this.organizeData();
    if (this.props.navigation.state.params.openFirst) {
      this.scrollHere();
    }
  }

  scrollHere = () => {
    this.scrollHereRef.scrollTo({ x: 0, y: 250, animated: true });
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.navigation.state.params.milestonesStatusData
        .completionPercentage !==
      this.props.navigation.state.params.milestonesStatusData
        .completionPercentage
    ) {
      alert("getting new props");
    }
  }

  organizeData = () => {
    let {
      milestonesStatusData,
      milestonesListData,
      percentCompleted
    } = this.props.navigation.state.params;
    // console.log("this is milestoneData ", milestonesStatusData);
    const fillerObj = {
      "5264f377-bff1-4d06-ade7-0ff60595d007": {
        milestoneId: "5264f377-bff1-4d06-ade7-0ff60595d007",
        value: "SEEN",
        statusByOutcome: {}
      }
    };
    if (isObjectEmpty(milestonesStatusData.statusByMilestone)) {
      milestonesStatusData.statusByMilestone = fillerObj;
      console.log("OBJECT IS EMPTY!!!", milestonesStatusData);
    }
    let completedMilestones = this.getMilestonesCompleted(
      milestonesStatusData.statusByMilestone
    );
    let selectedOutcomes = this.getMilestonesSelected(
      milestonesStatusData.statusByMilestone
    );
    //console.log("this is completedMilestones ", completedMilestones);
    let arrangedMilestones = this.arrangeMilestones(
      completedMilestones,
      milestonesListData,
      milestonesListData,
      selectedOutcomes
    );
    if (milestonesStatusData.completionPercentage < 34) {
      circleColor = COLOR_OF_MILESTONES_YELLOW;
    } else if (
      milestonesStatusData.completionPercentage >= 34 &&
      milestonesStatusData.completionPercentage < 67
    ) {
      circleColor = COLOR_OF_MILESTONES_BLUE;
    } else {
      circleColor = COLOR_OF_MILESTONES_GREEN;
    }
    this.setState({
      data: arrangedMilestones,
      headerStatement:
        arrangedMilestones.length > 0
          ? arrangedMilestones[0].name.toLowerCase()
          : "",
      percentCompleted: milestonesStatusData.completionPercentage,
      circleColor
    });
  };

  getMilestonesCompleted = milestonesStatus => {
    let arrayOfMilestones = Object.keys(milestonesStatus).map(
      key => milestonesStatus[key]
    );
    let filteredMilestones = arrayOfMilestones.filter(v => {
      return v.value === "COMPLETED";
    });
    return filteredMilestones;
  };

  getMilestonesSelected = milestonesStatus => {
    let arrayOfMilestones = Object.keys(milestonesStatus).map(
      key => milestonesStatus[key]
    );
    let filteredMilestones = arrayOfMilestones.filter(v => {
      return (
        (v.value === "SEEN" && !isObjectEmpty(v.statusByOutcome)) ||
        v.milestoneId === "5264f377-bff1-4d06-ade7-0ff60595d007"
      );
    });
    //console.log("this is selected filtered ", filteredMilestones);
    return filteredMilestones;
  };

  arrangeMilestones = (
    listOfCompleted,
    incompleteMilestones,
    completeMilestones,
    fourOptionMilestone
  ) => {
    //console.log("listOfCompleted ", listOfCompleted,);
    for (let i = 0; i < listOfCompleted.length; i++) {
      incompleteMilestones = incompleteMilestones.filter(v => {
        return v.id !== listOfCompleted[i].milestoneId;
      });
    }

    //console.log("incompleteMilestones ", incompleteMilestones);
    let arrayOfCompleteMilestones = [];
    for (let i = 0; i < listOfCompleted.length; i++) {
      let doesMatch = completeMilestones.filter(v => {
        return v.id === listOfCompleted[i].milestoneId;
      });
      if (doesMatch.length > 0) {
        arrayOfCompleteMilestones.unshift(doesMatch[0]);
      }
    }
    for (let i = 0; i < arrayOfCompleteMilestones.length; i++) {
      arrayOfCompleteMilestones[i].completed = true;
    }
    //console.log("final allMilestones ", incompleteMilestones);
    let finalArray = incompleteMilestones.concat(arrayOfCompleteMilestones);
    if (this.props.navigation.state.params.openFirst) {
      finalArray[0].openFirst = true;
    }
    for (let i = 0; i < incompleteMilestones.length; i++) {
      incompleteMilestones[i].completed = false;
    }
    for (let i = 0; i < finalArray.length; i++) {
      if (
        finalArray[i].id === "5264f377-bff1-4d06-ade7-0ff60595d007" &&
        fourOptionMilestone.length > 0
      ) {
        finalArray[i].selectedOutcomes = fourOptionMilestone[0].statusByOutcome;
      }
    }
    // console.log("this is finalArray ", finalArray, fourOptionMilestone);
    return finalArray;
  };

  updateData = () => {
    const link =
      "https://72zh0gia14.execute-api.us-east-1.amazonaws.com/prod/rest/me";
    const config = {
      headers: {
        "x-Api-Key": "wjS5pI4kRY1z69ZTjQ9tm3Nbuj4ISTEDcqipo84e",
        Authorization: "Bearer " + this.props.navigation.state.params.jwtToken
      }
    };
    const listLink =
      "https://72zh0gia14.execute-api.us-east-1.amazonaws.com/prod/rest/milestones?activeOnly=true";
    const listConfig = {
      headers: {
        "x-Api-Key": "wjS5pI4kRY1z69ZTjQ9tm3Nbuj4ISTEDcqipo84e",
        Authorization: "Bearer " + this.props.navigation.state.params.jwtToken
      }
    };
    // console.log("made it past config");
    axios
      .get(link, config)
      .then(res => {
        // console.log("this is myRes ", res);
        axios
          .get(listLink, listConfig)
          .then(resList => {
            // console.log("this is myListRes ", resList);
            this.setState({ percentCompleted: res.data.completionPercentage });
            this.props.navigation.state.params.setMilestoneData(
              res.data,
              resList.data,
              res.data.completionPercentage
            );
          })
          .catch(e => {
            // console.log("there was an error ", e);
          });
      })
      .catch(e => {
        // console.log("there was an error ", e);
      });
  };

  _keyExtractor = (item, index) => item.id;

  _renderItem = ({ item, index }) => (
    <MilestonesItem
      title={item.name}
      completed={item.completed}
      duration={item.duration}
      outcomes={item.outcomes}
      navigation={this.props.navigation}
      header={item.title}
      id={item.id}
      jwtToken={this.props.navigation.state.params.jwtToken}
      updateData={this.updateData}
      openFirst={item.openFirst}
      selectedOutcomes={item.selectedOutcomes}
    />
  );

  render() {
    if (this.state.data) {
      return (
        <ScrollView ref={component => (this.scrollHereRef = component)}>
          <Analytics ref="analytics" />
          <ImageBackground
            style={{ width: "100%", height: 260 }}
            source={require("./images/header-bg.png")}
            resizeMode="cover"
          >
            <View
              style={{
                flex: 1,
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "space-between",
                alignItems: "center",
                height: "100%",
                paddingTop: responsiveHeight(3)
              }}
            >
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  height: responsiveHeight(5.5)
                }}
              >
                <ProgressCircle
                  percent={Math.round(this.state.percentCompleted)}
                  color={this.state.circleColor}
                  radius={responsiveWidth(13)}
                  borderWidth={8}
                  shadowColor="#999"
                  bgColor="#fff"
                  mainPage={true}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: responsiveHeight(2)
                }}
              >
                <Text
                  style={{
                    paddingTop: responsiveHeight(1.5),
                    paddingBottom: responsiveFontSize(1),
                    color: "white",
                    fontSize: responsiveFontSize(2.9),
                    fontWeight: "300",
                    fontFamily: 'Roboto',
                    flex: 1
                  }}
                >
                  Great work,{" "}
                  {returnFirstName(
                    this.props.navigation.state.params.iSearchData.displayName
                  )}
                  !
                </Text>
                <Text
                  style={{
                    flex: 1,
                    color: "white",
                    fontSize: responsiveFontSize(2.3),
                    fontWeight: "700",
                    fontFamily: 'Roboto',
                    textAlign: "center"
                  }}
                >
                  Time to '{this.state.headerStatement}'.
                </Text>
              </View>
            </View>
          </ImageBackground>
          <FlatList
            style={{
              backgroundColor: "rgb(217, 216, 216)"
            }}
            data={this.state.data}
            extraData={this.state}
            keyExtractor={this._keyExtractor}
            renderItem={this._renderItem}
          />
        </ScrollView>
      );
    } else {
      return (
        <View
          style={{ flex: 1 }}
          ref={component => (this.scrollHereRef = component)}
        >
          <View
            style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
          >
            <Analytics ref="analytics" />
            <ActivityIndicator size="large" color="maroon" />
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  bottomBox: {
    height: "100%",
    width: "100%",
    backgroundColor: "rgb(217, 216, 216)"
  },
  bottomBoxItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 65,
    margin: 10,
    marginBottom: 0,
    backgroundColor: "white"
  },
  bottomBoxItemIcon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

MilestonesComponent.propTypes = {
  navigation: PropTypes.object
};

export class Milestones extends React.PureComponent {
  render() {
    return (
      <ErrorWrapper>
        <MilestonesComponent {...this.props} />
      </ErrorWrapper>
    );
  }
}
