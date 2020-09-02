import React, { PureComponent } from "react";
import { Text, StyleSheet, View, ScrollView, Image } from "react-native";
import {
  responsiveWidth,
  responsiveFontSize,
  responsiveHeight
} from "react-native-responsive-dimensions";
import moment from "moment";
import TransitionView from "../../../universal/TransitionView";
import Analytics from "../../analytics";
import { tracker } from "../../../achievement/google-analytics";
// import { Divider } from "react-native-elements";

export class ViewAllListFines extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "my-account",
      "starting-section": "fines", 
      "target": "View All Button",
      "resulting-screen": "view-all-list", 
      "resulting-section": "fines",
    });
    tracker.trackEvent("Page Load", "Library 'View All Fines' page loaded.");
  };

  render() {
    const { data } = this.props.navigation.state.params;

    return (
      <ScrollView
        style={{
          flex: 1,
          padding: responsiveWidth(3),
          backgroundColor: "#E2E2E2"
        }}
      >
        <Analytics ref="analytics" />
        <View style={styles.headerContainer}>
          <Image
            style={styles.icon}
            source={require("../../assets/library/icon-fines-fees.png")}
          />
          <Text style={styles.header}>Fines and Fees</Text>
        </View>

        {data.map((item, index) => {
          return (
            <TransitionView style={styles.listItem} key={index}>
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "center"
                }}
              >
                <Text style={{ fontWeight: "bold", fontFamily: "Roboto" }} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={{ color: "#222222" }}>
                  Fine Date:{" "}
                  <Text>{moment(item.creation_time).format("MM/DD/YY")}</Text>
                </Text>
                <Text style={{ color: "#222222" }}>
                  <Text style={{ fontWeight: "bold", fontFamily: "Roboto", color: "black" }}>
                    Reason:{" "}
                  </Text>
                  {item.comment}
                </Text>
              </View>
              <View style={{ flex: 0.25, alignItems: "center" }}>
                <Text style={{ fontWeight: "bold", fontFamily: "Roboto" }}>${item.balance}</Text>
              </View>
            </TransitionView>
          );
        })}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  dueDate: {
    borderRadius: 2,
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#E3E3E3",
    paddingVertical: responsiveWidth(1.5),
    paddingHorizontal: responsiveWidth(2)
  },
  header: {
    fontWeight: "900",
    fontFamily: 'Roboto',
    fontSize: responsiveFontSize(2)
  },
  listItem: {
    flexDirection: "row",
    marginBottom: responsiveHeight(2),
    borderRadius: 2,
    backgroundColor: "white",
    padding: responsiveWidth(3),
    elevation: 3,
    shadowOffset: {
      width: responsiveHeight(0.5),
      height: responsiveHeight(0.5)
    },
    shadowColor: "black",
    shadowOpacity: 0.15,
    shadowRadius: responsiveHeight(0.5)
  },
  icon: {
    height: responsiveWidth(8),
    width: responsiveWidth(8),
    alignItems: "center",
    marginRight: responsiveWidth(3)
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveWidth(4.5),
    marginTop: responsiveWidth(1.5)
  }
});
