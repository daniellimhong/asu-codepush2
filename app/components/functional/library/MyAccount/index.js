import React, { PureComponent } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Linking,
  ActivityIndicator
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";

import { TouchableOpacity } from "react-native-gesture-handler";
import Analytics from "../../analytics";
import { tracker } from "../../../achievement/google-analytics";
import { SettingsContext } from "../../../achievement/Settings/Settings";
import List from "./List";
import { Fines } from "./Fines";
import TransitionView from "../../../universal/TransitionView";
import { Api, Auth } from "../../../../services";

const myAccountUrl =
  "https://arizona-asu-primo.hosted.exlibrisgroup.com/primo-explore/account?vid=01ASU&lang=en_US";
const finesUrl = "https://lib.asu.edu/access/paying";

export class MyAccountX extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loans: [],
      requests: [],
      fines: [],
      totalFines: 0,
      loading: true
    };
  }

  componentDidMount = async () => {
    tracker.trackEvent("Page Load", "Library 'My Account' page loaded.");
    this.getUserInfo();
  };

  getUserInfo = () => {
    const baseUrl =
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod";

    Auth()
      .getSession("edu.asu.asumobileapp")
      .then(tokens => {
        const apiService = new Api(baseUrl, tokens);

        apiService
          .get("/library/myaccount")
          .then(resp => {
            if (resp && resp.errorMessage) {
              console.log("error: ", resp.errorMessage);
            } else {
              let dataFee = [];
              let totalFines = 0;
              let loans = [];
              let userReq = [];

              if (resp.fines && resp.fines.total_record_count > 0) {
                dataFee = resp.fines.fee;
                totalFines = resp.fines.total_sum;
              }

              if (resp.loans) {
                loans = resp.loans.item_loan;
              }

              if (resp.requests) {
                userReq = resp.requests.user_request;
              }

              this.setState({
                loading: false,
                fines: dataFee,
                totalFines,
                loans,
                requests: userReq
              });
            }
          })
          .catch(error => {
            console.log("Failed from studyrooms lambda", error);
            reject(new Error("Failed"));
          });
      })
      .catch(err => {
        console.log("API ERROR", err);
        reject(new Error("Failed"));
      });
  };

  // https://arizona-asu-primo.hosted.exlibrisgroup.com/primo-explore/account?vid=01ASU&lang=en_US

  onPressHandler = (url, title) => {
    const { navigation } = this.props;
    // const url = "https://lib.asu.edu/policies/fines";

    Linking.canOpenURL(url).then(supported => {
      // console.log("link supported: ", supported);
      if (supported) {
        const params = {
          url,
          title
        };
        if (title === "My Account") {
          params.forceGoBack = true;
        }
        navigation.navigate("InAppLink", params);

        this.refs.analytics.sendData({
          "action-type": "click",
          "starting-screen": "my-account",
          "starting-section": null, 
          "target": title,
          "resulting-screen": "in-app-browser", 
          "resulting-section": null,
        });
        tracker.trackEvent(
          "Navigate",
          "Pressed button on library my account page."
        );
      } else {
        console.error(`Don't know how to open URI: ${url}`);
      }
    });
  };

  render() {
    const { totalFines, loading, fines, loans, requests } = this.state;
    const { navigation } = this.props;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: "#E2E2E2" }}>
        <Analytics ref="analytics" />
        <View style={styles.header}>
          <Text style={styles.headerText}>My Library Account</Text>
          <View style={styles.balanceDueContainer}>
            <Text style={{ color: "white" }}>Balance Due: </Text>
            <View style={{ flex: 1 }} />
            <Text style={{ color: "white", fontWeight: "bold", fontFamily: "Roboto" }}>
              {totalFines}
            </Text>
          </View>

          <View style={{ flexDirection: "row" }}>

            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={[styles.buttonBase, styles.finesButton]}
                onPress={() => this.onPressHandler(finesUrl, "Library Fines")}
              >
                <Text
                  style={{
                    alignSelf: "center",
                    fontWeight: "bold",
                    fontFamily: "Roboto",
                    fontSize: responsiveFontSize(1.25)
                  }}
                >
                  ABOUT FINES
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={[styles.buttonBase, styles.acctButton]}
                onPress={() => this.onPressHandler(myAccountUrl, "My Account")}>
                <Text
                  style={{
                    alignSelf: "center",
                    fontWeight: "bold",
                    fontFamily: "Roboto",
                    fontSize: responsiveFontSize(1.25)
                  }}
                >
                  ACCOUNT DETAILS
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {loading ? (
            <View
              style={[styles.loadingBody, { marginTop: responsiveHeight(20) }]}
            >
              <ActivityIndicator
                size="large"
                color="maroon"
                style={{ alignSelf: "center" }}
              />
            </View>
          ) : (
            <View>
              <TransitionView index={1}>
                <Fines data={fines} navigation={navigation} />
              </TransitionView>

              <TransitionView index={3}>
                <List header="Loans" data={loans} navigation={navigation} />
              </TransitionView>

              <TransitionView index={5}>
                <List
                  header="Requests"
                  data={requests}
                  navigation={navigation}
                />
              </TransitionView>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }
}

export default class MyAccount extends React.PureComponent {
  render() {
    return (
      <SettingsContext.Consumer>
        {settings => <MyAccountX {...this.props} settings={settings} />}
      </SettingsContext.Consumer>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    padding: responsiveWidth(4),
    backgroundColor: "#E2E2E2"
  },
  header: {
    flexDirection: "column",
    backgroundColor: "#2A2B2F",
    padding: responsiveWidth(7.5),
    height: responsiveHeight(20)
  },
  headerText: {
    color: "white",
    fontSize: responsiveFontSize(3),
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  buttonBase: {
    borderRadius: 50,
    alignSelf: "center",
    // paddingHorizontal: responsiveWidth(5),
    justifyContent: "center",
    marginVertical: responsiveHeight(1),
    paddingVertical: responsiveHeight(1)
  },
  finesButton: {
    backgroundColor: "#FDB20E",
    paddingHorizontal: responsiveWidth(9)
  },
  acctButton: {
    backgroundColor: "#f1f1f1",
    paddingHorizontal: responsiveWidth(5)
  },
  balanceDueContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    marginVertical: responsiveHeight(1)
  }
});
