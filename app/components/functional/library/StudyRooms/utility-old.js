import { AsyncStorage } from "react-native"
import axios from "axios";
import moment from "moment";

const clientid = "429";
const clientsecret = "b6ff9fa22fe4439ac422d0db046914c6";
const baseUrl = "https://asu.libcal.com/1.1";
var gettingToken = false;
const refreshUrl = "https://mcuwjen7gc.execute-api.us-west-2.amazonaws.com/prod/orefresh";

import {
  iSearchHandler
} from "../../../../Queries";
import {
  Auth
} from "../../../../services";

const types = {
  getRooms: "/room_groups",
  spaceLocations: "/space/locations",
  bookings: "/space/bookings",
  getSpaceForm: "/space/form",
  category: "/space/category",
  categories: "/space/categories",
  item: "/space/item",
  reserve: "/space/reserve",
  cancelRoom: "/space/cancel"
}

var retry = 0;

export function basicGet(type,ender = "") {

  let fullUrl = baseUrl + types[type] + ender;
  // console.log(fullUrl)

  return new Promise(function tryagain(resolve, reject) {

    getAuthorizationHeaders().then( headers => {
      // console.log("GET HAVE HEADERS",headers)
      axios.get(fullUrl,headers).then(resp => {
        retry = 0;
        resolve(resp.data);
      }).catch(err => {
        attemptRetry(err,type,ender,null).then( attemptResp => {
          if( ++retry < 2 ) {
            tryagain(resolve,reject);
          } else {
            reject("Error")
          }
        }).catch( attemptErr => {
          retry = 0;
          reject("Failed")
        })

      })
    })

  });

}

export function basicPost(type,postData,reqInfo) {

  let fullUrl = baseUrl + types[type];

  var fullPayload = {
    ...postData,
    test: true
  }

  return new Promise(function tryagain(resolve, reject) {
    Auth().getSession("edu.asu.asumobileapp",refreshUrl).then( tokens => {
      fullIsearch(tokens.username).then( isearchInfo => {
        let isearch = iSearchHandler(tokens.username, isearchInfo.data);

        fullPayload.fname = isearch.firstName;
        fullPayload.lname = isearch.lastName;
        fullPayload.email = tokens.username+"@asu.edu";
        fullPayload.q1546 = tokens.username;

        // console.log("TO SEND",fullPayload)

        getAuthorizationHeaders().then( headers => {
          axios.post(fullUrl,fullPayload,headers).then(resp => {
            // console.log("Post Response",resp)
            retry = 0;
            resolve(resp);
          }).catch(err => {
            attemptRetry(err).then( attemptResp => {
              if( ++retry < 2 ) {
                tryagain(resolve,reject);
              } else {
                reject("Failed")
              }
            }).catch( attemptErr => {
              retry = 0;
              reject("Failed")
            })

          })
        })

      }).catch( isearchErr => {
        console.log("Error with isearch",isearchErr);
      })
    });
  });

}

export function cancelResPost(id) {
  let fullUrl = baseUrl + types["cancelRoom"] + "/"+id;
  // console.log(fullUrl)

  return new Promise(function tryagain(resolve, reject) {

    getAuthorizationHeaders().then( headers => {
      // console.log("GET HAVE HEADERS",headers)
      axios.post(fullUrl,{},headers).then(resp => {
        retry = 0;
        resolve(resp.data);
      }).catch(err => {
        attemptRetry(err,type,ender,null).then( attemptResp => {
          if( ++retry < 2 ) {
            tryagain(resolve,reject);
          } else {
            reject("Error")
          }
        }).catch( attemptErr => {
          retry = 0;
          reject("Failed")
        })

      })
    })

  });

}

function attemptRetry(err) {
  return new Promise(function tryagain(resolve, reject) {
    try {
      var data = JSON.parse(JSON.stringify(err));
      var errData = data.response.data.error;
      console.log("ERROR WITH LIBRARY",data.response.data)
      if( errData == "invalid_token" || errData == "no token") {
        setToken().then( resp => {
          resolve("done")
        }).catch( attemptErr => {
          reject("Error setting token")
        });
      } else {
        reject("Failed")
      }
    } catch(e) {
      console.log("Failed parsing library resp")
      reject("failed parsing response");
    }
  });
}

export function setToken() {
  return new Promise(function(resolve, reject) {
      getToken().then(resp => {
        AsyncStorage.setItem("libraryOAuthToken",resp).then(resp123 => {
          resolve("done")
        }).catch(mErr => {
          reject("Failed")
        });
      }).catch( err => {
        reject("error setting token")
      });
  });
}

