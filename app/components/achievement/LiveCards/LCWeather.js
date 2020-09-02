import React from "react";
import { View, ImageBackground, Text, ActivityIndicator } from "react-native";
import axios from "axios";
import { responsiveFontSize } from "react-native-responsive-dimensions";
import { WeatherIconMap } from "../../../services";
import Analytics from "./../../functional/analytics";
import { tracker } from "../google-analytics.js";
import _ from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import { createIconSetFromFontello } from "react-native-vector-icons";
import fontelloConfig from "./WeatherIconsConfig.json";
import { getCampus } from "../../../services/utility/utility.js";

const WeatherIcon = createIconSetFromFontello(fontelloConfig);

/*Declaring an object which will be used in random number generator to display random images
numbers indicate the number of images in S3 corresponding to each campus-time*/
const campusImageMap = {
  Tempe: {
    morning: 2,
    afternoon: 3,
    evening: 3,
  },
  "Downtown Phoenix": {
    morning: 1,
    afternoon: 0,
    evening: 3,
  },
  "Lake Havasu": {
    morning: 1,
    afternoon: 1,
    evening: 1,
  },
  West: {
    morning: 1,
    afternoon: 1,
    evening: 1,
  },
  Thunderbird: {
    morning: 1,
    afternoon: 0,
    evening: 0,
  },
  Polytechnic: {
    morning: 1,
    afternoon: 0,
    evening: 1,
  },
};

export class LCWeather extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentTemp: "",
      city: "",
      forecast: [],
      code: "",
      dataLoaded: false,
      campus: getCampus(
        this.props.location.latitude,
        this.props.location.longitude
      ),
      campusImage:
        "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/campus-images/Tempe-1.jpg",
    };
  }

  static defaultProps = {
    iSearchData: {},
  };

  componentDidMount() {
    let locationData = {
      lat: this.props.location.latitude,
      lng: this.props.location.longitude,
    };

    //=== GET 5 DAY FORECAST ===\\
    axios
      .get(
        `https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/weather?lat=${locationData.lat}&lon=${locationData.lng}&operation=fiveDayForecast`
      )
      .then((res) => {
        // console.log('------------------------------------');
        // console.log('5 day forecast res: ', res);
        // console.log('------------------------------------');
        this.setState({
          forecast: res.data.forecast.list,
          dataLoaded: true,
        });
      })
      .catch((e) => console.log("axios forecast error: ", e));

    //=== GET TODAY's FORECAST ===\\
    axios
      .get(
        `https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/weather?lat=${locationData.lat}&lon=${locationData.lng}&operation=todaysForecast`
      )
      .then((res) => {
        // console.log('------------------------------------');
        // console.log('todays day forecast res: ', res);
        // console.log('------------------------------------');
        let city =
          res.data.forecast.name == "San Carlos"
            ? "Tempe"
            : res.data.forecast.name;
        this.setState({
          currentTemp: this.kelvinToFahr(res.data.forecast.main.temp),
          city,
          code: res.data.forecast.weather[0].id,
          dataLoaded: true,
          campusImage: this.getCampusImage(),
        });
      })
      .catch((e) => console.log("axios weather error: ", e));
    this.refs.analytics.sendData({
      "action-type": "view",
      "starting-screen": "Home",
      "starting-section": "live-cards",
      target: "Weather Card",
      "resulting-screen": "live-cards",
      "resulting-section": "weather-card",
    });
    tracker.trackEvent("View", "LC_Weather");

    let hour = moment().hour();
    let greeting = "";
    if (hour < 12) {
      greeting = "Morning";
    } else if (hour >= 12 && hour < 17) {
      greeting = "Afternoon";
    } else {
      greeting = "Evening";
    }
    this.setState({ timeOfDay: greeting.toLowerCase(), greeting: greeting });
  }

  componentDidUpdate() {
    let locationData = {
      lat: this.props.location.latitude,
      lng: this.props.location.longitude,
    };
    /**
      5 Day Forecast
     */
    axios
      .get(
        `https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/weather?lat=${locationData.lat}&lon=${locationData.lng}&operation=fiveDayForecast`
      )
      .then((res) => {
        if (!_.isEqual(this.state.forecast, res.data.forecast.list)) {
          this.setState({
            forecast: res.data.forecast.list,
          });
        }
      })
      .catch((e) => console.log("axios forecast error: ", e));

    //=== GET TODAY's FORECAST ===\\
    axios
      .get(
        `https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/weather?lat=${locationData.lat}&lon=${locationData.lng}&operation=todaysForecast`
      )
      .then((res) => {
        let city =
          res.data.forecast.name == "San Carlos"
            ? "Tempe"
            : res.data.forecast.name;
        if (
          // this.state.currentTemp !== this.kelvinToFahr(res.data.main.temp) ||
          this.state.city !== city
        ) {
          this.setState({
            currentTemp: this.kelvinToFahr(res.data.forecast.main.temp),
            city,
          });
        }
      })
      .catch((e) => console.log("axios weather error: ", e));

    // Time of Day Check
    let hour = moment().hour();
    let greeting = "";
    if (hour < 12) {
      greeting = "Morning";
    } else if (hour >= 12 && hour < 17) {
      greeting = "Afternoon";
    } else {
      greeting = "Evening";
    }
    if (
      this.state.timeOfDay !== greeting.toLowerCase() ||
      this.state.greeting !== greeting
    ) {
      this.setState({
        timeOfDay: greeting.toLowerCase(),
        greeting: greeting,
      });
    }
  }

  getRandomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  getCampusImage() {
    let imageUrl =
      "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/campus-images/";
    if (campusImageMap[this.state.campus]) {
      if (campusImageMap[this.state.campus][this.state.timeOfDay] > 0) {
        imageUrl +=
          this.state.campus +
          "-" +
          this.state.timeOfDay +
          "-" +
          this.getRandomIntFromInterval(
            1,
            campusImageMap[this.state.campus][this.state.timeOfDay]
          ) +
          ".jpg";
      } else {
        imageUrl +=
          this.state.campus +
          "-morning-" +
          this.getRandomIntFromInterval(
            1,
            campusImageMap[this.state.campus]["morning"]
          ) +
          ".jpg";
      }
    } else {
      imageUrl +=
        "Tempe-" +
        this.state.timeOfDay +
        "-" +
        this.getRandomIntFromInterval(
          1,
          campusImageMap.Tempe[this.state.timeOfDay]
        ) +
        ".jpg";
    }
    return imageUrl;
  }

  kelvinToFahr = (degKelvin) => {
    return Math.floor((degKelvin * 9) / 5 - 459.67);
  };

  renderForecast() {
    return this.state.forecast.map((item) => (
      <View key={item.dt} style={styles.individualForecast}>
        <Text allowFontScaling={false} style={styles.day}>
          {moment
            .unix(item.dt)
            .format("dddd")
            .slice(0, 3)
            .toUpperCase()}
        </Text>
        <WeatherIcon
          name={WeatherIconMap[item.weather[0].id]}
          size={20}
          color="#878787"
        />
        <View style={{ flexDirection: "row" }}>
          <Text allowFontScaling={false} style={styles.highText}>
            {this.kelvinToFahr(item.temp.max) + "\u00B0" + ","}
          </Text>
          <Text allowFontScaling={false} style={styles.lowText}>
            {this.kelvinToFahr(item.temp.min) + "\u00B0"}
          </Text>
        </View>
      </View>
    ));
  }

  render() {
    const {
      CardContainer,
      imageContainer,
      textContainer,
      opaqueContainer,
      backgroundImageContainer,
      forecastContainer,
      nameTextContainer,
      nameText,
      currentTempText,
      dateLocContainer,
      dateText,
      cityText,
    } = styles;

    let displayName = _.get(this.props, "iSearchData.displayName");

    if (!this.state.dataLoaded) {
      return (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          <Analytics ref="analytics" />
          <ActivityIndicator
            size="large"
            animating={!this.state.locationLoaded}
            color="maroon"
          />
        </View>
      );
    } else {
      return (
        <View
          style={CardContainer}
          accessibilityLabel={`Good ${
            this.state.greeting
          } ${displayName}. Today is ${moment().format(
            "dddd, MMMM DD"
          )}. And the temperature is ${this.state.currentTemp} degrees.`}
        >
          <Analytics ref="analytics" />
          <View style={imageContainer}>
            <ImageBackground
              source={{ uri: this.state.campusImage }}
              style={backgroundImageContainer}
            >
              <View style={textContainer}>
                <View>
                  <Text allowFontScaling={false} style={styles.greetingText}>
                    {"Good " + this.state.greeting}
                  </Text>
                </View>
                <View style={nameTextContainer}>
                  <Text allowFontScaling={false} style={nameText}>
                    {displayName}
                  </Text>
                </View>
              </View>
              <View style={opaqueContainer}>
                <Text allowFontScaling={false} style={currentTempText}>
                  {this.state.currentTemp + "\u00B0"}
                </Text>
                <WeatherIcon
                  name={WeatherIconMap[this.state.code]}
                  size={35}
                  color="white"
                />
                <View>
                  <Text allowFontScaling={false} style={dateText}>
                    {moment()
                      .format("dddd, MMMM DD")
                      .toUpperCase()}
                  </Text>
                  <Text allowFontScaling={false} style={cityText}>
                    {this.state.city && this.state.city == "Tempe Junction"
                      ? "Tempe"
                      : this.state.city}
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </View>
          <View style={forecastContainer}>{this.renderForecast()}</View>
        </View>
      );
    }
  }
}

