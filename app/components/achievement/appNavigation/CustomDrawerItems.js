import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { StackActions } from "react-navigation";
import Icon from "react-native-vector-icons/MaterialIcons";
import { responsiveFontSize } from "react-native-responsive-dimensions";
import Analytics from "../../functional/analytics";
import { AuthRender } from "../../functional/authentication/auth_components/weblogin/index";

import styles from "./styles";

var currentScreenName = "home";

export default CustomDrawerItems = (props) => {

  const analyticsRef = useRef(null)
  visibleItems = [];
  const hiddenRoutes = props.settings.hiddenRoutes;
  props.items.forEach((route, index) => {
    const focused = props.activeItemKey === route.key;
    const color = focused ? props.activeTintColor : props.inactiveTintColor;
    const scene = { route, index, focused, tintColor: color };
    const label = props.getLabel(scene);
    const icon = props.renderIcon(scene);
    if (label && !(hiddenRoutes && hiddenRoutes.includes(route.routeName))) {
      visibleItems.push({ ...route, label: label, icon: icon });
    }
  });
  groups = {};
  singleItems = visibleItems.filter((route, index) => {
    if (route.params && route.params.group) {
      route.params.group in groups
        ? groups[route.params.group].push({ ...route, index: index })
        : (groups[route.params.group] = [{ ...route, index: index }]);
      return false;
    }
    return true;
  });

  combined = [...singleItems];
  if (groups) {
    Object.keys(groups).map((key) => {
      combined.splice(groups[key][0].index, 0, {
        grouped: true,
        groupName: key,
        role: groups[key][0].params.role ? groups[key][0].params.role : null,
        groupLabel: groups[key][0].params.groupLabel,
        groupTag: groups[key][0].params.groupTag,
        groupIcon: groups[key][0].params.groupIcon
          ? groups[key][0].params.groupIcon()
          : null,
        routes: groups[key],
      });
    });
  }

  return (
    <View style={styles.drawerMenuContainer}>
      <Analytics ref={analyticsRef}/>
      {combined.map((route, index) => {
        let chosenStyle = styles.drawerItem;

        if (index + 1 == combined.length) {
          chosenStyle = styles.drawerBottom;
        }

        return route.grouped ? (

          route.role ? (
          <AuthRender type={route.role}>
          <GroupedDrawerItem
            key={route.groupName}
            item={route}
            navigation={props.navigation}
            style={chosenStyle}
          ></GroupedDrawerItem></AuthRender> ) :  (
            <GroupedDrawerItem
              key={route.groupName}
              item={route}
              navigation={props.navigation}
              style={chosenStyle}
            ></GroupedDrawerItem> ) 
        ) : (
          <TouchableOpacity
            key={route.key}
            onPress={() => {
              props.navigation.dispatch(StackActions.popToTop());
              props.navigation.navigate(route.routeName, {
                previousScreen: currentScreenName,
                previousSection: "drawer-menu",
              });
            }}
            accessibilityRole="button"
          >
            {typeof route.label === "string" ? (
              <View
                style={chosenStyle}
                accessible={true}
                accessibilityLabel={`${route.label}. Button`}
                accessibilityTraits="button"
              >
                {route.icon}
                <Text style={styles.drawerText}>{route.label}</Text>
              </View>
            ) : (
              <View style={styles.fullWidth}>{route.label}</View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const RenderTag = (label) => (
  <View style={styles.tagContainerBox}>
    <View style={styles.tagContainer}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  </View>
);

const GroupedDrawerItem = ({ item, navigation, style }) => {
  const [open, toggleOpen] = useState(false);
  const analyticsRef = useRef(null)
  return (
    <View>
      <Analytics ref={analyticsRef}/>
      <TouchableOpacity
        onPress={() => {
          toggleOpen(!open)
          analyticsRef.current.sendData({
            eventtime: new Date().getTime(),
            "action-type": "click",
            "starting-screen": currentScreenName,
            "starting-section": "drawer-menu",
            target: item.groupLabel,
            "resulting-screen": currentScreenName
              ? currentScreenName
              : null,
            "resulting-section": "drawer-menu",
            "action-metadata": {
              "menu-item" : item.groupName,
              "open": !open
            }
          })
        }}
        accessibilityRole="button"
      >
        <View style={style}>
          {item.groupIcon}
          <Text style={styles.drawerText}>{item.groupLabel}</Text>
          <View style={styles.renderTagContainer}>
            {item.groupTag ? RenderTag(item.groupTag) : null}
            <Icon
              style={styles.expandIcon}
              name={open ? "expand-more" : "chevron-right"}
              size={responsiveFontSize(3.5)}
              color="#fbc628"
            />
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.submenuContainer}>
        {open
          ? item.routes.map((route) => {
              return typeof route.label === "string" ? (
                <TouchableOpacity
                  key={route.routeName}
                  accessibilityRole="button"
                  accessible={true}
                  accessibilityLabel={`${route.label}. Button`}
                  accessibilityTraits="button"
                  onPress={() => {
                    navigation.dispatch(StackActions.popToTop());
                    navigation.navigate(route.routeName, {
                      previousScreen: currentScreenName,
                      previousSection: "drawer-menu",
                    });
                  }}
                >
                  <View style={styles.submenuIconContainer}>
                    {route.icon ? (
                      route.icon
                    ) : (
                      <Icon
                        name="lens"
                        size={responsiveFontSize(3)}
                        color="#a1a1a1"
                      />
                    )}

                    <Text style={styles.drawerText}>{route.label}</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  key={route.routeName}
                  accessibilityRole="button"
                  onPress={() => {
                    navigation.dispatch(StackActions.popToTop());
                    navigation.navigate(route.routeName, {
                      previousScreen: currentScreenName,
                      previousSection: "drawer-menu",
                    });
                  }}
                >
                  <View style={styles.fullWidth}>{route.label}</View>
                </TouchableOpacity>
              );
            })
          : null}
      </View>
    </View>
  );
};
