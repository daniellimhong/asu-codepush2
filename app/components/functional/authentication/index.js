import React from "react";
import {
  View,
  Image,
  Dimensions,
  Keyboard,
  Text,
  AsyncStorage,
  TextInput,
  Button,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet
} from "react-native";

import { WebLogin } from "./auth_components/weblogin";

import { Logout } from "./auth_components/logout";

export class Authentication extends React.Component {
  static navigationOptions = ({ navigation, screenProps }) => ({
    title: "Authentication"
  });
  constructor(props) {
    super(props);
    this.state = {
      data: "Also, this is data living in the parent authentication component"
    };
  }

  render() {
    return (
      <WebLogin
        appid="N2FtUnNrUXJ0S3pBYWNoaWV2ZW1lbnQ="
        refresh="https://mcuwjen7gc.execute-api.us-west-2.amazonaws.com/prod/orefresh"
      >
        <ScrollView>
          <View style={styles.container}>
            <Text>{this.state.data}</Text>
          </View>
        </ScrollView>
        <Logout />
      </WebLogin>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1
  }
});

// export * from './auth_components';
