import React, { useState } from "react";
import { View, Text, StyleSheet, AsyncStorage } from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";

import ModalDropdown from "react-native-modal-dropdown";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import RNRestart from "react-native-restart";
import { Api, Auth } from "../../../services";

export default function RoleSelection() {
  const [isTester, setIsTester] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [roleSelect, setShowSelect] = useState("self");
  const [allRoles, setAllRoles] = useState([]);

  const [arrowUp, setArrowUp] = useState(false);

  if (!hasTriggered) {
    setHasTriggered(true);
    Auth()
      .getSession("edu.asu.asumobileapp")
      .then((tokens) => {
        const apiService = new Api(
          "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod",
          tokens
        );

        apiService.get("/roles").then((resp) => {
          if (resp.errorMessage) {
            console.log("ROLES ERROR", resp.errorMessage);
          } else {
            setIsTester(true);
            setAllRoles(resp);

            AsyncStorage.getItem("roleList").then((roleList) => {
              for (let i = 0; i < resp.length; ++i) {
                if (roleList === resp[i].roles) {
                  setShowSelect(resp[i].name);
                }
              }
            });
          }
        });
      });
  }

  if (isTester) {
    return (
      <View style={styles.holder}>
        <ModalDropdown
          renderRow={(option) => renderRow(option)}
          style={styles.modal}
          renderSeparator={() => (
            <View
              style={{ backgroundColor: "#000", width: 2, borderColor: "#fff" }}
            />
          )}
          dropdownStyle={{
            marginHorizontal: 0,
            height: responsiveHeight(20)
          }}
          options={allRoles}
          onSelect={(index, value) => {
            setShowSelect(value.name);
            setAsync(value.roles);
          }}
          onDropdownWillShow={() => setArrowUp(true)}
          onDropdownWillHide={() => setArrowUp(false)}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: responsiveWidth(2),
              alignItems: "center",
              flex: 1
            }}
          >
            <View style={{ flex: 9 }}>
              <Text style={[styles.whiteText, styles.capitalize]}>
                <Text>Viewing as: </Text>
                <Text style={styles.bold}>{roleSelect}</Text>
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              <MaterialIcons
                name={arrowUp ? "arrow-drop-up" : "arrow-drop-down"}
                size={responsiveFontSize(2)}
                color="#2A2B31"
              />
            </View>
          </View>
        </ModalDropdown>
      </View>
    );
  } else {
    return null;
  }

  function setAsync(v) {
    AsyncStorage.setItem("roleList", v).then((resp) => {
      RNRestart.Restart();
    });
  }

  function renderRow(option) {
    return (
      <View
        style={{
          padding: responsiveWidth(2),
          width: responsiveWidth(100),
          justifyContent: "center",
          borderBottomWidth: 1,
          backgroundColor: roleSelect === option.name ? "#00a1e3" : "#1a1b1d",
          borderBottomColor: roleSelect === option.name ? "#00a1e3" : "#2c2c2d",
          textAlign: "center"
        }}
      >
        <Text style={[styles.whiteText, styles.capitalize]}>{option.name}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  holder: {
    backgroundColor: "#23262d"
  },
  whiteText: {
    color: "white"
  },
  capitalize: {
    textTransform: "capitalize"
  },
  bold: {
    fontWeight: "bold"
  },
  modal: {
    backgroundColor: "#23262d",
    flex: 1
  }
});
