import React from "react";
import { View } from "react-native";
import {
  getSocialCheckinActivities,
  getAcademicCheckinActivities
} from "../../../Queries/Activities";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { CheckinsBlockX } from "./CheckinsBlock";
import Analytics from "../../functional/analytics";

let CheckinsBlock = AppSyncComponent(
  CheckinsBlockX,
  getSocialCheckinActivities,
  getAcademicCheckinActivities
);

/**
 * Screen for personal checkins.
 *
 * This wrapper is necessary so we can properly handle the checkin queries and reuse
 * the CheckinsBlockX component.
 */
export class UserCheckins extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.refs.analytics.sendData({
      "eventtime": new Date().getTime(),
      "action-type": "view",
      "target": "Card Checkins",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:"user-profile",
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null,
      "resulting-screen": "user-checkins", 
      "resulting-section": null
    });
  }

  render() {
    let { asurite } = this.props.navigation.state.params;

    return (
      <View
        style={{
          flex: 1
        }}
      >
        <Analytics ref="analytics" />
        <CheckinsBlock asurite={asurite} 
          navigation={this.props.navigation}
          previousScreen={this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:"user-profile"}
          previousSection={this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null}/>
      </View>
    );
  }
}
