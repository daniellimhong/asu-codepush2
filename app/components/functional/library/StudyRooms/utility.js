/* eslint-disable guard-for-in */
import moment from "moment";
import { AsyncStorage } from "react-native";
import { Api, Auth } from "../../../../services";

let currentRes = [];

export function libApi(myPay) {
  const baseUrl = "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod";
  return new Promise((resolve, reject) => {
    Auth()
      .getSession("edu.asu.asumobileapp")
      .then(tokens => {
        const apiService = new Api(baseUrl, tokens);
        const payload = myPay;
        apiService
          .post("/library/studyrooms", payload)
          .then(resp => {
            if (resp && resp.errorMessage) {
              console.log("Failed from studyrooms lambda", resp.errorMessage);
              reject(new Error("Failed"));
            } else {
              resolve(resp);
            }
          })
          .catch(error => {
            console.log("Failed from studyrooms lambda", error);
            reject(new Error("Failed"));
          });
      })
      .catch(err => {
        console.log("Failed from studyrooms lambda", err);
        reject(new Error("Failed"));
      });
  });
}

export function cachedRooms() {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem("LibReservations")
      .then(info => {
        if (info) {
          try {
            const parsed = JSON.parse(info);
            const returnData = [];

            // console.log("ROOMS CACHED", parsed);

            for (let i = 0; i < parsed.length; ++i) {
              if (moment(parsed[i].toDate).unix() > moment().unix()) {
                returnData.push(parsed[i]);
              }
            }

            // console.log("WILL PASS BACK", returnData);

            if (returnData.length > 0) {
              resolve(returnData);
            } else {
              resolve(null);
            }
          } catch (e) {
            console.log("COULD NOT PARSE JSON");
            resolve(null);
          }
        } else {
          resolve(null);
        }
      })
      .catch(error => {
        console.log("ERRROR HERE ASYNC", error);
        reject(new Error("errored"));
      });
  });
}

export function cachedGenTimes(id, currState) {
  return new Promise(resolve => {
    AsyncStorage.getItem("LibGeneralTimes")
      .then(info => {
        if (info) {
          try {
            const parsed = JSON.parse(info);
            const dateId = moment(currState[0].time).format("YYYYMMDD");
            if (parsed[id + dateId].validUntil > moment().unix()) {
              for (
                let i = 0;
                i < parsed[id + dateId].generalTimes.length;
                ++i
              ) {
                if (currState[i] && !currState[i].available) {
                  parsed[id + dateId].generalTimes[i].available = false;
                }
              }
              resolve(parsed[id + dateId].generalTimes);
            } else {
              resolve(false);
            }
          } catch (e) {
            // console.log("COULD NOT PARSE JSON",e)
            resolve(false);
          }
        } else {
          resolve(false);
        }
      })
      .catch(error => {
        console.log("ERRROR HERE ASYNC", error);
        resolve(false);
      });
  });
}

export function getCaps(n) {
  const caps = [];
  for (let i = 0; i < n; ++i) {
    caps.push({
      name: i + 1,
      id: i + 1
    });
  }
  return caps;
}

export function getDates(n) {
  const baseDate = moment(moment().format("YYYY-MM-DD"));
  const dates = [];
  for (let i = 0; i < n; ++i) {
    dates.push({
      name: baseDate.format("dddd, MMM D, YYYY"),
      id: baseDate.unix()
    });
    baseDate.add(1, "days");
  }
  return dates;
}

export function areConsecutive(timesArray) {
  const len = timesArray.length;
  let lastSelectedIndex = -1;
  for (let i = 0; i < len; ++i) {
    if (timesArray[i].selected) {
      if (lastSelectedIndex !== -1 && i - lastSelectedIndex > 1) {
        return false;
      }
      lastSelectedIndex = i;
    }
  }
  return true;
}

export function atLeastOneAvail(allTimes) {
  const len = allTimes.length;

  for (let i = 0; i < len; ++i) {
    if (allTimes[i].available) {
      return true;
    }
  }

  return false;
  
}

export function resetWithIndex(timesArray, selectedIndex) {
  const len = timesArray.length;
  for (let i = 0; i < len; ++i) {
    timesArray[i].selected = false;
  }
  timesArray[selectedIndex].selected = true;
  return timesArray;
}

export function checkSelects(timesArray) {
  const len = timesArray.length;

  for (let i = 0; i < len; ++i) {
    if (timesArray[i].selected) {
      return true;
    }
  }
  return false;
}

