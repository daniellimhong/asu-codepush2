import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { DefaultText as Text } from "../presentational/DefaultText.js";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";

/**
 * Import user content
 * Display in keeping with old directory structure
 * Store image locally for reference rather than display grey
 */
export class UserInfo extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      photoUrl: this.props.navigation.state.params.photoUrl
    };
  }

  userPhoto() {
    if (this.state.photoUrl) {
      return (
        <View
          style={{
            margin: 5,
            height: responsiveHeight(20),
            width: responsiveHeight(20),
            borderRadius: responsiveHeight(10),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 3
          }}
        >
          <Image
            style={{
              height: responsiveHeight(20),
              width: responsiveHeight(20),
              borderRadius: responsiveHeight(10),
              resizeMode: "contain"
            }}
            source={{ uri: this.state.photoUrl }}
            onError={e => {
              this.setState({
                photoUrl: null
              });
            }}
          />
        </View>
      );
    } else {
      return (
        <View
          style={{
            margin: 5,
            height: responsiveHeight(20),
            width: responsiveHeight(20),
            borderRadius: responsiveHeight(10),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 3
          }}
        >
          <Image
            style={{
              height: responsiveHeight(20),
              width: responsiveHeight(20),
              borderRadius: responsiveHeight(10),
              resizeMode: "contain"
            }}
            source={{
              uri:
                "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/default_user.png"
            }}
          />
        </View>
      );
    }
  }

  render() {
    const { params } = this.props.navigation.state;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "white"
        }}
      >
        {/* TOP */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            borderBottomColor: "#D3D3D3",
            borderBottomWidth: 1,
            paddingBottom: 10
          }}
        >
          {this.userPhoto()}
          <Text
            style={{
              fontWeight: "bold",
              fontSize: responsiveFontSize(3),
              backgroundColor: "rgba(0,0,0,0)",
              padding: 5,
              fontFamily: "Roboto"
            }}
          >
            {params.displayName}
          </Text>
          <Text>{params.titles ? params.titles[0] : ""}</Text>
          <Text>{params.primaryDeptid}</Text>
        </View>

        {/* EMAIL */}
        {params.emailAddress && (
          <View style={styles.directoryUserInfoRow}>
            <Text style={styles.directoryUserInfoRowTitle}>Email</Text>
            <Text style={styles.directoryUserInfoRowContent}>
              {params.emailAddress}
            </Text>
          </View>
        )}
        {/* Department */}
        {params.departments && params.departments.length > 0 && (
          <View style={styles.directoryUserInfoRow}>
            <Text style={styles.directoryUserInfoRowTitle}>Department</Text>
            <Text style={styles.directoryUserInfoRowContent}>
              {params.departments}
            </Text>
          </View>
        )}
        {/* MAIL CODE */}
        {params.mailCodes && params.mailCodes.length > 0 && (
          <View style={styles.directoryUserInfoRow}>
            <Text style={styles.directoryUserInfoRowTitle}>Mail Code</Text>
            <Text style={styles.directoryUserInfoRowContent}>
              {params.mailCodes}
            </Text>
          </View>
        )}
        {/* Major and School */}
        {params.programs &&
          params.programs.length > 0 &&
          params.majors &&
          params.majors.length > 0 &&
          params.careers &&
          params.careers.length > 0 && (
            <View style={styles.directoryUserInfoRow}>
              <Text style={styles.directoryUserInfoRowTitle}>
                Major & School
              </Text>
              <View style={styles.directoryUserInfoRowContent}>
                <Text>{params.careers[0]}</Text>
                <Text>{params.majors[0]}</Text>
                <Text>{params.programs[0]}</Text>
              </View>
            </View>
          )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  directoryButton: {
    backgroundColor: "#ffc627",
    padding: responsiveFontSize(1),
    width: responsiveWidth(25),
    height: responsiveHeight(5),
    alignItems: "center",
    justifyContent: "center"
  },
  directoryUserInfoRow: {
    flexDirection: "row",
    width: responsiveWidth(100),
    // justifyContent: "center",
    borderBottomColor: "#D3D3D3",
    borderBottomWidth: 1,
    padding: 10
  },
  directoryUserInfoRowTitle: {
    alignItems: "flex-start",
    flex: 1
  },
  directoryUserInfoRowContent: {
    flex: 1,
    alignItems: "flex-start"
  }
});
