import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Linking
} from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import axios from "axios";
import Analytics from "../../analytics";
import { tracker } from "../../../achievement/google-analytics";
import Icon from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DiningVenueTopFavorites from "./DiningVenueTopFavorites";
import PressedWrapper from "../PressedWrapper";
import { createServingString } from "./utility.js";

const TITLE_FONT_SIZE = responsiveFontSize(2.5);

const locationIcon = (
  <Icon
    name="map-marker-alt"
    color="rgb(173, 5, 91)"
    size={TITLE_FONT_SIZE}
    light
  />
);
const commentIcon = (
  <MaterialCommunityIcons
    name={"message-text"}
    size={TITLE_FONT_SIZE}
    color="rgb(0, 163, 255)"
  />
);
const checkSquareIcon = (
  <Icon
    name="check-square"
    color="rgb(93, 90, 90)"
    size={TITLE_FONT_SIZE}
    solid
  />
);
const squareIcon = (
  <Icon name="square" color="rgb(93, 90, 90)" size={TITLE_FONT_SIZE} />
);

export default class DiningVenuesHeader extends PureComponent {
  state = {
    currentlyServing: createServingString(this.props.venueData.currentlyServing)
  };

  locationPressHandler = () => {
    tracker.trackEvent("Click", `NavigateToDiningLocation`);
    const formattedItem = {
      map_title: this.props.venueData.name,
      map_coords: {
        lat: this.props.venueData.lat,
        lng: this.props.venueData.lng
      }
    };
    this.props.navigation.navigate("Maps", {
      locationName: this.props.venueData.name,
      previousScreen:"dining-venue-details",
      previousSection:"dining-venue-header",
      target:"NAVIGATE",
      data:this.props.venueData.name,
      item: {
        data: {
          data: formattedItem
        }
      }
    });
  };

  dieticianPressHandler = email => {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "dining-venue-details",
      "starting-section": "dining-venue-header", 
      "target":"Contact a registered nutritionist -"+this.props.venueData.name,
      "resulting-screen": "send-email",
      "resulting-section": "Send email to-"+this.props.venueData.name,
    });
    tracker.trackEvent("Click", `ContactRegisteredDietician`);
    Linking.openURL(`mailto:${email}`);
  };

  render() {
    const openClosedBox = this.props.venueData.currentlyServing ? (
      <View style={styles.bannerBoxLeftGreen}>
        <Text style={styles.bannerBoxLeftText}>OPEN</Text>
      </View>
    ) : (
      <View style={[styles.bannerBoxLeftGreen, { backgroundColor: "red" }]}>
        <Text
          style={[
            styles.bannerBoxLeftText,
            { fontSize: responsiveFontSize(1.05) }
          ]}
        >
          CLOSED
        </Text>
      </View>
    );
    const topBox = (
      <ImageBackground
        source={require("../../assets/store-hero.png")}
        style={styles.imageContainer}
        resizeMode="stretch"
      >
        <View style={styles.bannerBox}>
          <View style={styles.bannerBoxTop}>
            <Text style={styles.titleText}>{this.props.venueData.name}</Text>
            <DiningVenueTopFavorites
              favorite={this.props.venueData.favorite}
              locationId={this.props.venueData.locationId}
              addFavorite={this.props.addFavorite}
              addFavoriteCampuses={this.props.addFavoriteCampuses}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between"
            }}
          >
            <View style={styles.bannerBoxLeft}>{openClosedBox}</View>
            <PressedWrapper
              style={styles.bannerBoxRight}
              onPress={() => this.props.setModalVisible(true, "hours")}
            >
              <Text style={styles.bannerBoxRightText}>
                {this.state.currentlyServing}
              </Text>
              <Text style={styles.smallText}>View All Hours</Text>
            </PressedWrapper>
          </View>
        </View>
      </ImageBackground>
    );
    const bottomBox = (
      <View style={styles.bottomBox}>
        <View style={styles.bottomBoxBorderBottom}>
          <PressedWrapper
            style={styles.bottomBoxItemContainer}
            onPress={this.locationPressHandler}
          >
            <View style={styles.bottomBoxItemContainerLeft}>
              <Text>{locationIcon}</Text>
            </View>
            <View style={styles.bottomBoxItemContainerRight}>
              <Text style={styles.normalText}>
                {this.props.venueData.address[0]}
              </Text>
              <Text style={styles.normalText}>
                {this.props.venueData.address[1]}
              </Text>
            </View>
          </PressedWrapper>
        </View>
        <View style={[styles.bottomBoxBorderBottom, { borderBottomWidth: 0 }]}>
          <PressedWrapper
            style={styles.bottomBoxItemContainer}
            onPress={() =>
              this.dieticianPressHandler(this.props.venueData.dieticianEmail)
            }
          >
            <View style={styles.bottomBoxItemContainerLeft}>
              <Text>{commentIcon}</Text>
            </View>
            <View style={styles.bottomBoxItemContainerRight}>
              <Text style={styles.normalText}>
                Contact a registered nutritionist
              </Text>
            </View>
          </PressedWrapper>
        </View>
        {
          // <View style={[styles.bottomBoxBorderBottom, { borderBottomWidth: 0 }]}>
          //   <View style={styles.bottomBoxItemContainer}>
          //     <View style={styles.bottomBoxItemContainerLeft}>
          //       <Text>{checkSquareIcon}</Text>
          //     </View>
          //     <View style={styles.bottomBoxItemContainerRight}>
          //       <Text style={styles.normalText}>
          //         I would like suggestions on eating healthy at this location
          //       </Text>
          //     </View>
          //   </View>
          // </View>
        }
      </View>
    );
    return (
      <View style={styles.container}>
        <Analytics ref="analytics" />
        {topBox}
        {bottomBox}
      </View>
    );
  }
}