LCWeather.contextTypes = {
  getTokens: PropTypes.func,
};

const styles = {
  CardContainer: {
    flex: 1,
  },
  imageContainer: {
    flex: 8,
  },
  textContainer: {
    flex: 7,
    alignItems: "center",
    marginTop: 15,
  },
  greetingText: {
    color: "white",
    fontSize: responsiveFontSize(3.5),
  },
  nameTextContainer: {
    marginTop: 10,
  },
  nameText: {
    color: "white",
    fontSize: responsiveFontSize(3.5),
  },
  opaqueContainer: {
    flex: 3,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "space-around",
    alignItems: "center",
  },
  currentTempText: {
    color: "white",
    fontSize: responsiveFontSize(5.5),
  },
  dateText: {
    color: "white",
    fontSize: responsiveFontSize(1.7),
  },
  cityText: {
    color: "white",
    fontSize: responsiveFontSize(1.7),
  },
  day: {
    color: "#BBBBBB",
    fontSize: responsiveFontSize(1.7),
  },
  highText: {
    color: "#878787",
    fontSize: responsiveFontSize(1.7),
  },
  lowText: {
    color: "#bababa",
    fontSize: responsiveFontSize(1.7),
  },
  backgroundImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0)",
  },
  forecastContainer: {
    flex: 2,
    justifyContent: "space-around",
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: "row",
  },
  individualForecast: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  test2: {
    flex: 1,
    height: 80,
    overflow: "visible",
    alignItems: "center",
    alignSelf: "stretch",
  },
};

LCWeather.contextTypes = {
  getTokens: PropTypes.func,
};
