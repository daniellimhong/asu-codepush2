import React, { useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Modal from "react-native-modal";
import YoutubeIframe from "./YoutubeIframe";

export default ModalPlayer = (props) => {
  const window = Dimensions.get("window");

  const playerRef = useRef(null);
  return (
    <View>
      <Modal
        isVisible={props.isVisible}
        hasBackdrop={true}
        onRequestClose={props.dismiss}
        onBackdropPress={props.dismiss}
        coverScreen={true}
        backdropOpacity={0.8}
      >
        <View style={styles.modalContent}>
          <YoutubeIframe
            ref={playerRef}
            videoId={props.videoId}
            height={(window.width * 9) / 16}
            width={window.width}
            webViewStyle={styles.videoWebView}
            webViewProps={{
              allowsFullscreenVideo: true,
            }}
            play={props.isVisible}
            onChangeState={(event) => props.handleVideoStateChange(event)}
            onReady={() => console.log("ready")}
            onError={(e) => console.log(e)}
            onPlaybackQualityChange={(q) =>
              console.log("onPlaybackQualityChange====>", q)
            }
            // volume={50}
            // mute={true}
            playbackRate={1}
            initialPlayerParams={{
              cc_lang_pref: "us",
              showClosedCaptions: true,
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  videoWebView: {
    flex: 1,
  },
});
