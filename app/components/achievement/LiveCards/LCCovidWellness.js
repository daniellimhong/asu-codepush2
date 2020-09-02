import React, { useState, useEffect } from "react";
import { View, ImageBackground, Text, StyleSheet, TouchableWithoutFeedback,TouchableOpacity } from "react-native";
import WeeklyHealthCheckComponent from "./../CovidWellnessCenter/WeeklyHealthCheckComponent";
import { AsyncStorage } from 'react-native';
import {
    responsiveFontSize,
    responsiveWidth
} from "react-native-responsive-dimensions";

// import { TouchableOpacity } from "react-native-gesture-handler";

// import useGlobal from "../../functional/global-state/store";

let covidCardStyles = StyleSheet.create({
    CardContainer: {
        flex: 1
    },
    backgroundImageContainer:{
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0)"
    },
    imageContainer: {
        // maxHeight: 282,
        width: "100%",
        height: "70%"
    },
    textContainer: {
        paddingTop: 20,
        paddingLeft: 15
    },
    header:{
        fontSize: responsiveFontSize(3.5),
        color: "white",
        fontWeight: "bold",
        alignSelf: 'flex-start'
    },
    headerBig:{
        fontSize: responsiveFontSize(4.2),
        color: "white",
        fontWeight: "bold",
        alignSelf: 'flex-start'
    },
    middleTextContainer:{
        // flex: 0.9
        marginTop: "10%",
        paddingRight: 15
    },
    middleText: {
        color: "white",
        fontSize: responsiveFontSize(2),
        fontWeight: "bold"
    },
    cardButton:{
        backgroundColor: "#FFC627",
        borderRadius: 20,
        width: 230,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    cardButtonText:{
        fontSize: responsiveFontSize(1.5),
        fontWeight: "bold",
        color: "black",
        paddingHorizontal: 3
    },
    mainContainer:{
        padding: 15
    }
});

export function LCCovidWellness(props){
    // const [globalState, globalActions] = useGlobal();

    _retrieveData = async (itemToRetrieve) => {
        try {
            const value = await AsyncStorage.getItem(itemToRetrieve);
            if (value !== null) {
            // We have data!!
            return value;
            } else {
            console.log("no data has been set");
            }
        } catch (error) {
            // Error retrieving data
        }
    };

    // pressMainHandler = () => {
    //   console.log("MAIN MAIN PRRESS")
    //     // const { navigate } = props.navigation;
    //     // navigate("DailyHealthCheck", {previousScreen: "Home", previousSection: "live-cards"});
    // }


    return(
        <TouchableWithoutFeedback>
          <WeeklyHealthCheckComponent displayType="livecard"/>
        </TouchableWithoutFeedback>
    )
}
