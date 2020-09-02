import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  LayoutAnimation,
  StyleSheet
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Analytics from "../../../functional/analytics";
import { ProfileTag } from "../../Tags";
import { AddInfo } from "./AddInfo";
/**
 * Render a list of Friends.
 *
 * Friends list is passed via props.
 */
export class BioBlockX extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      icon: "chevron-down",
      height: responsiveHeight(15)
    };
  }
  static defaultProps = {
    asurite: "",
    details: [],
    infoDetails: null,
    roles: [],
    canAddBio: false,
    title: "",
    asurite: null,
    isearch: () => null,
    showHead: false,
    subscribeToNewFriends: () => null
  };
  toggle() {
    LayoutAnimation.easeInEaseOut();
    if (this.state.icon == "chevron-down") {
      this.setState({
        icon: "chevron-up",
        height: null
      });
    } else {
      this.setState({
        icon: "chevron-down",
        height: responsiveHeight(15)
      });
    }
  }
  render() {
    const {
      details,
      viewingSelf,
      canAddBio,
      roles,
      user_info,
      title,
      viewPage,
      asurite,
      navigation,
      ownerAsurite
    } = this.props;
    let data = this.props.details;
    let blurbText =
      data && data[0] && data[0].bio !== null && data[0].bio != ""
        ? data[0].bio
        : "Add a bio";
    let shouldShowBio = false;
    let phoneNum = null;
    let callNum = null;
    if (
      (data && data[0] && data[0].bio !== null && data[0].bio.length > 0) ||
      (viewingSelf && canAddBio)
    ) {
      shouldShowBio = true;
    }
    let shouldShowPhone = false;
    if (
      (roles.indexOf("staff") > -1 || roles.indexOf("faculty") > -1) &&
      user_info &&
      user_info.phone
    ) {
      shouldShowPhone = true;
      callNum = user_info.phone;
      phoneNum = callNum.slice(0, 3) + "-" + callNum.slice(4);
    }
    let titleText = shouldShowBio ? title : "Contact";
    return (
      <View>
        <Analytics ref="analytics" />
        <View
          style={[styles.itemContBase, styles.itemContMain, styles.contWithSep]}
        >
          <View>
            <Text>{viewPage}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 8 }}>
              <Text style={[styles.mainTitle]}>{titleText}</Text>
            </View>
            {viewingSelf && canAddBio ? (
              <AddInfo
                type="bio"
                asurite={asurite}
                roles={roles}
                details={details}
                navigation={navigation}
                previousScreen={"my-profile"}
                previousSection={"biography"}
                resultingScreen={"edit-biography"}
              />
            ) : null}
          </View>
          <View style={[styles.tagCont]}>
            <ProfileTag
              text={asurite + "@asu.edu"}
              color="maroon"
              link={"mailto:" + asurite + "@asu.edu"}
              linkText="Email"
              navigation={navigation}
              asurite={asurite}
              ownerAsurite={ownerAsurite}
              previousSection={viewingSelf ? "my-profile" : "user-profile"}
              previousScreen={"profile"}
              icon="envelope"
            />
            {shouldShowPhone ? (
              <ProfileTag
                text={phoneNum}
                color="maroon"
                link={"tel://" + callNum}
                linkText="Phone"
                navigation={navigation}
                asurite={asurite}
                ownerAsurite={ownerAsurite}
                icon="phone"
                previousSection={viewingSelf ? "my-profile" : "user-profile"}
                previousScreen={"profile"}
              />
            ) : null}
          </View>
        </View>
        {shouldShowBio ? (
          <View
            style={[
              styles.itemContBase,
              styles.itemContMain,
              styles.contWithMargin
            ]}
          >
            <View style={[styles.textBlock, { height: this.state.height }]}>
              <Text style={[styles.blurb]}>{blurbText}</Text>
            </View>
            {blurbText.length > 50 ? (
              <TouchableOpacity
                style={[styles.expandIcon]}
                onPress={() => this.toggle()}
              >
                <FontAwesome
                  name={this.state.icon}
                  size={responsiveFontSize(2)}
                  color="#444444"
                  style={{ backgroundColor: "transparent", width: 25 }}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }
}
// export const BioBlock = AppSyncComponent(BioBlockX, getUserInformation, getProfileBlocks);
const styles = StyleSheet.create({
  mainTitle: {
    fontSize: responsiveFontSize(2.5),
    marginHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(2),
    fontWeight: "bold",
    color: "black",
    fontFamily: "Roboto"
  },
  label: {
    fontSize: responsiveFontSize(1.9),
    color: "black"
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
  itemContMain: {
    marginHorizontal: responsiveWidth(2.5),
    paddingHorizontal: responsiveWidth(5)
  },
  contWithSep: {
    marginTop: responsiveWidth(2.5),
    borderBottomWidth: 1,
    borderBottomColor: "#bcbcbc"
  },
  contWithMargin: {
    marginBottom: responsiveWidth(2.5)
  },
  tagCont: {
    flexDirection: "row",
    marginHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(2.5)
  },
  textBlock: {
    marginHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(2),
    overflow: "hidden"
  },
  expandIcon: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: responsiveHeight(2)
  },
  blurb: {
    color: "black",
    fontSize: responsiveFontSize(2),
    lineHeight: responsiveHeight(3.5)
  }
});
