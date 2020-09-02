import React from "react";
import {
  View,
  Image,
  Dimensions,
  Text,
  Animated,
  Easing,
  TouchableOpacity,
  StyleSheet,
  Platform,
  AccessibilityInfo,
  findNodeHandle,
  UIManager
} from "react-native";
import {
  createMaterialTopTabNavigator,
  createAppContainer
} from "react-navigation";
import SortableList from "react-native-sortable-list";
import Icon from "react-native-vector-icons/MaterialIcons";
import { graphql } from "react-apollo";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

import Analytics from "./../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { HomeInterests } from "./HomeInterests";
import { ResourcesPreferences } from "./resources/ResourcesPreferences";
import {
  UserInterestsQuery,
  InterestTopicsQuery,
  SaveInterestsMutation
} from "../../../Queries/PreferenceQueries";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { ErrorWrapper } from "../../functional/error/ErrorWrapper";
import { SettingsContext } from "../Settings/Settings";

/**
 * CFSources is used by the CFList to render sections for the home screen.
 */

const window = Dimensions.get("window");
/**
 * A preferences screen for that will allow users to customize
 * their home screen and News/Events interests
 */

export class HomeSettings extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.setAccessibilityFocus();
  }

  componentWillUnmount() {
    clearTimeout(this.focusTimeout);
  }

  setAccessibilityFocus() {
    const FOCUS_ON_VIEW = 8;
    const nodeHandle = findNodeHandle(this.focusHeading);
    this.focusTimeout = setTimeout(() => {
      Platform.OS === "ios"
        ? AccessibilityInfo.setAccessibilityFocus(nodeHandle)
        : UIManager.sendAccessibilityEvent(nodeHandle, FOCUS_ON_VIEW);
    }, 400);
  }

  routeConfigs = {
    HomeFeed: {
      screen: HomeFeedPreferences,
      navigationOptions: {
        title: "Home Feed"
      }
    },
    Resources: {
      screen: ResourcesPreferences,
      navigationOptions: {
        title: "Resources"
      }
    },
    Interests: {
      screen: HomeInterestsWithData,
      navigationOptions: {
        title: "Interests"
      }
    }
  };

  initialRouteName = () => {
    if (
      this.props.navigation.state &&
      this.props.navigation.state.params &&
      this.props.navigation.state.params.resourcesTab
    ) {
      return "Resources";
    } else {
      return "HomeFeed";
    }
  };

  tabNavigatorConfig = {
    initialRouteName: this.initialRouteName(),
    optimizationsEnabled: true,
    swipeEnabled: false,
    tabBarPosition: "top",
    tabBarOptions: {
      scrollEnabled: false,
      activeTintColor: "#FFC627",
      labelStyle: {
        fontSize: responsiveFontSize(1.6),
        fontWeight: "bold",
        fontFamily: "Roboto"
      },
      style: {
        backgroundColor: "#464646"
      }
    }
  };

  SettingsNav = createAppContainer(
    createMaterialTopTabNavigator(this.routeConfigs, this.tabNavigatorConfig)
  );

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.body}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={{ flex: 0, justifyContent: "center" }}
              onPress={() => this.props.navigation.goBack()}
              accessibilityLabel="Back"
              accessibilityRole="button"
            >
              <Icon name="navigate-before" size={40} color="white" />
            </TouchableOpacity>
          </View>
          <View
            style={{ flex: 2, justifyContent: "center", alignItems: "center" }}
            ref={focusHeading => (this.focusHeading = focusHeading)}
            accessibilityRole="header"
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
                textAlignVertical: "center",
                fontFamily: "Roboto"
              }}
              accessibilityRole="header"
            >
              Preferences
            </Text>
          </View>
          <View style={styles.mainContent}>
            <View
              style={{ flex: 1, flexDirection: "column", alignItems: "center" }}
            >
              {/* Placeholder for notifications maybe? */}
            </View>
          </View>
        </View>
        <ErrorWrapper>
          <this.SettingsNav screenProps={this.props} />
        </ErrorWrapper>
      </View>
    );
  }
}
/**
 * Row for the draggable Home Screen Feed items
 */
