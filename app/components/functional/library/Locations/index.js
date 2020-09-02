import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import axios from "axios";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { Dropdown } from "../Helpers/LibDropdown";

import LibraryDetails from "./LibraryDetails";
import { libraryName, liveNowHours, getClosestLib } from "../utility";
import { ErrorWrapper } from "../../error/ErrorWrapper";
import { SettingsContext } from "../../../achievement/Settings/Settings";

const locationsHeader = require("../../assets/library/header-locations.png");

let cancelDefault = false;

export default function Locations(props) {
  return (
    <ErrorWrapper>
      <SettingsContext.Consumer>
        {(settings) => {
          return (
            <LocationsX
              {...props}
              settings={settings}
              sendAnalytics={settings.sendAnalytics}
            />
          );
        }}
      </SettingsContext.Consumer>
    </ErrorWrapper>
  );
}

function LocationsX(props) {
  const { sendAnalytics, navigation } = props;
  const [libraries, setLibraries] = useState([]);
  const [libraryNames, setLibraryNames] = useState([]);
  const [librarianChat, setLibrarianChat] = useState(null);
  const [mkrspace, setMkrspace] = useState(null);
  const [mapGeoHub, setMapGeoHub] = useState(null);
  const [labriola, setLabriola] = useState(null);
  const [haydenVisitors, setHaydenVisitors] = useState(null);
  const [nobleVisitors, setNobleVisitors] = useState(null);
  const [downtownVisitors, setDowntownVisitors] = useState(null);
  // const [latlng, setLatlng] = useState(null);
  const [activeLibrary, setActiveLibrary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!libraries.length) {
      getLibraries();
    } else {
      // console.log("props: ", props);
      setDefault();
    }
  }, [libraries]);

  const getLibraries = () => {
    const url =
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/library/test";
    axios
      .get(url)
      .then((res) => {
        // console.log("res.data: ", res.data);
        const objInfo = [];
        for (let i = 0; i < res.data.activeLibraries.length; ++i) {
          objInfo.push({
            name: libraryName(res.data.activeLibraries[i]),
            id: res.data.activeLibraries[i].lid,
          });
        }
        setLibraries(res.data.activeLibraries);
        setLibraryNames(objInfo);
        setLibrarianChat(res.data.librarianChat);
        setMkrspace(res.data.mkrspace);
        setMapGeoHub(res.data.mapGeoHub);
        setLabriola(res.data.labriola);
        setHaydenVisitors(res.data.haydenVisitors);
        setNobleVisitors(res.data.nobleVisitors);
        setDowntownVisitors(res.data.downtownVisitors);
        // setLatlng(res.data.activeLibraries);
        setLoading(false);
      })
      .catch((e) => {
        console.log("getLibraries error: ", e);
        console.log("e.response: ", e.response);
      });
  };

  const setDefault = () => {
    navigator.geolocation.getCurrentPosition(
      geoLocSuccess,
      geoLocError,
      geoLocOptions
    );
  };

  const geoLocSuccess = (position) => {
    const crd = position.coords;

    const { latitude } = position.coords;
    const { longitude } = position.coords;

    // console.log("libraries: ", libraries);
    const { roles } = props.settings;
    let libCopy = libraries;

    if (roles[0] == "law") {
      libCopy = libCopy.filter((el) => el.lid == "2105");
    }

    const library = getClosestLib(latitude, longitude, libCopy);
    if (library && !cancelDefault) {
      onSelectHandler({ name: library.name, id: library.id });
    } else if (!cancelDefault) {
      onSelectHandler({ name: "Hayden Library", id: "1290" });
    }
  };

  const geoLocError = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
    if (!cancelDefault) {
      if (props.settings.roles[0] == "law") {
        onSelectHandler({
          name: "Law Library (Remote Services Only)",
          id: "2105",
        });
      } else {
        onSelectHandler({ name: "Hayden Library", id: "1290" });
      }
    }
  };

  const geoLocOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  const onSelectHandler = (item) => {
    const libData = libraries.filter((lib) => lib.lid == item.id)[0];
    cancelDefault = true;
    setActiveLibrary(libData);
  };

  const renderLibDetails = () => {
    if (activeLibrary) {
      return (
        <LibraryDetails
          navigation={navigation}
          activeLibrary={activeLibrary}
          liveNowHours={liveNowHours(librarianChat)}
          mkrspaceHours={mkrspace}
          mapGeoHub={mapGeoHub}
          labriola={labriola}
          haydenVisitors={haydenVisitors}
          nobleVisitors={nobleVisitors}
          downtownVisitors={downtownVisitors}
        />
      );
    } else {
      return null;
    }
  };

  if (!loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#E2E2E2" }}>
        <ScrollView>
          <View style={styles.header}>
            <ImageBackground
              style={styles.imageBgContainer}
              source={locationsHeader}
            >
              <View style={styles.scrim} />
              <View style={{ flex: 2 }} />
              <Text style={styles.headerText}>Locations</Text>
            </ImageBackground>
          </View>

          <View style={styles.body}>
            <View style={styles.librarySelectBox}>
              <Dropdown
                dropOptions={libraryNames}
                defaultText="Select a Library"
                onPress={onSelectHandler}
              />
            </View>
            {renderLibDetails()}
          </View>
        </ScrollView>
      </View>
    );
  } else {
    return (
      <View style={{ flex: 1, backgroundColor: "#E2E2E2" }}>
        <View style={styles.header}>
          <ImageBackground
            style={styles.imageBgContainer}
            source={locationsHeader}
          >
            <View style={styles.scrim} />
            <View style={{ flex: 2 }} />
            <Text style={styles.headerText}>Locations</Text>
          </ImageBackground>
        </View>
        <View style={styles.loadingBody}>
          <ActivityIndicator
            size="large"
            color="maroon"
            style={{ alignSelf: "center" }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    padding: responsiveWidth(2.5),
  },
  loadingBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "grey",
    height: responsiveHeight(17),
  },
  headerText: {
    flex: 1,
    alignSelf: "flex-start",
    color: "white",
    fontSize: responsiveFontSize(3),
    fontWeight: "bold",
    marginLeft: responsiveWidth(5),
    fontFamily: "Roboto",
  },
  imageBgContainer: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "grey",
  },
  librarySelectBox: {
    alignSelf: "center",
    margin: responsiveWidth(2.5),
  },
  scrim: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
});
