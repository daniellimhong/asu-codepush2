import React from "react";
import {
  View,
  Image,
  Dimensions,
  Keyboard,
  Text,
  AsyncStorage,
  TextInput,
  Button,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  ListView,
  Platform,
  Linking,
  PermissionsAndroid,
  BackHandler
} from "react-native";
import { WebView } from "react-native-webview";
import { Api, Auth, User } from "../../../services";
import { lineString as makeLineString } from "@turf/helpers";
import BuildingCard from "./buildingCard.js";
import Analytics from "./../analytics";
import { tracker } from "../../achievement/google-analytics.js";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { HeaderQuick } from "../../achievement/Header/HeaderQuick";
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import PropTypes from "prop-types";
import Permissions from "react-native-permissions";
import { ErrorWrapper } from "../error/ErrorWrapper";
import { SearchBar } from "./SearchBar";

var { height, width } = Dimensions.get("window");

let layerStyles = {};

var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class MapsContent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      locationCoordinates: {
        latitude: 33.3072131,
        longitude: -111.6819465,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121
      },
      coords: null,
      searchedBuildings: [],
      isRoute: false,
      isRouteLine: false,
      selectedName: "",
      buildingDetails: null,
      buildingCode: null,
      locationInput: "",
      exploreMap: true,
      locationValid: false,
      campusBirdUrl: "https://gis.m.asu.edu/asucampus/?id=120#!sbc/",
      whatToInject: "setTimeout(function(){$('.home-button').click();}, 1000);",
      menuClosed: true,
      showImage: false,
      buildingChosen: false
    };
  }

  componentDidMount() {
    // console.log(this.props);
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": this.props.navigation.state.params && this.props.navigation.state.params.previousScreen?
          this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params && this.props.navigation.state.params.previousSection?
          this.props.navigation.state.params.previousSection:null,
      "target": this.props.navigation.state.params && this.props.navigation.state.params.target?
      this.props.navigation.state.params.target:"Maps",
      "resulting-screen": "maps", 
      "resulting-section": null,
      "target-id":this.props.navigation.state.params && this.props.navigation.state.params.locationName?
          this.props.navigation.state.params.locationName:null,
      "action-metadata":{
        "target-id":this.props.navigation.state.params && this.props.navigation.state.params.locationName?
            this.props.navigation.state.params.locationName:null,
        "data": this.props.navigation.state.params && this.props.navigation.state.params.data?
        this.props.navigation.state.params.data:null,
        "screen-type":"webview",
      }
    });
    this.getPerms();
  }

  whichPartToNavigate = () => {
    if (
      this.props.navigation.state.params &&
      !this.props.navigation.state.params.parking &&
      !this.props.navigation.state.params.webViewUrl
    ) {
      setTimeout(() => {
        this.receivedLocationName(this.props.navigation.state.params);
      }, 1600);
    }
  };

  getPerms = async () => {
    let toastMessage =
      "Please enable location for this app from device settings";
    let thiser = this;
    setTimeout(() => {
      if (!this.state.locationValid) {
        thiser.whichPartToNavigate();
      }
    }, 1000);
    if (Platform.OS == "ios") {
      Permissions.check("location").then(response => {
        if (response === "authorized") {
          navigator.geolocation.getCurrentPosition(
            position => {
              this.setState(
                {
                  locationValid: true,
                  locationCoordinates: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                  }
                },
                () => this.whichPartToNavigate()
              );
            },
            error => {
              this.setState({ locationValid: false });
            }
          );
        } else {
          this.context.SetToast(toastMessage);
          this.setState({ locationValid: false });
        }
      });
    } else {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted) {
        navigator.geolocation.getCurrentPosition(
          position => {
            this.setState(
              {
                locationValid: true,
                locationCoordinates: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                }
              },
              () => this.whichPartToNavigate()
            );
          },
          error => {
            console.log(error);
          }
        );
      }
    }
  };

  requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "ASU Mobile App Location Permission",
            message: "ASU Mobile  App needs access to your location "
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          this.getPerms();
        } else {
          // this.context.SetToast(
          //   "Please enable location for this app from device settings"
          // );
          this.setState({ locationValid: false });
        }
      } catch (err) {
        // this.context.SetToast(
        //   "Please enable location for this app from device settings"
        // );
        this.setState({ locationValid: false });
      }
    }
  };

  requestPermission = building => {
    LocationServicesDialogBox.checkLocationServicesIsEnabled({
      message:
        "<h2>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
      ok: "YES",
      cancel: "NO",
      enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
      showDialog: true, // false => Opens the Location access page directly
      openLocationServices: true, // false => Directly catch method is called if location services are turned off
      preventOutSideTouch: false, //true => To prevent the location services popup from closing when it is clicked outside
      preventBackClick: false //true => To prevent the location services popup from closing when it is clicked back button
    })
      .then(
        function(success) {
          // success => {alreadyEnabled: true, enabled: true, status: "enabled"}
          navigator.geolocation.getCurrentPosition(
            position => {
              let newCords = Object.assign({}, this.state.locationCoordinates);
              newCords.latitude = position.coords.latitude;
              newCords.longitude = position.coords.longitude;
              this.setState({
                locationValid: true,
                locationCoordinates: newCords,
                showImage: true
              });
              // this.onSelectBuilding(building);
            },
            error => {
              console.log(error), this.setState({ locationValid: false });
            }
          );
        }.bind(this)
      )
      .catch(error => {
        console.log(error.message);
      });
  };

  receivedLocationName = async params => {

    // console.log("hitting receivedLocationName",params)
    let locationName = params.locationName;
    let item = params.item;
    try {
      if (
        locationName
      ) {

        let resp = await fetch(
          `https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/mapsearch?locationName=${locationName}`
        )

        let full = await resp.json();
        // console.log("response from gis for search '"+locationName+"': ",full)
        let searchedBuildings = full;
        if (searchedBuildings.length == 0) {
          return;
        }
        Keyboard.dismiss();

        try {
          this.onSelectBuilding(searchedBuildings[0]);
        } catch( err ) {
          this.onSelectBuilding([full]);
        }

      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  wayFinding = async (building, newCords) => {
      // console.log("hitting wayFinding")
    this.setState({
      buildingDetails: building
    });
    let coords = null;
    var startLat = newCords.latitude;
    var startLong = newCords.longitude;
    try {
      if (building.map_type == "cb") {
        let resp = await fetch(
          `https://api.concept3d.com/wayfinding?map=120&key=fde41084dc57952320ce083606e77533&fromLat=${startLat}&fromLng=${startLong}&toLat=${
            building.lat
          }&toLng=${building.lng}&fromLevel=0&toLevel=0&currentLevel=0`
        );
        let respJson = await resp.json();
        let coords = null;
        if (respJson.status == "ok") {
          let coords = respJson.route[0].route;
          let coordsInvert = [];
          for (var i = 0; i < coords.length; i++) {
            var temp = [coords[i][1], coords[i][0]];
            coordsInvert.push(temp);
          }
          coords = makeLineString(coordsInvert);
          this.setState({
            coords: coords,
            isRoute: true,
            locationInput: building.name
          });
        } else {
          let coordinateJoin =
            startLong +
            "," +
            startLat +
            ";" +
            building.lng +
            "," +
            building.lat;
          let resp = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinateJoin}.json?&steps=true&access_token=pk.eyJ1IjoiY29uY2VwdDNkIiwiYSI6ImNqZjFlNmlpYTA5MmIycXQ3YnZlcDZ6NXQifQ.96V4eDdzsvLlRqR_34WwEw`
          );
          let respJson = await resp.json();
          let points = respJson.routes[0].legs[0].steps;
          let coordsInvert = [];
          for (var i = 0; i < points.length; i++) {
            for (var j = 0; j < points[i].intersections.length; j++) {
              var temp = points[i].intersections[j].location;
              coordsInvert.push(temp);
            }
          }
          this.setState({
            coords: makeLineString(coordsInvert),
            isRoute: true,
            locationInput: building.name
          });
          coords = coordsInvert;
        }
      } else {
        let coordinateJoin =
          startLong + "," + startLat + ";" + building.lng + "," + building.lat;
        let resp = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinateJoin}.json?&steps=true&access_token=pk.eyJ1IjoiY29uY2VwdDNkIiwiYSI6ImNqZjFlNmlpYTA5MmIycXQ3YnZlcDZ6NXQifQ.96V4eDdzsvLlRqR_34WwEw`
        );
        let respJson = await resp.json();
        let points = respJson.routes[0].legs[0].steps;
        let coordsInvert = [];
        for (var i = 0; i < points.length; i++) {
          for (var j = 0; j < points[i].intersections.length; j++) {
            var temp = points[i].intersections[j].location;
            coordsInvert.push(temp);
          }
        }
        this.setState({
          coords: makeLineString(coordsInvert),
          isRoute: true,
          locationInput: building.name
        });
        coords = coordsInvert;
      }
      return coords;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  onSelectBuilding = async building => {
      // console.log("hitting onSelectBuilding")
    //this.setState({ showImage: true });

    setTimeout(() => {
      // console.log("TIMEOUT",this.state.buildingChosen,building)
      if (this.state.buildingChosen) {
        this.setState({
          locationValid: false,
          showImage: true,
          buildingLat: building.lat,
          buildingLng: building.lng,
          buildingId: building.id,
          locationInput: building.name,
          buildingCode: building.code,
          buildingDetails: building,
          buildingChosen: true,
          isRoute: false
        });
      }
    }, 1000);
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({ locationValid: true });
        let newCords = Object.assign({}, this.state.locationCoordinates);
        newCords.latitude = position.coords.latitude;
        newCords.longitude = position.coords.longitude;
        //console.log('this is my position ', newCords, ' and this is the building position ', building.lat, building.lng)

        // console.log("coordinates",newCords)
        this.setState({
          showImage: true,
          locationCoordinates: newCords,
          userLat: newCords.latitude,
          userLng: newCords.longitude,
          buildingLat: building.lat,
          buildingLng: building.lng,
          buildingId: building.id,
          locationInput: building.name,
          buildingDetails: building,
          buildingChosen: true,
          isRoute: true
        });
        //  this.wayFinding(building, this.state.locationCoordinates);
      },
      error => {
        console.log("Did err: ", error);
        if (Platform.OS === "android") {
          this.requestPermission(building);
        }
      }
    );
  };

  handleLocationInput = textInput => {
    this.setState({
      locationInput: textInput,
      isRoute: false,
      buildingChosen: false
    });
    this.searchedAdresses(textInput);
  };

  searchedAdresses = async searchedText => {
      // console.log("hitting searchedAdresses")
    try {
      let resp = await fetch(
        `https://api.concept3d.com/search?map=120&key=fde41084dc57952320ce083606e77533&q=${searchedText}&ppage=15`
      );
      let searchedBuildings = await resp.json();
      if (searchedBuildings.length > 0) {
        searchedBuildings = this.rearangeSearchResults(
          searchedBuildings,
          searchedText
        );
      }

      this.setState({
        searchedBuildings,
        isRoute: false
      });
      return searchedBuildings;
    } catch (error) {
      this.setState({
        searchedBuildings: [],
        isRoute: false
      });
      return [];
    }
  };

  rearangeSearchResults = (searchedBuildings, searchedText) => {
      // console.log("hitting rearangeSearchResults")
    let removeStrangeCharacters = searchedBuildings.map((v, i, a) => {
      let buildingName = v.name.replace(/[\W_]+/g, " ").trim();
      v.name = buildingName;
      return;
    });
    let containsString = [];
    let checkForDuplicates = {};
    for (let i = 0; i < searchedBuildings.length; i++) {
      let buildingName = searchedBuildings[i].name.toLowerCase();
      let doesNameIncludeQuery = buildingName.includes(
        searchedText.toLowerCase()
      );
      if (
        checkForDuplicates[buildingName] === undefined &&
        doesNameIncludeQuery
      ) {
        checkForDuplicates[buildingName] = 1;
        containsString.push(searchedBuildings[i]);
      } else if (checkForDuplicates[buildingName]) {
        if (searchedBuildings[i].mediaUrls) {
          for (let j = 0; j < containsString.length; j++) {
            if (containsString[j].name === buildingName) {
              containsString.splice(i, 1);
            }
          }
          containsString.push(searchedBuildings[i]);
        }
      }
    }
    const NUMBER_OF_RESULTS = 5;
    splicedContainsString = containsString.splice(
      0,
      containsString.length >= NUMBER_OF_RESULTS
        ? NUMBER_OF_RESULTS
        : containsString.length
    );
    if (splicedContainsString.length > 1) {
      splicedContainsString.sort((a, b) => a.name.length - b.name.length);
    }
    return splicedContainsString;
  };

  renderBuildings = building => {
      // console.log("hitting renderBuildings")
    building.map_type = "cb";
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          this.refs.analytics.sendData({
            "action-type": "click",
            "starting-screen": "maps",
            "starting-section": null, 
            "target": "select Building:"+building.name,
            "resulting-screen": "maps", 
            "resulting-section": null,
          });
          tracker.trackEvent("Click", `maps_selectBuilding_${building.name}`);
          this.onSelectBuilding(building);
          setTimeout(() => {
            Keyboard.dismiss();
          }, 800);
        }}
        accessible={true}
        accessibilityRole={"button"}
      >
        <View style={styles.listElement}>
          <Text
            style={{
              padding: responsiveHeight(1),
              color: "black"
            }}
          >
            {building.name}
          </Text>
          <View style={{ justifyContent: "flex-end", marginLeft: "auto" }}>
            <MaterialIcon name="call-made" color="#464646" />
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  getParameterString = (params = []) => {
    return params
      .map(({ key, value }) => {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(value);

        return `${encodedKey}=${encodedValue}`;
      })
      .join("&");
  };

  openGps = () => {
      // console.log("hitting openGps")
    //var scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:'
    var end_loc =
      this.state.buildingDetails.lat + "," + this.state.buildingDetails.lng;
    var start_loc =
      this.state.locationCoordinates.latitude +
      "," +
      this.state.locationCoordinates.longitude;
    var params = [];
    params.push({
      key: "daddr",
      value: end_loc
    });
    params.push({
      key: "saddr",
      value: start_loc
    });
    var url = null;

    if (Platform.OS === "android") {
      params.push({
        key: "travelmode",
        value: `driving`
      });
      url = `http://maps.google.com/maps?${this.getParameterString(params)}`;
    } else {
      params.push({
        key: "dirflg",
        value: `d`
      });
      url = `http://maps.apple.com/?${this.getParameterString(params)}`;
    }

    this.openExternalApp(url);
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "maps",
      "starting-section": null, 
      "target": "Open Navigation",
      "resulting-screen": "maps", 
      "resulting-section": null,
      "action-metadata": { 
        "start_loc": start_loc, 
        "end_loc": end_loc
      }
    });
    tracker.trackEvent(
      "Click",
      `Maps_GPS - start_loc: ${start_loc}, end_loc: ${end_loc}`
    );
  };

  openExternalApp = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("ERROR", "Unable to open: " + url, [{ text: "OK" }]);
      }
    });
  };

  clearSearch = () => {
    this.setState({
      showImage: false
    });
  };

  openMenu = () => {
      // console.log("hitting openMenu")
    if (this.state.isRoute) {
      if (this.state.menuClosed) {
        this.myWebView.injectJavaScript(`
          (function () {
            $('.home-button').click();;
          })();
          `);
        this.myWebView.injectJavaScript(`
            (function () {
              $('#content-bar-balloon-wrapper').hide();;
            })();
            `);
        this.setState({ menuClosed: false, showImage: false });
      } else {
        // Menu Already Open
        this.myWebView.injectJavaScript(`
            (function () {
              $('#menu-overlay').click();;
            })();
            `);
        this.myWebView.injectJavaScript(`
            (function () {
              $('#content-bar-balloon-wrapper').hide();;
            })();
            `);
        this.setState({ menuClosed: false });
      }
    } else {
      if (this.state.menuClosed) {
        this.myWebView.injectJavaScript(`
          (function () {
            $('#hamburger').click();;
          })();
          `);
        this.myWebView.injectJavaScript(`
          (function () {
            $('#content-bar-balloon-wrapper').hide();;
          })();
          `);
        this.setState({ menuClosed: false, showImage: false });
      } else {
        // Menu Already Open
        this.myWebView.injectJavaScript(`
            (function () {
              $('#menu-overlay').click();;
            })();
            `);
        this.myWebView.injectJavaScript(`
            (function () {
              $('#content-bar-balloon-wrapper').hide();;
            })();
            `);
        this.setState({ menuClosed: false });
      }
    }
  };

  setShowImageFalse = () => this.setState({ showImage: false });

  _onNavigationStateChange(webViewState) {
    // console.log("url ", webViewState.url);
  }

  _onLoadEnd = () => {
    // console.log("load ended");
    // this.whichPartToNavigate();
  };

  render() {
    let whichJSToInject;

    // console.log("IS URL",this.state.isRoute);
    if (this.state.isRoute) {
      whichJSToInject =
        "setTimeout(function(){jQuery('#mobile-bar').remove(); $('#map').css('height','100%'); jQuery('#level-wrapper').remove(); jQuery('#location-services').remove(); jQuery('#baloon-wrapper').remove(); jQuery('.share-directions.icon').hide();  jQuery('#directions.bln-modal.directions-active.slide-enter-done').css('height', '0px');},}, 500);true";
    } else {
      whichJSToInject =
        "setTimeout(function(){jQuery('#mobile-bar').remove(); $('#map').css('height','100%'); jQuery('#level-wrapper').remove(); jQuery('#location-services').remove(); jQuery('.branding').hide()}, 500);true";
    }

    whichJSToInject = "";

    let showBuildingCard;

    if (this.state.showImage) {
      showBuildingCard = (
        <BuildingCard
          buildingDetails={this.state.buildingDetails}
          onNavigation={this.openGps}
          onClear={this.clearSearch}
          routeLine={this.renderRouteLine}
          setShowImageFalse={this.setShowImageFalse}
        />
      );
    } else {
      showBuildingCard = null;
    }
    let whichUrl;
    // if (this.state.isRoute) {
    //   whichUrl = `https://gis.m.asu.edu/asucampus/?id=120#!m/${
    //     this.state.buildingId
    //   }?sbc/?ct/?dir/${this.state.userLat},${this.state.userLng},driving`;
    // } else {
      if( this.state.buildingCode ) {
        whichUrl = `https://gis.m.asu.edu/asucampus/?psCode=${this.state.buildingCode}`;
      } else {
        whichUrl = `https://gis.m.asu.edu/asucampus/?z=14`;
      }

    // }

    return (
      <View style={styles.allNonMapThings}>
        <Analytics ref="analytics" />
        <HeaderQuick navigation={this.props.navigation} title={"Maps"} />
          <View style={styles.card}>
            <WebView
              source={{
                uri: whichUrl
              }}
              injectedJavaScript={whichJSToInject}
              ref={webview => {
                this.myWebView = webview;
              }}
              onNavigationStateChange={this._onNavigationStateChange.bind(this)}
              onLoadEnd={this._onLoadEnd}
              geolocationEnabled={true}
            />
            {
            // <SearchBar
            //   handleLocationInput={this.handleLocationInput}
            //   locationInput={this.state.locationInput}
            //   isRoute={this.state.isRoute}
            //   openGps={this.openGps}
            //   openMenu={this.openMenu}
            // />
            }
          </View>

        {!this.state.buildingChosen && (
          <ListView
            keyboardShouldPersistTaps="always"
            style={styles.listView}
            dataSource={ds.cloneWithRows(this.state.searchedBuildings)}
            renderRow={this.renderBuildings}
          />
        )}
        {showBuildingCard}
      </View>
    );
  }
}

