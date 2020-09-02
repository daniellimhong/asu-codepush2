import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Analytics from "./../functional/analytics";
import { HeaderQuick } from "./Header/HeaderQuick";
import { TextItem } from "./Profile/blocks/TextItem";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

import TransitionView from "../universal/TransitionView";

export class FullInfoView extends React.PureComponent {
  render() {
    const { details, title, asurite } = this.props.navigation.state.params;

    return (
      <View style={styles.container}>
        <Analytics ref="analytics" />
        <HeaderQuick
          navigation={this.props.navigation}
          title={title}
          theme="dark"
        />
        <ScrollView style={[styles.mainCon]}>
          <View>
            {details.map((item, index) => {
              let lastItem = index == details.length - 1 ? true : false;
              item.title = item.date;
              return (
                <TransitionView
                  index={index + 1}
                  key={title + index}
                  animation={"fadeInLeft"}
                >
                  <TextItem
                    // key={title + index}
                    lastItem={lastItem}
                    navigation={this.props.navigation}
                    parent={title}
                    img={item.img}
                    text={item.itemTitle}
                    bodyText={item.text}
                    itemTitle={item.title}
                    url={item.url}
                    imgUrl={item.imgUrl}
                    extraInfo={item.extraInfo}
                    asurite={asurite}
                    useImgUrl={item.useImgUrl}
                  />
                </TransitionView>
              );
            })}
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
  mainCon: {
    margin: responsiveWidth(2.5),
    paddingHorizontal: responsiveWidth(5),
    flex: 1
  }
});
