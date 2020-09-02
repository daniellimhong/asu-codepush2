import React, {useRef} from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ImageBackground
} from "react-native";
import moment from "moment";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { DefaultText as Text } from "../../presentational/DefaultText";
import {
  generateEventSummary,
  mapEventToCard,
  large,
  getStringDate,
  formatRawEvent
} from "./utility";
import Analytics from "../analytics";

/**
 * Component to Preview events in the event feed.
 *
 * Has two sizes, Full & Half that depend on the event item's index or minify prop
 * @param {*} props
 */
function EventPreview(props) {
  const {
    navigation,
    itemIndex,
    minify,
    data,
    previousScreen,
    previousSection,
    data: { locations, event_type, start_date, end_date, image_url }
  } = props;
  let inputRef = useRef(null);
  const stringDate = getStringDate(data);
  const location = locations && locations[0] ? locations[0] : null;
  const title = data.title && data.title[0] ? data.title[0] : null;
  const summary = generateEventSummary(data);
  const extraAccessibilityLabel = `${moment(
    start_date[0],
    "MMMDDYYYYhma"
  ).format("dddd MMM Do @ h:mm a")} to ${moment(
    end_date[0],
    "MMMDDYYYYhma"
  ).format("h:mm a")}. Location: ${location}`;

  /**
   * On Press, format the data and navigate to the CFCard component
   */
  const pressHandler = () => {
    let newData = formatRawEvent(data);
    const additionalData = mapEventToCard(data);
    newData = { ...additionalData, ...newData };
    const footerInsert = <ButtonInsert event={newData} />;
    inputRef.current.sendData({
      "action-type": "click",
      "starting-screen": previousScreen?previousScreen:"events",
      "starting-section": previousSection?previousSection:null, 
      "target":"Event Preview",
      "resulting-screen": "core-feature-card",
      "resulting-section": "event-details",
      "target-id": data.id?data.id.toString():"-1",
      "action-metadata": {
        "target-id": data.id?data.id.toString():"-1",
        "title": title?title:JSON.stringify(data),
      }
    });
    navigation.navigate("Card", {
      navigation,
      data: newData,
      footer: footerInsert,
      previousScreen:"events",
      previousSection:null,
      target: "Event Card",
    });
  };

  /**
   * Tag overlays the preview to let users know this is a club event
   */
  const clubTag =
    event_type === "orgsync" ? (
      <View style={styles.clubTagStyle}>
        <Text style={styles.clubTagTextStyle}>CLUB EVENT</Text>
      </View>
    ) : null;

  /**
   * Contains the time of the event
   */
  const dateLine = stringDate ? (
    <View>
      <Text style={styles.stringDateText}>{stringDate}</Text>
    </View>
  ) : null;

  /**
   * Combines both the time and location of the event
   */
  const dateLocationTag = (
    <View style={styles.dateLocation}>
      {dateLine}
      {large(itemIndex) ? (
        <Location location={location} pressHandler={pressHandler} />
      ) : null}
    </View>
  );

  const imageTag = (
    <Text
      style={large(itemIndex) ? styles.inStyle : styles.smallStyle}
      accessible
      accessibilityRole="button"
    >
      {moment(start_date[0], "MMMDDYYYYhma").format("dddd MMM Do")}
    </Text>
  );

  const fullPreview = (
    <View>
      <ImageBackground
        source={{ uri: image_url[0] }}
        style={styles.fullPreviewBgImage}
        blurRadius={9}
        resizeMethod="resize"
      >
        <ImageBackground
          source={{ uri: image_url[0] }}
          style={styles.fullPreviewForegroundImage}
          resizeMethod="resize"
        >
          {clubTag}
        </ImageBackground>
      </ImageBackground>
      <View style={styles.previewTextContainer}>
        <View>
          <Text style={styles.itemTitle}>
            {data.title && data.title[0] && data.title[0].length > 75
              ? `${data.title.slice(0, 75)}...`
              : data.title}
          </Text>
        </View>
        <RenderClubRow data={data} />
        {dateLocationTag}
        <Text style={styles.fullPreviewSummary} numberOfLines={5}>
          {summary}
        </Text>
      </View>
    </View>
  );

  const halfPreview = (
    <View style={[{ flexDirection: "row" }, styles.previewTextContainer]}>
      <View style={{ width: responsiveWidth(50) }}>
        {imageTag}
        <Text style={styles.smallItemTitle}>
          {data.title && data.title[0] && data.title[0].length > 75
            ? `${data.title.slice(0, 75)}...`
            : data.title}
        </Text>
        {dateLocationTag}
      </View>
      <View
        style={{
          flex: 1,
          alignItems: "flex-end"
        }}
      >
        <ImageBackground
          source={{ uri: image_url[0] }}
          style={styles.halfPreviewImage}
          resizeMethod="resize"
        >
          {clubTag}
        </ImageBackground>
      </View>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={pressHandler}
      accessibilityLabel={`${title}. ${extraAccessibilityLabel}. ${summary}`}
      accessibilityRole="button"
    >
      <Analytics ref={inputRef} />
      <View
        style={itemIndex !== 0 ? styles.fullContainer : styles.topContainer}
      >
        {!minify && itemIndex % 5 === 0 ? fullPreview : halfPreview}
      </View>
    </TouchableOpacity>
  );
}

