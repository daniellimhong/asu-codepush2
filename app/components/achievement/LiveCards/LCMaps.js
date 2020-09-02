import React from "react";
import {
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { WebView } from "react-native-webview";
import {
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Analytics from "./../../functional/analytics";
import { tracker } from "../google-analytics.js";
import { getCampus } from "../../../services/utility/utility.js";

var { height } = Dimensions.get("window");

var myHeight = (height - 568 + 322.4) / 2.48;

/**
 * Live card to pull highlighted news from backend.
 *
 * ToDo - basic placeholders. Hit the RDS instance
 */
export class LCMaps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      campus: getCampus(
        this.props.location.latitude,
        this.props.location.longitude
      )
      //campus : "West"
    };
  }

  componentWillMount() {
    switch (this.state.campus) {
      case "Tempe":
        this.setState({
          webViewUrl:
            "https://gis.m.asu.edu/asucampus/?campus=tempe"
        });
        break;
      case "West":
        this.setState({
          webViewUrl:
            "https://gis.m.asu.edu/asucampus/?campus=west"
        });
        break;
      case "Polytechnic":
        this.setState({
          webViewUrl:
            "https://gis.m.asu.edu/asucampus/?campus=polytechnic"
        });
        break;
      case "Downtown Phoenix":
        this.setState({
          webViewUrl:
            "https://gis.m.asu.edu/asucampus/?campus=downtown"
        });
        break;
      case "Skysong":
        this.setState({
          webViewUrl: "https://gis.m.asu.edu/asucampus/?campus=skysong"
        });
        break;
      case "Lake Havasu":
        this.setState({
          webViewUrl: "https://gis.m.asu.edu/asucampus/?campus=havasu"
        });
        break;
      case "Research Park":
        this.setState({
          webViewUrl: "https://gis.m.asu.edu/asucampus/?campus=researchpark"
        });
        break;
      case "Thunderbird":
        this.setState({
          webViewUrl: "https://gis.m.asu.edu/asucampus/?campus=thunderbird"
        });
        break;
      default:
        this.setState({
          webViewUrl:
            "https://gis.m.asu.edu/asucampus/?campus=tempe"
        });
        break;
    }
  }

  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "view",
      "starting-screen": "Home",
      "starting-section": "live-cards", 
      "target": "Maps Card",
      "resulting-screen": "live-cards",
      "resulting-section": "maps-card",
    });
    tracker.trackEvent("View", "LC_maps");
  }

  render() {
    const { navigate } = this.props.navigation;

    //Timeout to prevent redscreen for need to return true js error
    const script = `
      setTimeout(() => {
        function checkComplete(){
          if(document.getElementById("dijit__WidgetBase_0") && document.getElementById("dijit__WidgetBase_1") && document.getElementById("jimu_dijit_AppStatePopup_0") && document.getElementsByClassName("jimu-widget").length >= 8 ){
            i = null;
            let items = document.getElementsByClassName("jimu-widget");

            for( var i = 0; i < items.length; ++i ) {
              items[i].style.opacity = "0";
            }

            document.getElementById("dijit__WidgetBase_0").style.opacity = "0";
            document.getElementById("dijit__WidgetBase_1").style.opacity = "0";
            document.getElementById("jimu_dijit_AppStatePopup_0").style.opacity = "0";

            document.getElementById("map").style.left = "0px";
          }
        }

        function setIntervalAndExecute(fn, t) {
          fn();
          return(setInterval(fn, t));
        }

        var i = setIntervalAndExecute(checkComplete, 500);
      },100)
    `;

    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        <View style={styles.mapContainer}>
          <WebView
            javaScriptEnabled={true}
            domStorageEnabled={true}
            injectedJavaScript={script}
            source={{ uri: this.state.webViewUrl+"&z=15" }}
            pointerEvents="none"
          />
          <View
            style={{
              height: "100%",
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              backgroundColor: "#fff",
              opacity: 0.1
            }}
          />
        </View>
        {/* <View style={styles.parkingTag}>
            <View style={styles.parkingHolder}>
              <Icon name={"car"} style={{marginTop:3}} size={responsiveFontSize(1.8)} color="white" />
              <Text style={styles.parkingText}>PARKING</Text>
            </View>
          </View> */}
        <View style={styles.textContainer}>
          <Text style={styles.myText}>
            Looking for somewhere on the {this.state.campus} campus? Tap
            'Navigate' to explore campus maps.
          </Text>
          <TouchableOpacity
            style={styles.maroonButton}
            onPress={() => {
              this.refs.analytics.sendData({
                "action-type": "click",
                "starting-screen": "Home",
                "starting-section": "live-cards", 
                "target": "Maps Card",
                "resulting-screen": "maps",
                "resulting-section": null,
                "action-metadata":{
                  "data":this.state.data,
                  "webview_url":this.state.webViewUrl
                }
              });
              navigate("Maps", { 
                webViewUrl: this.state.webViewUrl,
                previousScreen:"Home",
                previousSection:"live-cards-maps",
                target:"NAVIGATE",
                data:this.state.webViewUrl
              });
            }}
          >
            <Text style={styles.maroonButtonText}>NAVIGATE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 7
  },
  textContainer: {
    flex: 3,
    justifyContent: "space-around",
    alignItems: "center",
    alignSelf: "center",
    paddingLeft: responsiveWidth(10),
    paddingRight: responsiveWidth(10)
  },
  myText: {
    textAlign: "center",
    flexWrap: "wrap"
  },
  maroonButton: {
    backgroundColor: "#990033",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 120,
    marginBottom: 10
  },
  maroonButtonText: {
    fontSize: 10,
    color: "white",
    textAlign: "center",
    fontWeight: "900",
    fontFamily: 'Roboto',
  },
  parkingTag: {
    backgroundColor: "#0098df",
    position: "absolute",
    padding: 10,
    top: myHeight,
    left: "63%"
  },
  parkingText: {
    color: "white",
    textAlign: "center",
    fontSize: responsiveFontSize(1.8),
    paddingLeft: 5
  },
  parkingHolder: {
    flex: 1,
    flexDirection: "row"
  }
});
