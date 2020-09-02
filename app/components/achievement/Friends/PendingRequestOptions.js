import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { DefaultText as Text } from "../../../presentational/DefaultText.js";
import Icon from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

/**
 * Renders two buttons for friend requests.
 * Accept & Ignore
 */
export class PendingRequestOptionsX extends React.Component {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    obscure: () => null,
    asurite: null
  };

  render() {
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* <TouchableOpacity onPress={() => {
          this.props.acceptRequest(this.props.asurite);
          this.context.SetToast("Friend Request Accepted");
          this.props.obscure()
        }} accessibilityRole="button"
        > */}
        <View style={[styles.accept, styles.button]}>
          <Text style={styles.acceptText}>Pending</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            // this.props.ignoreRequest(this.props.asurite);
            // this.context.SetToast("Friend Request Ignored");
            this.props.obscure();
          }}
          accessibilityLabel="Reject"
          accessibilityRole="button"
        >
          <View style={[styles.ignore, { marginLeft: responsiveWidth(3) }]}>
            {/* <Text>Ignore</Text> */}
            <Icon
              name="times"
              size={responsiveFontSize(3)}
              color="#696969"
              style={{ backgroundColor: "transparent" }}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

PendingRequestOptionsX.contextTypes = {
  SetToast: PropTypes.func
};

const styles = StyleSheet.create({
  accept: {
    backgroundColor: "#8C1B35"
  },
  acceptText: {
    color: "white"
  },
  cancelRequestButtons: {
    marginHorizontal: responsiveWidth(10),
    fontWeight: "bold",
    fontSize: responsiveFontSize(3),
    fontFamily: "Roboto"
  },
  ignore: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    alignItems: "center",
    justifyContent: "center"
  },
  button: {
    width: responsiveWidth(18),
    height: responsiveHeight(5),
    marginLeft: responsiveWidth(1),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: responsiveWidth(2)
  },
  image: {
    height: responsiveWidth(24),
    borderRadius: responsiveWidth(12),
    width: responsiveWidth(24),
    alignItems: "center",
    marginTop: 5
  },
  modalButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(0,0,0,0.3)",
    borderBottomColor: "rgba(0,0,0,0.3)",
    padding: responsiveWidth(5)
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  shareButton: {
    height: responsiveWidth(10),
    width: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    alignItems: "center",
    justifyContent: "center",
    marginRight: responsiveWidth(5)
  },
  shareOnBG: {
    backgroundColor: "#FFB332"
  },
  shareOnFG: {
    color: "white"
  },
  shareOffBG: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#696969"
  },
  shareOffFG: {
    color: "white"
  }
});
