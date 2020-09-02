import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { splitSentences, insertWordIntoString } from "../utility";

export const MealPlansModal = props => {
  const arrayOfSentences = splitSentences(props.message);
  const whichTitleWord =
    props.cardStatus === "Active" ? "Deactivate" : "Activate";
  const whichTextWord =
    props.cardStatus === "Active" ? "deactivate" : "activate";
  const whichStatusToSend = props.cardStatus === "Active" ? "Lost" : "Active";
  const firstSentence = props.message ? (
    <Text style={styles.modalText}>{arrayOfSentences[0]}</Text>
  ) : null;
  const secondSentence = props.message ? (
    <Text style={styles.modalText}>
      {insertWordIntoString(arrayOfSentences[1], whichTextWord)}
    </Text>
  ) : null;
  return (
    <Modal
      animationType="slide"
      transparent
      visible={props.modalVisible}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        width: "100%",
        height: "100%"
      }}
    >
      <View style={styles.modalView}>
        <Text style={styles.modalTitleText}>{whichTitleWord} Card?</Text>
        {firstSentence}
        {secondSentence}
        <Text style={[styles.modalText, { fontWeight: "500", fontFamily: 'Roboto' }]}>
          Are you sure you want to {whichTextWord} your card?
        </Text>
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            onPress={() => props.setModalVisible(false)}
            style={styles.bottomButton}
          >
            <Text style={styles.bottomButtonText}>Cancel</Text>
          </TouchableOpacity>
          <View style={{ borderRightColor: "grey", borderRightWidth: 1 }} />
          <TouchableOpacity
            onPress={() => props.toggleStatusCard(whichStatusToSend)}
            style={styles.bottomButton}
            disabled={props.cardButtonLoading}
          >
            <Text style={styles.bottomButtonText}>Yes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

MealPlansModal.propTypes = {
  modalVisible: PropTypes.bool.isRequired,
  setModalVisible: PropTypes.func.isRequired,
  toggleStatusCard: PropTypes.func,
  card: PropTypes.object,
  cardStatus: PropTypes.string,
  message: PropTypes.string,
  cardButtonLoading: PropTypes.bool,
  which: PropTypes.string
};

const styles = StyleSheet.create({
  modalView: {
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    width: responsiveWidth(90),
    paddingHorizontal: responsiveWidth(10),
    alignSelf: "center",
    top: responsiveHeight(15),
    borderRadius: 10
  },
  modalTitleText: {
    fontSize: responsiveFontSize(2.3),
    fontWeight: "bold",
    fontFamily: "Roboto",
    paddingVertical: responsiveHeight(4),
    paddingHorizontal: responsiveWidth(2),
    textAlign: "center",
    color: "black"
  },
  modalText: {
    fontSize: responsiveFontSize(1.75),
    paddingBottom: responsiveHeight(3),
    alignSelf: "flex-start",
    color: "black"
  },
  bottomButtonsContainer: {
    borderTopWidth: 1,
    borderTopColor: "grey",
    flexDirection: "row",
    justifyContent: "space-around",
    width: responsiveWidth(90)
  },
  bottomButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: responsiveHeight(2),
    width: responsiveWidth(45)
  },
  bottomButtonText: {
    fontSize: responsiveFontSize(1.75),
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: "black"
  }
});
