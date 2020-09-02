import React, { PureComponent } from "react";
import { Text, StyleSheet, View, ScrollView, Alert } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { Divider } from "react-native-elements";
import SortableGrid from "react-native-sortable-grid";
import Button from "react-native-button";
import PropTypes from "prop-types";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { Col, Row, Grid } from "react-native-easy-grid";
import { SettingsContext } from "../../Settings/Settings";
import { getRoleResources, getUserResources } from "./gql/Queries";
import { setUserResources } from "./gql/Mutations";
import { AppSyncComponent } from "../../../functional/authentication/auth_components/appsync/AppSyncApp";

import {
  createResourceIcon,
  createMainBadge,
  getInitialResourceOrder,
  convertRawResourcesArray,
  toaster,
  getDefaultResources,
  getUserPrefs,
  getActiveResources,
  createGridRow
} from "./utility";
import { tracker } from "../../google-analytics";
import Analytics from "../../../functional/analytics";

// ===============================================================================
// DEVELOPER NOTES:
// While best practice would be to keep things as close as possible to props,
// the sortable grid works/renders/updates best (from what I found...) by
// using state. I found good UX by setting state.resourcesPreferences to
// an empty array and then immediately after setting it to the updated resources.
// ===============================================================================

export class ResourcesPreferencesx extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      scrollEnabled: true,
      mainResources: [],
      resourceOrder: [],
      defaultResources: [],
      activeResources: []
    };
  }

  static defaultProps = {
    defaultResources: [],
    userResources: [],
    setUserResources: () => null
  };

  componentDidMount = async () => {
    await getActiveResources(this);
    await getDefaultResources(this);
    await getUserPrefs(this);
    await getInitialResourceOrder(this);
  };

  // ==================
  // GESTURE HANDLERS:
  // ==================

  _onPressInHandler = () => {
    this.setState({ scrollEnabled: false });
  };

  _onPressOutHandler = () => {
    this.setState({ scrollEnabled: true });
  };

  _onDragReleaseHandler = res => {
    const newResourcesOrder = [];
    res.forEach(item => newResourcesOrder.push(item.key));
    const newResources = [];
    newResourcesOrder.forEach(orderNum => {
      this.state.resourceOrder.forEach(resource => {
        if (resource.key === orderNum) {
          newResources.push(resource);
        }
      });
    });
    let updatedResourcesArray = convertRawResourcesArray(newResources);
    this.setState({ mainResources: updatedResourcesArray });
    this.props.setUserResources(updatedResourcesArray);
    this.refs.analytics.sendData({
      "action-type": "drag",
      target: "Resource Item-reorder",
      "starting-screen": "preferences",
      "starting-section": "resources",
      "resulting-screen": "preferences",
      "resulting-section": "resources",
      "action-metadata": {
        resources_array: JSON.stringify(updatedResourcesArray)
      }
    });
    tracker.trackEvent(
      "Drag",
      "Dragged resource to new position: " +
        JSON.stringify(updatedResourcesArray)
    );
  };

  lastTap = null;
  _handleDoubleTap = resource => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 500;
    if (this.lastTap && now - this.lastTap < DOUBLE_PRESS_DELAY) {
      this.removeResource(resource);
    } else {
      this.lastTap = now;
    }
  };

  // ================
  // CORE FUNCTIONS:
  // ================

  resetResources = async () => {
    const { defaultResources } = this.state;
    Alert.alert("Reset Resources", "Do you want to reset your resources?", [
      { text: "Cancel", onPress: () => console.log("Pressed Cancel!") },
      {
        text: "OK",
        onPress: () => {
          this.setState({ mainResources: [] }, () => {
            setTimeout(() => {
              this.setState({ mainResources: defaultResources });
              this.props.setUserResources(defaultResources);
              getInitialResourceOrder(this);
              toaster("Resources successfully reset.", this);
            }, 10);
          });
        }
      }
    ]);
  };

  removeResource = resource => {
    if (this.state.mainResources.length <= 1) {
      toaster("Unable to remove. At least one resource must be present.", this);
      return;
    }
    Alert.alert(
      `Remove resource`,
      `Do you want to remove "${resource.title}"`,
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Pressed Cancel!");
          },
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            let updatedResources = this.state.mainResources.filter(
              item => item.title !== resource.title
            );
            this.setState({ mainResources: [] }, () => {
              setTimeout(() => {
                this.setState({ mainResources: updatedResources });
                this.props.setUserResources(updatedResources);
                getInitialResourceOrder(this);
                toaster(`"${resource.title}" successfully removed.`, this);
              }, 10);
            });
            this.refs.analytics.sendData({
              "action-type": "click",
              target: "Resource Item-removed:" + resource.title,
              "starting-screen": "preferences",
              "starting-section": "resources",
              "resulting-screen": "preferences",
              "resulting-section": "resources",
              "target-id": resource.title,
              "action-metadata": {
                resources_array: JSON.stringify(updatedResources),
                "target-id": resource.title
              }
            });
            tracker.trackEvent(
              "Click",
              "Double Pressed this resource to remove it locally and remotely: " +
                JSON.stringify(resource)
            );
          }
        }
      ]
    );
  };

  addResource = resource => {
    const { mainResources } = this.state;
    for (let i = 0; i < mainResources.length; i++) {
      if (mainResources.length >= 6) {
        return toaster(
          "Active resources list is full. Please remove a resource and try again.",
          this
        );
      } else if (mainResources[i].title === resource.title) {
        return toaster("Resource already saved to preferences.", this);
      }
    }
    let currentResources = mainResources;
    currentResources.push(resource);
    this.setState({ mainResources: [] }, () => {
      setTimeout(() => {
        this.setState({ mainResources: currentResources });
        this.props.setUserResources(currentResources);
        getInitialResourceOrder(this);
      }, 10);
    });
    this.refs.analytics.sendData({
      "action-type": "click",
      target: "Resource Item-added:" + resource.title,
      "starting-screen": "preferences",
      "starting-section": "resources",
      "resulting-screen": "preferences",
      "resulting-section": "resources",
      "target-id": resource.title,
      "action-metadata": {
        resources_array: JSON.stringify(currentResources),
        "target-id": resource.title
      }
    });
    tracker.trackEvent(
      "Click",
      "Clicked resource and added it to active resources: " +
        JSON.stringify(resource)
    );
  };

  // ==============
  // CREATE GRIDS:
  // ==============

  createAuxResourcesGrid = () => {
    return (
      <View style={{ padding: responsiveHeight(2) }}>
        <Text style={{ color: "#202020" }}>
          Tap a resource to add it to your home screen.
        </Text>
        <View style={{ paddingVertical: responsiveHeight(2) }}>
          {this.state.activeResources.map((set, index) => {
            return (
              <View style={{ marginBottom: responsiveHeight(2) }} key={index}>
                <Text style={styles.headerText}>{set.title}</Text>
                <Grid>
                  <Row>{createGridRow(set, 0, 3, this)}</Row>
                  <Row>{createGridRow(set, 3, 6, this)}</Row>
                  {/* TODO: Manipulate grid here */}
                  <Row>{createGridRow(set, 6, 7, this)}</Row>
                </Grid>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  createMainResourcesGrid = () => {
    // console.log("this.state 2: ", this.state);
    if (this.state.mainResources && this.state.mainResources.length) {
      // console.log("got here 1");
      return this.state.mainResources.map((resource, index) => {
        return (
          <View
            key={index}
            style={styles.resourcePane}
            adjustsFontSizeToFit={true}
          >
            <View style={styles.activeResourcesBadge}>
              {createMainBadge(resource, this)}
            </View>
            <TouchableWithoutFeedback
              style={styles.resourcePaneTouchable}
              onPress={() => this._handleDoubleTap(resource)}
              onPressIn={() => this._onPressInHandler()}
              onPressOut={() => this._onPressOutHandler()}
            >
              <View style={[styles.containerAlt]}>
                {createResourceIcon(
                  resource.title,
                  responsiveWidth(14),
                  false,
                  true
                )}
              </View>

              <View style={styles.containerAlt}>
                <Text
                  style={styles.resourcePaneText}
                  adjustsFontSizeToFit={true}
                  numberOfLines={2}
                >
                  {resource.title}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        );
      });
    } else {
      console.log("got here 2");
      return [];
    }
  };

  // ========
  // RENDER:
  // ========

  render() {
    return (
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: "#F4F4F4"
        }}
        scrollEnabled={this.state.scrollEnabled}
      >
        <Analytics ref="analytics" />
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, paddingVertical: responsiveHeight(2) }}>
            <Text
              style={{
                paddingHorizontal: responsiveHeight(2),
                color: "#202020"
              }}
            >
              Long press to reorder home screen resources. Double tap a resource
              to remove it.
            </Text>
            <SortableGrid
              ref={"SortableGrid"}
              itemsPerRow={3}
              style={styles.sortableGrid}
              onDragRelease={({ itemOrder }) =>
                this._onDragReleaseHandler(itemOrder)
              }
              doubleTapThreshold={1000}
            >
              {this.createMainResourcesGrid()}
            </SortableGrid>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <View style={{ flex: 1 }} />
              <Button
                style={styles.resetButton}
                onPress={() => this.resetResources()}
              >
                Reset Resources
              </Button>
              <View style={{ flex: 1 }} />
            </View>
          </View>
        </View>

        <Divider
          style={{
            backgroundColor: "#D5D5D5",
            marginHorizontal: responsiveHeight(2)
          }}
        />

        {this.createAuxResourcesGrid()}
      </ScrollView>
    );
  }
}

// =================
// APPSYNC/CONTEXT:
// =================

export const ResourcesPreferencesy = AppSyncComponent(
  ResourcesPreferencesx,
  getRoleResources,
  getUserResources,
  setUserResources
);

export const ResourcesPreferences = props => (
  <SettingsContext.Consumer>
    {settings => {
      return <ResourcesPreferencesy {...props} settings={settings} />;
    }}
  </SettingsContext.Consumer>
);

ResourcesPreferencesx.contextTypes = {
  SetToast: PropTypes.func
};

// ============
// STYLESHEET:
// ============

const styles = StyleSheet.create({
  containerAlt: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  headerText: {
    fontWeight: "bold",
    marginBottom: responsiveHeight(2),
    color: "#0B4E6B",
    fontFamily: "Roboto"
  },
  sortableGrid: {
    marginVertical: responsiveHeight(2)
  },
  resourcePane: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: responsiveHeight(1),
    backgroundColor: "white",
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: responsiveHeight(0.15) },
    shadowOpacity: 0.4,
    shadowRadius: responsiveHeight(0.15),
    elevation: 3
  },
  resourcePaneTouchable: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    padding: responsiveWidth(2)
  },
  resourcePaneText: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "center",
    textAlign: "center",
    fontSize: responsiveFontSize(1.5),
    color: "#0B4E6B",
    paddingVertical: responsiveHeight(1)
  },
  activeResourcesBadge: {
    position: "absolute",
    top: responsiveHeight(0.5),
    right: responsiveHeight(0.5),
    resizeMode: "contain"
  },
  resetButton: {
    color: "#0B4E6B",
    fontSize: responsiveFontSize(1.25),
    borderWidth: 1,
    borderColor: "#D5D5D5",
    padding: responsiveHeight(1)
  }
});
