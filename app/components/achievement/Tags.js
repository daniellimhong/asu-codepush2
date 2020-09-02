import React from "react";
import { View, Text,TouchableOpacity, Linking } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Analytics from "../functional/analytics";
import { tracker } from "./google-analytics.js";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize }
  from "react-native-responsive-dimensions";

export class ProfileTag extends React.PureComponent {

  static defaultProps = {
    text: null,
    color: null,
    icon: null,
    link: null,
    navigation: null,
    linkText: null,
    previousScreen:null,
    previousSection:null,
    onError: () => {}
  };

  state = { current: 0 };

  onError = error => {
    this.props.onError(error);
    const next = this.state.current + 1;
    if (next < this.props.source.length) {
      this.setState({ current: next });
    }
  };

  render() {

    const { onError, source, ...rest } = this.props;
    let { navigate } = this.props.navigation;

    if( this.props.link ) {
      return (
        <View>
          <Analytics ref="analytics" />
        <TouchableOpacity
          key={this.props.text}
          onPress={() => {

              var analyticsPay = {
                eventName: "Tag_"+this.props.linkText,
                eventType: "click",
                asurite: this.props.ownerAsurite,
                addnData: {
                  contact: this.props.asurite
                }
              };

              console.log(analyticsPay);

              console.log("############### 35 target id:"+ this.props.asurite);
              this.refs.analytics.sendData({
                "action-type": "click",
                "starting-screen": this.props.previousScreen?this.props.previousScreen:null,
                "starting-section": this.props.previousSection?this.props.previousSection:null,
                "target": "tag:"+this.props.linkText,
                "resulting-screen": "external-browser", 
                "resulting-section": this.props.linkText?this.props.linkText:null,
                "target-id": this.props.asurite,
                "action-metadata":{
                  "target-id": this.props.asurite,
                  "asurite": this.props.ownerAsurite,
                  "contact": this.props.asurite,
                  "link": this.props.link,
                }
              });
              tracker.trackEvent("Click", `Profile_ViewAll - ${analyticsPay.addnData}`);
              this.determineNav(this.props.link,navigate,this.props.linkText);
          }}
        >
          {this.generateTag()}
        </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View>
          <Analytics ref="analytics" />
          {this.generateTag()}
        </View>
      )
    }

  }

  generateTag() {

    var printText = this.props.icon ? this.props.text : this.props.text.charAt(0).toUpperCase() + this.props.text.slice(1);

    var size = 1.7;
    var marTop = 0.4;

    // if( this.props.icon == "phone" ) {
    //   size = 1.8
    //   marTop = 0.5
    // }

    return (
      <View
        style={{
          paddingVertical: responsiveHeight(0.7),
          paddingHorizontal: responsiveWidth(1.8),
          borderRadius: 15,
          backgroundColor: this.getColor(this.props.color),
          overflow: "hidden",
          alignSelf: 'flex-start',
          flex: this.props.icon ? 1 : null,
          flexDirection: this.props.icon ? "row" : null,
          marginRight: responsiveWidth(1.5),
          marginTop: responsiveHeight(0.5),
          justifyContent: "center",
          alignItems: "center"
        }}
      >

        { this.props.icon ? (
          <FontAwesome
            name={this.props.icon}
            size={responsiveFontSize(size)}
            color={this.getTextColor(this.props.color)}
            style={{ backgroundColor: "transparent", textAlign: "center"}}
          />
        ) : null}
        <Text
          style={{
            color: this.getTextColor(this.props.color),
            fontSize: responsiveFontSize(1.7),
            marginLeft: this.props.icon ? 8 : null
          }}
        >
          {printText}
        </Text>
      </View>
    )
  }

  getColor(c) {
    switch(c) {
      case "maroon":
        return "#9b0838";
        break;
      case "blue":
        return "#379acb";
        break;
      case "white":
        return "#ffffff";
        break;
    }
  }

  getTextColor(c) {
    switch(c) {
      case "maroon":
        return "white";
        break;
      case "blue":
        return "white";
        break;
      case "white":
        return "#3b3b3b";
        break;
    }
  }

  determineNav(u,nav,t) {

    if( u.indexOf("https") > -1 ) {
      nav("InAppLink", {
        url: u,
        title: t
      });
    } else if ( u.indexOf("mailto") > -1 || u.indexOf("tel://") > -1 ) {

      Linking.canOpenURL(u).then(supported => {
        if (supported) {
          Linking.openURL(u);
        } else {
          console.log("Don't know how to open URI");
        }
      });

    } else {
      nav(u);
    }


  }

}
