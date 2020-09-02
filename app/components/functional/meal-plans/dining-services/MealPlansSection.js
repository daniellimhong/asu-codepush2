import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import {
  compareDisplayOrder,
  removeMinusFromString,
  splitStringAtBrackets,
  createMealAmountString,
  createMealBalanceString,
  splitStringAtFirst,
  capitalizeFirstLetter,
  filterAllTransactions
} from "../utility";
import Analytics from "../../analytics";
import { tracker } from "../../../achievement/google-analytics";
import PressedWrapper from "../PressedWrapper";

const BORDER_COLOR = "rgb(203, 203, 203)";
const MAROON = "rgb(212, 0, 77)";

export default class MealPlansSection extends PureComponent {
  state = {
    totalAvailable: 0,
    mAndGPlans: null,
    mealPlans: null
  };

  componentDidMount() {
    if (this.props.which === "maroonGold") {
      this.setMAndGPlans();
      const allTransactions = filterAllTransactions(
        "m&g",
        this.props.transactions
      );
      // console.log("filterAllTransactions ", allTransactions);
      this.setState({ allTransactionsFilteredData: allTransactions });
    } else if (this.props.which === "mealPlans") {
      this.setMealPlans();
      const allTransactions = filterAllTransactions(
        "meal",
        this.props.transactions
      );
      // console.log("allTransactions ", allTransactions);
      this.setState({ allTransactionsFilteredData: allTransactions });
    }
  }

