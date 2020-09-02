import React from "react";
import {
  View,
  Image,
  Dimensions,
  Keyboard,
  Text,
  AsyncStorage,
  TextInput,
  Button,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  TouchableHighlight,
  Platform
} from "react-native";

import Swipeable from "react-native-swipeable";

import { palette } from "../../../../themes/asu";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Analytics from "./../../../functional/analytics";

import {
  Api,
  Auth,
  User,
  updateMsgData,
  getMsgData,
  setMsgData,
  getMsgDataFromLambda
} from "../../../../services";

var { height, width } = Dimensions.get("window");

export class MsgCtr extends React.Component {
  constructor(props) {
    // console.log("preops",props);
    super(props);
    this.state = {
      data: [],
      archived: false,
      config: {},
      swipeable: null,
      currentlyOpenSwipeable: null,
      toggles: [],
      activeRowKey: null
    };
  }

  componentDidMount() {
    this.setState({
      config: this.props.config
    });

    getMsgData().then(resp => {
      this.setState({ data: JSON.parse(data) });
    });
  }

  toggleArchive = () => {
    this.setState({
      showArchived: !this.state.showArchived
    });
    var buttonText = this.state.showArchived ? "See Current" : "See All";
    this.handleScroll();
  };

  archiveMsg = (data, id) => {
    var payload = {
      operation: "archiveMsg",
      pushId: data.id,
      asurite: id
    };

    var toggles = this.state.toggles;
    if (toggles[data.id] === undefined) {
      toggles[data.id] = false;
    } else {
      toggles[data.id] = !toggles[data.id];
    }

    this.setState({
      toggles: toggles
    });

    // fetch('https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/msgctr', {
    //     method: 'POST',
    //     body: JSON.stringify(payload)
    // });

    setMsgData().then(resp =>
      getMsgData().then(res => this.setState({ data: JSON.parse(res) }))
    );
    this.update(data);
    setTimeout(() => {
      this.handleScroll();
    }, 50);
  };

  update = d => {
    var temp = this.state.data.slice();
    var tempL = temp.length;
    for (var i = 0; i < tempL; ++i) {
      if (temp[i].id == d.id) {
        temp[i].seen = true;
        temp[i].archived = !temp[i].archived;
        this.setState({ data: temp });
        setMsgData(temp);
      }
    }
  };

  handleScroll = () => {
    const { currentlyOpenSwipeable } = this.state;

    if (currentlyOpenSwipeable) {
      currentlyOpenSwipeable.recenter();
    }
  };

  onOpen = (event, gestureState, swipeable) => {
    const { currentlyOpenSwipeable } = this.state;
    if (currentlyOpenSwipeable && currentlyOpenSwipeable !== swipeable) {
      currentlyOpenSwipeable.recenter();
    }

    this.setState({ currentlyOpenSwipeable: swipeable });
  };
  onClose = () => this.setState({ currentlyOpenSwipeable: null });

  render() {
    // var data = this.state.data.length > 0 ? this.state.data : this.props.data;
    var config = this.props.config;
    var buttonText = this.state.showArchived ? "See Current" : "See All";

    var data = this.state.data;

    if (data.length > 0) {
      return (
        <View style={{ flex: 1 }}>
          <Analytics ref="analytics" />
          <ScrollView>
            <View style={styles.container}>
              <FlatList
                data={data}
                extraData={this.state}
                renderItem={this._renderArchive}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          </ScrollView>
          <TouchableHighlight
            style={styles.seeAllBtn}
            underlayColor="#700023"
            onPress={() => this.toggleArchive()}
          >
            <Text style={styles.seeAllText}>{buttonText}</Text>
          </TouchableHighlight>
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Text> Loading </Text>
        </View>
      );
    }
  }

