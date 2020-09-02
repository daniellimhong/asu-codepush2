import React from "react";
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Linking,
  ImageBackground
} from "react-native";
import moment from "moment";
import moment2 from "moment-timezone";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { DefaultText as Text } from "../../presentational/DefaultText";
import {
  generateEventSummary,
  generateEventKey,
  formatRawEvent
} from "./utility";
import Analytics from "../analytics";

export default class EventPreview extends React.PureComponent {
  static defaultProps = {
    data: {},
    minify: false
  };

  renderStringDate = stringDate => {
    if (stringDate) {
      return (
        <TouchableWithoutFeedback onPress={() => this.pressHandler()}>
          <View>
            <Text style={{ color: "#990033" }}>{stringDate}</Text>
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      return null;
    }
  };

  large = index => {
    return index % 5 === 0;
  };

  /**
   * Render tags over image
   */
  imageTag(data) {
    const { itemIndex, minify } = this.props;
    return (
      <Text
        style={
          this.large(itemIndex) && !minify ? styles.inStyle : styles.smallStyle
        }
        accessible
        accessibilityRole="button"
      >
        {moment(data.start_date[0], "MMMDDYYYYhma").format("dddd MMM Do")}
      </Text>
    );
  }

  pressHandler() {
    const { navigation, data } = this.props;
    let newData = formatRawEvent(data);
    const additionalData = mapEventToCard(data);
    newData = { ...additionalData, ...newData };
    const footerInsert = <ButtonInsert event={newData} />;
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": this.props.previousScreen?this.props.previousScreen:null,
      "starting-section": this.props.previousSection?this.props.previousSection:null,
      "target":"Event Preview",
      "resulting-screen": "core-feature-card",
      "resulting-section": "event-details",
      "target-id": data.nid?data.nid.toString():"-1",
      "action-metadata": {
        "target-id": data.nid?data.nid.toString():"-1",
        "title": data.title && data.title[0] ? data.title[0]:JSON.stringify(this.props.data)
      }
    });
    
