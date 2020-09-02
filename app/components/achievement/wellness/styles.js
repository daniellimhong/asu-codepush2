import { StyleSheet } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 50,
  },
  Section: {
    fontFamily: "Roboto",
    alignContent: "center",
    minHeight: 60,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  imageContainer: {
    flex: 1,
    height: responsiveHeight(45),
    width: "100%",
  },
  eventImage: {
    flex: 1,
    alignSelf: "stretch",
  },
  heroText: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    marginLeft: responsiveWidth(5),
    marginTop: responsiveHeight(-2),
  },
  title: {
    textAlign: "center",
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0)",
    fontSize: responsiveFontSize(4.5),
    fontWeight: "bold",
    fontFamily: "Roboto",
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0)",
    fontSize: responsiveFontSize(2.4),
    fontWeight: "bold",
    fontFamily: "Roboto",
    justifyContent: "center",
    alignItems: "center",
  },
  contentHeading: {
    fontSize: responsiveFontSize(3),
    fontFamily: "Roboto",
    fontWeight: "bold",
    paddingVertical: 7,
    color: "black",
  },
  contentText: {
    color: "black",
    fontFamily: "Roboto",
    paddingVertical: 2,
  },
  contactItem: {
    marginTop: responsiveHeight(2),
  },
  contactDesc: {
    color: "black",
    fontFamily: "Roboto",
    paddingVertical: 2,
  },
  contactDetail: {
    color: "#990033",
    fontFamily: "Roboto",
    fontWeight: "bold",
    paddingVertical: 2,
  },
  mediaContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  video: {
    flex: 1,
    backgroundColor: "grey",
    width: responsiveWidth(42),
    height: responsiveWidth(23.7),
    marginTop: responsiveWidth(6.5),
  },
  youtubeIcon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoWebView: {
    flex: 1,
  },
  VideoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    margin: 0,
    width: responsiveWidth(100),
  },
});
