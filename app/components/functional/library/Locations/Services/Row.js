import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Linking,
  TouchableOpacity
} from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import {
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";

export default function Row(props) {
  const { link, title } = props;

  const handleClick = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.error(`Don't know how to open URL: ${url}`);
      }
    });
  };

  return (
    <TouchableOpacity onPress={() => handleClick(link)}>
      <View style={styles.link}>
        <Text style={styles.service}>{title}</Text>
        <MaterialIcon name="launch" color="maroon" style={styles.icon} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  service: {
    paddingVertical: responsiveHeight(1)
  },
  link: {
    flexDirection: "row"
  },
  icon: {
    alignSelf: "center",
    marginLeft: responsiveWidth(1)
  }
});
