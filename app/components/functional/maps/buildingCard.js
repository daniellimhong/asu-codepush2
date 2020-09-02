import React from "react";
import { View, Image, Text, StyleSheet, ImageBackground } from "react-native";
import { Icon } from "react-native-elements";
import axios from "axios";
import Analytics from "./../analytics";
import { tracker } from "../../achievement/google-analytics.js";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

export default class BuildingCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      buildingDetails: this.props.buildingDetails,
      calc_height: 0
    };
  }

  errorHandler = () => this.props.setShowImageFalse();

  renderCard() {

    // console.log("RENDINER BUILDING DETS",this.props.buildingDetails)
    if (this.props.buildingDetails) {
      if (typeof this.props.buildingDetails.mediaUrls != "undefined") {
        var url = this.props.buildingDetails.mediaUrls[0];
        var output = [url.slice(0, 4), "s", url.slice(4)].join("");
        image = { uri: output };
      } else {

        if( this.props.buildingDetails.imageUrl ) {
          image = { uri: this.props.buildingDetails.imageUrl };
        } else {
          image = { uri: "" };
        }

      }
      let titleStyle = [styles.titleText];
      let subtitleStyle = [styles.subtitleText];
      // console.log("this is the image ", image.uri);
      if (image.uri.includes("http") && !image.uri.includes("httpss")) {
        return (
          <ImageBackground
            style={{
              width: "100%",
              height: responsiveHeight(20),
              justifyContent: "flex-end",
              borderTopColor: "white",
              borderTopWidth: 2
            }}
            source={image}
            blurRadius={6}
            resizeMode="stretch"
            onError={() => this.errorHandler()}
          >
            <ImageBackground
              style={{
                width: "100%",
                height: responsiveHeight(20),
                justifyContent: "flex-end",
                borderTopColor: "white",
                borderTopWidth: 2
              }}
              source={image}
              resizeMode="contain"
              onError={() => this.errorHandler()}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: responsiveFontSize(2.5),
                  padding: responsiveHeight(2)
                }}
              >
                {this.props.buildingDetails.name}
              </Text>
              <View style={{ position: "absolute", top: 0, right: 10 }}>
                <Icon
                  raised
                  name="close"
                  type="Ionicons"
                  onPress={this.props.onClear}
                  size={20}
                />
              </View>
            </ImageBackground>
          </ImageBackground>
        );
      } else {
        return <View style={{ height: 0 }} />;
      }
    } else {
      return null;
    }
  }

  render() {
    return this.renderCard();
  }
}

const styles = StyleSheet.create({
  preview: {
    borderColor: "red"
  },
  cardImage: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgb(139,29,65)",
    alignSelf: "stretch",
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "stretch"
  },
  imageContainer: {
    flex: 1,
    flexDirection: "column",
    paddingRight: 16,
    paddingLeft: 16,
    paddingBottom: 16,
    paddingTop: 16,
    justifyContent: "flex-end"
  },
  imageTitleText: {
    fontSize: 24,
    color: "rgba(255 ,255 ,255 , 0.87)"
  },
  darkText: {
    color: "rgba(0 ,0 ,0 , 0.87)"
  },
  lightText: {
    color: "rgba(255 ,255 ,255 , 0.87)"
  },
  cardTitle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 16,
    paddingLeft: 16,
    paddingBottom: 16,
    paddingTop: 16
  },
  cardTitleTextCont: {
    flex: 1,
    flexDirection: "column"
  },
  titleText: {
    fontSize: 24
  },
  subtitleText: {
    fontSize: 14,
    color: "rgba(0 ,0 ,0 , 0.38)"
  },
  avatarStyle: {
    width: 40,
    height: 40,
    borderRadius: 150,
    marginRight: 16
  }
});
