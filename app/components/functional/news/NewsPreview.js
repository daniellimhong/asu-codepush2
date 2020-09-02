import React from "react";
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Linking,
  ImageBackground
} from "react-native";
import { DefaultText as Text } from "../../presentational/DefaultText";
import { TagColorMap } from "../../../services";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Analytics from "../analytics";
import { tracker } from "../../achievement/google-analytics";
import moment from "moment";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

export class NewsPreview extends React.PureComponent {
  static defaultProps = {
    data: {}
  };

  /**
   * Render tags over image
   */
  imageTag() {
    let { data } = this.props;
    let inStyle = {
      backgroundColor:
        TagColorMap[
          data.category ? data.category.toLowerCase() : "rgba(0,0,0,0)"
        ],
      position: "absolute",
      bottom: 0,
      paddingVertical: 2,
      paddingHorizontal: 5,
      margin: 20
    };

    let smallStyle = {
      backgroundColor:
        TagColorMap[
          data.category ? data.category.toLowerCase() : "rgba(0,0,0,0)"
        ],
      alignSelf: "flex-start",
      color: "white",
      fontWeight: "bold",
      fontFamily: "Roboto",
      marginBottom: 10,
      paddingVertical: 2,
      paddingHorizontal: 8
    };

    return (
      <View style={this.large(this.props.itemIndex) ? inStyle : smallStyle}>
        <Text
          style={{
            backgroundColor: "rgba(0,0,0,0)",
            color: "white",
            fontWeight: "bold",
            fontFamily: "Roboto"
          }}
          accessibilityLabel={`Category: ${data.category}`}
        >
          {data.category}
        </Text>
      </View>
    );
  }

  large = index => {
    return index % 5 === 0;
  };