export function generateTimeSlots(
  props,
  disableSelected = false,
  myTimes = []
) {
  const avail = props.availability;

  const startHour = props.libHours ? props.libHours.open : 7;
  const endHour = props.libHours ? props.libHours.close : 23;

  let startTime = moment(avail[0]).set({
    hour: startHour,
    minute: 0,
    seconds: 0
  });
  const endTime = moment(avail[0]).set({
    hour: endHour,
    minute: 0,
    seconds: 0
  });
  const generalTimes = [];
  let checkIndex = 0;
  while (endTime.unix() > startTime.unix()) {
    let availFlag = false;
    let forceUnavail = true;
    if (moment(avail[checkIndex]).unix() === startTime.unix()) {
      checkIndex++;
      availFlag = true;
    }
    if (disableSelected) {
      for (let m = 0; m < myTimes.length; ++m) {
        if (startTime.unix() * 1000 === myTimes[m]) {
          forceUnavail = false;
        }
      }
    }
    generalTimes.push({
      formattedTime: startTime.format("h:mm a"),
      time: startTime.unix() * 1000,
      available: disableSelected ? forceUnavail : availFlag,
      selected: false
    });
    startTime = startTime.add(30, "minutes");
  }
  return generalTimes;
}

export function combineRespAndCache(resp, cachedRooms) {
  const allIds = {};
  const keyedRooms = {};
  let returnInfo = [];
  // console.log("START", resp, cachedRooms);
  if (cachedRooms !== null) {
    for (let i = 0; i < resp.length; ++i) {
      allIds[resp[i].booking_id] = {
        resp: true,
        cached: false
      };
      keyedRooms[resp[i].booking_id] = resp[i];
    }
    for (let i = 0; i < cachedRooms.length; ++i) {
      if (allIds[cachedRooms[i].booking_id]) {
        keyedRooms[`${cachedRooms[i].booking_id}-c`] = cachedRooms[i];
        allIds[cachedRooms[i].booking_id].cached = true;
      } else {
        keyedRooms[cachedRooms[i].booking_id] = cachedRooms[i];
        allIds[cachedRooms[i].booking_id] = {
          resp: false,
          cached: true
        };
      }
    }
    // console.log("ALL KEYS", allIds, keyedRooms);
    // eslint-disable-next-line no-restricted-syntax
    for (const key in allIds) {
      if (allIds[key].resp && allIds[key].cached) {
        // console.log("KEY", key, "WAS IN RESPONSE");
        if (keyedRooms[`${key}-c`].status === "pendingCancellation") {
          // console.log("KEY", key, "IS PENDING CANCELLATION");
          returnInfo.push({
            ...keyedRooms[key],
            waitingForCancel: true
          });
        } else {
          // console.log("KEY", key, "IS NOT PENDING CANCELLATION");
          returnInfo.push(keyedRooms[key]);
        }
      } else if (allIds[key].resp && !allIds[key].cached) {
        // console.log("KEY", key, "WAS IN RESPONSE, BUT NOT IN CACHE");
        returnInfo.push(keyedRooms[key]);
      } else if (!allIds[key].resp && allIds[key].cached) {
        // console.log("KEY", key, "WAS IN NOT RESPONSE, BUT IN CACHE");
        if (keyedRooms[key].status !== "pendingCancellation") {
          returnInfo.push({
            ...keyedRooms[key],
            waitingForConfirm: true
          });
        }
      }
    }

    returnInfo = returnInfo.sort(function(a, b) {
      return moment(a.fromDate).unix() - moment(b.fromDate).unix();
    });
    // console.log("SENDING BACK", returnInfo);
    return returnInfo;
  } else {
    return resp;
  }
}

export function cacheTimes(update, id) {
  return new Promise(function(resolve, reject) {
    AsyncStorage.getItem("LibGeneralTimes").then(info => {
      const newInfo = {};
      try {
        const temp = JSON.parse(info);
        // eslint-disable-next-line no-restricted-syntax
        for (const key in temp) {
          if (temp[key].validUntil > moment().unix()) {
            newInfo[key] = temp[key];
          }
        }
      } catch (error) {
        console.log("Cound not parse general times async");
      }
      newInfo[id + update.date] = update;
      // console.log("NEW INFO", newInfo);
      AsyncStorage.setItem("LibGeneralTimes", JSON.stringify(newInfo))
        .then(() => {
          // console.log("Successfully updated general times");
          resolve("done");
        })
        .catch(err => {
          // console.log("Failed setting", err);
          reject(new Error("fail"));
        });
    });
  });
}

export function cacheRoom(newRoom) {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem("StudyRoomReservations").then(info => {
      let parsedInfo = [];
      try {
        parsedInfo = JSON.parse(info);
      } catch (e) {
        console.log("Failed parsing");
      }
      parsedInfo.push({
        ...newRoom,
        hasBeenConfirmed: 0
      });
      AsyncStorage.setItem("StudyRoomReservations", JSON.stringify(parsedInfo))
        .then(() => {
          // console.log("Successfully updated rooms");
          resolve("done");
        })
        .catch(err => {
          console.log("Failed setting rooms", err);
          reject(new Error("fail"));
        });
    });
  });
}

