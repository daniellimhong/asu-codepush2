import React from "react";
import { View } from "react-native";
import {
  getEventActivities,
  getAcademicCheckins
} from "../../../Queries/Activities";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { CheckinsBlockX } from "./CheckinsBlock";
import Analytics from "../../functional/analytics";

let CheckinsBlock = AppSyncComponent(
  CheckinsBlockX,
  getEventActivities,
  getAcademicCheckins
);

/**
 * Screen for personal checkins.
 *
 * This wrapper is necessary so we can properly handle the checkin queries and reuse
 * the CheckinsBlockX component.
 */
export class MyCheckins extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    
    this.refs.analytics.sendData({
      "eventtime": new Date().getTime(),
      "action-type": "view",
      "target": "Card Checkins",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:"my-profile",
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null,
      "resulting-screen": "my-checkins", 
      "resulting-section": null
    });
  }

  render() {
    return (
      <View
        style={{
          flex: 1
        }}
      >
        <Analytics ref="analytics" />
        <CheckinsBlock self={true} 
          navigation={this.props.navigation}
          previousScreen={this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:"my-profile"}
          previousSection={this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null}/>
      </View>
    );
  }
}
