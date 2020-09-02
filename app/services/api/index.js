import aws4 from "aws4-react-native";
import axios from "axios";

/**
 * Api utility function. Necessary for the signing process.
 * @param {*} url
 */
function parseUrl(url) {
  var parts = url.split("/");

  return {
    host: parts[2],
    path: "/" + parts.slice(3).join("/")
  };
}

/**
 * Programmable API Object configured to work with the ASU weblogin token system.
 * Function calls are only set to work with an AWS backend, as all calls are signed
 * for secure endpoints using SigV4
 * 
 * Ex use: 
  
  let apiService = new ApiService("https://mycoolapi.edu", this.state.tokens);

  apiService.post("/user", {"my":"payload"}).then(response => {
    // If good response, do something
  }).catch(error => {
    throw error;
  });

 */
export class Api {
  url = "";
  access_info = {};
  service_info = {};

  constructor(
    url,
    credentials,
    service_info = { service: "execute-api", region: "us-west-2" }
  ) {
    this.url = url;
    this.access_info.accessKeyId = credentials.AccessKeyId;
    this.access_info.secretAccessKey = credentials.SecretAccessKey;
    this.access_info.sessionToken = credentials.SessionToken;
    this.service_info = service_info;
  }

  /**
   * POST
   *
   * @param {*} end API endpoint. Ex. /users
   * @param {*} payload JSON formatted payload data
   * @param {*} headers
   */
  post(end, payload = null, headers = {}) {
    var url = this.url + end;

    var parsed_url = parseUrl(url);

    var req = {
      host: parsed_url.host,
      method: "POST",
      url: url,
      path: parsed_url.path,
      headers: headers
    };

    if (payload) {
      headers["content-type"] = "application/json; charset=UTF-8";
      (req.data = payload), (req.body = JSON.stringify(payload));
    }

    var sigv4 = aws4.sign(
      {
        ...req
      },
      this.access_info
    );

    req.headers = sigv4.headers;

    delete req.headers["Host"];
    delete req.headers["Content-Length"];

    return axios(sigv4)
      .then(response => response.data)
      .catch(error => {
        throw error;
      });
  }

  /**
   * GET function
   *
   * @param {*} end API endpoint
   * @param {*}
   */
  get(end, headers) {
    var url = this.url + end;

    var parsed_url = parseUrl(url);

    var req = {
      method: "GET",
      url: url,
      host: parsed_url.host,
      path: parsed_url.path,
      headers: headers
    };

    var sigv4 = aws4.sign(
      {
        ...req
      },
      this.access_info
    );

    req.headers = sigv4.headers;

    // delete req.headers['host'];

    return axios(sigv4)
      .then(response => response.data)
      .catch(error => {
        throw error;
      });
  }
}
