import gql from "graphql-tag";
import { graphql, ApolloProvider, compose } from "react-apollo";
import { checkSaved } from "../Queries";

// /**
//  * Fire this when a user shows interest in an event, or anything for that matter.
//  * ID should be unique
//  */
// export const ShowEventInterestMutation = gql`
//     mutation ($event_id: String){
//         showEventInterest(event_id:$event_id)
//     }
// `;

// /**
//  * event_id: Number pertaining to event ID from source
//  * activity_type: academic/social
//  * activity: Event data
//  */
// export const EventCheckinMutation = gql`
//     mutation($event_id: String, $activity_type: String, $event_data: Event_Data_Input1) {
//         checkinActivityEvent(event_id: $event_id, activity_type: $activity_type, activity: $event_data){
//             timestamp
//             event_id
//             data {
//                 endtime
//                 location
//                 starttime
//                 title
//                 url
//                 id
//                 data {
//                   description
//                   endTime
//                   key
//                   location
//                   map_title
//                   map_type
//                   picture
//                   startTime
//                   teaser
//                   title
//                   type
//                   url
//                   map_coords {
//                     lat
//                     lng
//                   }
//                 }
//             feedType
//         }
//     }
// `;
export const GetEventCheckinCountQuery = gql`
  query($event_id: String) {
    getEventCheckinCountCacheOnly(event_id: $event_id)
  }
`;
export const GetAcademicCheckinsQuery = gql`
  query($count: Int, $nextToken: String) {
    getAcademicCheckins(count: $count, nextToken: $nextToken) {
      data {
        endtime
        starttime
        location
        title
        url
        description
        key
        map_title
        map_type
        picture
        teaser
        map_lat
        map_lng
        nid
        category
        interests
        date
        rawDate
        feed_type
        __typename
      }
      nextToken
      __typename
    }
  }
`;

export const GetFriendEventActivitiesQuery = gql`
  query(
    $count: Int
    $nextToken: String
    $asurite: String
    $activity_type: String
    $feed_type: String
    $filter_type: String
  ) {
    getFriendEventActivities(
      count: $count
      nextToken: $nextToken
      asurite: $asurite
      activity_type: $activity_type
      feed_type: $feed_type
      filter_type: $filter_type
    ) {
      data {
        endtime
        starttime
        location
        title
        url
        description
        key
        map_title
        map_type
        picture
        teaser
        map_lat
        map_lng
        nid
        category
        interests
        date
        rawDate
        feed_type
        __typename
      }
      nextToken
      __typename
    }
  }
`;

export const GetEventActivities = gql`
  query($count: Int, $nextToken: String) {
    getEventActivities(count: $count, nextToken: $nextToken) {
      data {
        endtime
        starttime
        location
        title
        url
        description
        key
        map_title
        map_type
        picture
        teaser
        map_lat
        map_lng
        nid
        category
        interests
        date
        rawDate
        feed_type
        __typename
      }
      nextToken
      __typename
    }
  }
`;

export const VerifyCheckinStatusQuery = gql`
  query($event_id: String) {
    verifyCheckinStatus(event_id: $event_id)
  }
`;

export const CheckinActivityEventFlatMutation = gql`
  mutation CheckinActivityEventFlatMutation(
    $activity_type: String
    $id: String
    $endtime: String
    $starttime: String
    $location: String
    $title: String
    $url: String
    $description: String
    $key: String
    $map_title: String
    $map_type: String
    $picture: String
    $teaser: String
    $map_lat: String
    $map_lng: String
    $nid: String
    $category: String
    $interests: String
    $date: String
    $rawDate: String
    $feed_type: String
  ) {
    checkinActivityEventFlat(
      activity_type: $activity_type
      id: $id
      endtime: $endtime
      starttime: $starttime
      location: $location
      title: $title
      url: $url
      description: $description
      key: $key
      map_title: $map_title
      map_type: $map_type
      picture: $picture
      teaser: $teaser
      map_lat: $map_lat
      map_lng: $map_lng
      nid: $nid
      category: $category
      interests: $interests
      date: $date
      rawDate: $rawDate
      feed_type: $feed_type
    ) {
      endtime
      starttime
      location
      title
      url
      description
      key
      map_title
      map_type
      picture
      teaser
      map_lat
      map_lng
      nid
      category
      interests
      date
      rawDate
      feed_type
      __typename
    }
  }
`;

