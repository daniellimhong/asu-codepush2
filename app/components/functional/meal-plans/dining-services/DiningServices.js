import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PropTypes from "prop-types";
import axios from "axios";
import { Api } from "../../../../services/api";
import { tracker } from "../../../achievement/google-analytics";
import Analytics from "../../analytics";
import MealPlansSection from "./MealPlansSection";
import MealPlansHeader from "./MealPlansHeader";
import { MealPlansModal } from "./MealPlansModal";
import { getLastTransaction } from "../utility";

const MAROON = "rgb(212, 0, 77)";
const message =
  "Please contact MidFirst Bank at 888-MIDFIRST (888-643-3477) to notify them of your lost or stolen Pitchfork Card. ASU does not have the ability to activate/deactivate any banking functions related to the Pitchfork Card.";
const message1 =
  "Continuing to disable your card will disable all card functions including building/door access and all dining related services";

export class DiningServices extends PureComponent {
  state = {
    transactions: this.props.navigation.state.params.transactions,
    mealPlans: this.props.navigation.state.params.mealPlans,
    lastMAndGTransaction: this.props.navigation.state.params
      .lastMAndGTransaction,
    lastMealTransaction: this.props.navigation.state.params.lastMealTransaction,
    card: {},
    cardButtonLoading: false,
    modalVisible: false,
    screen: "main"
  };

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "dining-and-meals",
      "starting-section": "dining-and-meals-header", 
      "target": "Dining & Meals",
      "resulting-screen": "dining-services", 
      "resulting-section": null
    });
    tracker.trackEvent("View", "DiningServices");
    this.getMealPlansData();
  }

  getMealPlansData = () => {
    axios
      .get(
        "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/dining-services-links"
      )
      .then(linksResponse => {
        // console.log("links linksResponse ", linksResponse.data);
        this.setState({ links: linksResponse.data });
      })
      .catch(e => console.log("links api error: ", e));
  };

  toggleStatusCard = which => {
    this.setState({
      cardButtonLoading: true
    });
    this.context.getTokens().then(tokens => {
      const apiService = new Api(
        "https://4iml3flfvd.execute-api.us-west-2.amazonaws.com/prod",
        tokens
      );
      const whichStatus = which === "Lost" ? 2 : 1;
      const payload = {
        status: whichStatus
      };
      // console.log("which status we are setting: ", whichStatus);
      apiService.post("/card", payload).then(postCardResponse => {
        // console.log("post card response ", postCardResponse);
        if (postCardResponse.status === "success") {
          const currentObj = this.state.card;
          let which;
          if (whichStatus === 2) {
            currentObj.status = "Lost";
            which = "DeactivatedCard";
          } else {
            currentObj.status = "Active";
            which = "ActivatedCard";
          }
          tracker.trackEvent("Click", `Sucessefully ${which}`);
          // console.log("what we are setting card to ", currentObj);
          this.setState({
            card: currentObj,
            cardStatus: currentObj.status ? currentObj.status : message1,
            cardButtonLoading: false,
            modalVisible: !this.state.card.message
          });
        } else {
          this.setState({ cardButtonLoading: false });
        }
      });
    });
  };

  setModalVisible = visible => this.setState({ modalVisible: visible });

  render() {
    let sections;
    if (this.state.signup) {
      sections = (
        <View style={{ paddingBottom: responsiveWidth(4) }}>
          <MealPlansSection
            which="empty"
            signup={this.state.signup}
            navigation={this.props.navigation}
          />
          <MealPlansSection
            which="links"
            links={this.state.links}
            navigation={this.props.navigation}
          />
        </View>
      );
    } else if (this.state.mealPlans && this.state.mealPlans.length > 0) {
      sections = (
        <View style={{ paddingBottom: responsiveWidth(4) }}>
          <MealPlansSection
            which="mealPlans"
            transactions={this.state.transactions}
            mealPlans={this.state.mealPlans}
            navigation={this.props.navigation}
            lastDiningTransaction={this.state.lastDiningTransaction}
            modalVisible={this.state.modalVisible}
            navigation={this.props.navigation}
          />
          <MealPlansSection
            which="maroonGold"
            transactions={this.state.transactions}
            mealPlans={this.state.mealPlans}
            navigation={this.props.navigation}
            lastMAndGTransaction={this.state.lastMAndGTransaction}
            modalVisible={this.state.modalVisible}
            navigation={this.props.navigation}
          />
          <MealPlansSection
            which="links"
            links={this.state.links}
            navigation={this.props.navigation}
            modalVisible={this.state.modalVisible}
          />
        </View>
      );
    } else {
      sections = (
        <View
          style={{
            justifyContent: "center",
            height: responsiveHeight(100) - responsiveWidth(82)
          }}
        >
          <ActivityIndicator size="large" color="rgb(121, 0, 44)" />
        </View>
      );
    }
    const setBackgroundDark = this.state.modalVisible ? (
      <View
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          height: "100%",
          width: responsiveWidth(100),
          position: "absolute"
        }}
      />
    ) : null;

    return (
      <ScrollView style={styles.container}>
        <Analytics ref="analytics" />
        <MealPlansHeader />
        {sections}
        <MealPlansModal
          modalVisible={this.state.modalVisible}
          setModalVisible={this.setModalVisible}
          card={this.state.card}
        />
        {setBackgroundDark}
      </ScrollView>
    );
  }
}

DiningServices.contextTypes = {
  getTokens: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgb(227, 226, 226)"
  }
});
