import { Dimensions, Linking } from "react-native";
import { responsiveHeight } from "react-native-responsive-dimensions";

import { tracker } from "../../../achievement/google-analytics";

/**
 * If dynamo attributes are being returned, we can use this fucntion to
 * drop the attribute types and flatten the objects out a bit.
 * @param {*} obj
 */
export function flatten(obj) {
  const o = { ...obj };
  const descriptors = ["L", "M", "N", "S", "BOOL"];
  // flattens single property objects that have descriptors
  for (const d of descriptors) {
    if (o.hasOwnProperty(d)) {
      return o[d];
    }
  }

  Object.keys(o).forEach(k => {
    for (const d of descriptors) {
      if (o[k].hasOwnProperty(d)) {
        o[k] = o[k][d];
      }
    }
    if (Array.isArray(o[k])) {
      o[k] = o[k].map(e => flatten(e));
    } else if (typeof o[k] === "object") {
      o[k] = flatten(o[k]);
    }
  });

  return o;
}

export async function freeTicketsExist(eventDetails) {
  if (
    eventDetails.freeTicketCapReached &&
    eventDetails.freeTicketCapReached.BOOL === false
  ) {
    return true;
  }
  return false;
}

/**
 * Check to see whether the Ticket button must be disabled.
 *
 * @param {*} claimed
 * @param {*} eventDetails
 */
export function disabledCheck(claimed, eventDetails) {
  const disabled = !eventDetails.claimable.BOOL;

  if (!claimed && disabled) {
    return true;
  }
  return false;
}

/**
 * Buy the ticket branching on student status to determine the end URL
 * @param {*} props
 */
export function buyTicket(props) {
  const { isStudent, eventDetails } = props;
  props.sendAnalytics({
    "action-type": "click",
    "starting-screen": "365-community-union",
    "starting-section": "event-card", 
    "target":"Claim Ticket",
    "resulting-screen": "external-browser",
    "resulting-section": null,
    "action-metadata":{
      "event-id": eventDetails.id.S,
      "title":eventDetails.title.S,
    }
  });
  tracker.trackEvent(
    "Click",
    `Pressed Ticket Button for: ${eventDetails.title.S}`
  );

  if (isStudent) {
    handleClick(eventDetails.studentAltURL.S);
  } else {
    handleClick(eventDetails.ticketurl.S);
  }
}

/**
 * Claim a free ticket
 *
 * @param {*} props
 * @param {*} setClaimed
 */
export function claimTicket(props, setClaimed) {
  const { navigation, eventDetails } = props;
  setClaimed(true);
  navigation.navigate("Ticket", { eventDetails });
}

/**
 * View an already claimed free ticket
 * @param {*} props
 */
export function viewTicket(props) {
  const { navigation, eventDetails } = props;
  navigation.navigate("Ticket", { eventDetails });
}

/**
 * Link to the provided URL
 * @param {*} url
 */
export function handleClick(url) {
  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url);
    } else {
      console.log(`ERROR: Don't know how to open URI: ${url}`);
    }
  });
}

/**
 * Determine the button style on the event card based on the dimensions
 */
export function btnClaimTicketStyle() {
  if (Dimensions.get("window").width <= 320) {
    return {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      marginTop: responsiveHeight(1.5),
      width: "100%"
    };
  } else {
    return {
      flex: 1,
      marginTop: responsiveHeight(1.5),
      width: "100%",
      height: Dimensions.get("window").width <= 320 ? "100%" : 36
    };
  }
}
