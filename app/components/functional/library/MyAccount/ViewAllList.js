import React, { PureComponent } from "react";
import { Text, StyleSheet, View, ScrollView, Image } from "react-native";
import {
  responsiveWidth,
  responsiveFontSize,
  responsiveHeight
} from "react-native-responsive-dimensions";
import moment from "moment";
import Analytics from "./../../analytics";
import { tracker } from "../../../achievement/google-analytics";
// import { Divider } from "react-native-elements";

export class ViewAllList extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "my-account",
      "starting-section": "loans", 
      "target": "View All Button",
      "resulting-screen": "view-all-list", 
      "resulting-section": "loans",
    });
    tracker.trackEvent(
      "Page Load",
      "Library 'View All' page loaded for loans/requests."
    );
  };

  renderIcon = header => {
    return header === "Loans" ? (
      <Image
        style={styles.icon}
        source={require("../../assets/library/icon-loans.png")}
      />
    ) : (
      <Image
        style={styles.icon}
        source={require("../../assets/library/icon-requests.png")}
      />
    );
  };

  render() {
    const {
      header,
      data,
      renderLibText,
      dueDateText
    } = this.props.navigation.state.params;

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
          {this.renderIcon(header)}
          <Text style={styles.header}>{header}</Text>
        </View>

        {data.map((item, index) => {
          return (
            <View style={styles.listItem} key={index}>
              <Text
                style={{
                  flex: 1,
                  fontWeight: "700",
                  fontFamily: 'Roboto',
                  marginBottom: responsiveHeight(0.5)
                }}
                numberOfLines={1}
              >
                {item.title}
              </Text>

              {item.author ? (
                <Text style={{ color: "#222222" }}>{item.author}</Text>
              ) : null}

              <View
                style={{
                  flexDirection: "row",
                  marginBottom: responsiveHeight(0.5)
                }}
              >
                {renderLibText(item)}
              </View>

              <View style={{ flexDirection: "row" }}>
                <View style={styles.dueDate}>
                  {dueDateText(header)}
                  <Text style={{ fontWeight: "500", fontFamily: 'Roboto',}}>
                    {moment(item.due_date).format("MM/DD/YY, HH:mm")}
                  </Text>
                </View>
                <View style={{ flex: 1 }} />
              </View>
            </View>
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
