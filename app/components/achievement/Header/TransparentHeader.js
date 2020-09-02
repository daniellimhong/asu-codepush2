import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, requireNativeComponent } from "react-native";
import { NavigationActions, StackActions } from "react-navigation";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  AppRegistry,
  StyleSheet,
  Alert,
  Text,
  View,
  TouchableWithoutFeedback,
} from 'react-native';

export default function TransparentHeader(props) {
  return (
    <View style={{flex: 1, backgroundColor: "#00000055", position:'absolute', top:0, left: 0, right: 0}}>
      <TouchableWithoutFeedback
          onPress={() => {

            if( props.overrideBack ) {
              props.overrideBack();
            } else {
              props.navigation.pop();
            }
            console.log("CLICK",props)
            // const resetAction = StackActions.reset({
            //   index: 0,
            //   actions: [NavigationActions.navigate({ routeName: 'Home' })],
            // });
            // setTimeout(() => {
            //   props.navigation.pop();
            // },5000)

          }}
        >
          <View style={{display:"flex", flexDirection:"row", alignItems: "center"}}>
            <Icon name="navigate-before" size={22} color="#FFFFFF" />
            <Text style={{color:"white"}}>Go Back</Text>
          </View>
      </TouchableWithoutFeedback>
    </View>
  )
}
