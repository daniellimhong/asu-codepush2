import { Platform } from "react-native";
import SInfo from "react-native-sensitive-info";
import CookieManager from "react-native-cookies";

import axios from "axios";
import DeviceInfo from "react-native-device-info";
/**
 * Constant names we want for the cookies
 */
const specNames = ["CASTGC", "ADRUM", "ASUWEBAUTH", "ASUWEBAUTH2", "SSONAME"];

export function updateCookies() {
  getCookiesFromWebview()
    .then(cookies => {
      saveCookies(JSON.stringify(cookies)).catch(e => {
        console.log("Update cookies failed at save: ", e);
      });
    })
    .catch(e => {
      console.log("Update cookies failed at get: ", e);
    });
}

function idGenerator() {
  var S4 = function() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

export function callApi(payload) {
  try {
    let p = {
      device: DeviceInfo.getUniqueID(),
      timestamp: new Date().getTime(),
      id: idGenerator(),
      ...payload
    }
    axios.post("https://n4h7j00g0e.execute-api.us-west-2.amazonaws.com/prod/log",p);
  } catch(e) {}
}

/**
 * Remove all cookies within the app
 */
export function purgeCookies() {
  clearStoredCookies();
  clearWebviewCookies();
}

/**
 * Validate cookies, applying them to the webview if available
 */
export function handleStartupCookies() {
  validateCookieStores()
    .then(cookies => {
      if (cookies) {
        restoreCookiesToWebview(cookies).catch(e => {
          console.log("Cookie validation broke at webview: ", e);
        });
      }
    })
    .catch(e => {
      console.log("Cookie validation bad: ", e);
    });
}

/**
 * Check to see whether the stored cookied we have are valid.
 * If so, return them
 * If not, clear local stored cookies and return null
 */
export function validateCookieStores() {
  return new Promise((resolve, reject) => {
    getCookiesFromStorage()
      .then(cookies => {
        if (cookies && cookies.length) {
          for (var name of specNames) {
            let miss = true;
            for (var i = 0; i < cookies.length; i++) {
              if (cookies[i].attr == name && cookies[i].value) {
                miss = false;
              }
            }
            if (miss) {
              // console.log("Not enough cookies", cookies);
              clearStoredCookies();
              resolve(null);
            }
          }
          /**
           * Winner
           */
          resolve(cookies);
        } else {
          // console.log("Not enough cookies", cookies);
          clearStoredCookies();
          resolve(null);
        }
      })
      .catch(e => {
        console.log("Bad cookie validation", e);
        clearStoredCookies();
        resolve(null);
      });
  });
}

/**
 * Get available ASU and Weblogin cookies
 */
export function getCookiesFromWebview() {
  return new Promise(function(resolve, reject) {
    let names = [...specNames];

    let uri = "https://asu.edu";
    CookieManager.get(uri)
      .then(asuCookies => {
        let cookies = trySave(names, asuCookies, uri, []);

        uri = "https://weblogin.asu.edu";
        CookieManager.get(uri)
          .then(wlCookies => {
            cookies = trySave(names, wlCookies, uri, cookies);

            uri = "https://weblogin.asu.edu/cas/login";
            CookieManager.get(uri)
              .then(casCookies => {
                cookies = trySave(names, casCookies, uri, cookies);

                resolve(cookies);
              })
              .catch(e => {
                reject(e);
              });
          })
          .catch(e => {
            reject(e);
          });
      })
      .catch(e => {
        reject(e);
      });
  });
}

/**
 * Clear any cookies currently being stored by the native webview
 */
export function clearWebviewCookies() {
  return new Promise((resolve, reject) => {
    CookieManager.clearAll()
      .then(res => {
        resolve(true);
      })
      .catch(e => {
        reject(e);
      });
  });
}

/**
 * Clear any cookies being manually persisted by the application
 */
export function clearStoredCookies() {
  return new Promise((resolve, reject) => {
    SInfo.deleteItem("maintcvals", {})
      .then(resp => {
        resolve(resp);
      })
      .catch(e => {
        reject(e);
      });
  });
}

/**
 * Check to see whether we already have cookies stored
 */
export function getCookiesFromStorage() {
  return new Promise((resolve, reject) => {
    SInfo.getItem("maintcvals", {})
      .then(value => {
        if (value) {
          resolve(JSON.parse(value));
        } else {
          resolve(null);
        }
      })
      .catch(e => {
        console.log("Bad vals", e);
        resolve(null);
      });
  });
}

/**
 * Save cookies to the sensitive storage
 * @param {*} cookies Stringified array of cookie objects
 */
export function saveCookies(cookies) {
  return new Promise((resolve, reject) => {
    if (typeof cookies === "string") {
      SInfo.setItem("maintcvals", cookies, {})
        .then(resp => {
          resolve(resp);
        })
        .catch(e => {
          reject(e);
        });
    } else {
      reject("Cookies must be stringified before storage");
    }
  });
}

/**
 * Set the native webview cookies
 * @param {*} cookies Array of cookie objects
 */
export function restoreCookiesToWebview(cookies) {
  return new Promise((resolve, reject) => {
    if (cookies && cookies.length) {
      let cookiePromises = [];
      for (let cookie of cookies) {
        let cook = {
          "Set-Cookie":
            cookie.attr +
            "=" +
            cookie.value +
            ";domain=.asu.edu; path=/; expires=1969-12-31T23:59:59.000Z; secure; HttpOnly"
        };
        if (Platform.OS !== "ios") {
          cook =
            cookie.attr +
            "=" +
            cookie.value +
            "; expires=1969-12-31T23:59:59.000Z; secure; HttpOnly";
        }
        cookiePromises.push(
          CookieManager.setFromResponse(cookie.uri, cook).catch(e => {
            console.log("Cookie manager failed to set: ", e);
          })
        );
      }
      Promise.all(cookiePromises)
        .then(() => {
          resolve(true);
        })
        .catch(e => {
          reject(e);
        });
    } else {
      reject("Bad cookie values for restore");
    }
  });
}

/**
 * Try and grab cookies from a given object.
 * If they exist then we remove the name requirement from the list of cookie names
 * and add the values to the array of cookies
 *
 * @param {*} names List of attribute names that we still need to try and save
 * @param {*} cookieObject The response from the getCookies call. May differ between android and iOS
 * @param {*} arr The array we will be adding everything to
 */
function trySave(names, cookieObject, uri, arr) {
  let remove = [];
  for (let attr of names) {
    let obj = {};
    if (cookieObject[attr]) {
      obj.attr = attr;
      obj.value = cookieObject[attr];
      obj.uri = uri;
      arr.push(obj);
      remove.push(attr);
    }
  }
  for (let attr of remove) {
    let ind = names.indexOf(attr);
    names.splice(ind, 1);
  }
  return arr;
}

/**
 * Just a test function for the cookie maintenance stuff
 */
export function runCookieMaintainer() {
  getCookiesFromWebview()
    .then(cookies => {
      console.log("Cookies found in webview: ", cookies);
      saveCookies(JSON.stringify(cookies))
        .then(resp => {
          console.log("Cookies saved to storage: ", resp);
          getCookiesFromStorage()
            .then(stored => {
              console.log("Cookies pulled from storage: ", stored);
              clearWebviewCookies()
                .then(cleared => {
                  console.log("Cleared Webview", cleared);
                  restoreCookiesToWebview(stored)
                    .then(status => {
                      console.log("Attempted to restore cookies", status);
                      getCookiesFromWebview()
                        .then(cookies => {
                          console.log(
                            "Results from secondary cookie check: ",
                            cookies
                          );
                          clearStoredCookies()
                            .then(resp => {
                              console.log(
                                "Clearing the persisted cookies: ",
                                resp
                              );
                              getCookiesFromStorage()
                                .then(resp => {
                                  console.log(
                                    "Confirming cookie storage was cleared: ",
                                    resp
                                  );
                                })
                                .catch(e => {
                                  console.log(
                                    "Failed secondary cookie GET: ",
                                    e
                                  );
                                });
                            })
                            .catch(e => {
                              console.log("Failed secondary cookie clear: ", e);
                            });
                        })
                        .catch(e => {
                          console.log(
                            "Failed secondary cookie check for webview: ",
                            e
                          );
                        });
                    })
                    .catch(e => {
                      console.log("Failed to restor cookies to webview: ", e);
                    });
                })
                .catch(e => {
                  console.log("Failed to clear cookies from webview: ", e);
                });
            })
            .catch(e => {
              console.log("Failed to pull cookies from storage: ", e);
            });
        })
        .catch(e => {
          console.log("Failed to save cookies: ", e);
        });
    })
    .catch(e => {
      console.log(e);
    });
}
