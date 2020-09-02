import React from "react";
import { View, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { DefaultText as Text } from "../../presentational/DefaultText.js";
import { styles } from "./Class";
export class ProfileSection extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  static defaultProps = {
    onPress: () => {},
    leftText: "",
    count: 0
  };
  render() {
    return (
      <TouchableOpacity
        style={styles.seeAllBarMain}
        onPress={() => {
          if (this.props.count && this.props.count > 0) {
            this.props.onPress();
          }
        }}
      >
        <View
          style={{ flexDirection: "row", alignItems: "center" }}
          accessible={true}
          accessibilityRole="button"
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.seeAllBarTextLeft]}>
              {this.props.leftText}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center"
            }}
          >
            <Text style={[styles.seeAllBarTextRight]}>SEE ALL</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={32}
              style={{ paddingRight: 20 }}
              color="#929292"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
