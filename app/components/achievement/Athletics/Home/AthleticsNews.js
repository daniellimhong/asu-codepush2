import React, { PureComponent } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import PropTypes from "prop-types";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import HTMLView from "react-native-htmlview";

export default class AthleticsNews extends PureComponent {
  render() {
    if (this.props.athleticsNews && this.props.athleticsNews.length > 0) {
      const {
        body,
        field_hero_image_url,
        field_imported_created,
        title
      } = this.props.athleticsNews[0]._source;
      return (
        <View style={styles.container}>
          <Image
            source={{ uri: field_hero_image_url }}
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.titleText}>{title}</Text>
          <View>
            <Text style={styles.normalText}>{field_imported_created}</Text>
            <HTMLView
              value={body}
              stylesheet={styles.normalText}
              // add a line break between <p> tags like this:
              paragraphBreak={`
              `}
            />
          </View>
        </View>
      );
    } else {
      return null;
    }
  }
}

AthleticsNews.propTypes = {
  athleticsNews: PropTypes.array
};

const styles = StyleSheet.create({
  container: {
    margin: 15,
    padding: responsiveWidth(4),
    borderColor: "rgb(232, 232, 232)",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    shadowColor: "rgb(232, 232, 232)",
    backgroundColor: "white"
  },
  image: {
    height: responsiveHeight(20),
    width: "100%",
    marginBottom: responsiveHeight(1)
  },
  titleText: {
    color: "black",
    fontSize: responsiveFontSize(2),
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  normalText: {
    color: "grey",
    fontSize: responsiveFontSize(1.4),
    paddingVertical: responsiveHeight(0.5)
  }
});
