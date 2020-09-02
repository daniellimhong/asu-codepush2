import React, { PureComponent } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { AnimatedHeight } from "./AnimatedHeight";
import { ReserveRoomTimes } from "./ReserveRoomTimes";
import moment from "moment";

const defaultIconColor = "#5db8e9";
const defaultFontSize = responsiveFontSize(1.1);

export class ReserveRoomListItem extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
      atLeastOne: false,
      update: 0,
      generalTimes: []
    };
  }

  componentDidUpdate(prevProps,prevState) {
    if( prevProps.forceClose !== this.props.forceClose ) {
      this.setState({
        opened: false
      })
    }
  }

  static defaultProps = {
    item: {},
    selectedForm: null,
    refreshTimes: ()=>{}
  };

  toggle = () => {
    this.setState({
      opened: !this.state.opened
    });
  };

  getIconAndText = x => {
    let icon = (
      <MaterialCommunityIcons
        size={defaultFontSize}
        color={defaultIconColor}
        name={"information"}
      />
    );

    switch (x.toLowerCase()) {
      case "projector":
        icon = (
          <MaterialCommunityIcons
            size={defaultFontSize}
            color={defaultIconColor}
            name={"projector-screen"}
          />
        );
        break;
      case "computer":
        icon = (
          <FontAwesome
            size={defaultFontSize}
            color={defaultIconColor}
            name={"tv"}
          />
        );
        break;
      case "vcr":
        icon = (
          <MaterialCommunityIcons
            size={defaultFontSize}
            color={defaultIconColor}
            name={"television-classic"}
          />
        );
        break;
      case "adaptive desk":
        icon = (
          <MaterialCommunityIcons
            size={defaultFontSize}
            color={defaultIconColor}
            name={"desk-lamp"}
          />
        );
        break;
      case "whiteboard":
        icon = (
          <FontAwesome5
            size={defaultFontSize}
            color={defaultIconColor}
            name={"chalkboard"}
          />
        );
        break;
      case "bloomberg":
        icon = (
          <FontAwesome5
            size={defaultFontSize}
            color={defaultIconColor}
            name={"terminal"}
          />
        );
        break;
    }

    if (x.toLowerCase == "vcr") {
      x = "VCR";
    } else {
      x = x.slice(0, 1).toUpperCase() + x.slice(1, x.length);
    }

    return (
      <View
        style={{ flexDirection: "row", alignItems: "center", marginLeft: 4 }}
        key={"icon"+x+Math.floor(Math.random() * (100+ 1))}
      >
        {icon}
        <Text style={[styles.smallText, { marginLeft: 2 }]}>{x}</Text>
      </View>
    );
  };

  generateItems = d => {
    var allInfo = [];

    var len = d.length > 2 ? 2 : d.length;

    for (var i = 0; i < len; ++i) {
      if (d[i].length < 20) {
        allInfo.push(this.getIconAndText(d[i]));
      }
    }

    if (allInfo.length == 0) {
      return null;
    } else {
      return (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {allInfo}
        </View>
      );
    }
  };

  render() {
    var myHeight = 0;
    if (this.state.opened) {
      myHeight = null;
    }

    let item = this.props.item;

    return (
      <View style={{ borderTopWidth: 1, borderTopColor: "#d5d5d5" }} key={item.name+"-lItem"}>
        <View style={{ width: responsiveWidth(85), justifyContent: "center" }}>
          <TouchableOpacity
            onPress={() => {
              this.toggle();
            }}
          >
            <View
              style={{
                flexDirection: "row",
                paddingVertical: responsiveHeight(2)
              }}
            >
              <View style={{ width: responsiveWidth(75) }}>
                <Text style={{ fontWeight: "bold", fontFamily: "Roboto" }}>{item.name}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    overflow: "hidden",
                    paddingTop: responsiveHeight(1)
                  }}
                >
                  <Text
                    ellipsizeMode={"tail"}
                    numberOfLines={1}
                    style={styles.smallText}
                  >
                    <Text style={styles.bolded}>Capacity: </Text>
                    <Text>{item.capacity} </Text>
                  </Text>
                  {this.generateItems(item.description)}
                </View>
              </View>
              <View
                style={{
                  width: responsiveWidth(10),
                  justifyContent: "flex-end"
                }}
              >
                <MaterialIcons
                  name={this.state.opened ? "arrow-drop-up" : "arrow-drop-down"}
                  size={responsiveFontSize(2)}
                  color="#2A2B31"
                />
              </View>
            </View>
          </TouchableOpacity>
          <AnimatedHeight myHeight={myHeight}>
            {
              this.state.opened ?
              (
                <ReserveRoomTimes refreshTimes={this.refreshTimes.bind(this)} maxTime={item.maxTime} selectedForm={this.props.selectedForm} libHours={this.props.libHours} availability={item.availability} roomId={item.roomId} roomName={item.name} libraryName={this.props.libraryName}/>
              ) : null
            }
          </AnimatedHeight>
        </View>
      </View>
    );
  }

  refreshTimes = () => {
    this.props.refreshTimes();
  }
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
