import React, { PureComponent } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  responsiveHeight,
  responsiveWidth
} from "react-native-responsive-dimensions";
import PropTypes from "prop-types";

import { EventsFilterContext } from "./EventsFilter";

class EventsFilterMenu extends PureComponent {
  filtersTop = [
    { name: "All", filter: "all" },
    { name: "Downtown", filter: "Downtown Phoenix campus" },
    { name: "Online", filter: "Online" },
    { name: "West", filter: "West campus" }
  ];

  filtersBottom = [
    { name: "Polytechnic", filter: "Polytechnic campus" },
    { name: "Off-Campus", filter: "Off campus" },
    { name: "Tempe", filter: "Tempe campus" }
  ];

  setButtonColor = (itemName, activeFilter) => {
    if (itemName === activeFilter) {
      return {
        display: "flex",
        alignItems: "center",
        flexGrow: 1,
        paddingVertical: responsiveHeight(1),
        paddingHorizontal: responsiveWidth(1),
        marginTop: responsiveHeight(2),
        marginRight: responsiveWidth(2),
        borderRadius: 3.75,
        backgroundColor: "#FFB30F"
      };
    } else {
      return {
        display: "flex",
        alignItems: "center",
        flexGrow: 1,
        paddingVertical: responsiveHeight(1),
        paddingHorizontal: responsiveWidth(1),
        marginTop: responsiveHeight(2),
        marginRight: responsiveWidth(2),
        borderRadius: 3.75,
        backgroundColor: "#ffde9c"
      };
    }
  };

  render() {
    return (
      <EventsFilterContext.Consumer>
        {context => {
          // console.log("CTX: ", context);
          return (
            <View style={styles.container}>
              <Text>Search by Campus</Text>
              <View style={styles.filterMenu}>
                {this.filtersTop.map(item => {
                  return (
                    <TouchableOpacity
                      key={item.name}
                      style={this.setButtonColor(item.filter, context.filter)}
                      onPress={async () => {
                        await context.changeFilter(item.filter);
                      }}
                    >
                      <Text>{item.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.filterMenu}>
                {this.filtersBottom.map(item => {
                  return (
                    <TouchableOpacity
                      key={item.name}
                      style={this.setButtonColor(item.filter, context.filter)}
                      onPress={async () => {
                        await context.changeFilter(item.filter);
                      }}
                    >
                      <Text>{item.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        }}
      </EventsFilterContext.Consumer>
    );
  }
}

EventsFilterMenu.contextTypes = {
  changeFilter: PropTypes.func,
  toggleFilteringStatus: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    flexDirection: "column",
    marginBottom: 20
  },
  filterMenu: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  }
});

export default EventsFilterMenu;
