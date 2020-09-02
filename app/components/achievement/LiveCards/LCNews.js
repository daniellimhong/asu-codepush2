import React from "react";
import {
  View,
  Image,
  ImageBackground,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { TagColorMap } from "../../../services";
import Analytics from "./../../functional/analytics";
import { tracker } from "../google-analytics.js";
import moment from "moment";
import PropTypes from "prop-types";
import { formatNews, createCardId } from "./utility";
/**
 * Live card to pull highlighted news from backend.
 *
 * ToDo - basic placeholders. Hit the RDS instance
 */
export class LCNews extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      image: "",
      headline: null,
      savedNews: [],
    };
  }

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "view",
      "starting-screen": "Home",
      "starting-section": "live-cards",
      target: "News Card",
      "resulting-screen": "live-cards",
      "resulting-section": "news-card",
      "target-id": this.props.data.articleData.field_original_url.replace(
        "https://",
        ""
      ),
      "action-metadata": {
        "target-id": this.props.data.articleData.field_original_url.replace(
          "https://",
          ""
        ),
      },
    });
    tracker.trackEvent("View", "LCNews");
    this.storeRemoteNews(this.props.data);
  }

  componentDidUpdate() {
    this.storeRemoteNews(this.props.data);
  }

  storeRemoteNews(response) {
    if (
      (response.articleData && !this.state.data) ||
      (response.articleData &&
        response.articleData.title &&
        this.state.data &&
        this.state.data.title &&
        response.articleData.title !== this.state.data.title)
    ) {
      this.setState({
        data: response.articleData,
        image: response.articleData.field_hero_image_url.replace(
          "asuevents.asu.edu",
          "d2wi8c5c7yjfp0.cloudfront.net"
        ),
        headline: response.articleData.title,
        category: response.articleData.field_saf,
        date: response.articleData.field_imported_created,
        savedNews: null,
      });
    }
  }

  buttonInsertForCustom(event, link) {
    const whatToReturn = !link ? null : (
      <View style={{ flexDirection: "row", padding: responsiveWidth(3) }}>
        <View
          style={{
            flex: 1,
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate("InAppLink", {
                url: link,
                title: event.title,
              });
            }}
            accessibilityRole="button"
          >
            <View
              style={{
                justifyContent: "center",
                backgroundColor: "#8A1E41",
                height: responsiveHeight(7),
                width: responsiveWidth(35),
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: responsiveFontSize(2),
                  textAlign: "center",
                  color: "white",
                }}
              >
                Learn More
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
    return whatToReturn;
  }

  pressHandler = () => {
    const { navigate } = this.props.navigation;
    const linkUrl = this.props.data.articleData.field_original_url;
    const buttonInsert =
      this.props.data.type !== "Custom"
        ? null
        : this.buttonInsertForCustom(this.state.data, linkUrl);

    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "Home",
      "starting-section": "live-cards",
      target: "News Card",
      "resulting-screen": "core-feature-card",
      "resulting-section": null,
      "target-id": linkUrl.replace("https://", ""),
      "action-metadata": {
        item: this.props.data.title,
        "target-id": linkUrl.replace("https://", ""),
      },
    });
    tracker.trackEvent("Click", `LiveCard_News - item: ${this.state.data}`);
    if (this.state.data.body) {
      let dataToSend;
      dataToSend = formatNews(this.state.data, this.props.data.type);
      navigate("Card", {
        data: dataToSend,
        navigation: this.props.navigation,
        type: "news",
        saved: this.state.savedNews,
        footer: buttonInsert,
        previousScreen: "Home",
        previousSection: "live-cards-news",
        target: "News Card",
      });
    } else {
      this.props.navigation.navigate("InAppLink", {
        url: linkUrl,
        title: this.state.data.title,
      });
    }
  };

  render() {
    if (this.state.headline) {
      let title = (
        <Text
          allowFontScaling={false}
          adjustsfontsizetofit
          numberOfLines={3}
          style={styles.headlineText}
        >
          {this.state.headline}
        </Text>
      );

      const whichDateToShow =
        this.state.data.start_date && this.state.data.end_date
          ? `${moment(this.state.data.start_date[0]).format(
              "dddd MMM Do"
            )} - ${moment(this.state.data.end_date[0]).format("Do")}`
          : moment(this.state.date).format("dddd MMM Do YYYY");
      let extraView = null;
      if (this.state.data.button_text) {
        // Custom Live card wants to adda button
        title = null;
        extraView = (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              alignContent: "space-between",
              paddingBottom: responsiveHeight(3),
            }}
          >
            <View
              style={{
                flex: 3,
                flexDirection: "column",
                paddingRight: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                allowFontScaling={false}
                style={[
                  styles.headlineText,
                  {
                    fontWeight: "bold",
                    fontSize: responsiveFontSize(2.3),
                    fontFamily: "Roboto",
                  },
                ]}
              >
                {this.state.headline} TEXTING EXTRA CHARACTERS
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: "#8A1E41",
                height: responsiveHeight(8.8),
                width: responsiveHeight(15.8),
                borderRadius: responsiveHeight(5.8) / 5,
                alignItems: "center",
                justifyContent: "center",
                borderColor: "white",
                borderWidth: 2,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: responsiveFontSize(2),
                  fontWeight: "bold",
                  color: "white",
                  fontFamily: "Roboto",
                }}
              >
                {this.state.data.button_text}
              </Text>
            </View>
          </View>
        );
      }
      return (
        <View style={{ flex: 1 }}>
          <Analytics ref="analytics" />
          <TouchableWithoutFeedback onPress={this.pressHandler}>
            <View key={"LiveCardNews"} style={styles.container}>
              <ImageBackground
                style={[styles.imageBox]}
                source={{ uri: this.state.image }}
                blurRadius={9}
                resizeMode="stretch"
              >
                <Image
                  style={styles.articleImage}
                  source={{ uri: this.state.image }}
                  resizeMode="contain"
                />
              </ImageBackground>
              <View style={styles.bottomTextBox}>
                <View style={styles.dateCategoryBox}>
                  <View style={styles.categoryBox}>
                    <Text allowFontScaling={false} style={styles.categoryText}>
                      FEATURED NEWS
                    </Text>
                  </View>
                  <View style={{ flex: 1 }} />
                </View>
                <View style={styles.headlineBox}>
                  {title}
                  {extraView}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      );
    } else {
      return (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <Analytics ref="analytics" />
          <ActivityIndicator size="large" color="maroon" />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBox: {
    flex: 2,
  },
  articleImage: {
    width: "100%",
    height: "100%",
  },
  bottomTextBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(6),
  },
  dateCategoryBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginHorizontal: responsiveWidth(2.5),
  },
  datebox: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontWeight: "500",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(1.8),
    color: "black",
  },
  categoryBox: {
    alignItems: "center",
    padding: responsiveHeight(1),
    backgroundColor: "#f8b524",
  },
  categoryText: {
    fontSize: responsiveFontSize(1.5),
    color: "white",
    fontWeight: "700",
    fontFamily: "Roboto",
  },
  headlineBox: {
    flex: 1.8,
    flexDirection: "column",
    marginHorizontal: responsiveWidth(2.5),
    paddingRight: 0,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    alignSelf: "flex-start",
  },
  headlineText: {
    fontSize: responsiveFontSize(2.25),
    fontWeight: "700",
    fontFamily: "Roboto",
    color: "black",
  },
  spacer: {
    flex: 1,
  },
});
