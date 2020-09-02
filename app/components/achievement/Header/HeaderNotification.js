import React from "react";
import { View } from "react-native";
import TextTicker from "react-native-text-ticker";
import {
  responsiveFontSize,
  responsiveHeight
} from "react-native-responsive-dimensions";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { getAdminSettings } from "../../../Queries";

class HeaderNotificationX extends React.PureComponent {
  static defaultProps = {
    admin_settings: {}
  };

  render() {
    if (
      this.props.admin_settings &&
      this.props.admin_settings.adminNotification
    ) {
      return (
        <View>
          <View
            style={{
              justifyContent: "center",
              height: responsiveHeight(6),
              backgroundColor: "#25262a",
              borderBottomColor: "#fea812",
              borderBottomWidth: responsiveHeight(0.5),
              alignItems: "center"
            }}
          >
            <TextTicker
              style={{ fontSize: responsiveFontSize(2.3), color: "white" }}
              duration={20000}
              loop
              bounce
              repeatSpacer={10}
              marqueeDelay={0}
            >
              {this.props.admin_settings.adminNotification}
            </TextTicker>
          </View>
        </View>
      );
    } else {
      return null;
    }
  }
}

export default (HeaderNotification = AppSyncComponent(
  HeaderNotificationX,
  getAdminSettings
));
