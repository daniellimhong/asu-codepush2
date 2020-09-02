import React, { PureComponent } from "react";
import { View, Text, Animated, TouchableOpacity } from "react-native";
import {
  responsiveWidth,
  responsiveHeight
} from "react-native-responsive-dimensions";

export default class NewChatUserOptions extends PureComponent {
  openHeight = responsiveHeight(6);
  // openHeight = responsiveHeight(13);

  state = {
    heightAnim: new Animated.Value(0)
  };

  static defaultProps = {
    asurite: "",
    invokerAsurite: null,
    show: false,
    isearch: {}
  };

  componentDidUpdate = () => {
    const { show } = this.props;
    if (show === false) {
      this.close();
    } else if (show) {
      this.open();
    }
  };

  open = () => {
    const { heightAnim } = this.state;
    Animated.timing(
      // Animate over time
      heightAnim, // The animated value to drive
      {
        toValue: this.openHeight,
        duration: 200
      }
    ).start();
  };

  close = () => {
    const { heightAnim } = this.state;
    Animated.timing(
      // Animate over time
      heightAnim, // The animated value to drive
      {
        toValue: 0,
        duration: 200
      }
    ).start();
  };

  render() {
    const { heightAnim } = this.state;
    return (
      <Animated.View
        style={{
          height: heightAnim,
          overflow: "hidden",
          backgroundColor: "#f2f2f2"
        }}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%"
          }}
        >
          <TouchableOpacity
            onPress={() => {
              const {
                isearch,
                invokerAsurite,
                asurite,
                navigation
              } = this.props;
              if (invokerAsurite !== asurite) {
                navigation.navigate("UserProfile", {
                  data: {
                    photoUrl: isearch.photoUrl,
                    displayName: isearch.displayName,
                    asuriteId: asurite,
                    phone: isearch.phone,
                    affiliations: isearch.affiliations,
                  },
                  previousScreen: "chat",
                  previousSection: null
                });
              } else {
                navigation.navigate("MyProfile",{
                  previousScreen: "chat",
                  previousSection: null
                });
              }
            }}
          >
            <View
              style={{
                width: responsiveWidth(70),
                paddingVertical: responsiveWidth(2),
                marginVertical: responsiveWidth(1.5),
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#00A3E0"
              }}
            >
              <Text
                style={{
                  color: "white"
                }}
              >
                VIEW PROFILE
              </Text>
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => {}}>
            <View
              style={{
                width: responsiveWidth(70),
                paddingVertical: responsiveWidth(2),
                marginVertical: responsiveWidth(1.5),
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#AF183D"
              }}
            >
              <Text
                style={{
                  color: "white"
                }}
              >
                BLOCK USER
              </Text>
            </View>
          </TouchableOpacity> */}
        </View>
      </Animated.View>
    );
  }
}
