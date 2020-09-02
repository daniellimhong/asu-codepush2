import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
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

const MAROON = "rgb(212, 0, 77)";

export default class LostCardSection extends PureComponent {
  _renderButton = () => {
    const {
      cardStatus,
      cardButtonLoading,
      toggleStatusCard,
      setModalVisible
    } = this.props;
    if (!this.props.cardStatus) {
      return null;
    } else {
      if (cardStatus === "Active" && !cardButtonLoading) {
        return (
          <TouchableOpacity
            style={[styles.deactivateButton, { backgroundColor: MAROON }]}
            // onPress={() => toggleStatusCard("Lost")}
            onPress={() => setModalVisible(true, "Lost")}
          >
            <Text style={styles.buttonText}>DEACTIVATE</Text>
          </TouchableOpacity>
        );
      } else if (cardStatus === "Lost" && !cardButtonLoading) {
        return (
          <TouchableOpacity
            style={[
              styles.deactivateButton,
              { backgroundColor: "rgb(0, 182, 7)" }
            ]}
            // onPress={() => toggleStatusCard("Active")}
            onPress={() => setModalVisible(true, "Active")}
          >
            <Text style={styles.buttonText}>ACTIVATE</Text>
          </TouchableOpacity>
        );
      } else if (cardStatus === "Lost" && cardButtonLoading) {
        return (
          <TouchableOpacity
            style={[
              styles.deactivateButton,
              { backgroundColor: "rgb(0, 182, 7)" }
            ]}
          >
            <ActivityIndicator color="white" />
          </TouchableOpacity>
        );
      } else if (cardStatus === "Active" && cardButtonLoading) {
        return (
          <TouchableOpacity
            style={[styles.deactivateButton, { backgroundColor: MAROON }]}
          >
            <ActivityIndicator color="white" size="small" />
          </TouchableOpacity>
        );
      }
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.box}>
          <View style={styles.topBox}>
            <View style={styles.topBoxFirst}>
              <Image
                source={require("../../assets/dining/mg-icon.png")}
                style={styles.imageIcon}
                resizeMode="stretch"
              />
              <Text style={styles.topBoxHeaderText}>
                {" "}
                Lost or Stolen Sun Card
              </Text>
            </View>
          </View>
          <View style={styles.bottomBox}>
            <Text style={styles.bottomBoxText}>
              Using the Activate or Deactivate button below immediately impacts
              using your Sun Card for Meal Plans and Maroon & Gold (M&G) Dollars
              and initiates changes to access into secure buildings on campus,
              an email will be sent to your ASU email once all door access has
              been deactivated. For additional help please email
              sundevilcardinfo@asu.edu or view how to get a replacement card.
            </Text>
            <Text style={styles.bottomBoxText}>
              Deactivate a lost card or reactivate a found card
            </Text>
            <Text style={[styles.bottomBoxText, { fontWeight: "bold", fontFamily: "Roboto" }]}>
              Asurite: {this.props.asurite}
            </Text>
            {this._renderButton()}
          </View>
        </View>
      </View>
    );
  }
}

LostCardSection.propTypes = {
  cardStatus: PropTypes.string,
  cardMessage: PropTypes.string,
  cardButtonLoading: PropTypes.bool,
  toggleStatusCard: PropTypes.func,
  asurite: PropTypes.string.isRequired,
  setModalVisible: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgb(227, 226, 226)",
    height: "100%",
    borderRadius: 10
  },
  box: {
    justifyContent: "space-between",
    alignItems: "center",
    margin: responsiveWidth(4),
    backgroundColor: "white",
    shadowColor: "grey",
    elevation: 5,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1
  },
  topBox: {
    width: "100%",
    padding: responsiveWidth(5),
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
    fontSize: responsiveFontSize(1.9),
    color: "white",
    fontWeight: "bold",
    fontFamily: "Roboto",
    marginHorizontal: responsiveWidth(2)
  },
  bottomBox: {
    padding: responsiveWidth(5),
    backgroundColor: "white"
  },
  bottomBoxText: {
    fontSize: responsiveFontSize(1.7),
    color: "black",
    paddingVertical: responsiveHeight(1)
  },
  deactivateButton: {
    width: responsiveWidth(80),
    justifyContent: "center",
    alignItems: "center",
    padding: responsiveWidth(2),
    marginVertical: responsiveHeight(2),
    borderRadius: 20
  },
  imageIcon: {
    width: responsiveWidth(8),
    height: responsiveWidth(8)
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontFamily: 'Roboto',
    fontSize: responsiveFontSize(1.5)
  }
});
