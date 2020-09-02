import { AsyncStorage, Platform } from "react-native";

import { Api } from "../api";

import PropTypes from "prop-types";
import DeviceInfo from "react-native-device-info";

const baseUrl = "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod";
const msgCtrUrl = baseUrl + "/msgctr";
const tokenUrl = baseUrl + "/tokenpref";

const TEST_URL = "https://8f7t1x8968.execute-api.us-east-1.amazonaws.com/test";
// const TEST_MSGS =

const secureApi = "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod";
const configs = { service: "execute-api", region: "us-east-1" };

export const User = async msg => {
  // console.log('calling user service from ',msg);
  var value, collect;
  try {
    value = await AsyncStorage.getItem("username").then(values => {
      collect = values;
    });
  } catch (error) {
    console.log("Error: ", error);
  }
  return collect;
};

export const getUnreadNotifications = async () => {
  // console.log('calling UnreadNotifications service');
  var value, collect;
  try {
    value = await AsyncStorage.getItem("@unreadNots").then(values => {
      collect = values;
    });
  } catch (error) {
    console.log("Error: ", error);
  }
  return parseInt(collect);
};

export const setUnreadNotifications = async d => {
  // console.log("SETTING UNREAD: ",d);
  if (d != null) {
    await AsyncStorage.setItem("@unreadNots", d.toString())
      // .then(resp => console.log("Successfully stored unread details"))
      .catch(error => console.log("error storing", error));
  }
};

export const updateUnreadNotifications = async (getTokens, msg) => {
  var update = 0;
  var unreadNotsPayload = {
    operation: "getInitalUnreadCount",
    appId: "edu.asu.asumobileapp",
    uuid: DeviceInfo.getUniqueID()
  };

  await getTokens()
    .then(async tokens => {
      if (tokens.username && tokens.username !== "guest") {
        let apiService = new Api(baseUrl, tokens, configs);
        await apiService
          .post("/msgctr-secure", unreadNotsPayload)
          .then(async resp1 => {
            await setUnreadNotifications(resp1);
          })
          .catch(error => {
            throw error;
          });
      }
    })
    .catch(async err => {
      await fetch(msgCtrUrl, {
        method: "POST",
        body: JSON.stringify(unreadNotsPayload)
      })
        .then(response => response.json())
        .then(responseJson => {
          setUnreadNotifications(responseJson);
        });
    });
};

export const getMsgData = async msg => {
  var value, collect;
  try {
    value = await AsyncStorage.getItem("@messageData").then(values => {
      collect = values;
    });
  } catch (error) {
    console.log("Error: ", error);
  }
  return collect;
};

export const setMsgData = async (d, msg) => {
  if (typeof d == "string") {
    await AsyncStorage.setItem("@messageData", d)
      // .then(json => console.log("Successfully stored message details"))
      .catch(error => console.log("error storing"));
  } else {
    await AsyncStorage.setItem("@messageData", JSON.stringify(d))
      // .then(json => console.log("Successfully stored message details"))
      .catch(error => console.log("error storing"));
  }
};

export const updateMsgData = async (getTokens, msg) => {
  var items;
  var payload = {
    operation: "getUserNotifications",
    platform: Platform.OS,
    appId: "edu.asu.asumobileapp",
    uuid: DeviceInfo.getUniqueID(),
    item: msg
  };
  await getTokens()
    .then(async tokens => {
      if (tokens.username && tokens.username !== "guest") {
        let apiService = new Api(baseUrl, tokens, configs);
        await getData(apiService, payload);
      } else {
        fetch(msgCtrUrl, {
          method: "POST",
          body: JSON.stringify(payload)
        }).then(resp => {
          setMsgData(resp._bodyInit);
        });
      }
    })
    .catch(err => {
      fetch(msgCtrUrl, {
        method: "POST",
        body: JSON.stringify(payload)
      }).then(resp => {
        setMsgData(resp._bodyInit);
      });
    });
};

const getData = async (apiService, payload) => {
  await apiService
    .post("/msgctr-secure", payload)
    .then(resp1 => {
      setMsgData(resp1);
    })
    .catch(error => {
      console.log("HITTING THHS ERROR", err);
      throw error;
    });
};
