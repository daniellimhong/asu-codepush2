import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { responsiveWidth } from "react-native-responsive-dimensions";
import { DefaultText as Text } from "../../presentational/DefaultText.js";

/**
 * Render a list of Friends.
 *
 * Friends list is passed via props.
 */

export class FullClassBlock extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      class_schedule: props.navigation.state.params.class_schedule
    };
  }

  static defaultProps = {
    class_list: []
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.class_schedule ? (
          <ClassBlock class_schedule={this.state.class_schedule} />
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text>No class data</Text>
          </View>
        )}
      </View>
    );
  }
}

export class ClassBlock extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      class_schedule: props.class_schedule
    };
  }

  static defaultProps = {
    class_list: []
  };

  _renderItem = ({ item }) => {
    return (
      <View
        style={{
          flex: 1,
          padding: 15,
          backgroundColor: "white",
          borderStyle: "solid",
          borderBottomWidth: 1,
          borderBottomColor: "#ccc"
        }}
      >
        <Text style={{ fontSize: 20, color: "black" }}>{item.dayStr}</Text>
        <Text style={{ fontSize: 16, color: "black" }}>{item.timeStr}</Text>
      </View>
    );
  };

  render() {
    var data = this.props;

    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <FlatList
          data={data.class_schedule}
          renderItem={this._renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  image: {
    height: responsiveWidth(16),
    borderRadius: responsiveWidth(8),
    width: responsiveWidth(16),
    alignItems: "center",
    marginTop: 5
  }
});
