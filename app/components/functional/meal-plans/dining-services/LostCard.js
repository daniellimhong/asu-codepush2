import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView
} from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { Api } from "../../../../services/api";
import { tracker } from "../../../achievement/google-analytics";
import Analytics from "../../analytics";
import LostCardHeader from "./LostCardHeader";
import LostCardSection from "./LostCardSection";
import { MealPlansModal } from "./MealPlansModal";

export default class LostCard extends PureComponent {
  state = {
    modalVisible: false,
    card: {},
    cardStatus: false,
    cardMessage: "",
    cardButtonLoading: false,
    asurite: "loading",
    which: "",
    cardStatus: ""
  };

  componentDidMount() {
    this.getSunCardData();
  }

  getSunCardData = () => {
    this.context.getTokens().then(tokens => {
      this.setState({
        tokens,
        asurite: tokens.username
      });
      if (tokens.username && tokens.username !== "guest") {
        const apiService = new Api(
          "https://4iml3flfvd.execute-api.us-west-2.amazonaws.com/prod",
          tokens
        );
        apiService.get("/card").then(cardResponse => {
          // console.log("card ", cardResponse);
          this.setState({
            card: cardResponse,
            cardStatus: cardResponse.status,
            cardMessage: cardResponse.message
          });
        });
      }
    });
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
          this.refs.analytics.sendData({
            "action-type": "click",
            "starting-screen": "dining-services-lost-card",
            "starting-section": null, 
            "target": "Action Button",
            "resulting-screen": "dining-services-lost-card", 
            "resulting-section": null,
            "action-metadata":{
              "action": which,
              "isStudent": this.state.isStudent,
              "eventID": "cardButton"+which
            }
          });
          tracker.trackEvent("Click", `Sucessefully ${which}`);
          console.log("what we are setting card to ", currentObj);
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

  setModalVisible = (visible, which) =>
    this.setState({ modalVisible: visible, which });

  render() {
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
        <LostCardHeader />
        <LostCardSection
          cardStatus={this.state.cardStatus}
          cardMessage={this.state.cardMessage}
          cardButtonLoading={this.state.cardButtonLoading}
          toggleStatusCard={this.toggleStatusCard}
          asurite={this.state.asurite}
          setModalVisible={this.setModalVisible}
        />
        <MealPlansModal
          modalVisible={this.state.modalVisible}
          setModalVisible={this.setModalVisible}
          toggleStatusCard={this.toggleStatusCard}
          card={this.state.card}
          cardStatus={this.state.cardStatus}
          message={this.state.cardMessage}
          cardButtonLoading={this.state.cardButtonLoading}
        />
        {setBackgroundDark}
      </ScrollView>
    );
  }
}

LostCard.contextTypes = {
  getTokens: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgb(227, 226, 226)",
    height: "100%"
  }
});
