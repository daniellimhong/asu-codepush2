import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Divider } from "react-native-elements";
import {
  responsiveFontSize,
  responsiveHeight
} from "react-native-responsive-dimensions";

import Row from "./Row";

export default function Services(props) {
  const { activeLibrary, links } = props;
  const [defaultLinks, setDefaultLinks] = useState([]);
  const [localizedLinks, setLocalizedLinks] = useState([]);
  useEffect(() => {
    getLinks();
  }, [activeLibrary, links]);

  const getLinks = () => {
    links.forEach(el => {
      const activeLibKey = el.id.slice(0, el.id.indexOf(" "));
      if (el.id === "Default Services") {
        setDefaultLinks(el.links);
      }
      if (activeLibrary.name.includes(activeLibKey)) {
        setLocalizedLinks(el.links);
      }
    });
  };

  const renderServices = _links => {
    if (_links.length) {
      return _links.map((item, index) => (
        <Row key={index} title={item.name} link={item.url} />
      ));
    } else {
      return null;
    }
  };

  return (
    <View>
      <View style={styles.section}>
        <Text style={styles.sectionText}>Services</Text>
      </View>
      {renderServices(localizedLinks)}
      <Divider
        style={{
          backgroundColor: "#D5D5D5",
          marginVertical: responsiveHeight(1)
        }}
      />
      {renderServices(defaultLinks)}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionText: {
    color: "#222222",
    fontWeight: "bold",
    fontSize: responsiveFontSize(2),
    marginBottom: responsiveHeight(1.5),
    fontFamily: "Roboto"
  },
  section: {
    marginTop: responsiveHeight(2)
  }
});