    navigation.navigate("Card", {
      previousScreen:this.props.previousScreen,
      previousSection:this.props.previousSection,
      target: "Event Card",
      navigation,
      data: newData,
      footer: footerInsert
    });
  }

  renderClubTag() {
    try {
      const { data } = this.props;
      if (data.event_type === "orgsync") {
        return (
          <View
            style={{
              height: responsiveHeight(2),
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#363636",
              left: 0,
              top: 0,
              position: "absolute"
            }}
          >
            <Text style={{ color: "white", fontSize: responsiveFontSize(1.2) }}>
              CLUB EVENT
            </Text>
          </View>
        );
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  }

  /**
   * Render tags beneath title
   */
  renderTag(data) {
    const { itemIndex } = this.props;
    const startTime = moment(data.start_date[0], "MMMDDYYYYhma");
    const eventTimeASU = startTime;
    const eventUTC = moment.utc(eventTimeASU);
    const eventLocal = eventUTC.local();

    const endTime = moment(data.end_date[0], "MMMDDYYYYhma");
    const eventEndUTC = moment.utc(endTime);
    const eventEndLocal = eventEndUTC.local();

    let zone1 = moment2.tz.guess();
    zone1 = moment2.tz(zone1).format("z");

    let stringDate = "";
    // if there is no specific time do not display 12:00 am display just date instead
    if (startTime.format("h:mm a") === "12:00 am") {
      stringDate = "";
    } else if (endTime.format("h:mm a") === "") {
      stringDate = `${moment(eventLocal).format("h:mm a")} ${zone1}`;
    } else {
      zone1 = zone1[0] !== "-" ? zone1 : "MST";
      stringDate = `${moment(eventLocal).format("h:mm a")} ${zone1} - ${moment(
        eventEndLocal
      ).format("h:mm a")} ${zone1}`;
    }
    return (
      <View style={{ marginBottom: 10 }} accessible accessibilityRole="button">
        {this.renderStringDate(stringDate)}
        {this.large(itemIndex) ? this.renderLocation(data) : null}
      </View>
    );
  }

  renderLocation(data) {
    const location =
      data.locations && data.locations[0] ? data.locations[0] : null;
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
            <Text style={{ fontWeight: "400", fontFamily: 'Roboto', color: "#990033" }}>Online</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <TouchableWithoutFeedback onPress={() => this.pressHandler()}>
          <View>
            <Text style={{ fontWeight: "400", fontFamily: 'Roboto', }}>
              {location && location.length > 50
                ? `${location.slice(0, 50)}...`
                : location}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      );
    }
  }

  render() {
    const { data, itemIndex, minify } = this.props;
    const location =
      data.locations && data.locations[0] ? data.locations[0] : null;
    const title = data.title && data.title[0] ? data.title[0] : null;
    const summary = generateEventSummary(data);

    const extraAccessibilityLabel = `${moment(
      data.start_date[0],
      "MMMDDYYYYhma"
    ).format("dddd MMM Do @ h:mm a")} to ${moment(
      data.end_date[0],
      "MMMDDYYYYhma"
    ).format("h:mm a")}. Location: ${location}`;

    if (!minify && itemIndex % 5 === 0) {
      return (
        <TouchableWithoutFeedback
          onPress={() => this.pressHandler()}
          accessible={false}
          accessibilityLabel={`${title}.${extraAccessibilityLabel}.${summary}`}
          accessibilityRole="button"
        >
          <View
            style={itemIndex !== 0 ? styles.fullContainer : styles.topContainer}
          >
            <View>
              <View>
                <Analytics ref="analytics" />
                <TouchableWithoutFeedback
                  onPress={() => this.pressHandler()}
                  accessible={false}
                  accessibilityLabel={`Title image. ${title}`}
                  accessibilityRole="button"
                >
                  <View>
                    <ImageBackground
                      source={{ uri: data.image_url[0] }}
                      defaultSource={require("../../achievement/assets/placeholder.png")}
                      style={{
                        width: responsiveWidth(95),
                        marginHorizontal: responsiveWidth(2.5),
                        height: responsiveHeight(24),
                        alignItems: "center"
                      }}
                      blurRadius={9}
                      resizeMethod="resize"
                    >
                      <ImageBackground
                        source={{ uri: data.image_url[0] }}
                        defaultSource={require("../../achievement/assets/placeholder.png")}
                        style={{
                          width: responsiveWidth(67),
                          height: responsiveHeight(24)
                        }}
                        resizeMethod="resize"
                      >
                        {this.renderClubTag()}
                      </ImageBackground>
                    </ImageBackground>
                  </View>
                </TouchableWithoutFeedback>
                {this.imageTag(data)}
              </View>

              <View style={styles.previewTextContainer}>
                <View>
                  <Text style={styles.itemTitle}>
                    {data.title && data.title[0] && data.title[0].length > 75
                      ? `${data.title.slice(0, 75)}...`
                      : data.title}
                  </Text>
                </View>
                <RenderClubRow data={data} />
                <View>{this.renderTag(data)}</View>
                <TouchableWithoutFeedback onPress={() => this.pressHandler()}>
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        marginBottom: 10,
                        color: "#575757",
                        lineHeight: 24
                      }}
                      numberOfLines={5}
                    >
                      {summary}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      return (
        <TouchableWithoutFeedback
          onPress={() => this.pressHandler()}
          accessible={false}
          accessibilityLabel={`${title}.${extraAccessibilityLabel}.${summary}`}
          accessibilityRole="button"
        >
          <View style={styles.fullContainer}>
            <View>
              <View
                style={[{ flexDirection: "row" }, styles.previewTextContainer]}
              >
                <Analytics ref="analytics" />
                <View style={{ width: responsiveWidth(50) }}>
                  {this.imageTag(data)}
                  <Text style={styles.smallItemTitle}>
                    {data.title && data.title[0] && data.title[0].length > 75
                      ? `${data.title.slice(0, 75)}...`
                      : data.title}
                  </Text>
                  <View>{this.renderTag(data)}</View>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: "flex-end"
                  }}
                >
                  <TouchableWithoutFeedback
                    onPress={() => this.pressHandler()}
                    accessible={false}
                    accessibilityLabel={`Title image. ${title}`}
                    accessibilityRole="button"
                  >
                    <ImageBackground
                      source={{ uri: data.image_url[0] }}
                      defaultSource={require("../../achievement/assets/placeholder.png")}
                      style={{
                        width: responsiveWidth(38),
                        height: responsiveWidth(30)
                      }}
                      resizeMethod="resize"
                    >
                      {this.renderClubTag()}
                    </ImageBackground>
                    {/* </ImageBackground> */}
                  </TouchableWithoutFeedback>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    }
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
          <View
            style={{
              justifyContent: "center",
              backgroundColor: "#D40546",
              height: responsiveHeight(7),
              width: responsiveWidth(35)
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2),
                textAlign: "center",
                color: "white"
              }}
            >
              MORE INFO
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
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

const styles = StyleSheet.create({
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

function mapEventToCard(event) {
  return {
    key: generateEventKey(event),
    feed_type: "event",
    title: event.title && event.title[0] ? event.title[0] : null,
    nid: event.nid && event.nid[0] ? event.nid[0] : null,
    start_date:
      event.start_date && event.start_date[0]
        ? moment(event.start_date[0], "MMMDDYYYYhma").format("dddd Do")
        : null
  };
}
