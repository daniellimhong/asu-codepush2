import {
  StyleSheet
} from "react-native";

export const commonStyles = StyleSheet.create({
  shadowBox: {
    shadowColor: "#a6a6a6",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3
  },
  bolded: {
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  scrim: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.2)"
  },
  imageBgContainer: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "grey"
  }
});
