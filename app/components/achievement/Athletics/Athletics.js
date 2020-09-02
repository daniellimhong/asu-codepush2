import React from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import PropTypes from "prop-types";
import axios from "axios";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { Card } from "react-native-elements";
import Analytics from "./../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { LightGameBanner } from "./LightGame";
import { DefaultText as Text } from "../../presentational/DefaultText.js";
import { Api } from "../../../services/api";
import { ErrorWrapper } from "../../functional/error/ErrorWrapper";
import { SettingsContext } from "../Settings/Settings";
import GameDayNav from "./Home/GameDayNav";
import CurrentEvents from "./Home/CurrentEvents";
import AthleticsButton from "./AthleticsButton";
import Games from "./Home/Games";
import AthleticsNews from "./Home/AthleticsNews";

/**
 * Resources Home Section
 */
class AthleticsContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      ticket: {},
      games: [],
      student: true,
      creds: {
        username: null,
        password: null
      },
      credsvalid: false
    };
    this.employee = false;
  }

  static defaultProps = {
    settings: {}
  };

  /**
   * On mount, check to see if user is authenticated.
   *
   * We change the email link based on whether they are an Employee or Student
   */
  componentDidMount() {
    this.getGames();
    this.getTicketCreds();
    this.refs.analytics.sendData({
      "eventtime": new Date().getTime(),
      "action-type": "click",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null,
      "target": "ATHLETICS",
      "resulting-screen": "athletics", 
      "resulting-section": null,
    });
  }

  getGames = async () => {
    const response = await axios.get(
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/athleticsfootball"
    );
    console.log("responseee", response);
    const { games, nextGame, bannerUrl, athleticsNews } = response.data;
    this.setState({
      games,
      nextGame,
      bannerUrl,
      athleticsNews: JSON.parse(athleticsNews.body)
    });
  };

  getTicketCreds = () => {
    this.context
      .getTokens()
      .then(tokens => {
        if (tokens.username && tokens.username !== "guest") {
          let adminTicket = false;

          this.props.settings
            .getAdminSettings()
            .then(settings => {
              if (settings && settings.ticketing) {
                adminTicket = settings.ticketing;
              }
              this.setState({
                ticketing: adminTicket
              });
            })
            .catch(e => {
              console.log(e);
            });

          let apiService = new Api(
            "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
            tokens
          );

          apiService.get("/ticketcreds").then(response => {
            if (response.Item) {
              if (response.Item.email) {
                this.setState({
                  creds: {
                    username: response.Item.email,
                    password: response.Item.pass
                  },
                  credsvalid: true
                });
              }
            }
          });
        }
      })
      .catch(error => {
        this.setState({
          user: "guest"
        });
      });
  };

  _getData = async => {
    if (this.state.student) {
      this.context
        .getTokens()
        .then(tokens => {
          if (tokens.username && tokens.username !== "guest") {
            let payload = {
              token: tokens.Refresh
            };
            let apiService = new Api(
              "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
              tokens
            );

            apiService
              .post("/ticketcheck", payload)
              .then(response => {
                //API will return url to either use refresh token and go to Ticketmaster account or go to Ticketmaster login for authorization
                this.setState({
                  data: response
                });
                var url = response.url;
                this.props.navigation.navigate("InAppLink", {
                  url: url,
                  title: "Tickets",
                  token: tokens.Refresh,
                  ticketpage: "student_tickets",
                  creds: this.state.creds
                });
              })
              .catch(error => {
                console.log(error);
                throw error;
              });
          }
        })
        .catch(e => {
          console.log(e);
        });
    } else {
      tracker.trackEvent("Click", "Ticketmaster_Guest_Login");
      let guest_url = "https://am.ticketmaster.com/sundevils/";
      this.props.navigation.navigate("InAppLink", {
        url: guest_url,
        title: "Tickets"
      });
    }
  };

  render() {
    let studentJSX = (
      <Card
        image={{
          uri:
            "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/tickets-4.jpg"
        }}
        imageProps={{ resizeMode: "cover" }}
      >
        <Text
          style={{
            marginBottom: 5,
            alignSelf: "center",
            justifyContent: "space-between",
            paddingHorizontal: 10,
            paddingVertical: 10,
            fontFamily: "Roboto"
          }}
        >
          In-App Ticketing coming soon!
        </Text>
      </Card>
    );

    if (this.state.ticketing) {
      studentJSX = (
        <Card
          image={{
            uri:
              "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/tickets-4.jpg"
          }}
          imageProps={{
            resizeMode: "stretch"
          }}
        >
          <Text
            style={[styles.text, { paddingVertical: 20, textAlign: "center" }]}
          >
            You can now access your tickets in-app! Connect to your Ticketmaster
            account to retrieve your tickets to upcoming events.
          </Text>
          {this.state.credsvalid && (
            <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
              <Text style={{ marginBottom: 10 }}>
                Here are your credentials to login below:
              </Text>
              <Text
                style={{
                  marginBottom: 10,
                  fontWeight: "bold",
                  alignSelf: "flex-start",
                  fontFamily: "Roboto"
                }}
              >
                Username: {this.state.creds.username}
              </Text>
              <Text
                style={{
                  marginBottom: 10,
                  fontWeight: "bold",
                  alignSelf: "flex-start",
                  fontFamily: "Roboto"
                }}
              >
                Password: {this.state.creds.password}
              </Text>
            </View>
          )}
          <View style={{ paddingHorizontal: 40, paddingBottom: 20 }}>
            <AthleticsButton
              text={"TICKETMASTER LOGIN"}
              previous_screen={"athletics"}
              previous_section={"ticketmaster-student-access"}
              onPress={() => {
                this.refs.analytics.sendData({
                  "eventtime": new Date().getTime(),
                  "action-type": "click",
                  "starting-screen": "athletics",
                  "starting-section": "ticketmaster-student-access", 
                  "target": "TICKETMASTER LOGIN",
                  "resulting-screen": "in-app-browser", 
                  "resulting-section": "tickets",
                });
                tracker.trackEvent("Click", "Ticketmaster_Student_Login");
                this._getData();
              }}
            />
          </View>
        </Card>
      );
    }
    // if(this.state.data.length > 0){
    let { navigate } = this.props.navigation;
    return (
      <View>
        <ScrollView style={styles.container}>
          <Analytics ref="analytics" />
          <GameDayNav navigation={this.props.navigation} />
          {this.state.student ? (
            studentJSX
          ) : (
            <Card
              image={require("../assets/tickets-3.jpg")}
              imageProps={{ resizeMode: "cover" }}
            >
              <Text style={styles.text}>
                You can now access your tickets in-app! Connect to your
                Ticketmaster account to retrieve your tickets to upcoming
                events.
              </Text>
              <View style={{ paddingHorizontal: 30, paddingBottom: 20 }}>
                <AthleticsButton
                  text={"TICKETMASTER LOGIN"}
                  previous_screen={"athletics"}
                  previous_section={"ticketmaster-guest-access"}
                  onPress={() => {
                    this.refs.analytics.sendData({
                      "eventtime": new Date().getTime(),
                      "action-type": "click",
                      "starting-screen": "athletics",
                      "starting-section": "ticketmaster-guest-access", 
                      "target": "TICKETMASTER LOGIN",
                      "resulting-screen": "in-app-browser", 
                      "resulting-section": "tickets",
                    });
                    tracker.trackEvent("Click", "Ticketmaster_Guest_Login");
                    this._getData();
                  }}
                />
              </View>
            </Card>
          )}

          <CurrentEvents
            navigation={this.props.navigation}
            nextGame={this.state.nextGame}
          />
          {this.state.games ? (
            <Card
              image={{ uri: this.state.bannerUrl }}
              imageProps={{
                resizeMode: "stretch",
                accessible: true,
                accessibilityLabel: "Football Schedule"
              }}
            >
              <Games
                navigation={this.props.navigation}
                games={this.state.games}
              />
            </Card>
          ) : null}
          <Card title="Not sure where to park?">
            <View style={{ paddingBottom: 20 }}>
              <Text
                style={styles.name}
              >{`We've outfitted many of our lots with real-time parking sensors. Availability of nearby lots is displayed in colored overlays.`}</Text>
            </View>
            <View style={{ paddingHorizontal: 30 }}>
              <AthleticsButton
                text={"VIEW PARKING MAP"}
                previous_screen={"athletics"}
                previous_section={"athletics-parking-map"}
                onPress={() => {
                  this.refs.analytics.sendData({
                    "eventtime": new Date().getTime(),
                    "action-type": "click",
                    "starting-screen": "athletics",
                    "starting-section": "athletics-parking-map", 
                    "target": "VIEW PARKING MAP",
                    "resulting-screen": "in-app-browser", 
                    "resulting-section": "parking-map",
                  });
                  tracker.trackEvent("Click", "Athletics_Parking");
                  navigate("InAppLink", {
                    url:
                      "https://gis.m.asu.edu/asucampus/?id=120#!ce/6292?ct/6293,6307,6310,6311,6312,6313,6345,6348,6669,6670,24284",
                    title: "Parking Map"
                  });
                }}
              />
            </View>
          </Card>
          <AthleticsNews
            navigation={this.props.navigation}
            athleticsNews={this.state.athleticsNews}
          />
        </ScrollView>
      </View>
    );
  }
}

AthleticsContent.contextTypes = {
  getTokens: PropTypes.func
};

export class Athletics extends React.Component {
  render() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <ErrorWrapper>
            <AthleticsContent {...this.props} settings={settings} />
          </ErrorWrapper>
        )}
      </SettingsContext.Consumer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: responsiveHeight(3)
  },
  image: {
    height: responsiveWidth(22),
    borderRadius: responsiveWidth(3),
    width: responsiveWidth(22),
    alignItems: "center",
    marginTop: 5
  },
  tickets: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    height: "100%",
    backgroundColor: "#ffffff"
  },
  loadingText: {
    fontSize: 20,
    marginTop: 200,
    fontWeight: "500",
    fontFamily: "Roboto",
    color: "black",
    paddingBottom: 5,
    textAlign: "center"
  },
  text: {
    marginBottom: 10,
    alignSelf: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 30,
    flex: 1,
    fontFamily: "Roboto"
  }
});
