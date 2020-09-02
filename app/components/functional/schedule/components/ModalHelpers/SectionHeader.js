import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet
} from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export class SectionHeader extends React.Component {

  constructor(props) {
    super(props);
  }

  static defaultProps = {
    title: null,
    section: {},
    showButton: true,
    btnPress: () => null
  };

  render() {

    return (
      <View style={styles.SectionHeaderStyle}>
        <View style={{ flex: 9 }}>
          <Text style={styles.SectionHeaderText}> {this.props.section.title} </Text>
        </View>
        {
          this.props.showButton ? (
            <View style={{ justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={styles.calIcon}
                onPress={() => {
                  this.props.pressedBtn(this.props.section)
                }}
              >
                <MaterialCommunityIcons
                  name={"calendar-plus"}
                  size={responsiveHeight(2.9)}
                  color="#696969"
                />
              </TouchableOpacity>
            </View>
          ) : null
        }

      </View>
    )

  }

}

const styles = StyleSheet.create({
  SectionHeaderStyle: {
    flex: 1,
    width: undefined,
    flexDirection: "row",
    textAlign: "justify",
    height: responsiveHeight(7),
    marginBottom: 10,
    padding: 10
  },
  SectionHeaderText: {
    fontSize: responsiveFontSize(2.2),
    color: "#000",
    fontWeight: "100",
    fontFamily: 'Roboto',
    lineHeight: responsiveHeight(4.7),
    textAlignVertical: "center"
  },
  calIcon: {
    height: responsiveHeight(4.7),
    width: responsiveHeight(4.7),
    backgroundColor: "#cecece",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#cecece",
    borderWidth: 1,
    borderRadius: 50
  }
});
