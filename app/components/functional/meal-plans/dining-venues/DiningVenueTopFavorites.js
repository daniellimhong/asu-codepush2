import React, { Component } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/FontAwesome5";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import axios from "axios";

const TITLE_FONT_SIZE = responsiveFontSize(2.5);
const PINK = "rgb(173, 5, 66)";

export default class DiningVenueTopFavorites extends Component {
  state = {
    favorite: this.props.favorite,
    loading: false
  };

  addRemoveFavorite = async id => {
    const tokens = await this.context.getTokens();
    const asurite = tokens.username ? tokens.username : "guest";
    const response = await axios.post(
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/dining-services-add-items",
      {
        which: "favorites",
        id,
        asurite
      }
    );
    return new Promise((resolve, reject) => {
      // console.log("response ", response);
      resolve(response);
    });
  };

  favoritePressHandler = async () => {
    this.setState({ loading: true });
    const success = await this.addRemoveFavorite(this.props.locationId);
    const toAdd = !this.state.favorite;
    if (success) {
      this.setState({
        favorite: toAdd,
        loading: false
      });
      this.props.addFavorite(this.props.locationId, toAdd);
      this.props.addFavoriteCampuses &&
        this.props.addFavoriteCampuses(this.props.locationId, toAdd);
    } else {
      this.setState({ loading: false });
    }
  };

  render() {
    const TITLE_FONT_SIZE = responsiveFontSize(2.5);
    const heartIcon = (
      <Icon
        name="heart"
        color={PINK}
        size={!this.props.fontSize ? TITLE_FONT_SIZE : this.props.fontSize}
        solid
      />
    );
    const heartIconEmpty = (
      <Icon
        name="heart"
        color={PINK}
        size={!this.props.fontSize ? TITLE_FONT_SIZE : this.props.fontSize}
        light
      />
    );

    const heart = this.state.favorite ? heartIcon : heartIconEmpty;
    if (this.state.loading) {
      return <ActivityIndicator color={PINK} />;
    } else {
      return <Text onPress={this.favoritePressHandler}>{heart}</Text>;
    }
  }
}

DiningVenueTopFavorites.contextTypes = {
  getTokens: PropTypes.func
};

DiningVenueTopFavorites.propTypes = {
  favorite: PropTypes.bool,
  locationId: PropTypes.number,
  addFavorite: PropTypes.func,
  fontSize: PropTypes.number
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
