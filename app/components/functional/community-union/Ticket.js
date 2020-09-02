import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image } from "react-native";
import QRCode from "react-native-qrcode";
import PropTypes from "prop-types";

import TransitionView from "../../universal/TransitionView";
import { DefaultText as Text } from "../../presentational/DefaultText";
import { tracker } from "../../achievement/google-analytics";
import { AppSyncComponent } from "../authentication/auth_components/appsync/AppSyncApp";
import { claimTicket } from "../../../Queries/TicketQueries";
import { flatten } from "./EventCard/utility";
import { SettingsContext } from "../../achievement/Settings/Settings";
import { Api } from "../../../services";

/**
 * Determine what renders on the tickets page and show
 * either a QR Code or an error message.
 * @param {*} props
 */
function TicketContent(props) {
  const [details, setDetails] = useState();
  const [QRContent, setQRContent] = useState();
  const { navigation, sendAnalytics, user, getTokens, claimTicket } = props;

  // Get event info on start
  useEffect(() => {
    const { eventDetails } = navigation.state.params;
    buildQRDetails(eventDetails);
  }, []);

  // Generate the QR Code area content based on the event and ticket status.
  useEffect(() => {
    determineQRContent();
  }, [details]);

  // Flatten the dynamo object and store it in the state.
  const buildQRDetails = async eventDetails => {
    const flatDetails = flatten(eventDetails);
    setDetails(flatDetails);
  };

  const checkIfTicketClaimed = async eventDetails => {
    let ticketClaimed = false;
    if (eventDetails) {
      await getTokens().then(tokens => {
        if (tokens.username && tokens.username !== "guest") {
          const payload = { eventId: eventDetails.id };
          const apiService = new Api(
            "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
            tokens
          );
          try {
            apiService.post("/365-claim-ticket", payload).then(res => {
              if (res) ticketClaimed = true;
            });
          } catch (e) {
            console.log(e);
          }
        }
      });
    }
    return ticketClaimed;
  };

  // Set the QR Code OR attempt to claim a ticket.
  const determineQRContent = async () => {
    const claimed = await checkIfTicketClaimed(details);
    if (claimed) {
      setQRContent(qr);
    } else if (details) {
      const currentTime = new Date();
      const now = String(currentTime.getTime());
      claimTicket({
        asurite: user,
        eventName: details.title,
        timeStamp: now,
        scanner: false,
        eventid: details.id
      })
        .then(res => {
          const { action } = res.data.claimTicket;
          branchContentOnAction(action, now);
        })
        .catch(err => console.log("error 2: ", err));
      analytics();
    }
  };

  // Based on the action returned by claim ticket set QRContent
  const branchContentOnAction = action => {
    switch (action) {
      case "fail":
        setQRContent(soldOut);
        break;
      case "buy":
        setQRContent(noFreeTickets);
        break;
      case "free":
        setQRContent(qr);
        break;
      default:
        console.log("No valid action");
        break;
    }
  };

  // handling of analytics
  const analytics = () => {
    sendAnalytics({
      "action-type": "view",
      "starting-screen": "365-community-union",
      "starting-section": null, 
      "target":"Ticket QR Code Ticket",
      "resulting-screen": "ticket",
      "resulting-section": null,
      "target-id":details.id,
      "action-metadata":{
        "target-id":details.id,
      }
    });
    tracker.trackEvent("View", "CommunityUnion");
  };

  // To be rendered when no more tickets are to be sold.
  const soldOut = () => (
    <Text>Sorry, all tickets are sold out for this event.</Text>
  );

  // To be rendered when free tickets are out but purchasing is an option
  const noFreeTickets = () => (
    <Text>
      Sorry, all free tickets have been claimed for this event. Please refresh
      the app to buy a ticket.
    </Text>
  );

  // To be rendered when the user has successfully claimed a ticket.
  const qr = () => (
    <>
      <TransitionView duration={1500}>
        <QRCode
          value={`${user} - ${details.secret}`}
          size={200}
          bgColor="black"
          fgColor="white"
        />
      </TransitionView>
      <TransitionView>
        <Text style={styles.instructions}>{details.instructions}</Text>
      </TransitionView>
    </>
  );

  if (!details) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.eventImage}
          source={{ uri: details.headerimage }}
        />
        <View style={styles.scrim} />
        <View style={styles.descriptionContainer}>
          <Text style={styles.eventTitle}>{details.title}</Text>
          <Text style={styles.eventDescription}>{details.date}</Text>
          <Text style={styles.eventDescription}>{details.time}</Text>
          <Text style={styles.eventLocation}>{details.location}</Text>
        </View>
      </View>

      <View style={styles.ticketStatusContainer}>{QRContent}</View>
    </View>
  );
}

TicketContent.contextTypes = {
  getTokens: PropTypes.func
};

const TicketAAS = AppSyncComponent(TicketContent, claimTicket);

export default function Ticket(props) {
  return (
    <SettingsContext.Consumer>
      {settings => (
        <TicketAAS
          {...props}
          user={settings.user}
          getTokens={settings.getTokens}
          sendAnalytics={settings.sendAnalytics}
        />
      )}
    </SettingsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center"
  },
  ticketStatusContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  descriptionContainer: {
    position: "absolute",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 10
  },
  QRCode: {
    overflow: "hidden",
    minHeight: 200
  },
  eventImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: -2
  },
  scrim: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: -2,
    backgroundColor: "rgba(0, 0, 0, 0.4)"
  },
  eventTitle: {
    textAlign: "center",
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0)",
    fontSize: 40,
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  eventDescription: {
    textAlign: "center",
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0)",
    fontSize: 20
  },
  eventLocation: {
    textAlign: "center",
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0)",
    fontSize: 16,
    paddingTop: 10
  },
  instructions: {
    padding: 20
  }
});
