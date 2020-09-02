import React from "react";
import {
  View,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  UIManager,
  Image,
  ImageBackground
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";

/**
 * Properly styled header component to be used throughout the app
 *
 * Uses default navigation but allows other components to inject
 * custom navigation/buttons/text
 */

const win = Dimensions.get('window');

export class HeaderQuick extends React.PureComponent {
  constructor(props) {
    super(props);
    let defaultBack = (
      <TouchableWithoutFeedback
        onPress={() => {
          this.props.navigation.goBack();
        }}
        style={{ flex: 0 }}
      >
        <Icon name="navigate-before" size={44} color="#464646" />
      </TouchableWithoutFeedback>
    );
    this.state = {
      left: this.props.left ? this.props.left : defaultBack,
      title: this.props.title ? this.props.title : "",
      render: 0
    };
  }

  static defaultProps = {
    title: "",
    left: null,
    right: null,
    theme: "light",
    imageUrl: ""
  };

  componentDidMount() {
    this.setAccessibilityFocus();
  }

  componentWillUnmount() {
    clearTimeout(this.focusTimeout);
  }

  setAccessibilityFocus() {
    let whichRef = this.props.title ? this.focusHeading : this.focusBack;
    const FOCUS_ON_VIEW = 8;
    const nodeHandle = findNodeHandle(whichRef);
    this.focusTimeout = setTimeout(() => {
      Platform.OS === "ios"
        ? AccessibilityInfo.setAccessibilityFocus(nodeHandle)
        : UIManager.sendAccessibilityEvent(nodeHandle, FOCUS_ON_VIEW);
    }, 300);
  }

  renderTitle = () => {
    if (this.props.imageUrl) {
      return (
        <Image
          source={{ uri: this.props.imageUrl }}
          style={{ width: "75%", padding: responsiveWidth(10) }}
          resizeMode={"contain"}
        />
      );
    } else {
      return (
        <Text
          style={[
            styles[this.props.theme + "Text"],
            { textAlign: "center", fontSize: 20, fontWeight: "bold", fontFamily: "Roboto" }
          ]}
        >
          { this.props.theme !== "sunny" ? this.props.title : ""}
        </Text>
      );
    }
  };

  render() {

    if( this.props.theme === "sunny" ) {

      // SUnny 3
      // let ratio = win.width/720;
      // let imgHeight = 281;

      let ratio = win.width/720;
      let imgHeight = 198;

      return (
        <View
          style={["sunnyBackground",
            {
              zIndex: 20,
              height: 60,
              elevation: 1,
              backgroundColor: "#00000000"
            }
          ]}
        >
        <ImageBackground
          style={{
            height: imgHeight*ratio,
            width: win.width
          }}
          source={require("./miniheader2x.png")}
        >
          <View style={{height: 60}}>
            {this._renderHeader()}
          </View>
          </ImageBackground>
        </View>
      );
    } else {
      return (
        <View
          style={[
            styles[this.props.theme + "Background"],
            {
              height: 60,
              zIndex: 20,
              borderBottomColor: "#a0a2a5",
              borderBottomWidth: 1.5,
              elevation: 1
            }
          ]}
        >
          {this._renderHeader()}
        </View>
      );
    }

  }

  _renderHeader = () => {

    let isHeadingAccessible = this.props.title ? true : false;
    let defaultBack = (
      <TouchableWithoutFeedback
        onPress={() => {
          // console.log("CLICKED BACK")
          this.props.navigation.goBack(null);
        }}
        style={{ flex: 0 }}
      >
        <Icon
          name="navigate-before"
          size={44}
          style={[styles[this.props.theme + "Text"]]}
        />
      </TouchableWithoutFeedback>
    );

    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row"
        }}
      >
        <View style={{ flexDirection: "column", flex: 1}}>
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "center"
            }}
          >
            <View style={{ flex: 0.4 }} />
            <View
              ref={focusBack => {
                this.focusBack = focusBack;
              }}
              accessible={true}
              accessibilityLabel="Back"
              accessibilityRole="button"
            >
              {this.props.left ? this.props.left : defaultBack}
            </View>
          </View>
        </View>
        <View
          style={{ flex: 3, justifyContent: "center", alignItems: "center"}}
          ref={focusHeading => {
            this.focusHeading = focusHeading;
          }}
          accessible={isHeadingAccessible}
          accessibilityLabel={`${this.props.title}`}
          accessibilityRole="header"
        >
          {this.renderTitle()}
        </View>
        <View style={{ flexDirection: "column", flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              paddingRight: 15,
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "center"
            }}
          >
            {this.props.right}
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  lightBackground: {
    backgroundColor: "white"
  },
  lightText: {
    color: "#464646"
  },
  darkBackground: {
    backgroundColor: "#464646"
  },
  darkText: {
    color: "white"
  },
  sunnyText: {
    color: "#bdbdbd"
  },
  sunnyBackground: {
    backgroundColor: "#00000000"
  }
});
