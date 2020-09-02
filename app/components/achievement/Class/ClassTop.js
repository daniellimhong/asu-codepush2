import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

import { DefaultText as Text } from "../../presentational/DefaultText.js";
import TransitionView from "../../universal/TransitionView";

export class ClassTop extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      headerBgColor: "#25262a",
      bgImage: {
        uri: this.getImageUrl()
      }
    };
  }

  static defaultProps = {
    title: null,
    season: null,
    meeting_string: null,
    time_string: null,
    location: null
  };

  componentDidMount() {
    this.setState({
      bgImage: {
        uri: this.getImageUrl()
      }
    });
  }

  getImageUrl(s) {
    let imageUrl =
      "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/course-bg-images/class-profile-bg-";
    let num = ("0" + Math.ceil(Math.random() * 12)).slice(-2) + ".png";
    return imageUrl + num;
  }

  render() {
    let dateTimeStr = this.props.meeting_string + ", " + this.props.time_string;

    let location = this.props.location;
    let campus = null;

    let start = location.indexOf("(");
    let end = location.indexOf(")");

    if (start > -1) {
      campus = location.slice(start + 1, end);
      location = location.slice(0, start);
    }

    let ClassInfo = () => {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "flex-start",
            justifyContent: "center",
            padding: responsiveWidth(4)
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: responsiveFontSize(3.2),
              paddingBottom: responsiveHeight(0.5),
              fontWeight: "bold",
              fontFamily: "Roboto"
            }}
          >
            {this.props.title}
          </Text>

          {this.props.meeting_string ? (
            <Text style={styles.smallText}>{dateTimeStr}</Text>
          ) : null}
          {location ? <Text style={styles.smallText}>{location}</Text> : null}
          {campus ? (
            <Text style={styles.smallText}>{campus} Campus</Text>
          ) : null}
        </View>
      );
    };

    return (
      <View>
        <ImageBackground
          style={styles.imgBackground}
          source={this.state.bgImage}
          onError={e => {
            this.setState({
              bgImage: Image.resolveAssetSource(
                require("../assets/profbgbackup.png")
              )
            });
          }}
          onLoad={() => this.setState({ headerBgColor: null })}
        >
          <View style={{ flex: 1, backgroundColor: this.state.headerBgColor }}>
            <ClassInfo />
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  smallText: {
    color: "white",
    fontSize: responsiveFontSize(2.1),
    paddingBottom: responsiveHeight(0.1)
  },
  imgBackground: {
    height: responsiveHeight(35)
  }
});