export function getToken() {
  var data = {
    grant_type: "client_credentials",
    client_id: clientid,
    client_secret: clientsecret
  };

  return new Promise(function(resolve, reject) {
    axios
      .post(baseUrl+"/oauth/token", data)
      .then(function(response) {
        if( response.data ) {
          if( response.data.access_token ) {
            resolve(response.data.access_token)
          } else {
            reject("issue getting token");
          }
        } else {
          reject("no data");
        }
      })
      .catch(function(error) {
        console.log(error);
        reject(error);
      });
  });

}

function getAuthorizationHeaders() {
  return new Promise(function(resolve, reject) {
    AsyncStorage.getItem("libraryOAuthToken").then( bearerToken => {
      // console.log("TOKEN",bearerToken)
      resolve({ headers: { Authorization: "Bearer "+bearerToken } });
    }).catch( err => {
      resolve({ headers: { Authorization: "Bearer 123" } });
    })
  });
}

export function parseHtml(h) {
  var tempStr = h;
  var returnData = [];
  var cap = 0;

  while( tempStr.length > 0 && ++cap < 5) {
    let startInd = tempStr.indexOf("<p>");
    let endInd = tempStr.indexOf("</p>");

    if( startInd != -1 && endInd != -1 ) {
      let item = tempStr.slice(startInd+3,endInd);

      if( item.indexOf(" available") > -1 ) {
        item = item.slice(0,item.indexOf(" available"));
      }

      let splitItems = item.split(" and ");
      returnData = returnData.concat(splitItems)
    }

    tempStr = tempStr.slice(endInd+4)
  }

  return returnData;
}

export function getCaps(n) {
  var caps = [];
  for( var i = 0; i < n; ++i ) {
    caps.push({
      name: i+1,
      id: i+1
    })
  }
  return caps;
}

export function getDates(n) {
  var baseDate = moment(moment().format("YYYY-MM-DD"));
  var dates = [];

  for( var i = 0; i < n; ++i ) {

    dates.push({
      name: baseDate.format("dddd, MMM D, YYYY"),
      id: baseDate.unix()
    })

    baseDate.add(1,'days')

  }

  return dates;
}

export function areConsecutive(timesArray) {

  let len = timesArray.length;
  let lastSelectedIndex = -1;

  for( var i = 0; i < len; ++i ) {
    if( timesArray[i].selected ) {
      if( lastSelectedIndex !== -1 && (i - lastSelectedIndex > 1) ) {
        return false;
      }
      lastSelectedIndex = i;
    }
  }

  return true;

}

export function resetWithIndex(timesArray,selectedIndex) {
  let len = timesArray.length;

  for( var i = 0; i < len; ++i ) {
    timesArray[i].selected = false;
  }

  timesArray[selectedIndex].selected = true;

  return timesArray;

}

export function checkSelects(timesArray) {
  let len = timesArray.length;

  for( var i = 0; i < len; ++i ) {
    if( timesArray[i].selected ) {
      return true;
    }
  }
  return false;

}

export function fullIsearch(asurite) {

  return new Promise(function(resolve, reject) {
    let isearchurl = "https://asudir-solr.asu.edu/asudir/directory/select?q=*:*&fq=asuriteId:("+asurite+")&wt=json";
    axios.get(isearchurl,{}).then(resp => {
      resolve(resp);
    }).catch(err => {
      reject(err)
    });

  });
}

export function getFormFields(id) {

  let extraRequired = [];
  return new Promise(function(resolve, reject) {
    basicGet("getSpaceForm","/"+id).then(resp => {
      let soleResponse = resp[0].fields;

      for( let key in soleResponse ) {
        if( soleResponse[key].required ) {
          extraRequired.push({
            id: key,
            label: soleResponse[key].label
          })
        }
      }

      resolve(extraRequired);

    }).catch(err => {
      console.log("FORM ERROR",err)
      reject(err);
    })
  });
}

export function getBookings() {
  return new Promise(function tryagain(resolve, reject) {
    Auth().getSession("edu.asu.asumobileapp",refreshUrl).then( tokens => {
      basicGet("bookings","?email="+tokens.username+"@asu.edu").then( bookResp => {
        // console.log("HAVE BOOKINGS",bookResp)
        resolve(bookResp)
      }).catch( bookErr => {
        console.log("Get bookigns erors",bookErr)
        reject("failed")
      })
    });
  });
}
