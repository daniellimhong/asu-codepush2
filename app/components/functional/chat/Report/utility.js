/* eslint-disable import/prefer-default-export */
import axios from "axios";

export function getUserData(asurite) {
  return axios
    .get(
      `https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/user-details?asurite=${asurite}`
    )
    .then(({ data }) => {
      // console.log(data);
      if (data) {
        return data;
      } else {
        return false;
      }
    });
}
