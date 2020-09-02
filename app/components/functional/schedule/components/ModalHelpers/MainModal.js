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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { AddEventForm } from "./AddEventForm";
import { BaseView } from "./BaseView";
import { ImportCal } from "./ImportCal";
import { ModalViewContainer } from "./ModalViewContainer";

const defaultIconSize = responsiveHeight(5.2);
const defaultIconHolderSize = responsiveHeight(10);
const defaultBlueIconBorderRadius = responsiveHeight(6);

const titleIconSize = responsiveHeight(2.7);
const titleIconHolderSize = responsiveHeight(5);
const titleBlueIconBorderRadius = responsiveHeight(6);

export class MainModal extends React.Component {

  constructor(props) {
    super(props);
    // console.log("HERE PROPS",props)
    this.state = {
      showManageCal: props.showManageCal !== undefined ? props.showManageCal : false,
      readyNext: props.addOnDay ? true : false,
      myHeight: null,
      showPicker: false,
      eventText: null,
      eventLocation: null,
      formReady: false,
      eventTime: props.addOnDay ? props.addOnDay : null,
      showAdd: false,
      modalTitle: props.addOnDay ? "Add Event" : null,
      showEdit: props.addOnDay ? true : false,
      blueIconHolderSize: defaultIconHolderSize,
      blueIconSize: defaultIconSize,
      blueIconBorderRadius: defaultBlueIconBorderRadius,
      animStep1: new Animated.Value(0),
    };
  }

  static defaultProps = {
    showManageCal: null
  };

  componentWillReceiveProps(nextProps) {
    if( nextProps.showManageCal != undefined && nextProps.showManageCal != null  && nextProps.showManageCal != this.props.showManageCal ) {
      this.setState({
        showManageCal: nextProps.showManageCal,
        eventTime: nextProps.addOnDay ? nextProps.addOnDay : null,
        readyNext: nextProps.addOnDay ? true : false,
        showEdit: nextProps.addOnDay ? true : false,
        modalTitle: nextProps.addOnDay ? "Add Event" : null,
        animStep1: nextProps.addOnDay ? new Animated.Value(1) : new Animated.Value(0),
        blueIconHolderSize: nextProps.addOnDay ? titleIconHolderSize : defaultIconHolderSize
      })
    }
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if( prevProps.showManageCal)
  // }

  closeAndReset = () => {
    this.setState({
      showManageCal: false
    });
    this.props.closeModal();
    this.resetViews();
  }

  resetViews = () => {
    setTimeout(() => {
      this.state.animStep1.setValue(0);
      this.setState({
        myHeight: null,
        eventText: null,
        eventLocation: null,
        eventTime: null
      })
    }, 1000);
    this.setState({
      showEdit: false,
      showAdd: false,
      blueIconSize: defaultIconSize,
      blueIconHolderSize: defaultIconHolderSize,
      blueIconBorderRadius: defaultBlueIconBorderRadius,
      modalTitle: null,
      readyNext: false,
      formReady: false
    });
  };

  changeView = title => {

    Animated.timing(this.state.animStep1, {
      toValue: 1,
      duration: 750
    }).start();

    setTimeout(() => {
      this.setState({
        myHeight: 0
      })
    }, 200);

    if( title !== "Add Calendar" ) {
      setTimeout(() => {
        this.setState({
          myHeight: null
        })
      }, 800);
    }

    setTimeout(() => {
      this.setState({
        readyNext: (title === "Add Event" || title == "Add Calendar")
      });
    }, 750);

    this.setState({
      showEdit: title === "Add Event",
      showAdd: title === "Add Calendar",
      blueIconSize: titleIconSize,
      blueIconHolderSize: titleIconHolderSize,
      blueIconBorderRadius: titleBlueIconBorderRadius,
      modalTitle: title
    });
  };

  calReady = () => {
    this.setState({
      myHeight: null
    })
  }

  findForm = () => {

    var myWidth = 3;
    var returnInfo = null;

    if (!this.state.readyNext) {
      myWidth = 10;
      returnInfo = (
        <BaseView viewChange={this.changeView.bind(this)}/>
      );
    } else if (this.state.showEdit) {
      returnInfo = (
        <AddEventForm eventTime={this.state.eventTime} closeAndReset={this.closeAndReset.bind(this)} closedView={this.state.showManageCal}/>
      );
    } else if (this.state.showAdd) {
      returnInfo = (
        <ImportCal closeAndReset={this.closeAndReset.bind(this)} calReady={this.calReady.bind(this)} phoneCal={this.props.phoneCal}/>
      );
    }

    return (
      <View
        style={{
          paddingHorizontal: responsiveWidth(2),
          overflow: "hidden"
        }}
      >
        {returnInfo}
      </View>
    );
  };

  setTime = (t) => {
    //Hit Cancel
    if( t === 1 ) {
      this.state.eventTime = null;
    }

    this.setState({
      showPicker: !this.state.showPicker
    })
  }

  render() {

    return (
      <View>
        <Modal
          visible={this.state.showManageCal}
          animationType={"slide"}
          transparent={true}
        >
          <TouchableHighlight
            onPress={() => {
              this.closeAndReset();
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
              <View style={{ flex:1, width: "100%", alignItems: "center", marginTop: responsiveHeight(3)  }}>

              {this.getHeader()}
              {
                <ModalViewContainer myHeight={this.state.myHeight}>
                  <View key={"myTestKey"}>
                    {this.findForm()}
                  </View>
                </ModalViewContainer>
              }

              </View>
            </TouchableOpacity>
          </TouchableHighlight>
        </Modal>
      </View>
    );
  }

  getHeader = () => {

    var transform = [
      {
        scaleX: this.state.animStep1.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.6]
        })
      },
      {
        scaleY: this.state.animStep1.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.6]
        })
      },
      {
        translateY: this.state.animStep1.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -responsiveHeight(4)]
        })
      },
      {
        translateX: this.state.animStep1.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -responsiveHeight(3)]
        })
      }
    ];

    const opacity = this.state.animStep1.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });

    const topHeight = this.state.animStep1.interpolate({
      inputRange: [0, 1],
      outputRange: [defaultIconHolderSize, titleIconHolderSize]
    });

    return (
      <Animated.View
        style={{
          flexDirection: "row",
          marginTop: responsiveHeight(3),
          height: topHeight,
          flex: 1
        }}
      >
        <Animated.View
          style={[styles.blueCalIconHolder, { transform: transform }]}
        >
          <MaterialCommunityIcons
            name={"calendar-plus"}
            size={defaultIconSize}
            color="#FFF"
          />
        </Animated.View>
        <Animated.Text
          style={[
            styles.modalTitle,
            {
              lineHeight: this.state.blueIconHolderSize,
              opacity: opacity
            }
          ]}
        >
          {this.state.modalTitle}
        </Animated.Text>
      </Animated.View>
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
  modalBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.3),
    textAlignVertical: "center",
    marginLeft: -12
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
});
