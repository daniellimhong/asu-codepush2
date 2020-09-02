import gql from "graphql-tag";
import _ from "lodash";
import { graphql } from "react-apollo";

export const ListWellnessSectionsQuery = gql`
  query {
    listWellnessSections {
      id
      title
      text
      contacts {
        id
        description
        contactList {
          id
          contact
          type
        }
      }
      media {
        id
        thumbnail_url
        title
        type
      }
    }
  }
`;

export const ListWellnessSections = graphql(ListWellnessSectionsQuery, {
  options: (props) => ({
    fetchPolicy: "cache-and-network",
  }),
  props: (props) => {
    return {
      sections: _.get(props, "data.listWellnessSections")
        ? _.get(props, "data.listWellnessSections")
        : [],
    };
  },
});
