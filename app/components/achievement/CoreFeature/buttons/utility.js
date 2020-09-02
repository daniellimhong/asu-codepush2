import {
  checkSaved,
  builders,
  buildEventNewsFlat,
  GetLikedEventsFlatQuery
} from "../../../../Queries";
import { tracker } from "../../google-analytics.js";

// saveEventNewsFlat (item,action,path)
/**
 * Save an item to your schedule or deactivate it
 * @param {*} invoker
 * @param {*} input
 */
export function save(mutateData, previousScreen, previousSection) {
  const data = { ...mutateData.data };

  const path = data.key;
  try {
    mutateData.SetToast("Event added to Calendar");
    let flatData = generateFlatData(data, data.key);
    flatData = buildEventNewsFlat(flatData);
    mutateData.saveEventPure(flatData);
  } catch (e) {
    console.log(e);
  }
  var target_id = (isNaN(path))?data.url.replace("https://",""):path.toString();
  mutateData.sendAnalytics({
    "action-type": "click",
    "starting-screen": previousScreen?previousScreen:null,
    "starting-section": previousSection?previousSection:null,
    "target":"Add to Calender",
    "resulting-screen": previousScreen,
    "resulting-section": null,
    "target-id": target_id,
    "action-metadata":{
      "target-id": target_id,
      "key": path,
      "type": data.feed_type
    }
  });
  let myType = `, type: ${mutateData.feed_type}`;
  if (myType === `, type: ${undefined}`) {
    myType = "";
  }
  tracker.trackEvent("Click", `CFCard_save_Item - key: ${path}${myType}`);
}

export function remove(mutateData, previousScreen, previousSection) {
  mutateData
    .removeEventPure(mutateData.data)
    .then(resp => {
      mutateData.SetToast("Event removed from Calendar");
    })
    .catch();
    const data = { ...mutateData.data };
      mutateData.SetToast("Event removed from Calendar");
      var target_id = (isNaN(data.key))?data.url.replace("https://",""):data.key.toString();
      mutateData.sendAnalytics({
        "action-type": "click",
        "starting-screen": previousScreen?previousScreen:null,
        "starting-section": previousSection?previousSection:null,
        "target":"Remove from Calender",
        "resulting-screen": previousScreen,
        "resulting-section": null,
        "target-id": target_id,
        "action-metadata":{
          "target-id": target_id,
          "key": data.key,
          "type": data.feed_type
        }
      });
}

/**
 * Get the font awesome icon related to a schedule item being either disabled or enabled
 *
 * @param {*} data
 * @param {*} likedItems
 */
export function getCalendarButton(data, eventSchedule) {
  if (checkSaved(data.key, eventSchedule)) {
    return (faButton = "calendar-check-o");
  } else {
    return (faButton = "calendar-plus-o");
  }
}

/**
 * Returns the action that the calendar button should do based on the provided data and the currently
 * scheduled events
 */
export function getCalendarButtonAction(data, eventSchedule) {
  if (checkSaved(data.key, eventSchedule)) {
    return (scheduleaction = "remove");
  } else {
    return (scheduleaction = "save");
  }
}

export function like(mutateData, previousScreen, previousSection) {
  const data = { ...mutateData.data };

  const flatData = generateFlatData(data, data.key);
  mutateData.likeActivityPure(flatData).catch(e => {
    console.log("Like failure", e);
  });
  // sendAnalytics(mutateData);
  const path = data.key;
  var target_id = (isNaN(path))?data.url.replace("https://",""):path.toString();
  mutateData.sendAnalytics({
    "action-type": "click",
    "starting-screen": previousScreen?previousScreen:null,
    "starting-section": previousSection?previousSection:null,
    "target":"Like",
    "resulting-screen": previousScreen,
    "resulting-section": null,
    "target-id": target_id,
    "action-metadata":{
      "target-id": target_id,
      "key": data.title,
      "type": data.feed_type
    }
  });
}

export function dislike(mutateData, previousScreen, previousSection) {
  const data = { ...mutateData.data };
  mutateData.dislikeActivityPure(data).catch(e => {
    console.log(e);
  });
  // sendAnalytics(mutateData);
  const path = data.key;
  var target_id = (isNaN(path))?data.url.replace("https://",""):path.toString();
  mutateData.sendAnalytics({
    "action-type": "click",
    "starting-screen": previousScreen?previousScreen:null,
    "starting-section": previousSection?previousSection:null,
    "target":"Dislike",
    "resulting-screen": previousScreen,
    "resulting-section": null,
    "target-id": target_id,
    "action-metadata":{
      "target-id": target_id,
      "key": data.title,
      "type": data.feed_type
    }
  });
}

/*
  let action = getAction(data.key, invoker.props.likedItems);

  if(action == "save"){
    saved = 'heart';
  } else {
    saved = 'heart-o';
  }
*/
export function getLikeButton(data, likedItems) {
  if (checkSaved(data.key, likedItems)) {
    return (favButton = "heart");
  } else {
    return (favButton = "heart-o");
  }
}

export function getAction(key, likedItems) {
  let newsaction;
  if (checkSaved(key, likedItems)) {
    newsaction = "remove";
  } else {
    newsaction = "save";
  }

  return newsaction;
}

export function sendAnalytics(mutateData) {
  const data = { ...mutateData.data };
  const action = getAction(data.key, mutateData.likedItems);
  // Commented as not used
  // mutateData.sendAnalytics({
  //   eventName: `CFCard_${action}_Item`,
  //   eventType: "click",
  //   addnData: {
  //     key: data.title,
  //     type: mutateData.feed_type
  //   }
  // });
}

/**
 * Flatten out the news/event data we receive so that it works with the schema.
 * @param {*} data
 * @param {*} path
 * @param {*} active
 */
export function generateFlatData(data, path) {
  flatData = {
    feed_type: data.feed_type,
    id: path,
    active: "1"
  };

  flatData.starttime = data.startTime ? data.startTime : data.starttime;
  flatData.endtime = data.endTime ? data.endTime : data.endtime;
  flatData.location = data.location;
  flatData.description = data.description;
  flatData.map_title =
    data.map_title && data.map_title[0] ? data.map_title[0] : null;
  flatData.map_type = data.map_type;
  flatData.map_lat =
    data.map_coords && data.map_coords.lat ? data.map_coords.lat : null;
  flatData.map_lng =
    data.map_coords && data.map_coords.lng ? data.map_coords.lng : null;
  flatData.key = data.key;
  flatData.nid = data.nid;
  flatData.picture = data.picture;
  flatData.teaser = data.teaser;
  flatData.title = data.title;
  flatData.url = data.url;
  flatData.category = data.category;
  flatData.interests = data.interests;
  flatData.rawDate = data.rawDate;
  flatData.newsDate = data.newsDate;

  Object.keys(flatData).forEach(function(key) {
    const val = flatData[key];
    if (val === "" || val == "undefined") {
      flatData[key] = null;
    }
  });

  return flatData;
}
