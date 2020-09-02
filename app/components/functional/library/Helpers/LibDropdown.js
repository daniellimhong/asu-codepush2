import React, { PureComponent } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Picker
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { Divider } from "react-native-elements";
import ModalDropdown from "react-native-modal-dropdown";
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const dropColorLight = "#f0f0f0";
const dropColor = "#c7c7c7";
const dropText = "#919191";

export class Dropdown extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      myReservations: [],
      loading: false,
      activeText: null,
      showDrop: false,
      currentView: null
    };
  }

  componentDidUpdate(nextProps,nextState) {
    if( nextProps.currentView != this.state.currentView ) {
      this.setState({
        activeText: null,
        currentView: nextProps.currentView
      })
    }
  }

  renderRow = option => {
    return (
      <View
        style={{
          paddingVertical: responsiveWidth(3),
          marginHorizontal: responsiveWidth(2),
          justifyContent: "center",
          borderBottomWidth: 1,
          borderBottomColor: dropColorLight
        }}
      >
        <Text>{option}</Text>
      </View>
    );
  };

  seperator = () => {
    return (
      <View
        style={{ backgroundColor: "#000", width: 2, borderColor: "#fff" }}
      />
    );
  };

  toggleArrow = t => {
    this.setState({
      showDrop: t
    });
    return true;
  };

  onSelectHandler = (index, value) => {
    this.setState({
      activeText: value
    });

    this.props.onPress(this.props.dropOptions[index]);
  };

  render() {
    let options = this.props.dropOptions.map(op =>
      this.props.keyValue ? op[this.props.keyValue] : op.name
    );

    var optionsHeight = options.length * responsiveHeight(5);

    var heightToUse =
      optionsHeight < responsiveHeight(28)
        ? optionsHeight
        : responsiveHeight(28);

    return (
      <View style={styles.dropdown}>
        <ModalDropdown
          renderRow={option => this.renderRow(option)}
          style={styles.modal}
          renderSeparator={() => this.seperator()}
          dropdownStyle={{
            width: responsiveWidth(85),
            marginHorizontal: 0,
            maxHeight: heightToUse
          }}
          options={options}
          onSelect={(index, value) => this.onSelectHandler(index, value)}
          onDropdownWillShow={() => this.toggleArrow(true)}
          onDropdownWillHide={() => this.toggleArrow(false)}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: responsiveWidth(2),
              alignItems: "center"
            }}
          >
            <View style={{width: responsiveWidth(75)}}>
              <Text
                style={{ color: dropText, fontWeight: "600", fontFamily: 'Roboto', }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {this.state.activeText
                  ? this.state.activeText
                  : this.props.defaultText
                  ? this.props.defaultText
                  : "Select an option"}
              </Text>
            </View>
            <View style={{width: responsiveWidth(10), justifyContent: "flex-end"}}>
              <MaterialIcons
                name={this.state.showDrop ? "arrow-drop-up" : "arrow-drop-down"}
                size={responsiveFontSize(2)}
                color="#2A2B31"
              />
            </View>
          </View>
        </ModalDropdown>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  dropdown: {
    alignSelf: "center",
    marginVertical: responsiveHeight(2)
  },
  modal: {
    borderWidth: 1,
    borderRadius: 3,
    borderColor: dropColor,
    backgroundColor: "white",
    width: responsiveWidth(85)
  }
});
