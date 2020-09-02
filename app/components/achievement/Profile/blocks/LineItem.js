import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Linking
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Analytics from "../../../functional/analytics";
import { tracker } from "../../google-analytics.js";
export class LineItem extends React.PureComponent {
  static defaultProps = {
    isearch: () => null,
    parent: null,
    asurite: null,
    extraInfo: null,
    img: null,
    text: null,
    url: null,
    viewingSelf: null,
    fullId: null,
    lastItem: false,
    user_info: {}
  };
  onPressHandler = () => {
    const {
      fullId,
      ownerAsurite,
      text,
      viewingSelf,
      asurite,
      extraInfo,
      linkBeg,
      url
    } = this.props;
    const { navigate } = this.props.navigation;
    let analyticsPay = {
      eventName: fullId?fullId:null,
      eventType: "click",
      asurite: ownerAsurite,
      addnData: {
        item: text,
        viewingSelf: viewingSelf,
        asurite: asurite
      }
    };
    tracker.trackEvent("Click", `${fullId?fullId:"null"} - ${analyticsPay.addnData}`);
    this.determineNav(url, navigate, text, asurite, extraInfo, linkBeg, viewingSelf, fullId);
  };
  render() {
    const { count, text, lastItem, useImgUrl, imgUrl, img } = this.props;
    let bgColor = this.props.bgColor ? this.props.bgColor : "#444444";
    let countBg = count != "undefined" && count >= 0 ? "#e3e3e3" : "white";
    return (
      <View
        accessible={true}
        accessibilityLabel={text}
        accessibilityRole="button"
        style={[
          styles.lineItem,
          {
            borderColor: lastItem ? "transparent" : "#adadad"
          }
        ]}
      >
        <Analytics ref="analytics" />
        <TouchableOpacity key={text} onPress={() => this.onPressHandler()}>
          <View
            style={{
              margin: responsiveWidth(0.1),
              alignItems: "flex-start",
              flexDirection: "row"
            }}
          >
            <View style={{ flex: 1 }}>
              {useImgUrl ? (
                <Image
                  style={styles.canvas}
                  resizeMode="contain"
                  source={[{ uri: imgUrl ? imgUrl : "" }]}
                />
              ) : (
                <FontAwesome5
                  name={img}
                  size={responsiveFontSize(2.3)}
                  color={bgColor}
                  style={{ backgroundColor: "transparent", width: 25 }}
                  solid
                />
              )}
            </View>
            <View style={{ flex: 8 }}>
              <Text style={styles.label}>{text}</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: countBg,
                borderRadius: 2,
                overflow: "hidden"
              }}
            >
              <Text
                style={[
                  styles.label,
                  { textAlign: "center", fontWeight: "bold", fontFamily: "Roboto" }
                ]}
              >
                {count}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
  determineNav(url, nav, text, asurite, extraData, linkBeg,viewingSelf, fullId) {
    if (url) {
      if (url.indexOf("https") > -1) {
        if (url.indexOf("slack") > -1) {
          this.refs.analytics.sendData({
            "action-type": "click",
            "starting-screen": this.props.previousScreen,
            "starting-section": this.props.previousSection,
            "target": text,
            "resulting-screen": "external-browser",
            "resulting-section": "slack",
            "target-id":this.props.course_id?this.props.course_id:asurite,
            "action-metadata":{
              "target-id":this.props.course_id?this.props.course_id:asurite,
              "item": text,
              "viewingSelf": viewingSelf,
              "asurite": asurite,
              "course_id":this.props.course_id?this.props.course_id:null,
              "fullId":fullId
            }
          });
          Linking.canOpenURL(url).then(supported => {
            if (supported) {
              Linking.openURL(url);
            }
          });
        } else {
          this.refs.analytics.sendData({
            "action-type": "click",
            "starting-screen": this.props.previousScreen,
            "starting-section": this.props.previousSection,
            "target": text,
            "resulting-screen": "in-app-browser",
            "resulting-section": null,
            "target-id":this.props.course_id?this.props.course_id:asurite,
            "action-metadata":{
              "target-id":this.props.course_id?this.props.course_id:asurite,
              "item": text,
              "viewingSelf": viewingSelf,
              "asurite": asurite,
              "course_id":this.props.course_id?this.props.course_id:null,
              "fullId":fullId
            }
          });
          nav("InAppLink", {
            url: url,
            title: text
          });
        }
      } else if (linkBeg && linkBeg.indexOf("https") > -1) {
        this.refs.analytics.sendData({
          "action-type": "click",
          "starting-screen": this.props.previousScreen,
          "starting-section": this.props.previousSection,
          "target": text,
          "resulting-screen": "in-app-browser",
          "target-id":this.props.course_id?this.props.course_id:asurite,
          "action-metadata":{
            "target-id":this.props.course_id?this.props.course_id:asurite,
            "item": text,
            "viewingSelf": viewingSelf,
            "asurite": asurite,
            "course_id":this.props.course_id?this.props.course_id:null,
            "fullId":fullId
          }
        });
        nav("InAppLink", {
          url: linkBeg + url,
          title: text
        });
      } else {
        this.refs.analytics.sendData({
          "action-type": "click",
          "starting-screen": this.props.previousScreen,
          "starting-section": this.props.previousSection,
          "target": text,
          "resulting-screen": url,
          "resulting-section": null,
          "target-id":this.props.course_id?this.props.course_id:asurite,
          "action-metadata":{
            "target-id":this.props.course_id?this.props.course_id:asurite,
            "item": text,
            "viewingSelf": viewingSelf,
            "asurite": asurite,
            "course_id":this.props.course_id?this.props.course_id:null,
            "fullId":fullId
          }
        });
        let extra = {};
        if (url == "UserCheckins" || url == "UserLikes") {
          extra = { asurite: asurite };
        } else if (extraData !== null) {
          extra = extraData?extraData:{};
        }
        extra.previousScreen = this.props.previousScreen;
        extra.previousSection = this.props.previousSection;
        nav(url, extra);
      }
    }
  }
}
const styles = StyleSheet.create({
  lineItem: {
    borderBottomWidth: 1,
    marginHorizontal: responsiveWidth(3),
    justifyContent: "center",
    paddingVertical: responsiveHeight(2.2)
  },
  label: {
    fontSize: responsiveFontSize(1.75),
    color: "black"
  },
  canvas: {
    flex: 1,
    alignItems: "flex-start",
    width: responsiveWidth(4.4),
    height: responsiveWidth(4.4)
  }
});
