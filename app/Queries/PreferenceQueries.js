import gql from "graphql-tag";
import { graphql, ApolloProvider, compose } from "react-apollo";

export const UserInterestsQuery = gql`
  query GetInterests {
    getInterests {
      asurite
      id
      timestamp
      data {
        alumni
        arts
        career
        children
        community
        culture
        entrepreneurship
        health
        innovation
        public
        sports
        sustainability
      }
    }
  }
`;

export const InterestTopicsQuery = gql`
  query GetInterestTopics {
    getInterestTopics {
      default
      enabled
      id
      timestamp
      data {
        events
        image
        news
        title
      }
    }
  }
`;
export const SaveInterestsMutation = gql`
  mutation SaveInterests($data: User_Interests_Data_Input) {
    saveInterests(data: $data) {
      innovation
      alumni
      career
      sports
      public
      children
      culture
      health
      entrepreneurship
      community
      sustainability
      arts
    }
  }
`;

export const SaveGlobalPermissionsMutation = gql`
  mutation SaveGlobalPermsMutation($permissions: Permissions_Global_Input) {
    setGlobalPermissions(permissions: $permissions) {
      academic
      social
      __typename
    }
  }
`;

export const GetGlobalPermissionsQuery = gql`
  query GetGlobalPerms {
    getGlobalPermissions {
      academic
      social
      __typename
    }
  }
`;

export const getGlobalPermissions = graphql(GetGlobalPermissionsQuery, {
  options: {
    fetchPolicy: "network-only"
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }

    if (props.data.getGlobalPermissions) {
      if (
        props.data.getGlobalPermissions.academic === true ||
        props.data.getGlobalPermissions.academic === false
      ) {
        props.data.getGlobalPermissions.academic =
          props.data.getGlobalPermissions.academic;
      } else {
        props.data.getGlobalPermissions.academic = true;
      }

      if (
        props.data.getGlobalPermissions.social === true ||
        props.data.getGlobalPermissions.social === false
      ) {
        props.data.getGlobalPermissions.social =
          props.data.getGlobalPermissions.social;
      } else {
        props.data.getGlobalPermissions.social = true;
      }
      return {
        social: props.data.getGlobalPermissions.social,
        academic: props.data.getGlobalPermissions.academic
      };
    } else {
      return {
        social: true,
        academic: true,
        __typename: "Permissions_Global"
      };
    }
  }
});

export const setGlobalPermissions = graphql(SaveGlobalPermissionsMutation, {
  props: props => ({
    setPermissions: permissions => {
      props
        .mutate({
          variables: {
            permissions: {
              ...permissions
            }
          },
          optimisticResponse: () => ({
            setGlobalPermissions: {
              academic: permissions.academic,
              social: permissions.social,
              __typename: "Permissions_Global"
            }
          }),
          update: (store, { resp }) => {
            try {
              let data = store.readQuery({
                query: GetGlobalPermissionsQuery,
                variables: {
                  asurite: props.ownProps.asurite
                }
              });

              data.getGlobalPermissions = {
                academic: permissions.academic,
                social: permissions.social,
                __typename: "Permissions_Global"
              };

              store.writeQuery({
                query: GetGlobalPermissionsQuery,
                variables: {
                  asurite: props.ownProps.asurite
                },
                data
              });
            } catch (e) {
              console.log(e);
            }
          }
        })
        .then(resp => {
          console.log("Mutation response", resp);
        });
    }
  })
});