export const GetLikedEventsFlatQuery = gql`
  query {
    getLikedEventsFlat {
      active
      id
      timestamp
      endtime
      location
      starttime
      title
      url
      description
      key
      map_title
      map_type
      picture
      teaser
      map_lat
      map_lng
      nid
      category
      interests
      date
      rawDate
      feed_type
      __typename
    }
  }
`;

export const LikeActivityEventFlatMutation = gql`
  mutation LikeActivityEventFlatMutation(
    $activity_type: String
    $active: String
    $id: String
    $endtime: String
    $starttime: String
    $location: String
    $title: String
    $url: String
    $description: String
    $key: String
    $map_title: String
    $map_type: String
    $feed_type: String
    $picture: String
    $teaser: String
    $map_lat: String
    $map_lng: String
    $nid: String
    $category: String
    $interests: String
    $date: String
    $rawDate: String
  ) {
    likeActivityFlat(
      activity_type: $activity_type
      active: $active
      id: $id
      endtime: $endtime
      starttime: $starttime
      location: $location
      title: $title
      url: $url
      description: $description
      key: $key
      map_title: $map_title
      map_type: $map_type
      feed_type: $feed_type
      picture: $picture
      teaser: $teaser
      map_lat: $map_lat
      map_lng: $map_lng
      nid: $nid
      category: $category
      interests: $interests
      date: $date
      rawDate: $rawDate
    ) {
      id
      endtime
      active
      starttime
      location
      title
      url
      description
      key
      map_title
      map_type
      picture
      teaser
      map_lat
      map_lng
      nid
      category
      interests
      date
      rawDate
      feed_type
      __typename
    }
  }
`;

export const DislikeActivityEventPureMutation = gql`
  mutation DislikeActivityEventPureMutation($id: String) {
    dislikeActivityPure(id: $id) {
      id
      endtime
      starttime
      location
      title
      url
      description
      key
      map_title
      map_type
      picture
      teaser
      map_lat
      map_lng
      nid
      category
      interests
      date
      rawDate
      feed_type
      __typename
    }
  }
`;

export const LikeActivityEventPureMutation = gql`
  mutation LikeActivityEventPureMutation(
    $activity_type: String
    $id: String
    $endtime: String
    $starttime: String
    $location: String
    $title: String
    $url: String
    $description: String
    $key: String
    $map_title: String
    $map_type: String
    $feed_type: String
    $picture: String
    $teaser: String
    $map_lat: String
    $map_lng: String
    $nid: String
    $category: String
    $interests: String
    $date: String
    $rawDate: String
  ) {
    likeActivityPure(
      activity_type: $activity_type
      id: $id
      endtime: $endtime
      starttime: $starttime
      location: $location
      title: $title
      url: $url
      description: $description
      key: $key
      map_title: $map_title
      map_type: $map_type
      feed_type: $feed_type
      picture: $picture
      teaser: $teaser
      map_lat: $map_lat
      map_lng: $map_lng
      nid: $nid
      category: $category
      interests: $interests
      date: $date
      rawDate: $rawDate
    ) {
      endtime
      starttime
      location
      title
      url
      description
      key
      map_title
      map_type
      picture
      teaser
      map_lat
      map_lng
      nid
      category
      interests
      date
      rawDate
      feed_type
      __typename
    }
  }
`;

