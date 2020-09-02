import React, { PureComponent } from "react";
import { Text, StyleSheet, View, Image, TouchableOpacity } from "react-native";

import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import moment from "moment";
import { Divider } from "react-native-elements";

import TransitionView from "../../../universal/TransitionView";

export class Fines extends PureComponent {
  renderBlockMessages = () => {
    return null;
    // CODE FOR WHEN WE GET BLOCK AND MESSAGES UP AND RUNNING:
    // return (
    //   <View>
    //     <Divider />
    //     <View
    //       style={[styles.iconContainer, { marginTop: responsiveWidth(4.5) }]}
    //     >
    //       <Image
    //         style={styles.icon}
    //         source={require("../../assets/library/icon-fines-fees.png")}
    //       />
    //       <Text
    //         style={{
    //           fontWeight: "900",
    //           fontFamily: 'Roboto',
    //           fontSize: responsiveFontSize(2)
    //         }}
    //       >
    //         Block and Messages
    //       </Text>
    //     </View>
    //     <View style={{ flex: 1, marginBottom: responsiveWidth(3) }}>
    //       <Text style={{ color: "#222222" }}>
    //         Disruptive behavior in library (GLOBAL)
    //       </Text>
    //     </View>
    //   </View>
    // );
  };

  renderViewAllButton = () => {
    const { data, header } = this.props;
    if (data.length >= 3) {
      return (
        <View>
          <Divider style={{ marginVertical: responsiveHeight(2) }} />
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate("ViewAllListFines", {
                data: this.props.data
              })
            }
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllButtonText}>
              VIEW ALL {data.length > 0 ? data.length : null} FINES & FEES
            </Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return null;
    }
  };

  render() {
    return (
      <View style={styles.body}>
        <View style={styles.iconContainer}>
          <Image
            style={styles.icon}
            source={require("../../assets/library/icon-fines-fees.png")}
          />
          <Text
            style={{
              fontWeight: "900",
              fontFamily: 'Roboto',
              fontSize: responsiveFontSize(2)
            }}
          >
            Fines and Fees
          </Text>
        </View>
        {this.props.data.length ? (
          this.props.data.map((item, index) => {
            item.title = item.title ? item.title : "Fine";
            return (
              <TransitionView
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: responsiveWidth(3)
                }}
                key={index}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    justifyContent: "center"
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontFamily: "Roboto",
                      fontSize: responsiveFontSize(1.8)
                    }}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      color: "#222222",
                      marginTop: responsiveHeight(0.6),
                      fontSize: responsiveFontSize(1.5)
                    }}
                  >
                    Fine Date:{" "}
                    <Text>{moment(item.creation_time).format("MM/DD/YY")}</Text>
                  </Text>
                  <Text
                    style={{
                      color: "#222222",
                      marginTop: responsiveHeight(0.8),
                      fontSize: responsiveFontSize(1.5)
                    }}
                  >
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
          })
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: responsiveHeight(2)
            }}
          >
            <Text>You have no fines or fees at the moment.</Text>
          </View>
        )}
        {this.renderViewAllButton()}
        {this.renderBlockMessages()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
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
  iconContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: responsiveWidth(4.5),
    marginTop: responsiveWidth(1.5)
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
  }
});
