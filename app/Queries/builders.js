export const buildEventNewsFlat = input => {
  if (typeof input == "object") {
    let Event_News_Flat = { ...Event_News_Flat_Base };

    Object.keys(input).map(function(inputKey, index) {
      var inputValue = input[inputKey];

      if (
        typeof Event_News_Flat[inputKey] !== "undefined" &&
        (inputValue !== null && inputValue !== undefined)
      ) {
        Event_News_Flat[inputKey] = inputValue;
      }
    });

    return Event_News_Flat;
  }
};

const Event_News_Flat_Base = {
  endtime: null,
  active: null,
  id: null,
  timestamp: null,
  starttime: null,
  location: null,
  title: null,
  url: null,
  description: null,
  key: null,
  map_title: null,
  map_type: null,
  picture: null,
  teaser: null,
  map_lat: null,
  map_lng: null,
  nid: null,
  category: null,
  interests: null,
  date: null,
  rawDate: null,
  feed_type: null,
  __typename: "Event_News_Flat"
};
