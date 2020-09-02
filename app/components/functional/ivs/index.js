import React, { useState, useEffect } from "react";

import {
  AppRegistry,
  StyleSheet,
  Alert,
  Text,
  View,
  NativeModules,
  TouchableHighlight,
  Dimensions,
  Platform
} from 'react-native';
import axios from "axios";
import Mvm  from "./MyView.js";
import TransparentHeader from "../../achievement/Header/TransparentHeader";

export default function IVS(props) {

  const [showScreen, setShowScreen] = useState(true);
  const [emojis, setEmojis] = useState(JSON.stringify([]));
  const [shouldPlay, setShouldPlay]= useState("play");
  const streamUrl = "https://be3fab53e0f5.us-west-2.playback.live-video.net/api/video/v1/us-west-2.456214169279.channel.u6qKzyztqeo6.m3u8";

  const getEmojis = async () => {
    const response = await axios.get(
      "https://a7n0975z9k.execute-api.us-west-2.amazonaws.com/dev/emoji?type=getEmojis"
    );
    if( response.data && response.data[0] && response.data[0].name ) {
      setEmojis(JSON.stringify(response.data));
    }
  }

  useEffect(() => {
    getEmojis();
  },[])

  const requestedBack = () => {
    setShouldPlay("destroy");
    setTimeout(() => {
      props.navigation.pop();
    },50)
  }

  return (
    <View  style={{ flex: 1 }} >
      <View  style={{ flex: 1, backgroundColor:"#2c2c30" }} >
        <Mvm style={{height: "100%", width:"100%"}} shouldPlay={shouldPlay} emojis={emojis} streamUrl={streamUrl} />
      </View>
      <View style={{position: "absolute", top:0, left: 0, right: 0}}>
        <TransparentHeader {...props} overrideBack={requestedBack}/>
      </View>
    </View>
  )



}
