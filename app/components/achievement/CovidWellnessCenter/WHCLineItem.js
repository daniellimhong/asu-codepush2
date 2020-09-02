import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Linking,
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

let styles = StyleSheet.create({
  lineItem: {
    borderTopWidth: 1,
    marginHorizontal: 10,
    justifyContent: "center",
    paddingVertical: 10,
    borderColor: "#D8D8D8",
  },
  label: {
    fontSize: responsiveFontSize(2),
    fontFamily: "Roboto",
    color: "black",
  },
  canvas: {
    flex: 1,
    alignItems: "flex-start",
    width: 40,
    height: 40,
  },
  textContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    margin: 10,
  },
  imageContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
});

export default function WHCLineItem(props) {
  const navigateToPage = () => {
    // console.log("ORIOS", props);
    const { navigate } = props.navigation;
    navigate("CovidContractTracing", {
      screen: props.text === "Exposure Management" ? 1 : 2,
    });
  };

  return (
    <View
      accessible={true}
      accessibilityLabel={props.text}
      accessibilityRole="button"
      style={styles.lineItem}
    >
      <TouchableOpacity
        onPress={() => {
          // console.log("props: ", props);
          if (
            props.text === "Exposure Management" ||
            props.text === "Daily Health Checks"
          ) {
            props.analyticsRef.current.sendData({
              "action-type": "click",
              "starting-screen": "covid-wellness",
              "starting-section": props.section,
              target: props.text,
              "resulting-screen": "covid-permissions",
              "resulting-section":
                props.text === "Exposure Management"
                  ? "exposure-management"
                  : "daily-healthcheck",
              "action-metadata": {
                url: props.link,
              },
            });
            navigateToPage();
          } 
          else if (props.text === "Mayo Clinic Information Library") {
            props.navigation.navigate("MayoClinicLibrary", {
              previousScreen: "covid-wellness",
              previousSection: "covid-wellness",
            });
          } 

          else if (props.link) {
            props.analyticsRef.current.sendData({
              "action-type": "click",
              "starting-screen": "covid-wellness",
              "starting-section": props.section,
              target: props.text,
              "resulting-screen": "external-browser",
              "resulting-section": null,
              "action-metadata": {
                url: props.link,
              },
            });
            // Linking.openURL(props.link);
            props.navigation.navigate("InAppLink", {
              url: props.link,
              title: props.text,
            });

          }
        }}
      >
        <View
          style={{
            margin: responsiveWidth(0.1),
            alignItems: "flex-start",
            flexDirection: "row",
          }}
        >
          {!props.noIcon && (
            <View style={styles.imageContainer}>
              <Image
                style={styles.canvas}
                resizeMode="contain"
                resizeMethod="resize"
                source={props.imgUrl}
              />
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.label}>{props.text}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