DiningVenuesHeader.propTypes = {
  venueData: PropTypes.object,
  navigation: PropTypes.object.isRequired,
  addFavorite: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    width: responsiveWidth(94),
    marginHorizontal: responsiveWidth(3),
    marginVertical: responsiveHeight(2),
    shadowColor: "grey",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    elevation: 10
  },
  imageContainer: {
    width: responsiveWidth(94),
    height: responsiveHeight(25),
    justifyContent: "space-around",
    alignItems: "center"
  },
  bannerBox: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-around",
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1),
    backgroundColor: "rgba(0, 0, 0, 0.65)"
  },
  bannerBoxTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  titleText: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: "bold",
    color: "white",
    paddingBottom: responsiveHeight(1),
    fontFamily: "Roboto"
  },
  bannerBoxLeft: { flex: 1 },
  bannerBoxLeftGreen: {
    backgroundColor: "rgb(81, 152, 0)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: responsiveWidth(0.7),
    paddingHorizontal: responsiveWidth(2),
    marginRight: responsiveWidth(2)
  },
  bannerBoxLeftText: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: "bold",
    color: "white",
    fontFamily: "Roboto"
  },
  bannerBoxRight: {
    flex: 4,
    justifyContent: "flex-start"
  },
  bannerBoxRightText: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: "bold",
    color: "white",
    fontFamily: "Roboto"
  },
  bannerBoxBottom: {
    width: "100%",
    paddingTop: responsiveHeight(1),
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: responsiveWidth(4)
  },
  normalText: {
    fontSize: responsiveFontSize(1.5),
    color: "black"
  },
  smallText: {
    paddingVertical: responsiveHeight(0.5),
    color: "white",
    fontSize: responsiveFontSize(1.35)
  },
  bottomBox: {
    backgroundColor: "white",
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1)
  },
  bottomBoxBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "rgb(200, 193, 193)",
    paddingVertical: responsiveHeight(1.5)
  },
  bottomBoxItemContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  bottomBoxItemContainerLeft: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  bottomBoxItemContainerRight: {
    flex: 8,
    alignSelf: "center"
  }
});
