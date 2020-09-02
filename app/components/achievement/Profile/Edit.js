import React from "react";
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Text,
  Image,
  Linking,
  TextInput
} from "react-native";
import { Keyboard } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Analytics from "../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { ProfileSection } from "../Profile/Profile";
import { Images } from "../Images";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ProfileTag } from "../Tags";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { HeaderQuick } from "../Header/HeaderQuick";
import { Icon } from "react-native-elements";
var { width, height } = Dimensions.get("window");
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { updateUserProfile } from "./gql/Mutations";
import { Api, Auth } from "../../../services";
/**
 * Render a list of Friends.
 *
 * Friends list is passed via props.
 */
export class EditBlock extends React.PureComponent {
  static navigationOptions = ({ navigation, screenProps }) => ({
    header: null
  });
  constructor(props) {
    super(props);
    this.acceptButtonPress = this.acceptButtonPress.bind(this);
    this.acceptSaveInfo = this.acceptSaveInfo.bind(this);
    this.state = {
      saving: false,
      saveInfo: null,
      type: props.navigation.state.params.type,
      time: 0,
      details: props.navigation.state.params.details,
      asurite: props.navigation.state.params.asurite,
      roles: props.navigation.state.params.roles
    };
  }
  static defaultProps = {
    asurite: "",
    details: [],
    title: "",
    type: "",
    asurite: null,
    isearch: () => null,
    showHead: false,
    subscribeToNewFriends: () => null
  };
  acceptButtonPress(i) {
    Keyboard.dismiss();
    if (i === "cancel") {
      this.props.navigation.goBack();
    } else if (i === "save") {
      this.setState({
        saving: true
      });
      this.saveInfo(this.state.details);
    }
  }
  acceptSaveInfo(i) {
    // console.log("Inside here save info", i);
    this.setState({
      details: i,
      time: this.state.time + 1
    });
  }
  render() {
    var s = this.props.navigation.state.params;
    var data = s.details;
    var title = s.type == "bio" ? "Biography" : "Connections";
    return (
      <View style={styles.container}>
        <Analytics ref="analytics" />
        <HeaderQuick
          navigation={this.props.navigation}
          title={title}
          theme="dark"
        />
        <ScrollView style={[styles.mainCon]}>
          <View style={[styles.title]}>
            <Text style={[styles.titleTxt]}>Add {title}</Text>
          </View>
          {this.renderForm(s.type)}
        </ScrollView>
        <SaveButtons sendButtonPress={this.acceptButtonPress} />
      </View>
    );
  }
  renderForm(t) {
    switch (t) {
      case "bio":
        return (
          <BioEdit
            details={this.state.details}
            time={this.state.time}
            sendSaveInfo={this.acceptSaveInfo}
          />
        );
        break;
      case "connections":
        return (
          <ConnEdit
            details={this.state.details}
            time={this.state.time}
            sendSaveInfo={this.acceptSaveInfo}
          />
        );
        break;
    }
  }
  saveInfo(d) {
    var payload = {
      operation: "saveInfo",
      type: this.state.type,
      details: d
    };
    let toSend = [];
    for (var i = 0; i < d.length; ++i) {
      var temp = {};
      for (var key in d[i]) {
        if (key !== "__typename") {
          temp[key] = d[i][key];
        }
      }
      toSend.push(temp);
    }
    var extraInfo = {
      asurite: this.state.asurite,
      roles: this.state.roles
    };
    // console.log("SAVVVINH",toSend,extraInfo);
    this.props
      .updateUserProfile("saveInfo", this.state.type, toSend, extraInfo)
      .then(resp => {
        this.props.navigation.goBack();
      });
  }
}
export class BioEdit extends React.PureComponent {
  constructor(props) {
    super(props);
    let dets =
      props.details && props.details[0] && props.details[0].bio
        ? props.details
        : [{ bio: null }];
    this.state = {
      text: props.text,
      details: dets,
      time: 0
    };
  }
  static defaultProps = {
    details: [],
    title: null,
    showHead: false
  };
  alterText(text) {
    // console.log("Text: ", text);
    this.setState({
      details: [
        {
          bio: text
        }
      ]
    });
    this.props.sendSaveInfo([
      {
        bio: text
      }
    ]);
  }
  render() {
    return (
      <View style={{ marginTop: responsiveHeight(2) }}>
        <TextInput
          style={[styles.input, styles.topText]}
          multiline={true}
          numberOfLines={8}
          placeholder="Enter a bio"
          placeHolderTextColor="gray"
          onChangeText={text => this.alterText(text)}
          value={this.state.details[0].bio}
        />
      </View>
    );
  }
}
export class ConnEdit extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      details: props.details,
      time: 0
    };
    this.acceptToggle = this.acceptToggle.bind(this);
  }
  static defaultProps = {
    details: [],
    showHead: false,
    time: 0,
    subscribeToNewFriends: () => null
  };
  acceptToggle(index, item) {
    var d = this.props.details;
    if (d[index]) {
      d[index].toggled = item;
      this.props.sendSaveInfo(d);
    }
  }
  validateLink(text, index) {
    var d = this.props.details;
    if (d[index]) {
      d[index].url = text;
      this.props.sendSaveInfo(d);
    }
  }
  render() {
    var data = this.props.details;
    // console.log("Starting", this.props);
    return (
      <View>
        {data.map((item, index) => {
          if (!item.toggled) item.toggled = false;
          if (item.url && item.url.indexOf(item.linkBeg) > -1) {
            item.url = item.url.slice(item.linkBeg.length);
          }
          return (
            <View key={item.connectionId + "-" + index}>
              <View
                style={{
                  flexDirection: "row",
                  paddingTop: responsiveHeight(2)
                }}
              >
                <Toggle
                  toggled={item.toggled}
                  togId={index}
                  sendToggle={this.acceptToggle}
                />
                <Text style={[styles.toggleText]}>{item.text}</Text>
              </View>
              {item.toggled ? (
                <View style={{ flexDirection: "row" }}>
                  <Text style={[styles.textUrl]}>{item.linkBeg.slice(8)}</Text>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="my-url"
                    placeHolderTextColor="gray"
                    onChangeText={text => this.validateLink(text, index)}
                    value={item.url}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    );
  }
}
export class Toggle extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      toggled: props.toggled
    };
  }
  static defaultProps = {
    toggled: false,
    title: null,
    showHead: false,
    subscribeToNewFriends: () => null
  };
  render() {
    var color = this.props.toggled ? "#ffc424" : "#b7b7b7";
    var rotation = this.props.toggled ? "0deg" : "180deg";
    return (
      <TouchableWithoutFeedback
        style={[styles.toggleCont]}
        onPress={() => {
          this.toggleButton(this.props.toggled);
        }}
      >
        <FontAwesome
          name="toggle-on"
          style={{ transform: [{ rotate: rotation }] }}
          color={color}
          size={30}
        />
      </TouchableWithoutFeedback>
    );
  }
  toggleButton(t) {
    // console.log("Will send", this.props.togId, !t);
    this.props.sendToggle(this.props.togId, !t);
  }
}
export class SaveButtons extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  static defaultProps = {
    toggled: false,
    title: null,
    showHead: false,
    subscribeToNewFriends: () => null
  };
  render() {
    return (
      <View style={{ justifyContent: "flex-end", flexDirection: "row" }}>
        <View style={[styles.saveButtons, styles.leftButton]}>
          <TouchableOpacity
            onPress={() => {
              this.clickedButton("cancel");
            }}
          >
            <Text style={[styles.buttonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.saveButtons, styles.rightButton]}>
          <TouchableOpacity
            onPress={() => {
              this.clickedButton("save");
            }}
          >
            <Text style={[styles.buttonText]}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  clickedButton(t) {
    this.props.sendButtonPress(t);
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  title: {
    borderBottomWidth: 1,
    borderBottomColor: "#b7b7b7"
  },
  titleTxt: {
    fontSize: responsiveFontSize(3),
    paddingVertical: responsiveHeight(1.2),
    fontFamily: "Roboto-Light",
    color: "black"
  },
  lineItem: {
    borderBottomWidth: 1,
    // borderBottomColor: "#adadad",
    marginHorizontal: responsiveWidth(3),
    justifyContent: "center",
    paddingVertical: responsiveHeight(2.2)
  },
  label: {
    fontSize: responsiveFontSize(1.9),
    color: "black"
  },
  canvas: {
    flex: 1,
    alignItems: "flex-start",
    width: responsiveWidth(4.4),
    height: responsiveWidth(4.4)
  },
  itemContBase: {
    backgroundColor: "white",
    shadowColor: "#777",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5
  },
  mainCon: {
    margin: responsiveWidth(2.5),
    paddingHorizontal: responsiveWidth(5),
    flex: 1
  },
  itemContMain: {
    marginHorizontal: responsiveWidth(2.5),
    paddingHorizontal: responsiveWidth(5)
  },
  contWithSep: {
    marginTop: responsiveWidth(2.5),
    borderBottomWidth: 1,
    borderBottomColor: "#bcbcbc"
  },
  contWithMargin: {
    marginBottom: responsiveWidth(2.5)
  },
  tagCont: {
    flexDirection: "row",
    marginHorizontal: responsiveWidth(3),
    paddingBottom: responsiveHeight(2.5)
  },
  textBlock: {
    marginHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(2)
  },
  addIcon: {
    flex: 1,
    alignItems: "flex-end",
    marginHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(2)
  },
  input: {
    borderColor: "#b7b7b7",
    borderWidth: 1,
    borderRadius: 3,
    paddingVertical: responsiveHeight(1.2),
    paddingHorizontal: responsiveWidth(2),
    fontSize: responsiveFontSize(1.6)
  },
  textUrl: {
    paddingTop: responsiveHeight(1.5),
    paddingLeft: responsiveWidth(4),
    paddingRight: responsiveWidth(1),
    fontSize: responsiveFontSize(1.6),
    color: "black"
  },
  buttonText: {
    fontSize: responsiveFontSize(2.1),
    color: "black"
  },
  saveButtons: {
    alignItems: "center",
    paddingVertical: responsiveHeight(2),
    flex: 1,
    borderTopColor: "gray",
    borderLeftColor: "gray",
    borderTopWidth: 1,
    borderLeftWidth: 1
  },
  topText: {
    textAlignVertical: "top"
  },
  toggleText: {
    fontSize: responsiveFontSize(2.3),
    color: "black",
    marginLeft: 10
  },
  blurb: {
    color: "black",
    fontSize: responsiveFontSize(2),
    lineHeight: responsiveHeight(3.5)
  },
  overlay: {
    flex: 1,
    position: "absolute",
    left: 0,
    top: 0,
    opacity: 0.5,
    backgroundColor: "black",
    width: width
  }
});