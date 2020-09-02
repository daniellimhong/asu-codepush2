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
import { AnimatedHeight } from "./AnimatedHeight";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
const defaultIconSize = responsiveHeight(5.2);
const defaultIconHolderSize = responsiveHeight(10);
const defaultBlueIconBorderRadius = responsiveHeight(6);
import { ReservationInfo } from "./ReservationInfo";
import { libApi, markIdForCancellation } from "../StudyRooms/utility"

export class CancelRoomModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      animStep1: new Animated.Value(0),
      maxTime: false,
      myHeight: null
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.showModal && this.props.showModal) {
      setTimeout(() => {
        if (this.props.status === "Sending") {
          this.setState({
            maxTime: true
          });
        }
      }, 10000);
    }

    if (this.props.status != prevProps.status) {
      this.setState({
        myHeight: 0,
        animStep1: new Animated.Value(1)
      });
      setTimeout(() => {
        this.setState({
          myHeight: null,
          animStep1: new Animated.Value(0)
        });
      }, 300);
    }
  }

  static defaultProps = {
    showModal: false,
    status: "Sending",
    closeModal: () => {},
    libInfo: {}
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
              this.props.closeModal(false);
            }}
            style={styles.modalBackground}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[styles.modal]}
              onPress={() => {
                console.log("ignore");
              }}
            >
              <View
                style={{
                  flex: 1,
                  width: "100%",
                  alignItems: "center",
                  marginTop: responsiveHeight(2)
                }}
              >
                <View style={{ height: responsiveHeight(2) }} />
                {
                  <AnimatedHeight myHeight={this.state.myHeight}>
                    <View style={{ marginHorizontal: responsiveWidth(8) }}>
                      <View style={{ marginBottom: responsiveHeight(2) }}>
                        <Text
                          style={{ textAlign: "center", fontWeight: "500", fontFamily: 'Roboto', }}
                        >
                          Are you sure you want to cancel the following
                          reservation?
                        </Text>
                      </View>
                      <ReservationInfo
                        libraryName={this.props.libInfo.libraryName}
                        date={this.props.libInfo.date}
                        roomName={this.props.libInfo.roomName}
                        time={this.props.libInfo.time}
                      />
                    </View>
                    {<View style={{ height: responsiveHeight(2) }} />}
                    {this.buttons()}
                  </AnimatedHeight>
                }
              </View>
            </TouchableOpacity>
          </TouchableHighlight>
        </Modal>
      </View>
    );
  }

  cancelRes = () => {

    this.setState({
      sending: true,
      sendingError: false
    });

    let payload = {
      operation: "cancelReservation",
      resId: this.props.bookId
    }

    libApi(payload).then( resp => {
      markIdForCancellation(this.props.bookId,this.props.fullInfo);
      this.props.closeModal(true);
    }).catch(err => {
      console.log("FAILED DELETING",err)
      this.props.closeModal(true);
    })

  }

  buttons = () => {
    return (
      <View
        style={{
          width: "100%",
          marginHorizontal: 0,
          flex: 1,
          flexDirection: "row",
          marginTop: responsiveHeight(3),
          borderTopColor: "#e1e1e1",
          overflow: "hidden",
          borderTopWidth: 1
        }}
      >
        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => {
            this.props.closeModal(false);
          }}
        >
          <View>
            <Text style={[styles.modalButtonText]}>Keep Reservation</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modalButton,
            {
              borderLeftColor: "#e1e1e1",
              borderLeftWidth: 1
            }
          ]}
          onPress={() => {
            this.cancelRes();
          }}
        >
          <View>
            <Text style={[styles.modalButtonText]}>Cancel Reservation</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  getHeader = () => {
    const opacity = this.state.animStep1.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0]
    });

    return (
      <View
        style={{
          marginTop: responsiveHeight(3),
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <View style={[styles.blueCalIconHolder]}>
          <FontAwesome5
            name={"book-reader"}
            size={defaultIconSize}
            color="#FFF"
          />
        </View>
        <Animated.Text
          style={[
            styles.modalTitle,
            {
              opacity: opacity
            }
          ]}
        >
          {this.props.status}
        </Animated.Text>
      </View>
    );
  };
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
    textAlign: "center",
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
