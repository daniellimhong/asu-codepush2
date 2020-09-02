import React, { PureComponent } from "react";
import { Text, StyleSheet, View, TouchableOpacity, Image } from "react-native";
import {
  responsiveWidth,
  responsiveFontSize,
  responsiveHeight
} from "react-native-responsive-dimensions";
import { Divider } from "react-native-elements";
import moment from "moment";
import TransitionView from "../../../universal/TransitionView";

const dueDateTextSize = 1.3;
const bellIcon = require("../../assets/library/icon-bell.png");
const loanIcon = require("../../assets/library/icon-loans.png");
const requestsIcon = require("../../assets/library/icon-requests.png");

export default class List extends PureComponent {
  static defaultProps = {
    data: []
  };

  dueDateText = headerType => {
    const { header } = this.props;

    if (header === "Loans" || headerType === "Loans") {
      return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontWeight: "500",
              fontFamily: "Roboto",
              fontSize: responsiveFontSize(dueDateTextSize)
            }}
          >
            Due:{" "}
          </Text>
        </View>
      );
    } else if (header === "Requests" || headerType === "Requests") {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Image style={styles.bellIcon} source={bellIcon} />
          <Text
            style={{
              fontWeight: "500",
              fontFamily: "Roboto",
              fontSize: responsiveFontSize(dueDateTextSize)
            }}
          >
            {" "}
            On Hold Shelf until{" "}
          </Text>
        </View>
      );
    } else {
      console.log("Something went wrong with dueDateText()...");
      return null;
    }
  };

  renderLibText = library => {
    const { header } = this.props;
    if (header === "Requests") {
      return (
        <Text
          style={{ color: "black", fontWeight: "bold", fontFamily: "Roboto" }}
        >
          Pickup:{" "}
          <Text
            style={{
              color: "#222222",
              fontWeight: "normal",
              fontFamily: "Roboto"
            }}
          >
            {library.pickup_location}
          </Text>
        </Text>
      );
    } else {
      console.log("Something went wrong with renderLibText()...");
      return null;
    }
  };

  onPressHandler = () => {
    const { navigation, data, header } = this.props;
    navigation.navigate("ViewAllList", {
      data,
      header,
      renderLibText: this.renderLibText,
      dueDateText: this.dueDateText
    });
  };

  renderData = () => {
    const { data } = this.props;
    if (data.length) {
      return data.slice(0, 3).map((item, index) => {
        return (
          <TransitionView
            index={index}
            style={{ marginBottom: responsiveHeight(2), borderRadius: 2 }}
            key={index}
          >
            <Text
              style={{
                flex: 1,
                fontWeight: "700",
                fontFamily: "Roboto",
                marginBottom: responsiveHeight(0.8)
              }}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            {item.author ? (
              <Text
                style={{ color: "#222222", fontSize: responsiveFontSize(1.5) }}
              >
                {item.author}
              </Text>
            ) : null}

            <View
              style={{
                flexDirection: "row",
                marginBottom: responsiveHeight(0.8)
              }}
            >
              <Text style={{ fontSize: responsiveFontSize(1.5) }}>
                {this.renderLibText(item)}
              </Text>
            </View>

            <View style={{ flexDirection: "row" }}>
              <View style={styles.dueDate}>
                {this.dueDateText()}
                <Text
                  style={{
                    fontWeight: "500",
                    fontFamily: "Roboto",
                    fontSize: responsiveFontSize(dueDateTextSize)
                  }}
                >
                  {moment(item.due_date).format("MM/DD/YY")}
                </Text>
              </View>
              <View style={{ flex: 1 }} />
            </View>

            {data.length === 1 ? null : (
              <Divider style={{ marginTop: responsiveHeight(2) }} />
            )}
          </TransitionView>
        );
      });
    } else {
      const { header } = this.props;
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: responsiveHeight(2)
          }}
        >
          <Text>You have no {header.toLowerCase()} out right now.</Text>
        </View>
      );
    }
  };

  renderViewAllButton = () => {
    const { data, header } = this.props;
    if (data.length >= 3) {
      return (
        <TouchableOpacity
          onPress={() => this.onPressHandler(header.toUpperCase())}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllButtonText}>
            VIEW ALL {data.length > 0 ? data.length : null}{" "}
            {header.toUpperCase()}
          </Text>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };

  renderIcon = header => {
    return header === "Loans" ? (
      <Image style={styles.icon} source={loanIcon} />
    ) : (
      <Image style={styles.icon} source={requestsIcon} />
    );
  };

  render() {
    const { header } = this.props;

    return (
      <View style={styles.body}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyConent: "center",
            marginBottom: responsiveWidth(4.5),
            marginTop: responsiveWidth(1.5)
          }}
        >
          {this.renderIcon(header)}
          <Text style={styles.header}>{header}</Text>
        </View>
        {this.renderData()}
        {this.renderViewAllButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    padding: responsiveWidth(3),
    marginTop: responsiveHeight(2),
    fontSize: responsiveFontSize(1.5),
    backgroundColor: "white",
    elevation: 3,
    shadowOffset: {
      width: responsiveHeight(0.5),
      height: responsiveHeight(0.5)
    },
    shadowColor: "black",
    shadowOpacity: 0.15,
    shadowRadius: responsiveHeight(0.5)
  },
  header: {
    fontWeight: "900",
    fontFamily: "Roboto",
    fontSize: responsiveFontSize(2)
  },
  viewAllButton: {
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#2A2B2F",
    borderRadius: 50,
    width: responsiveWidth(50),
    padding: responsiveWidth(2)
  },
  viewAllButtonText: {
    alignSelf: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: responsiveFontSize(1.25),
    fontFamily: "Roboto"
  },
  dueDate: {
    borderRadius: 2,
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#E3E3E3",
    fontSize: responsiveFontSize(1.3),
    paddingVertical: responsiveWidth(1.5),
    paddingHorizontal: responsiveWidth(3)
  },
  icon: {
    height: responsiveWidth(8),
    width: responsiveWidth(8),
    alignItems: "center",
    marginRight: responsiveWidth(3)
  },
  bellIcon: {
    height: responsiveWidth(4),
    width: responsiveWidth(4),
    alignItems: "center",
    marginRight: responsiveWidth(2)
  }
});
