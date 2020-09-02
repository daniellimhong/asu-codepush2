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
  ListView,
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import WHCLineItem from "./WHCLineItem";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
// import useGlobal from "../../functional/global-state/store";
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
  cardButtonContainer: {
    paddingHorizontal: 15,
    marginTop: 20,
  },
  mainContainer: {
    backgroundColor: "#F0F0F0",
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

function WHCParentOS(props) {
  // const [globalState, globalActions] = useGlobal();
  const analyticsRef = useRef(null);

  const symptoms = [
    "Fever or chills",
    "Cough",
    "Shortness of breath or difficulty breathing",
    "Fatigue",
    "Muscle or body aches",
    "Headache",
    "New loss of taste or smell",
    "Sore throat",
    "Congestion or runny nose",
    "Nausea or vomiting",
    "Diarrhea",
  ];

  const helpfulLinks = [
    {
      text: "Coronavirus FAQs",
      link: "https://eoss.asu.edu/health/announcements/coronavirus/faqs",
      imageUrl: "https://www.google.com",
    },
    {
      text: "Virtual Fitness",
      link: "https://fitness.asu.edu/home",
      imageUrl: "https://www.google.com",
    },
    {
      text: "Devils 4 Devils Support Circles",
      link: "https://eoss.asu.edu/devils4devils/support-circles",
      imageUrl: "https://www.google.com",
    },
    {
      text: "360 Life Services",
      link: "https://goto.asuonline.asu.edu/360lifeservices/",
      imageUrl: "https://www.google.com",
    },
    {
      text: "ASU Online Success Coaching",
      link: "https://goto.asuonline.asu.edu/success/coach.html",
      imageUrl: "https://www.google.com",
    },
  ];

  const pressBackHandler = () => {
    // console.log("PRESS BACK BUTTON!")
    const { navigate } = props.navigation;
    navigate("Home", {
      previousScreen: "covid-wellness",
      previousSection: "covid-wellness",
    });
  };

  const onPressWebsiteLink = () => {
    const url =
      "https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html";
    props.navigation.navigate("InAppLink", {
      url,
      title: "COVID-19 Symptoms",
    });
  };

  return (
    <ScrollView>
      <View style={styles.imageContainer}>
        <Analytics ref={analyticsRef} />
        <ImageBackground
          source={require("../assets/hero-health-check-covid-2x.png")}
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
                ASU COVID-19
              </Text>
              <Text allowFontScaling={false} style={styles.headerBig}>
                Wellness Center
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>
      <View style={styles.mainContainer}>
        <View style={styles.cardContainer}>
          <View style={styles.titleContainer}>
            <Text allowFontScaling={false} style={styles.cardTitleText}>
              COVID Symptoms to Check
            </Text>
          </View>
          <View>
            <Text allowFontScaling={false} style={styles.cardHelpText}>
              People with COVID-19 have had a wide range of symptoms reported –
              ranging from mild symptoms to severe illness. Symptoms may appear
              2-14 days after exposure to the virus. People with these symptoms
              may have COVID-19:
            </Text>

            <View
              style={{
                marginHorizontal: responsiveHeight(1),
                marginVertical: responsiveHeight(2),
              }}
            >
              {symptoms.map((el) => {
                return (
                  <Text
                    allowFontScaling={false}
                    style={styles.cardHelpText}
                  >{`\u2022 ${el}`}</Text>
                );
              })}
            </View>

            <Text allowFontScaling={false} style={styles.cardHelpText}>
              This list does not include all possible symptoms.The CDC continues
              to update their{" "}
              <Text
                style={{ textDecorationLine: "underline", color: "blue" }}
                onPress={onPressWebsiteLink}
              >
                website
              </Text>{" "}
              as they learn more about COVID-19. Contact your primary healthcare
              provider for an assessment if you have the above symptoms if you
              believe they are related to COVID-19
            </Text>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.titleContainer}>
            <Text allowFontScaling={false} style={styles.cardTitleText}>
              Helpful Links
            </Text>
          </View>
          {helpfulLinks.map((item, index) => {
            return (
              <WHCLineItem
                text={item.text}
                link={item.link}
                noIcon
                // imgUrl={item.imageUrl}
                key={index}
                analyticsRef={analyticsRef}
                section="helpful-links"
                navigation={props.navigation}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

export default WHCParentOS;
