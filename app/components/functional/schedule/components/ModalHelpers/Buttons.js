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

export class CalModalButtons extends React.Component {

  constructor(props) {
    super(props);
  }

  static defaultProps = {
    btn1Text: null,
    btn2Text: null,
    btn1Avail: true,
    btn2Avail: true,
    btnPress: () => null
  };

  render() {

    if( this.props.btn1Text && this.props.btn2Text && this.props.btnPress ) {
      return (
        <View
          style={{
            width: "100%",
            marginHorizontal: 0,
            flexDirection: "row",
            flex: 1,
            marginTop: responsiveHeight(3),
            borderTopColor: "#e1e1e1",
            overflow: "hidden",
            borderTopWidth: 1
          }}
        >
          <TouchableOpacity
            style={styles.modalButton}
            disabled={!this.props.btn1Avail}
            onPress={() => {
              this.props.btnPress(1)
            }}
          >
            <View>
              <Text style={[styles.modalButtonText,(this.props.btn1Avail?null:styles.disableBtn)]}>{this.props.btn1Text}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modalButton,
              { borderLeftColor: "#e1e1e1", borderLeftWidth: 1 }
            ]}
            disabled={!this.props.btn2Avail}
            onPress={() => {
              this.props.btnPress(2)
            }}
          >
            <View>
              <Text style={[styles.modalButtonText,(this.props.btn2Avail?null:styles.disableBtn)]}>{this.props.btn2Text}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )
    } else {
      console.log("ERROR: MISSING IMPORTANT INFORMATION TO GENERATE BUTTONS");
      return null;
    }


  }

}

const styles = StyleSheet.create({
  modalButton: {
    padding: 15,
    flex: 1
  },
  modalButtonText: {
    textAlign: "center",
    fontSize: responsiveFontSize(1.6),
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  disableBtn: {
    color: "#ccc"
  }
});
