import gql from "graphql-tag";

export const AdminEngagementsQuery = gql`
  query AdminEngagements {
    getAdminEngagements {
      id
      type
      expire
    }
  }
`;

export const RemoveAdminEngagementMutation = gql`
  mutation($index: Int) {
    removeAdminEngagement(index: $index) {
      id
      type
      expire
    }
  }
`;

/**
 * Survey Engagements
 */
export const StagedSurveyQuery = gql`
  query GetStagedSurvey($id: Int) {
    getStagedSurvey(id: $id) {
      id
      timestamp
      question
      options
      enabled
    }
  }
`;

export const SubmitSurveyMutation = gql`
  mutation SubmitResponse(
    $other: String
    $selection: String
    $timestamp: ID
    $id: ID
  ) {
    submitResponse(
      other: $other
      selection: $selection
      timestamp: $timestamp
      id: $id
    ) {
      timestamp
      selection
      other
      asurite
    }
  }
`;

export const GetFriendEngagementsQuery = gql`
  query {
    getFriendEngagements {
      timestamp
      engagement_id
      friend
      type
      viewed
    }
  }
`;

export const GetInviteEngagementsQuery = gql`
  query {
    getInviteEngagements {
      timestamp
      engagement_id
      friend
      type
      viewed
    }
  }
`;

export const GetInviteData = gql`
  query($event_id: String) {
    getInviteData(event_id: $event_id) {
      endtime
      location
      starttime
      title
      url
      id
      data {
        description
        endTime
        key
        location
        map_title
        map_type
        picture
        startTime
        teaser
        title
        type
        url
        map_coords {
          lat
          lng
        }
      }
    }
  }
`;
