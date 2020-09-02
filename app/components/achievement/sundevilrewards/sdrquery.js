import gql from "graphql-tag";
import { graphql } from "react-apollo";

export const getCollectPitchforkstextQuery = gql`
query{
    getCollectPitchforkstext(id: 1){
        id
        title
        subtitle
        text
        buttontext
    
       
    }
}
`;

export const getCollectPitchforkstext = graphql(getCollectPitchforkstextQuery, {
    options: props => ({
      fetchPolicy: "network-only"
    }),
    props: props => {
      if (props.data.error) {
        console.log(props.data.error);
      }
      return {
        collectPitchforks: props.data
      };
    }
  });

  export const getEarnPitchforkstextQuery = gql`
query{
    getEarnPitchforkstext(id: 2){
        id
        title
        text
        buttontext
    
       
    }
}
`;

export const getEarnPitchforkstext = graphql(getEarnPitchforkstextQuery, {
    options: props => ({
      fetchPolicy: "network-only"
    }),
    props: props => {
      if (props.data.error) {
        console.log(props.data.error);
      }
      return {
        earnPitchforks: props.data
      };
    }
  });

  export const getLoginResponseQuery = gql`
  query getLoginResponse($api:String,$email: String, $password: String){
        getLoginResponse(api: $api, email: $email, password: $password){
            status
  }
  }
  `;


  export const updateASURITEQuery = gql`
  query {
    updateASURITE(api:"updateASURITE"){
      status
    }
  }
  `;

  export const updateASURITE = graphql(updateASURITEQuery, {
    options: props => ({
      fetchPolicy: "network-only"
    }),
    props: props => {
      if (props.data.error) {
        console.log(props.data.error);
      }
      return {
        asurite_update: props.data
      };
    }
  });

 
