import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { getConversationUsersQuery } from "../gql/Queries";
import { AppSyncComponent } from "../../authentication/auth_components/appsync/AppSyncApp";
import SingleReport from "./SingleReport";
/**
 * Report a concern page
 * Wrapper component to get data from navigation state.
 */
export default function Report(props) {
  const { navigation } = props;
  const { convoId, asurite } = navigation.state.params;

  // useEffect(() => {
  //   console.log(props);
  // });

  if (!convoId || !asurite) {
    return (
      <View>
        <Text
          style={{
            textAlign: "center"
          }}
        >
          There was an error getting necessary chat information to generate a
          report. Please use the Feedback option in the App Drawer Menu
        </Text>
      </View>
    );
  } else {
    return (
      <View>
        <ReportContent
          navigation={navigation}
          convoId={convoId}
          asurite={asurite}
        />
      </View>
    );
  }
}

/**
 * Determine the type of report that needs
 * to be initiated (Single/Multi User, General)
 */
function ReportAAS(props) {
  const { asurite = "", users = [], navigation, convoId } = props;
  const [reportee, setReportee] = useState();
  const [phase, setPhase] = useState("boot");

  let reportInfo = (
    <View>
      <Text>Loading</Text>
    </View>
  );

  useEffect(() => {
    if (Array.isArray(users) && users.length <= 2) {
      const target = getFirstUser(users, asurite);
      if (target) {
        singleUserReport(target);
      } else {
        generalReport();
      }
    } else {
      // PROPERLY HANDLE MANY USERS WITH SELECTION SCREEN
    }
  });

  /**
   * Given a target user, render a report screen for that user
   * @param {*} target
   */
  const singleUserReport = target => {
    setReportee(target);
    setPhase("singleReport");
  };

  /**
   * If we can't or won't select users, just make a general report
   * tied to the conversation
   */
  const generalReport = () => {
    setPhase("general");
  };

  switch (phase) {
    case "boot":
      reportInfo = (
        <View>
          <Text>Loading</Text>
        </View>
      );
      break;
    case "singleReport":
      reportInfo = (
        <View>
          <SingleReport
            navigation={navigation}
            convoId={convoId}
            asurite={asurite}
            reportee={reportee}
          />
        </View>
      );
      break;
    case "general":
      reportInfo = (
        <View>
          <Text>No user selected. General Report</Text>
        </View>
      );
      break;
    default:
  }

  return <View>{reportInfo}</View>;
}

function getFirstUser(users, asurite) {
  if (Array.isArray(users)) {
    for (let i = 0; i < users.length; i++) {
      if (users[i] !== asurite) {
        return users[i];
      }
    }
  }
  return null;
}

const ReportContent = AppSyncComponent(ReportAAS, getConversationUsersQuery);
