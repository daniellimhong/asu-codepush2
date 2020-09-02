import React from "react";
import { View, ScrollView, FlatList } from "react-native";
import { getFriendRequests } from "../../../../Queries";
import { AppSyncComponent } from "../../../functional/authentication/auth_components/appsync/AppSyncApp";
import Analytics from "../../../functional/analytics";
import { tracker } from "../../google-analytics.js";
import { FriendRequestOptions } from "../FriendRequestOptions";
import { SingleUser } from "../SingleUser";
import {Auth} from "../../../../services";

/**
 * All requests that people have sent to you
 */
class IncomingRequestsX extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      ownerStudentStatus: false
    }

  }

  static defaultProps = {
    requests: {
      requests: []
    },
    subscribeFriendRequests: () => null,
    startPolling: () => null
  };

  componentDidMount() {
    tracker.trackEvent("View", "MyFriends_IncomingFriendRequests");
    this.props.subscribeToNewRequests();

    // console.log("DID MOUNT")
    Auth().getSession().then(tokens => {
      this.setState({
        ownerStudentStatus: tokens.roleList.indexOf("student") > -1
      })
    })

  }

  render() {
    if (
      this.props.requests &&
      this.props.requests.requests &&
      this.props.requests.requests.length > 0
    ) {
      return (
        <View>
          <Analytics ref="analytics" />
          <ScrollView style={{ backgroundColor: "white" }}>
            <FlatList
              data={this.props.requests.requests}
              renderItem={this._renderFriend}
              keyExtractor={(item, index) => index.toString()}
            />
          </ScrollView>
        </View>
      );
    } else {
      return null;
    }
  }

  _renderFriend = ({ item }) => {
    const { navigate } = this.props.navigation;
    return (
      <SingleUser
        friendStatus={false}
        requestStatus={false}
        navigation={this.props.navigation}
        ownerStudentStatus={this.state.ownerStudentStatus}
        asurite={item.requester}
        rightSide={FriendRequestOptions}
        previousScreen={"friends"}
        previousSection={"pending-friend-requests"}
      />
    );
  };
}

export const IncomingRequests = AppSyncComponent(
  IncomingRequestsX,
  getFriendRequests
);
