import React from "react";
import { StyleSheet, View, Image, TouchableOpacity, Text } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
import { Col, Row, Grid } from "react-native-easy-grid";
// import Axios from "axios";

// =======================================================
// DEVELOPER NOTES:
//
// -This file serves to create Image components for icons,
// store a default list of resources, and house auxillary
// functions for <ResourcesPreferences />.
// -The 'this' of ResourcesPreferences is referenced in
// function parameters below.
// =======================================================

// ==================
// HELPER FUNCTIONS:
// ==================

export const capitalize = string => {
  if (typeof string !== "string") return "";
  return string
    .toLowerCase()
    .split(" ")
    .map(string => string.charAt(0).toUpperCase() + string.substring(1))
    .join(" ");
};

export const convertRawResourcesArray = order => {
  const convertedData = [];
  order.forEach(item => convertedData.push(item.resource));
  return convertedData;
};

export const toaster = (message, ResourcesPreferences) => {
  ResourcesPreferences.context.SetToast(message);
};

export const getInitialResourceOrder = ResourcesPreferences => {
  const { mainResources } = ResourcesPreferences.state;
  const result = [];
  if (mainResources && mainResources.length) {
    for (let i = 0; i < mainResources.length; i++) {
      result.push({
        key: `${i}`,
        resource: mainResources[i]
      });
    }
    ResourcesPreferences.setState({ resourceOrder: result });
    return result;
  } else {
    return null;
  }
};

//========================
// CREATE RESOURCE ICONS:
//========================

export const createResourceIcon = (
  resourceTitle,
  iconSize,
  isGrey,
  isMain = false,
  isMisc = false
) => {
  const resource = resourceTitle.toLowerCase().replace(/\s/g, "-");
  let uri = "";
  if (isMisc) {
    uri = `https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/resource_icons_new/Misc/${resource}.png`;
  } else if (isGrey) {
    uri = `https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/resource_icons_new/Grey+Icons/grey-${resource}%402x.png`;
  } else {
    uri = `https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/resource_icons_new/Colored+Icons/${resource}-icon%402x.png`;
  }
  return (
    <React.Fragment>
      <Image
        source={{ uri }}
        style={[
          !isMisc && styles.icon,
          isMain && { flex: 1 },
          { width: iconSize, height: iconSize }
        ]}
      />
    </React.Fragment>
  );
};

// ========================
// GET USER/RESOURCE DATA:
// ========================

export const getUserPrefs = async ResourcesPreferences => {
  const { userResources } = ResourcesPreferences.props;
  if (userResources == null) {
    console.log(
      "userResources are coming in as null, displaying default resources..."
    );
    ResourcesPreferences.setState({
      mainResources: ResourcesPreferences.state.defaultResources
    });
  } else {
    ResourcesPreferences.setState({ mainResources: userResources });
    return userResources;
  }
};

export const getDefaultResources = ResourcesPreferences => {
  const { defaultResources, settings } = ResourcesPreferences.props;
  const role = settings.roles[0];
  const defaultRoleResources = defaultResources.filter(res => res.name == role);
  const result = defaultRoleResources[0].data;
  ResourcesPreferences.setState({
    defaultResources: result
  });
  return result;
};

export const getActiveResources = ResourcesPreferences => {
  const { defaultResources } = ResourcesPreferences.props;
  const activeResources = defaultResources.filter(res => {
    if (res.enabled) return res.data;
  });
  const orderedActiveResources = orderRoleList(activeResources);
  ResourcesPreferences.setState({ activeResources: orderedActiveResources });
  return orderedActiveResources;
};

// =======================
// CREATE RESOURCE GRIDS:
// =======================

orderRoleList = resources => {
  const priority = [
    "recommendedSeniors",
    "recommendedStudents",
    "alumni",
    "graduating",
    "online",
    "student",
    "faculty",
    "staff"
  ];

  return resources.sort(function(a, b) {
    return priority.indexOf(a.name) - priority.indexOf(b.name);
  });
};

_setSlicePositions = isTopRow => {
  let result = {};
  isTopRow ? (result = { a: 0, b: 3 }) : (result = { a: 3, b: 6 });
  return result;
};

