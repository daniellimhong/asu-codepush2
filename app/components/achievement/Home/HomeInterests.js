import React from "react";
import {
  View,
  Image,
  Dimensions,
  Text,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator
} from "react-native";
import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/MaterialIcons";
import Analytics from "./../../functional/analytics";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
const window = Dimensions.get("window");

// Not being used
// class Row extends React.PureComponent {
//   constructor(props) {
//     super(props);
//     this.state = this.props;

//     this._active = new Animated.Value(0);

//     this._style = {
//       ...Platform.select({
//         ios: {
//           transform: [
//             {
//               scale: this._active.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: [1, 1.1]
//               })
//             }
//           ],
//           shadowRadius: this._active.interpolate({
//             inputRange: [0, 1],
//             outputRange: [2, 5]
//           })
//         },

//         android: {
//           transform: [
//             {
//               scale: this._active.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: [1, 1.07]
//               })
//             }
//           ],
//           elevation: this._active.interpolate({
//             inputRange: [0, 1],
//             outputRange: [2, 6]
//           })
//         }
//       })
//     };
//   }

//   componentWillReceiveProps(nextProps) {
//     if (this.props.active !== nextProps.active) {
//       Animated.timing(this._active, {
//         duration: 300,
//         easing: Easing.bounce,
//         toValue: Number(nextProps.active)
//       }).start();
//     }
//   }

//   render() {
//     const { data, active } = this.state;

//     const rowAttr = {};
//     if (data.props.enabled) {
//       rowAttr.fontColor = "white";
//       rowAttr.bgColor = data.props.color;
//       rowAttr.border = 0;
//     } else {
//       rowAttr.fontColor = "grey";
//       rowAttr.bgColor = "white";
//       rowAttr.border = 0.5;
//     }

//     return (
//       <Animated.View
//         style={[
//           styles.row,
//           this._style,
//           {
//             flexDirection: "row",
//             backgroundColor: rowAttr.bgColor,
//             borderWidth: rowAttr.border
//           }
//         ]}
//       >
//         <Icon name="reorder" size={25} color={rowAttr.fontColor} />
//         <Text
//           style={[
//             styles.text,
//             {
//               flex: 1,
//               marginLeft: 5,
//               color: rowAttr.fontColor,
//               fontWeight: "bold",
//               fontFamily: "Roboto"
//             }
//           ]}
//         >
//           {data.props.title}
//         </Text>
//         <TouchableOpacity
//           onPress={() => {
//             this.state.data.props.enabled = !this.state.data.props.enabled;
//             this.setState(this.state);
//             this.props.update();
//           }}
//         >
//           <View>
//             <Icon name="check-box" size={30} color={rowAttr.fontColor} />
//           </View>
//         </TouchableOpacity>
//       </Animated.View>
//     );
//   }
// }

/**
 * HomeInterests components contains the options available to the user to turn off/on topics used to filter News & Events *
 **/
