import React, { PureComponent } from "react";
import { View, Text, StyleSheet } from "react-native";
import MaroonAndGoldHeader from "./MaroonAndGoldHeader";
import MaroonAndGoldItem from "./MaroonAndGoldItem";

export default class MaroonAndGold extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <MaroonAndGoldHeader />
        <MaroonAndGoldItem />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
