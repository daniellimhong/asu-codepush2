import React, { useState, useEffect } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import Image from "react-native-image-progress";
import {
  responsiveFontSize,
  responsiveHeight
} from "react-native-responsive-dimensions";

import { DefaultText as Text } from "../../../presentational/DefaultText";
import { tracker } from "../../../achievement/google-analytics";
import Card from "../../../universal/card";
import CardSection from "../../../universal/card-section";
import { Api } from "../../../../services";
import { SettingsContext } from "../../../achievement/Settings/Settings";
import {
  handleClick,
  viewTicket,
  claimTicket,
  buyTicket,
  disabledCheck,
  freeTicketsExist,
  btnClaimTicketStyle,
  flatten
} from "./utility";

function LearnMoreButton(props) {
  const learnMore = () => {
    const { eventDetails } = props;
    props.sendAnalytics({
      "action-type": "click",
      "starting-screen": "365-community-union",
      "starting-section": "event-card", 
      "target":"CommunityUnion LearnMore-"+eventDetails.title.S,
      "resulting-screen": "ticket",
      "resulting-section": "buy-tickets",
      "target-id": eventDetails.id.S,
      "action-metadata":{
        "target-id": eventDetails.id.S,
        "is-student": true,
        "details":eventDetails,
        "event-id": eventDetails.id.S,
        "title":eventDetails.title.S,
      }
    });
    
    tracker.trackEvent(
      "Click",
      `Pressed Learn More Button for: ${eventDetails.title.S}`
    );
    handleClick(eventDetails.learnurl.S);
  };

  return (
    <Button
      accessibilityRole="button"
      buttonStyle={styles.btnLearnMore}
      borderRadius={50}
      backgroundColor="white"
      color="#666666"
      fontWeight="bold"
      fontFamily="Roboto"
      fontSize={responsiveFontSize(1.1)}
      title="LEARN MORE"
      onPress={() => learnMore()}
    />
  );
}

/**
 * Ticket button component
 */
const TicketButton = props => {
  const { eventDetails, isStudent, getTokens } = props;
  // const [loading, setLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claimed, setClaimed] = useState(false);
  const [buttonText, setButtonText] = useState();

  useEffect(() => {
    update();
  }, []);

  const checkIfTicketClaimed = async _eventDetails => {
    let ticketClaimed = false;
    if (_eventDetails) {
      await getTokens().then(async tokens => {
        if (tokens.username && tokens.username !== "guest") {
          const payload = { eventId: _eventDetails.id };
          const apiService = new Api(
            "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
            tokens
          );
          try {
            await apiService.post("/365-claim-ticket", payload).then(res => {
              if (res) {
                ticketClaimed = true;
                setClaimed(true);
              }
            });
          } catch (e) {
            console.log(e);
          }
        }
      });
    }
    return ticketClaimed;
  };

  const update = async () => {
    const isClaimed = await checkIfTicketClaimed(flatten(eventDetails));
    setClaimed(isClaimed);
    determineText(isClaimed);
  };

  const determineText = async isClaimed => {
    const eventRole = eventDetails.role.S;
    if (isClaimed) {
      setButtonText("VIEW TICKET");
    } else {
      const freeTickets = await freeTicketsExist(eventDetails);
      if (isStudent && freeTickets && eventRole === "student") {
        setButtonText("CLAIM TICKET");
      } else if (eventRole === "all" && freeTickets) {
        setButtonText("CLAIM TICKET");
      } else {
        setButtonText("BUY TICKET");
      }
    }
    setLoading(false);
  };

  const onPressTicketButton = async () => {
    const eventRole = eventDetails.role.S;
    // setLoading(true);
    const isClaimed = await checkIfTicketClaimed(flatten(eventDetails));
    if (isClaimed) {
      viewTicket(props);
      setButtonText("VIEW TICKET");
    } else {
      const freeTickets = await freeTicketsExist(eventDetails);
      if (isStudent && freeTickets && eventRole === "student") {
        claimTicket(props, setClaimed);
        setButtonText("VIEW TICKET");
      } else if (eventRole === "all" && freeTickets) {
        claimTicket(props, setClaimed);
        setButtonText("VIEW TICKET");
      } else {
        buyTicket(props);
      }
    }
    // setLoading(false);
  };

  return (
    <Button
      accessibilityRole="button"
      disabled={disabledCheck(claimed, eventDetails)}
      buttonStyle={btnClaimTicketStyle()}
      borderRadius={50}
      backgroundColor="maroon"
      fontWeight="bold"
      fontFamily="Roboto"
      fontSize={responsiveFontSize(1.1)}
      title={buttonText}
      loading={loading}
      onPress={() => onPressTicketButton()}
    />
  );
};

export default function EventCard(props) {
  const { eventDetails } = props;

  return (
    <SettingsContext.Consumer>
      {settings => (
        <View style={styles.card}>
          <Card>
            <CardSection>
              <View style={styles.happeningNowSection}>
                <View style={styles.happeningNowHeader}>
                  <Text style={styles.happeningNowText}>
                    {eventDetails.title.S}
                  </Text>
                </View>

                <View style={styles.happeningNowBody}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: eventDetails.posterimage.S }}
                      style={styles.eventPoster}
                      resizeMode="contain"
                      indicatorProps={{
                        size: "large",
                        color: "maroon"
                      }}
                    />
                  </View>

                  <View style={styles.eventInfo}>
                    <View style={styles.eventInfoText}>
                      <Text style={styles.eventDetailsTop}>
                        {eventDetails.date.S}
                      </Text>
                      <Text style={styles.eventDetails}>
                        {eventDetails.time.S}
                      </Text>
                      <Text style={styles.eventDetails}>
                        {eventDetails.location.S}
                      </Text>
                    </View>

                    <View style={styles.buttons}>
                      <LearnMoreButton {...props} />
                      <TicketButton {...props} getTokens={settings.getTokens} />
                    </View>
                  </View>
                </View>
              </View>
            </CardSection>
          </Card>
        </View>
      )}
    </SettingsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: "3%"
  },
  happeningNowSection: {
    display: "flex",
    flex: 1,
    padding: 20
  },
  happeningNowHeader: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#E7E7E7",
    marginBottom: 20
  },
  happeningNowText: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontSize: 18,
    paddingBottom: 10,
    paddingLeft: "2%",
    backgroundColor: "rgba(0,0,0,0)"
  },
  happeningNowBody: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "100%"
  },
  eventPoster: {
    flex: 1,
    width: "100%",
    height: "100%",
    maxWidth: 150
  },
  eventInfo: {
    flex: 1,
    width: "100%",
    paddingLeft: Dimensions.get("window").width <= 320 ? 0 : 10
  },
  eventInfoText: {
    flex: 2
  },
  eventDetails: {
    marginTop: 10
  },
  buttons: {
    display: "flex",
    flex: 1
  },
  cardSection: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    backgroundColor: "black"
  },

  descriptionContainer: {
    justifyContent: "flex-end",
    flex: 1,
    paddingBottom: 20
  },
  descriptionTop: {
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 140,
    marginLeft: Dimensions.get("window").width <= 320 ? 20 : 0
  },
  btnLearnMore: {
    flex: 1,
    paddingVertical: 0,
    marginTop: responsiveHeight(1.5),
    borderWidth: 1,
    borderColor: "black",
    width: "100%",
    height: Dimensions.get("window").width <= 320 ? "100%" : 36
  }
});
