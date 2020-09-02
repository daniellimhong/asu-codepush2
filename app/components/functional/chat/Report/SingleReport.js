import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { SettingsContext } from "../../../achievement/Settings/Settings";
import { AppSyncComponent } from "../../authentication/auth_components/appsync/AppSyncApp";
import { reportUserMutation } from "../gql/Mutations";
import { getUserData } from "./utility";
import Analytics from "../../analytics";

const platformconfig =
  Platform.OS === "ios"
    ? { behavior: "position", keyboardVerticalOffset: 100 }
    : {};

function SingleReportContent(props) {
  const { reportUser, reportee, convoId, navigation } = props;
  const { SetToast } = useContext(SettingsContext);
  const [concern, setConcern] = useState("");
  const [contact, setContact] = useState("");
  const [displayName, setDisplayName] = useState(null);
  let chatRef = useRef(null);

  useEffect(() => {
    checkDisplayName();
  });

  const checkDisplayName = async () => {
    const data = await getUserData(reportee);
    if (data && data.displayName) {
      setDisplayName(data.displayName);
    }
  };

  return (
    <ScrollView
      style={{
        paddingHorizontal: 20
      }}
    >
      <KeyboardAvoidingView {...platformconfig}>
        <Analytics ref={chatRef} />
        <Text
          style={{
            fontSize: responsiveFontSize(3),
            alignSelf: "center",
            margin: 10
          }}
        >
          Report a Concern
        </Text>
        {displayName ? (
          <Text style={{ fontSize: responsiveFontSize(2), margin: 10 }}>
            User: {displayName}
          </Text>
        ) : (
          <Text style={{ fontSize: responsiveFontSize(2), margin: 10 }}>
            ASURITE: {reportee}
          </Text>
        )}
        <Text style={{ fontSize: responsiveFontSize(1.7), marginVertical: 10 }}>
          If this is an emergency, call 911. Report misconduct here if you have
          a concern for your or someone else's health or safety, if you feel
          threatened or harassed, or if you are unsure whether misconduct has
          occurred. This report will be forwarded to the Dean of Students
          Office, which will contact you to gather more information.{"\n"}
          {"\n"}
          ASU Police (non-emergency) 480-965-3456{"\n"}
          EMPACT After hours crisis line 480-921-1006
        </Text>
        <Text style={{ fontSize: responsiveFontSize(1.7), marginVertical: 10 }}>
          Describe your concern.
        </Text>
        <TextInput
          style={{
            textAlignVertical: "top",
            height: responsiveHeight(20),
            padding: 10,
            borderColor: "#bbbbbb",
            borderWidth: 1,
            marginLeft: 10,
            marginRight: 10
          }}
          multiline
          maxLength={150}
          onChangeText={t => setConcern(t)}
          // value={this.state.text}
          accessibilityLabel="Type feedback here"
        />
        <Text style={{ fontSize: responsiveFontSize(1.7), marginVertical: 10 }}>
          How should we contact you?
        </Text>
        <TextInput
          style={{
            padding: 10,
            borderColor: "#bbbbbb",
            borderWidth: 1,
            marginLeft: 10,
            marginRight: 10
          }}
          maxLength={150}
          onChangeText={t => setContact(t)}
          // value={this.state.text}
          accessibilityLabel="Type contact info here"
        />
      </KeyboardAvoidingView>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          // Do Submission and close
          //
          //
          chatRef.current.sendData({
            "action-type": "click",
            "starting-screen": "report-concern",
            "starting-section": null,
            target: "Submit",
            "resulting-screen": "conversation",
            "resulting-section": null,
            "action-metadata":{
              "conversation-id":convoId,
              "reportee": reportee,
              "concern": concern,
              "contact": contact
            }
          });
          reportUser(reportee, concern, convoId, contact)
            .then(() => {
              SetToast("The user has been reported");
              navigation.goBack();
            })
            .catch(e => {
              console.log(e);
              SetToast("The report process has failed");
              navigation.goBack();
            });
        }}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(2)
          }}
        >
          Submit
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          chatRef.current.sendData({
            "action-type": "click",
            "starting-screen": "report-concern",
            "starting-section": null,
            target: "Cancel",
            "resulting-screen": "conversation",
            "resulting-section": null,
            "action-metadata":{
              "conversation-id":convoId,
              "reportee": reportee,
            }
          });
          navigation.goBack();
        }}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(2)
          }}
        >
          Cancel
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 25,
    width: responsiveWidth(30),
    padding: 5,
    borderRadius: responsiveWidth(10),
    borderWidth: 1,
    alignSelf: "center",
    alignItems: "center"
  }
});

const SingleReport = AppSyncComponent(SingleReportContent, reportUserMutation);

export default SingleReport;
