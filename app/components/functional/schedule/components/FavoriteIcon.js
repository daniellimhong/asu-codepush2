import React from "react";
import { Text, View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { compose, graphql } from "react-apollo";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";
import {
  AllEventFlatQuery,
  RemoveEventPureMutation
} from "../../../../Queries";

class FavoriteIconX extends React.PureComponent {
  static defaultProps = {
    saveEvent: () => null,
    removeEventPure: () => null,
    item: {}
  };

  unfavorite(item) {
    Alert.alert("Confirm Action", "Remove Event from Schedule?", [
      {
        text: "Cancel",
        onPress: () => {
          this.props.modalDone();
        },
        style: "cancel"
      },
      { text: "OK", onPress: () => this.confirmUnfavorite(item) }
    ]);
  }

  confirmUnfavorite(item) {
    let inactive = { ...item };
    this.props.removeEventPure(inactive);
    this.props.modalDone();
  }

  render() {
    if (this.props.item.type !== "academic") {
      return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={{ bottom: 2 }}
            onPress={() => this.unfavorite(this.props.item.data)}
            accessibilityLabel="Add to calendar"
            accessibilityRole="button"
          >
            {/* <Icon name={"calendar-check-o"} size={20} color="maroon" /> */}
            <Text
              style={{
                fontSize: responsiveFontSize(1.5),
                color: "#b0b0b0",
                fontWeight: "bold",
                fontFamily: "Roboto"
              }}
            >
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return null;
    }
  }
}

export const FavoriteIcon = compose(
  graphql(AllEventFlatQuery, {
    options: {
      fetchPolicy: "cache-first"
    },
    props: props => {
      try {
        return {
          eventSchedule: props.data.getSavedEventsFlat
        };
      } catch (e) {
        return {
          eventSchedule: []
        };
      }
    }
  }),
  graphql(RemoveEventPureMutation, {
    props: props => ({
      removeEventPure: event => {
        return props
          .mutate({
            variables: {
              id: event.key
            },
            optimisticResponse: () => ({
              removeEventPure: buildEvent(event)
            }),
            update: (store, { resp }) => {
              event = buildEvent(event);

              try {
                let data = store.readQuery({
                  query: AllEventFlatQuery
                });

                let pruned = [];

                data.getSavedEventsFlat.forEach(item => {
                  if (item.id !== event.id && item.id !== event.nid) {
                    pruned.push(item);
                  }
                });
                data.getSavedEventsFlat = pruned;

                store.writeQuery({
                  query: AllEventFlatQuery,
                  data
                });
              } catch (e) {
                console.log(e);
              }
            }
          })
          .then(resp => {
            return new Promise.resolve(resp);
          })
          .catch(e => {
            console.log("submission error", e);
            return new Promise.reject(e);
            // throw e;
          });
      }
    })
  })
)(FavoriteIconX);

function buildEvent(event) {
  return {
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
}

const styles = StyleSheet.create({
  itemBody: {
    backgroundColor: "#FFF"
  }
});
