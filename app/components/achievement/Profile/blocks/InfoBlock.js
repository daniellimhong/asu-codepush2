import React from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

import Analytics from "../../../functional/analytics";
import { tracker } from "../../google-analytics.js";
import { TextItem } from "./TextItem";
import TransitionView from "../../../universal/TransitionView";

export class InfoBlock extends React.PureComponent {
  static defaultProps = {
    asurite: "",
    details: [],
    title: "",
    infoDetails: null,
    titleIcon: null,
    roles: [],
    showAll: false,
    isearch: () => null,
    showHead: false,
    subscribeToNewFriends: () => null
  };

  dynamicText = item => {
    if (this.props.title == "Events") {
      return item.text;
    } else {
      return item.title;
    }
  };

  onPressHandler = () => {
    const { title, details, asurite } = this.props;
    const { navigate } = this.props.navigation;
    let analyticsPay = {
      eventName: "Profile_ViewAll",
      eventType: "click",
      asurite: asurite,
      addnData: {
        item: title
      }
    };
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "class-profile",
      "starting-section": title, 
      "target": "View All",
      "resulting-screen": "full-info-view",
      "resulting-section": title,
      "target-id":asurite,
      "action-metadata":{
        "item": title,
        "target-id":asurite,
      }
    });
    tracker.trackEvent("Click", `Profile_ViewAll - ${analyticsPay.addnData}`);
    navigate("FullInfoView", {
      title,
      details,
      asurite
    });
  };

  renderViewAllBtn = () => {
    return (
      <TouchableOpacity
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: responsiveHeight(3)
        }}
        onPress={() => this.onPressHandler()}
      >
        <Text style={styles.viewAllButtonText}>VIEW ALL</Text>
      </TouchableOpacity>
    );
  };

  render() {
    let {
      details,
      showAll,
      title,
      titleIcon,
      asurite,
      ownerAsurite,
      navigation
    } = this.props;
    let dLen = details.length;
    if (showAll === false) {
      details = details.slice(0, 3);
    }

    if (details.length) {
      return (
        <View style={[styles.itemContBase, styles.itemCont]}>
          <Analytics ref="analytics" />
          {title ? (
            <View style={{ flexDirection: "row" }}>
              {titleIcon ? (
                <View style={styles.imageWrapper}>
                  <Image
                    style={styles.canvas}
                    resizeMode="contain"
                    source={[
                      {
                        uri:
                          "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/profile-images/icons/" +
                          titleIcon
                      }
                    ]}
                  />
                </View>
              ) : null}
              <View style={{ flex: 8 }}>
                <Text
                  style={[styles.mainTitle, { marginLeft: responsiveWidth(1) }]}
                >
                  {title}
                </Text>
              </View>
            </View>
          ) : null}
          <View>
            {details.map((item, index) => {
              let lastItem = index == details.length - 1 ? true : false;
              return (
                <TransitionView index={index} key={title + index}>
                  <TextItem
                    // key={title + index}
                    lastItem={lastItem}
                    navigation={navigation}
                    parent={title}
                    img={item.img}
                    text={item.title}
                    bodyText={item.text}
                    itemTitle={item.date}
                    url={item.url}
                    imgUrl={item.imgUrl}
                    extraInfo={item.extraInfo}
                    asurite={asurite}
                    ownerAsurite={ownerAsurite}
                    useImgUrl={item.useImgUrl}
                  />
                </TransitionView>
              );
            })}
          </View>
          {dLen > 3 ? this.renderViewAllBtn() : null}
        </View>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  mainTitle: {
    fontSize: responsiveFontSize(2.2),
    marginHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(2),
    fontWeight: "bold",
    color: "black",
    fontFamily: "Roboto"
  },
  canvas: {
    flex: 1,
    alignItems: "flex-start",
    width: responsiveWidth(5.4),
    height: responsiveWidth(5.4)
  },
  itemContBase: {
    backgroundColor: "white",
    shadowColor: "#777",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5
  },
  itemCont: {
    margin: responsiveWidth(2.5),
    paddingHorizontal: responsiveWidth(5)
  },
  imageWrapper: {
    flex: 1,
    marginLeft: responsiveWidth(3),
    paddingVertical: responsiveHeight(2.3)
  },
  viewAllButtonText: {
    fontSize: responsiveFontSize(1.75),
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Roboto"
  }
});
