import axios from "axios";
import Amplify, { API } from "aws-amplify-react-native";
import { AsyncStorage } from "react-native";
import url from "url";
import { Api as ApiService } from "../../services";
import { callApi } from "../../components/functional/authentication/auth_components/weblogin/cookies";

// import DeviceInfo from "react-native-device-info";


/**
 * Build the array required for AsyncStorage Multi-Set to work
 * @param {*} data
 */
function buildSetTokens(data) {
  let tokenArr = [];
  let tokenObj = {
    username: data.username ? data.username : null,
    GuestId: data.GuestId ? data.GuestId : null,
    AccessKeyId: data.AccessKeyId ? data.AccessKeyId : null,
    SecretAccessKey: data.SecretAccessKey ? data.SecretAccessKey : null,
    SessionToken: data.SessionToken ? data.SessionToken : null,
    Expiration: data.Expiration ? data.Expiration + "" : null,
    Refresh: data.Refresh ? data.Refresh : null,
    role: data.role ? data.role : null,
    oauthRefresh: data.oauthRefresh ? data.oauthRefresh : null,
  };

  if (data.roleList) {
    tokenObj.roleList = data.roleList.toString();
  }

  Object.keys(tokenObj).forEach(function(key) {
    if (tokenObj[key] !== null) {
      tokenArr.push([key, tokenObj[key]]);
    }
  });

  return tokenArr;
}

function tokenKeyArray() {
  let keys = [
    "username",
    "GuestId",
    "AccessKeyId",
    "SecretAccessKey",
    "SessionToken",
    "Expiration",
    "Refresh",
    "role",
    "roleList",
    "oauthRefresh",
  ];

  return keys;
}

/**
 * Use Refresh token to refresh the local token store
 * by calling setSession.
 */
function refresh(appid, tokens, refreshURL) {
  let parsed = url.parse(refreshURL);

  if (parsed.protocol && parsed.host) {
    var parts = refreshURL.split("/");
    var host = parsed.protocol + "//" + parsed.host;

    let apiService = new ApiService(host, tokens);

    var myInit = {
      body: {
        token: tokens.oauthRefresh,
      },
    };
    return apiService
      .post(parsed.path, myInit.body)
      .then((response) => {
        if (
          response.AccessKeyId &&
          response.Expiration &&
          response.SecretAccessKey &&
          response.SessionToken
        ) {
          let tokenArray = buildSetTokens(response);
          AsyncStorage.multiSet(tokenArray);
          let tokenData = {
            username: response.username,
            GuestId: response.GuestId,
            AccessKeyId: response.AccessKeyId,
            SecretAccessKey: response.SecretAccessKey,
            SessionToken: response.SessionToken,
            Expiration: response.Expiration,
            Refresh: response.refresh,
            role: response.role,
            oauthRefresh: response.oauthRefresh,
          };
          if (response.roleList) {
            tokenData.roleList = response.roleList;
          }

          return Promise.resolve(tokenData);
        } else {
          throw new Error("Bad keys");
        }
      })
      .catch((error) => {
        throw error;
      });
  } else {
    return Promise.reject("Unable to refresh");
  }
}

/**
 * Verify that the WebLogin payload is good for the app by ensuring that all of the data is not null.
 */
function validateWeblogin(data) {
  if (
    data.AccessKeyId &&
    data.Expiration &&
    data.SecretAccessKey &&
    data.SessionToken &&
    data.username
  ) {
    if (!passedExpiration(data.Expiration)) {
      // callApi({"message": "passed validation session"})
      return true;
    }
  }
  // callApi({"message": "failed validation session"})
  return false;
}

