import React from "react";
import {
  View,
  Alert,
  ToastAndroid,
  ActivityIndicator,
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

var { height, width } = Dimensions.get("window");

export class LoadingCircle extends React.Component {
  render() {
    return (
      <ActivityIndicator size={this.props.size} color={this.props.color} />
    );
  }
}

// export class AlertUser extends React.Component {
//
//   constructor() {
//
//     super();
//
//     Alert.alert(
//       'Alert Title',
//       'My Alert Msg',
//       [
//         {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
//         {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
//         {text: 'OK', onPress: () => console.log('OK Pressed')},
//       ],
//       { cancelable: false }
//     )
//   }
//
// }

export class Status extends React.Component {
  AlertUser() {
    Alert.alert(
      "Alert Title",
      "My Alert Msg",
      [
        {
          text: "Ask me later",
          onPress: () => console.log("Ask me later pressed")
        },
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ],
      { cancelable: false }
    );
  }

  static navigationOptions = ({ navigation, screenProps }) => ({
    title: "Status"
  });
  constructor(props) {
    super(props);
    this.state = {
      //data:  this.props.navigation.state.params.data
      data: "Data"
    };
  }
  componentDidMount() {
    console.log("component mounted");
  }

  render() {
    return (
      <ScrollView>
        <View style={[styles.container, styles.horizontal]}>
          <LoadingCircle color="black" size="small" />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1
  }
});