export const getSocialCheckinActivities = graphql(
  GetFriendEventActivitiesQuery,
  {
    options: props => ({
      fetchPolicy: "network-only",
      variables: {
        asurite: props.asurite,
        activity_type: "social",
        filter_type: "activityCheckin",
        count: props.count,
        nextToken: props.nextToken
      }
    }),
    props: props => {
      if (props.data.error) {
        console.log(props.data.error);
      }
      if (
        props.data.getFriendEventActivities &&
        props.data.getFriendEventActivities.data &&
        props.data.getFriendEventActivities.data.length > 0
      ) {
        return {
          checkins_list: undoEscape(props.data.getFriendEventActivities.data)
        };
      } else {
        return {
          checkins_list: []
        };
      }
    }
  }
);

export const getSocialCheckinActivitiesCount = graphql(
  GetFriendEventActivitiesQuery,
  {
    options: props => ({
      fetchPolicy: "network-only",
      variables: {
        asurite: props.asurite,
        activity_type: "social",
        filter_type: "activityCheckin",
        count: props.count,
        nextToken: props.nextToken
      }
    }),
    props: props => {
      if (props.data.error) {
        console.log(props.data.error);
      }
      if (
        props.data.getFriendEventActivities &&
        props.data.getFriendEventActivities.data &&
        props.data.getFriendEventActivities.data.length > 0
      ) {
        return {
          checkin_count_social: props.data.getFriendEventActivities.data.length
        };
      } else {
        return {
          checkin_count_social: 0
        };
      }
    }
  }
);

export const getAcademicCheckinActivities = graphql(
  GetFriendEventActivitiesQuery,
  {
    options: props => ({
      fetchPolicy: "network-only",
      variables: {
        asurite: props.asurite,
        activity_type: "academic",
        filter_type: "activityCheckin",
        count: props.count,
        nextToken: props.nextToken
      }
    }),
    props: props => {
      if (props.data.error) {
        console.log(props.data.error);
      }
      if (
        props.data.getFriendEventActivities &&
        props.data.getFriendEventActivities.data &&
        props.data.getFriendEventActivities.data.length > 0
      ) {
        return {
          academicCheckins: undoEscape(props.data.getFriendEventActivities.data)
        };
      } else {
        return {
          academicCheckins: []
        };
      }
    }
  }
);

export const getFriendAcademicCheckinActivitiesCount = graphql(
  GetFriendEventActivitiesQuery,
  {
    options: props => ({
      fetchPolicy: "network-only",
      variables: {
        asurite: props.asurite,
        activity_type: "academic",
        filter_type: "activityCheckin",
        count: props.count,
        nextToken: props.nextToken
      }
    }),
    props: props => {
      if (props.data.error) {
        console.log(props.data.error);
      }
      if (
        props.data.getFriendEventActivities &&
        props.data.getFriendEventActivities.data &&
        props.data.getFriendEventActivities.data.length > 0
      ) {
        return {
          checkin_count_academic:
            props.data.getFriendEventActivities.data.length
        };
      } else {
        return {
          checkin_count_academic: 0
        };
      }
    }
  }
);

