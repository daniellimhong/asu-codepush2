import React from "react";
import {
  View,
  Image,
  Animated,
  Easing,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  SectionList,
  findNodeHandle,
  RefreshControl
} from "react-native";
// import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PropTypes from "prop-types";
// import FontAwesome from "react-native-vector-icons/FontAwesome";
// import Icon from "react-native-vector-icons/MaterialIcons";
import RCTUIManager from "NativeModules";
import { CoreFeature } from "./CoreFeature";
import { WLHOC } from "../../functional/authentication/auth_components/weblogin/index";
// import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import Analytics from "./../../functional/analytics";
import { tracker } from "../google-analytics.js";
import ASUIcon from "../../../themes/ASUIcon";
import {
  AcademicScheduleQuery,
  GetNewsQuery,
  GetEventsQuery,
  AllEventFlatQuery
} from "../../../Queries";
import { refreshAppTargets } from "./utility";
// import { iSearchHandler } from "../../../Queries";

/**
 * Utility function that will allow us to set usable ref's on
 * Section headers for proper animation after compiling the app.
 */
function makeid() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

/**
 * Component used to render all sections on the Home Screen.
 */
export class CFList extends React.PureComponent {
  // export class CFListX extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      formatted: [],
      shrinkAnim: new Animated.Value(20),
      refreshing: false,
      location: {
        latitude: "33.4242444",
        longitude: "-111.9302467"
      },
      locationLoaded: false,
      count: 0
    };
  }

  static defaultProps = {
    asurite: "",
    config: [],
    homeOrder: [],
    isearch: {}
  };

  childrenToAnimate = {};

  /**
   * Allows us to keep track of the Section Headers that need to be animated.
   *
   * We set the ScrollY when scrolling for each of these items and then the
   * native animation takes over.
   */
  childrenForAnimate = (key, value) => {
    this.childrenToAnimate[key] = value;
  };

  /**
   * Will call any registered items' callback functions.
   *
   * In this case we set ScrollY to enable animations
   */
  animateChildren() {
    const children = Object.keys(this.childrenToAnimate);
    children.forEach(child => {
      this.childrenToAnimate[child]();
    });
  }

  WLsettings = () => {
    return WLHOC(this.settings);
  };

  settings = () => {
    const { navigate } = this.props.navigation;
    return (
      <TouchableOpacity
        onPress={() => {
          tracker.trackEvent("Click", "SectionHeader_settings");
          navigate("HomeSettings",{
            previousScreen:"Home",
            previousSection:"settings"
          });
        }}
        accessible
        accessibilityLabel="Preferences"
        accessibilityRole="button"
      >
        <View
          style={{
            margin: 10
          }}
        >
          <ASUIcon
            accessible={false}
            name="settings"
            size={responsiveFontSize(2)}
            color="black"
          />
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const thiser = this;

    /**
     * Conditionally render the settings page. We would like to hide it when unauthed
     */
    const HOCSettings = this.WLsettings();

    if (!Array.isArray(this.props.homeOrder) || !this.props.homeOrder.length) {
      return null;
    } else {
      return (
        <Animated.View style={styles.container}>
          <Analytics ref="analytics" />
          <SectionList
            scrollEventThrottle={16}
            stickySectionHeadersEnabled
            onScroll={() => {
              this.animateChildren();
            }}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={async () => {
                  try {
                    this.setState({
                      refreshing: true
                    });
                    refreshAppTargets(this.context, {
                      queries: [
                        {
                          query: AcademicScheduleQuery
                        },
                        {
                          query: AllEventFlatQuery
                        },
                        {
                          query: GetNewsQuery,
                          variables: {
                            page: 0
                          }
                        },
                        {
                          query: GetEventsQuery,
                          variables: {
                            page: 0
                          }
                        }
                      ]
                    })
                      .then(resp => {
                        this.setState({
                          refreshing: false
                        });
                      })
                      .catch(e => {
                        console.log(e);
                        this.setState({
                          refreshing: false
                        });
                      });
                  } catch (e) {
                    console.log(e);
                    this.setState({
                      refreshing: false
                    });
                  }
                }}
              />
            }
            renderItem={item => {
              const Comp = item.item.component;
              return (
                <CoreFeature
                  {...item.item.props}
                  navigation={thiser.props.navigation}
                >
                  <Comp
                    key={item.item.component.name}
                    limit={3}
                    isHome={true}
                    navigation={this.props.navigation}
                    asurite={this.props.asurite}
                    iSearchData={this.props.isearch}
                    navigationOverride={
                      item.section.title == "News"
                        ? "NewsOrRecommend"
                        : "EventsOrRecommend"
                    }
                    previousScreen={"Home"}
                    previousSection={item.section.title}
                    roles={
                      item.section.title == "News" ||
                      item.section.title == "Events"
                        ? null
                        : this.props.roles
                    }
                  />
                </CoreFeature>
              );
            }}
            renderSectionHeader={({ section }, index) => {
              const newid = `Header${section.title}`;
              if (section.data[0].header) {
                const Head = section.data[0].header;
                return (
                  <Head key={newid} navigation={thiser.props.navigation} />
                );
              } else {
                return (
                  <CFSectionHeader
                    key={newid}
                    someRef={`${newid}1`}
                    image={section.data[0].props.image}
                    section={section}
                    settingsLink={HOCSettings}
                    navigation={this.props.navigation}
                    callback={this.childrenForAnimate}
                  />
                );
              }
            }}
            sections={this.props.homeOrder}
            keyExtractor={(item, index) => {
              return `${item.title}Extractor`;
            }}
          />
        </Animated.View>
      );
    }
  }
}

