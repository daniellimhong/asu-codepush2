import moment from "moment";
import { LCProfile } from "./LCProfile";
import { LCWeather } from "./LCWeather";
import { LCNews } from "./LCNews";
import { LCEvents } from "./LCEvents";
import { LCMaps } from "./LCMaps";
import { LCMilestones } from "./LCMilestones";
import { LCCustom } from "./LCCustom";
import { LCSunDevilRewards } from "./LCSunDevilRewards";
import { LCCovidWellness } from "./LCCovidWellness";

export const deleteBrackets = (title) => {
  let cleanTitle = title;
  if (title && title[0] === "[") {
    cleanTitle = cleanTitle.slice(1, cleanTitle.length - 1);
  }
  return cleanTitle;
};

export const formatNews = (item) => {
  let format = {
    ...item,
    interests: item.field_interests,
    type: "News",
    feed_type: "news",
    key: item.title,
    picture: item.field_hero_image_url
      ? item.field_hero_image_url
      : "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/asu_sunburst_600.png",
    title: item.title,
    category: item.field_saf,
    description: item.body,
    teaser: item.field_news_teaser,
    url: item.field_original_url,
    rawDate: item.field_imported_created,
    newsDate: item.field_imported_created,
    date_time: item.date_time,
  };
  return format;
};

export const formatEvent = (item) => {
  let format = {
    ...item,
    type: item.type || "events",
    key: item.nid[0],
    nid: item.nid[0],
    picture: item.image_url[0]
      ? item.image_url[0]
      : "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/asu_sunburst_600.png",
    title: item.title[0] === "[" ? deleteBrackets(item.title) : item.title,
    location: item.locations ? item.locations[0] : "",
    description: item.full_body ? item.full_body[0] : "",
    teaser: item.body_summary ? item.body_summary[0] : "",
    url: item.alias ? item.alias[0] : "",
    startTime: item.start_date
      ? moment(item.start_date[0], "MMMDDYYYYhma").format()
      : "",
    endTime: item.end_date
      ? moment(item.end_date[0], "MMMDDYYYYhma").format()
      : "",
    map_title: item.map_title,
    map_coords: item.map_coords,
    map_type: item.map_type,
    feed_type: "event",
    eventType: item.event_type == "orgsync" ? "orgsync" : "regular",
    date_time: deleteBrackets(item.date_time),
  };
  return format;
};

export const objIsEmpty = (obj) =>
  Object.keys(obj).length === 0 && obj.constructor === Object;

export const createEntry = (card, invoker) => {
  let whichCardComponent;
  switch (card.type) {
    case "Weather":
      whichCardComponent = LCWeather;
      break;
    case "Profile":
      whichCardComponent = LCProfile;
      break;
    case "Maps":
      whichCardComponent = LCMaps;
      break;
    case "News":
      whichCardComponent = LCNews;
      break;
    case "Events":
      whichCardComponent = LCEvents;
      break;
    case "Milestones":
      whichCardComponent = LCMilestones;
      break;
    case "SunDevilRewards":
      whichCardComponent = LCSunDevilRewards;
      break;
    case "CovidWellness":
      whichCardComponent = LCCovidWellness;
      break;
    case "Custom":
      if (card.articleData && card.articleData.title === "Career Milestones") {
        whichCardComponent = LCMilestones;
      } else {
        whichCardComponent = LCCustom;
      }
      break;
    default:
      whichCardComponent = LCCustom;
  }

  let location = {
    latitude: invoker.state.lat,
    longitude: invoker.state.lng,
  };
  // console.log("LOCATION FROM CARD",location)
  if (card.type === "News" || card.type === "Events") {
    newCard = {
      card: whichCardComponent,
      navigation: invoker.props.navigation,
      location: location,
      order: card.order,
      data: card,
      ...card,
    };
  } else if (
    card.type === "Milestones" ||
    (card.type === "Custom" && card.articleData.title === "Career Milestones")
  ) {
    newCard = {
      card: whichCardComponent,
      navigation: invoker.props.navigation,
      data: card,
      ...card,
      ...card.articleData,
      jwtToken: invoker.state.jwtToken,
      milestonesStatusData: invoker.state.milestonesStatusData,
      milestonesListData: invoker.state.milestonesListData,
      completionPercentage: invoker.state.completionPercentage,
      setMilestoneData: invoker.setMilestoneData,
      iSearchData: invoker.props.iSearchData,
      milestonesStartPage: invoker.state.milestonesStartPage,
    };
  } else if (card.type === "Custom") {
    newCard = {
      card: whichCardComponent,
      navigation: invoker.props.navigation,
      data: card,
      ...card,
      ...card.articleData,
    };
  } else if (card.type === "Profile") {
    newCard = {
      card: whichCardComponent,
      navigation: invoker.props.navigation,
      location: location,
      order: card.order,
      data: card,
      asurite: invoker.state.asurite,
    };
  } else {
    newCard = {
      card: whichCardComponent,
      navigation: invoker.props.navigation,
      location: location,
      order: card.order,
      data: card,
    };
  }
  return newCard;
};

export const isUrl = (string) => (string.includes("http") ? true : false);

export const addToObject = (obj, whatToAddArray, whichArray = ["roles"]) => {
  let myObj = obj;
  for (let i = 0; i < whatToAddArray.length; i++) {
    myObj[whichArray[i]] = whatToAddArray[i];
  }
  // console.log("what to send to live cards ", myObj);
  return myObj;
};

export const createCardId = (name) => {
  if (name) {
    let lowerCaseName = name.toLowerCase();
    let allNormalCharacters = lowerCaseName.replace(
      /(^\s+|[^a-zA-Z0-9 ]+|\s+$)/g,
      ""
    );
    let finalName = allNormalCharacters.replace(/\s+/g, "-");
    if (finalName.length > 40) {
      finalName = finalName.slice(0, 40);
    }
    return finalName;
  } else {
    return "unknown-title";
  }
};
