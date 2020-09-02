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

export class Header extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {

    var bgColor = "#FFF";
    if( this.props.backgroundColor ) {
      bgColor = this.props.backgroundColor;
    }

    var textColor = "#000";
    if( this.props.textColor ) {
      textColor = this.props.textColor;
    }

    return (
      <View style={[styles.header,{backgroundColor: bgColor}]}>
        <Text style={[styles.centerText,styles.smallHeader,{color: textColor}]}>{this.props.smallText}</Text>
        <Text style={[styles.centerText,styles.largeHeader,{color: textColor}]}>{this.props.largeText}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    padding: responsiveWidth(3)
  },
  smallHeader: {
    fontSize: responsiveFontSize(1.5)
  },
  largeHeader: {
    fontSize: responsiveFontSize(2),
    fontWeight: "800",
    fontFamily: 'Roboto',
  },
  centerText: {
    textAlign: "center"
  }
});
