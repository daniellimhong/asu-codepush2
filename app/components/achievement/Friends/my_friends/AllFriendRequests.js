import React from "react";
import { View } from "react-native";
import { responsiveWidth } from "react-native-responsive-dimensions";
import { IncomingRequests } from "./IncomingRequests";
import { OutgoingRequests } from "./OutgoingRequests";
import { SettingsContext } from "../../Settings/Settings";

export class AllFriendRequests extends React.PureComponent {
  renderComponent() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <View style={{ flex: 1 }}>
            <IncomingRequests
              navigation={this.props.screenProps.navigation}
              asurite={settings.user}
            />
            <OutgoingRequests
              navigation={this.props.screenProps.navigation}
              asurite={settings.user}
            />
          </View>
        )}
      </SettingsContext.Consumer>
    );
  }

  render() {
    return (
      <View
        style={{
          flex: 1
        }}
      >
        <View
          style={{
            width: responsiveWidth(100),
            flexDirection: "row",
            backgroundColor: "white",
            alignItems: "center",
            paddingLeft: responsiveWidth(5)
          }}
        />
        {this.renderComponent()}
      </View>
    );
  }
}
