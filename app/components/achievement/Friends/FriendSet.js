import React from "react";
import { View, ScrollView } from "react-native";
import { SingleUser } from "./SingleUser";
import Analytics from "../../functional/analytics";
import { Auth } from "../../../services";

/**
 * Given some list of friends, passed in the navigation state params,
 * render a selectable list of users.
 */
export class FriendSet extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      attendees: []
    };
  }

  componentDidMount() {
    if (
      this.props.navigation.state.params &&
      this.props.navigation.state.params.attendees &&
      this.props.navigation.state.params.attendees.length
    ) {
      this.setState({
        attendees: this.props.navigation.state.params.attendees
      });
    }

    Auth().getSession().then(tokens => {
      this.setState({
        ownerStudentStatus: tokens.roleList.indexOf("student") > -1
      })
    })

  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        <ScrollView>
          {this.state.attendees.map((item, index) => {
            return (
              <SingleUser
                key={"SFIsrch" + item.friend + index}
                friendStatus={true}
                requestStatus={false}
                navigation={this.props.navigation}
                ownerStudentStatus={this.state.ownerStudentStatus}
                asurite={item}
                previousScreen={"checked-in-friends"}
                previousSection={"friend-list-item"}
              />
            );
          })}
        </ScrollView>
      </View>
    );
  }
}
