import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, TextInput, Platform, TouchableOpacity } from 'react-native';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import FontAwesome from "react-native-vector-icons/FontAwesome";
const isIOS = Platform.OS === "ios" ? true: false;

export class SearchBar extends PureComponent {
  render() {
    const showLocation = this.props.isRoute ? (
      <TouchableOpacity
        onPress={this.props.openGps} style={styles.locationIconBox}
        accessible={true} accessibilityLabel={"Open in GPS"} accessibilityRole={"button"}
      >
        <FontAwesome name="car" color="black" size={17}  />
      </TouchableOpacity>
    ) : null;
    const showMenu =  (
      <TouchableOpacity
        onPress={this.props.openMenu} style={styles.menuIconBox}
        accessible={true} accessibilityLabel={"Menu"} accessibilityRole={"button"}
      >
        <FontAwesome name="bars" color="black" size={21}  />
      </TouchableOpacity>
    );
    return (
        <View style={styles.searchBarContainer}>
          <View style={[styles.searchBar, {marginLeft: responsiveWidth(1)}]}>
              <View style={styles.searchIconBox}>
                <FontAwesome name="search" color="black" size={responsiveFontSize(2.3)}  />
              </View>
              <TextInput
                style={styles.searchBox}
                onChangeText={this.props.handleLocationInput}
                value={this.props.locationInput}
                placeholder={"Where do you want to go?"}
                autoFocus={true}
                autoComplete={"off"}
                autoCorrect={false}
              />
              {showLocation}
          </View>
          {showMenu}
        </View>
    );
  }
}

const styles = StyleSheet.create({
  searchBarContainer: {
      flex: 5,
      flexDirection: 'row',
      position: 'absolute',
      width: '100%',
      borderBottomColor: 'rgb(71, 70, 70)',
      borderBottomWidth: 2,
      backgroundColor: "white",
      shadowColor: '#636363',
      shadowOffset: { width: 0, height: 1.8 }, shadowOpacity: 0.8,
      shadowRadius: 2,
      height: 65
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgb(240, 240, 240)",
    marginVertical: 8,
    backgroundColor: 'white',
    alignItems: 'center'
  },
  searchIconBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'white'
  },
  searchBox: {
    flex: 8,
    height: 38,
    fontSize: 20,
    color: "rgb(66, 66, 66)",
    paddingBottom: isIOS ? 0 : 5
  },
  locationIconBox: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuIconBox: {
    flex: .1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(.5)
  }
});
