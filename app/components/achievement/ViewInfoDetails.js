import React from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import Button from "react-native-button";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Analytics from "./../functional/analytics";
import { HeaderQuick } from "./Header/HeaderQuick";
export class ViewInfoDetails extends React.PureComponent {
  onPressHandler = () => {
    const { url } = this.props.navigation.state.params;
    this.props.navigation.navigate("InAppLink", {
      url,
      title: "Canvas Dashboard"
    });
  };
  render() {
    const { text, title, date } = this.props.navigation.state.params;
    return (
      <View style={styles.container}>
        <Analytics ref="analytics" />
        <HeaderQuick
          navigation={this.props.navigation}
          title={date}
          theme="dark"
        />
        <ScrollView style={styles.mainCon}>
          <Text style={styles.headerText}>{title}</Text>
          <Text style={styles.mainText}>{text}</Text>
          <View
            style={{
              flex: 1,
              justifyContent: "space-evenly",
              alignItems: "center"
            }}
          >
            <View style={{ flex: 1 }} />
            <Button
              style={styles.canvasButton}
              onPress={() => this.onPressHandler()}
            >
              Open in Canvas Dashboard
            </Button>
            <View style={{ flex: 1 }} />
          </View>
        </ScrollView>
      </View>
    );
  }
}
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  mainText: {
    fontSize: responsiveFontSize(1.75),
    color: "black",
    marginBottom: responsiveHeight(1)
  },
  headerText: {
    color: "black",
    fontSize: responsiveFontSize(2),
    fontWeight: "bold",
    marginBottom: responsiveHeight(1),
    fontFamily: "Roboto"
  },
  mainCon: {
    margin: responsiveWidth(2.5),
    paddingHorizontal: responsiveWidth(5),
    flex: 1
  },
  canvasButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 3.75,
    padding: responsiveWidth(2),
    fontSize: responsiveFontSize(1.5),
    color: "black"
  }
});
