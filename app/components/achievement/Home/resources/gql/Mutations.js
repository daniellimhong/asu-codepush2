import gql from "graphql-tag";
import { graphql } from "react-apollo";
import _ from "lodash";

import { GetUserResourcesQuery } from "./Queries";

const SetUserResourcesMutation = gql`
  mutation($resources: [Resources_Input]) {
    setUserResources(resources: $resources) {
      title
      inapp
      image
      url
      isNew
    }
  }
`;

export const setUserResources = graphql(SetUserResourcesMutation, {
  props: props => ({
    setUserResources: resources => {
      for (let i = 0; i < resources.length; i++) {
        if (resources[i].hasOwnProperty("screen")) {
          delete resources[i].screen;
        }
      }
      props
        .mutate({
          variables: {
            resources
          },
          optimisticResponse: { setUserResources: [...resources] },
          update: (store, resp) => {
            updateResourceCache(store, resp);
          }
        })
        .then(res => {
          console.log("setUserResources res: ", res);
        })
        .catch(e => {
          console.log("setUserResources error: ", e);
        });
    }
  })
});

export function updateResourceCache(store, resp) {
  try {
    let resources = resp.data.setUserResources;
    let data = store.readQuery({
      query: GetUserResourcesQuery
    });
    data.getUserResources = resources;
    store.writeQuery({
      query: GetUserResourcesQuery,
      data
    });
  } catch (e) {
    // console.log(e);
  }
}