  _renderArchive = ({ item }) => {
    var iconType = "";
    var yellow = false;

    switch (item.type) {
      case "alert":
        iconType = "priority-high";
        yellow = true;
        break;
      case "event":
        iconType = "event";
        break;
      case "announcement":
        iconType = "flash-on";
        break;
      case "star":
        iconType = "grade";
        break;
      case "parking":
        iconType = "directions-car";
        break;
    }

    var archive = item.archived;
    var seen = item.seen;
    var toggles = this.state.toggles;

    var archiveButton = [
      <TouchableHighlight
        underlayColor="#0078a0"
        style={[styles.swipeBtn, styles.archiveButton]}
        onPress={() => this.archiveMsg(item, "kcoblent")}
      >
        <MaterialIcons
          name="archive"
          size={28}
          color="white"
          style={styles.archiveIcon}
        />
      </TouchableHighlight>
    ];

    var unArchiveButton = [
      <TouchableHighlight
        underlayColor={palette.blue}
        style={[styles.swipeBtn, styles.unarchiveButton]}
        onPress={() => this.archiveMsg(item, "kcoblent")}
      >
        <MaterialIcons
          name="unarchive"
          size={28}
          color="white"
          style={styles.archiveIcon}
        />
      </TouchableHighlight>
    ];

    var swipeoutBtns = [
      {
        text: "Archive",
        autoClose: true,
        onPress: () => {
          this.deleteNote(item);
        },
        rowId: this.props.index,
        onOpen: (secId, rowId, direction) => {
          this.setState({
            activeRowKey: this.props.item.id
          });
        },
        onClose: (secId, rowId, direction) => {
          this.setState({
            activeRowKey: null
          });
        }
      }
    ];

    var autoClose = true;
    var width = 150;

    if (
      (!item.archived &&
        (toggles[item.id] || toggles[item.id] === undefined)) ||
      (item.archived && this.state.showArchived)
    ) {
      return (
        <View id={item.id}>
          <Swipeable
            onRef={ref => (this.swipeable = ref)}
            key={item.id}
            rightButtons={archive ? null : archiveButton}
            leftButtons={archive ? unArchiveButton : null}
            onRightActionRelease={() => {
              this.archiveMsg(item, "kcoblent");
            }}
            onLeftActionRelease={() => this.archiveMsg(item, "kcoblent")}
            rightActionActivationDistance={250}
            leftActionActivationDistance={250}
            onLeftButtonsOpenRelease={(event, gestureState, swipeable) => {
              this.onOpen(event, gestureState, swipeable);
            }}
            onRightButtonsOpenRelease={(event, gestureState, swipeable) => {
              this.onOpen(event, gestureState, swipeable);
            }}
            onRightButtonsCloseRelease={() => this.onClose()}
            onLeftButtonsCloseRelease={() => this.onClose()}
          >
            <View style={[styles.notificationListItem]}>
              <View
                style={[
                  styles.seenIcon,
                  { backgroundColor: seen ? palette.white : "#8e002d" }
                ]}
              />

              <View style={{ flex: 1, marginRight: 50 }}>
                <Text style={styles.nTitle}>{item.title}</Text>
                <Text style={styles.nBody}>{item.body}</Text>
              </View>

              <View style={[styles.iconSection]}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: yellow ? "#ffbf27" : "#d3d2d3" }
                  ]}
                >
                  <MaterialIcons
                    name={iconType}
                    size={28}
                    color="white"
                    style={styles.icon}
                  />
                </View>
              </View>
            </View>
          </Swipeable>

          {TaskBorder}
        </View>
      );
    } else {
      return null;
    }
  };
}

const TaskBorder = (
  <View
    style={{
      borderBottomWidth: 1,
      borderBottomColor: "#b3b2b3"
    }}
  />
);

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    backgroundColor: "#fff"
  },
  taskContainer: {
    borderBottomColor: "#00000015",
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10
  },
  justifyCenter: {
    justifyContent: "center"
  },
  leftPadding: {
    paddingLeft: 10
  },
  taskTitle: {
    fontSize: 16
  },
  taskDate: {
    color: "#999",
    fontStyle: "italic"
  },
  taskContainer: {
    borderBottomColor: "#00000015",
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10
  },
  seeAllBtn: {
    // flex: 1,
    backgroundColor: "#8e002d",
    alignItems: "center",
    height: 75
  },
  seeAllText: {
    color: "white",
    fontSize: 20,
    marginTop: 25,
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  notificationListItem: {
    flexDirection: "row",
    flex: 1,
    // height: 100,
    // padding: 10,
    marginTop: 15,
    marginBottom: 15,
    paddingLeft: 0
  },
  iconSection: {
    width: 75,
    marginRight: 0
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 2,
    marginLeft: 15
  },
  icon: {
    height: 27,
    width: 27,
    alignItems: "center",
    marginTop: 6,
    marginLeft: 6
    // marginLeft: 25,
  },
  seenIcon: {
    height: 10,
    width: 10,
    marginLeft: 15,
    marginRight: 20,
    marginTop: 10,
    backgroundColor: "#8e002d",
    borderRadius: 50
    // marginLeft: 25,
  },
  swipeBtn: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff"
    // alignItems: 'center',
  },
  nTitle: {
    fontSize: 20,
    fontWeight: "500",
    fontFamily: 'Roboto',
    color: "black",
    paddingBottom: 5
  },
  nBody: {
    fontSize: 16,
    color: "black",
    lineHeight: 18,
    fontWeight: "200",
    fontFamily: 'Roboto',
    paddingBottom: 5
  },
  archiveButton: {
    backgroundColor: palette.blue
  },
  unarchiveButton: {
    backgroundColor: "#0078a0",
    alignItems: "flex-end",
    justifyContent: "center"
  },
  archiveIcon: {
    height: 27,
    width: 27,
    alignItems: "center",
    marginTop: 6,
    marginLeft: 25
    // marginLeft: 25,
  },
  unarchiveIcon: {
    height: 27,
    width: 27,
    marginRight: 25,
    paddingRight: 25,
    marginLeft: 100
    // marginLeft: 25,
  }
});
