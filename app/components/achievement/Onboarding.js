import React from "react";
import {
  View,
  Image,
  Dimensions,
  Text,
  AsyncStorage,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  AccessibilityInfo
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import Carousel, { Pagination } from "react-native-snap-carousel";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import LinearGradient from "react-native-linear-gradient";
import Covid19Onboarding from "./Home/covid19Wellness/Covid19onboarding";

const { width: viewportWidth, height: viewportHeight } = Dimensions.get(
  "window"
);

function wp(percentage) {
  const value = (percentage * viewportWidth) / 100;
  return Math.round(value);
}

const slideHeight = viewportHeight * 0.75;
const slideWidth = wp(85);
const itemHorizontalMargin = wp(2);
const sliderWidth = viewportWidth;
const itemWidth = slideWidth + itemHorizontalMargin * 1;
const entryBorderRadius = 5;

/**
 * On startup, display a carousel of cards for users to review before continuing to the app.
 * Only happens once.
 *
 * ToDo
 * - Cards should be maintainable from a remote dashboard
 */
export class Onboarding extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      needOnboard: false,
      modal: [
        {
          card: OnboardingModal1
        },
        {
          card: OnboardingModal2
        },
        {
          card: OnboardingModal3
        },
        {
          card: OnboardingModal4
        },
        {
          card: OnboardingModal6
        }
      ],
      active: 0
    };
  }

  /**
   * On mount, verify that the app has not already onboarded users
   */
  componentDidMount() {
    let accessible;
    AccessibilityInfo.fetch().then(accessiblilityEnabled => {
      accessible = accessiblilityEnabled;
    });
    AsyncStorage.getItem("onboarding")
      .then(status => {
        if (status == null && !accessible) {
          this.setState({
            needOnboard: true
          });
        }
      })
      .catch(error => {
        throw error;
      });
  }

  /**
   * Should be fired when a user goes through the onboarding.
   *
   * Store a value in storage under onboarding to notify the app
   * that the user has indeed completed the onboarding process.
   */
  completed() {
    AsyncStorage.setItem("onboarding", "aboard")
      .then(status => {
        this.setState({
          needOnboard: false
        });   
      })
      .catch(error => {
        throw error;
      });
  }

  /**
   * Callback function for the carousel to properly render
   * one of the onboarding cards
   */
  _renderItem({ item, index }) {
    let OnCard = item.card;
    return (
      // <View
      //   style={{
      //     width: Dimensions.get('window').width,
      //     height: Dimensions.get('window').height,
      //     paddingHorizontal: 0,
      //     shadowColor: "black",
      //     shadowOpacity: 0.25,
      //     shadowOffset: { width: 0, height: 10 },
      //     shadowRadius: 10,
      //     borderBottomLeftRadius: entryBorderRadius,
      //     borderBottomRightRadius: entryBorderRadius
      //   }}
      // >
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <OnCard />
        </View>
      </View>
    );
  }

  render() {
    const {
      active,
      activeOpacity,
      carouselRef,
      color,
      containerStyle,
      inactiveColor,
      inactiveStyle,
      inactiveOpacity,
      inactiveScale,
      index,
      style,
      tappable
    } = this.props;

    const onPress = _slider1Ref => {
      _slider1Ref &&
        _slider1Ref._snapToItem(
          _slider1Ref._getPositionIndex(++this.state.active)
        );
      this.state.active = ++this.state.active;
    };

    return (
      <View style={{ flex: 1 }}>
        {/**
         * If onboarding is necessary, render the carousel
         */
        this.state.needOnboard && (
          <View style={styles.onboardingContainer}>
            <Carousel
              ref={c => (this._slider1Ref = c)}
              data={this.state.modal}
              renderItem={this._renderItem}
              sliderWidth={sliderWidth}
              // itemWidth={itemWidth}
              itemWidth={Dimensions.get("window").width}
              firstItem={this.state.active}
              inactiveSlideScale={0.94}
              inactiveSlideOpacity={0.7}
              inactiveSlideShift={0}
              containerCustomStyle={styles.slider}
              contentContainerCustomStyle={styles.sliderContentContainer}
              onSnapToItem={index => {
                if (index == this.state.modal.length - 1) {
                  this.completed();
                } else {
                  this.setState({ active: index });
                }
              }}
            />
            <Pagination
              dotsLength={this.state.modal.length - 1}
              activeDotIndex={this.state.active}
              containerStyle={{ marginBottom: responsiveHeight(4) }}
              containerStyle={{
                position: "absolute",
                bottom: responsiveHeight(7),
                alignSelf: "center"
              }}
              dotColor={"rgb(255, 255, 255)"}
              dotStyle={{
                width: responsiveWidth(3.2),
                height: responsiveWidth(3.2),
                borderRadius: responsiveWidth(3.2) / 2,
                marginHorizontal: responsiveWidth(0.7)
              }}
              inactiveDotColor={"white"}
              inactiveDotOpacity={1}
              inactiveDotScale={1}
              inactiveDotStyle={{
                width: responsiveWidth(2),
                height: responsiveWidth(2),
                borderRadius: responsiveWidth(2) / 2
              }}
              carouselRef={this._slider1Ref}
              tappableDots={!!this._slider1Ref}
            />
          </View>
        )}
        {!this.state.needOnboard &&
          <Covid19Onboarding />
        }
        {this.props.children}
      </View>
    );
  }
}

Onboarding.contextTypes = {
  logout: PropTypes.func,
  setModalContent: PropTypes.func,
  setModalVisible: PropTypes.func,
  renderOtherElement: PropTypes.func
};

/**
 * Modal content to be passed into the HomeModal in order to grab user feedback
 */
