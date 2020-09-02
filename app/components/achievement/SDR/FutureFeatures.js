import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { getFutureFeaturesSDR } from "./PithcforksQuery";
import { ErrorWrapper } from "../../functional/error/ErrorWrapper";
import { FeatureImages } from "./FutureFeatureImages";
import Analytics from "../../functional/analytics";

let styles = StyleSheet.create({
  header: {
    paddingVertical: 4,
    paddingHorizontal: 20,
  },
  headerNormal: {
    fontSize: 18,
    fontFamily: "Roboto",
    color: "black",
    marginBottom: -10,
  },
  headerBold: {
    fontSize: 34,
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: "black",
  },
  featureNameBackground: {
    backgroundColor: "black",
  },
  featureName: {
    color: "white",
    fontSize: 20,
    paddingHorizontal: 20,
  },
  content: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  insideContent: {
    flexDirection: "row",
  },
  methodName: {
    fontSize: 15,
    fontWeight: "100",
    fontFamily: "Roboto",
    paddingLeft: 20,
    color: "black",
    flex: 1,
  },
  imageContainer: {
    paddingTop: 5,
  },
  featureImage: {
    height: 73,
    width: 73,
    paddingTop: 10,
  },
  coverImage: {
    height: 126,
    width: "100%",
  },
});

function FutureFeaturesComponent(props) {
  const [futureFeaturesState, setFutureFeatures] = useState(null);

  useEffect(() => {
    if (!props.future_features.getFutureSDRFeatures) {
      setFutureFeatures(null);
    } else {
      var futureFeatures = props.future_features.getFutureSDRFeatures.sort(
        function(a, b) {
          return a.id - b.id;
        }
      );
      setFutureFeatures(futureFeatures);
    }
  });

  return (
    <ScrollView>
      <View style={styles.header}>
        <Text style={styles.headerNormal}>Stay in the know</Text>
        <Text style={styles.headerBold}>Future features</Text>
      </View>
      <Image
        style={styles.coverImage}
        source={require("../assets/Group-2x.png")}
        resizeMethod="resize"
      />
      {!futureFeaturesState && (
        <View style={{ alignItems: "center", paddingVertical: 30 }}>
          <ActivityIndicator size="large" color="maroon" />
        </View>
      )}
      {futureFeaturesState &&
        futureFeaturesState.map((feature) => {
          let image_icon = FeatureImages[feature.image_name].url;
          return (
            <View key={feature.name}>
              <View style={styles.featureNameBackground}>
                <Text style={styles.featureName}>{feature.name}</Text>
              </View>
              <View style={styles.content}>
                <View style={styles.insideContent}>
                  <View style={styles.imageContainer}>
                    <Image
                      style={styles.featureImage}
                      source={image_icon}
                      resizeMode="contain"
                      resizeMethod="resize"
                    />
                  </View>
                  <Text style={styles.methodName}>
                    {feature.section_content}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
    </ScrollView>
  );
}

const FutureFeatures = AppSyncComponent(
  FutureFeaturesComponent,
  getFutureFeaturesSDR
);

export class SDRFutureFeatures extends React.Component {
  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": "sun-devil-rewards",
      "starting-section": null,
      target: "Sun Devil Future Features",
      "resulting-screen": "sdr-future-features",
      "resulting-section": null,
    });
  }

  render() {
    return (
      <ErrorWrapper>
        <View>
          <Analytics ref="analytics" />
          <FutureFeatures {...this.props} />
        </View>
      </ErrorWrapper>
    );
  }
}
