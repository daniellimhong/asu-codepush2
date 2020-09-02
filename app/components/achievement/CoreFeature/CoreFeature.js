import React from "react";
import { View, StyleSheet } from "react-native";
import { ErrorWrapper } from "../../functional/error/ErrorWrapper";

/**
 * A Home page core feature. Each core feature should contain
 * a child component "preview" that will link out to that
 * feature's section of the app.
 * Ie. A News CF will have links to news articles, as well as
 * a link to the complete list of news items for review.
 */
export class CoreFeature extends React.PureComponent {
  render() {
    return (
      <ErrorWrapper>
        <View style={styles.container}>
          <View>{this.props.children}</View>
        </View>
        <View style={{ backgroundColor: "rgba(0,0,0,0)", height: 20 }} />
      </ErrorWrapper>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "red"
  },
  head: {
    height: 140
  }
});
