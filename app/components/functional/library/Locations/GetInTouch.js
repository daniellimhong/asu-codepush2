import React from "react";
import { Text, View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Divider } from "react-native-elements";
import {
  responsiveWidth,
  responsiveFontSize,
  responsiveHeight
} from "react-native-responsive-dimensions";

const chatIcon = require("../../assets/library/icon-chat.png");
const phoneIcon = require("../../assets/library/icon-phone.png");
const textIcon = require("../../assets/library/icon-texting.png");
const emailIcon = require("../../assets/library/icon-email.png");

const GetInTouch = props => {
  const { renderLiveNow, getInTouchHandler } = props;

  return (
    <React.Fragment>
      <View style={styles.section}>
        <Text style={styles.sectionText}>Get In Touch</Text>

        <TouchableOpacity
          style={{ marginBottom: responsiveHeight(0.75) }}
          onPress={() => props.getInTouchHandler("chat")}
        >
          <View style={styles.chat}>
            <View style={styles.chatRow}>
              <Image style={styles.icon} source={chatIcon} />
              <Text style={styles.sectionTextAux}>Chat</Text>
            </View>
            {renderLiveNow()}
          </View>
        </TouchableOpacity>
        <Divider style={styles.divider} />

        <TouchableOpacity
          style={styles.getInTouchRow}
          onPress={() => getInTouchHandler("phone")}
        >
          <Image style={styles.icon} source={phoneIcon} />
          <Text style={styles.sectionTextAux}>Phone</Text>
        </TouchableOpacity>
        <Divider style={styles.divider} />

        <TouchableOpacity
          style={styles.getInTouchRow}
          onPress={() => getInTouchHandler("text")}
        >
          <Image style={styles.icon} source={textIcon} />
          <Text style={styles.sectionTextAux}>Text</Text>
        </TouchableOpacity>
        <Divider style={styles.divider} />

        <TouchableOpacity
          style={styles.getInTouchRow}
          onPress={() => getInTouchHandler("email")}
        >
          <Image style={styles.icon} source={emailIcon} />
          <Text style={styles.sectionTextAux}>Email</Text>
        </TouchableOpacity>
      </View>
      <Divider style={styles.divider} />
    </React.Fragment>
  );
};

export default GetInTouch;

const styles = StyleSheet.create({
  sectionText: {
    color: "#222222",
    fontWeight: "bold",
    fontSize: responsiveFontSize(2),
    marginBottom: responsiveHeight(1.5),
    fontFamily: "Roboto"
  },
  sectionTextAux: {
    color: "#222222",
    fontSize: responsiveFontSize(2),
    marginVertical: responsiveHeight(1)
  },
  divider: {
    backgroundColor: "#D5D5D5"
  },
  section: {
    marginTop: responsiveHeight(2)
  },
  chat: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  icon: {
    width: responsiveWidth(5),
    resizeMode: "contain",
    alignItems: "center",
    marginRight: responsiveWidth(5),
    marginLeft: responsiveWidth(1)
  },
  getInTouchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: responsiveHeight(0.75)
  },
  chatRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  }
});
