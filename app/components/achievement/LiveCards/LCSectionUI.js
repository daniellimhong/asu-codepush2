import React from "react";
import {
  View,
  Dimensions,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  AccessibilityInfo,
  AsyncStorage
} from "react-native";
import Carousel, {
  Pagination,
  getInputRangeFromIndexes
} from "react-native-snap-carousel";
import {
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { Api } from "../../../services/api";
import Icon from "react-native-vector-icons/FontAwesome";
import DeviceInfo from "react-native-device-info";
import axios from "axios";
import PropTypes from "prop-types";
import SliderEntry from "./SliderEntry";
import { GetLiveCardsQuery } from "../../../Queries/LiveCardQueries";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import Permissions from "react-native-permissions";
import { createEntry, addToObject } from "./utility";
const { width: viewportWidth, height: viewportHeight } = Dimensions.get(
  "window"
);

const buildVersion =
  Platform.OS !== "ios" ? DeviceInfo.getVersion() : DeviceInfo.getBuildNumber();
const deviceData = {
  buildVersion,
  platform: Platform.OS
};

/**
 * Start Workaround
 * This code block is necessary for making the Live Cards function properly on
 * both android and iOS with the same layout.
 * The bug is due to the way that Android handles the zIndex property(not well)
 */
function wp(percentage) {
  const value = (percentage * viewportWidth) / 100;
  return Math.round(value);
}
const slideHeight = viewportHeight * 0.36;
const slideWidth = wp(90);
const itemHorizontalMargin = wp(0.2);
const sliderWidth = viewportWidth;
const itemWidth = slideWidth + itemHorizontalMargin * 2;
function stackScrollInterpolator(index, carouselProps) {
  const range = [1, 0, -1, -2, -3];
  const inputRange = getInputRangeFromIndexes(range, index, carouselProps);
  const outputRange = range;
  return { inputRange, outputRange };
}
function stackAnimatedStyles(index, animatedValue, carouselProps) {
  const sizeRef = carouselProps.vertical
    ? carouselProps.itemHeight
    : carouselProps.itemWidth;
  const translateProp = carouselProps.vertical ? "translateY" : "translateX";
  const cardOffset = 18;
  const card1Scale = 0.9;
  const card2Scale = 0.8;
  const getTranslateFromScale = (index, scale) => {
    const centerFactor = (1 / scale) * index;
    const centeredPosition = -Math.round(sizeRef * centerFactor);
    const edgeAlignment = Math.round((sizeRef - sizeRef * scale) / 2);
    const offset = Math.round((cardOffset * Math.abs(index)) / scale);
    return centeredPosition - edgeAlignment - offset;
  };
  return {
    opacity: animatedValue.interpolate({
      inputRange: [-3, -2, -1, 0],
      outputRange: [0, 0.5, 0.75, 1],
      extrapolate: "clamp"
    }),
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [-2, -1, 0, 1],
          outputRange: [card2Scale, card1Scale, 1, card1Scale],
          extrapolate: "clamp"
        })
      },
      {
        [translateProp]: animatedValue.interpolate({
          inputRange: [-3, -2, -1, 0, 1],
          outputRange: [
            getTranslateFromScale(-3, card2Scale),
            getTranslateFromScale(-2, card2Scale),
            getTranslateFromScale(-1, card1Scale),
            0,
            sizeRef * 0.5
          ],
          extrapolate: "clamp"
        })
      }
    ]
  };
}
/**
 * END Workaround
 */
/**
 * UI for the Live cards
 */
