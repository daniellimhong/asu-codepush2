import gql from "graphql-tag";

export const userPing = gql`
  mutation($asurite: String, $value: Int) {
    userPing(asurite: $asurite, value: $value) {
      asurite
      value
    }
  }
`;

export const getPing = gql`
  query($asurite: String) {
    getPing(asurite: $asurite) {
      asurite
      value
    }
  }
`;

export const subscribePing = gql`
  subscription($asurite: String) {
    userPinged(asurite: $asurite) {
      asurite
      value
    }
  }
`;