export class HomeInterests extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dim: true,
      topics: [],
      opacity: 0.9,
      active: [],
      asurite: null,
      interests: {},
      userInterests: [
        {
          data: {
            alumni: 1,
            arts: 1,
            career: 1,
            children: 1,
            community: 1,
            culture: 1,
            entrepreneurship: 1,
            health: 1,
            innovation: 1,
            public: 1,
            sports: 1,
            sustainability: 1,
            __typename: "User_Interests_Data"
          },
          __typename: "User_Interests"
        }
      ],
      loadingStatus: [
        {
          data: {
            alumni: 0,
            arts: 0,
            career: 0,
            children: 0,
            community: 0,
            culture: 0,
            entrepreneurship: 0,
            health: 0,
            innovation: 0,
            public: 0,
            sports: 0,
            sustainability: 0,
            __typename: "Interests_Network_Call_Status"
          },
          __typename: "Interests_Network_Call"
        }
      ]
    };

    this.toggleCard = this.toggleCard.bind(this);
  }

  componentDidMount() {
    this.setState();
  }

  static defaultProps = {
    saveInterests: () => null,
    interestTopics: [
      {
        default: 1,
        enabled: 1,
        id: "sustainability",
        timestamp: "1522821639627",
        data: {
          events: ["save_the_world"],
          image:
            "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/interest12.png",
          news: ["asu-news"],
          title: "Sustainability",
          __typename: "Interest_Topics_Data"
        },
        __typename: "Interest_Topics"
      },
      {
        default: 1,
        enabled: 1,
        id: "career",
        timestamp: "1522821388870",
        data: {
          events: ["land_that_dream_job"],
          image:
            "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/interest3.jpg",
          news: ["entrepreneurship"],
          title: "Career Growth",
          __typename: "Interest_Topics_Data"
        },
        __typename: "Interest_Topics"
      },
      {
        default: 1,
        enabled: 1,
        id: "health",
        timestamp: "1522821552989",
        data: {
          events: ["get_moving"],
          image:
            "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/interest8.jpg",
          news: ["sun-devil-life"],
          title: "Health",
          __typename: "Interest_Topics_Data"
        },
        __typename: "Interest_Topics"
      },
      {
        default: 1,
        enabled: 1,
        id: "arts",
        timestamp: "1522821361168",
        data: {
          events: ["arts", "my_jam", "show_is_starting"],
          image:
            "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/interest2.jpg",
          news: ["creativity"],
          title: "Arts",
          __typename: "Interest_Topics_Data"
        },
        __typename: "Interest_Topics"
      },
      {
        default: 1,
        enabled: 1,
        id: "innovation",
        timestamp: "1522821583868",
        data: {
          events: ["learn_something", "for_mad_scientists"],
          image:
            "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/interest9.jpg",
          news: ["solutions", "discoveries"],
          title: "Innovation",
          __typename: "Interest_Topics_Data"
        },
        __typename: "Interest_Topics"
      },
      {
        default: 1,
        enabled: 1,
        id: "community",
        timestamp: "1522821453488",
        data: {
          events: ["Open to the public"],
          image:
            "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/interest5.jpg",
          news: ["arizona-impact"],
          title: "Community",
          __typename: "Interest_Topics_Data"
        },
        __typename: "Interest_Topics"
      },
      {
        default: 1,
        enabled: 1,
        id: "sports",
        timestamp: "1522821621943",
        data: {
          events: ["go_team"],
          image:
            "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/interest7.png",
          news: ["sun-devil-life", "Athletics"],
          title: "Sports",
          __typename: "Interest_Topics_Data"
        },
        __typename: "Interest_Topics"
      },
      {
        default: 1,
        enabled: 1,
        id: "alumni",
        timestamp: "1522821312151",
        data: {
          events: ["for_asu_alumni"],
          image:
            "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/interest1.jpg",
          news: ["asu-news"],
          title: "Alumni",
          __typename: "Interest_Topics_Data"
        },
        __typename: "Interest_Topics"
      },
      {
        default: 1,
        enabled: 1,
        id: "culture",
        timestamp: "1522821514691",
        data: {
          events: ["the_arts", "my_jam", "free_food"],
          image:
            "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/interest6.png",
          news: ["global-engagement"],
          title: "Culture",
          __typename: "Interest_Topics_Data"
        },
        __typename: "Interest_Topics"
      },
      {
        default: 0,
        enabled: 1,
        id: "children",
        timestamp: "1522821414869",
        data: {
          events: ["future_sun_devils", "bring_the_kids"],
          image:
            "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/interest4.jpg",
          news: ["sun-devil-life"],
          title: "Children's Events",
          __typename: "Interest_Topics_Data"
        },
        __typename: "Interest_Topics"
      },
      {
        default: 1,
        enabled: 1,
        id: "entrepreneurship",
        timestamp: "1522821530208",
        data: {
          events: ["budding_entrepreneur"],
          image:
            "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/interest11.jpg",
          news: ["entrepreneurship"],
          title: "Entrepreneur",
          __typename: "Interest_Topics_Data"
        },
        __typename: "Interest_Topics"
      },
      {
        default: 1,
        enabled: 1,
        id: "public",
        timestamp: "1522821607088",
        data: {
          events: ["open_to_the_public"],
          image:
            "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/interest10.jpg",
          news: ["arizona-impact"],
          title: "Public Events",
          __typename: "Interest_Topics_Data"
        },
        __typename: "Interest_Topics"
      }
    ],
    userInterests: []
  };

  toggleCard(item) {
    if (this.state.loadingStatus[0].data[item.id] != 1) {
      // console.log("####### toogle for ", item.id);

      let loadingStatus = this.state.loadingStatus[0].data;
      loadingStatus[item.id] = 1;
      this.setState({
        loadingStatus: [
          {
            data: loadingStatus
          }
        ]
      });

      let userInterests =
        this.props.userInterests.length > 0
          ? this.props.userInterests
          : this.state.userInterests;
      let topics = [...this.props.interestTopics];
      let interests = userInterests[0].data ? { ...userInterests[0].data } : {};

      topics.forEach(topic => {
        if (interests[topic.id] == null || interests[topic.id] == undefined) {
          interests[topic.id] = 1;
        }
      });

      if (interests[item.id] == 0) {
        interests[item.id] = 1;
      } else {
        interests[item.id] = 0;
      }

      this.props
        .saveInterests({
          data: interests
        })
        .then(data => {
          this.saveAndUpdateInterests(interests, item);
        });
      let toggleVal = interests[item.id] == 0 ? "disabled" : "enabled";
      this.refs.analytics.sendData({
        "action-type": "click",
        "target": "Interest " + item.id + " " + toggleVal,
        "starting-screen": "preferences",
        "starting-section": "interests", 
        "resulting-screen": "preferences", 
        "resulting-section": "interests",
        "target-id":item.id.toString(),
        "action-metadata":{
          "item":item.id,
          "target-id":item.id.toString(),
        }
      });
    }
  }

  saveAndUpdateInterests(interests, item) {
    let loadingStatus = this.state.loadingStatus[0].data;
    loadingStatus[item.id] = 0;
    this.setState({
      userInterests: [
        {
          data: interests
        }
      ],
      loadingStatus: [
        {
          data: loadingStatus
        }
      ]
    });
  }

  cleanMutationObject(data) {
    let cleanObj = {};
    for (var key in data) {
      if (data.hasOwnProperty(key) && key !== "__typename") {
        cleanObj[key] = data[key];
      }
    }
    return cleanObj;
  }

  dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function(a, b) {
      var result =
        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  }
  createInterests() {
    let images = {
      sustainability: require("../assets/interest12.png"),
      career: require("../assets/interest3.jpg"),
      health: require("../assets/interest8.jpg"),
      arts: require("../assets/interest2.jpg"),
      innovation: require("../assets/interest9.jpg"),
      community: require("../assets/interest6.png"),
      sports: require("../assets/interest7.png"),
      alumni: require("../assets/interest1.jpg"),
      culture: require("../assets/interest5.jpg"),
      children: require("../assets/interest4.jpg"),
      entrepreneurship: require("../assets/interest11.jpg"),
      public: require("../assets/interest10.jpg")
    };
    var arr = [...this.props.interestTopics].sort(this.dynamicSort("id"));

    return arr.map((item, i) => {
      let dimmed = this.state.dim;
      let id = item.id;

      let actve = 0;
      if (
        this.props.userInterests.length > 0 &&
        this.props.userInterests[0].data
      ) {
        actve = this.props.userInterests[0].data[item.id];
      } else {
        actve = this.state.userInterests[0].data[item.id];
      }

      let loading =
        this.state.loadingStatus[0].data[item.id] > 0 ? true : false;

      let bool;
      if (actve > 0 && !loading) {
        bool = true;
      } else {
        bool = false;
      }

      return (
        <InterestCard
          key={i}
          dim={bool}
          image={images[id]}
          data={item.data}
          item={item}
          loading={loading}
          toggleCard={this.toggleCard}
        />
      );
    });
  }
  render() {
    let topic = this.state.topics;
    return (
      <View style={styles.container} keyboardShouldPersistTaps="always">
        <Analytics ref="analytics" />
        <ScrollView keyboardShouldPersistTaps="always">
          <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
            {this.createInterests()}
          </View>
        </ScrollView>
      </View>
    );
  }
}