class Row extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.setUpStyles();
  }

  setUpStyles = () => {
    this._active = new Animated.Value(0);
    this._style = {
      ...Platform.select({
        ios: {
          transform: [
            {
              scale: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1]
              })
            }
          ],
          shadowRadius: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10]
          })
        },
        android: {
          transform: [
            {
              scale: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.07]
              })
            }
          ],
          elevation: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6]
          })
        }
      })
    };
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this._active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active)
      }).start();
    }
  }

  onPressCheckBox = () => {
    const { data, update } = this.props;
    data.props.enabled = !data.props.enabled;
    update();
    this.refs.analytics.sendData({
      "action-type": "click",
      "target": "Home Feed Section Toggle",
      "starting-screen": "preferences",
      "starting-section": "home-feed", 
      "resulting-screen": "preferences",
      "resulting-section": "home-feed", 
      "target-id": data.props.title,
      "action-metadata": {
        "target-id": data.props.title,
        "enabled": data.props.enabled?"true":"false",
      },
    });
    tracker.trackEvent("Click", "Preferences_row_toggle");
  };

  render() {
    const { data } = this.props;
    const rowAttr = {};
    if (data.props.enabled) {
      rowAttr.fontColor = "white";
      rowAttr.bgColor = "#464646";
      rowAttr.border = 0;
      rowAttr.image = (
        <View style={styles.imageContainer}>
          <Image style={{ flex: 1 }} source={{ uri: data.props.image }} />
        </View>
      );
      rowAttr.icon = "check-box";
    } else {
      rowAttr.fontColor = "grey";
      rowAttr.bgColor = "white";
      rowAttr.border = 0.5;
      rowAttr.image = null;
      rowAttr.icon = "check-box-outline-blank";
    }

    return (
      <Animated.View
        style={[
          styles.row,
          this._style,
          {
            overflow: "hidden",
            flexDirection: "row",
            backgroundColor: rowAttr.bgColor,
            borderWidth: rowAttr.border
          }
        ]}
      >
        <Analytics ref="analytics" />
        {rowAttr.image}
        <Icon
          style={{ backgroundColor: "rgba(0,0,0,0)" }}
          name="reorder"
          size={25}
          color={rowAttr.fontColor}
          accessible={false}
        />
        <Text
          style={[
            styles.text,
            {
              backgroundColor: "rgba(0,0,0,0)",
              flex: 1,
              marginLeft: 5,
              color: rowAttr.fontColor,
              fontWeight: "bold",
              fontFamily: "Roboto"
            }
          ]}
          accessibilityLabel={`${data.props.title}: drag and drop to reorder homepage`}
          accessibilityRole="adjustable"
        >
          {data.props.title}
        </Text>
        <TouchableOpacity
          onPress={() => this.onPressCheckBox()}
          accessibilityLabel={
            !this.props.data.props.enabled
              ? `Add section to home page`
              : `Remove section from home page`
          }
          accessibilityRole="button"
        >
          <View>
            <Icon
              name={rowAttr.icon}
              style={{ backgroundColor: "rgba(0,0,0,0)" }}
              size={30}
              color={rowAttr.fontColor}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
}
/**
 * HomeSettings links to the Settings component on the backend
 * in order to use and store preferences for the application,
 *
 * Specifically the order of items on the Home screen.
 */
class HomeFeedPreferencesContent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      allFeatures: [],
      data: null,
      order: null,
      activeOrder: null
    };
  }

  static defaultProps = {
    settings: {}
  };

  componentDidMount() {
    this.initializeComponent();
  }

  initializeComponent = () => {
    let { developerRegistry, homeScreenConfig } = this.props.settings;
    let feat = {};
    developerRegistry.forEach(item => {
      let key = Object.keys(item);
      feat[key] = item[key];
    });
    this.state.data = feat;
    let tmpOrder = [];
    homeScreenConfig.forEach(item => {
      let prefKey = Object.keys(item)[0];
      if (this.state.data[prefKey]) {
        this.state.data[prefKey].props = item[prefKey].props;
        tmpOrder.push(prefKey);
      }
    });
    developerRegistry.forEach(item => {
      let devKey = Object.keys(item)[0];
      if (tmpOrder.indexOf(devKey) < 0) {
        tmpOrder.push(devKey);
      }
    });
    this.setState({
      order: tmpOrder,
      activeOrder: tmpOrder
    });
  };

  /**
   * Sort and filter the Home Screen after changes are made
   */
  updateStored = (enabled = null, resource) => {
    let { HomeScreenFeaturesSet, homeOrder, SetToast } = this.props.settings;
    let activePrefs = [];
    homeOrder.forEach(item => {
      if (item.data[0].props.enabled) activePrefs.push(item);
    });
    if ((activePrefs.length == 1) & (enabled === false)) {
      this.state.data[resource].props.enabled = true;
      return SetToast("Sorry, one section must be active.");
    }

    let updated = [];
    if (this.state.activeOrder == null) {
      this.state.activeOrder = this.state.order;
    }
    let order = this.state.activeOrder;
    order.forEach(key => {
      let obj = {};
      obj[key] = { props: this.state.data[key].props };
      updated.push(obj);
    });
    this.setState({ order }, () => {
      HomeScreenFeaturesSet(updated);
    });
  };

  onReleaseRowHandler = () => {
    if (this.state.activeOrder !== this.state.order) {
      this.updateStored();
      this.refs.analytics.sendData({
        "action-type": "click",
        "target": "Rearrange Home Feed Sections",
        "starting-screen": "preferences",
        "starting-section": "home-feed",
        "resulting-screen": "preferences",
        "resulting-section": "home-feed",
        "action-metadata":{
          "updatedData":this.state.activeOrder
        }
      });
      tracker.trackEvent(
        "Sort",
        `Preferences_order_updated - currentOrder: ${this.state.activeOrder}`
      );
    }
  };

  render() {
    if (this.state.data && this.state.order) {
      return (
        <View style={styles.container}>
          <Analytics ref="analytics" />
          <SortableList
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
            data={this.state.data}
            order={this.state.order}
            renderRow={this._renderRow}
            onReleaseRow={() => this.onReleaseRowHandler()}
            onChangeOrder={d => (this.state.activeOrder = d)}
          />
        </View>
      );
    } else {
      return null;
    }
  }
  _renderRow = ({ data, active }) => {
    return (
      <Row
        data={data}
        active={active}
        update={() => this.updateStored(data.props.enabled, data.props.title)}
      />
    );
  };
}

