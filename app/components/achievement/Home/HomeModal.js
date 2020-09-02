import React, { Component } from "react";
import {
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
  Keyboard,
  AsyncStorage
} from "react-native";
import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/Ionicons";
import { responsiveHeight } from "react-native-responsive-dimensions";

/**
 * Wraps the app with modal functionality so that all child components can
 * easily display modals.
 *
 * To implement call the following through child context -
 * setModalContent(<ContentComponent>) & setModalVisible(true/false)
 *
 */
export class HomeModal extends Component {
  state = {
    modalVisible: false,
    modalContent: () => {
      return <View />;
    },
    include: null
  };

  /**
   * Turn the modal on or off
   * @param {*} visible
   */
  setModalVisible(visible) {
    if (visible) {
      this.setState({ modalVisible: visible });
    } else {
      this.setState({
        modalVisible: visible,
        modalContent: View,
        modalHeight: responsiveHeight(80),
        modalProps: {}
      });
    }
  }

  /**
   * context function that will allow sub-components to set the modal height when using
   */
  setModalHeight(modalHeight) {
    this.setState({ modalHeight: modalHeight });
  }

  /**
   * Pass a component into the modal to be rendered
   * @param {*} content
   */
  setModalContent(content, props) {
    // console.log("these guys",props);
    this.setState({
      modalContent: content,
      modalProps: props
    });
  }

  /**
   * Get current modal status
   */
  getModalStatus() {
    return this.state;
  }
  /**
   * Helper function to render other elements along with the modal.
   * Ex. The "Next" button during onboarding
   * @param {*} element
   */
  renderOtherElement(element) {
    this.setState({
      include: element
    });
  }

  getChildContext() {
    let smc = this.setModalContent;
    let visible = this.setModalVisible;
    let modalHeight = this.setModalHeight;
    let include = this.renderOtherElement;

    return {
      setModalContent: smc.bind(this),
      setModalVisible: visible.bind(this),
      setModalHeight: modalHeight.bind(this),
      getModalStatus: this.getModalStatus.bind(this),
      renderOtherElement: include.bind(this)
    };
  }

  render() {
    let Content = this.state.modalContent;
    let modalFlex = this.state.modalFlex || 0.9;
    let modalHeight = this.state.modalHeight || responsiveHeight(80);
    let xIcon = (
      <View
        style={{
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0)"
        }}
      >
        <Icon name="ios-close" size={40} color={"black"} />
      </View>
    );
    xIcon = null;
    return (
      <View style={{ flex: 1 }}>
        <Modal
          animationType="none"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,.8)" }}>
              {this.state.include}
              <View
                style={{
                  margin: 20,
                  marginTop: 30,
                  backgroundColor: "white",
                  borderRadius: 5,
                  height: modalHeight
                }}
              >
                <View
                  style={{ position: "absolute", top: 0, right: 0, zIndex: 5 }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      this.setModalContent(null, null);
                      this.setModalVisible(!this.state.modalVisible);
                      AsyncStorage.setItem("finishedOnboard", "finished");
                    }}
                  >
                    {xIcon}
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }}>
                  <Content {...this.state.modalProps} />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <View style={{ flex: 1 }}>{this.props.children}</View>
      </View>
    );
  }
}

HomeModal.childContextTypes = {
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func,
  setModalHeight: PropTypes.func,
  getModalStatus: PropTypes.func,
  renderOtherElement: PropTypes.func
};
