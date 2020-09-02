import React from "react";
import { Image, ImageBackground, View } from "react-native";
import { responsiveWidth } from "react-native-responsive-dimensions";
export class Images extends React.PureComponent {
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
          height: responsiveWidth(16),
          width: responsiveWidth(16),
          borderRadius: responsiveWidth(8),
          borderColor: this.props.borderColor ? this.props.borderColor : null,
          borderWidth: this.props.borderColor ? 2 : null,
          overflow: "hidden",
          alignSelf: "center"
        }}
      >
        <ImageBackground
          style={{
            height: responsiveWidth(16),
            width: responsiveWidth(16),
            alignSelf: "center"
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
              height: responsiveWidth(16),
              width: responsiveWidth(16),
              borderRadius: responsiveWidth(8),
              alignSelf: "center"
            }}
            source={source[0]}
          />
        </ImageBackground>
      </View>
    );
  }
}