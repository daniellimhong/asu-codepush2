import gql from "graphql-tag";
import { graphql, ApolloProvider, compose } from "react-apollo";

export const GetTicketQuery = gql`
  query($key_name: String!) {
    getTicket(key_name: $key_name) {
      key_name
      asurite
      checkIn
      checkInTime
      eventName
      claimed
      claimedTime
    }
  }
`;

export const ClaimTicketMutation = gql`
  mutation(
    $asurite: String!
    $eventName: String!
    $timeStamp: String!
    $scanner: Boolean!
    $eventid: String
  ) {
    claimTicket(
      asurite: $asurite
      eventName: $eventName
      timeStamp: $timeStamp
      scanner: $scanner
      eventid: $eventid
    ) {
      key_name
      asurite
      checkIn
      checkInTime
      eventName
      claimed
      claimedTime
      eventid
      action
    }
  }
`;

export const claimTicket = graphql(ClaimTicketMutation, {
  props: props => ({
    claimTicket: ticket => {
      // console.log("the ticket: ", ticket);
      try {
        // code for testing
        // return new Promise((resolve, reject) => {
        //   resolve({
        //     asurite: "lmurph20",
        //     eventName: "THE POLAR EXPRESS (2004)",
        //     timeStamp: "1544552751989",
        //     scanner: false,
        //     eventid: "polarexpress",
        //     action: "buy"
        //   });
        // });

        // code for production
        return props
          .mutate({ variables: { ...ticket } })
          .then(resp => {
            console.log(
              "ClaimTicketMutation response: ",
              resp.data.claimTicket
            );
            return resp;
          })
          .catch(e => {
            console.log("submission error", e);
            // throw e;
          });
      } catch (e) {
        console.log("claimTicket error: ", e);
      }
    }
  })
});
