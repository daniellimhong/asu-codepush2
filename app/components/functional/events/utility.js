import moment from "moment";
import moment2 from "moment-timezone";

export function mapEventToCard(event) {
  return {
    key: generateEventKey(event),
    feed_type: "event",
    title: event.title && event.title[0] ? event.title[0] : null,
    nid: event.nid && event.nid[0] ? event.nid[0] : null,
    start_date:
      event.start_date && event.start_date[0]
        ? moment(event.start_date[0], "MMMDDYYYYhma").format("dddd Do")
        : null
  };
}

export function large(index) {
  return index % 5 === 0;
}

export function getStringDate(data) {
  const startTime = moment(data.start_date[0], "MMMDDYYYYhma");
  const eventTimeASU = startTime;
  const eventUTC = moment.utc(eventTimeASU);
  const eventLocal = eventUTC.local();

  const endTime = moment(data.end_date[0], "MMMDDYYYYhma");
  const eventEndUTC = moment.utc(endTime);
  const eventEndLocal = eventEndUTC.local();

  let zone1 = moment2.tz.guess();
  zone1 = moment2.tz(zone1).format("z");

  let stringDate = "";
  // if there is no specific time do not display 12:00 am display just date instead
  if (startTime.format("h:mm a") === "12:00 am") {
    stringDate = "";
  } else if (endTime.format("h:mm a") === "") {
    stringDate = `${moment(eventLocal).format("h:mm a")} ${zone1}`;
  } else {
    zone1 = zone1[0] !== "-" ? zone1 : "MST";
    stringDate = `${moment(eventLocal).format("h:mm a")} ${zone1} - ${moment(
      eventEndLocal
    ).format("h:mm a")} ${zone1}`;
  }
  return stringDate;
}

export function generateEventKey(item, feedId = null, index = null) {
  let title = "";
  let time = "";
  let location = "";
  if (item.title && item.title[0]) {
    title = item.title[0].replace(/\s/g, "");
  }
  if (item.start_date && item.start_date[0]) {
    time = moment(item.start_date[0], "MMMDDYYYYhma").format();
  }
  if (item.locations && item.locations[0]) {
    // eslint-disable-next-line prefer-destructuring
    location = item.locations[0];
  }
  return feedId + index + title + time + location;
}

export function generateEventSummary(data) {
  let summary = data.body_summary;
  if (Array.isArray(summary) && summary[0]) {
    summary =
      summary[0].length > 250 ? `${summary[0].slice(0, 250)}...` : summary[0];
  } else {
    summary = null;
  }
  return summary;
}

// Format for searching
export function formatRawEvent(item) {
  const { alias } = item;
  let url = "https://www.asu.edu";
  if (alias && alias[0]) {
    [url] = alias;
  } else if (item.event_type === "orgsync") {
    url = item.organization_website_url;
  }
  const format = {
    // type: 'event',
    feed_type: "event",
    nid: item.nid ? item.nid[0] : "no id",
    key: item.nid ? item.nid[0] : "no id",
    picture:
      item.image_url && item.image_url[0]
        ? item.image_url[0].replace(
            "asuevents.asu.edu",
            "d2wi8c5c7yjfp0.cloudfront.net"
          )
        : "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/asu_sunburst_600.png",
    title: item.title[0],
    location: item.locations ? item.locations[0] : "No Location Available",
    campuses: item.campus,
    description: item.full_body ? item.full_body[0] : "No Preview Available",
    teaser: item.body_summary ? item.body_summary[0] : "No Preview Available",
    url,
    startTime: moment(item.start_date[0], "MMMDDYYYYhma").format(),
    endTime: moment(item.end_date[0], "MMMDDYYYYhma").format(),
    map_title: item.map_title,
    map_coords: item.map_coords,
    map_type: item.map_type,
    eventType: item.event_type === "orgsync" ? "orgsync" : "regular",
    organization_name: item.organization_name,
    organization_website_url: item.organization_website_url
  };

  if (format.picture === "/assets/icons/portals/no_org_profile_100.png") {
    format.picture =
      "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/asu_sunburst_600.png";
  }

  return format;
}

export const filterClubs = (originalArray, filter) => {
  const arrayFilteredByCampus = [];
  originalArray.forEach(event => {
    if (filter === "all") {
      arrayFilteredByCampus.push(event);
    } else if (event.campuses && event.campuses.length) {
      event.campuses.forEach(campus => {
        if (campus === filter) {
          arrayFilteredByCampus.push(event);
        }
      });
    }
  });
  return arrayFilteredByCampus;
};
