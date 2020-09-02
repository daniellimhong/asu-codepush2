import React from "react";
import { createAppContainer } from "react-navigation";
import _ from "lodash";
import AppDrawer from "./AppDrawer";
import { tracker } from "../google-analytics";

function getActiveRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
  if (route.routes) {
    return getActiveRouteName(route);
  }
  return route.routeName;
}

const AppDrawerApp = createAppContainer(AppDrawer);
// AppRegistry.registerComponent('AppStack', () => Navigator);
// AppRegistry.registerComponent("AppDrawer", () => Navigator);

/**
 * Simple wrapper component for the drawer.
 */
class AppNav extends React.PureComponent {

  constructor(props) {
    super(props);
    console.log('appnavigation', this.props)
    this.state = {
      prevScreenName : "home",
      currentScreenName : "home"
    };
  }

  render() {
    return (
      <AppDrawerApp
        onNavigationStateChange={(prevState, currentState) => {
          const currentScreen = getActiveRouteName(currentState);
          const prevScreen = getActiveRouteName(prevState);
          if (
            prevScreen !== currentScreen &&
            prevScreen !== "DrawerOpen" &&
            currentScreen !== "DrawerOpen"
          ) {
            // the line below uses the Google Analytics tracker
            // change the tracker here to use other Mobile analytics SDK.
            this.setState({prevScreenName : prevScreen})
            this.setState({currentScreenName : currentScreen})
            tracker.trackScreenView(currentScreen);
            tracker.trackEvent(
              "Navigation",
              `Navigated from ${prevScreen} to ${currentScreen}`
            );
          }
        }}
        screenProps={{
          currentScreenName: this.state.currentScreenName ,
          prevScreenName: this.state.prevScreenName ,
        }}
      />
    );
  }
}

export default AppNav;
