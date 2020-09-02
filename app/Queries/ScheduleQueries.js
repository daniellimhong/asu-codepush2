import gql from "graphql-tag";
import { graphql, ApolloProvider, compose } from "react-apollo";
import { checkSaved } from "../Queries";

/**
 * Pull the classes and all known data points associated.
 */
export const AcademicScheduleQuery = gql`
  query AcademicSchedule($roles: String) {
    getAcademicScheduleTest(roles: $roles) {
      asurite
      currentTerm
      id
      terms {
        term_begin_date
        term_end_date
        term_code
        term_descr
        currentTerm
        classes {
          catalog_nbr
          class_number
          course_id
          course_title
          instruction_mode
          subject
          units
          course_url
          slack_url
          meeting_patterns {
            class_meeting_number
            end_date
            end_date
            meeting_location
            start_date
            start_time
            mon
            tues
            wed
            thurs
            fri
            sat
            sun
          }
        }
      }
    }
  }
`;

/**
 * Pulls an authenticated user's saved events with all known data points available/
 */
export const EventScheduleQuery = gql`
  query EventSchedule {
    getEventSchedule {
      Events {
        active
        asurite
        timestamp
        id
        data {
          endtime
          location
          starttime
          title
          url
          id
          data {
            description
            endTime
            key
            location
            map_title
            map_type
            picture
            startTime
            teaser
            title
            type
            url
            map_coords {
              lat
              lng
            }
          }
        }
      }
    }
  }
`;

export const SaveEventMutation = gql`
  mutation SaveEvent($id: ID, $data: Event_Data_Input1, $active: Int) {
    saveEvent(id: $id, data: $data, active: $active) {
      active
      asurite
      timestamp
      id
      data {
        endtime
        location
        starttime
        title
        url
        id
        data {
          description
          endTime
          key
          location
          map_title
          map_type
          picture
          startTime
          teaser
          title
          type
          url
          map_coords {
            lat
            lng
          }
        }
      }
    }
  }
`;

export const SaveEventFlatMutation = gql`
  mutation(
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
    saveEventFlat(
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
      feed_type
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

export const SaveEventPureMutation = gql`
  mutation(
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
    saveEventPure(
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
      feed_type
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

export const RemoveEventPureMutation = gql`
  mutation RemoveEventPureMutation($id: String) {
    removeEventPure(id: $id) {
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

export const AllEventFlatQuery = gql`
  query {
    getSavedEventsFlat {
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

export const getAcademicSchedule = graphql(AcademicScheduleQuery, {
  options: props => {
    return {
      fetchPolicy: "cache-and-network",
      variables: { roles: JSON.stringify(props.roles) }
    };
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    return {
      academicSchedule: props.data.getAcademicScheduleTest
    };
  }
});

export const getEventSchedule = graphql(AllEventFlatQuery, {
  options: {
    // fetchPolicy: "network-only",
    fetchPolicy: "cache-first"
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    return {
      eventSchedule: props.data.getSavedEventsFlat
    };
  }
});

export const saveEvent = graphql(SaveEventFlatMutation, {
  props: props => ({
    saveEvent: event => {
      try {
        props
          .mutate({
            variables: {
              ...event
            },
            optimisticResponse: () => ({
              saveEventFlat: {
                active: event.active,
                feed_type: event.feed_type,
                id: event.id,
                timestamp: new Date().getTime(),
                endtime: event.endtime,
                location: event.location,
                starttime: event.starttime,
                title: event.title,
                url: event.url,
                description: event.description,
                key: event.key,
                map_title: event.map_title ? event.map_title : null,
                map_type: event.map_type ? event.map_type : null,
                picture: event.picture,
                teaser: event.teaser,
                map_lat: event.map_lat ? event.map_lat : null,
                map_lng: event.map_lng ? event.map_lng : null,
                nid: event.nid,
                category: event.category ? event.category : null,
                interests: event.interests ? event.interests : null,
                date: event.date ? event.date : null,
                rawDate: event.rawDate ? event.rawDate : null,
                __typename: "Event_News_flat"
              }
            }),
            update: (store, { resp }) => {
              try {
                event = {
                  active: event.active,
                  feed_type: event.feed_type,
                  id: event.id,
                  timestamp: new Date().getTime(),
                  endtime: event.endtime,
                  location: event.location,
                  starttime: event.starttime,
                  title: urldecode(event.title),
                  url: event.url,
                  description: event.description,
                  key: event.key,
                  map_title: event.map_title ? event.map_title : null,
                  map_type: event.map_type ? event.map_type : null,
                  picture: event.picture,
                  teaser: event.teaser,
                  map_lat: event.map_lat ? event.map_lat : null,
                  map_lng: event.map_lng ? event.map_lng : null,
                  nid: event.nid,
                  category: event.category ? event.category : null,
                  interests: event.interests ? event.interests : null,
                  date: event.date ? event.date : null,
                  rawDate: event.rawDate ? event.rawDate : null,
                  __typename: "Event_News_flat"
                };

                let data = store.readQuery({
                  query: AllEventFlatQuery
                });
                let pruned = [];
                if (event.active === 1) {
                  if (!checkSaved(event.nid, data.getSavedEventsFlat)) {
                    data.getSavedEventsFlat.push(event);
                  }
                } else {
                  data.getSavedEventsFlat.forEach(item => {
                    if (item.id !== event.id) {
                      pruned.push(item);
                    }
                  });
                  data.getSavedEventsFlat = pruned;
                }

                store.writeQuery({
                  query: AllEventFlatQuery,
                  data
                });
              } catch (e) {
                console.log(e);
              }
            }
          })
          .then(resp => {})
          .catch(e => {
            console.log("submission error", e);
            // throw e;
          });
      } catch (e) {
        console.log(e);
      }
    }
  })
});

function urldecode(url) {
  try {
    if (url && typeof url.replace === "function") {
      return decodeURIComponent(url.replace(/\+/g, " "));
    }
  } catch (e) {
    return url;
  }
}
