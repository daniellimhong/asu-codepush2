import gql from "graphql-tag";
import _ from "lodash";
import { graphql } from "react-apollo";

export const GetProfileBlocksQuery = gql`
  query($roles: [String], $asurite: String) {
    getProfileBlocks(roles: $roles, asurite: $asurite) {
      connections {
        title
        canAddBio
        details {
          detail_id
          bgColor
          img
          url
          text
          imgUrl
          useImgUrl
          order
          linkBeg
          toggled
          asurite
          showEmail
          showPhone
          bio
          __typename
        }
        __typename
      }
      biography {
        title
        canAddBio
        details {
          detail_id
          bgColor
          img
          url
          text
          imgUrl
          useImgUrl
          order
          linkBeg
          toggled
          asurite
          showEmail
          showPhone
          bio
          __typename
        }
        __typename
      }
      appinteraction {
        title
        canAddBio
        details {
          detail_id
          bgColor
          img
          url
          text
          imgUrl
          useImgUrl
          order
          linkBeg
          toggled
          asurite
          showEmail
          showPhone
          bio
          __typename
        }
        __typename
      }
      careerresources {
        title
        canAddBio
        details {
          detail_id
          bgColor
          img
          url
          text
          imgUrl
          useImgUrl
          order
          linkBeg
          toggled
          asurite
          showEmail
          showPhone
          bio
          __typename
        }
        __typename
      }
      roles
    }
  }
`;

export const getProfileBlocks = graphql(GetProfileBlocksQuery, {
  options: props => ({
    fetchPolicy: "cache-and-network",
    variables: {
      roles: props.roles,
      asurite: props.asurite
    }
  }),
  props: props => {
    return {
      profile_blocks: _.get(props, "data.getProfileBlocks")
        ? _.get(props, "data.getProfileBlocks")
        : ["Nothing"]
    };
  }
});