class OnboardingModal1 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fresh: true,
      title: "Welcome to the ASU Mobile App",
      body:
        "Home to everything you need \nto start your year off right.\nWe got you."
      // title: "",
      // body: ""
    };
  }

  componentDidMount() {
    this.context
      .getAdminSettings()
      .then(resp => {
        if (resp && resp.modal1) {
          this.setState({
            title: resp.modal1.title,
            body: resp.modal1.body
          });
        }
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    return (
      <LinearGradient colors={["#ffc266", "#e68a00"]} style={{ flex: 1 }}>
        <View style={styles.modalContainer}>
          <Image
            style={{ height: responsiveWidth(50), width: responsiveWidth(50) }}
            source={require("./assets/icon-welcome.png")}
          />
          <Text style={[styles.modalHeader, styles.black]}>
            {this.state.title}
          </Text>
          <Text style={[styles.modaltext, styles.black]}>
            {this.state.body}
          </Text>
        </View>
      </LinearGradient>
    );
  }
}

OnboardingModal1.contextTypes = {
  getAdminSettings: PropTypes.func
};

class OnboardingModal2 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fresh: true,
      title: "Your daily schedule",
      body:
        "View your class schedule, get directions\nto your classes, and other ASU\nevents you don't want to miss."
    };
  }

  componentDidMount() {
    this.context
      .getAdminSettings()
      .then(resp => {
        if (resp && resp.modal2) {
          this.setState({
            title: resp.modal2.title,
            body: resp.modal2.body
          });
        }
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    return (
      <LinearGradient colors={["#7bc421", "#37570f"]} style={{ flex: 1 }}>
        <View style={styles.modalContainer}>
          <Image
            style={{ height: responsiveWidth(50), width: responsiveWidth(50) }}
            source={require("./assets/icon-schedule.png")}
          />
          <Text style={[styles.modalHeader, styles.white]}>
            {this.state.title}
          </Text>
          <Text style={[styles.modaltext, styles.white]}>
            {this.state.body}
          </Text>
        </View>
      </LinearGradient>
    );
  }
}

OnboardingModal2.contextTypes = {
  getAdminSettings: PropTypes.func
};

class OnboardingModal3 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fresh: true,
      title: "Five-star dining",
      body:
        "View and reload meal plan balances,\nadd M&G, and view campus dining\nmenus and nutrition information."
    };
  }

  componentDidMount() {
    this.context
      .getAdminSettings()
      .then(resp => {
        if (resp && resp.modal3) {
          this.setState({
            title: resp.modal3.title,
            body: resp.modal3.body
          });
        }
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    return (
      <LinearGradient colors={["#1ac2ff", "#005e80"]} style={{ flex: 1 }}>
        <View style={styles.modalContainer}>
          <Image
            style={{ height: responsiveWidth(50), width: responsiveWidth(50) }}
            source={require("./assets/icon-dining.png")}
          />
          <Text style={[styles.modalHeader, styles.white]}>
            {this.state.title}
          </Text>
          <Text style={[styles.modaltext, styles.white]}>
            {this.state.body}
          </Text>
        </View>
      </LinearGradient>
    );
  }
}

OnboardingModal3.contextTypes = {
  getAdminSettings: PropTypes.func
};

class OnboardingModal4 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fresh: true,
      title: "ASU Library",
      body:
        "Renew books, view requests, check\nthe hours and occupancy at any\ncampus library location, and make\nstudy room reservations."
    };
  }

  componentDidMount() {
    this.context
      .getAdminSettings()
      .then(resp => {
        if (resp && resp.modal4) {
          this.setState({
            title: resp.modal4.title,
            body: resp.modal4.body
          });
        }
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    return (
      <LinearGradient colors={["#ae1e4b", "#410b1c"]} style={{ flex: 1 }}>
        <View style={styles.modalContainer}>
          <Image
            style={{ height: responsiveWidth(50), width: responsiveWidth(50) }}
            source={require("./assets/icon-library.png")}
          />
          <Text style={[styles.modalHeader, styles.white]}>
            {this.state.title}
          </Text>
          <Text style={[styles.modaltext, styles.white]}>
            {this.state.body}
          </Text>
        </View>
      </LinearGradient>
    );
  }
}

OnboardingModal4.contextTypes = {
  getAdminSettings: PropTypes.func
};

class OnboardingModal6 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fresh: true
    };
  }

  render() {
    return (
      <View
        style={{
          backgroundColor: "rgba(0,0,0,0)",
          flex: 1,
          alignItems: "stretch",
          justifyContent: "center"
        }}
      >
        <View
          style={{
            flex: 0.8,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 30
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  onboardingContainer: {
    zIndex: 10,
    position: "absolute",
    backgroundColor: "rgba(0,0,0,1)",
    height: responsiveHeight(100),
    width: responsiveWidth(100)
  },
  modalHeader: {
    textAlign: "center",
    // padding: responsiveHeight(5),
    margin: responsiveHeight(5),
    marginTop: responsiveHeight(8),
    paddingHorizontal: responsiveWidth(8),
    fontWeight: "800",
    fontFamily: 'Roboto',
    fontSize: responsiveHeight(3.5),
    lineHeight: responsiveFontSize(3.8),
    width: responsiveWidth(70)
    // flex: 1
  },
  modaltext: {
    textAlign: "center",
    paddingBottom: responsiveHeight(5),
    fontSize: responsiveHeight(2.7),
    lineHeight: responsiveFontSize(3.5)
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // height: "100%",
    // width: "100%",
    padding: responsiveWidth(15),
    paddingBottom: responsiveWidth(25)
  },
  white: {
    color: "white"
  },
  black: {
    color: "black"
  }
});
