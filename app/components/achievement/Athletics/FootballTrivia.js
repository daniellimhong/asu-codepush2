import React, { useEffect } from "react";
import Trivia from "../../functional/trivia";
import { SettingsContext } from "../Settings/Settings";
import { ErrorWrapper } from "../../functional/error/ErrorWrapper";

function FootballTriviaContent(props) {
  const { sendAnalytics } = props;
  useEffect(() => {
    sendAnalytics({
      "eventtime": new Date().getTime(),
      "action-type": "click",
      "starting-screen": "game-day-companion-menu",
      "starting-section": null, 
      "target":"Football Trivia",
      "resulting-screen": "football-trivia",
      "resulting-section": null
    });
  }, []);
  return <Trivia type="football" active first sendAnalytics={sendAnalytics} />;
}

export default function FootballTrivia(props) {
  return (
    <ErrorWrapper>
      <SettingsContext.Consumer>
        {settings => (
          <FootballTriviaContent
            {...props}
            sendAnalytics={settings.sendAnalytics}
          />
        )}
      </SettingsContext.Consumer>
    </ErrorWrapper>
  );
}