class LCSectionUIX extends React.PureComponent {
  state = {
    slider1ActiveSlide: 0,
    entries: [],
    asurite: "guest",
    accessiblilityEnabled: false,
    liveCards: [],
    liveCardsToShow: [],
    lat: "33.4242444",
    lng: "-111.9302467",
    receivedISearchData: false,
    updateComponent: false,
    milestoneTriesCount: 0
  };
  liveCardInterval = null;
  static defaultProps = {
    iSearchData: {}
  };
  componentDidMount() {
    this.getMilestonesData();
    try {
      this.getStoredCards()
        .then(response => {
          if (response && response.data && response.data.getLiveCards) {
            this.setState(
              {
                liveCards: response.data.getLiveCards
              },
              () => {
                this.setCards();
              }
            );
          } else {
            this.getLocation();
          }
        })
        .catch(e => {
          console.log("Mnt err", e);
        });
    } catch (e) {
      console.log("Thing is broke", e);
    }
    this.liveCardInterval = setInterval(() => {
      this.getLocation();
    }, 30000);
    AccessibilityInfo.fetch().then(accessiblilityEnabled => {
      this.setState({ accessiblilityEnabled });
    });
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.iSearchData.asuriteId !== "" &&
      this.props.iSearchData.asuriteId !== undefined &&
      !this.state.receivedISearchData
    ) {
      this.setState({ receivedISearchData: true }, () => this.getLocation());
    }
  }
  componentWillUnmount() {
    clearInterval(this.liveCardInterval);
  }
  getMilestonesData = () => {
    this.context
      .getTokens()
      .then(tokens => {
        let apiService = new Api(
          "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
          tokens
        );
        apiService
          .get("/milestone")
          .then(response => {
            this.setState({
              jwtToken: response
            });
            const listLink =
              "https://72zh0gia14.execute-api.us-east-1.amazonaws.com/prod/rest/milestones?activeOnly=true";
            const listConfig = {
              headers: {
                "x-Api-Key": "wjS5pI4kRY1z69ZTjQ9tm3Nbuj4ISTEDcqipo84e",
                Authorization: "Bearer " + response
              }
            };
            const link =
              "https://72zh0gia14.execute-api.us-east-1.amazonaws.com/prod/rest/me";
            const config = {
              headers: {
                "x-Api-Key": "wjS5pI4kRY1z69ZTjQ9tm3Nbuj4ISTEDcqipo84e",
                Authorization: "Bearer " + response
              }
            };
            axios
              .get(listLink, listConfig)
              .then(resList => {
                this.setState({
                  milestonesListData: resList.data
                });
                axios
                  .get(link, config)
                  .then(res => {
                    this.setState(
                      {
                        milestonesStatusData: res.data,
                        completionPercentage: res.data.completionPercentage
                      },
                      () => this.setCards()
                    );
                  })
                  .catch(e => {
                    // console.log("there was an error ", e);
                    this.setState({ milestonesStartPage: true }, () =>
                      this.setCards()
                    );
                  });
              })
              .catch(e => {
                // console.log("there was an error ", e);
              });
          })
          .catch(error => {
            console.log("getMilestonesData error ", error);
          });
      })
      .catch(error => {
        console.log("there was an error lcsection ", error);
        if (this.state.count === 0) {
          this.setTimeout(() => {
            this.getMilestonesData();
          }, 1000);
        }
        this.setState({
          user: "guest",
          milestoneTriesCount: this.state.count + 1
        });
      });
  };

  setMilestoneData = (
    milestonesStatusData,
    milestonesListData,
    completionPercentage
  ) => {
    this.setState(
      {
        milestonesStatusData,
        milestonesListData,
        completionPercentage: milestonesStatusData.completionPercentage
      },
      () => this.setCards()
    );
  };

  getStoredCards() {
    return AsyncStorage.getItem("cachedCards")
      .then(data => {
        if (data) {
          return JSON.parse(data);
        }
        return {};
      })
      .catch(e => {
        console.log("Failed getting cached cards", e);
      });
  }
  setStoredCards(data) {
    return AsyncStorage.setItem("cachedCards", JSON.stringify(data))
      .then(resp => {
        return true;
      })
      .catch(e => {
        console.log("Set card failed: ", e);
      });
  }

  isBuildLessOrEqual = (version1, version2) => {
    if (version1 === version2) return true;
    let isLessOrEqual = false;
    if (typeof version1 !== "object") {
      version1 = version1.toString().split(".");
    }
    if (typeof version2 !== "object") {
      version2 = version2.toString().split(".");
    }
    for (var i = 0; i < Math.max(version1.length, version2.length); i++) {
      if (version1[i] == undefined) {
        version1[i] = 0;
      }
      if (version2[i] == undefined) {
        version2[i] = 0;
      }
      if (Number(version1[i]) < Number(version2[i])) {
        isLessOrEqual = true;
        break;
      }
      if (version1[i] != version2[i]) {
        break;
      }
    }
    return isLessOrEqual;
  };

  getLocation = async () => {
    if (Platform.OS == "ios") {
      Permissions.check("location").then(response => {
        if (response === "authorized") {
          this.sharedGetLocation();
        } else {
          this.props.client
            .query({
              query: GetLiveCardsQuery,
              fetchPolicy: "network-only",
              variables: {
                lat: "33.4242444",
                lng: "-111.9302467",
                iSearchData: addToObject(
                  this.props.iSearchData,
                  [deviceData, this.props.roles],
                  ["deviceData", "roles"]
                )
              }
            })
            .then(response => {
              if (
                response.data.getLiveCards &&
                response.data.getLiveCards.length > 0
              ) {
                this.setStoredCards(response);
                this.setState(
                  {
                    liveCards: response.data.getLiveCards
                  },
                  () => this.setCards()
                );
              }
            })
            .catch(e => {
              console.log("this is the error ", e);
            });
        }
      });
    } else {
      // Android
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      )
        .then(granted => {
          if (granted) {
            this.sharedGetLocation();
          } else {
            this.props.client
              .query({
                query: GetLiveCardsQuery,
                fetchPolicy: "network-only",
                variables: {
                  lat: "33.4242444",
                  lng: "-111.9302467",
                  iSearchData: addToObject(
                    this.props.iSearchData,
                    [deviceData, this.props.roles],
                    ["deviceData", "roles"]
                  )
                }
              })
              .then(response => {
                if (
                  response.data.getLiveCards &&
                  response.data.getLiveCards.length > 0
                ) {
                  this.setStoredCards(response)
                    .then(status => {
                      this.setState(
                        {
                          liveCards: response.data.getLiveCards
                        },
                        () => this.setCards()
                      );
                    })
                    .catch(e => {
                      console.log(e);
                    });
                }
              })
              .catch(e => {
                console.log("this is the error ", e);
              });
          }
        })
        .catch(e => {
          console.log("error doing position", e);
        });
    }
  };
  sharedGetLocation() {
    navigator.geolocation.getCurrentPosition(
      position => {
        if (this.state.lat) {
          this.setState(
            {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            () => {
              this.props.client
                .query({
                  query: GetLiveCardsQuery,
                  fetchPolicy: "network-only",
                  variables: {
                    lat: this.state.lat,
                    lng: this.state.lng,
                    iSearchData: addToObject(
                      this.props.iSearchData,
                      [deviceData, this.props.roles],
                      ["deviceData", "roles"]
                    )
                  }
                })
                .then(response => {
                  if (
                    response.data.getLiveCards &&
                    response.data.getLiveCards.length > 0
                  ) {
                    this.setStoredCards(response);
                    this.setState(
                      {
                        liveCards: response.data.getLiveCards
                      },
                      () => this.setCards()
                    );
                  }
                })
                .catch(e => {
                  console.log("this is the error ", e);
                });
            }
          );
        }
      },
      error => {
        const lat = "33.4242444";
        const lng = "-111.9302467";
        this.setState({ lat, lng });
        this.props.client
          .query({
            query: GetLiveCardsQuery,
            fetchPolicy: "network-only",
            variables: {
              lat,
              lng,
              iSearchData: addToObject(
                this.props.iSearchData,
                [deviceData, this.props.roles],
                ["deviceData", "roles"]
              )
            }
          })
          .then(response => {
            if (
              response.data.getLiveCards &&
              response.data.getLiveCards.length > 0
            ) {
              this.setStoredCards(response)
                .then(status => {
                  this.setState(
                    {
                      liveCards: response.data.getLiveCards
                    },
                    () => this.setCards()
                  );
                })
                .catch(e => {
                  console.log(e);
                });
            }
          });
      }
    );
  }

  setCards() {
    let { liveCards } = this.state;
    if (!this.props.asurite || this.props.asurite == "guest") {
      let tmpEntries = [];
      for (var i = 0; i < liveCards.length; i++) {
        if (liveCards[i].type !== "Profile" && liveCards[i].type !== "CovidWellness") {
          tmpEntries.push(liveCards[i]);
        }
      }
      liveCards = tmpEntries;
    }
    if (liveCards) {
      let customCards = [];
      let otherCards = [];
      for (let i = 0; i < liveCards.length; i++) {
        if (liveCards[i].type === "Custom") {
          customCards.push(createEntry(liveCards[i], this));
        } else {
          otherCards.push(createEntry(liveCards[i], this));
        }
      }
      entries = otherCards.sort((a, b) => {
        return a.order - b.order;
      });
      let comparePriority = (a, b) => {
        if (a.data.priority < b.data.priority) return -1;
        if (a.data.priority > b.data.priority) return 1;
        return 0;
      };
      let sortedCustomLiveCards = customCards.sort(comparePriority);
      for (let i = 0; i < sortedCustomLiveCards.length; i++) {
        entries.splice(
          sortedCustomLiveCards[i].data.order,
          0,
          sortedCustomLiveCards[i]
        );
      }
    }
    this.setState({ liveCardsToShow: entries });
  }
  _renderItem = ({ item, index }) => {
    return (
      <View style={{ width: itemWidth }}>
        <SliderEntry iSearchData={this.props.iSearchData} {...item} />
      </View>
    );
  };
  render() {
    if (this.state.accessiblilityEnabled) {
      return null;
    }
    if (this.state.liveCards.length <= 0) {
      return (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            paddingTop: 20,
            paddingBottom: 20
          }}
        >
          <ActivityIndicator size="large" animating={true} color="maroon" />
        </View>
      );
    } else {
      return (
        <View
          style={{
            backgroundColor: "#EDEDED",
            // Moved content up
            paddingBottom: 0,
            alignItems: "center",
            overflow: "visible"
          }}
        >
          <Carousel
            ref={c => (this._slider1Ref = c)}
            data={this.state.liveCardsToShow}
            firstItem={0}
            renderItem={this._renderItem}
            sliderWidth={sliderWidth}
            sliderHeight={375}
            itemHeight={340}
            itemWidth={itemWidth}
            containerCustomStyle={{ marginTop: 15, overflow: "visible" }}
            contentContainerCustomStyle={{ paddingVertical: 5 }}
            scrollInterpolator={stackScrollInterpolator}
            slideInterpolatedStyle={stackAnimatedStyles}
            onSnapToItem={index => {
              this.setState({ slider1ActiveSlide: index });
            }}
            layout="stack"
          />
          <Pagination
            dotsLength={this.state.liveCardsToShow.length}
            activeDotIndex={this.state.slider1ActiveSlide}
            containerStyle={{ paddingVertical: 8 }}
            dotColor={"rgba(255, 255, 255, 0.92)"}
            dotStyle={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: 4
            }}
            inactiveDotColor={"black"}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
            carouselRef={this._slider1Ref}
            tappableDots={!!this._slider1Ref}
          />
          {/* Removed down facing arrows */}
          {/*
          <Icon
            accessible={false}
            style={{ paddingTop: responsiveHeight(2) }}
            name="angle-double-down"
            color="grey"
            size={responsiveFontSize(3)}
          />
          */}
        </View>
      );
    }
  }
}

LCSectionUIX.contextTypes = {
  getTokens: PropTypes.func
};

export const LCSectionUI = AppSyncComponent(LCSectionUIX);