function RenderClubRow(props) {
  const { data } = props;
  if (data.event_type === "orgsync") {
    return (
      <TouchableOpacity
        onPress={() => {
          Linking.openURL(
            data.organization_website_url
              ? data.organization_website_url
              : "https://www.asu.edu"
          );
        }}
        accessibilityRole="link"
      >
        <View style={styles.clubRow}>
          <Text style={{ color: "#990033" }}>{data.organization_name}</Text>
        </View>
      </TouchableOpacity>
    );
  } else {
    return null;
  }
}

function Location(props) {
  const { location, pressHandler } = props;
  if (
    !location ||
    location === "No location has been entered for this event."
  ) {
    return null;
  }

  if (location.indexOf("http") !== -1) {
    return (
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(location);
          }}
        >
          <Text style={{ fontWeight: "400", fontFamily: 'Roboto',color: "#990033" }}>Online</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    return (
      <TouchableOpacity onPress={() => pressHandler()}>
        <View>
          <Text style={{ fontWeight: "400", fontFamily: 'Roboto', }}>
            {location && location.length > 50
              ? `${location.slice(0, 50)}...`
              : location}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

function ButtonInsert(props) {
  const { event } = props;
  if (!event.url) {
    return null;
  }
  return (
    <View style={{ flexDirection: "row", padding: responsiveWidth(3) }}>
      <View
        style={{
          flex: 1,
          alignItems: "flex-start",
          justifyContent: "center"
        }}
      >
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(event.url ? event.url : "https://www.asu.edu");
          }}
          accessibilityRole="button"
        >
          <View style={styles.buttonInsertButton}>
            <Text style={styles.buttonInsertText}>MORE INFO</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * =====
 * Utils
 * =====
 */

const styles = StyleSheet.create({
  buttonInsertButton: {
    justifyContent: "center",
    backgroundColor: "#D40546",
    height: responsiveHeight(7),
    width: responsiveWidth(35)
  },
  buttonInsertText: {
    fontSize: responsiveFontSize(2),
    textAlign: "center",
    color: "white"
  },
  halfPreviewImage: {
    width: responsiveWidth(38),
    height: responsiveWidth(30)
  },
  fullPreviewSummary: {
    fontSize: 16,
    marginBottom: 10,
    color: "#575757",
    lineHeight: 24
  },
  fullPreviewForegroundImage: {
    width: responsiveWidth(67),
    height: responsiveHeight(24)
  },
  fullPreviewBgImage: {
    width: responsiveWidth(95),
    marginHorizontal: responsiveWidth(2.5),
    height: responsiveHeight(24),
    alignItems: "center"
  },
  dateLocation: { marginBottom: 10 },
  stringDateText: { color: "#990033" },
  clubTagTextStyle: { color: "white", fontSize: responsiveFontSize(1.2) },
  clubTagStyle: {
    height: responsiveHeight(2),
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#363636",
    left: 0,
    top: 0,
    position: "absolute"
  },
  inStyle: {
    backgroundColor: "#931E42",
    position: "absolute",
    color: "white",
    fontWeight: "bold",
    bottom: 0,
    paddingVertical: 2,
    paddingHorizontal: 5,
    margin: 20,
    fontFamily: "Roboto"
  },
  smallStyle: {
    backgroundColor: "#931E42",
    alignSelf: "flex-start",
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    fontFamily: "Roboto"
  },
  itemTitle: {
    fontSize: 25,
    fontWeight: "900",
    fontFamily: 'Roboto',
    marginBottom: 10,
    backgroundColor: "rgba(0,0,0,0)",
    color: "black"
  },
  smallItemTitle: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: "900",
    fontFamily: 'Roboto',
    backgroundColor: "rgba(0,0,0,0)",
    color: "black"
  },
  previewTextContainer: {
    padding: 15
  },
  topContainer: {
    borderBottomColor: "#D3D3D3",
    borderBottomWidth: 1,
    backgroundColor: "white"
  },
  fullContainer: {
    borderBottomColor: "#D3D3D3",
    borderBottomWidth: 1,
    backgroundColor: "white"
  },
  clubRow: {
    flexDirection: "row",
    marginBottom: responsiveHeight(1)
  }
});

export default EventPreview;