/**
 * AppSync Augment components
 */

let getUserInterests = graphql(UserInterestsQuery, {
  options: {
    fetchPolicy: "cache-and-network"
  },
  props: props => {
    return {
      userInterests: props.data.getInterests
    };
  }
});
let getInterestTopics = graphql(InterestTopicsQuery, {
  options: {
    fetchPolicy: "cache-and-network"
  },
  props: props => {
    return {
      interestTopics: props.data.getInterestTopics
    };
  }
});
let saveInterests = graphql(SaveInterestsMutation, {
  props: props => ({
    saveInterests: interests => {
      return props
        .mutate({
          refetchQueries: ["getInterests", "getInterestTopics"],
          variables: {
            ...interests
          },
          update: (store, { resp }) => {
            try {
              const data = store.readQuery({
                query: UserInterestsQuery
              });
              if (data.getInterests.length > 0) {
                data.getInterests[0].data = interests.data;
              } else {
                data.getInterests.push(interests);
              }
              store.writeQuery({
                query: UserInterestsQuery,
                data
              });
            } catch (e) {
              console.log(e);
            }
          }
          // optimisticResponse: () => ({submitResponse: {...submission, __typename: "SurveyResponse"}}) // Comment when debugging
        })
        .then(resp => {
          console.log("mutation response", resp); // Debug option
          // return resp;
        })
        .catch(e => {
          console.log("submission error", e);
          // throw e;
        });
    }
  })
});

// ===================
// APPSYNC & CONTEXT:
// ===================

let HomeInterestsWithData = AppSyncComponent(
  HomeInterests,
  getUserInterests,
  getInterestTopics,
  saveInterests
);

export class HomeFeedPreferences extends React.PureComponent {
  render() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <View style={styles.container}>
            <HomeFeedPreferencesContent settings={settings} />
          </View>
        )}
      </SettingsContext.Consumer>
    );
  }
}

// ============
// STYLEHSEET:
// ============

const styles = StyleSheet.create({
  body: {
    height: 80,
    backgroundColor: "#464646",
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: "row"
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    ...Platform.select({
      ios: {
        paddingTop: 10
      },
      android: {
        paddingTop: 10
      }
    })
  },
  title: {
    fontSize: 20,
    paddingVertical: 20,
    color: "#999999"
  },
  list: {
    flex: 1
  },
  contentContainer: {
    width: window.width,
    ...Platform.select({
      ios: {
        paddingHorizontal: 30
      },
      android: {
        paddingHorizontal: 0
      }
    })
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    height: 60,
    flex: 1,
    marginTop: 7,
    marginBottom: 12,
    borderRadius: 4,
    ...Platform.select({
      ios: {
        width: window.width - 30 * 2,
        shadowColor: "rgba(0,0,0,0.2)",
        shadowOpacity: 1,
        shadowOffset: { height: 2, width: 2 },
        shadowRadius: 2
      },
      android: {
        width: window.width - 30 * 2,
        elevation: 0,
        marginHorizontal: 30
      }
    })
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 30,
    borderRadius: 25
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0
  },
  text: {
    fontSize: 24,
    color: "#222222"
  },
  preferencesText: {
    color: "white",
    fontSize: responsiveFontSize(2.8),
    fontWeight: "bold",
    fontFamily: "Roboto",
    textAlign: "center",
    textAlignVertical: "center"
  },
  mainContent: {
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
    marginTop: 10
  }
});
