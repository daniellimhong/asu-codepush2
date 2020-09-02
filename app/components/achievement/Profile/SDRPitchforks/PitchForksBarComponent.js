import React , { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ActivityIndicator
} from "react-native";
import {getPitchforkPoints} from "./getPichforkBalanceQuery";
import { AppSyncComponent } from "../../../functional/authentication/auth_components/appsync/AppSyncApp";

const DevilLevelImages = {
    "sun" : {
        url: require("../../assets/progress-orange-2x.png")
    },
    "maroon" : {
        url: require("../../assets/progress-maroon-2x.png")
    },
    "gold" : {
        url: require("../../assets/progress-gold-2x.png")
    }
}

let pitchforkBarStyles = StyleSheet.create({
    firstBar:{
        height: 15,
        backgroundColor: "orange",
        paddingVertical: 5,
        marginVertical: 5
    },
    secondBar:{
        height: 15,
        backgroundColor: "#931e42",
        marginLeft: 3,
        paddingVertical: 5,
        marginVertical: 5
    },
    thirdBar:{
        height: 15,
        backgroundColor: "#FFC627",
        marginLeft: 3,
        paddingVertical: 5,
        marginVertical: 5
    },
    parentDiv : {
        flexDirection: "row",
        marginTop: 5,
        marginHorizontal: 15
    },
    sliderPointerImage:{
        height: 30,
        width: 30,
        position: "absolute",
        top: 0,
        left: "0%",
        flex: 1,
        resizeMode: "cover",
        alignItems: "flex-start",
        padding: 0,
        marginLeft: -15
    },
    textConatiner:{
        flex: 1,
        flexDirection: "row",
        paddingHorizontal: 10
    },
    textRow:{
        flex: 0.5
    },
    devilLevel:{
        color: "black",
        fontSize: 32,
        fontWeight: "bold"
    },
    balance:{
        color: "black",
        alignItems: "flex-end",
        alignSelf:"center",
        flex: 0.5
    },
    titleText:{
        fontSize: 15,
        color: "black",
        marginBottom: -10
    },
    titleRow:{
        paddingHorizontal: 10
    },
    points:{
        color: "black",
        fontSize: 21,
        fontWeight: "bold",
        height: 25
    },
    pointsText:{
        color: "black",
        height: 20,
        fontSize: 14
    },
    infoRow:{
        height: 50
    },
    lifetimeContainer:{
        alignItems: "flex-end",
        paddingHorizontal: 10
    },
    lifetimeText:{
        color: "black",
    },
    mainConatiner:{
        marginVertical: 5,
        flexDirection: "column"
    }
});

function PitchForksBar(props) {
    const SUN_LEVEL_LIMIT = 7499;
    const MAROON_LEVEL_LIMIT = 14999;
    const MAX_LIMIT = 999999;

    const [pointsState, setPointsState] = useState(0);
    const [imageState, setImageState] = useState("sun");
    const [imagePositionState, setImagePositionState] = useState("0%");
    const [devilState, setDevilState] = useState("Sun");
    const [lifetimeForksState, setLifeTimeForks] = useState(0);

    let imagePositionCalc = 0;
    let levelCap = SUN_LEVEL_LIMIT;
    let levelPercent = 33; //SUN DEVIL LEVEL (FIRST LEVEL) COVERS 60% OF THE BAR
    let offset = 0;
    let prevMaxCategoryValue = 0;
    const  [firstBarWidth, setFirstBarWidth] = useState("33%");
    const  [secondBarWidth, setSecondBarWidth] = useState("33%");
    const  [thirdBarWidth, setThirdBarWidth] = useState("33%");

    useEffect(() => {
        if(props.pointsSummary.getPointsSummary){
            let parsedResult = JSON.parse(props.pointsSummary.getPointsSummary.data).member_points;
            setPointsState(parsedResult.redeemable);
            setLifeTimeForks(parsedResult.total - parsedResult.pending);
        }
        if(pointsState > SUN_LEVEL_LIMIT){
            setImageState("maroon");
            setDevilState("Maroon");
            levelCap = MAROON_LEVEL_LIMIT - (SUN_LEVEL_LIMIT + 1);
            setFirstBarWidth("33%");
            setSecondBarWidth("33%");
            setThirdBarWidth("33%");
            offset = 33;
            prevMaxCategoryValue = SUN_LEVEL_LIMIT;
            if(pointsState > MAROON_LEVEL_LIMIT){
                setImageState("gold");
                setDevilState("Gold");
                levelCap = MAX_LIMIT - (MAROON_LEVEL_LIMIT + 1);
                setFirstBarWidth("33%");
                setSecondBarWidth("33%");
                setThirdBarWidth("33%");
                offset = 66;
                prevMaxCategoryValue = MAROON_LEVEL_LIMIT;
            }
        }
        imagePositionCalc = offset + ( ( (pointsState - prevMaxCategoryValue) / levelCap) * levelPercent);
        if(pointsState > MAX_LIMIT){
            imagePositionCalc = 100;
        }
        setImagePositionState(imagePositionCalc+ "%");
    },[props.pointsSummary,pointsState]);

    return(
        <View>
            {!props.pointsSummary.getPointsSummary && 
                <View style={{ alignItems: "center", paddingVertical: 30}}>
                    <ActivityIndicator size="large" color="maroon" />
                </View>
            }
            {props.pointsSummary.getPointsSummary && 
                <View style={pitchforkBarStyles.mainConatiner}>
                    <View style={pitchforkBarStyles.infoRow}>
                        <View style={pitchforkBarStyles.titleRow}>
                            <Text style={pitchforkBarStyles.titleText}>Devil Level</Text>
                        </View>
                        <View style={pitchforkBarStyles.textConatiner}>
                            <View style={pitchforkBarStyles.textRow}>
                                <Text style={pitchforkBarStyles.devilLevel}>{devilState}</Text>
                            </View>
                            <View style={pitchforkBarStyles.balance}>
                                <Text style={pitchforkBarStyles.points}>{pointsState + " "}</Text>
                                <Text style={pitchforkBarStyles.pointsText}>Pitchforks bank </Text>
                            </View>
                        </View>
                    </View>
                    <View style={pitchforkBarStyles.parentDiv}>
                        <View style={[pitchforkBarStyles.firstBar, {width: firstBarWidth} ]}>
                        </View>
                        <View style={[pitchforkBarStyles.secondBar, {width: secondBarWidth} ]}>
                        </View>
                        <View style={[pitchforkBarStyles.thirdBar, {width: thirdBarWidth} ]}>
                        </View>
                        <Image style={[pitchforkBarStyles.sliderPointerImage, {left: imagePositionState} ]} source= {DevilLevelImages[imageState].url}/>
                    </View>
                    <View style={pitchforkBarStyles.lifetimeContainer}>
                        <Text style={pitchforkBarStyles.lifetimeText}>Lifetime Pitchforks: {lifetimeForksState + " "}</Text>
                    </View>
                </View>
            }
        </View>
    )
}

export default PitchForksBarComponent = AppSyncComponent(PitchForksBar, getPitchforkPoints);

 