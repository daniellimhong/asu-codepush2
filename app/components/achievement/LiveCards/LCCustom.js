import React from "react";
import {
  View,
  Image,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  Platform,
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import moment from "moment";
import PropTypes from "prop-types";
import { TagColorMap } from "../../../services";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { formatNews, isUrl, createCardId } from "./utility";

// Custom Live Card Component
export class LCCustom extends React.PureComponent {
  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "view",
      "starting-screen": "Home",
      "starting-section": "live-cards",
      target: "Custom Card",
      "resulting-screen": "live-cards",
      "resulting-section": null,
      "target-id": createCardId(this.props.title),
      "action-metadata": {
        item: this.props.articleData,
        "target-id": createCardId(this.props.title),
      },
    });
    tracker.trackEvent("View", "LCCustom");
    this.setImageHeight();
  }

  setImageHeight = () => {
    const url = this.props.field_hero_image_url;
    const windowWidth = Dimensions.get("window").width;
    Image.getSize(url, (width, height) => {
      const ratio = height / width;
      const newHeight = windowWidth * ratio;
      this.setState({
        imageHeight: newHeight || responsiveHeight(35),
      });
    });
  };

  whereToNavigate = (event, link, buttonText) =>
    isUrl(link)
      ? this.props.navigation.navigate("InAppLink", {
          url: link,
          title: buttonText,
        })
      : this.props.navigation.navigate(link);

  buttonInsertForCustom(event, link) {
    if (!link) {
      return null;
    } else {
      const buttonText = !event.button_text_card
        ? "Learn More"
        : event.button_text_card;
      return (
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
                this.whereToNavigate(event, link, buttonText);
                this.refs.analytics.sendData({
                  "action-type": "click",
                  "starting-screen": "Home",
                  "starting-section": "live-cards",
                  target: "Custom Card Button",
                  "resulting-screen": isUrl(link)
                    ? "in-app-browser"
                    : "external-browser",
                  "resulting-section": null,
                  "target-id": createCardId(this.props.title),
                  "action-metadata": {
                    item: this.props.articleData,
                    "target-id": createCardId(this.props.title),
                  },
                });
                tracker.trackEvent(
                  "Click",
                  `LiveCard_Custom_Button - item: ${this.props.articleData}`
                );
              }}
              accessibilityRole="button"
            >
              <View
                style={{
                  justifyContent: "center",
                  backgroundColor: event.button_text_card_color
                    ? event.button_text_card_color
                    : "#8A1E41",
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.7),
                    textAlign: "center",
                    color: "white",
                    fontWeight: "bold",
                    padding: responsiveWidth(4),
                    fontFamily: "Roboto",
                  }}
                >
                  {buttonText}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }

  pressHandlerButton = () => {
    const linkUrl = this.props.data.articleData.field_original_url;
    if (linkUrl && isUrl(linkUrl)) {
      this.props.navigation.navigate("InAppLink", {
        url: linkUrl,
        title: this.props.title,
      });
    } else if (linkUrl && !isUrl(linkUrl)) {
      this.props.navigation.navigate(linkUrl);
    }
  };

  pressHandler = () => {
    const { navigate } = this.props.navigation;
    const linkUrl = this.props.data.articleData.field_original_url;
    const buttonInsert = this.buttonInsertForCustom(
      this.props.articleData,
      linkUrl
    );
    tracker.trackEvent(
      "Click",
      `LiveCard_Custom - item: ${this.props.articleData}`
    );
    if (this.props.body) {
      this.refs.analytics.sendData({
        "action-type": "click",
        "starting-screen": "Home",
        "starting-section": "live-cards",
        target: "Custom Card Button",
        "resulting-screen": "core-feature-card",
        "resulting-section": null,
        "target-id": createCardId(this.props.title),
        "action-metadata": {
          item: this.props.articleData,
          "target-id": createCardId(this.props.title),
        },
      });
      // If body field is filled out, then will navigate to the card;
      // console.log(
      //   "this is data passed into CFCard from LCCustom ",
      //   formatNews(this.props.articleData, this.props.data.type)
      // );
      const dataToSend = formatNews(
        this.props.articleData,
        this.props.data.type
      );
      if (this.props.articleData.link_from_lc) {
        navigate(this.props.articleData.field_original_url);
      } else {
        navigate("Card", {
          data: dataToSend,
          navigation: this.props.navigation,
          type: "news",
          footer: buttonInsert,
          imageHeight: this.state.imageHeight
            ? this.state.imageHeight
            : responsiveHeight(35),
          previousScreen: "Home",
          previousSection: "live-cards-custom",
          target: "Custom Card",
        });
      }
    } else {
      // If body field is not field out, will link directly to the link
      if (linkUrl && isUrl(linkUrl)) {
        this.refs.analytics.sendData({
          "action-type": "click",
          "starting-screen": "Home",
          "starting-section": "live-cards",
          target: "Custom Card Button",
          "resulting-screen": "in-app-browser",
          "resulting-section": null,
          "target-id": createCardId(this.props.title),
          "action-metadata": {
            item: this.props.articleData,
            "target-id": createCardId(this.props.title),
          },
        });
        navigate("InAppLink", { url: linkUrl, title: this.props.title });
      } else if (linkUrl && !isUrl(linkUrl)) {
        this.refs.analytics.sendData({
          "action-type": "click",
          "starting-screen": "Home",
          "starting-section": "live-cards",
          target: "Custom Card Button",
          "resulting-screen": "external-browser",
          "resulting-section": null,
          "target-id": createCardId(this.props.title),
          "action-metadata": {
            item: this.props.articleData,
            "target-id": createCardId(this.props.title),
          },
        });
        navigate(linkUrl);
      }
    }
  };

  getImageContainerStyle = () => {
    if (this.props.articleData.image_container_flex) {
      return {
        flex: Number(this.props.articleData.image_container_flex),
        justifyContent: "flex-start",
        alignItems: "flex-start",
      };
    } else {
      return {
        flex: 2,
        justifyContent: "flex-start",
        alignItems: "flex-start",
      };
    }
  };

  getTextContainerStyle = () => {
    return {
      flex: 1,
      justifyContent: "space-evenly",
      alignItems: "center",
      paddingHorizontal: responsiveWidth(3),
      backgroundColor: this.props.articleData.text_background_color
        ? this.props.articleData.text_background_color
        : "white",
    };
  };

  render() {
    if (this.props.articleData) {
      const borderBottomWidth =
        !this.props.field_news_teaser &&
        !this.props.title &&
        !this.props.button_text
          ? 0
          : 1;
      const whichDateToShow =
        this.props.start_date && this.props.end_date
          ? `${moment(this.props.start_date[0]).format(
              "dddd MMM Do"
            )} - ${moment(this.props.end_date[0]).format("Do")}`
          : this.props.date_time;

      const responsiveDateView = !whichDateToShow ? null : (
        <View style={styles.datebox}>
          <Text style={styles.dateText}>{whichDateToShow}</Text>
        </View>
      );

      const responsiveCategoryView = !this.props.field_saf ? null : (
        <View
          style={[
            styles.categoryBox,
            {
              backgroundColor: this.props.field_saf_color
                ? this.props.field_saf_color
                : "rgb(101, 101, 101)",
            },
          ]}
        >
          <Text style={styles.categoryText}>{this.props.field_saf}</Text>
        </View>
      );

      const responsiveTopBox =
        whichDateToShow || this.props.field_saf ? (
          <View style={[styles.dateCategoryBox, { borderBottomWidth }]}>
            {responsiveDateView}
            {responsiveCategoryView}
          </View>
        ) : null;

      const responsiveTitle = !this.props.title ? null : (
        <Text
          style={[
            styles.headlineText,
            {
              fontWeight: "bold",
              fontSize: responsiveFontSize(2.4),
              fontFamily: "Roboto",
            },
          ]}
        >
          {this.props.title}
        </Text>
      );
      const responsiveTeaser = !this.props.field_news_teaser ? null : (
        <Text
          style={[
            styles.headlineText,
            {
              fontWeight: "normal",
              fontFamily: "Roboto",
              fontSize: responsiveFontSize(1.9),
            },
          ]}
        >
          {this.props.field_news_teaser}
        </Text>
      );
      const responsiveButton = !this.props.button_text ? null : (
        <TouchableOpacity
          style={[
            styles.buttonBox,
            {
              backgroundColor: this.props.button_text_color
                ? this.props.button_text_color
                : "#8A1E41",
            },
          ]}
          onPress={this.pressHandler}
        >
          <Text style={styles.buttonText}>{this.props.button_text}</Text>
        </TouchableOpacity>
      );
      const responsiveBottomBox =
        this.props.field_news_teaser ||
        this.props.title ||
        this.props.button_text ? (
          <View style={styles.bottomBox}>
            {responsiveTitle}
            {responsiveTeaser}
            {responsiveButton}
          </View>
        ) : null;

      const images = !this.props.stretchImage ? (
        <ImageBackground
          style={this.getImageContainerStyle()}
          source={
            this.props.field_hero_image_url
              ? { uri: this.props.field_hero_image_url }
              : require("../assets/placeholder.png")
          }
          blurRadius={9}
          resizeMode="stretch"
        >
          <Image
            style={styles.articleImage}
            source={
              this.props.field_hero_image_url
                ? { uri: this.props.field_hero_image_url }
                : require("../assets/placeholder.png")
            }
            resizeMode="contain"
          />
        </ImageBackground>
      ) : (
        <Image
          style={this.getImageContainerStyle()}
          source={
            this.props.field_hero_image_url
              ? { uri: this.props.field_hero_image_url }
              : require("../assets/placeholder.png")
          }
          resizeMode="stretch"
        />
      );

      return (
        <View style={{ flex: 1 }}>
          <Analytics ref="analytics" />
          <TouchableWithoutFeedback onPress={this.pressHandler}>
            <View style={styles.container}>
              {images}
              <View style={this.getTextContainerStyle()}>
                {responsiveTopBox}
                {responsiveBottomBox}
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

LCCustom.contextTypes = {
  getTokens: PropTypes.func,
  AddRepaintCallback: PropTypes.func,
  Repaint: PropTypes.func,
};

LCCustom.propTypes = {
  card: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  articleData: PropTypes.object.isRequired,
  title: PropTypes.string,
  body: PropTypes.string,
  button_text: PropTypes.string,
  button_text_color: PropTypes.string,
  button_text_card: PropTypes.string,
  button_text_card_color: PropTypes.string,
  date_time: PropTypes.string,
  enabled: PropTypes.bool,
  field_hero_image_url: PropTypes.string,
  field_imported_created: PropTypes.string,
  field_interests: PropTypes.string,
  field_news_teaser: PropTypes.string,
  field_original_url: PropTypes.string,
  field_saf: PropTypes.string,
  field_saf_color: PropTypes.string,
  location: PropTypes.string,
  order: PropTypes.number.isRequired,
  priority: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  key_num: PropTypes.number.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "space-evenly",
    // alignItems: "center",
  },
  // imageBox: {
  //   flex: 0.7,
  // },
  articleImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  // textContainer: {
  //   flex: 1,
  //   justifyContent: "space-evenly",
  //   alignItems: "center",
  //   paddingHorizontal: responsiveWidth(3),
  // },
  dateCategoryBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomColor: "black",
  },
  datebox: {
    flex: 2,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontWeight: "500",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(1.7),
    color: "black",
    textAlign: "center",
    marginRight: responsiveWidth(0.3),
  },
  categoryBox: {
    flex: 1.1,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginHorizontal: responsiveWidth(1),
    padding: 5,
  },
  categoryText: {
    fontSize: responsiveFontSize(1.2),
    color: "white",
    fontWeight: "bold",
    fontFamily: "Roboto",
  },
  bottomBox: {
    flex: 2,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%",
    height: "100%",
    paddingVertical: responsiveHeight(0.9),
  },
  headlineText: {
    fontSize: responsiveFontSize(2.7),
    fontWeight: "800",
    fontFamily: "Roboto",
    color: "black",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonBox: {
    borderRadius: responsiveHeight(5.8) / 4,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "white",
    padding: responsiveWidth(1.55),
    marginTop: responsiveHeight(0.5),
  },
  buttonText: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginHorizontal: responsiveWidth(1),
    fontFamily: "Roboto",
  },
});
