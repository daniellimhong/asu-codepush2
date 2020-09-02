import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { AddInfo } from "./AddInfo";
import { LineItem } from "./LineItem";
export class LinkBlock extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  static defaultProps = {
    asurite: "",
    details: [],
    title: "",
    id: "",
    infoDetails: null,
    roles: [],
    isearch: () => null,
    showHead: false,
    subscribeToNewFriends: () => null
  };
  render() {
    const {
      details,
      title,
      viewPage,
      viewingSelf,
      asurite,
      ownerAsurite,
      roles,
      navigation,
      actualLastNum,
      id
    } = this.props;
    if (details.length) {
      return (
        <View style={[styles.itemContBase, styles.itemCont]}>
          <View>
            <Text>{viewPage}</Text>
          </View>
          {title ? (
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 8 }}>
                <Text style={styles.mainTitle}>{title}</Text>
              </View>
              {viewingSelf === true ? (
                <AddInfo
                  type="connections"
                  asurite={asurite}
                  roles={roles}
                  details={details}
                  navigation={navigation}
                  previousScreen={this.props.previousScreen}
                  previousSection={this.props.previousSection}
                  resultingScreen={"add-connections"}
                />
              ) : null}
            </View>
          ) : null}
          <View>
            {details.map((item, index) => {
              let lastItem = index == details.length - 1 ? true : false;
              if (actualLastNum && actualLastNum == index) lastItem = true;
              
              if (item.url) {
                return (
                  <LineItem
                    key={title + index}
                    lastItem={lastItem}
                    navigation={navigation}
                    img={item.img}
                    text={item.text}
                    linkBeg={item.linkBeg}
                    url={item.url}
                    imgUrl={item.imgUrl}
                    extraInfo={item.extraInfo}
                    fullId={id}
                    viewingSelf={viewingSelf}
                    asurite={asurite}
                    ownerAsurite={ownerAsurite}
                    useImgUrl={item.useImgUrl}
                    bgColor={item.bgColor}
                    count={item.count}
                    previousScreen={this.props.previousScreen}
                    previousSection={this.props.previousSection}
                    course_id={this.props.course_id?this.props.course_id:null}
                  />
                );
              } else {
                return null;
              }
            })}
          </View>
        </View>
      );
    } else {
      return null;
    }
  }
}
const styles = StyleSheet.create({
  mainTitle: {
    fontSize: responsiveFontSize(2.2),
    marginHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(2),
    fontWeight: "bold",
    color: "black",
    fontFamily: "Roboto"
  },
  itemContBase: {
    backgroundColor: "white",
    shadowColor: "#777",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5
  },
  itemCont: {
    margin: responsiveWidth(2.5),
    paddingHorizontal: responsiveWidth(5)
  }
});