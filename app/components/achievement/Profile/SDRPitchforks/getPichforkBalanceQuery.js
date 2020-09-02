import gql from "graphql-tag";
import { graphql } from "react-apollo";

export const GetPointsSummaryQuery = gql`
  query($checkASURITE: String){
    getPointsSummary(checkASURITE: $checkASURITE, api: "getMemberByPoints"){
        status
        data
    }
  }
`;

export const getPitchforkPoints = graphql(GetPointsSummaryQuery, {
    options: props => ({
      fetchPolicy: "network-only",
      variables: {
        checkASURITE: props.checkASURITE
      }
    }),
    props: props => {
      if (props.data.error) {
        console.log(props.data.error);
      }
      return {
        pointsSummary: props.data
      };
    }
  });