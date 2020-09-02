import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import axios from "axios";

export default class DiningVenuesModalPrefItem extends PureComponent {
  state = {
    active: this.props.data.active,
    loading: false
  };

  addItems = async (whichSection, item) => {
    const tokens = await this.context.getTokens();
    const asurite = tokens.username ? tokens.username : "guest";
    const response = await axios.post(
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/dining-services-add-items",
      {
        which: "foodPreferences",
        whichSection,
        item,
        asurite
      }
    );
    return new Promise((resolve, reject) => {
      // console.log("response ", response);
      resolve(response);
    });
  };

  pressHandler = async name => {
    const { i, currentArray, which } = this.props;
    this.setState({ loading: true });
    const response = await this.addItems(which, this.props.data.name);
    this.setState({ loading: false });
    this.props.preferencesPressHandler(
      name,
      which,
      this.state.active,
      i,
      currentArray
    );
    this.setState({ active: !this.state.active });
  };

  render() {
    const { name } = this.props.data;
    const selectedView = this.state.active
      ? {
          backgroundColor: "rgb(0, 163, 255)"
        }
      : {};
    const selectedText = this.state.active
      ? {
          color: "white"
        }
      : {};
    if (this.state.loading) {
      return (
        <View style={[styles.modalBoxButton, selectedView]}>
          <ActivityIndicator
            color={this.state.active ? "white" : "rgb(0, 163, 255)"}
          />
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          style={[styles.modalBoxButton, selectedView]}
          onPress={() => this.pressHandler(name)}
        >
          <Text style={[styles.modalBoxText, selectedText]}>{name}</Text>
        </TouchableOpacity>
      );
    }
  }
}

DiningVenuesModalPrefItem.contextTypes = {
  getTokens: PropTypes.func
};

DiningVenuesModalPrefItem.propTypes = {
  data: PropTypes.object,
  i: PropTypes.number,
  currentArray: PropTypes.object,
  Which: PropTypes.string,
  preferencesPressHandler: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  modalBoxButton: {
    borderColor: "rgb(142, 142, 142)",
    borderWidth: 1,
    padding: responsiveWidth(1.5),
    marginVertical: responsiveWidth(1.5),
    marginRight: responsiveWidth(3),
    color: "black"
  },
  modalBoxText: {
    fontSize: responsiveFontSize(1.6),
    color: "black"
  }
});