export const likeEventNewsFlat = graphql(LikeActivityEventFlatMutation, {
  props: props => ({
    like: event => {
      props
        .mutate({
          variables: {
            ...event
          },
          optimisticResponse: () => ({
            likeActivityFlat: {
              active: event.active ? event.active : null,
              feed_type: event.feed_type ? event.feed_type : null,
              id: event.id ? event.id : null,
              timestamp: new Date().getTime(),
              endtime: event.endtime ? event.endtime : null,
              location: event.location ? event.location : null,
              starttime: event.starttime ? event.starttime : null,
              title: event.title ? event.title : null,
              url: event.url ? event.url : null,
              description: event.description ? event.description : null,
              key: event.key ? event.key : null,
              map_title: event.map_title ? event.map_title : null,
              map_type: event.map_type ? event.map_type : null,
              picture: event.picture ? event.picture : null,
              teaser: event.teaser ? event.teaser : null,
              map_lat: event.map_lat ? event.map_lat : null,
              map_lng: event.map_lng ? event.map_lng : null,
              nid: event.nid ? event.nid : null,
              category: event.category ? event.category : null,
              interests: event.interests ? event.interests : null,
              date: event.date ? event.date : null,
              rawDate: event.rawDate ? event.rawDate : null,
              __typename: "Event_News_flat"
            }
          }),
          update: (store, { resp }) => {
            event = {
              active: event.active ? event.active : null,
              feed_type: event.feed_type ? event.feed_type : null,
              id: event.id ? event.id : null,
              timestamp: new Date().getTime(),
              endtime: event.endtime ? event.endtime : null,
              location: event.location ? event.location : null,
              starttime: event.starttime ? event.starttime : null,
              title: event.title ? event.title : null,
              url: event.url ? event.url : null,
              description: event.description ? event.description : null,
              key: event.key ? event.key : null,
              map_title: event.map_title ? event.map_title : null,
              map_type: event.map_type ? event.map_type : null,
              picture: event.picture ? event.picture : null,
              teaser: event.teaser ? event.teaser : null,
              map_lat: event.map_lat ? event.map_lat : null,
              map_lng: event.map_lng ? event.map_lng : null,
              nid: event.nid ? event.nid : null,
              category: event.category ? event.category : null,
              interests: event.interests ? event.interests : null,
              date: event.date ? event.date : null,
              rawDate: event.rawDate ? event.rawDate : null,
              __typename: "Event_News_flat"
            };

            try {
              let data = store.readQuery({
                query: GetLikedEventsFlatQuery
              });
              let pruned = [];
              if (event.active === 1) {
                if (!checkSaved(event.nid, data.getLikedEventsFlat)) {
                  data.getLikedEventsFlat.push(event);
                }
              } else {
                data.getLikedEventsFlat.forEach(item => {
                  if (item.id !== event.id) {
                    pruned.push(item);
                  }
                });
                data.getLikedEventsFlat = pruned;
              }

              store.writeQuery({
                query: GetLikedEventsFlatQuery,
                data
              });
            } catch (e) {
              console.log(e);
            }
          }
        })
        .then(resp => {
          // console.log("mutation response", resp); // Debug option
        })
        .catch(e => {
          console.log("submission error", e);
          // throw e;
        });
    }
  })
});

export const GetFriendLikesQuery = gql`
  query($asurite: String) {
    getFriendLikes(asurite: $asurite) {
      data {
        endtime
        active
        starttime
        location
        title
        url
        description
        key
        map_title
        map_type
        picture
        teaser
        map_lat
        map_lng
        nid
        category
        interests
        date
        rawDate
        feed_type
        __typename
      }
    }
  }
`;

export const GetEventInterestsQuery = gql`
  query($event_id: String) {
    getEventInterestCount(event_id: $event_id)
  }
`;

export const getEventInterestCount = graphql(GetEventInterestsQuery, {
  options: {
    fetchPolicy: "network-only"
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    return {
      event_interest_count: props.data.getEventInterestCount
    };
  }
});

export const getAcademicCheckins = graphql(GetAcademicCheckinsQuery, {
  options: {
    fetchPolicy: "network-only"
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    if (
      props.data.getAcademicCheckins &&
      props.data.getAcademicCheckins.data &&
      props.data.getAcademicCheckins.data.length > 0
    ) {
      return {
        academicCheckins: props.data.getAcademicCheckins.data
      };
    } else {
      return {
        academicCheckins: []
      };
    }
  }
});

export const getAcademicCheckinsCount = graphql(GetAcademicCheckinsQuery, {
  options: {
    fetchPolicy: "network-only"
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    // console.log("Aca checkin", props);
    if (
      props.data.getAcademicCheckins &&
      props.data.getAcademicCheckins.data &&
      props.data.getAcademicCheckins.data.length > 0
    ) {
      return {
        checkin_count_academic: props.data.getAcademicCheckins.data.length
      };
    } else {
      return {
        checkin_count_academic: 0
      };
    }
  }
});

