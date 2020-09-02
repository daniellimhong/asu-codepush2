import React from "react";
import {
  Platform,
  AsyncStorage,
  DeviceEventEmitter,
  NativeAppEventEmitter,
  PushNotificationIOS,
  NativeEventEmitter,
  NativeModules,
  AppRegistry,
  Linking,
  Share
} from "react-native";

import {
  Api,
  Auth
} from "../../../services";

import DeviceInfo from "react-native-device-info";
const { RNNotificationActions } = NativeModules;
import PushNotification from "react-native-push-notification";

const baseUrl = "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod";
const msgCtrUrl = baseUrl + "/msgctr";
const tokenUrl = baseUrl + "/tokenpref";

const secureApi = "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod";
const configs = { service: "execute-api", region: "us-east-1" };
const testBaseUrl = "https://dz0qr7yoti.execute-api.us-east-1.amazonaws.com/dev";
const refreshUrl = "https://mcuwjen7gc.execute-api.us-west-2.amazonaws.com/prod/orefresh";

const AUTO_FAIL_REPLY = "Message could not be delievered";
const AUTO_FAIL_INVITE_REPLY = "Reponse could not be delivered";

import Permissions from "react-native-permissions";

const actionEvents = new NativeEventEmitter(RNNotificationActions);

var navigation = null;

export function setNavigation(nav) {
  navigation = nav;
}

function universalReply( data ) {

  Auth().getSession("edu.asu.asumobileapp",refreshUrl).then( tokens => {

    let apiService = new Api(testBaseUrl, tokens, configs);

    if( data.message && data.message.length > 200 ) {
      informError(data.chatId,data.title,AUTO_FAIL_REPLY);
    } else {
      if ( tokens ) {

        var payload = {
          operation: "response",
          response: data.message,
          chatId: data.chatId,
          recipient: data.sender
        }

        apiService
          .post("/chat", payload)
          .then( resp => {
            if( resp.errorMessage && data) {

              informError(data.chatId,data.title,AUTO_FAIL_REPLY);

            }
          })
          .catch(error => {

            fetch(testBaseUrl+"/chat", {
              method: "POST",
              body: JSON.stringify({"errored":error})
            });

            if( data ) {
              informError(data.chatId,data.title,AUTO_FAIL_REPLY);
            }

          });

      } else {
        console.log("Guest");

        fetch(testBaseUrl+"/chat", {
          method: "POST",
          body: JSON.stringify({"errored":"no tokens"})
        });

        if( data ) {
          informError(data.chatId,data.title,AUTO_FAIL_REPLY);
        }

      }
    }

  }).catch( err => {
    console.log("Session error", err);

    fetch(testBaseUrl+"/chat", {
      method: "POST",
      body: JSON.stringify({"errored":err})
    });

    if( data ) {
      informError(data.chatId,data.title,AUTO_FAIL_REPLY);
    }

  })

}

function informError(id,title,message) {

  // console.log("Preseinging",id);

  var notifPayload = {
    pushId: id,
    title: title,
    message: message,
    identifier: id
  };

  if( Platform.OS == "ios" ) {

    notifPayload["apns-collapse-id"] = id;

    notifPayload.aps = {
      "apns-collapse-id": id,
      "content-available": 1,
      identifier: id,
      "alert": {
        "body": message,
        "title": message,
        identifier: id,
        "apns-collapse-id": id
      }
    }
  }

  PushNotification.localNotification(notifPayload);
}

function universalAction(data) {

  // console.log("HAVE ACTION DATA",data);

    var payload = {
      operation: "actionButton",
      deviceId: DeviceInfo.getUniqueID(),
      pushId: data.notification.pushId,
      action: data.notification.action
    };
    saveAction(payload);
    tryOpenLink(data);
    setOpenPage(data);

    // console.log("Checking owner group",data.notification.ownerGroup)

    if( data.notification.ownerGroup === "chatInvite" ) {
      saveInviteResponse(data,"Invite");
    } else if ( data.notification.ownerGroup === "auto_friends" ) {
      saveInviteResponse(data,"Friend");
    }

}

