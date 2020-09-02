import React from "react";
import {
  View,
  Dimensions,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
  Linking
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu";
import { AppSyncComponent } from "../../../functional/authentication/auth_components/appsync/AppSyncApp";
import {
  blockUserMutation,
  getBlockedUsers,
  unblockUserMutation
} from "../../../../Queries/Friends";

class ProfilePopupContent extends React.PureComponent {
  static defaultProps = {
    blockUser: () => null,
    unblockUser: () => null,
    blocked_users: [],
    asurite: null
  };
  render() {
    return (
      <View>
        <Menu>
          <MenuTrigger>
            <Icon name="more-vert" size={responsiveFontSize(4)} color="white" />
          </MenuTrigger>
          <MenuOptions>
            {this.props.blocked_users &&
            this.props.blocked_users.length &&
            this.props.blocked_users.indexOf(this.props.asurite) > -1 ? (
              <MenuOption
                onSelect={() => this.props.unblockUser(this.props.asurite)}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(2),
                    margin: 5
                  }}
                >
                  Unblock User
                </Text>
              </MenuOption>
            ) : (
              <MenuOption
                onSelect={() => this.props.blockUser(this.props.asurite)}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(2),
                    margin: 5
                  }}
                >
                  Block User
                </Text>
              </MenuOption>
            )}
          </MenuOptions>
        </Menu>
      </View>
    );
  }
}

export const ProfilePopup = AppSyncComponent(
  ProfilePopupContent,
  blockUserMutation,
  unblockUserMutation,
  getBlockedUsers
);