  linkHandler = (title, url) => {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "dining-services",
      "starting-section": null, 
      "target": title,
      "resulting-screen": "in-app-browser", 
      "resulting-section": null,
      "action-metadata":{
        "action": this.props.which,
        "isStudent": this.state.isStudent,
        "eventID": "cardButton-"+this.props.which
      }
    });
    tracker.trackEvent("Click", `Pressed button for: ${title}`);
    this.props.navigation.navigate("InAppLink", {
      url,
      title
    });
  };

  setMAndGPlans = () => {
    const visibleArrayOfPlans = this.props.mealPlans.filter(v => {
      return v.visible && v.type === "M&G Dollars";
    });
    let totalAvailable = 0;
    for (let i = 0; i < visibleArrayOfPlans.length; i++) {
      totalAvailable += Number(visibleArrayOfPlans[i].balance);
    }
    totalAvailable = totalAvailable.toFixed(2);
    // console.log("totalAvailable ", totalAvailable);
    // console.log("visibleArrayOfPlans ", visibleArrayOfPlans);
    const sortedArrayOfPlans = visibleArrayOfPlans.sort(compareDisplayOrder);
    // console.log("sortedArrayOfPlans", sortedArrayOfPlans);
    const result = sortedArrayOfPlans.map((v, i, a) => {
      let extraStyleObj = {};
      if (i === sortedArrayOfPlans.length - 1) {
        extraStyleObj = { borderBottomWidth: 0 };
      }
      return (
        <View style={styles.middleBoxContainer} key={i}>
          <View style={styles.middleBoxContainerLeft}>
            <Text style={styles.middleBoxContainerHeaderText}>
              {v.displayName}
            </Text>
          </View>
          <View style={[styles.middleBoxContainerRight, extraStyleObj]}>
            <Text style={styles.middleBoxContainerTextRight}>
              ${Number(v.balance).toFixed(2)}
            </Text>
          </View>
        </View>
      );
    });
    this.setState({
      totalAvailable,
      mAndGPlans: result
    });
  };

  setMealPlans = () => {
    const visibleArrayOfPlans = this.props.mealPlans.filter(v => {
      return v.visible && v.type === "Meal Plan";
    });
    let totalAvailable = 0;
    for (let i = 0; i < visibleArrayOfPlans.length; i++) {
      totalAvailable += Number(visibleArrayOfPlans[i].balance);
    }
    // console.log("totalAvailable ", totalAvailable);
    // console.log("visibleArrayOfPlans ", visibleArrayOfPlans);
    const sortedArrayOfPlans = visibleArrayOfPlans.sort(compareDisplayOrder);
    // console.log("sortedArrayOfPlans", sortedArrayOfPlans);
    const greyTextBelow = (
      <Text style={styles.middleBoxContainerText}>11/wks + 16 Flex Meals</Text>
    );
    const result = sortedArrayOfPlans.map((v, i, a) => {
      let extraStyleObj = {};
      if (i === sortedArrayOfPlans.length - 1) {
        extraStyleObj = { borderBottomWidth: 0 };
      }
      // let arrayOfWhatToShow = splitStringAtBrackets(v.displayName);
      const title = splitStringAtFirst(v.displayName);
      return (
        <View style={styles.middleBoxContainer} key={i}>
          <View style={styles.middleBoxContainerLeft}>
            <Text style={styles.middleBoxContainerHeaderText}>
              {v.displayName}
            </Text>
          </View>
          <View style={styles.middleBoxContainerRight}>
            <Text style={styles.middleBoxContainerTextRight}>{v.balance}</Text>
          </View>
        </View>
      );
    });
    this.setState({
      totalAvailable,
      mealPlans: result
    });
  };

  navigationHandler = () => {
    let whichTitle;
    if (this.props.which === "mealPlans") {
      whichTitle = "All Meal Transactions";
    } else if (this.props.which === "maroonGold") {
      whichTitle = "All M&G Transactions";
    } else {
      whichTitle = "All Transactions";
    }
    this.props.navigation.navigate("AllTransactions", {
      data: this.state.allTransactionsFilteredData,
      whichTitle
    });
  };

  render() {
    // console.log("all props ", this.props);
    let whatToShow;
    const whereToNavigate = this.state.allTransactionsFilteredData
      ? () => this.navigationHandler()
      : () => console.log("no data");
    const whichData =
      this.props.which === "mealPlans"
        ? this.state.mealPlans
        : this.state.mAndGPlans;
    const whichButtonText =
      whichData && whichData.length > 0
        ? "VIEW ALL TRANSACTIONS"
        : "SIGNUP NOW!";
    const bottomBox =
      (whichData && whichData.length === 0) ||
      (this.state.allTransactionsFilteredData &&
        this.state.allTransactionsFilteredData.length > 0) ? (
        <View style={styles.bottomBox}>
          <PressedWrapper
            style={styles.bottomBoxButton}
            onPress={whereToNavigate}
          >
            <Text style={styles.bottomBoxButtonText}>{whichButtonText}</Text>
          </PressedWrapper>
        </View>
      ) : null;
    let description;
    let isDescriptionLong;
    if (this.props.lastMAndGTransaction) {
      description = `${capitalizeFirstLetter(
        this.props.lastMAndGTransaction.action
      )}: ${this.props.lastMAndGTransaction.description}`;
      // console.log("length of description ", description && description.length);
      isDescriptionLong = description.length > 30;
    }
    const lastMAndGTransaction = this.props.lastMAndGTransaction ? (
      <View
        style={[
          styles.middleBoxContainer,
          { width: responsiveWidth(94), padding: responsiveWidth(4) }
        ]}
      >
        <Text style={styles.middleBoxContainerHeaderText}>
          Last M&G Transaction
        </Text>
        <View style={styles.lastTransactionBottomBox}>
          <View style={styles.middleBoxContainerBox}>
            <Text style={[styles.middleBoxContainerText, { color: "black" }]}>
              {description}
            </Text>
            <Text style={styles.middleBoxGreyText}>
              {this.props.lastMAndGTransaction.time}
            </Text>
          </View>
          <View style={styles.middleBoxContainerBox}>
            <Text
              style={[
                styles.middleBoxGreyText,
                { alignSelf: isDescriptionLong ? "flex-start" : "flex-start" }
              ]}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  color: "black",
                  fontFamily: "Roboto"
                }}
              >
                Amount:{" "}
              </Text>
              $
              {Number(
                removeMinusFromString(this.props.lastMAndGTransaction.amount)
              ).toFixed(2)}
            </Text>
            <Text
              style={[styles.middleBoxGreyText, { alignSelf: "flex-start" }]}
            >
              <Text style={{ fontWeight: "bold", fontFamily: "Roboto", color: "black" }}>
                Balance:{" "}
              </Text>
              $
              {Number(
                removeMinusFromString(this.props.lastMAndGTransaction.balance)
              ).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    ) : null;
    const lastMealTransaction = this.props.lastDiningTransaction ? (
      <View
        style={[
          styles.middleBoxContainer,
          { width: responsiveWidth(94), padding: responsiveWidth(4) }
        ]}
      >
        <Text style={styles.middleBoxContainerHeaderText}>
          Last Meal Plan Transaction
        </Text>
        <View style={styles.lastTransactionBottomBox}>
          <View style={styles.middleBoxContainerBox}>
            <Text style={[styles.middleBoxContainerText, { color: "black" }]}>
              {capitalizeFirstLetter(this.props.lastDiningTransaction.action)}:{" "}
              {this.props.lastDiningTransaction.description}
            </Text>
            <Text style={styles.middleBoxGreyText}>
              {this.props.lastDiningTransaction.time}
            </Text>
          </View>
          <View style={styles.middleBoxContainerBox}>
            <Text style={[styles.middleBoxGreyText]}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontFamily: "Roboto",
                  color: "black"
                }}
              >
                Amount:{" "}
              </Text>
              {createMealAmountString(this.props.lastDiningTransaction.amount)}
            </Text>
            <Text style={[styles.middleBoxGreyText]}>
              <Text style={{ fontWeight: "bold", fontFamily: "Roboto", color: "black" }}>
                Balance:{" "}
              </Text>
              {createMealAmountString(this.props.lastDiningTransaction.balance)}
            </Text>
          </View>
        </View>
      </View>
    ) : null;

    if (this.props.which === "mealPlans") {
      // MEAL PLANS SECTION FOR DISPLAYING THEIR MEAL PLANS
      const mealsLeftBox =
        this.state.mealPlans && this.state.mealPlans.length > 0 ? (
          <View
            style={[
              styles.middleBoxContainer,
              { alignSelf: "flex-end", borderBottomWidth: 0 }
            ]}
          >
            <Text style={[styles.middleBoxContainerText, { color: "black" }]}>
              Meals Left
            </Text>
          </View>
        ) : null;
      whatToShow = this.props.mealPlans ? (
        <View style={styles.container}>
          <View style={styles.topBox}>
            <View style={styles.topBoxFirst}>
              <Image
                source={require("../../assets/dining/mg-icon.png")}
                style={styles.imageIcon}
                resizeMode="stretch"
              />
              <Text style={styles.topBoxHeaderText}> Meal Plans</Text>
            </View>
            <View style={styles.topBoxSecond}>
              <Text style={styles.topBoxText}>Meals Available: </Text>
              <View style={styles.topBoxSecondNumberBox}>
                <Text style={styles.topBoxSecondNumberBoxText}>
                  {this.state.totalAvailable}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.middleBox}>
            {mealsLeftBox}
            {this.state.mealPlans && this.state.mealPlans.length > 0
              ? this.state.mealPlans
              : null}
          </View>
          {lastMealTransaction}
          {
            // Where bottomBox will go if there is a VIEW ALL TRANSACTIONS LINK
            bottomBox
          }
        </View>
      ) : null;
    } else if (this.props.which === "maroonGold") {
      // MAROON AND GOLD SECTION FOR DISPLAYING THEIR MAROON AND GOLD BALANCES
      whatToShow = this.props.mealPlans ? (
        <View style={styles.container}>
          <View style={styles.topBox}>
            <View style={styles.topBoxFirst}>
              <Image
                source={require("../../assets/dining/meal-plan-icon.png")}
                style={styles.imageIcon}
                resizeMode="stretch"
              />
              <Text style={styles.topBoxHeaderText}> Maroon & Gold</Text>
            </View>
            <View style={styles.topBoxSecond}>
              <Text style={styles.topBoxText}>Available: </Text>
              <View style={styles.topBoxSecondNumberBox}>
                <Text style={styles.topBoxSecondNumberBoxText}>
                  ${this.state.totalAvailable}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.middleBox}>
            <View
              style={[
                styles.middleBoxContainer,
                { alignSelf: "flex-end", borderBottomWidth: 0 }
              ]}
            >
              <Text style={[styles.middleBoxContainerText, { color: "black" }]}>
                Balance
              </Text>
            </View>
            {this.state.mAndGPlans}
          </View>
          {lastMAndGTransaction}
          {
            // Where bottomBox will go if there is a VIEW ALL TRANSACTIONS LINK
            bottomBox
          }
        </View>
      ) : null;
    } else if (this.props.which === "links") {
      // LINKS SECTION FOR DISPLAYING LINKS
      if (this.props.links && this.props.links.length > 0) {
        // console.log("links array ", this.props.links);
        const arrayOfLinks = this.props.links.map((v, i, a) => {
          return (
            <PressedWrapper
              onPress={() => this.linkHandler(v.title, v.url)}
              style={styles.linksItemBox}
              key={i}
            >
              <Text style={styles.linksText}>{v.title} </Text>
              <Image
                source={require("../../assets/dining/external-icon.png")}
                style={{
                  width: responsiveWidth(3),
                  height: responsiveWidth(3)
                }}
                resizeMode="stretch"
              />
            </PressedWrapper>
          );
        });
        whatToShow = (
          <View style={styles.container}>
            <View style={[styles.topBox, { justifyContent: "flex-start" }]}>
              <View style={styles.topBoxFirst}>
                <Image
                  source={require("../../assets/dining/links-icon.png")}
                  style={styles.imageIcon}
                  resizeMode="stretch"
                />
                <Text style={styles.topBoxHeaderText}> Links</Text>
              </View>
            </View>
            <View
              style={{
                width: "100%",
                paddingHorizontal: responsiveWidth(4),
                paddingVertical: responsiveWidth(5)
              }}
            >
              {arrayOfLinks}
            </View>
          </View>
        );
      } else {
        whatToShow = null;
      }
    } else if (this.props.which === "empty") {
      // If they have not signed up
      whatToShow =
        this.props.signup !== "loading" ? (
          <View style={styles.container}>
            <View style={[styles.topBox, { justifyContent: "flex-start" }]}>
              <View style={styles.topBoxFirst}>
                <Image
                  source={require("../../assets/dining/meal-plan-icon.png")}
                  style={styles.imageIcon}
                  resizeMode="stretch"
                />
                <Text style={styles.topBoxHeaderText}>
                  {" "}
                  {this.props.signup.title}
                </Text>
              </View>
            </View>
            <View
              style={{
                width: "100%",
                paddingHorizontal: responsiveWidth(4),
                paddingVertical: responsiveWidth(5)
              }}
            >
              <Text style={styles.linksText}>{this.props.signup.text}</Text>
              <TouchableOpacity
                onPress={() =>
                  this.linkHandler(
                    this.props.signup.linkText,
                    this.props.signup.linkUrl
                  )
                }
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: responsiveWidth(3)
                }}
              >
                <Text style={[styles.linksText, { color: "rgb(121, 0, 44)" }]}>
                  {this.props.signup.linkText}{" "}
                </Text>
                <Image
                  source={require("../../assets/dining/external-icon.png")}
                  style={{
                    width: responsiveWidth(3),
                    height: responsiveWidth(3)
                  }}
                  resizeMode="stretch"
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : null;
    } else {
      // If which is not set to any of them then return null
      whatToShow = null;
    }
    return (
      <View
        style={{
          backgroundColor: this.state.modalVisible
            ? "rgba(0, 0, 0, 0.6)"
            : "transparent"
        }}
      >
        <Analytics ref="analytics" />
        {whatToShow}
      </View>
    );
  }
}