CFList.contextTypes = {
  getTokens: PropTypes.func,
  client: PropTypes.object,
  AppSyncClients: PropTypes.object
};

class CFSectionHeader extends React.PureComponent {
  state = {
    big: true,
    scrollY: new Animated.Value(responsiveHeight(20))
  };

  sectionHeight = responsiveHeight(10);

  _animatedText = new Animated.Value(responsiveFontSize(3.8));

  _animatedValue = new Animated.Value(0);

  componentDidMount() {
    if (this.props.callback) {
      this.props.callback(this.props.someRef, this.getHeight);
    }
  }

  getHeight = () => {
    const view = this.refs[this.props.someRef];
    const handle = findNodeHandle(view);
    if (handle) {
      RCTUIManager.UIManager.measure(
        handle,
        (x, y, width, height, pageX, pageY) => {
          if (pageY < height) {
            if (this.state.big) {
              this.setState(
                {
                  big: false
                },
                () => {
                  this.animateUp();
                }
              );
            }
          } else if (!this.state.big) {
            this.setState(
              {
                big: true
              },
              () => {
                this.animateDown();
              }
            );
          }
        }
      );
    }
  };

  // navigateToSection = section => {
  //   const { navigate } = this.props.navigation;
  //   navigate(section);
  // };

  animateUp = () => {
    Animated.parallel([
      Animated.timing(this._animatedText, {
        toValue: responsiveFontSize(3),
        easing: Easing.in,
        duration: 300
      }),
      Animated.timing(this._animatedValue, {
        toValue: 1,
        easing: Easing.in,
        duration: 300
      })
    ]).start();
  };

  animateDown = () => {
    Animated.parallel([
      Animated.timing(this._animatedText, {
        toValue: responsiveFontSize(3.8),
        easing: Easing.in,
        duration: 300
      }),
      Animated.timing(this._animatedValue, {
        toValue: 0,
        easing: Easing.in,
        duration: 300
      })
    ]).start();
  };

  render() {
    if (this.props.someRef) {
      const HOCSettings = this.props.settingsLink;
      return (
        <View>
          <Animated.View
            style={{
              position: "absolute",
              backgroundColor: "white",
              opacity: this._animatedValue,
              bottom: 0,
              height: this.sectionHeight * 0.1,
              width: "100%",
              // elevation: 9,
              shadowOffset: {
                width: 0,
                height: 4
              },
              shadowColor: "black",
              shadowOpacity: 0.6,
              shadowRadius: 6
            }}
          />
          <Animated.View
            style={{
              backgroundColor: "white",
              // opacity: 0.1,
              elevation: 5,
              shadowOffset: {
                width: 0,
                height: 4
              },
              shadowColor: "grey",
              shadowOpacity: 0.3,
              shadowRadius: 2
            }}
            ref={this.props.someRef}
          >
            <View
              style={{
                height: responsiveHeight(10),
                backgroundColor: "white",
                justifyContent: "center"
              }}
            >
              <Animated.View
                style={{
                  paddingHorizontal: 20,
                  flexDirection: "row",
                  alignItems: "center"
                }}
              >
                <View
                  style={{
                    alignItems: "flex-start",
                    flex: 1
                  }}
                >
                  <TouchableWithoutFeedback
                    onPress={() =>{
                        this.props.navigation.navigate(this.props.section.title,{
                          previousScreen: "home",
                          previousSection: this.props.section.title
                        })
                        this.refs.analytics.sendData({
                          eventtime: new Date().getTime(),
                          "action-type": "click",
                          "starting-screen": "home",
                          "starting-section": this.props.section.title,
                          target: this.props.section.title,
                          "resulting-screen": this.props.section.title,
                          "resulting-section": null
                        });
                      }
                    }
                  >
                    <Animated.Text
                      style={{
                        color: "black",
                        fontSize: this._animatedText,
                        fontWeight: "700",
                        fontFamily: 'Roboto',
                      }}
                      accessibilityLabel={`${this.props.section.title}`}
                      accessibilityRole="header"
                    >
                      {this.props.section.title}
                    </Animated.Text>
                  </TouchableWithoutFeedback>
                </View>
                <View
                  accessible={false}
                  style={{
                    justifyContent: "flex-end"
                  }}
                >
                  <Analytics ref="analytics" />
                  <HOCSettings navigation={this.props.navigation} />
                </View>
              </Animated.View>
            </View>
          </Animated.View>
        </View>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0,0,0,0)",
    flex: 1
  }
});