export const getLikedEvents = graphql(GetLikedEventsFlatQuery, {
  options: {
    fetchPolicy: "network-only"
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    if (
      props.data.getLikedEventsFlat &&
      props.data.getLikedEventsFlat.length &&
      props.data.getLikedEventsFlat.length > 0
    ) {
      return {
        likedItems: undoEscape(props.data.getLikedEventsFlat)
      };
    } else {
      return {
        likedItems: []
      };
    }
  }
});

export const getLikedEventsCount = graphql(GetLikedEventsFlatQuery, {
  options: {
    fetchPolicy: "network-only"
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    if (
      props.data.getLikedEventsFlat &&
      props.data.getLikedEventsFlat.length > 0
    ) {
      return {
        like_count: props.data.getLikedEventsFlat.length
      };
    } else {
      return {
        like_count: 0
      };
    }
  }
});

export let getEventActivities = graphql(GetEventActivities, {
  options: props => ({
    fetchPolicy: "network-only",
    variables: {
      count: props.count,
      nextToken: props.nextToken
    }
  }),
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    if (
      props.data.getEventActivities &&
      props.data.getEventActivities.data &&
      props.data.getEventActivities.data.length > 0
    ) {
      return {
        checkins_list: undoEscape(props.data.getEventActivities.data)
      };
    } else {
      return {
        checkins_list: []
      };
    }
  }
});

export let getEventActivitiesCount = graphql(GetEventActivities, {
  options: props => ({
    fetchPolicy: "network-only",
    variables: {
      count: props.count,
      nextToken: props.nextToken
    }
  }),
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    if (
      props.data.getEventActivities &&
      props.data.getEventActivities.data &&
      props.data.getEventActivities.data.length > 0
    ) {
      return {
        checkin_count_social: props.data.getEventActivities.data.length
      };
    } else {
      return {
        checkin_count_social: 0
      };
    }
  }
});

export const getCheckinCount = graphql(GetEventCheckinCountQuery, {
  options: props => {
    return {
      fetchPolicy: "cache-first",
      variables: { event_id: props.event_id }
    };
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    if (
      props.data.getEventCheckinCountCacheOnly &&
      props.data.getEventCheckinCountCacheOnly.length
    ) {
      return {
        attendees: props.data.getEventCheckinCountCacheOnly
      };
    } else {
      return [];
    }
  }
});

export const getFriendLikes = graphql(GetFriendLikesQuery, {
  options: props => {
    return {
      fetchPolicy: "network-only",
      variables: { asurite: props.asurite }
    };
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    if (
      props.data.getFriendLikes &&
      props.data.getFriendLikes.data &&
      props.data.getFriendLikes.data.length > 0
    ) {
      return {
        likedItems: undoEscape(props.data.getFriendLikes.data)
      };
    } else {
      return {
        likedItems: []
      };
    }
  }
});

export const getFriendLikesCount = graphql(GetFriendLikesQuery, {
  options: props => {
    return {
      fetchPolicy: "network-only",
      variables: { asurite: props.asurite }
    };
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    if (
      props.data.getFriendLikes &&
      props.data.getFriendLikes.data &&
      props.data.getFriendLikes.data.length > 0
    ) {
      return {
        like_count: props.data.getFriendLikes.data.length
      };
    } else {
      return {
        like_count: 0
      };
    }
  }
});

function urldecode(url) {
  if (url && typeof url.replace === "function") {
    return decodeURIComponent(url.replace(/\+/g, " "));
  }
  return url;
}

function undoEscape(data) {
  let escaped = [];
  if (data && data.length) {
    data.forEach(entry => {
      let item = { ...entry };
      for (var k in item) {
        try {
          if (item.hasOwnProperty(k) && k !== "key") {
            item[k] = urldecode(item[k]);
          }
        } catch (e) {
          item[k] = item[k];
        }
      }
      escaped.push(item);
    });
  }
  return escaped;
}
