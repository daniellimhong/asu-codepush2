import React from "react";
import { View } from "react-native";
import { responsiveWidth } from "react-native-responsive-dimensions";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { getEventInterestCount } from "../../../Queries/Activities";
import { DefaultText as Text } from "../../presentational/DefaultText.js";

/**
 * Button to be placed allowing users to check into events
 */
export class InterestCountX extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    event_interest_count: 0
  };

  render() {
    if (
      this.props.event_interest_count !== null &&
      this.props.event_interest_count > 0
    ) {
      return (
        <View
          style={{
            paddingHorizontal: responsiveWidth(4),
            paddingVertical: responsiveWidth(0.5),
            marginRight: responsiveWidth(5),
            borderRadius: responsiveWidth(1),
            backgroundColor: "grey",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Text
            style={{
              color: "white",
              padding: responsiveWidth(1)
            }}
          >
            {this.props.event_interest_count} users interested
          </Text>
        </View>
      );
    } else {
      return null;
    }
  }
}
// export const CheckinCount = AppSyncComponent(CheckinCountX)
export const InterestCount = AppSyncComponent(
  InterestCountX,
  getEventInterestCount
);
