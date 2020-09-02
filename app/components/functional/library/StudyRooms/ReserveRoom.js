import React, { PureComponent } from "react";
import {
  Text,
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import moment from "moment";

import { Dropdown } from "../Helpers/LibDropdown";
import { Header } from "../Helpers/SimpleSectionHeader";
import { AnimatedHeight } from "../Helpers/AnimatedHeight";
import { ReserveRoomListItem } from "../Helpers/ReserveRoomListItem";
import { commonStyles } from "../Helpers/CommonStyles";
import { libApi, getCaps, getDates } from "./utility";

const stepTitles = ["Select Capacity and Date", "Select Times and Reserve"];

export default class ReserveRoom extends PureComponent {
  static defaultProps = {
    capacity: null,
    date: null,
    selectedForm: null,
    roomInfo: {}
  };

  constructor(props) {
    super(props);

    this.state = {
      roomAvailability: [],
      loadingError: false,
      loading: true,
      callingApi: false,
      roomIds: props.roomInfo ? props.roomInfo.allRoomIds : null,
      caps: getCaps(props.roomInfo.capMax ? props.roomInfo.capMax : 10),
      dates: getDates(7),
      roomTime: null,
      resetTime: 0,
      capacity: 0
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { roomInfo } = this.props;
    const { capacity, roomTime, resetTime } = this.state;
    if (roomInfo && roomInfo.lid !== prevProps.roomInfo.lid) {
      this.setRoomIds();
      this.setState({
        roomAvailability: [],
        loadingError: false,
        loading: true,
        capacity: 0,
        caps: getCaps(roomInfo.capMax ? roomInfo.capMax : 10),
        roomTime: null
      });
    } else if (
      capacity > 0 &&
      roomTime &&
      (capacity !== prevState.capacity || roomTime !== prevState.roomTime)
    ) {
      this.setState({
        loading: true,
        resetTime: resetTime + 1
      });
      this.getSpaceAvailability();
    }
  }

  setRoomIds = () => {
    const { roomInfo } = this.props;
    this.setState({ roomIds: roomInfo.allRoomIds });
  };

  getSpaceAvailability = () => {
    const { roomInfo } = this.props;
    const { roomIds, roomTime, capacity } = this.state;
    this.setState({
      loadingError: false,
      callingApi: true
    });

    const payload = {
      operation: "getSpaceAvailability",
      roomIds,
      time: roomTime,
      capacity
    };

    libApi(payload)
      .then(resp => {
        let tempInfo = roomInfo.allRooms;

        if (JSON.stringify(resp) !== "{}") {
          for (let i = 0; i < tempInfo.length; ++i) {
            tempInfo[i].availability = resp[tempInfo[i].roomId]
              ? resp[tempInfo[i].roomId]
              : [];
          }
        } else {
          tempInfo = [];
        }

        this.setState({
          loading: false,
          callingApi: false,
          roomAvailability: tempInfo
        });
      })
      .catch(err => {
        console.log("Lib avail err", err);
        this.setState({
          loadingError: true,
          callingApi: false,
          loading: false
        });
      });
  };

  stepTitle = index => {
    return (
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            backgroundColor: "#cb0345",
            alignItems: "center",
            paddingHorizontal: responsiveWidth(2),
            paddingVertical: responsiveWidth(1),
            borderColor: "#cb0345",
            borderWidth: 1,
            borderRadius: 3
          }}
        >
          <Text
            style={{
              color: "#FFF",
              fontSize: responsiveFontSize(1.6),
              fontWeight: "800",
              fontFamily: "Roboto",
            }}
          >
            Step {index + 1}
          </Text>
        </View>
        <View style={{ marginLeft: 5, paddingVertical: responsiveWidth(1) }}>
          <Text style={{ fontSize: responsiveFontSize(2), fontWeight: "600", fontFamily: "Roboto" }}>
            {stepTitles[index]}
          </Text>
        </View>
      </View>
    );
  };

  checkForNext = () => {
    const { capacity, roomTime } = this.state;
    if (capacity > 0 && roomTime) {
      this.getSpaceAvailability();
    }
  };

  changeCapacity = i => {
    this.setState({
      capacity: i.id
    });
  };

  changeDate = i => {
    const date = moment(i.id * 1000).format("YYYY-MM-DD");
    this.setState({
      roomTime: date
    });
  };

  step1 = () => {
    const { roomInfo } = this.props;
    const { caps, dates } = this.state;
    return (
      <View>
        {this.stepTitle(0)}
        <Dropdown
          currentView={roomInfo.lid}
          dropOptions={caps}
          defaultText="Select capacity"
          onPress={this.changeCapacity}
        />
        <Dropdown
          currentView={roomInfo.lid}
          dropOptions={dates}
          defaultText="Select date"
          onPress={this.changeDate}
        />
      </View>
    );
  };

  step2 = () => {
    const { roomAvailability } = this.state;
    return (
      <View>
        <View style={{ width: responsiveWidth(85), justifyContent: "center" }}>
          {this.stepTitle(1)}
          <View style={{ paddingTop: responsiveHeight(2) }}>
            <Text
              style={{ color: "#676767", marginBottom: responsiveHeight(2) }}
            >
              Please choose times below. Rooms may be booked in 30 minute
              sequential intervals.
            </Text>

            <FlatList
              style={{ flex: 1 }}
              data={roomAvailability}
              renderItem={this._renderRoomRow}
              keyExtractor={item => item.name + item.id}
              ListEmptyComponent={this.showEmptyListView()}
            />
          </View>
        </View>
      </View>
    );
  };

  _renderRoomRow = ({ item }) => {
    const { roomInfo, selectedForm } = this.props;
    const { resetTime } = this.state;
    return (
      <View key={item.name}>
        <ReserveRoomListItem
          item={item}
          refreshTimes={this.getSpaceAvailability}
          libHours={roomInfo.hours}
          libraryName={roomInfo.name}
          forceClose={resetTime}
          selectedForm={selectedForm}
        />
      </View>
    );
  };

  showEmptyListView = () => {
    return (
      <View>
        <Text
          style={{ textAlign: "center", marginHorizontal: responsiveWidth(2) }}
        >
          No rooms found
        </Text>
      </View>
    );
  };

  loadingError = () => {
    return (
      <Text
        style={{ textAlign: "center", marginHorizontal: responsiveWidth(2) }}
      >
        There was an issue loading the requested information. Please try again
        later
      </Text>
    );
  };

  render() {
    const { roomInfo } = this.props;
    const { loading, loadingError, callingApi } = this.state;
    const itemTitle = roomInfo.name ? roomInfo.name : "Unknown Room";

    let myHeight = 0;
    if (!loading) {
      myHeight = null;
    }
    // if( this.state.roomAvailability.length > 0 || this.state.loadingError ) {
    //   myHeight = null;
    // }

    return (
      <View>
        <View style={commonStyles.shadowBox}>
          <Header
            largeText={itemTitle}
            smallText="Currently Viewing"
            backgroundColor="#2a2b2f"
            textColor="#FFF"
          />
          <View style={styles.basicBlock}>
            <View>{this.step1()}</View>
          </View>
          <AnimatedHeight myHeight={myHeight}>
            <View
              style={[
                styles.basicBlock,
                { borderTopWidth: 1, borderTopColor: "#ccc" }
              ]}
            >
              <View>{loadingError ? this.loadingError() : this.step2()}</View>
            </View>
          </AnimatedHeight>

          {callingApi ? (
            <View
              style={[styles.loadingBody, { marginTop: responsiveHeight(5) }]}
            >
              <ActivityIndicator
                size="large"
                color="maroon"
                style={{ alignSelf: "center" }}
              />
            </View>
          ) : null}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fdb20e",
    padding: responsiveWidth(3)
  },
  basicBlock: {
    backgroundColor: "#FFF",
    paddingVertical: responsiveHeight(3),
    alignItems: "center"
  },
  loadingBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