function universalSilentFunction( data ) {

console.log("Krista: Hitting universal",data);
  switch( data.type ) {
    case "deviceInfo":
      deviceInfo(data);
      break;
    case "clearCache":
      clearCache();
      break;
    case "updateCache":
      updateCache();
      break;
    case "covidPreferences":
      covidPreferences(data);
      break;
    case "updateLocation":
      updateLocation(data);
      break;

  }

}

function covidPreferences(payload) {
  console.log("IS HITTING COVID PREFS:",payload);
  let data = payload.extraData;
  try {
    data = JSON.parse(payload.extraData);
  } catch(e) {}
  if (data.type == "all") {
    PushNotification.cancelAllLocalNotifications();
  } else {
    if (typeof data.ids != "undefined") {
      payload.ids.map((id) => {
        PushNotification.cancelLocalNotifications({
          id: id
        });
      });
    }
  }
}

function saveAction(payload) {

  Auth().getSession("edu.asu.asumobileapp",refreshUrl).then( tokens => {

    if (tokens.username && tokens.username !== "guest") {

      let apiService = new Api(baseUrl, tokens, configs);
      apiService
        .post("/msgctr", payload)
        .catch(error => {
          console.log(error);
        });

    } else {

      fetch(msgCtrUrl, {
        method: "POST",
        body: JSON.stringify(payload)
      });

    }

  }).catch( err => {
    console.log("Session error", err);
  });

}

function tryOpenLink(data) {

  if (data.notification.action == "ShareNow") {
    var content = {
      message: data.notification.body,
      title: data.notification.title
    };
    Share.share(content);
  } else {
    if (data.notification.linkToOpen) {
      Linking.canOpenURL(data.notification.linkToOpen).then(supported => {
        if (supported) {
          Linking.openURL(data.notification.linkToOpen);
        } else {
          console.log("Don't know how to open URI");
        }
      });
    }
  }
}

function setOpenPage(data) {

  if (
    (!data.notification.pushPage ||
      data.notification.pushPage === false ||
      data.notification.pushPage === "false") &&
    (data.notification.goToPage &&
    data.notification.goToPage != "")
  ) {
    //Set extraData to not null or undefined
    //Bug with react native that won't set it if null or undefined
    if (!data.notification.extraData) data.notification.extraData = "{}";
    AsyncStorage.multiSet([
      ["goToPage", data.notification.goToPage],
      ["actionsData", data.notification.extraData]
    ]).then(
      resp => {
        console.log("PROPS.DATA.STATE: ", data.notification.goToPage,data.notification.extraData);
      },
      err => console.log("ERROR STORING ", err)
    );
  }
}

function saveInviteResponse(data,ender) {

  Auth().getSession("edu.asu.asumobileapp",refreshUrl).then( tokens => {

    let apiService = new Api(testBaseUrl, tokens, configs);

    if ( tokens ) {

      var responseAction = "ignore"+ender;

      if( data.notification.action == "Accept" ) responseAction = "accept"+ender;

      var payload = {
        operation: responseAction,
        chatId: data.notification.pushId
      }

      apiService
        .post("/chat", payload)
        .then( resp => {
          if( resp.errorMessage && data) {

            informError(data.notification.pushId,data.notification.title,AUTO_FAIL_INVITE_REPLY);

          }
        })
        .catch(error => {

          fetch(testBaseUrl+"/chat", {
            method: "POST",
            body: JSON.stringify({"errored":error})
          });

          if( data ) {
            informError(data.notification.pushId,data.notification.title,AUTO_FAIL_INVITE_REPLY);
          }

        });

    } else {

      fetch(testBaseUrl+"/chat", {
        method: "POST",
        body: JSON.stringify({"errored":"no tokens"})
      });

      if( data ) {
        informError(data.notification.pushId,data.notification.title,AUTO_FAIL_INVITE_REPLY);
      }

    }

  }).catch( err => {
    console.log("Session error", err);

    fetch(testBaseUrl+"/chat", {
      method: "POST",
      body: JSON.stringify({"errored":err})
    });

    if( data ) {
      informError(data.notification.pushId,data.notification.title,AUTO_FAIL_INVITE_REPLY);
    }

  })

}