export function markIdForCancellation(id) {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem("StudyRoomCancellations").then(info => {
      let parsedInfo = [];
      try {
        parsedInfo = JSON.parse(info);
      } catch (e) {
        console.log("Failed parsing");
      }
      // console.log("Marking for cancel", id, parsedInfo);
      let found = false;
      for (let i = 0; i < parsedInfo.length; ++i) {
        if (parsedInfo[i].booking_id === id) {
          found = true;
        }
      }
      if (!found) {
        parsedInfo.push({
          booking_id: id,
          times: 0,
          validUntil: moment()
            .add(5, "minutes")
            .unix()
        });
      }
      // console.log("Marking for cancel done", id, parsedInfo);
      AsyncStorage.setItem("StudyRoomCancellations", JSON.stringify(parsedInfo))
        .then(() => {
          // console.log("Successfully updated rooms");
          resolve("done");
        })
        .catch(err => {
          console.log("Failed setting rooms", err);
          reject(new Error("fail"));
        });
    });
  });
}

export function verifyWithAsync(apiResp) {
  return new Promise(resolve => {
    AsyncStorage.multiGet(["StudyRoomReservations", "StudyRoomCancellations"])
      .then(resp => {
        let reservations = [];
        let cancellations = [];
        // console.log("REPONSE", resp);
        try {
          if (resp[0][1]) {
            reservations = JSON.parse(resp[0][1]);
          }
        } catch (e) {
          reservations = [];
        }
        try {
          if (resp[1][1]) {
            cancellations = JSON.parse(resp[1][1]);
          }
        } catch (e) {
          cancellations = [];
        }
        // console.log("RESPONSE FROM ASYNC", reservations, cancellations);
        // console.log("FULL API RESPONSE", apiResp);
        const keyedReservations = {};
        const keyedCancellations = {};
        const keepCancels = [];
        const keepReservations = [];
        // Key response of cached rooms for easier access
        for (let i = 0; i < reservations.length; ++i) {
          keyedReservations[reservations[i].booking_id] = {
            index: i,
            found: false
          };
        }
        // Key response of cancelled rooms for easier access
        for (let i = 0; i < cancellations.length; ++i) {
          keyedCancellations[cancellations[i].booking_id] = {
            ...cancellations[i],
            index: i
          };
        }
        for (let i = 0; i < apiResp.length; ++i) {
          if (keyedCancellations[apiResp[i].booking_id]) {
            const { index } = keyedCancellations[apiResp[i].booking_id];

            if (apiResp[i].status.indexOf("Cancelled") === -1) {
              cancellations[index].times++;
            }
            if (
              cancellations[index].times < 10 &&
              cancellations[index].validUntil > moment().unix()
            ) {
              apiResp[i].waitingForCancel = true;
              apiResp[i].status = "Confirmed";
              keepCancels.push(cancellations[index]);
            }
          }
          if (keyedReservations[apiResp[i].booking_id]) {
            keyedReservations[apiResp[i].booking_id].found = true;
          }
        }
        apiResp = apiResp.filter(function(item) {
          return item.status === "Confirmed";
        });
        // eslint-disable-next-line no-restricted-syntax
        for (const key in keyedReservations) {
          const temp = reservations[keyedReservations[key].index];
          if (!keyedReservations[key].found) {
            apiResp.push({
              ...temp,
              waitingForConfirm: true
            });
            keepReservations.push(temp);
          } else if (
            temp.hasBeenConfirmed < 10 &&
            temp.validUntil > moment().unix()
          ) {
            temp.hasBeenConfirmed += 1;
            keepReservations.push(temp);
            for (let i = 0; i < apiResp.length; ++i) {
              if (apiResp[i].booking_id === temp.booking_id) {
                apiResp[i].waitingForConfirm = true;
              }
            }
          }
        }

        AsyncStorage.multiSet([
          ["StudyRoomReservations", JSON.stringify(keepReservations)],
          ["StudyRoomCancellations", JSON.stringify(keepCancels)]
        ])
          .then(resp => {
            console.log("updated saves", resp);
          })
          .catch(err => {
            console.log("errored updated saves", err);
          });

        apiResp = apiResp.sort((a, b) => {
          return moment(a.fromDate).unix() - moment(b.fromDate).unix();
        });

        setCurrentRes(apiResp);
        resolve(apiResp);
      })
      .catch(err => {
        console.log("Errored with multiget", err);
        apiResp = apiResp.filter(item => {
          return item.status === "Confirmed";
        });
        setCurrentRes(apiResp);
        resolve(apiResp);
      });
  });
}

export function getTodaysRes(library, requestedDate) {
  const formattedDate = moment(requestedDate).format("YYYY-MM-DD");
  let runningTotal = 0;

  for (let i = 0; i < currentRes.length; ++i) {
    const resDate = moment(currentRes[i].fromDate).format("YYYY-MM-DD");
    const resLibrary = currentRes[i].libraryName;
    if (resLibrary === library && resDate === formattedDate) {
      const unixFrom = moment(currentRes[i].fromDate).unix();
      const unixTo = moment(currentRes[i].toDate).unix();

      runningTotal += (unixTo - unixFrom) / 60;
    }
  }

  return runningTotal;
}

export function setCurrentRes(res) {
  console.log("SETTING RESERVATIONS", res);
  currentRes = res;
}

export function getCurrentRes() {
  return currentRes;
}
