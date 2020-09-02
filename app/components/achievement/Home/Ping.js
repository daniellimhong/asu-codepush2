import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { graphql } from "react-apollo";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { userPing, subscribePing, getPing } from "../../../Queries/Ping";

class PingX extends React.Component {
  state = {
    to: "",
    value: 0
  };

  static defaultProps = {
    asurite: "",
    value: 0,
    userPing: () => null,
    subscribeToPings: () => null
  };

  componentDidUpdate() {
    // console.log("On Updates", this.props);
  }

  componentDidMount() {
    this.props.subscribeToPings();
  }

  render() {
    return (
      <View>
        <Text>User: {this.props.asurite}</Text>
        <Text>Value: {this.props.value}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>To</Text>
          <TextInput
            style={{
              width: 50,
              color: "black",
              padding: 5,
              borderColor: "#bbbbbb",
              borderWidth: 1,
              marginLeft: 10,
              marginRight: 10
            }}
            onChangeText={t => this.setState({ to: t })}
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>value</Text>
          <TextInput
            style={{
              width: 50,
              color: "black",
              padding: 5,
              borderColor: "#bbbbbb",
              borderWidth: 1,
              marginLeft: 10,
              marginRight: 10
            }}
            onChangeText={t => this.setState({ value: t })}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            this.props.userPing({
              asurite: this.state.to + "",
              value: this.state.value
            });
          }}
        >
          <View
            style={{
              backgroundColor: "#FF4500",
              width: 200,
              alignItems: "center",
              padding: 5,
              marginTop: 20
            }}
          >
            <Text>CREATE</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

let uping = graphql(userPing, {
  props: props => {
    // console.log("Ping hit", props);
    return {
      userPing: ping => {
        props
          .mutate({
            variables: {
              asurite: ping.asurite,
              value: ping.value
            }
          })
          .then(resp => {
            console.log(resp);
          })
          .catch(e => {
            console.log(e);
          });
      }
    };
  }
});
let gping = graphql(getPing, {
  options: props => {
    // console.log("NORPOS", props);
    return {
      fetchPolicy: "cache-and-network",
      variables: {
        asurite: props.asurite
      }
    };
  },
  props: props => {
    // console.log("PORPOS HERE", props);
    return {
      value:
        props.data.getPing && props.data.getPing.value
          ? props.data.getPing.value
          : null,
      subscribeToPings: () => {
        props.data.subscribeToMore({
          document: subscribePing,
          variables: {
            asurite: props.ownProps.asurite
          },
          updateQuery: (prev, sub) => {
            console.log("Sub fired on ping", sub);
            return { getPing: { ...sub.subscriptionData.data.userPinged } };
          }
        });
      }
    };
  }
});

export const Ping = AppSyncComponent(PingX, uping, gping);
