import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Analytics from "../../../functional/analytics";
import { tracker } from "../../google-analytics.js";
export class TextItem extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  static defaultProps = {
    isearch: () => null,
    asurite: null,
    extraInfo: null,
    parent: null,
    img: null,
    text: null,
    url: null,
    lastItem: false,
    user_info: {}
  };
  onPressHandler = () => {
    const { asurite, itemTitle, parent, text, bodyText, url } = this.props;
    const { navigate } = this.props.navigation;
    let analyticsPay = {
      eventName: "Class_ViewItem",
      eventType: "click",
      asurite: asurite,
      addnData: {
        item: itemTitle,
        parent: parent
      }
    };
    tracker.trackEvent("Click", `Profile_ViewAll - ${analyticsPay.addnData}`);
    navigate("ViewInfoDetails", {
      date: itemTitle,
      title: text,
      text: bodyText,
      url
    });
  };
  render() {
    return (
      <View
        accessible={true}
        accessibilityLabel={this.props.text}
        accessibilityRole="button"
        style={[
          styles.lineItem,
          {
            borderColor: this.props.lastItem ? "white" : "#adadad"
          }
        ]}
      >
        <Analytics ref="analytics" />
        {/* <TouchableOpacity
          key={this.props.text}
          onPress={() => this.onPressHandler()}
        > */}
          {this.props.itemTitle ? (
            <View
              style={{
                margin: responsiveWidth(0.1),
                alignItems: "flex-start",
                flexDirection: "row"
              }}
            >
              <Text style={styles.labelTitle}>{this.props.itemTitle}</Text>
            </View>
          ) : null}
          <View
            style={{
              margin: responsiveWidth(0.1),
              alignItems: "flex-start",
              flexDirection: "row"
            }}
          >
            <View style={{ flex: 8 }}>
              <Text
                style={styles.snippit}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {this.props.text}
              </Text>
            </View>
          </View>
        {/* </TouchableOpacity> */}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  lineItem: {
    borderBottomWidth: 1,
    marginHorizontal: responsiveWidth(3),
    justifyContent: "center",
    paddingVertical: responsiveHeight(2.2)
  },
  labelTitle: {
    fontSize: responsiveFontSize(1.75),
    color: "black",
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  snippit: {
    fontSize: responsiveFontSize(1.75),
    color: "black"
  }
});