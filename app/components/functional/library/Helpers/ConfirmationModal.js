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

export class ConfirmationModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      animStep1: new Animated.Value(0),
      maxTime: false,
      myHeight: null
    };

  }

  componentDidUpdate(prevProps,prevState) {
    if( !prevProps.showModal && this.props.showModal ) {
      setTimeout(()=>{
        if( this.props.status === "Sending" ) {
          this.setState({
            maxTime: true
          })
        }
      },10000)
    }

    if( this.props.status != prevProps.status ) {
      // Animated.timing(this.state.animStep1, {
      //   toValue: 1,
      //   duration: 300
      // }).start();
      this.setState({
        myHeight: 0,
        animStep1: new Animated.Value(1)
      })
      setTimeout(()=>{
        this.setState({
          myHeight: null,
          animStep1: new Animated.Value(0)
        })
      },300)
    }
  }

  static defaultProps = {
    showModal: false,
    status: "Sending",
    closeModal: () => {},
    libInfo: {}
  };

  whatToShow = () => {

    if( this.props.status == "Sending" ) {

        if( this.state.maxTime ) {

          return (
            <View>
              <Text style={{textAlign: "center"}}>It looks like it's taking a while to send your request, but we're still trying!</Text>
            </View>
          )
        } else {
          return null;
        }
    } else if ( this.props.status == "Error" ) {
      return (
        <View>
          <Text style={{textAlign: "center"}}>Oops! There was an issue sending your request. Please try again later</Text>
        </View>
      )
    } else {
      return (
        <ReservationInfo showTopper={true} libraryName={this.props.libInfo.libraryName} date={this.props.libInfo.date} roomName={this.props.libInfo.roomName} time={this.props.libInfo.time} />
      )
    }
  }

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
              {
                <AnimatedHeight myHeight={this.state.myHeight}>
                  <View style={{marginHorizontal: responsiveWidth(8)}} >
                    {this.whatToShow(this.props.status)}
                  </View>
                  {
                    <View style={{height: responsiveHeight(2)}} />
                  }
                  {this.showButton()}
                </AnimatedHeight>
              }
              </View>
            </TouchableOpacity>
          </TouchableHighlight>
        </Modal>
      </View>
    );
  }

  showButton = () => {
    if( this.props.status !== "Sending" || this.state.maxTime ) {
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

  }

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
            styles.modalTitle,
            {
              opacity: opacity
            }
          ]}
        >
          {this.props.status}
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
