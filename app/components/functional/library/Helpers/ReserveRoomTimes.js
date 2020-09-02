import React, { PureComponent } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  AsyncStorage,
  TouchableOpacity
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import moment from "moment";
import { ConfirmationModal } from "./ConfirmationModal";
import { OverMaxModal } from "./OverMaxModal";
import {
  areConsecutive,
  atLeastOneAvail,
  resetWithIndex,
  checkSelects,
  generateTimeSlots,
  libApi,
  cacheTimes,
  cachedGenTimes,
  cacheRoom,
  getCurrentRes,
  getTodaysRes
} from "../StudyRooms/utility";

export class ReserveRoomTimes extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
      atLeastOne: false,
      showOverMaxModal: false,
      showModal: false,
      libInfo: {},
      update: 0,
      sendStatus: "Sending",
      generalTimes: generateTimeSlots(props)
    };

    this.overWriteTimeSlots(props.roomId);

  }

  static defaultProps = {
    item: {},
    refreshTimes: ()=>{}
  };

  overWriteTimeSlots = (id) => {
    cachedGenTimes(id,this.state.generalTimes).then( resp => {
      // console.log("SHOULD USE GENERAL TIMES OVERRITE",resp)
      if( resp !== false ) {
        this.setState({
          generalTimes: resp
        })
      }
    })
  }

  sendInfo = () => {

    var start = 0;
    var end = 0;
    let times = this.state.generalTimes;

    for( var i = 0; i < times.length; ++i ) {
      if( times[i].selected ) {
        if( start === 0 ) {
          start = times[i].time;
        }
        end = moment(times[i].time).add(30, "minutes").unix() * 1000;
      }
    }

    var resMinutes = (end-start)/(1000*60);
    var totalTimeToday = getTodaysRes(this.props.libraryName, start);

    if( this.props.maxTime >= (resMinutes+totalTimeToday) ) {
      console.log("Will finish send");
      this.finishSend(start,end);
    } else {
      console.log("WILL GET",getCurrentRes());
      this.setState({
        showOverMaxModal: true
      })
    }


  };

  closeMaxModal = () => {
    this.setState({
      showOverMaxModal: false
    })
  }

  finishSend = (start,end) => {
    this.setState({
      showModal: true,
      errorSending: false,
      libInfo: {
        roomName: this.props.roomName,
        libraryName: this.props.libraryName,
        date: moment(start).format("dddd MMM DD, YYYY"),
        time: moment(start).format("h:mm a") + " - " + moment(end).format("h:mm a")
      }
    });

    let prepForCache = {
      fromDate: moment(start).format(),
      toDate: moment(end).format(),
      libraryName: this.props.libraryName,
      roomName: this.props.roomName,
      validUntil: moment().add(5,'minutes').unix(),
      status: "pendingConfirmation",
      booking_id: null
    }

    var toSend = {
      start: moment(start).format(),
      bookings: [{
        id: this.props.roomId,
        to: moment(end).format()
      }]
    }

    let payload = {
      operation: "makeReservation",
      postInfo: toSend
    }

    libApi(payload).then( resp => {
      if( resp.booking_id ) {
        prepForCache.booking_id = resp.booking_id;
        cacheRoom(prepForCache);
      }
      //Tests
      if( resp.success ) {
        prepForCache.booking_id = "NOT_AN_ID"+Math.floor(Math.random() * 1800) + 1;
        cacheRoom(prepForCache);
      }

      this.setState({
        showModal: true,
        sendStatus: "Success"
      });
    }).catch( err => {
      this.setState({
        showModal: true,
        sendStatus: "Error"
      });
    })
  }

  setSelect = (x, i) => {
    var atLeastOne = false;

    var tempGen = this.state.generalTimes;
    tempGen[i].selected = !tempGen[i].selected;

    if (!areConsecutive(tempGen)) {
      tempGen = resetWithIndex(tempGen, i);
    }

    this.setState({
      generalTimes: tempGen,
      update: this.state.update + 1,
      atLeastOne: checkSelects(tempGen)
    });
  };

  showTime = (d, i) => {
    let bgColor = "#fff";
    if (!d.available) {
      bgColor = "#dedede";
    }

    if (d.selected) {
      bgColor = "#03a1e2";
    }

    return (
      <View
        key={"time_" + i}>
        <TouchableOpacity
          style={{}}
          disabled={!d.available}
          onPress={() => {
            this.setSelect(d, i);
          }}
        >
          <View
            style={{
              width: responsiveWidth(17.5),
              marginLeft: i % 4 > 0 ? responsiveWidth(5) : 0,
              marginTop: responsiveHeight(2),
              borderColor: d.selected ? bgColor : "#ccc",
              borderWidth: 1,
              borderRadius: 2,
              paddingVertical: responsiveHeight(1),
              backgroundColor: bgColor
            }}
          >
            <View>
              <Text
                style={{
                  textAlign: "center",
                  color: d.selected ? "white" : "black",
                  fontSize: responsiveFontSize(1.5)
                }}
              >
                {d.formattedTime}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    var myHeight = 0;
    if (this.state.opened) {
      myHeight = null;
    }

    let item = this.props.item;

    if (this.props.availability.length == 0) {
      return (
        <View style={{marginBottom: responsiveHeight(2)}}>
          <Text>
            There are no available time slots during your selected time
          </Text>
        </View>
      );
    } else {
      var btnColor = "#e0e0e0";

      if (this.state.atLeastOne) {
        btnColor = "#d12d5a";
      }

      return (
        <View style={{ paddingBottom: responsiveHeight(4) }}>

          {
            atLeastOneAvail(this.state.generalTimes) ? (
              <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
                {this.state.generalTimes.map((date, index) => {
                  return this.showTime(date, index);
                })}
              </View>
            ) : (
              <View style={{marginBottom: responsiveHeight(1.5),marginTop: responsiveHeight(1.5)}}>
                <Text>
                  There are no available time slots during your selected time
                </Text>
              </View>
            )
          }

          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: responsiveHeight(4)
            }}
          >
            <View>
              <TouchableOpacity
                onPress={() => {
                  this.sendInfo();
                }}
                disabled={!this.state.atLeastOne}
                style={{
                  backgroundColor: btnColor,
                  width: responsiveWidth(40),
                  paddingVertical: responsiveHeight(0.5),
                  borderColor: btnColor,
                  borderWidth: 1,
                  borderRadius: 50
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: responsiveFontSize(1.5),
                    textAlign: "center"
                  }}
                >
                  RESERVE TIMES
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <ConfirmationModal
            showModal={this.state.showModal}
            status={this.state.sendStatus}
            closeModal={this.closeModal.bind(this)}
            libInfo={this.state.libInfo}
          />
          <OverMaxModal
            showModal={this.state.showOverMaxModal}
            maxTime={this.props.maxTime}
            closeModal={this.closeMaxModal.bind(this)}
          />
        </View>
      );
    }
  }

  closeModal = (s) => {
    var disableSelected = false;
    var myTimes = [];

    if( s === "Success" ) {

      let times = this.state.generalTimes;

      for( var i = 0; i < times.length; ++i ) {
        if( times[i].selected ) {
          myTimes.push(times[i].time);
        }
      }

      disableSelected = true;
      this.props.refreshTimes();
    }

    let saveTimes = {
      generalTimes: generateTimeSlots(this.props,disableSelected,myTimes),
      validUntil: moment().add(5,'minutes').unix(),
      date: moment(this.state.generalTimes[0].time).format("YYYYMMDD")
    }

    cacheTimes(saveTimes,this.props.roomId).then( resp => {
      this.overWriteTimeSlots(this.props.roomId)
    });


    this.setState({
      showModal: false,
      sendStatus: "Sending",
      libInfo: {},
      update: this.state.update + 1
    });

  };
}

const styles = StyleSheet.create({
  smallText: {
    fontSize: responsiveFontSize(1.3)
  },
  bolded: {
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  strikeThru: {
    position: "absolute",
    transform: [{ rotate: "-20deg" }],
    top: responsiveHeight(2),
    left: 0,
    width: responsiveWidth(19.5),
    height: 1,
    borderBottomColor: "#aaa",
    borderBottomWidth: 1
  }
});