function getSession() {
  return new Promise((resolve, reject) => {
    let keys = tokenKeyArray();
    AsyncStorage.multiGet(keys)
      .then((tokens) => {
        let tokenObj = tokenArrayToObject(tokens);
        resolve(tokenObj);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function setSession(data) {
  return new Promise((resolve, reject) => {
    // callApi({"message": "is setting session"})
    if (validateWeblogin(data)) {
      let tokenArray = buildSetTokens(data);
      AsyncStorage.multiSet(tokenArray)
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    } else {
      reject("The received login tokens are incomplete");
    }
  });
}

/**
 * Clears andy currently stored session tokens.
 * Leaves the GuestId value so that we dont recreate it with every new login attempt
 */
function clearSession() {
  return new Promise((resolve, reject) => {
    let keys = tokenKeyArray();
    callApi({"message": "is clearing session"})
    AsyncStorage.multiRemove([
      "username",
      "AccessKeyId",
      "SecretAccessKey",
      "SessionToken",
      "Expiration",
      "Refresh",
      "role",
      "roleList",
      "oauthRefresh",
    ])
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * Hit the guest credential API
 */
function getGuestCredentials(GuestId) {
  return new Promise((resolve, reject) => {
    let params = {};

    if (GuestId) {
      params.GuestId = GuestId;
    }

    axios
      .post(
        "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/auth/guest",
        params
      )
      .then((tokens) => {
        resolve(tokens.data);
      })
      .catch((e) => {
        reject("Failed to get guest tokens");
      });
  });
}

/**
 * Pull existing session.
 * Each
 */
function getGuestSession() {
  return new Promise((resolve, reject) => {
    getSession()
      .then((tokens) => {
        // If existing tokens are bad or there are no tokens, get tokens
        if (
          !tokens ||
          !tokens.username ||
          passedExpiration(tokens.Expiration)
        ) {
          getGuestCredentials(tokens.GuestId) // Get creds
            .then((tokens) => {
              setSession(tokens) // Set session
                .then(() => {
                  resolve(tokens); // Return Tokens
                })
                .catch((e) => {
                  reject(e);
                });
            })
            .catch((e) => {
              reject(e);
            });
        } else {
          resolve(tokens);
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
}

/**
 * Check whether the provided expiration time has already passed
 * @param {*} expiration
 */
function passedExpiration(expiration) {
  let now = new Date().getTime() - 8000; // Adding a buffer of 8 seconds
  if (!expiration || now > expiration) {
    return true;
  } else {
    return false;
  }
}

function validateTokens(appid, tokens, refreshUrl) {
  return new Promise((resolve, reject) => {
    if (validateWeblogin(tokens)) {
      var expiration = new Date(tokens.Expiration);
      if (expiration > Date.now()) {
        resolve(tokens);
      } else {
        if (tokens.username === "guest") {
          getGuestSession()
            .then((tokens) => {
              resolve(tokens);
            })
            .catch((e) => {
              reject(e);
            });
        } else if (tokens.oauthRefresh !== null) {
          resolve(refresh(appid, tokens, refreshUrl));
        } else {
          reject("Provided tokens are no good");
        }
      }
    } else {
      reject("Invalid tokens provided");
    }
  });
}

function tokenArrayToObject(tokenArray) {
  var formatted = {};
  for (var token of tokenArray) {
    formatted[token[0]] = token[1];
  }

  return formatted;
}

export const Auth = () => {
  return {
    /**
     * Check whether stored tokens are valid.
     * If not, try to return a refresh promise.
     * If so, return a JSON object with the tokens
     *
     * Tokens are invalid if:
     *  - Any are missing
     *  - We are passed the expiration date
     *  - We are unable to refresh
     */
    validateTokens: function(appid, tokens, refreshUrl) {
      return new Promise((resolve, reject) => {
        if (Array.isArray(tokens)) {
          tokens = tokenArrayToObject(tokens);
        }
        validateTokens(appid, tokens, refreshUrl)
          .then((resp) => {
            resolve(resp);
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
    /**
     * Set the relevant session information given by weblogin
     * in AsyncStorage
     */
    setSession: function(data) {
      return new Promise((resolve, reject) => {
        setSession(data)
          .then((tokens) => {
            resolve(tokens);
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
    /**
     * Get the necessary session information
     * for calls to AWS resources
     */
    getSession: function(appid, refresh = "") {
      return new Promise((resolve, reject) => {
        getSession()
          .then((tokens) => {
            validateTokens(appid, tokens, refresh)
              .then((response) => {
                let parsedResponse = { ...response };
                if (
                  parsedResponse.roleList &&
                  typeof parsedResponse.roleList == "string"
                ) {
                  let toArray = parsedResponse.roleList.split(",");
                  if (toArray === "") {
                    toArray = [];
                  }
                  parsedResponse.roleList = toArray;
                }

                resolve(parsedResponse);
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    /**
     * Clear all session tokens from application
     */
    clearSession: function() {
      return new Promise((resolve, reject) => {
        clearSession()
          .then((response) => {
            resolve(response);
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
    getGuestSession: function() {
      return new Promise((resolve, reject) => {
        getGuestSession()
          .then((tokens) => {
            resolve(tokens);
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
  };
};
