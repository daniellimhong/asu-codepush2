import React, { PureComponent } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { Divider } from "react-native-elements";
import { Dropdown } from "../Helpers/LibDropdown";
import { Header } from "../Helpers/SimpleSectionHeader";
import { CancelRoomModal } from "../Helpers/CancelRoomModal";
import { commonStyles } from "../Helpers/CommonStyles";
// import { getBookings } from "./utility";
import moment from "moment";

export class MyReservations extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      libInfo: {}
    }

  }

  static defaultProps = {
    myReservations: []
  };

  selectText = (r) => {

    if ( r == 0 ) {
      return (
        <View style={{ marginTop: responsiveHeight(5), fontWeight: "500", fontFamily: 'Roboto'}}>
          <Text style={styles.fadedText}>Select a library above to</Text>
          <Text style={styles.fadedText}>view and reserve available</Text>
          <Text style={styles.fadedText}>study rooms</Text>
        </View>
      );
    } else {
      return (
        <View style={{ marginTop: responsiveHeight(5), fontWeight: "500", fontFamily: 'Roboto'}}>
          <Text style={styles.fadedText}>New bookings may take a </Text>
          <Text style={styles.fadedText}>few moments to update</Text>
        </View>
      );
    }

  };

  getText = (t) => {
    if( t.toLowerCase().indexOf("room") > -1 ) {
      return t;
    } else {
      return "Room: "+t
    }
  }

  _renderList = ({ item }) => {

    var baseDate = moment(item.fromDate).format("dddd, MMM DD, YYYY");
    var toFrom =
      moment(item.fromDate).format("h:mm a") +
      " - " +
      moment(item.toDate).format("h:mm a");

    let info = {
      time: toFrom,
      date: baseDate,
      libraryName: item.libraryName,
      roomName: item.roomName,
      resId: item.booking_id
    }

    return (

      <View
        style={{
          paddingVertical: responsiveHeight(2),
          paddingHorizontal: responsiveWidth(4),
          alignItems: "center",
          borderTopColor: "#fdb20e",
          borderTopWidth: 1
        }}
      >
        <Text style={styles.dateTimeText}>{baseDate}</Text>
        <Text style={styles.dateTimeText}>{toFrom}</Text>
        <View style={{ marginTop: responsiveHeight(1) }}>
          <Text style={styles.detailsText}>
            {item.libraryName}
          </Text>
          <Text style={styles.detailsText}>{this.getText(item.roomName)}</Text>
        </View>
        <View style={{ marginTop: responsiveHeight(1) }}>
          {this.getButtonOrStatus(item,info)}
        </View>

      </View>
    );
  };

  getButtonOrStatus = (i,info) => {
    if( i.waitingForCancel ) {
      return (
        <View
          style={{
            paddingHorizontal: responsiveWidth(3),
            paddingVertical: responsiveHeight(0.5)
          }}
        >
          <Text
            style={{
              color: "#c31146",
              fontWeight: "bold",
              fontSize: responsiveFontSize(1.2),
              textAlign: "center",
              fontFamily: "Roboto"
            }}
          >
            PENDING CANCELLATION
          </Text>
        </View>
      )
    } else if ( i.waitingForConfirm ) {
      return (
        <View
          style={{
            paddingHorizontal: responsiveWidth(3),
            paddingVertical: responsiveHeight(0.5)
          }}
        >
          <Text
            style={{
              color: "#5faa3c",
              fontWeight: "bold",
              fontSize: responsiveFontSize(1.2),
              textAlign: "center",
              fontFamily: "Roboto"
            }}
          >
            PENDING CONFIRMATION
          </Text>
        </View>
      )
    } else {
      return (
        <TouchableOpacity
          onPress={() => {
            this.cancelResConfirm(i,info);
          }}
          style={{
            backgroundColor: "#d9d9d9",
            paddingHorizontal: responsiveWidth(3),
            paddingVertical: responsiveHeight(0.5),
            borderColor: "#d9d9d9",
            borderWidth: 1,
            borderRadius: 50
          }}
        >
          <Text
            style={{
              color: "#232323",
              fontWeight: "bold",
              fontSize: responsiveFontSize(1.2),
              textAlign: "center",
              fontFamily: "Roboto"
            }}
          >
            CANCEL RESERVATION
          </Text>
        </TouchableOpacity>
      )
    }
  }

  cancelResConfirm = (i,info) => {
    this.setState({
      showModal: true,
      resId: info.resId,
      backupInfo: {
        fromDate: i.fromDate,
        toDate: i.toDate,
        libraryName: info.libraryName,
        roomName: info.roomName
      },
      bookId: i.bookId,
      libInfo: {
        roomName: info.roomName,
        libraryName: info.libraryName,
        date: info.date,
        time: info.time
      }
    });
  };

  showEmptyListView = () => {

    if( this.props.roomError ) {
      return (
        <View style={styles.baseItem}>
          <Text style={[styles.centerText, styles.smallHeader]}>
            There was an issue loading
          </Text>
          <Text style={[styles.centerText, styles.smallHeader]}>
            your rooms.
          </Text>
        </View>
      );
    } else if ( this.props.loading ){
      return (
        <View style={styles.baseItem}>
          <Text style={[styles.centerText, styles.smallHeader]}>
            <Text>Loading rooms</Text>
          </Text>
        </View>
      );
    }else {
      return (
        <View style={styles.baseItem}>
          <Text style={[styles.centerText, styles.smallHeader]}>
            <Text>You currently </Text>
            <Text style={{ fontWeight: "bold", fontFamily: "Roboto" }}>have no </Text>
            <Text>rooms reserved.</Text>
          </Text>
        </View>
      );
    }

  };

  shouldShowList = () => {

    return (
      <FlatList
        data={this.props.reservations}
        extraData={this.state}
        renderItem={this._renderList}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={this.showEmptyListView()}
      />
    );
  };

  render() {
    return (
      <View>
        <View style={commonStyles.shadowBox}>
          <Header
            largeText={"Study Room Reservations"}
            smallText={"Your Active"}
            backgroundColor={"#fdb20e"}
          />
          <View style={styles.listCont}>{this.shouldShowList()}</View>
        </View>
        {this.selectText(this.props.reservations.length)}
        <CancelRoomModal
          fullInfo={this.state.backupInfo}
          showModal={this.state.showModal}
          bookId={this.state.bookId}
          closeModal={this.closeModal.bind(this)}
          libInfo={this.state.libInfo}
          resId={this.state.resId} />
      </View>
    );
  }

  closeModal = (b) => {
    this.setState({
      showModal: false,
      bookId: null,
      backupInfo: null,
      libInfo: {}
    });
    if( b ) {
      // console.log("SHOULD REFRESH VIEW");
      this.props.reloadRooms();
    }
  };

}

const styles = StyleSheet.create({
  fadedText: {
    color: "#a8a8a8",
    fontSize: responsiveFontSize(1.8),
    textAlign: "center"
  },
  baseItem: {
    backgroundColor: "#FFF",
    padding: responsiveHeight(1)
  },
  listCont: {
    backgroundColor: "#FFF"
  },
  centerText: {
    textAlign: "center"
  },
  dateTimeText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: responsiveFontSize(1.5),
    fontFamily: "Roboto"
  },
  detailsText: {
    textAlign: "center",
    fontSize: responsiveFontSize(1.3)
  }
});
