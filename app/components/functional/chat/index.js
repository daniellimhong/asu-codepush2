import React, { PureComponent } from "react";
import { View } from "react-native";
import Chats from "./Chats";
import { SettingsContext } from "../../achievement/Settings/Settings";
import { ErrorWrapper } from "../error/ErrorWrapper";
import Analytics from "./../analytics";

let chatRef = React.createRef();

export default class ChatManager extends PureComponent {

  componentDidMount(){        
    chatRef.current.sendData({
      "eventtime": new Date().getTime(),
      "action-type": "view",
      "starting-screen": this.props.navigation.state.params && this.props.navigation.state.params.previousScreen?
      this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params && this.props.navigation.state.params.previousSection?
      this.props.navigation.state.params.previousSection:null,
      "target": "chat",
      "resulting-screen": "chat-manager", 
      "resulting-section": null,
    });
  }

  render() {
    const { navigation } = this.props;
    return (
      <SettingsContext.Consumer>
        {settings => (
          <ErrorWrapper>
            <View
              style={{
                flex: 1,
                backgroundColor: "#e8e8e8"
              }}
            >
            <Chats asurite={settings.user} navigation={navigation} />
            <Analytics ref={chatRef} />
            </View>
          </ErrorWrapper>
        )}
      </SettingsContext.Consumer>
    );
  }
}
