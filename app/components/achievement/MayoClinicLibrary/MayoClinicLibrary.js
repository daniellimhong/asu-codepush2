import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ImageBackground,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback
} from "react-native";
import {
  responsiveFontSize,
} from "react-native-responsive-dimensions";

// import { getCovidWellnessResources } from "./Queries";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import useGlobal from "../../functional/global-state/store";
import Analytics from "../../functional/analytics";

const styles = StyleSheet.create({
  backgroundImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0)",
  },
  imageContainer: {
    width: "100%",
    height: 360,
  },
  textContainer: {
    marginTop: 130,
    paddingLeft: 15,
  },
  headerBig: {
    fontSize: responsiveFontSize(4.2),
    fontFamily: "Roboto",
    color: "white",
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  groupContainer: {
    width: "100%",
    height: 100
  },
  mainContainer: {
    backgroundColor: "#F0F0F0",
  },
  cardContainer: {
    backgroundColor: "white",
    marginBottom: 10,
  },
  mayoResource: {
    padding: 20,
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    //fontSize: responsiveFontSize(1.8),
    flex: 1
  },
  cardTitleText: {
    fontWeight: "bold",
    fontSize: responsiveFontSize(2.75),
    fontFamily: "Roboto",
    color: "black",
    marginTop: 15
  },
  headerContainer: {
    flexDirection: "row",
  },
  backButton: {
    width: 30,
    height: 30,
  },
  backbuttonConatiner: {
    padding: 15,
    flex: 0.5,
  },
  cardTagText: {
    borderWidth: 0,
    fontSize: responsiveFontSize(2.0),
    color: "#FFFFFF",
    padding: 6,
  },
  cardTagColorBlue: { // General Information
    borderColor: "#00A3E0",
    backgroundColor: "#00A3E0",
  },
  cardTagColorOrange: { // Testing
    borderColor: "#FF7F32",
    backgroundColor: "#FF7F32",
  },
  cardTagColorMaroon: { // Mental Health
    borderColor: "#8C1D40",
    backgroundColor: "#8C1D40",
  },
  cardTagColorGreen: { // Family
    borderColor: "#3c9200",
    backgroundColor: "#3c9200",
  },
  cardTagColorDefault: { // Default
    borderColor: "#333",
    backgroundColor: "#333",
  },
  loading: {
    marginTop: 20,
    backgroundColor: "white",
  },
});

function getTagColor(text) {
  switch (text) {
    case "General Information":
      return styles.cardTagColorBlue;
      break;
    case "Testing":
      return styles.cardTagColorOrange;
      break;
    case "Mental Health":
      return styles.cardTagColorMaroon;
      break;
    case "Family":
      return styles.cardTagColorGreen;
      break;
    default:
      return styles.cardTagColorDefault;
  }
}


function MayoClinicLibrary(props) {

  const [globalState, globalActions] = useGlobal();
  const analyticsRef = useRef(null);
  const [mayoResources, setMayoResources] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("LOADING DATA")

  useEffect(() => {
    const response = fetch(
      "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/mayoclinic"
    ).then(resp => resp.json())
      .then(data => {
        setMayoResources(data);
        setLoading(false);
      });
  }, [props]);
  useEffect(() => {
    analyticsRef.current.sendData({
      "action-type": "view",
      "starting-screen": props.navigation.state.params.previousScreen
        ? props.navigation.state.params.previousScreen
        : null,
      "starting-section": props.navigation.state.params.previousSection
        ? props.navigation.state.params.previousSection
        : null,
      target: "mayo-clinic-library",
      "resulting-screen": "mayo-clinic-library",
      "resulting-section": null,
    });

  }, []);

  pressBackHandler = () => {
    // console.log("PRESS BACK BUTTON!")
    const { navigate } = props.navigation;
    navigate("WHCParent", {
      previousScreen: "covid-wellness",
      previousSection: "covid-wellness",
    });
  };


  return (
    <ScrollView>
      <View style={styles.imageContainer}>
        <Analytics ref={analyticsRef} />
        <ImageBackground
          source={require("../assets/mayo-hero.jpg")}
          style={styles.backgroundImageContainer}
          resizeMode="cover"
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => pressBackHandler()}>
              <View style={styles.backbuttonConatiner}>
                <Image
                  source={require("../assets/covidWellnessCenter/left.png")}
                  style={styles.backButton}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.textContainer}>
            <View>
              <Text allowFontScaling={false} style={styles.headerBig}>
                Mayo Clinic
              </Text>
              <Text allowFontScaling={false} style={styles.headerBig}>
                Resources
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>
      <View style={styles.groupContainer}>
        <Analytics ref={analyticsRef} />
        <Image
          source={require("../assets/mayo-group.jpg")}
          style={styles.backgroundImageContainer}
        >
        </Image>
      </View>
      <View style={styles.mainContainer}>

        <View style={{backgroundColor: "white"}}>
        {loading && (<View style={styles.loading}><ActivityIndicator size={"large"} animating={true} color="maroon" /></View>)}
        </View>

        {mayoResources && (
          <View style={styles.cardContainer}>

            {mayoResources.map((item, index) => {
              return (
                <View style={styles.mayoResource}>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      props.navigation.navigate("MayoContentViewer", {
                        url: item.url
                      })
                    }
                    }>
                    <View>
                      <View style={{ borderWidth: 0, flex: 1, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', }}>

                        <Text style={[styles.cardTagText, getTagColor(item.tag)]}>
                          {item.tag}
                        </Text>
                      </View>
                      <Text allowFontScaling={false} style={styles.cardTitleText}>
                        {item.title}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export default MayoClinic = AppSyncComponent(
  MayoClinicLibrary
);
