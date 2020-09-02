import React from "react";
import { View, ScrollView, FlatList } from "react-native";
import { DefaultText as Text } from "../../../presentational/DefaultText.js";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth
} from "react-native-responsive-dimensions";
import { getOutgoingFriendRequests } from "../../../../Queries";
import { AppSyncComponent } from "../../../functional/authentication/auth_components/appsync/AppSyncApp";
import Analytics from "../../../functional/analytics";
import { SingleUser } from "../SingleUser";
import { Auth } from "../../../../services";

export class OutgoingRequestsX extends React.PureComponent {

  state={
    ownerStudentStatus: false
  }

  static defaultProps = {
    outgoing_requests: [],
    subscribeToIgnores: () => null
  };

  componentDidMount() {
    this.props.subscribeToIgnores();

    Auth().getSession().then(tokens => {
      this.setState({
        ownerStudentStatus: tokens.roleList.indexOf("student") > -1
      })
    })

  }

  render() {
    if (
      this.props.outgoing_requests &&
      this.props.outgoing_requests.length > 0
    ) {
      return (
        <View style={{ flex: 1 }}>
          <Analytics ref="analytics" />
          <ScrollView style={{ backgroundColor: "white" }}>
            <FlatList
              data={this.props.outgoing_requests}
              renderItem={this._renderFriend}
              keyExtractor={(item, index) => index.toString()}
            />
          </ScrollView>
        </View>
      );
    } else {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: responsiveHeight(15),
            paddingHorizontal: responsiveWidth(15)
          }}
        >
          <Analytics ref="analytics" />
          <Text
            style={{
              fontSize: responsiveFontSize(3),
              marginBottom: responsiveHeight(5),
              textAlign: "center"
            }}
          >
            No pending friend requests at the moment.
          </Text>
          <Text
            style={{
              fontSize: responsiveFontSize(2.5),
              color: "#898989"
            }}
          >
            You are all caught up!
          </Text>
        </View>
      );
    }
  }

  _renderFriend = ({ item }) => {
    const { navigate } = this.props.navigation;
    return (
      <SingleUser navigation={this.props.navigation} 
        ownerStudentStatus={this.state.ownerStudentStatus} 
        asurite={item.requestee}
        previousScreen={"friends"}
        previousSection={"pending-friend-requests"} />
    );
  };
}

export const OutgoingRequests = AppSyncComponent(
  OutgoingRequestsX,
  getOutgoingFriendRequests
);
