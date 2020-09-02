import React from "react";
import { View } from "react-native";
import PropTypes from "prop-types";

/**
 * Wrapper component that will divvy up "Engagements" through the app.
 *
 * Ie. If a single user is supposed to receive a survey or popup modal from
 * the administrative team then we will handle that here.
 *
 * Also, if a user should receive a notification from another user like an event
 * invite then it will be handled here.
 *
 * NOTE:    This relies on AppSync(or something) to populate the relevant props in order
 *          to function
 *
 */
export default class Engagements extends React.Component {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    survey_id: null,
    admin_engagements: [],
    user_engagements: [],
    queryEngagements: () => null,
    removeEngagement: () => null
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.admin_engagements.length) {
      this.handleAdminEngagements(nextProps.admin_engagements);
    }
  }

  handleAdminEngagements(engagements) {
    engagements.forEach((engagement, index) => {
      switch (engagement.type) {
        case "survey":
          //   console.log("In survey engagement");
          break;
        default:
          // console.log("received an admin engagement without a valid type");
          break;
      }
    });
  }

  render() {
    return <View style={styles.contentContainer}>{this.props.children}</View>;
  }
}

export function EngagementComponent(Component, type) {
  class EngageComp extends React.Component {
    constructor(props) {
      super(props);
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.admin_engagements.length) {
        this.handleAdminEngagements(nextProps.admin_engagements);
      }
    }

    render() {
      return <Component {...this.props} />;
    }
  }

  EngageComp.contextTypes = {
    client: PropTypes.object
  };

  return EngageComp;
}
