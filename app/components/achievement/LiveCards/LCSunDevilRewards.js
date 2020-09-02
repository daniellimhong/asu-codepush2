import React, { useState, useEffect } from "react";
import { View, ImageBackground, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import PitchForksBarComponent from "../Profile/SDRPitchforks/PitchForksBarComponent";
import { AsyncStorage } from 'react-native';
import {
    responsiveFontSize
  } from "react-native-responsive-dimensions";

import useGlobal from "../../functional/global-state/store";

let pitchforkBarStyles = StyleSheet.create({
    CardContainer: {
        flex: 1
    },
    backgroundImageContainer:{
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0)"
    },
    imageContainer: {
        maxHeight: 202,
        width: "100%",
        height: "45%"
    },
    textContainer: {
        paddingTop: 50,
        paddingLeft: 15
    },
    imageTextWhite:{
        fontSize: responsiveFontSize(4.2),
        color: "white",
        fontWeight: "bold",
        alignSelf: 'flex-start',
    },
    imageTextBlack:{
        fontSize: responsiveFontSize(4.2),
        color: "black",
        fontWeight: "bold",
        backgroundColor: "white",
        alignSelf: 'flex-start',
        paddingHorizontal: 5
    },
    newFeature:{
        alignSelf: "flex-start",
        fontSize: responsiveFontSize(2),
        color: "black",
        backgroundColor: "#FFC627",
        fontWeight: "bold",
        padding: 5,
        borderRadius: 2
    },
    newFeatureContainer:{
        paddingLeft: 15,
        marginTop: -15
    },
    mainTextContainer:{
        paddingHorizontal: 15
    },
    mainTextBold:{
        fontWeight: "bold",
        fontSize: responsiveFontSize(2.2),
        color:"black"
    },
    mainText:{
        fontSize: responsiveFontSize(2),
        color:"black",
        fontWeight: "bold",
        paddingVertical: 5
    },
    helpText: {
        fontSize: responsiveFontSize(2),
        color:"black"
    },
    mainContainer:{
        flex: 0.9
    },
    barContainer:{
        paddingHorizontal: 10
    },
    registeredText: {
        fontSize: 8,
        textAlignVertical: "bottom",
        paddingBottom: 6,
        alignSelf: "flex-end",
        color: "white"
    }
});

export function LCSunDevilRewards(props){
    const [globalState, globalActions] = useGlobal();

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

    useEffect(()=>{
        _retrieveData("sdr_login_status").then((response) => {
            if(globalState.SDRLoginStatus != (response=="true"))
                globalActions.setSDRLoginStatus(response=="true");
        });
    },[globalState]);

    pressHandler = () => {
        const { navigate } = props.navigation;
        navigate("SunDevilRewards", {previousScreen: "Home", previousSection: "live-cards"});
    }

    return(
        <TouchableWithoutFeedback onPress={() => pressHandler()}>
            <View style = {pitchforkBarStyles.CardContainer}>
                <View style={pitchforkBarStyles.imageContainer}>
                    <ImageBackground
                        source={require("../assets/hero-live-card-2x.png")}
                        style={pitchforkBarStyles.backgroundImageContainer}
                        resizeMode="cover"
                    >
                        <View style={pitchforkBarStyles.textContainer}>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={pitchforkBarStyles.imageTextWhite}>Sun Devil</Text>
                                <Text style={pitchforkBarStyles.registeredText}>{'\u00ae'}</Text>
                            </View>
                            <View>
                                <Text style={pitchforkBarStyles.imageTextBlack}>Rewards</Text>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
                <View style={pitchforkBarStyles.mainContainer}>
                    <View style={pitchforkBarStyles.newFeatureContainer}>
                        <Text style={pitchforkBarStyles.newFeature}>New Feature</Text>
                    </View>
                    <View style={pitchforkBarStyles.mainTextContainer}>
                        <Text style={pitchforkBarStyles.mainTextBold}>Welcome to:</Text>
                        <Text style={pitchforkBarStyles.mainTextBold}>Sun Devil Rewards</Text>
                    </View>
                    <View style={pitchforkBarStyles.mainTextContainer}>
                        <Text style={pitchforkBarStyles.mainText}>
                            Your ticket to rewards money can't buy!
                        </Text>
                        {!globalState.SDRLoginStatus &&
                        <Text style={pitchforkBarStyles.helpText}>
                            Become the ultimate insider on all things ASU. Earn Pitchforks you can redeem for VIP tickets to athletics and arts events, only-at-ASU experiences, exclusive Sun Devil merchandise and more.
                        </Text>}
                    </View>
                    {globalState.SDRLoginStatus && 
                        <View style={pitchforkBarStyles.barContainer}>
                            <PitchForksBarComponent {...this.props} ></PitchForksBarComponent>
                        </View>
                    }
                </View>

                
            </View>
        </TouchableWithoutFeedback>
    )
}