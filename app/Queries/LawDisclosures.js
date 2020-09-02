
import gql from "graphql-tag";
import _ from "lodash";
import { graphql } from "react-apollo";


export const GetDisclosuresQuery = gql`
query {
  listDisclosures {
    originalUrl
    category
    title
    body
    date
    creator
    type
}
}
`;


export const GetLawDisclosuresLearnMoreQuery = gql`
query {
  listLawDisclosuresLearnMores {
  items {
    id
    url
    title
    internal_link
    icon
    platformSpecific
    iosUrl
    androidUrl
  }
}
}
`;

export const RsvpObject = gql`
query ($id:String) {
  getAsumobileLawEventsRSVP (id:$id)
  {
    id
    asurite
    originalUrl
  }
}
`;


export const RsvpForEventQuery = gql`
  mutation createAsumobileLawEventsRSVP(
    $asurite: String
    $originalUrl: String
    $title: String
    $id:String
  ) {
    createAsumobileLawEventsRSVP(
      asurite: $asurite
      originalUrl: $originalUrl
      title: $title
      id:$id
    ) {
     asurite
     originalUrl
     title
     id
     __typename
    }
  }
`;

export const getRsvpObject =graphql(RsvpObject, {
    options:  (props) => ({
      fetchPolicy: "cache-and-network",
      variables: {
        id: props.id ? props.id : null
      }
    }),
    props: props => {
      return { rsvpObject: _.get(props, 'data.getAsumobileLawEventsRSVP') ? _.get(props, 'data.getAsumobileLawEventsRSVP') : {}}
    }
  });


export const rsvpforLawEvent = graphql(RsvpForEventQuery, {
  props: props => ({
    rsvpForEvent: (asurite, originalUrl, title, id) => {
      // console.log('got these arguments for rsvpForEvent function ', asurite, originalUrl, title, id)
      return props.mutate({
        variables: {
          asurite,
          originalUrl,
          title,
          id
        },
        optimisticResponse: {
          createAsumobileLawEventsRSVP: {
            asurite,
            originalUrl,
            title,
            id,
            __typename: "AsumobileLawEventsRSVP"
          }
        }
      });
    }
  })
});

export const getLawDisclosures =
  graphql(GetDisclosuresQuery, {
    options:  (props) => ({
      fetchPolicy: "cache-and-network"
    }),
    props: props => {
      return { disclosures: _.get(props, 'data.listDisclosures') ? _.get(props, 'data.listDisclosures') : [] }

    }
  });


export const getLawDisclosuresLearnMore =
  graphql(GetLawDisclosuresLearnMoreQuery, {
    options:  (props) => ({
      fetchPolicy: "cache-and-network"
    }),
    props: props => {
      return { learnMoreLinks: _.get(props, 'data.listLawDisclosuresLearnMores.items') ? _.get(props, 'data.listLawDisclosuresLearnMores.items') : [] }
    }
  });


