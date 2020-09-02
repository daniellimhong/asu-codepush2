import React from "react";
import {
  View,
  Text,
  StyleSheet,
  UIManager,
  LayoutAnimation
} from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

let CustomLayoutAnimation = {
  duration: 200,
  create: {
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.scaleY
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut //Change Type
  }
};

export class AnimatedHeight extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myheight: null
    };
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.myheight != nextProps.myHeight) {
      LayoutAnimation.configureNext(CustomLayoutAnimation);
      this.setState({
        myheight: nextProps.myHeight
      });
    }
  }
  render() {
    return (
      <View
        style={{
          height: this.props.myHeight,
          width: "100%",
          overflow: "hidden"
        }}
      >
        {this.props.children}
      </View>
    );
  }
}
