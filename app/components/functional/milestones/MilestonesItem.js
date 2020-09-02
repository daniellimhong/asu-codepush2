import React, { PureComponent } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet
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
import { makeObjectArray, areAllFourCompleted } from "./utility";

const COLOR_BLUE = "rgb(0, 125, 255)";

export default class MilestonesItem extends PureComponent {
  state = {
    open: false,
    completed: this.props.completed,
    selectedOutcomes: this.props.selectedOutcomes
  };

  componentDidMount() {
    if (this.props.openFirst) {
      this.setState({ open: true });
    }
  }

  pressHandler = () => {
    this.setState({ open: this.state.open ? false : true });
  };

  createLink = string => {
    let title = string.match(/\[(.*?)\]/);
    let url = string.match(/\(([^)]+)\)/);
    title = title ? title[1] : "";
    url = url ? url[1] : "";
    return (
      <TouchableOpacity
        onPress={() =>
          this.props.navigation.navigate("InAppLink", { url, title })
        }
      >
        <Text
          style={{
            fontWeight: "bold",
            fontFamily: "Roboto",
            color: "maroon",
            fontSize: responsiveFontSize(1.4)
          }}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  linkHandler = (url, title) =>
    this.props.navigation.navigate("InAppLink", { url, title });

  setOutcome = (milestoneId, outcomeId, selected) => {
    this.setState({ loading: true });
    const apiLink =
      "https://72zh0gia14.execute-api.us-east-1.amazonaws.com/prod/rest/me/milestonestatus";
    let selectedObj = selected ? { [outcomeId]: "SELECTED" } : {};
    // If the field has 4 possible outcomes instead of 2
    if (this.state.selectedOutcomes) {
      selectedObj = selected
        ? { ...this.state.selectedOutcomes, [outcomeId]: "SELECTED" }
        : { ...this.state.selectedOutcomes, [outcomeId]: "SEEN" };
    }

    const data = {
      milestoneId: milestoneId,
      value: "SEEN",
      statusByOutcome: selectedObj
    };
    const config = {
      headers: {
        "x-Api-Key": "wjS5pI4kRY1z69ZTjQ9tm3Nbuj4ISTEDcqipo84e",
        Authorization: "Bearer " + this.props.jwtToken,
        "Content-Type": "application/json"
      }
    };
    // console.log("made it past config ", data);
    axios
      .post(apiLink, data, config)
      .then(res => {
        // console.log("this is setOutcome response ", res);
        if (!this.state.selectedOutcomes) {
          this.setState({ completed: selected ? true : false, loading: false });
        } else {
          // console.log("made it inside of if", selectedObj);
          let countSelected = obj => {
            let count = 0;
            for (let key in obj) {
              if (obj[key] === "SELECTED") {
                count += 1;
              }
            }
            return count === 4 ? true : false;
          };
          let allFourCompleted = areAllFourCompleted(selectedObj);
          // console.log("what writing to selectedOutcomes ", selectedObj);
          let shouldSetCompleted;
          if (selected) {
            shouldSetCompleted = allFourCompleted ? true : false;
          } else {
            shouldSetCompleted = false;
          }
          this.setState({
            completed: shouldSetCompleted,
            selectedOutcomes: selectedObj,
            loading: false
          });
        }
        this.props.updateData();
      })
      .catch(e => {
        console.log("this is setOutcome ERROR! ", e);
        this.setState({ loading: false });
      });
  };

  render() {
    let whichImageSource;
    if (this.props.title === "Establish career interest") {
      whichImageSource = require("./images/career-interest.png");
    } else if (this.props.title === "Career/degree alignment") {
      whichImageSource = require("./images/career-degree-alignment.png");
    } else if (this.props.title === "Start networking") {
      whichImageSource = require("./images/start-networking.png");
    } else if (this.props.title === "Draft a resume") {
      whichImageSource = require("./images/draft-resume.png");
    } else if (this.props.title === "Join an organization") {
      whichImageSource = require("./images/join-org.png");
    } else if (this.props.title === "Gain experience") {
      whichImageSource = require("./images/gain-experience.png");
    } else if (this.props.title === "Develop soft skills") {
      whichImageSource = require("./images/develop-soft-skills.png");
    } else if (this.props.title === "Complete an internship") {
      whichImageSource = require("./images/complete-internship.png");
    } else if (this.props.title === "Find job opportunities") {
      whichImageSource = require("./images/find-job-opportunities.png");
    } else if (this.props.title === "Practice interview") {
      whichImageSource = require("./images/practice-interview.png");
    } else if (this.props.title === "Maintain references") {
      whichImageSource = require("./images/maintain-references.png");
    } else if (this.props.title === "Apply to jobs") {
      whichImageSource = require("./images/apply-job.png");
    } else {
      whichImageSource = require("./images/find-job-opportunities.png");
    }
    let arrayOfOutcomes = this.props.outcomes.map((v, i, a) => {
      let complete = this.state.completed;
      let arrayOfSelectedOutcomes = [];
      if (this.state.selectedOutcomes) {
        arrayOfSelectedOutcomes = makeObjectArray(this.state.selectedOutcomes);
        for (let i = 0; i < arrayOfSelectedOutcomes.length; i++) {
          if (
            arrayOfSelectedOutcomes[i].SEEN &&
            arrayOfSelectedOutcomes[i].SEEN === v.id
          ) {
            complete = false;
          } else if (
            arrayOfSelectedOutcomes[i].SELECTED &&
            arrayOfSelectedOutcomes[i].SELECTED === v.id
          ) {
            complete = true;
          }
        }
      }
      let checkerText;
      let checkerIcon;
      let buttonBackground;
      let buttonText;
      let title;
      let description;
      let buttonBorder;
      let whereButtonGoes;
      if (v.buttonText === "Yes" && complete) {
        checkerText = (
          <Text
            style={{
              fontSize: responsiveFontSize(1.1),
              fontWeight: "bold",
              color: "green",
              fontFamily: "Roboto"
            }}
          >
            DONE
          </Text>
        );
        checkerIcon = <Icon name="check" color={"green"} />;
        buttonBackground = "green";
        buttonText = !this.state.loading ? (
          <Text style={(styles.outcomeButtonBoxText, [{ color: "white" }])}>
            {v.buttonText}
          </Text>
        ) : (
          <ActivityIndicator color="white" />
        );
        title =
          v.title[0] === "[" ? (
            this.createLink(v.title)
          ) : (
            <Text
              style={{
                fontSize: responsiveFontSize(1.4),
                fontWeight: "bold",
                color: "black",
                fontFamily: "Roboto"
              }}
            >
              {v.title}
            </Text>
          );
        description = "";
        buttonBorder = "grey";
        whereButtonGoes = () => this.setOutcome(this.props.id, v.id, false);
      } else if (v.buttonText === "Yes") {
        checkerText = (
          <Text
            style={{
              fontSize: responsiveFontSize(1.4),
              fontWeight: "bold",
              color: "grey",
              fontFamily: "Roboto"
            }}
          >
            {v.duration}
          </Text>
        );
        checkerIcon = v.duration ? (
          <Icon name="access-time" color="grey" />
        ) : null;
        buttonBackground = "white";
        buttonText = !this.state.loading ? (
          <Text style={(styles.outcomeButtonBoxText, [{ color: COLOR_BLUE }])}>
            {v.buttonText}
          </Text>
        ) : (
          <ActivityIndicator color={COLOR_BLUE} />
        );
        title =
          v.title[0] === "[" ? (
            this.createLink(v.title)
          ) : (
            <Text
              style={{
                fontSize: responsiveFontSize(1.4),
                fontWeight: "bold",
                color: "black",
                fontFamily: "Roboto"
              }}
            >
              {v.title}
            </Text>
          );
        description = v.description;
        buttonBorder = COLOR_BLUE;
        whereButtonGoes = () => this.setOutcome(this.props.id, v.id, true);
      } else {
        checkerText = (
          <Text
            style={{
              fontSize: responsiveFontSize(1.4),
              fontWeight: "bold",
              color: "grey",
              fontFamily: "Roboto"
            }}
          >
            {v.duration}
          </Text>
        );
        checkerIcon = v.duration ? (
          <Icon name="access-time" color="grey" />
        ) : null;
        buttonBackground = "white";
        buttonText = (
          <Text style={(styles.outcomeButtonBoxText, [{ color: "grey" }])}>
            {v.buttonText}
          </Text>
        );
        title =
          v.title[0] === "[" ? (
            this.createLink(v.title)
          ) : (
            <Text
              style={{
                fontSize: responsiveFontSize(1.4),
                fontWeight: "bold",
                fontFamily: "Roboto",
                color: !complete ? "black" : "grey"
              }}
            >
              {v.title}
            </Text>
          );
        description = v.description;
        buttonBorder = "grey";
        // console.log("this is props in milestoneItem ", this.props);
        whereButtonGoes = () =>
          this.linkHandler(v.resourceUrl, this.props.title);
      }
      return (
        <View style={styles.outcomeContainer} key={i}>
          <View style={styles.outcomeCheckerBox}>
            {checkerIcon}
            {checkerText}
          </View>
          <TouchableOpacity
            style={[
              styles.outcomeButtonBox,
              { backgroundColor: buttonBackground, borderColor: buttonBorder }
            ]}
            onPress={whereButtonGoes}
          >
            {buttonText}
          </TouchableOpacity>
          <View style={styles.outcomeTextBox}>
            {title}
            <Text
              style={[
                styles.outcomeTextBoxText,
                {
                  color: complete && v.buttonText !== "Yes" ? "grey" : "black"
                }
              ]}
            >
              {description}
            </Text>
          </View>
        </View>
      );
    });
    let extraInfo = (
      <View style={styles.outcomeOuterContainer}>
        <Text style={styles.outcomeOuterHeaderText}>{this.props.header}</Text>
        <View style={{ flex: 1.2 * this.props.outcomes.length }}>
          {arrayOfOutcomes}
        </View>
      </View>
    );
    let whichTextToShow = !this.state.completed ? (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Icon name="access-time" color="grey" />
        <Text style={{ fontSize: responsiveFontSize(1.5), color: "grey" }}>
          {" "}
          {this.props.duration}
        </Text>
      </View>
    ) : (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text
          style={{
            fontSize: responsiveFontSize(1.4),
            color: "rgb(82, 164, 30)",
            fontWeight: "bold",
            paddingTop: 2,
            fontFamily: "Roboto"
          }}
        >
          COMPLETED
        </Text>
      </View>
    );
    return (
      <View
        style={[
          styles.container,
          {
            height: this.state.open
              ? responsiveHeight(9 + 3.5 + this.props.outcomes.length * 8.3)
              : responsiveHeight(9),
            backgroundColor: !this.state.completed ? "white" : "transparent"
          }
        ]}
      >
        <View style={[styles.itemContainer]}>
          <View style={styles.icon}>
            <Image
              style={{ height: responsiveHeight(4) }}
              source={
                !this.state.completed
                  ? whichImageSource
                  : require("./images/complete-1.png")
              }
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 5 }}>
            <Text
              style={{ fontSize: responsiveFontSize(1.75), color: "black" }}
            >
              {this.props.title}
            </Text>
            {whichTextToShow}
          </View>
          <TouchableOpacity
            style={styles.expandToggleButton}
            onPress={this.pressHandler}
          >
            <Icon
              name={!this.state.open ? "expand-more" : "expand-less"}
              size={27}
              color="rgb(105, 105, 105)"
            />
          </TouchableOpacity>
        </View>
        {this.state.open ? extraInfo : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 65,
    margin: 10,
    marginBottom: 0,
    backgroundColor: "white",
    justifyContent: "center"
  },
  itemContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around"
  },
  icon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  expandToggleButton: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  outcomeOuterContainer: {
    flex: 3,
    flexDirection: "column",
    justifyContent: "space-between",
    margin: 10
  },
  outcomeOuterHeaderText: {
    flex: 1,
    color: COLOR_BLUE,
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(1.5)
  },
  outcomeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  outcomeCheckerBox: {
    flex: 0.8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  outcomeButtonBox: {
    flex: 1.2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: responsiveHeight(1.3),
    padding: responsiveHeight(0.5)
  },
  outcomeButtonBoxText: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(1.25)
  },
  outcomeTextBox: {
    flex: 6
  },
  outcomeTextBoxText: {
    fontSize: responsiveFontSize(1.3)
  }
});

MilestonesItem.propTypes = {
  completed: PropTypes.bool,
  title: PropTypes.string,
  header: PropTypes.string,
  duration: PropTypes.string,
  outcomes: PropTypes.array,
  navigation: PropTypes.object,
  id: PropTypes.string,
  updateData: PropTypes.func,
  jwtToken: PropTypes.string,
  key: PropTypes.number,
  selectedOutcomes: PropTypes.object,
  openFirst: PropTypes.bool
};
