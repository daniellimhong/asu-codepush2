import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import {
  responsiveWidth,
  responsiveFontSize,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import Communications from "react-native-communications";
import moment from "moment";
import { BarChart, XAxis } from "react-native-svg-charts";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import ModalDropdown from "react-native-modal-dropdown";
import axios from "axios";
import { Divider } from "react-native-elements";

import { Header } from "../Helpers/SimpleSectionHeader";
import { commonStyles } from "../Helpers/CommonStyles";
import { ErrorWrapper } from "../../error/ErrorWrapper";
import { SettingsContext } from "../../../achievement/Settings/Settings";
import TransitionView from "../../../universal/TransitionView";
import GetInTouch from "./GetInTouch";
import { Address } from "./Address";
import Services from "./Services";
import {
  formatLabel,
  dowNum,
  libHoursByKey,
  libShortname,
  renderRow,
  xAxisData,
  libraryName,
} from "../utility";

const libHoursUrl = "https://lib.asu.edu/hours";

export default function LibraryDetails(props) {
  return (
    <ErrorWrapper>
      <SettingsContext.Consumer>
        {(settings) => {
          return (
            <LibraryDetailsX
              {...props}
              sendAnalytics={settings.sendAnalytics}
            />
          );
        }}
      </SettingsContext.Consumer>
    </ErrorWrapper>
  );
}

function LibraryDetailsX(props) {
  const {
    sendAnalytics,
    navigation,
    liveNowHours,
    activeLibrary,
    mkrspaceHours,
    mapGeoHub,
    labriola,
    haydenVisitors,
    nobleVisitors,
    downtownVisitors,
  } = props;
  const [dowModalOpen, setDowModalOpen] = useState(false);
  const [activeDow, setActiveDow] = useState(moment().format("dddd - MMM Do"));
  const [links, setLinks] = useState({});
  const [allLinks, setAllLinks] = useState([]);
  const [activeHowBusyData, setActiveHowBusyData] = useState([]);

  useEffect(() => {
    const { name } = activeLibrary;
    sendAnalytics({
      "action-type": "click",
      "starting-screen": "library-locations",
      "starting-section": null,
      target: "Library Details",
      "resulting-screen": "library-details",
      "resulting-section": null,
      "target-id": name,
      "action-metadata": {
        "target-id": name,
        name: name,
        time: activeDow,
      },
    });
    getHowBusyData();
    getLinks();
  }, [activeDow, activeLibrary]);

  const visitorHours = (name) => {
    let visitorDetails;
    switch (name) {
      case "Hayden Library - ASU Faculty, Staff and Students":
        visitorDetails = haydenVisitors;
        break;
      case "Noble Library - ASU Faculty, Staff and Students":
        visitorDetails = nobleVisitors;
        break;
      case "Downtown campus Library - ASU Faculty, Staff and Students":
        visitorDetails = downtownVisitors;
        break;
      default:
        visitorDetails = null;
    }
    if (
      name === "Hayden Library - ASU Faculty, Staff and Students" ||
      name === "Noble Library - ASU Faculty, Staff and Students" ||
      name === "Downtown campus Library - ASU Faculty, Staff and Students"
    ) {
      return (
        <View style={styles.libraryHoursItem}>
          <Text>Visitors:</Text>
          <Text style={{ color: "#636363" }}>
            {libHoursByKey(visitorDetails, activeDow)}
          </Text>
        </View>
      );
    } else return null;
  };

  const renderLibraryHours = () => {
    const { name } = activeLibrary;
    return (
      <View style={{ marginTop: responsiveHeight(1) }}>
        {visitorHours(name)}
        <View style={styles.libraryHoursItem}>
          <Text style={{ flex: 1 }}>Faculty, Staff & Students:</Text>
          <Text style={{ alignSelf: "flex-end", color: "#636363" }}>
            {libHoursByKey(activeLibrary, activeDow)}
          </Text>
        </View>
        {name === "Hayden Library - ASU Faculty, Staff and Students" ? (
          <View style={styles.libraryHoursItem}>
            <Text>mkrspace:</Text>
            <Text style={{ color: "#636363" }} adjustsFontSizeToFit>
              {libHoursByKey(mkrspaceHours, activeDow)}
            </Text>
          </View>
        ) : null}
        {name === "Noble Library - ASU Faculty, Staff and Students" ? (
          <View style={styles.libraryHoursItem}>
            <Text>Map and Geospatial Hub:</Text>
            <Text style={{ color: "#636363" }}>
              {libHoursByKey(mapGeoHub, activeDow)}
            </Text>
          </View>
        ) : null}
        {name === "West campus (Fletcher) Library" ? (
          <View style={styles.libraryHoursItem}>
            <Text>Labriola:</Text>
            <Text style={{ color: "#636363" }}>
              {libHoursByKey(labriola, activeDow)}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const getHowBusyData = async () => {
    const shortname = libShortname(activeLibrary);
    const url = `https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/library-busyness`;
    const formattedActiveDow = moment(activeDow, "dddd - MMM Do").format(
      "dddd"
    );
    const params = {
      library: shortname,
      day: dowNum(formattedActiveDow).toString(),
    };
    let mappedData = [];
    setActiveHowBusyData([]);
    await axios
      .post(url, params)
      .then((res) => {
        if (res && res.data) {
          const now = moment()
            .startOf("hour")
            .format("h:mm a");
          let dayHours = libHoursByKey(activeLibrary, activeDow);
          if (dayHours.includes(" AM - ")) {
            dayHours = dayHours.replace(" AM - ", "am - ");
          }
          let firstSearch = "am - ";
          let add12 = 0;
          let hour1 = null;
          let hour2 = null;
          if (dayHours.indexOf("am - ") === -1) {
            add12 = 12;
            firstSearch = "pm - ";
          }
          try {
            hour1 = parseInt(dayHours.slice(0, dayHours.indexOf(firstSearch)));
            if (!isNaN(hour1) && hour1 !== 12) {
              hour1 += add12;
            }
            dayHours = dayHours.slice(
              dayHours.indexOf(firstSearch) + firstSearch.length
            );
            hour2 = parseInt(dayHours.slice(0, dayHours.indexOf("pm"))) + 12;
          } catch (e) {
            console.log(e);
          }
          mappedData = res.data.map((item) => {
            const formattedTime = moment(item.localTime).format("h:mm a");
            const fill = now === formattedTime ? "#F37E36" : "#78AA63";
            return {
              value:
                item.occupancyCorrected !== null
                  ? item.occupancyCorrected
                  : item.occupancy,
              svg: { fill },
              time: formattedTime,
              localTime: item.localTime,
            };
          });
          let filteredHours = mappedData;
          if (
            hour1 !== null &&
            !isNaN(hour1) &&
            hour2 !== null &&
            !isNaN(hour2)
          ) {
            filteredHours = [];
            for (let i = 0; i < mappedData.length; ++i) {
              const baseHour = parseInt(
                moment(mappedData[i].localTime).format("H")
              );
              if (baseHour >= hour1 && baseHour <= hour2) {
                filteredHours.push(mappedData[i]);
              }
            }
          } else if (dayHours === "Closed") {
            filteredHours = [];
          }
          filteredHours = filteredHours.sort((a, b) => {
            return moment(a.localTime).unix() - moment(b.localTime).unix();
          });
          setActiveHowBusyData(filteredHours);
        }
      })
      .catch((e) => {
        console.log("howBusyData error: ", e);
        console.log("e.response: ", e.response);
      });
  };

  const getLinks = () => {
    const url =
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/library-links";
    axios
      .get(url)
      .then((res) => {
        setAllLinks(res.data);
        res.data.forEach((obj) => {
          if (obj.id === "Get In Touch") {
            setLinks(obj);
          }
        });
      })
      .catch((e) => {
        console.log("getLinks error: ", e);
        console.log("e.response: ", e.response);
      });
  };

  const getInTouchHandler = (type) => {
    switch (type) {
      case "chat":
        return navigation.navigate("InAppLink", {
          url: links.chat,
          title: "Librarian Chat",
        });
      case "phone":
        return Communications.phonecall("4805259826", true);
      case "text":
        return Communications.text("4805259826");
      case "email":
        return navigation.navigate("InAppLink", {
          url: links.email,
          title: "Library Email Questions",
        });
      default:
        console.log("Something went wrong with get in touch.");
        return type;
    }
  };

  const createDowOptions = () => {
    const days = [moment().format("dddd - MMM Do")];
    for (let i = 1; i < 7; i++) {
      days.push(
        moment()
          .add(i, "day")
          .format("dddd - MMM Do")
      );
    }
    return days;
  };

  const onPressHandler = (url) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("ERROR", `Unable to open: ${url}`, [{ text: "OK" }]);
      }
    });
  };

  const renderLiveNow = () => {
    let { from, to } = liveNowHours;
    from = moment(from, "hha");
    to = moment(to, "hha");
    if (moment().isBetween(from, to)) {
      return (
        <View style={styles.liveNow}>
          <Text style={styles.liveNowText} adjustsFontSizeToFit>
            LIVE NOW
          </Text>
        </View>
      );
    } else {
      return null;
    }
  };

  const renderDowModalArrow = () => {
    const iconName = dowModalOpen ? "arrow-drop-up" : "arrow-drop-down";
    return (
      <MaterialIcons
        name={iconName}
        size={responsiveFontSize(2)}
        color="#636363"
      />
    );
  };

  const renderBarChart = () => {
    if (
      libraryName(activeLibrary.name) === "Thunderbird Library (IBIC)" ||
      libraryName(activeLibrary.name) === "Law Library" ||
      libHoursByKey(activeLibrary, activeDow) === "Closed"
    ) {
      return null;
    } else if (activeHowBusyData && activeHowBusyData.length > 0) {
      return (
        <TransitionView>
          <BarChart
            style={styles.barChart}
            data={activeHowBusyData}
            contentInset={{ bottom: responsiveHeight(1) }}
            spacingInner={responsiveWidth(0.05)}
            spacingOuter={responsiveWidth(0.05)}
            yAccessor={({ item }) => item.value}
          />
          <XAxis
            data={xAxisData(activeHowBusyData)}
            formatLabel={(value, index) =>
              formatLabel(index, activeHowBusyData)
            }
            contentInset={{ left: 10, right: 10 }}
            svg={{ fontSize: responsiveFontSize(1.25), fill: "#8B8B8B" }}
          />
          <View style={styles.popularTimes}>
            <Text>Popular Times</Text>
          </View>
        </TransitionView>
      );
    } else {
      return (
        <ActivityIndicator
          size="small"
          color="maroon"
          style={{ marginVertical: responsiveHeight(2) }}
        />
      );
    }
  };

  return (
    <TransitionView style={commonStyles.shadowBox}>
      <Header
        largeText={libraryName(activeLibrary)}
        smallText="Currently Viewing"
        backgroundColor="#2a2b2f"
        textColor="#FFF"
      />
      <View style={styles.body}>
        <View style={{ marginVertical: responsiveHeight(2) }}>
          <View style={styles.libraryHoursContainer}>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={styles.libraryHoursText}>Library Hours</Text>
            </View>
            <TransitionView>
              <ModalDropdown
                renderRow={(option) => renderRow(option)}
                options={createDowOptions()}
                dropdownStyle={styles.dropdown}
                renderSeparator={() => <React.Fragment />}
                onSelect={(index, value) => setActiveDow(value)}
                onDropdownWillShow={() => setDowModalOpen(true)}
                onDropdownWillHide={() => setDowModalOpen(false)}
              >
                <View style={styles.modalContainer}>
                  <Text>{activeDow}</Text>
                  <View style={styles.arrowContainer}>
                    {renderDowModalArrow()}
                  </View>
                </View>
              </ModalDropdown>
            </TransitionView>
          </View>
          {renderLibraryHours()}
          <TouchableOpacity
            style={{ marginTop: responsiveHeight(2) }}
            onPress={() => onPressHandler(libHoursUrl)}
          >
            <Text style={{ color: "maroon" }}>View All Library Hours</Text>
          </TouchableOpacity>
        </View>
        <View>{renderBarChart()}</View>
        <Divider style={{ backgroundColor: "#D5D5D5" }} />
        <Address
          contact={activeLibrary.contact}
          activeLibrary={activeLibrary}
          activeLibraryName={libraryName(activeLibrary.name)}
          navigate={navigation.navigate}
          previousScreen={"library-locations"}
          previousSection={"address"}
        />
        <GetInTouch
          getInTouchHandler={getInTouchHandler}
          renderLiveNow={renderLiveNow}
        />
        <Services activeLibrary={activeLibrary} links={allLinks} />
      </View>
    </TransitionView>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: responsiveWidth(4),
    backgroundColor: "white",
  },
  liveNow: {
    backgroundColor: "#58963E",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    width: responsiveWidth(22),
    height: responsiveHeight(2.5),
  },
  liveNowText: {
    color: "white",
    fontSize: responsiveFontSize(1.1),
    fontWeight: "bold",
    fontFamily: "Roboto",
  },
  modalContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#D5D5D5",
    justifyContent: "center",
    alignItems: "center",
    padding: responsiveWidth(2),
    borderRadius: 4,
  },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: responsiveWidth(2),
  },
  libraryHoursContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  libraryHoursText: {
    color: "#222222",
    fontWeight: "bold",
    fontSize: responsiveFontSize(2),
  },
  libraryHoursItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: responsiveHeight(1),
  },
  noData: {
    marginVertical: responsiveHeight(2),
    fontSize: responsiveFontSize(1.5),
    fontWeight: "bold",
    textAlign: "center",
  },
  popularTimes: {
    flex: 1,
    alignItems: "center",
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(2),
  },
  barChart: {
    height: responsiveHeight(17),
    marginBottom: responsiveHeight(0.25),
  },
  dropdown: {
    height: 3.3 * responsiveHeight(5),
    borderRadius: 2,
    borderColor: "#c7c7c7",
  },
});
