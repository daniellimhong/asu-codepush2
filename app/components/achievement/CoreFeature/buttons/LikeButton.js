import React, { useState, useEffect, useContext } from "react";
import { TouchableOpacity } from "react-native";
import { compose, graphql } from "react-apollo";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import _ from "lodash";
import { dislike, like } from "./utility";
import {
  checkSaved,
  LikeActivityEventPureMutation,
  DislikeActivityEventPureMutation,
  GetLikedEventsFlatQuery,
  undoEscape
} from "../../../../Queries";
import { AuthRender } from "../../../functional/authentication/auth_components/weblogin";
import { SettingsContext } from "../../Settings/Settings";

function LikeButtonContent(props) {
  const [active, setActive] = useState(false);
  const {
    navigation,
    data,
    likedItems,
    likeActivityPure,
    dislikeActivityPure
  } = props;
  const { sendAnalytics } = useContext(SettingsContext);

  const mutateData = {
    data,
    likedItems,
    sendAnalytics,
    likeActivityPure,
    dislikeActivityPure,
    feed_type: _.get(navigation, "state.params.feed_type")
  };

  useEffect(() => {
    if (data && !checkSaved(data.key, likedItems)) {
      setActive(false);
    } else if (data) {
      setActive(true);
    }
  }, [likedItems]);

  return (
    <TouchableOpacity
      onPress={() => {
        if (active) {
          dislike(mutateData, props.previousScreen, props.previousSection);
        } else {
          like(mutateData, props.previousScreen, props.previousSection);
        }
      }}
      style={{ flex: 0, marginRight: 20 }}
      accessibilityLabel="Like"
      accessibilityRole="button"
    >
      <FontAwesome
        name={active ? "heart" : "heart-o"}
        size={25}
        color={active ? "#990033" : "#464646"}
      />
    </TouchableOpacity>
  );
}

export default function LikeButton(props) {
  return (
    <AuthRender>
      <LikeButtonAAS {...props} />
    </AuthRender>
  );
}

const LikeButtonAAS = compose(
  graphql(GetLikedEventsFlatQuery, {
    options: {
      fetchPolicy: "cache-first"
    },
    props: props => {
      try {
        return {
          likedItems: undoEscape(props.data.getLikedEventsFlat)
        };
      } catch (e) {
        return {
          likedItems: []
        };
      }
    }
  }),
  graphql(LikeActivityEventPureMutation, {
    props: props => ({
      likeActivityPure: event => {
        return props
          .mutate({
            variables: {
              ...event
            },
            optimisticResponse: () => ({
              likeActivityPure: {
                active: "1",
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
            update: store => {
              event = {
                active: "1",
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
                const data = store.readQuery({
                  query: GetLikedEventsFlatQuery
                });

                if (!checkSaved(event.nid, data.getLikedEventsFlat)) {
                  data.getLikedEventsFlat.push(event);
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
            return Promise.resolve(resp);
          })
          .catch(e => {
            console.log("submission error", e);
            return Promise.reject(e);
            // throw e;
          });
      }
    })
  }),
  graphql(DislikeActivityEventPureMutation, {
    props: props => ({
      dislikeActivityPure: event => {
        return props
          .mutate({
            variables: {
              id: event.key
            },
            optimisticResponse: () => ({
              dislikeActivityPure: {
                active: "1",
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
            update: store => {
              event = {
                active: "1",
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
                const data = store.readQuery({
                  query: GetLikedEventsFlatQuery
                });

                const pruned = [];

                data.getLikedEventsFlat.forEach(item => {
                  if (item.key !== event.key && item.key !== event.nid) {
                    pruned.push(item);
                  }
                });
                data.getLikedEventsFlat = pruned;

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
            return Promise.resolve(resp);
          })
          .catch(e => {
            console.log("submission error", e);
            return Promise.reject(e);
            // throw e;
          });
      }
    })
  })
)(LikeButtonContent);