MealPlansSection.propTypes = {
  which: PropTypes.string.isRequired,
  transactions: PropTypes.array,
  mealPlans: PropTypes.array,
  navigation: PropTypes.object,
  lastMAndGTransaction: PropTypes.object,
  lastDiningTransaction: PropTypes.object,
  asurite: PropTypes.string,
  links: PropTypes.array
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: responsiveWidth(3),
    marginVertical: responsiveWidth(4),
    marginBottom: 0,
    shadowColor: "grey",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    elevation: 10
  },
  topBox: {
    width: responsiveWidth(94),
    paddingVertical: responsiveWidth(5),
    paddingHorizontal: responsiveWidth(5),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgb(60, 60, 60)"
  },
  topBoxFirst: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  topBoxHeaderText: {
    fontSize: responsiveFontSize(1.75),
    color: "white",
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  topBoxText: {
    fontSize: responsiveFontSize(1.5),
    color: "white"
  },
  topBoxSecond: {
    flexDirection: "row",
    alignItems: "center"
  },
  topBoxSecondNumberBox: {
    backgroundColor: MAROON,
    paddingVertical: responsiveWidth(0.5),
    paddingHorizontal: responsiveWidth(1.5),
    borderRadius: 5
  },
  topBoxSecondNumberBoxText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  middleBox: {
    flexDirection: "column",
    width: responsiveWidth(86)
  },
  middleBoxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: responsiveWidth(2),
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR
  },
  middleBoxContainerLeft: {
    flex: 4
  },
  middleBoxContainerRight: {
    flex: 1
  },
  middleBoxContainerHeaderText: {
    fontSize: responsiveFontSize(1.6),
    color: "black",
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  middleBoxContainerText: {
    fontSize: responsiveFontSize(1.6),
    color: "grey"
  },
  middleBoxContainerTextRight: {
    fontSize: responsiveFontSize(1.6),
    color: "black",
    alignSelf: "flex-end"
  },
  middleBoxGreyText: {
    fontSize: responsiveFontSize(1.4),
    color: "grey"
  },
  lastTransactionBottomBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%"
  },
  middleBoxContainerBox: {
    justifyContent: "space-around"
  },
  bottomBox: {
    width: "100%",
    marginHorizontal: responsiveWidth(2),
    paddingVertical: responsiveWidth(5),
    paddingHorizontal: responsiveWidth(15),
    borderTopColor: BORDER_COLOR,
    borderTopWidth: 1
  },
  bottomBoxButton: {
    borderWidth: 0.7,
    borderColor: "black",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    padding: responsiveWidth(2)
  },
  bottomBoxButtonText: {
    fontSize: responsiveFontSize(1.2),
    color: "black",
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  linksItemBox: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: responsiveWidth(1)
  },
  linksText: {
    fontSize: responsiveFontSize(1.9),
    color: "black"
  },
  imageIcon: {
    width: responsiveWidth(8),
    height: responsiveWidth(8)
  },
  deactivateButton: {
    width: responsiveWidth(30),
    justifyContent: "center",
    alignItems: "center",
    padding: responsiveWidth(1.4),
    margin: responsiveWidth(1.8),
    borderRadius: 15
  }
});
