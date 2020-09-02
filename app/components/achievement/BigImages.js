import React from "react";
import { Image, ImageBackground, View } from "react-native";
import { responsiveWidth } from "react-native-responsive-dimensions";

var widthNum = 25;

export class BigImages extends React.PureComponent {
  static defaultProps = {
    source: [],
    onError: () => {}
  };

  state = { current: 0 };

  onError = error => {
    this.props.onError(error);
    const next = this.state.current + 1;
    if (next < this.props.source.length) {
      this.setState({ current: next });
    }
  };

  render() {
    const { onError, source, ...rest } = this.props;
    return (
      <View
        style={{
          height: responsiveWidth(widthNum),
          width: responsiveWidth(widthNum),
          borderRadius: responsiveWidth(widthNum/2),
          overflow: "hidden"
        }}
      >
        <ImageBackground
          style={{
            height: responsiveWidth(widthNum),
            width: responsiveWidth(widthNum)
          }}
          source={source[1]}
        >
          {/* <Image
            source={source[0]}
            // onError={this.onError.bind(this)}
            {...rest}
          /> */}
          <Image
            style={{
              height: responsiveWidth(widthNum),
              width: responsiveWidth(widthNum),
              borderRadius: responsiveWidth(widthNum/2),
              borderColor: "white",
              borderWidth: 8
            }}
            source={source[0]}
          />
        </ImageBackground>
      </View>
    );
  }
}
