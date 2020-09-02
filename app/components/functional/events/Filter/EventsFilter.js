import React, { PureComponent } from "react";
import { View, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import axios from "axios";

import { DefaultText as Text } from "../../../presentational/DefaultText";
import EventsFilterMenu from "./EventsFilterMenu";

export const EventsFilterContext = React.createContext();

export const EventsSearch = React.createContext();

export default class EventsFilter extends PureComponent {
  state = {
    searching: false,
    searchString: "",
    searchedEvents: [],
    // eslint-disable-next-line react/no-unused-state
    filter: "all",
    filterMenuOpen: false,
    showClubs: true,
    // eslint-disable-next-line react/no-unused-state
    changeFilter: () => null
  };

  componentDidMount = () => {
    this.setState({
      // eslint-disable-next-line react/no-unused-state
      changeFilter: this.changeFilter
    });
  };

  // eslint-disable-next-line react/no-unused-state
  changeFilter = newFilter =>
    this.setState({ filter: newFilter }, () => {
      this.searchForEvents();
    });

  setSearchText = text =>
    this.setState({ searchString: text }, () => {
      this.searchForEvents();
    });

  toggleShowClubs = () => {
    const { showClubs } = this.state;
    this.setState({ showClubs: !showClubs });
  };

  toggleFilterMenu = val => {
    const { filterMenuOpen } = this.state;
    if (val === false || val === true) {
      this.setState({ filterMenuOpen: val });
    } else {
      this.setState({ filterMenuOpen: !filterMenuOpen });
    }
  };

  searchForEvents = () => {
    const { searchString, searching, filter } = this.state;
    let searchUrl = `https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod/search-events?`;
    if (searchString) {
      searchUrl += `searchstring=${encodeURI(searchString)}&`;
    }
    if (filter && filter !== "all") {
      searchUrl += `campus=${encodeURI(filter)}&`;
    }

    if (typeof this._source !== typeof undefined) {
      this._source.cancel("Operation canceled due to new request.");
    }
    if (!searching) {
      this.setState({
        searching: true
      });
    }

    // save the new request for cancellation
    this._source = axios.CancelToken.source();

    axios
      .get(searchUrl, { cancelToken: this._source.token })
      .then(response => {
        if (response && response.data && response.data.length) {
          // eslint-disable-next-line react/no-unused-state
          this.setState({ searchedEvents: response.data });
        } else {
          this.setState({ searchedEvents: [], searching: false });
        }
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          console.log("Request canceled", error);
        } else {
          this.setState({
            searchedEvents: [],
            searching: false
          });
          console.log(error);
        }
      });
  };

  searchDivStyle = filterMenuOpen => {
    if (filterMenuOpen) {
      return {
        flex: 1,
        backgroundColor: "white",
        flexDirection: "column",
        alignItems: "center",
        height: responsiveHeight(36),
        borderBottomColor: "#D1D1D1",
        borderBottomWidth: responsiveHeight(0.175),
        borderRadius: 0
      };
    } else {
      return {
        flex: 1,
        backgroundColor: "white",
        flexDirection: "column",
        borderBottomColor: "##D1D1D1",
        alignItems: "center",
        height: responsiveHeight(6)
      };
    }
  };

  arrowIconUpStyle = filterMenuOpen => {
    if (filterMenuOpen) {
      return {
        display: "flex"
      };
    } else {
      return {
        display: "none"
      };
    }
  };

  render() {
    const { children } = this.props;
    const {
      searchString,
      searchedEvents,
      filterMenuOpen,
      showClubs
    } = this.state;

    let toggleButton = "toggle-on";
    let toggleButtonAccessibility = "Double tap to disable";
    let toggleColor = "#FFC627";
    if (!showClubs) {
      toggleButton = "toggle-off";
      toggleButtonAccessibility = "Double tap to enable";
      toggleColor = "#b8bdc4";
    }

    return (
      <EventsFilterContext.Provider value={this.state}>
        <EventsSearch.Provider value={this.state}>
          <View style={this.searchDivStyle(filterMenuOpen)}>
            <View
              style={{
                width: "100%",
                paddingHorizontal: responsiveWidth(2)
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <SearchBox
                  setSearchText={this.setSearchText}
                  searchString={searchString}
                  searchedEvents={searchedEvents}
                  toggleFilterMenu={this.toggleFilterMenu}
                  filterMenuOpen={filterMenuOpen}
                />
              </View>
              {filterMenuOpen ? (
                <View>
                  <EventsFilterMenu />
                  <ClubEventsBox
                    toggleShowClubs={this.toggleShowClubs}
                    toggleButton={toggleButton}
                    toggleButtonAccessibility={toggleButtonAccessibility}
                    toggleColor={toggleColor}
                  />
                </View>
              ) : null}
            </View>
            {children}
          </View>
        </EventsSearch.Provider>
      </EventsFilterContext.Provider>
    );
  }
}

function SearchBox(props) {
  const {
    setSearchText,
    searchString,
    toggleFilterMenu,
    filterMenuOpen
  } = props;
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        height: responsiveHeight(6)
      }}
    >
      <View style={styles.searchBoxLeft}>
        <View style={{ marginHorizontal: responsiveWidth(5) }}>
          <FontAwesome
            name="search"
            color="rgb(88, 88, 88)"
            size={responsiveFontSize(2)}
          />
        </View>
        <TextInput
          clearButtonMode="always"
          style={styles.searchField}
          onChangeText={text => {
            setSearchText(text);
          }}
          value={searchString}
          placeholder="Search Events"
          placeholderTextColor="rgb(88, 88, 88)"
          placeholderFontSize={responsiveFontSize(1.8)}
          returnKeyType="search"
          onSubmitEditing={() => null}
          underlineColorAndroid="rgba(0,0,0,0)"
          underlineWidthAndroid={0}
        />
      </View>
      <View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            toggleFilterMenu();
          }}
          accessibilityLabel="Filter"
          accessibilityTraits="button"
          accessibilityComponentType="button"
        >
          <Text
            style={{
              color: "rgb(88, 88, 88)",
              fontSize: responsiveFontSize(1.7)
            }}
          >
            Options{" "}
          </Text>
          <FontAwesome
            name={filterMenuOpen ? "angle-up" : "angle-down"}
            size={responsiveFontSize(1.7)}
            color="rgb(88, 88, 88)"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ClubEventsBox(props) {
  const {
    toggleButton,
    toggleButtonAccessibility,
    toggleColor,
    toggleShowClubs
  } = props;
  return (
    <View style={styles.searchBoxRight}>
      <TouchableOpacity
        onPress={toggleShowClubs}
        accessibilityLabel={toggleButtonAccessibility}
        accessibilityRole="button"
      >
        <FontAwesome
          name={toggleButton}
          color={toggleColor}
          size={responsiveFontSize(4.1)}
        />
      </TouchableOpacity>
      <Text
        style={{
          color: "rgb(88, 88, 88)",
          marginRight: 5,
          fontSize: responsiveFontSize(2)
        }}
      >
        INCLUDE CLUB EVENTS
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBoxLeft: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: responsiveHeight(6)
  },
  searchBoxRight: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10
  },
  searchButton: {
    // adjust responsive height for menu toggle
    padding: responsiveHeight(1),
    paddingLeft: 0,
    height: "100%",
    alignSelf: "center",
    justifyContent: "center",
    marginBottom: responsiveHeight(-1.8)
  },
  filterButton: {
    paddingLeft: 0,
    height: "100%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: responsiveHeight(-1.8)
  },
  searchField: {
    fontSize: responsiveFontSize(1.8),
    width: responsiveWidth(82),
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  }
});
