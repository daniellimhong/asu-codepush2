import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  AccessibilityInfo,
  findNodeHandle,
  UIManager,
  Platform
} from "react-native";
import { DefaultText as Text } from "../../presentational/DefaultText.js";
import axios from "axios";
import PropTypes from "prop-types";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/FontAwesome";
import Analytics from "../../functional/analytics";
import { SingleUser } from "./SingleUser";
import { ErrorWrapper } from "../../functional/error/ErrorWrapper";
import { SettingsContext } from "../Settings/Settings";
import { Auth } from "../../../services";
import _ from "lodash";

class SearchContent extends React.PureComponent {
  static defaultProps = {
    settings: {}
  };

  componentDidMount() {
    let currentNavigation = _.get(
      this.props,
      "screenProps.navigation.state.routeName"
    );
    if (currentNavigation) {
      currentNavigation += "_";
    }
  }

  render() {
    console.log("within friends search render");
    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        <DirectorySearch
          screenProps={{
            navigation: this.props.navigation,
            invoker:
              this.props.settings && this.props.settings.user
                ? this.props.settings.user
                : "guest"
          }}
        />
      </View>
    );
  }
}

/**
 * All requests that people have sent to you
 */
class DirectorySearch extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      data: [],
      pages: 0,
      currentPage: 0,
      ownerStudentStatus: false
    };
    this.startFrom = 0;
    this.numFound = 0;
    this.oldName = null;
    this.search = this.search.bind(this);
  }

  /**
   * Get the directory information of the user
   */
  getInfo() {
    if (this.state.name != this.oldName) {
      this.oldName = this.state.name;
      this.startFrom = 0;
      this.state.currentPage = 0;
    }

    let url =
      "https://d1l9bvmny3kjj.cloudfront.net/?q=" +
      this.state.name +
      "&wt=json&rows=10&start=" +
      this.startFrom +
      "&qf=displayName";

    return axios
      .get(url)
      .then(response => {
        return Promise.resolve(response);
      })
      .catch(err => {
        console.log(err);
      });
  }

  next(forward) {
    if (forward && this.startFrom + 10 < this.numFound) {
      this.startFrom = this.startFrom + 10;
      this.state.currentPage = this.state.currentPage + 1;
    } else if (!forward && this.startFrom >= 10) {
      this.startFrom = this.startFrom - 10;
      this.state.currentPage = this.state.currentPage - 1;
    }
  }

  componentDidMount() {
    Auth()
      .getSession()
      .then(tokens => {
        this.setState({
          ownerStudentStatus: tokens.roleList.indexOf("student") > -1
        });
      });
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log("within shouldComponentUpdate");
    if (
      objectsAreSame(nextState.data, this.state.data) &&
      this.state.loading == nextState.loading
    ) {
      return false;
    }
    return true;
  }

  search() {
    console.log("within search");
    this.getInfo(this.state.name)
      .then(response => {
        let data = response.data.response;
        this.numFound = data.numFound;
        if (this.numFound == 0) {
          this.context.SetToast("No results found");
          this.setState(
            {
              loading: false,
              data: [],
              pages: 0
            },
            () => {
              data.docs.length > 0;
            }
          );
        }
        this.setState(
          {
            loading: false,
            data: data.docs,
            pages: Math.ceil(this.numFound / 10)
          },
          () => {
            data.docs.length > 0;
          }
        );
      })
      .catch(err => {
        this.setState({
          loading: false
        });
        console.log(err);
      });
  }

  render() {
    let currentNavigation = _.get(
      this.props,
      "screenProps.navigation.state.routeName"
    );
    if (currentNavigation) {
      currentNavigation += "_";
    }
    return (
      <ScrollView style={styles.container}>
        <Analytics ref="analytics" />
        <View
          style={{
            margin: responsiveWidth(5),
            paddingHorizontal: responsiveWidth(2),
            borderRadius: responsiveWidth(2),
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#969696"
          }}
        >
          <TouchableOpacity
            onPress={() => {
              this.refs.analytics.sendData({
                "action-type": "click",
                "target": "Search",
                "starting-screen": "asu-directory",
                "starting-section": null, 
                "resulting-screen": "asu-directory", 
                "resulting-section": null
              });
              this.startFrom = 0;
              this.setState({
                loading: true,
                data: [],
                pages: 0,
                currentPage: 0
              });
              this.search();
            }}
            accessibilityLabel="Search"
            accessibilityRole="button"
          >
            <Icon
              name="search"
              size={responsiveFontSize(3)}
              color="#969696"
              style={{ marginRight: responsiveWidth(2) }}
              ref={ref => (this.searchButtonRef = ref)}
            />
          </TouchableOpacity>
          <TextInput
            style={{
              height: responsiveHeight(8),
              flex: 2,
              borderColor: "#969696",
              fontSize: responsiveFontSize(2.5)
            }}
            underlineColorAndroid="rgba(0,0,0,0)"
            placeholder="Search"
            placeholderTextColor="#969696"
            onChangeText={t => this.setState({ name: t })}
            onSubmitEditing={this.search}
            accessibilityRole="search"
          />
        </View>
        {this.state.loading ? (
          <View>
            <ActivityIndicator size={"large"} animating={true} color="maroon" />
          </View>
        ) : null}
        {this.state.data.map((user, index) => {
          if (index === 0) {
            return (
              <SingleUser
                key={currentNavigation + "DirectorySearch" + user.asuriteId}
                navigation={this.props.screenProps.navigation}
                invoker={this.props.screenProps.invoker}
                asurite={user.asuriteId}
                repaint={this.search}
                ownerStudentStatus={this.state.ownerStudentStatus}
                ref={ref => (this.searchRef = ref)}
                previousScreen={"asu-directory"}
                previousSection={"search-friend"}
              />
            );
          }
          return (
            <SingleUser
              key={currentNavigation + "DirectorySearch" + user.asuriteId}
              navigation={this.props.screenProps.navigation}
              invoker={this.props.screenProps.invoker}
              asurite={user.asuriteId}
              repaint={this.search}
              ownerStudentStatus={this.state.ownerStudentStatus}
              previousScreen={"asu-directory"}
              previousSection={"search-friend"}
            />
          );
        })}

        {this.state.data.length > 0 && (
          <View
            style={{
              padding: 15,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <TouchableOpacity
              onPress={() => {
                this.refs.analytics.sendData({
                  "action-type": "click",
                  "target": "Previous",
                  "starting-screen": "asu-directory",
                  "starting-section": null, 
                  "resulting-screen": "asu-directory", 
                  "resulting-section": null
                });
                this.next(false);
                this.search();
              }}
            >
              <Text
                style={{
                  color: this.state.currentPage == 0 ? "white" : "black"
                }}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <Text style={{ marginHorizontal: 10 }}>
              {this.state.currentPage + 1}/{this.state.pages}
            </Text>

            <TouchableOpacity
              onPress={() => {
                this.refs.analytics.sendData({
                  "action-type": "click",
                  "target": "Next",
                  "starting-screen": "asu-directory",
                  "starting-section": "search-list", 
                  "resulting-screen": "asu-directory", 
                  "resulting-section": "search-list"
                });
                this.next(true);
                this.search();
              }}
            >
              <Text
                style={{
                  color:
                    this.state.currentPage == this.state.pages - 1
                      ? "white"
                      : "black"
                }}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  }
}

export default class Search extends React.PureComponent {
  render() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <ErrorWrapper>
            <SearchContent settings={settings} {...this.props} />
          </ErrorWrapper>
        )}
      </SettingsContext.Consumer>
    );
  }
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  }
});

DirectorySearch.contextTypes = {
  SetToast: PropTypes.func
};

function objectsAreSame(x, y) {
  var objectsAreSame = true;

  if ((x.length == 0 && y.length > 0) || (x.length > 0 && y.length == 0)) {
    objectsAreSame = false;
  }

  for (var propertyName in x) {
    if (x[propertyName] !== y[propertyName]) {
      objectsAreSame = false;
      break;
    }
  }
  return objectsAreSame;
}
