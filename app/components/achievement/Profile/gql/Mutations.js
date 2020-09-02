import gql from "graphql-tag";
import _ from "lodash";
import { graphql } from "react-apollo";
import { GetProfileBlocksQuery } from "./Queries.js";

export const UpdateProfileMutation = gql`
  mutation(
    $operation: String
    $type: String
    $details: [Profile_Block_Details_Input]
  ) {
    updateUserProfile(operation: $operation, type: $type, details: $details) {
      connections {
        title
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
        }
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
        }
      }
      appinteraction {
        title
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
        }
      }
      roles
    }
  }
`;

export const updateUserProfile = graphql(UpdateProfileMutation, {
  props: props => ({
    updateUserProfile: (operation, type, details, myprops) => {
      return props.mutate({
        variables: {
          operation,
          type,
          details
        },
        update: (store, resp) => {
          // console.log("HERE inside mutation resp: ",resp);
          updateProfileInfo(store,resp,myprops);
          // This is where we update the cache
        }
      });
    }
  })
});

export function updateProfileInfo(store, resp, myprops) {
  try {
    let respData = resp.data.updateUserProfile;

    let data = store.readQuery({
      query: GetProfileBlocksQuery,
      variables: {
        roles: myprops.roles,
        asurite: myprops.asurite
      }
    });

    data.getProfileBlocks.biography = respData.biography;
    data.getProfileBlocks.connections = respData.connections;

    store.writeQuery({
      query: GetProfileBlocksQuery,
      variables: {
        roles: myprops.roles,
        asurite: myprops.asurite
      },
      data
    });

  } catch (e) {
    console.log(e);
  }
}