  renderLocation(location) {
    if (location == "No location has been entered for this event.") {
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
                ? location.slice(0, 50) + "..."
                : location}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      );
    }
  }

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

  /**
   * Render tags beneath title
   */
  renderTag() {
    let interests = this.props.data.interests;
    let inter = null;
    if (interests) {
      inter = this.props.data.interests.split(",")[0];
    }

    let time = moment(this.props.data.rawDate).fromNow(true);
    if (!interests) {
      return (
        <View style={{ alignSelf: "flex-start", padding: 3, marginBottom: 10 }}>
          <Text style={{ color: "#000" }}>{time}</Text>
        </View>
      );
    } else {
      return (
        <View style={{ alignSelf: "flex-start", padding: 3, marginBottom: 10 }}>
          <TouchableWithoutFeedback
            onPress={() => this.pressHandler()}
            accessibilityRole="button"
          >
            <View>
              <Text style={{ color: "#A9A9A9" }}>
                <Text style={{ color: "#990033" }}>{inter}</Text> | {time} ago
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      );
    }
  }

  searchedAdresses(searchedText) {
    return fetch(
      `https://api.concept3d.com/search?map=120&key=fde41084dc57952320ce083606e77533&q=${searchedText}&ppage=5`
    ).then(response => {
      return response.json();
    });
  }

  /**
   * Callback that will allow buttons to be rendered in the
   * individual Events items
   */
  buttonInsert(event) {
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
        <View
          style={{ flex: 1, alignItems: "flex-end", justifyContent: "center" }}
        />
      </View>
    );
  }

  headerInsert(event) {
    return null;
  }

  pressHandler() {
    const { navigation } = this.props;
    tracker.trackEvent(
      "Click",
      `NewsPreview_item - key: ${this.props.data.key}`
    );
    let headerInsert = this.headerInsert(this.props.data);
    let footerInsert = this.buttonInsert(this.props.data);
    let locationInsert = null;
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": this.props.previousScreen?this.props.previousScreen:null,
      "starting-section": "news-list", 
      "target":"News Preview",
      "resulting-screen": "core-feature-card",
      "resulting-section": "news-details",
      "target-id":this.props.data.url.replace("https://",""),
      "action-metadata": {
        "target-id":this.props.data.url.replace("https://",""),
        "title":this.props.data.title,
      }
    });
    this.props.navigation.navigate("Card", {
      data: this.props.data,
      navigation: navigation,
      location: locationInsert,
      header: headerInsert,
      footer: footerInsert,
      previousScreen:this.props.previousScreen,
      previousSection:"news-list",
      target: "News Card",
    });
  }

  render() {
    let { data, itemIndex } = this.props;
    let extraAccessibilityLabel = `${data.interests.split(",")[0]}. ${moment(
      data.rawDate
    ).fromNow(true)} ago`;
    if (itemIndex % 5 === 0) {
      return (
        <TouchableWithoutFeedback
          onPress={() => this.pressHandler()}
          accessible={false}
          accessibilityLabel={
            `${data.title}. ` + extraAccessibilityLabel + "." + data.teaser
          }
          accessibilityRole="button"
        >
          <View
            key={data.key}
            style={itemIndex !== 0 ? styles.fullContainer : styles.topContainer}
          >
            <Analytics ref="analytics" />
            <View>
              <View>
                <TouchableWithoutFeedback
                  onPress={() => this.pressHandler()}
                  accessible={false}
                  accessibilityLabel={`Title image. ${data.title}`}
                  accessibilityRole="button"
                >
                  <View>
                    <ImageBackground
                      source={{ uri: data.picture }}
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
                        source={{ uri: data.picture }}
                        defaultSource={require("../../achievement/assets/placeholder.png")}
                        style={{
                          width: responsiveWidth(67),
                          height: responsiveHeight(24)
                        }}
                        resizeMethod="resize"
                      />
                    </ImageBackground>
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                  onPress={() => this.pressHandler()}
                  accessible={true}
                  accessibilityRole="button"
                >
                  {this.imageTag()}
                </TouchableWithoutFeedback>
              </View>

              <View style={styles.previewTextContainer}>
                <TouchableWithoutFeedback
                  onPress={() => this.pressHandler()}
                  accessibilityLabel={`${data.title}`}
                  accessibilityRole="button"
                >
                  <View>
                    <Text style={styles.itemTitle}>
                      {data.title && data.title.length > 75
                        ? data.title.slice(0, 75) + "..."
                        : data.title}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
                <View>{this.renderTag()}</View>
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
                      {data.teaser && data.teaser.length > 250
                        ? data.teaser.slice(0, 250) + "..."
                        : data.teaser}
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
          accessibilityLabel={
            `${data.title}. ` + extraAccessibilityLabel + "." + data.teaser
          }
          accessibilityRole="button"
        >
          <View key={data.key} style={styles.fullContainer}>
            <Analytics ref="analytics" />
            <View
              style={[{ flexDirection: "row" }, styles.previewTextContainer]}
            >
              <View>
                <TouchableWithoutFeedback
                  onPress={() => this.pressHandler()}
                  accessible={true}
                  accessibilityRole="button"
                >
                  {this.imageTag()}
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                  onPress={() => this.pressHandler()}
                  accessibilityLabel={`${data.title}`}
                  accessibilityRole="button"
                >
                  <View style={{ width: responsiveWidth(50) }}>
                    <Text style={styles.smallItemTitle}>
                      {data.title && data.title.length > 75
                        ? data.title.slice(0, 75) + "..."
                        : data.title}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
              <View>
                <TouchableWithoutFeedback
                  onPress={() => this.pressHandler()}
                  accessible={false}
                  accessibilityLabel={`Title image. ${data.title}`}
                  accessibilityRole="button"
                >
                  <View>
                    <ImageBackground
                      source={{ uri: data.picture }}
                      defaultSource={require("../../achievement/assets/placeholder.png")}
                      style={{
                        marginHorizontal: responsiveWidth(2.5),
                        width: responsiveWidth(38),
                        height: responsiveWidth(30),
                        alignItems: "center"
                      }}
                      blurRadius={9}
                      resizeMethod="resize"
                    >
                      <ImageBackground
                        source={{ uri: data.picture }}
                        defaultSource={require("../../achievement/assets/placeholder.png")}
                        style={{
                          width: responsiveWidth(38),
                          height: responsiveWidth(30)
                        }}
                        resizeMethod="resize"
                      />
                    </ImageBackground>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    }
  }
}

const styles = StyleSheet.create({
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
  fullContainer: {
    borderTopColor: "#D3D3D3",
    borderTopWidth: 1
  },
  topContainer: {},
  clubRow: {
    flexDirection: "row",
    marginBottom: responsiveHeight(1)
  }
});
