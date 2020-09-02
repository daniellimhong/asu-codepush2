import React from "react";
import { View, Text, AccessibilityInfo } from "react-native";
import { responsiveFontSize } from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome";
import { LCSectionUI } from "./LCSectionUI";
import WeekleyHealthCheckComponent from './../CovidWellnessCenter/WeeklyHealthCheckComponent'

/**
 * Wrapper component for the LCSectionUI component
 */
export class LCSection extends React.PureComponent {
  state = {
    hasError: false, //false by default
    screenReaderEnabled: false,

  };

  static defaultProps = {
    asurite: "",
    iSearchData: {},
  };

  componentDidMount() {
    AccessibilityInfo.addEventListener(
      "change",
      this._handleScreenReaderToggled
    );
    AccessibilityInfo.fetch().done((isEnabled) => {
      this.setState({
        screenReaderEnabled: isEnabled,
      });
    });
  }

  componentWillUnmount() {
    AccessibilityInfo.removeEventListener(
      "change",
      this._handleScreenReaderToggled
    );
  }

  _handleScreenReaderToggled = (isEnabled) => {
    this.setState({
      screenReaderEnabled: isEnabled,
    });
  };

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  render() {
    const { iSearchData, asurite, navigation, roles } = this.props;

    if (!this.state.hasError && !this.state.screenReaderEnabled) {
      return (
        <LCSectionUI
          navigation={navigation}
          asurite={asurite}
          iSearchData={iSearchData}
          roles={roles}
        />
      );
    } 
    else if (!this.state.hasError && this.state.screenReaderEnabled) {
      return (
       <WeekleyHealthCheckComponent displayType="livecard"/>
      );
    } 
    else {
      return (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            backgroundColor: "#efefef",
          }}
        >
          <View
            style={{
              marginVertical: 20,
            }}
          >
            <Icon
              name="exclamation-triangle"
              color="#b3b3b3"
              size={responsiveFontSize(6)}
            />
          </View>
          <Text
            style={{
              color: "#b3b3b3",
              fontSize: responsiveFontSize(2),
              fontWeight: "bold",
              textAlign: "center",
              fontFamily: "Roboto",
            }}
          >
            Sorry, but there was an error loading this section. Feel free to let
            us know via the feedback section from the app menu!
          </Text>
          {/* TEST */}
          {/* <Text>
              The screen reader is{' '}
              {this.state.screenReaderEnabled ? 'enabled' : 'disabled'}.
            </Text> */}
        </View>
      );
    }
  }
}
