import React from "react";
import {
  View,
  TouchableOpacity,
  TouchableHighlight,
  Text,
  TextInput,
  Animated,
  Modal,
  StyleSheet
} from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";
import moment from "moment";
import { AnimatedHeight } from "./AnimatedHeight"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
const defaultIconSize = responsiveHeight(5.2);
const defaultIconHolderSize = responsiveHeight(10);
const defaultBlueIconBorderRadius = responsiveHeight(6);
import { ReservationInfo } from "./ReservationInfo"

export class OverMaxModal extends React.Component {
  constructor(props) {
    super(props);

  }

  static defaultProps = {
    showOverMaxModal: false,
    maxTime: null,
    closeModal: () => {}
  };

  render() {

    return (
      <View>
        <Modal
          visible={this.props.showModal}
          animationType={"slide"}
          transparent={true}
        >
          <TouchableHighlight
            onPress={() => {
              this.props.closeModal();
            }}
            disabled={true}
            style={styles.modalBackground}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[styles.modal]}
              onPress={() => {
                console.log("ignore");
              }}
            >
              <View style={{ flex:1, width: "100%", alignItems: "center", marginTop: responsiveHeight(2)  }}>
              {this.getHeader()}
              <View style={{height: responsiveHeight(2)}} />
                <View style={{marginHorizontal: responsiveWidth(8)}} >
                  <View>
                    <Text style={{textAlign: "center"}}>You have exceeded the maximum reservation allowance of {this.props.maxTime} minutes at this library.  Please adjust your booking.</Text>
                  </View>
                </View>
                <View style={{height: responsiveHeight(2)}} />
                {this.showButton()}
              </View>
            </TouchableOpacity>
          </TouchableHighlight>
        </Modal>
      </View>
    );
  }

  showButton = () => {
    return (
      <View
        style={{
          width: "100%",
          marginHorizontal: 0,
          flex: 1,
          marginTop: responsiveHeight(3),
          borderTopColor: "#e1e1e1",
          overflow: "hidden",
          borderTopWidth: 1
        }}
      >
        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => {
            this.setState({
              maxTime: false,
            })
            this.props.closeModal(this.props.status)
          }}
        >
          <View>
            <Text style={[styles.modalButtonText]}>Close</Text>
          </View>
        </TouchableOpacity>
      </View>
    )

  }

  getHeader = () => {

    return (
      <View
        style={{
          marginTop: responsiveHeight(3),
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <View
          style={[styles.blueCalIconHolder]}
        >
          <FontAwesome5
            name={"book-reader"}
            size={defaultIconSize}
            color="#FFF"
          />
        </View>
        <Animated.Text
          style={[
            styles.modalTitle
          ]}
        >
          Error
        </Animated.Text>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  blueCalIconHolder: {
    height: defaultIconHolderSize,
    width: defaultIconHolderSize,
    borderRadius: defaultBlueIconBorderRadius,
    backgroundColor: "#2aacf9",
    borderColor: "#2aacf9",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  bolded: {
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  modalBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.8),
    textAlign:"center",
    marginTop: responsiveHeight(2),
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  modalFullCont: {
    top: responsiveHeight(10)
  },
  modal: {
    top: responsiveHeight(15),
    left: 20,
    right: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    position: "absolute",
    borderWidth: 1,
    borderColor: "#efefef",
    borderRadius: 6
  },
  modalButton: {
    padding: 15,
    flex: 1
  },
  modalButtonText: {
    textAlign: "center",
    fontSize: responsiveFontSize(1.6),
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  disableBtn: {
    color: "#ccc"
  }
});
