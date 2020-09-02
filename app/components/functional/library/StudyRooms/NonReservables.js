import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, Linking } from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import axios from "axios";

import { Divider } from "react-native-elements";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Header } from "../Helpers/SimpleSectionHeader";
import { commonStyles } from "../Helpers/CommonStyles";
import { ErrorWrapper } from "../../error/ErrorWrapper";
import { SettingsContext } from "../../../achievement/Settings/Settings";

export default function NonReservables(props) {
  return (
    <ErrorWrapper>
      <SettingsContext.Consumer>
        {settings => {
          return (
            <NonReservablesX
              {...props}
              sendAnalytics={settings.sendAnalytics}
            />
          );
        }}
      </SettingsContext.Consumer>
    </ErrorWrapper>
  );
}

function NonReservablesX(props) {
  const { sendAnalytics, roomInfo } = props;
  const [library, setLibrary] = useState({
    info: "",
    additionalInfo: "",
    library: "",
    location: "",
    number: "",
    url: "",
    accessories: [],
    equipment: []
  });

  useEffect(() => {
    getLibraryInfo();
  }, [roomInfo]);

  const getLibraryInfo = async () => {
    const url =
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/studyrooms/non-reservable";
    const data = await axios
      .get(url)
      .then(res => res.data)
      .catch(e => {
        console.log("error: ", e);
        console.log(e.response);
      });
    data.forEach(el => {
      if (roomInfo.name === el.library) {
        setLibrary(el);
      }
    });
  };

  const handleClick = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`ERROR: Don't know how to open URL: ${url}`);
      }
    });
  };

  const renderRow = (data, index) => {
    return (
      <View
        style={{ flexDirection: "row", marginTop: responsiveWidth(3) }}
        key={index}
      >
        <Text style={{ color: "#3E3E3E" }}>{"\u2022"}</Text>
        <Text
          style={{
            flex: 1,
            paddingLeft: responsiveWidth(2.5),
            color: "#3E3E3E"
          }}
        >
          {data}
        </Text>
      </View>
    );
  };

  return (
    <View style={commonStyles.shadowBox}>
      <Header
        largeText={roomInfo.name}
        smallText="Currently Viewing"
        backgroundColor="#2a2b2f"
        textColor="#FFF"
      />
      <View style={styles.basicBlock}>
        <View style={{ flexDirection: "row" }}>
          <View style={styles.redIndicator}>
            <Text style={styles.redIndicatorText}>Study Rooms</Text>
          </View>
        </View>
        <View>
          <Text style={styles.infoParagraph}>{library.info}</Text>
          <Text style={styles.infoParagraph}>{library.additionalInfo}</Text>
        </View>
        <TouchableOpacity onPress={() => handleClick(library.url)}>
          <Text style={{ color: "#cb0345" }}>View Details</Text>
        </TouchableOpacity>
        <Divider
          style={{
            marginTop: responsiveHeight(3),
            marginVertical: responsiveHeight(1.5),
            backgroundColor: "#D5D5D5"
          }}
        />
        <View>
          <Text style={styles.infoText}>
            Number:{" "}
            <Text
              style={{
                fontWeight: "normal",
                color: "#3E3E3E",
                fontFamily: "Roboto"
              }}
            >
              {library.number}
            </Text>
          </Text>
          <Text style={styles.infoText}>Room Equipment: </Text>
          {library.equipment.map((el, index) => renderRow(el, index))}
          {library.accessories && library.accessories.length ? (
            <Text style={styles.infoText}>
              Accessories Available for Check Out:
            </Text>
          ) : null}
          {library.accessories && library.accessories.length
            ? library.accessories.map((el, index) => renderRow(el, index))
            : null}
          <Text style={styles.infoText}>Location: </Text>
          <Text
            style={{ color: "#3E3E3E", marginVertical: responsiveWidth(3) }}
          >
            {library.location}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fdb20e",
    padding: responsiveWidth(3)
  },
  basicBlock: {
    backgroundColor: "#FFF",
    padding: responsiveWidth(3)
  },
  loadingBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  redIndicator: {
    backgroundColor: "#cb0345",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveWidth(1),
    borderColor: "#cb0345",
    borderWidth: 1,
    borderRadius: 3,
    marginTop: responsiveHeight(1.5),
    marginBottom: responsiveHeight(3)
  },
  redIndicatorText: {
    color: "#FFF",
    fontSize: responsiveFontSize(1.6),
    fontWeight: "800",
    fontFamily: "Roboto"
  },
  infoText: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    marginTop: responsiveHeight(1.5)
  },
  infoParagraph: {
    marginBottom: responsiveHeight(1.5),
    color: "#3E3E3E"
  }
});
