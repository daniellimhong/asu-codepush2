import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ImageBackground,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  PixelRatio,
} from "react-native";
import { responsiveFontSize } from "react-native-responsive-dimensions";

import useGlobal from "../../functional/global-state/store";
import Analytics from "../../functional/analytics";
import HTMLView from "react-native-htmlview";

//import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";

const baseURL =
  "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/mayoclinic?url=";

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
  cardButtonContainer: {
    paddingHorizontal: 15,
    marginTop: 20,
  },
  mainContainer: {
    backgroundColor: "#F0F0F0",
    padding: 20,
    // paddingTop:5,
    // paddingBottom:10,
    // paddingStart:10,
    // paddingEnd:10
  },
  loading: {
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 15,
    shadowColor: "#777",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
  },
  titleContainer: {
    paddingBottom: 15,
  },
  mayoResource: {
    paddingBottom: 15,
  },
  cardTitleText: {
    fontWeight: "bold",
    fontSize: responsiveFontSize(2.5),
    fontFamily: "Roboto",
    color: "black",
  },
  cardHelpText: {
    fontSize: responsiveFontSize(2),
    fontFamily: "Roboto",
    color: "black",
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    fontSize: responsiveFontSize(1.5),
    fontFamily: "Roboto",
    paddingHorizontal: 2,
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
  headerRight: {
    alignItems: "flex-end",
    flex: 0.5,
    flexDirection: "row",
  },
});

const htmlStyles = StyleSheet.create({
  h2: {
    // marginTop: 10,
    marginBottom: -20,
    fontWeight: "bold",
    fontSize: responsiveFontSize(2.8),
  },
  h3: {
    marginBottom: -20,
    fontWeight: "bold",
    fontSize: responsiveFontSize(2.8),
  },
  h4: {
    marginBottom: -15,
    fontWeight: "bold",
    fontSize: responsiveFontSize(2.4),
  },
  p: {
    // marginTop: 15,
    lineHeight: 20,
  },
  ul: {
    marginTop: -15,
    marginBottom: 15,
    lineHeight: 20,
  },
  li: {
    // paddingBottom: 10,
    // lineHeight: 20
  },
});

export default function MayoContentViewer(props) {
  const [globalState, globalActions] = useGlobal();
  const analyticsRef = useRef(null);
  const [htmlData, setHtmlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [figCaption, setFigCaption] = useState(false);

  useEffect(() => {
    const response = fetch(`${baseURL}${props.navigation.getParam("url")}`)
      .then((response) => response.json())
      .then((data) => {
        setHtmlData(data);
        setLoading(false);
      });
  }, [props]);

  pressBackHandler = () => {
    // console.log("PRESS BACK BUTTON!")
    const { navigate } = props.navigation;
    navigate("MayoClinicLibrary", {
      //previousScreen: "covid-wellness",
      //previousSection: "covid-wellness",
    });
  };

  function renderNode(node, index, siblings, parent, defaultRenderer) {
    const { width } = Dimensions.get("window");

    if (node.name == "img") {
      const { src, style, height } = node.attribs;
      const srcUrl = props.navigation.getParam("url").slice(0, 40);
      const imageHeight = height || 100;

      if (src.includes("/thumbs/")) {
        return null;
      }

      return (
        <Image
          key={index}
          source={{ uri: srcUrl + src }}
          style={{
            height: 200,
            width: Dimensions.get("window").width - 100,
            resizeMode: "cover",
          }}
        />
      );
      // return null;
    }

    if (node.name == "figcaption") {
      node.name = "p";
    }
    // removes bad duplicate of img/caption in Covid Facts page
    if (
      node.name == "figure" &&
      node.attribs.id === "67e2fd80-ff4e-45f0-86dc-6e620f04231e"
    ) {
      console.log("FIGURE HIT");
      console.log(node.attribs);
      return null;
    }
  }

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

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator
            size={"large"}
            animating={true}
            color="maroon"
            backgroundColor="white"
          />
        </View>
      )}

      {!loading && (
        <View style={styles.mainContainer}>
          {console.log(htmlData)}
          <HTMLView
            // addLineBreaks={false}
            paragraphBreak={`
          `}
            value={htmlData.replace(/(\r\n|\n|\r)/gm, "").trim()}
            stylesheet={htmlStyles}
            renderNode={renderNode}
          />
        </View>
      )}
    </ScrollView>
  );
}