class InterestCard extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      dim: false,
      loading: false
    };
  }

  static defaultProps = {
    data: null,
    image: "",
    dim: false
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.dim !== this.props.dim ||
      prevProps.loading !== this.props.loading
    ) {
      this.setState({
        dim: this.props.dim,
        loading: this.props.loading
      });
    }
  }

  componentDidMount() {
    this.setState({
      dim: this.props.dim,
      loading: this.props.loading
    });
  }

  render() {
    let addRemoveInterest = "Add";
    if (this.state.dim && !this.props.loading) {
      addRemoveInterest = "Remove";
    }
    var loadingView = (
      <View style={styles.loaderStyle}>
        <ActivityIndicator size={"large"} animating={true} color="maroon" />
      </View>
    );
    return (
      <TouchableOpacity
        style={[styles.card]}
        onPress={() => {
          this.props.toggleCard(this.props.item);
          this.setState({
            loading: true
          });
        }}
        accessibilityLabel={`${this.props.data.title}: ${addRemoveInterest} interest`}
        accessibilityRole="button"
      >
        <View style={styles.cardContainer}>
          <View
            style={[
              !this.state.dim && styles.dimmed,
              styles.cardContainerContent
            ]}
          >
            <View style={styles.imageView}>
              <Image style={styles.image} source={this.props.image} />
            </View>
            <View style={styles.interestView}>
              <Text style={styles.interest}>{this.props.data.title}</Text>
            </View>
          </View>
          {this.state.loading && loadingView}
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    paddingTop: 5,
    ...Platform.select({
      ios: {
        paddingTop: 5
      }
    })
  },
  loaderStyle: {
    position: "absolute",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  rowView: {
    flex: 1,
    flexDirection: "row"
  },
  rowHidden: {
    display: "none"
  },
  card: {
    width: (window.width - 40) / 3,
    height: responsiveHeight(22),
    marginHorizontal: 5,
    marginVertical: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 40, height: 40 },
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  dimcard: {
    width: (window.width - 50) / 3,
    height: 150,
    marginHorizontal: 5,
    marginVertical: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 40, height: 40 },
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    opacity: 0.3
  },
  notdim: {
    opacity: 1.0
  },
  dimmed: {
    opacity: 0.3
  },
  cardContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  cardContainerContent: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between"
  },
  imageView: {
    flex: 2
  },
  image: {
    height: responsiveWidth(25),
    borderRadius: 42,
    width: responsiveWidth(25),
    alignItems: "center",
    marginVertical: 5
  },
  interestView: {
    flex: 1,
    justifyContent: "center"
  },
  interest: {
    fontWeight: "bold",
    //marginTop: responsiveHeight(1),
    fontSize: responsiveFontSize(1.8),
    textAlign: "center",
    fontFamily: "Roboto"
  },
  list: {
    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap"
  },
  title: {
    fontSize: 20,
    paddingVertical: 20,
    color: "#999999"
  },
  list: {
    flex: 1
  },
  contentContainer: {
    width: window.width,
    ...Platform.select({
      ios: {
        paddingHorizontal: 30
      },
      android: {
        paddingHorizontal: 0
      }
    })
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    height: 60,
    flex: 1,
    marginTop: 7,
    marginBottom: 12,
    borderRadius: 4,

    ...Platform.select({
      ios: {
        width: window.width - 30 * 2,
        shadowColor: "rgba(0,0,0,0.2)",
        shadowOpacity: 1,
        shadowOffset: { height: 2, width: 2 },
        shadowRadius: 2
      },

      android: {
        width: window.width - 30 * 2,
        elevation: 0,
        marginHorizontal: 30
      }
    })
  },

  text: {
    fontSize: 24,
    color: "#222222"
  }
});
