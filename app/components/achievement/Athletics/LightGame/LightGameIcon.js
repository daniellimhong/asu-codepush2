import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Permissions from "react-native-permissions";

let Torch = null;

export default class LightGameIcon extends React.PureComponent {
  constructor(props) {
    super(props);
    this.isTorchOn = false;
    this.canRunGame = false;
    this._interval = null;
    this._timeout = null;
    this.state = {
      cameraPermission: "undetermined"
    };
    Torch = require("react-native-torch").default;
  }

  static defaultProps = {
    testing: false
  };

  componentDidMount() {
    this.checkCameraPermissions();
  }

  render() {
    return (
      <View style={styles.iconBox}>
        <TouchableOpacity
          onPress={() => {
            this.toggleGame();
          }}
        >
          <FontAwesome name="flash" size={30} color={"white"} />
        </TouchableOpacity>
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
  toggleGame() {
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
  }

  /**
   * Set the interval and timeout of the lights game
   */
  startGame() {
    this.canRunGame = true;
    this._interval = setInterval(() => {
      this.swapTorch();
    }, 300);

    this._timeout = setTimeout(() => {
      this.disableGame();
    }, 30000);
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

const styles = StyleSheet.create({
  iconBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#242424",
    borderBottomWidth: 1
  },
  drawerItem: {
    padding: 20,
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#313131"
  },
  drawerText: {
    color: "white"
  },
  drawerBottom: {
    padding: 20,
    width: "100%"
  }
});
