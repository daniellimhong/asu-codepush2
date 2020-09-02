import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Linking,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import ModalPlayer from "./youtubePlayer/modalPlayer";
import styles from "./styles";
import Communications from "react-native-communications";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { ListWellnessSections } from "../../../Queries/Wellness";
import { ErrorWrapper } from "../../functional/error/ErrorWrapper";
import { SettingsContext } from "../Settings/Settings";

import WellnessButton from "../Common/WellnessButton"

const headerWellness = require("./assets/hero.jpg");

export function WellnessComp(props) {
  const { sendAnalytics } = props;
  let wellnessSections = props.sections.sort((a, b) => a.id - b.id);
  const [playing, setPlaying] = useState(false);
  const [videoId, setVideoId] = useState("");

  useEffect(() => {
    sendAnalytics({
      eventtime: new Date().getTime(),
      "action-type": "click",
      "starting-screen": "home",
      "starting-section": "drawer-menu",
      target: "Wellness",
      "resulting-screen": "wellness",
      "resulting-section": null,
    });
  }, []);

  renderSectionItem = (sectionItem) => (
    <View style={styles.Section}>
      <Text style={styles.contentHeading}>{sectionItem.item.title}</Text>
      <Text style={styles.contentText}>{sectionItem.item.text}</Text>
      {sectionItem.item.contacts ? (
        <FlatList
          keyExtractor={(item, index) => item.id}
          data={sectionItem.item.contacts}
          renderItem={this.renderContactItem}
        />
      ) : null}
      {sectionItem.item.media ? (
        <FlatList
          style={styles.mediaContainer}
          keyExtractor={(item, index) => item.id}
          data={sectionItem.item.media}
          renderItem={this.renderMediaItem}
        />
      ) : null}
    </View>
  );

  const playVideo = (videoMeta) => {
    setPlaying(true);
    setVideoId(videoMeta.id);
  };
  renderMediaItem = (mediaItem) => {
    return (
      <TouchableOpacity
        onPress={() => {
          sendAnalytics({
            "action-type": "click",
            "starting-screen": "wellness",
            "starting-section": "video",
            target: "Wellness",
            "resulting-screen": "wellness",
            "resulting-section": "videoplayer",
          });
          playVideo(mediaItem.item);
        }}
      >
        <ImageBackground
          style={styles.video}
          source={{ uri: mediaItem.item.thumbnail_url }}
        >
          <View style={styles.youtubeIcon}>
            <Icon
              name={"youtube"}
              size={30}
              color="rgba(80,80,80,0.8)"
              underlayColor={"#EEE"}
            />
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };
  renderContactList = (contact) =>
    contact.item.type ? (
      <TouchableOpacity onPress={() => Linking.openURL(contact.item.contact)}>
        <Text style={styles.contactDetail}>{contact.item.contact}</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        onPress={() =>
          Communications.phonecall(
            contact.item.contact.replace(/\D/g, ""),
            true
          )
        }
      >
        <Text style={styles.contactDetail}>{contact.item.contact}</Text>
      </TouchableOpacity>
    );

  renderContactItem = (contactItem) => (
    <View style={styles.contactItem}>
      <Text style={styles.contactDesc}>{contactItem.item.description}</Text>
      <FlatList
        keyExtractor={(item, index) => item.id}
        data={contactItem.item.contactList}
        renderItem={this.renderContactList}
      />
    </View>
  );

  const handleVideoStateChange = (event) => {
    if (event === "ended") {
      setPlaying(false);
    }
  };

  const dismissModal = () => {
    setPlaying(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageBackground source={headerWellness} style={styles.eventImage}>
          <View style={styles.heroText}>
            <Text style={styles.title}>ASU Wellness</Text>
            <Text style={styles.subtitle}>{"Resources & Services"}</Text>
          </View>
        </ImageBackground>
      </View>
      <View style={styles.list}>
        <FlatList
          keyExtractor={(item, index) => item.id}
          data={wellnessSections}
          renderItem={this.renderSectionItem}
        />
      </View>
      <View>
        <ModalPlayer
          isVisible={playing}
          videoId={videoId}
          handleVideoStateChange={handleVideoStateChange}
          dismiss={dismissModal}
        />
      </View>
    </ScrollView>
  );
}

const WellnessComponent = AppSyncComponent(WellnessComp, ListWellnessSections);

export default Wellness = (props) => (
  <ErrorWrapper>
    <SettingsContext.Consumer>
      {(settings) => (
        <WellnessComponent
          data={props}
          sendAnalytics={settings.sendAnalytics}
        />
      )}
    </SettingsContext.Consumer>
  </ErrorWrapper>
);
