import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableHighlight,
  Text
} from "react-native";

import Swipeable from "react-native-swipeable";

import { palette } from "../../../../themes/asu";

import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default class TaskItem extends Component {
  constructor(props) {
    super(props);

    var data = this.props.data ? this.props.data : ["hello world"];
    var type = this.props.type ? this.props.type : "normal";
    var archived = this.props.archived;

    // console.log("data:",data);
    // console.log("type:",type);

    this.state = {
      data: data,
      leftActionActivated: false,
      toggle: false,
      type: type,
      asurite: "kcoblent",
      showArchived: archived
    };
  }

  archiveMsg = (data, id) => {
    var payload = {
      operation: "archiveMsg",
      pushId: data.id,
      asurite: id
    };

    // fetch('https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/msgctr', {
    //     method: 'POST',
    //     body: JSON.stringify(payload)
    // })

    // var t = new TaskUpdate(data);

    this.setState({
      data: {
        id: data.id,
        title: data.title,
        body: data.body,
        seen: data.seen,
        archived: 0,
        type: data.type,
        date: data.date
      }
    });
  };

  render() {
    const { leftActionActivated, toggle, data, type } = this.state;

    const leftContent = <Text>Pull to activate</Text>;

    var title = data.title;
    var seen = data.seen;

    // console.log("data:",data);
    // console.log("type:",type);

    const leftButton = [
      <TouchableHighlight style={[styles.swipeBtn, styles.leftBtn]}>
        <Text>Button 1</Text>
      </TouchableHighlight>,
      <TouchableHighlight style={[styles.swipeBtn, styles.leftBtn]}>
        <Text>Button 2</Text>
      </TouchableHighlight>
    ];

    const rightButtons = [
      <TouchableHighlight style={[styles.swipeBtn, styles.favBtn]}>
        <Image
          style={[styles.icon, styles.favIcon]}
          source={require("../icons/favorite.png")}
        />
      </TouchableHighlight>,
      <TouchableHighlight style={[styles.swipeBtn, styles.trashBtn]}>
        <Image
          style={[styles.icon, styles.favIcon]}
          source={require("../icons/trash.png")}
        />
      </TouchableHighlight>
    ];

    const leftSwipeItemToggle = (
      <View
        style={[
          styles.leftSwipeItem,
          {
            backgroundColor: leftActionActivated
              ? palette.orange
              : palette.light_grey
          }
        ]}
      >
        {
          <Image
            style={[
              styles.icon,
              {
                tintColor: leftActionActivated ? palette.white : palette.orange
              }
            ]}
            source={require("../icons/close.png")}
          />
        }
      </View>
    );

    const leftSwipeItemUntoggle = (
      <View
        style={[
          styles.leftSwipeItem,
          {
            backgroundColor: leftActionActivated
              ? palette.green
              : palette.light_grey
          }
        ]}
      >
        {
          <Image
            style={[
              styles.icon,
              { tintColor: leftActionActivated ? palette.white : palette.green }
            ]}
            source={require("../icons/check.png")}
          />
        }
      </View>
    );

    if (type == "normal") {
      return (
        <View>
          <Swipeable
            leftActionActivationDistance={125}
            leftContent={toggle ? leftSwipeItemToggle : leftSwipeItemUntoggle}
            onLeftActionActivate={() => {
              this.setState({ leftActionActivated: true });
            }}
            onLeftActionDeactivate={() =>
              this.setState({ leftActionActivated: false })
            }
            onLeftActionComplete={() => {
              // console.log("actionComplete");
              this.setState({ toggle: !toggle });
            }}
            rightButtons={rightButtons}
          >
            <View style={[styles.listItem]}>
              <Image
                style={[
                  styles.icon,
                  { tintColor: toggle ? palette.green : palette.light_grey }
                ]}
                source={require("../icons/check.png")}
              />

              <View>
                <Text style={styles.title}>{data.title}</Text>
                <Text style={styles.date}>{data.date.start}</Text>
              </View>
            </View>
          </Swipeable>

          {TaskBorder}
        </View>
      );
    }

    if (type == "notification") {
      var iconType = "";
      var yellow = false;

      switch (data.type) {
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

      var archive = this.state.data.archived;

      var archiveButton = [
        <TouchableHighlight
          underlayColor="#0078a0"
          style={[styles.swipeBtn, styles.archiveButton]}
          onPress={() => this.archiveMsg(data, this.state.asurite)}
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
          onPress={() => this.archiveMsg(data, this.state.asurite)}
        >
          <MaterialIcons
            name="unarchive"
            size={28}
            color="white"
            style={styles.archiveIcon}
          />
        </TouchableHighlight>
      ];

      return (
        <View>
          <Swipeable rightButtons={archive ? unArchiveButton : archiveButton}>
            <View style={[styles.notificationListItem]}>
              <View
                style={[
                  styles.seenIcon,
                  { backgroundColor: seen ? palette.white : "#8e002d" }
                ]}
              />

              <View style={{ flex: 1, marginRight: 50 }}>
                <Text style={styles.nTitle}>{data.title}</Text>
                <Text style={styles.nBody}>{data.body}</Text>
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
    }
  }
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
  listItem: {
    flexDirection: "row",
    height: 75,
    // padding: 10,
    paddingLeft: 0,
    alignItems: "center"
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
  leftSwipeItem: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center"
  },
  swipeBtn: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff"
    // alignItems: 'center',
  },
  leftBtn: {
    alignItems: "flex-end",
    paddingLeft: 20
  },
  title: {
    fontSize: 15
  },
  body: {
    fontSize: 15
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
  date: {
    color: "#afafaf",
    fontSize: 12
  },
  favBtn: {
    backgroundColor: palette.blue
  },
  archiveButton: {
    backgroundColor: palette.blue
  },
  unarchiveButton: {
    backgroundColor: "#0078a0"
  },
  favIcon: {
    tintColor: "#fff"
  },
  archiveIcon: {
    height: 27,
    width: 27,
    alignItems: "center",
    marginTop: 6,
    marginLeft: 25
    // marginLeft: 25,
  },
  trashBtn: {
    backgroundColor: palette.red
  }
});