export const createGridRow = (set, start, end, ResourcesPreferences) => {
  let icons = (end-start);
  return set.data.slice(start, end).map((resource, index) => {
    return (
      <Col
        style={
            icons == 1 ? [styles.resourcePaneAltSingleIcon] 
          : icons == 2 ? [styles.resourcePaneAltDoubleIcons] 
          : (index+1) !== 3
          ? [styles.resourcePaneAlt, { marginRight: responsiveHeight(1.5) }]
          : [styles.resourcePaneAlt]
        }
        key={index}
      >
        <TouchableOpacity
          style={styles.resourcePaneAltTouchable}
          onPress={() => ResourcesPreferences.addResource(resource)}
        >
          {createNewBadge(resource)}
          <View>
            {createResourceIcon(resource.title, responsiveWidth(12), true)}
          </View>
          <View style={styles.containerAlt}>
            <Text
              style={styles.resourcePaneText}
              adjustsFontSizeToFit={true}
              numberOfLines={2}
            >
              {resource.title}
            </Text>
          </View>
        </TouchableOpacity>
      </Col>
    );
  });
};

//================
// CREATE BADGES:
//================

export const createNewBadge = resource => {
  if (resource.isNew) {
    return (
      <View style={styles.newBadge}>
        <Text
          style={{
            color: "white",
            fontSize: 10
          }}
          adjustsFontSizeToFit={true}
        >
          NEW
        </Text>
      </View>
    );
  } else {
    return null;
  }
};

export const createMainBadge = (resource, ResourcesPreferences) => {
  const { mainResources } = ResourcesPreferences.state;
  if (mainResources.length < 6) {
    return createResourceIcon(
      "Check Circle",
      responsiveWidth(5),
      false,
      false,
      true
    );
  }

  const lastPosition = mainResources.length - 1;
  let lastResource = mainResources[lastPosition].title;

  if (resource.title === lastResource) {
    return createResourceIcon("Arrow", responsiveWidth(5), false, false, true);
  } else {
    return createResourceIcon(
      "Check Circle",
      responsiveWidth(5),
      false,
      false,
      true
    );
  }
};

//=============
// STYLESHEET:
//=============

// resourcePaneAlt and resourcePaneAltTouchable need to be the same size
const resourcePaneSize = responsiveHeight(14);
const minSize = 110;

const styles = StyleSheet.create({
  icon: {
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: responsiveHeight(0.15) },
    shadowOpacity: 0.4,
    shadowRadius: responsiveHeight(0.15),
    resizeMode: "contain",
    overflow: "visible",
    marginBottom: responsiveHeight(0.5)
  },
  resourcePaneAltSingleIcon: {
    flex: 0.295,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    alignSelf: "center",
    width: resourcePaneSize,
    height: resourcePaneSize,
    minHeight: minSize,
    marginBottom: responsiveHeight(1.5),
    marginRight: responsiveHeight(1.5),
    padding: responsiveWidth(2),
    backgroundColor: "#dedede"
  },
  resourcePaneAltDoubleIcons: {
    flex: 0.315,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    alignSelf: "center",
    width: resourcePaneSize,
    height: resourcePaneSize,
    minHeight: minSize,
    marginBottom: responsiveHeight(1.5),
    marginRight: responsiveHeight(1.5),
    padding: responsiveWidth(2),
    backgroundColor: "#dedede"
  },
  resourcePaneAlt: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    alignSelf: "center",
    width: resourcePaneSize,
    height: resourcePaneSize,
    minHeight: minSize,
    marginBottom: responsiveHeight(1.5),
    padding: responsiveWidth(2),
    backgroundColor: "#dedede"
  },
  resourcePaneAltTouchable: {
    position: "absolute",
    width: resourcePaneSize,
    height: resourcePaneSize,
    minWidth: minSize,
    minHeight: minSize,
    padding: responsiveWidth(3)
  },
  resourcePaneText: {
    fontSize: responsiveFontSize(1.5),
    alignSelf: "center",
    textAlign: "center",
    color: "#0B4E6B"
  },
  containerAlt: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  newBadge: {
    position: "absolute",
    bottom: -5,
    borderRadius: 50,
    borderWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 1,
    backgroundColor: "#8C1D40",
    alignSelf: "center"
  }
});
