import React, { PureComponent } from "react";
import { ScrollView } from "react-native";
import Analytics from "../analytics";
import { Events } from "./index";
import { SettingsContext } from "../../achievement/Settings/Settings";

export default class RecommendedEvents extends PureComponent {

  render() {
    const { navigation } = this.props;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: "#e8e8e8" }}>
        <Analytics ref="analytics" />
        <SettingsContext.Consumer>
          {settings => (
            <Events
              navigation={navigation}
              // roles={["alumni"]}
              roles={settings.roles}
            />
          )}
        </SettingsContext.Consumer>
      </ScrollView>
    );
  }
}