function deviceInfo(data) {

  var buildNum = DeviceInfo.getBuildNumber();
  var appVersion = DeviceInfo.getVersion();

  var installTime = DeviceInfo.getFirstInstallTime();
  var lastUpdate = DeviceInfo.getLastUpdateTime();

  var apiLevel = null;

  if( Platform.OS == "ios" ) {
    var holder = buildNum;
    buildNum = appVersion;
    appVersion = holder;

    installTime = data.installTime;
    lastUpdate = data.lastUpdate;
  } else {
    apiLevel = DeviceInfo.getApiLevel();
  }

  var payload = {
    operation: "deviceInfo",
    uuid: DeviceInfo.getUniqueID(),
    country: DeviceInfo.getDeviceCountry(),
    model: DeviceInfo.getModel(),
    osVersion: DeviceInfo.getSystemVersion(),
    device: DeviceInfo.getDeviceId(),
    timezone: DeviceInfo.getTimezone(),
    installTime: installTime,
    lastUpdate: lastUpdate,
    apiLevel: apiLevel,
    appVersion: appVersion,
    versionCode: buildNum,
    permissions: data.permissions
  }

  saveInfo(payload);

}

function clearCache() {
  //AppSyncClients clearstore
  AsyncStorage.setItem("clearCache","true").then(
    resp => {
      console.log("Successfully set to clear cache on next open");
    },
    err => console.log("ERROR STORING ", err)
  );

}

function updateCache() {

}

function inappMove(data) {

  // console.log("Dismissing: 123 ",data.notification);

  var pPage = data.notification.pushPage;
  var goToPage = data.notification.goToPage;

  if( !data.notification.extraData) {
      data.notification.extraData = "{}"
  }

  if( (!pPage || pPage == "false" || pPage === false) ) {
    navigation("Actions",{pushData: data.notification});
  } else if ( (pPage || pPage == "true" || pPage === true) && goToPage ) {
    navigation(data.notification.goToPage, JSON.parse(data.notification.extraData));
  }

}

//Just iOS Will hit this
function updateLocation(data) {

  var payload = {
    operation: "location",
    lat: data.latitude,
    lon: data.longitude
  }

  fetch("https://dz0qr7yoti.execute-api.us-east-1.amazonaws.com/dev/test", {
    method: "POST",
    body: JSON.stringify(payload)
  });

}

function saveInfo(payload) {

  Auth().getSession("edu.asu.asumobileapp",refreshUrl).then( tokens => {

    if (tokens.username && tokens.username !== "guest") {

      let apiService = new Api("https://dz0qr7yoti.execute-api.us-east-1.amazonaws.com/dev", tokens, configs);
      apiService
        .post("/test", payload)
        .catch(error => {
          console.log(error);
        });

    } else {

      fetch("https://dz0qr7yoti.execute-api.us-east-1.amazonaws.com/dev/test", {
        method: "POST",
        body: JSON.stringify(payload)
      });

    }

  }).catch( err => {
    console.log("Session error", err);
  });

}

const notificationActionHandler = async data => {

  // console.log("Action Data", data);
  universalAction(data);

};

const replyActionHandler = async data => {

  // console.log("Reply Data", data);
  universalReply(data);

};

const silentUniversalHandler = async data => {
  console.log("Silent Data", data);
  universalSilentFunction(data.notification);
}

actionEvents.addListener('notificationSilentReceived', (data) => {
  console.log("HITTING SILENT FUNCTION",data);
  universalSilentFunction(data);
});

actionEvents.addListener('notificationReplyReceived', (data) => {
  universalReply(data);
});

actionEvents.addListener('notificationActionReceived', (data) => {

  var info = {
    notification: data.userInfo
  }
  info.notification.action = data.identifier;
  info.notification.linkToOpen = data.linkToOpen;
  PushNotificationIOS.setApplicationIconBadgeNumber(0);

  universalAction(info);
});

actionEvents.addListener('inappNotificationTapped', (data) => {

  // console.log("Dismissed: ",data);
  var info = {
    notification: data
  }
  inappMove(info);
});

//Set headless task (android only);
AppRegistry.registerHeadlessTask("RNPushNotificationActionHandlerTask", () => {
  return notificationActionHandler;
});

AppRegistry.registerHeadlessTask("RNPushNotificationReplyTask", () => {
  return replyActionHandler;
});

AppRegistry.registerHeadlessTask("RNPushNotificationSilentTaskAndroid", () => {
  return silentUniversalHandler;
});
