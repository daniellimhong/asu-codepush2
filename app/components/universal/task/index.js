import React from "react";
import {
  View,
  Text,
  AsyncStorage,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableHighlight
} from "react-native";

import Swipeable from "react-native-swipeable";

import { palette } from "../../../themes/asu";

import TaskItem from "./taskitem/task-item";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { getDateFromTimestamp } from "../../../services/utility/utility.js";

export class Task extends React.Component {
  static navigationOptions = ({ navigation, screenProps }) => ({
    title: "Task"
  });
  constructor(props) {
    super(props);
    this.state = {
      //data:  this.props.navigation.state.params.data
      data: [],
      archived: false,
      config: {}
    };
  }

  async storeItem(d) {
    // console.log("IN STORE", d);
    AsyncStorage.setItem("@messageData", JSON.stringify(d))
      // .then(json => console.log("Successfully stored message details"))
      .catch(error => console.log("error storing"));
  }

  // async updateMsgData() {
  //   var value,collect;
  //   try {
  //     value = await AsyncStorage.getItem('@messageData').then(
  //       (values) => {
  //         collect= values;
  //       });
  //   } catch (error) {
  //     console.log('Error: ',error);
  //   }
  //   return collect;
  // }

  componentDidMount() {
    // console.log("component mounted");

    this.setState({
      config: this.props.config
    });
  }

  /**
   * Task render
   * @param  {Object} item    Data object from an array.
   * @return {ReactComponent} Render item with date info
   * To Do: Model task item
   */
  _renderTask = item => (
    <View style={styles.taskContainer}>
      <View
        style={{
          flexGrow: 1
        }}
      >
        <Text style={[styles.taskTitle]}>{item.title}</Text>
        <Text style={[styles.taskDate]}>
          {this._getFormattedDate(item.date.start)}
        </Text>
      </View>
    </View>
  );

  toggleArchive = () => {
    this.setState({
      showArchived: !this.state.showArchived
    });
    // this.updateMsgData();
  };

  archiveMsg = (data, id) => {
    var payload = {
      operation: "archiveMsg",
      pushId: data.id,
      asurite: id,
      uuid: DeviceInfo.getUniqueID()
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

    // console.log("inside task item notification");

    var archive = item.archived;

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
          style={styles.unarchiveIcon}
        />
      </TouchableHighlight>
    ];

    var seen = item.seen;

    if (!item.archived || (item.archived && this.state.showArchived)) {
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

  /**
   * Get formatted date data from unix timestamp
   * @param  {Integer} timestamp Unix timestamp, generally from Data.getTime()
   * @return {Object}            Formatted date data
   */
  _getFormattedDate = timestamp => {
    var dateObj = getDateFromTimestamp(timestamp);
    // console.log("dateObj:",dateObj);
    return dateObj.date_string;
  };

  render() {
    // var data = this.props.data;
    var config = this.props.config;
    var buttonText = this.state.showArchived ? "See Current" : "See All";

    var data = this.props.data;

    // data = data.length == 0 ? this.props.data : data;
    // task as a checklist
    if (config.checklist && !config.notification) {
      return (
        <ScrollView>
          <View style={styles.container}>
            <FlatList
              data={data}
              renderItem={({ item, index }) => (
                <TaskItem data={item} type={config.type} />
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </ScrollView>
      );
    } else if (config.checklist && config.notification) {
      return (
        <View style={{ flex: 1 }}>
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
      // task as an item with time data
      return (
        <ScrollView>
          <View style={styles.container}>
            <FlatList
              data={data}
              renderItem={({ item }) => this._renderTask(item)}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </ScrollView>
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
    backgroundColor: "#0078a0"
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
    alignItems: "flex-end",
    marginTop: 6,
    marginRight: 25
    // marginLeft: 25,
  }
});
