import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  AppState
} from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import Permissions from "react-native-permissions";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PropTypes from "prop-types";
import { HeaderQuick } from "../../Header/HeaderQuick";

let Torch = null;

export class LightGame extends React.PureComponent {
  constructor(props) {
    super(props);
    this.isTorchOn = false;
    this.canRunGame = false;
    this._interval = null;
    this._timeout = null;
    this.state = {
      cameraPermission: "undetermined",
      toggle: false
    };
    Torch = require("react-native-torch").default;
  }

  componentDidMount() {
    this.checkCameraPermissions();
    AppState.addEventListener("change", this.handleAppStateChange);
  }
  componentWillUnmount() {
    this.disableGame();
    AppState.removeEventListener("change", this.handleAppStateChange);
  }

  handleAppStateChange = nextAppState => {
    if (nextAppState.match(/inactive|background/)) {
      this.disableGame();
    } else {
      this.startGame();
    }
  };

  render() {
    let { navigate, goBack } = this.props.navigation;
    let leftNav = (
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center"
        }}
      >
        <TouchableOpacity
          onPress={() => {
            this.disableGame();
            goBack();
          }}
        >
          <MaterialIcon
            name="navigate-before"
            size={40}
            color="white"
            accessibilityLabel="Back"
            accessibilityRole="button"
          />
        </TouchableOpacity>
      </View>
    );

    return (
      <View>
        <HeaderQuick
          left={leftNav}
          theme="dark"
          navigation={this.props.navigation}
          title={"Light It Up!"}
        />
        <LightGameScreen
          toggleLight={this.toggleGame}
          toggle={this.state.toggle}
        />
      </View>
    );
  }

  /**
   * Check permissions of game
   */
  checkCameraPermissions() {
    if (this.props.testing === true) {
      //Do nothing if testing
    } else {
      Permissions.checkMultiple(["camera"]).then(response => {
        this.setState({
          cameraPermission: response.camera
        });
      });
    }
  }

  /**
   * Toggle the lights game on or off
   */
  toggleGame = () => {
    if (
      this.state.cameraPermission == "authorized" ||
      this.state.cameraPermission == "undetermined"
    ) {
      if (!this.canRunGame) {
        this.startGame();
      } else {
        this.disableGame();
      }
    }
  };

  /**
   * Set the interval and timeout of the lights game
   */
  startGame() {
    this.canRunGame = true;
    this._interval = setInterval(() => {
      this.swapTorch();
    }, 300);

    /*this._timeout = setTimeout(() => {
      this.disableGame()
    },40000)*/
  }

  /**
   * Disable the lights game, turning off the light and clearing the interval and timeout
   */
  disableGame() {
    this.canRunGame = false;
    this.killInterval();
    if (this.isTorchOn) {
      this.swapTorch();
    }
  }

  /**
   * Toggle the light on/off
   */
  swapTorch() {
    this.isTorchOn = !this.isTorchOn;
    Torch.switchState(this.isTorchOn);
  }

  /**
   * Clear interval & timeout
   */
  killInterval() {
    clearInterval(this._interval);
    clearTimeout(this._timeout);
  }
}

class LightGameScreen extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      gold: true
    };
  }

  static defaultProps = {
    toggle: false,
    toggleLight: () => null
  };

  _timeout = null;

  _interval = null;
  componentDidMount() {
    this.toggle();
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.toggle !== this.props.toggle) {
      if (this.props.toggle) {
        this.toggle();
      } else {
        this.killInterval();
      }
    }
  }

  toggle = () => {
    if (this._interval == null) {
      this.props.toggleLight();
      this._interval = setInterval(() => {
        this.swapScreen();
      }, 600);

      // this._timeout = setTimeout(() => {
      //   this.killInterval()
      // },30000)
    } else {
      this.props.toggleLight();
      this.killInterval();
      this._timeout = null;
      this._interval = null;
    }
  };

  swapScreen() {
    this.setState({
      gold: !this.state.gold
    });
  }

  killInterval() {
    clearInterval(this._interval);
    clearTimeout(this._timeout);
  }

  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          //this.toggle();
        }}
      >
        {this.state.gold ? <LightGameGold /> : <LightGameMaroon />}
      </TouchableOpacity>
    );
  }
}

class LightGameGold extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      background: require("./assets/background-gold.jpg"),
      goDevils: require("./assets/godevils1a2x.png"),
      pitchfork: require("./assets/Pitchfork1a2x.png")
    };
  }

  render() {
    return (
      <ImageBackground
        source={this.state.background}
        style={{ width: responsiveWidth(100), height: responsiveHeight(100) }}
        resizeMethod="resize"
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            marginTop: responsiveHeight(5)
          }}
        >
          <Image
            style={{ height: responsiveHeight(27) }}
            source={this.state.goDevils}
            resizeMode="contain"
            resizeMethod="resize"
          />
          <Image
            style={{ height: responsiveHeight(50) }}
            source={this.state.pitchfork}
            resizeMode="contain"
            resizeMethod="resize"
          />
        </View>
      </ImageBackground>
    );
  }
}

class LightGameMaroon extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      background: require("./assets/background-maroon.jpg"),
      goDevils: require("./assets/godevilsa2x.png"),
      pitchfork: require("./assets/Pitchforka2x.png")
    };
  }

  render() {
    return (
      <ImageBackground
        source={this.state.background}
        style={{ width: responsiveWidth(100), height: responsiveHeight(100) }}
        resizeMethod="resize"
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            marginTop: responsiveHeight(5)
          }}
        >
          <Image
            style={{ height: responsiveHeight(27) }}
            source={this.state.goDevils}
            resizeMode="contain"
            resizeMethod="resize"
          />
          <Image
            style={{ height: responsiveHeight(50) }}
            source={this.state.pitchfork}
            resizeMode="contain"
            resizeMethod="resize"
          />
        </View>
      </ImageBackground>
    );
  }
}
