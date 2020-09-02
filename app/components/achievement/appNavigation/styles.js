import { StyleSheet } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

export default StyleSheet.create({
  //common (Don't change)
  fullWidth: {
    width: "100%",
  },

  flexOne: {
    flex: 1,
  },

  flexZero: {
    flex: 0,
  },

  //DrawerHeaderContent
  menuHero: {
    maxHeight: responsiveHeight(50),
    paddingVertical: responsiveWidth(2),
    flex: 1,
    justifyContent: "center",
    resizeMode: "cover",
  },

  menuHeroContent: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 10,
  },

  // DrawerUserInfo
  userInfoContainer: {
    paddingHorizontal: responsiveWidth(4),
  },
  salutationContainer: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  salutationText: {
    color: "#ffffff",
    fontSize: responsiveFontSize(2),
    fontWeight: "800",
  },
  displayNameContainer: {
    alignItems: "flex-start",
    width: "60%"
  },
  displayNameContainerLong: {
    fontFamily:"roboto",
    alignItems: "flex-start",
    width: "80%"
  },
  userDisplayNameText: {
    fontFamily:"roboto",
    fontSize: responsiveFontSize(4.2),
    fontWeight: "700",
    color: "#ffffff",
    textTransform: "capitalize",
  },

  //headerQuickLinks

  quickLinkContainerBox: {
    marginTop: responsiveHeight(5),
    marginBottom: responsiveHeight(3),
  },
  quickLinkContainer: {
    paddingHorizontal: responsiveWidth(1.5),
    flexDirection: "row",
    flexWrap: "wrap",
  },

  wellnessButton: {
    width: responsiveWidth(42),
    maxWidth: responsiveWidth(43),
    paddingVertical: responsiveHeight(1.4),
  },
  wellnessButtonText: {
    fontSize: responsiveFontSize(1.75),
    fontWeight: "700",
  },

  drawerMenuContainer: {
    marginTop: responsiveHeight(2),
  },

  // Custom Drawer Item
  drawerItem: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: responsiveHeight(1.6),
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  drawerIconContainer: {
    width: "10%",
  },
  drawerSpecial: {
    color: "#000000",
    fontWeight: "800",
    fontSize: responsiveFontSize(1.8),
    letterSpacing: 1,
    fontFamily: "Roboto",
    marginLeft: 15,
    // flexWrap: "wrap",
  },
  drawerText: {
    textTransform: "capitalize",
    color: "#000000",
    fontWeight: "800",
    fontSize: responsiveFontSize(1.8),
    letterSpacing: 1,
    fontFamily: "Roboto",
    marginLeft: 15,
  },
  drawerBottom: {
    flexDirection: "row",
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(3),
    paddingVertical: responsiveHeight(1.6),
    width: "100%",
    borderBottomColor: "#9a9a9a",
    borderBottomWidth: 1,
  },

  //tag
  tagContainerBox: {
    flex: 1,
    paddingHorizontal: 5,
  },
  tagContainer: {
    backgroundColor: "#2da3df",
    borderRadius: 5,
    alignSelf: "flex-end",
    paddingVertical: 5,
    paddingHorizontal: responsiveWidth(3),
  },
  tagText: {
    color: "#ffffff",
    fontSize: responsiveFontSize(1.2),
  },

  //grouped drawer item
  expandIcon: {
    alignSelf: "flex-end",
  },

  renderTagContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 5,
  },

  // grouped items submenu
  submenuContainer: {
    //paddingLeft: responsiveWidth(5),
    backgroundColor: "#f6f6f6",
  },
  submenuIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(3),
    paddingVertical: 15,
  },
  submenuLabelContainer: {
    width: "100%",
  },

  //drawer Items header
  myProfileRight: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "flex-end",
  },
  myFriendsRight: {
    borderWidth: 2,
    borderColor: "#464646",
    alignItems: "center",
    justifyContent: "center",
    width: responsiveWidth(8),
    height: responsiveWidth(8),
    borderRadius: responsiveWidth(4),
  },
  myFriendsRightIcon: {
    backgroundColor: "transparent",
  },
});
