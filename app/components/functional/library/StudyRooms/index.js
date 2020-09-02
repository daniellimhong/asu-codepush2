import React, { PureComponent } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  ActivityIndicator
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import moment from "moment";

import { Dropdown } from "../Helpers/LibDropdown";
import NonReservables from "./NonReservables";
import { MyReservations } from "./MyReservations";
import ReserveRoom from "./ReserveRoom";
import TransitionView from "../../../universal/TransitionView";
import { libApi, cachedRooms, verifyWithAsync } from "./utility";
import { commonStyles } from "../Helpers/CommonStyles";

const backgroundImage = require("../../assets/library/header-study-room.png");

export default class StudyRooms extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      myReservations: [],
      showView: "myRooms",
      roomError: false,
      studyRooms: [{ name: "My Rooms", id: "myRooms" }],
      loading: false,
      roomsLoading: true,
      selectedForm: null,
      roomInfo: {},
      displayNonReservables: false
    };
  }

  componentDidMount() {
    this.getMyRooms();
    this.initRooms();
  }

  reloadRooms = () => {
    cachedRooms()
      .then(resp => {
        this.getMyRooms(resp);
      })
      .catch(err => {
        console.log("reloadRooms error: ", err);
        this.getMyRooms(null);
      });
  };

  getMyRooms = () => {
    this.setState({
      roomsLoading: true
    });

    const payload = {
      operation: "getMyRooms",
      baseDate: moment().format("YYYY-MM-DD")
    };

    libApi(payload)
      .then(resp => {
        verifyWithAsync(resp).then(fullRooms => {
          this.setState({
            myReservations: fullRooms,
            roomsLoading: false
          });
        });
      })
      .catch(err => {
        console.log("error loading rooms", err);
        this.setState({
          roomError: true,
          roomsLoading: false
        });
      });
  };

  initRooms = () => {
    const payload = {
      operation: "getStudyRooms"
    };

    libApi(payload).then(resp => {
      let mainRoomOptions = [{ name: "My Rooms", lid: "myRooms" }];
      mainRoomOptions = mainRoomOptions.concat(resp);
      const nonReservableOptions = [
        { name: "Fletcher Library (West)", lid: "fletcher" },
        { name: "Hayden Library", lid: "hayden" },
        { name: "Music Library", lid: "music" },
        { name: "Polytechnic Campus Library", lid: "poly" }
      ];
      const roomOptions = mainRoomOptions.concat(nonReservableOptions);
      this.setState({
        studyRooms: roomOptions
      });
    });
  };

  toggleView = i => {
    this.setState({
      displayNonReservables: false,
      showView: i.lid,
      roomInfo: i
    });
    if (i.lid === "myRooms") {
      this.setState({ displayNonReservables: false });
      this.getMyRooms();
    } else if (
      i.lid === "fletcher" ||
      i.lid === "hayden" ||
      i.lid === "music" ||
      i.lid === "poly"
    ) {
      this.setState({ displayNonReservables: true, roomInfo: i });
    }
  };

  showWhatInfo = () => {
    const {
      showView,
      myReservations,
      roomsLoading,
      roomInfo,
      selectedForm,
      roomError,
      displayNonReservables
    } = this.state;
    if (showView === "myRooms") {
      return (
        <MyReservations
          reservations={myReservations}
          loading={roomsLoading}
          reloadRooms={this.reloadRooms}
        />
      );
    } else if (displayNonReservables) {
      return <NonReservables roomInfo={roomInfo} />;
    } else {
      return (
        <ReserveRoom
          roomInfo={roomInfo}
          selectedForm={selectedForm}
          roomError={roomError}
        />
      );
    }
  };

  render() {
    const { roomsLoading, loading, studyRooms } = this.state;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: "#ececec" }}>
        <View style={{ flex: 1 }}>
          <View style={styles.imgHeader}>
            <ImageBackground
              style={commonStyles.imageBgContainer}
              source={backgroundImage}
            >
              <View style={commonStyles.scrim} />
              <View style={{ flex: 2 }} />
              <Text style={styles.headerText}>Study Rooms</Text>
            </ImageBackground>
          </View>

          {roomsLoading || loading ? (
            <View
              style={[styles.loadingBody, { marginTop: responsiveHeight(20) }]}
            >
              <ActivityIndicator
                size="large"
                color="maroon"
                style={{ alignSelf: "center" }}
              />
            </View>
          ) : (
            <TransitionView>
              <View style={{ flex: 1 }}>
                <View style={styles.dropdown}>
                  <Dropdown
                    dropOptions={studyRooms}
                    defaultText={studyRooms[0].name}
                    onPress={this.toggleView}
                  />
                </View>
                <View style={styles.body}>{this.showWhatInfo()}</View>
              </View>
            </TransitionView>
          )}
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "grey",
    padding: responsiveWidth(2.5),
    height: responsiveHeight(17)
  },
  headerText: {
    flex: 1,
    alignSelf: "flex-start",
    color: "white",
    fontSize: responsiveFontSize(3),
    fontWeight: "bold",
    marginLeft: responsiveWidth(5),
    fontFamily: "Roboto"
  },
  body: {
    flex: 1,
    margin: responsiveWidth(3)
  },
  section: {
    backgroundColor: "#ffffff",
    padding: responsiveWidth(2.5),
    marginVertical: responsiveHeight(1),
    borderRadius: 2
  },
  sectionText: {
    color: "#222222",
    fontWeight: "bold",
    fontSize: responsiveFontSize(2),
    marginBottom: responsiveHeight(1),
    fontFamily: "Roboto"
  },
  openRoom: {
    paddingVertical: responsiveHeight(1),
    flexDirection: "row"
  },
  modal: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#2A2B31",
    backgroundColor: "white",
    padding: responsiveWidth(2),
    width: responsiveWidth(85)
  },
  imgHeader: {
    backgroundColor: "grey",
    height: responsiveHeight(17)
  },
  loadingBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  currentReservations: {
    backgroundColor: "#00A0E2",
    padding: responsiveWidth(2.5),
    marginVertical: responsiveHeight(1),
    borderRadius: 2
  }
});
