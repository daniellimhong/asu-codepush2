import React from "react";
import { LinkBlock } from "./LinkBlock";
export class AppInteractionBlock extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  static defaultProps = {
    asurite: "",
    details: [],
    title: "",
    id: "",
    infoDetails: null,
    roles: [],
    isearch: () => null,
    showHead: false,
    subscribeToNewFriends: () => null
  };
  render() {
    let dets = [
      {
        id: "checkins",
        img: "check-circle",
        url: this.props.viewingSelf ? "MyCheckins" : "UserCheckins",
        text: "Check-ins",
        bgColor: "#369bca",
        count:
          this.props.checkin_count_social + this.props.checkin_count_academic
      },
      {
        id: "likes",
        img: "heart",
        url: this.props.viewingSelf ? "MyLikes" : "UserLikes",
        text: "Likes",
        bgColor: "#c70042",
        count: this.props.like_count
      }
    ];
    if (this.props.viewingSelf && this.props.student_status) {
      dets.push({
        id: "friends",
        img: "users",
        url: "MyFriends",
        text: "Friends",
        bgColor: "#c6980b",
        count: this.props.friend_count
      });
    }
    return (
      <LinkBlock
        details={dets}
        roles={this.props.roles}
        viewingSelf={this.props.viewingSelf}
        title={this.props.title}
        id="Profile_AppInteraction"
        asurite={this.props.asurite}
        ownerAsurite={this.props.ownerAsurite}
        navigation={this.props.navigation}
        previousScreen={this.props.previousScreen}
        previousSection={this.props.previousSection}
      />
    );
  }
}