MapsContent.contextTypes = {
  SetToast: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1
  },
  map: {
    display: "flex",
    ...StyleSheet.absoluteFillObject
  },
  input: {
    width: "90%",
    marginTop: "auto",
    marginBottom: "auto",
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: "white"
  },
  allNonMapThings: {
    height: "100%",
    width: "100%",
    overflow: "hidden"
  },
  card: {
    display: "flex",
    flex: 1,
    width: "100%",
    backgroundColor: "white"
  },
  inputContainer: {
    alignItems: "center",
    width: "100%",
    top: 40,
    borderRadius: 3
  },
  listElement: {
    backgroundColor: "white",
    width: "100%",
    marginBottom: 0,
    borderBottomColor: "black",
    borderBottomWidth: 0.5,
    borderLeftColor: "black",
    borderLeftWidth: 0.5,
    borderRightColor: "black",
    borderRightWidth: 0.5,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    flexDirection: "row"
  },
  listView: {
    margin: 2,
    width: "90%",
    top: 105,
    alignSelf: "center",
    position: "absolute",
    borderWidth: 0,
    borderColor: "black"
  }
});

export class Maps extends React.PureComponent {
  static navigationOptions = ({ navigation, screenProps }) => ({
    header: null
  });

  render() {
    return (
      <ErrorWrapper>
        <MapsContent {...this.props} />
      </ErrorWrapper>
    );
  }
}
