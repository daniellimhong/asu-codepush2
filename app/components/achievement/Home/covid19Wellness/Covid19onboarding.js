import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Text,
  View,
  AsyncStorage,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Modal,
  Image,
  Linking,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import IonIcons from "react-native-vector-icons/Ionicons";
import { AuthRender } from "../../../functional/authentication/auth_components/weblogin/index";
import { AppSyncComponent } from "../../../functional/authentication/auth_components/appsync/AppSyncApp";
import {
  getCovid19OnboardingCardsContent,
  getCovidOnboardPermissions,
  setCovidOnboardPermissionsMutation,
} from "./gql/Queries";
import Analytics from "../../../functional/analytics";
import CovidOnBoardImages from "./Covid19onboardingImages";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ErrorWrapper } from "../../../functional/error/ErrorWrapper";
// import Modal from 'react-native-modal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(52, 52, 52, 0.8)",
  },
  modal: {
    flex: 1,
    backgroundColor: "white",
    margin: 10,
    marginTop: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topDivContainer: {
    flex: 0.5,
    backgroundColor: "#FFC627",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  topDiv: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mainDivContainer: {
    flex: 0.5,
    backgroundColor: "white",
  },
  mainDiv: {
    padding: 15,
  },
  policyContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10
  },
  policyText:{
    fontSize: 14,
    color: "black",
    marginBottom: 20,
    fontFamily: "roboto"
  },
  footerPolicyContainer: {
    flex: 0.2,
    justifyContent: "center",
    padding: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "white"
  },
  footerContainer: {
    flex: 0.2,
    justifyContent: "center",
    // alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  footer: {
    justifyContent: "space-between",
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },
  mainText: {
    fontSize: 14,
    color: "black",
    marginBottom: 20,
    fontFamily: "roboto"
  },
  mainTextBold: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
    marginBottom: 5,
    fontFamily: "roboto"
  },
  closeIcon: {
    padding: 5,
  },
  pageNumberContainer: {
    padding: 5,
  },
  pageNumberText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
    fontFamily: "roboto"
  },
  footerButton: {
    backgroundColor: "#FFC627",
    borderRadius: 20,
    width: responsiveWidth(40),
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "black",
    fontFamily: "roboto"
  },
  helpBox: {
    borderWidth: 1,
    backgroundColor: "#F1F1F1",
    borderColor: "#D4D4D4",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  helpTextBold: {
    fontSize: 12,
    fontWeight: "bold",
    color: "black",
    fontFamily: "roboto"
  },
  helpText: {
    fontSize: 12,
    color: "black",
    fontFamily: "roboto"
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    height: responsiveHeight(17),
    width: responsiveWidth(33),
    alignSelf: "center",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: "#B9B9B9",
    fontFamily: "roboto"
  },
  cardTitle: {
    alignItems: "center",
    marginTop: 15,
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    alignSelf: "center",
    marginHorizontal: 2,
    fontFamily: "roboto"
  },
  cardHeadingWhite: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    backgroundColor: "white",
    paddingHorizontal: 5,
    alignSelf: "center",
    marginHorizontal: 2,
    fontFamily: "roboto"
  },
  titleText: {
    flexDirection: "row",
  },
  privacyContainer: {},
  settingWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingTitle: {
    fontWeight: "bold",
    color: "black",
    fontSize: 14,
  },
  settingTitleWrapper: {
    flex: 0.7,
  },
  settingSwtichWrapper: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  settingHelpText: {
    fontSize: 12,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#B9B9B9",
    fontFamily: "roboto"
  },
  skipText: {
    fontSize: 14,
    color: "#7A7A7A",
    fontWeight: "400",
    fontFamily: "roboto"
  },
});

function Covid19OnboardingCardsComponent(props) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [covidOnboardContent, setCovidOnboardContent] = useState();
  const [renderPage, setRenderPage] = useState(1);
  const [renderPageContent, setRenderPageContent] = useState();
  const [totalPages, setTotalPages] = useState(1);
  const [shareLocation, setShareLocation] = useState(false);
  const [shareHealthRecords, setShareHealthRecords] = useState(false);
  const [showProximityConsentTerms, setShowProximityConsentTerms] = useState(false);
  const [showConsentAuthorizationTerms, setShowConsentAuthorizationTerms] = useState(false);
  const [showPrivacyTerms, setShowPrivacyTerms] = useState(false);
  let analyticsRef = useRef(null);

  useEffect(() => {
    if (
      props.covidOnboarding.covidOnboardingCardsContent &&
      props.covidPermissions.getCovidOnboardPermissions
    ) {
      _retrieveData("covid_onboarding").then((response) => {
        let page = renderPage;
        let pageContent = null;
        let cardsContent = props.covidOnboarding.covidOnboardingCardsContent.sort(
          function(a, b) {
            // if (a.enabled) {
              return a.page - b.page;
            // }
          }
        );

        cardsContent = cardsContent.filter(function(card) {
          return card.enabled && !card.show_consent_auth && !card.show_proximity_consent;
        });

        // for( var i = 0; i < cardsContent.length; ++i )

        if (response && response != "completed") {
          page = parseInt(response);
          setRenderPage(page);
        }
        pageContent = cardsContent.filter(function(card) {
          return card.page == page;
        });

        setTotalPages(cardsContent.length);
        setShareLocation(
          props.covidPermissions.getCovidOnboardPermissions.share_location
        );
        setShareHealthRecords(
          props.covidPermissions.getCovidOnboardPermissions.share_health_records
        );
        setCovidOnboardContent(cardsContent);
        setRenderPageContent(pageContent[0]);
      });
    }
  }, [props]);

  useEffect(() => {
    _retrieveData("covid_onboarding").then((response) => {
      if (!response || (response && response !== "completed")) {
        analyticsRef.current.sendData({
          "action-type": "view",
          "starting-screen": "home",
          "starting-section": null,
          target: "covid-onboarding-open",
          "resulting-screen": "home",
          "resulting-section": "covid-onboarding-modal",
          "action-metadata": {
            screen: response ? response : "1",
          },
        });
        toggleModal();
      }
    });
  }, []);

  const toggleModal = () => {
    if (isModalVisible) {
      if (renderPage == totalPages) {
        _storeData("covid_onboarding", "completed");
      } else _storeData("covid_onboarding", "" + renderPage);

      // Store permissions in table
      props.client
        .mutate({
          mutation: setCovidOnboardPermissionsMutation,
          fetchPolicy: "no-cache",
          variables: {
            type: "update",
            payload: {
              share_location: shareLocation,
              share_health_records: shareHealthRecords,
            },
          },
        })
        .then((response) => {
          if (response.data.setCovidOnboardPermissions) {
            console.log("Successfully set Covid Onboard Permissions");
          }
        })
        .catch((error) => {
          console.log("Error setting Covid Onboard Permissions", error);
        });
    }
    setModalVisible(!isModalVisible);
  };

  _retrieveData = async (itemToRetrieve) => {
    try {
      const value = await AsyncStorage.getItem(itemToRetrieve);
      if (value !== null) {
        // We have data!!
        return value;
      } else {
        console.log("no data has been set");
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  _storeData = async (key, whatToSave) => {
    try {
      await AsyncStorage.setItem(key, whatToSave);
      return true;
    } catch (error) {
      return false;
    }
  };

  getStatus = (s) => {
    if (s) {
      return (
        <View accessible={true} accessibilityLabel={"On. Button"}>
          <FontAwesome
            name="toggle-on"
            color="#FFC627"
            size={responsiveFontSize(4.5)}
          />
        </View>
      );
    } else {
      return (
        <View accessible={true} accessibilityLabel={"Off. Button"}>
          <FontAwesome
            name="toggle-on"
            style={{ transform: [{ rotate: "180deg" }] }}
            color="#b8bdc4"
            size={responsiveFontSize(4.5)}
          />
        </View>
      );
    }
  };

  return (
    <AuthRender>
      <Analytics ref={analyticsRef} />
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.container}>
          {!showProximityConsentTerms && !showConsentAuthorizationTerms && !showPrivacyTerms &&
          <View style={styles.modal}>
            <View style={styles.topDivContainer}>
              <View style={styles.topDiv}>
                <TouchableOpacity
                  onPress={() => {
                    toggleModal();
                    analyticsRef.current.sendData({
                      "action-type": "click",
                      "starting-screen": "home",
                      "starting-section": "covid-onboarding-modal",
                      target: "covid-onboarding-close",
                      "resulting-screen": "home",
                      "resulting-section": null,
                      "action-metadata": {
                        screen: "" + renderPage,
                        "button-type": "icon",
                      },
                    });
                  }}
                  accessibilityLabel="Close modal"
                  accessibilityRole="button"
                >
                  <View style={styles.closeIcon}>
                    <IonIcons
                      style={{
                        alignSelf: "center",
                      }}
                      name="md-close"
                      size={23}
                      color="black"
                    />
                  </View>
                </TouchableOpacity>
                <View style={styles.pageNumberContainer}>
                  <Text allowFontScaling={false} style={styles.pageNumberText}>
                    {renderPage}/{totalPages}
                  </Text>
                </View>
              </View>
              {renderPageContent && (
                <View>
                  <View styles={styles.imageContainer}>
                    <Image
                      style={styles.cardImage}
                      source={
                        CovidOnBoardImages[renderPageContent.image_name].url
                      }
                      resizeMode="contain"
                      resizeMethod="scale"
                    />
                  </View>

                  <View style={styles.cardTitle}>
                    {renderPageContent.firstLineText && (
                      <View style={styles.titleText}>
                        {renderPageContent.firstLineText.map(
                          (lineText, index) => {
                            lineText = JSON.parse(lineText);
                            return (
                              <Text
                                allowFontScaling={false}
                                style={
                                  lineText.whiteBackground
                                    ? styles.cardHeadingWhite
                                    : styles.cardHeading
                                }
                                key={index}
                              >
                                {lineText.text}
                              </Text>
                            );
                          }
                        )}
                      </View>
                    )}
                    {renderPageContent.secondLineText && (
                      <View style={styles.titleText}>
                        {renderPageContent.secondLineText.map(
                          (lineText, index) => {
                            lineText = JSON.parse(lineText);
                            return (
                              <Text
                                allowFontScaling={false}
                                style={
                                  lineText.whiteBackground
                                    ? styles.cardHeadingWhite
                                    : styles.cardHeading
                                }
                                key={index}
                              >
                                {lineText.text}
                              </Text>
                            );
                          }
                        )}
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
            <View style={styles.mainDivContainer}>
              <ScrollView>
                <View style={styles.mainDiv}>
                  {!renderPageContent && (
                    <View style={{ alignItems: "center", paddingVertical: 30 }}>
                      <ActivityIndicator size="large" color="maroon" />
                    </View>
                  )}
                  {renderPageContent &&
                    renderPageContent.paragraphs &&
                    renderPageContent.paragraphs.map((para, index) => {
                      const splitArray = para.split(" ");
                      let boldIndex;
                      const newArray = splitArray.map((el, index) => {
                        if (el[0] === "<" && el[1] === "b" && el[2] === ">") {
                          const newEl = el
                            .replace("<b>", ``)
                            .replace("</b>", "");
                          boldIndex = index;
                          return newEl;
                        } else {
                          return el;
                        }
                      });

                      if (boldIndex) {
                        return (
                          <View
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <Text allowFontScaling={false}>
                              {para.slice(0, para.indexOf("<b>"))}
                              <Text style={{ fontWeight: "bold" }}>
                                {newArray[boldIndex]}
                              </Text>
                              {para.slice(
                                para.indexOf("</b>") + 4,
                                para.length
                              )}
                            </Text>
                          </View>
                        );
                      } else {
                        return (
                          <Text
                            allowFontScaling={false}
                            style={styles.mainText}
                            key={index}
                          >
                            {para}
                          </Text>
                        );
                      }
                    })}
                  {renderPageContent &&
                    renderPageContent.paragraphs_bold &&
                    renderPageContent.paragraphs_bold.map((paraBold, index) => {
                      return (
                        <Text
                          allowFontScaling={false}
                          style={styles.mainTextBold}
                          key={index}
                        >
                          {paraBold}
                        </Text>
                      );
                    })}
                  {renderPageContent &&
                    ((renderPageContent.box_text &&
                      renderPageContent.box_text.length > 0) ||
                      (renderPageContent.box_text_title &&
                        renderPageContent.box_text_title.length > 0)) && (
                      <View style={styles.helpBox}>
                        {renderPageContent &&
                          renderPageContent.box_text_title.length > 0 && (
                            <Text
                              allowFontScaling={false}
                              style={styles.helpTextBold}
                            >
                              {renderPageContent.box_text_title}
                            </Text>
                          )}
                        {renderPageContent &&
                          renderPageContent.box_text.length > 0 && (
                            <Text
                              allowFontScaling={false}
                              style={styles.helpText}
                            >
                              {renderPageContent.box_text}
                            </Text>
                          )}
                      </View>
                    )}
                    {/* {renderPageContent && renderPageContent.show_terms && (
                        <TouchableOpacity
                        onPress={() => {
                            analyticsRef.current.sendData({
                            "action-type": "click",
                            "starting-screen": "home",
                            "starting-section": "covid-onboarding-modal",
                            target: "covid-onboarding-terms-conditions",
                            "resulting-screen": "external-browser",
                            "resulting-section": null,
                            "action-metadata": {
                                link: "https://www.asu.edu/tou/",
                            },
                            });
                            Linking.openURL("https://www.asu.edu/tou/");
                        }}
                        >
                        <View style={styles.termsContainer}>
                            <Text allowFontScaling={false} style={styles.termsText}>
                            Terms {"\u0026"} Conditions
                            </Text>
                            <IonIcons
                            style={{
                                alignSelf: "center",
                                marginHorizontal: 10,
                            }}
                            name="ios-arrow-forward"
                            size={18}
                            />
                        </View>
                        </TouchableOpacity>
                    )} */}
                    {renderPageContent && renderPageContent.show_proximity_consent && (
                        <TouchableOpacity
                            onPress={() => {
                            // analyticsRef.current.sendData({
                            //   "action-type": "click",
                            //   "starting-screen": "home",
                            //   "starting-section": "covid-onboarding-modal",
                            //   target: "covid-onboarding-proximity-consent",
                            //   "resulting-screen": "external-browser",
                            //   "resulting-section": null
                            // });
                            // Linking.openURL("https://www.asu.edu/tou/");
                            setShowProximityConsentTerms(false);
                            }}
                        >
                            <View style={styles.termsContainer}>
                            <Text style={styles.termsText}>
                                Proximity Notification Consent
                            </Text>
                            <IonIcons
                                style={{
                                alignSelf: "center",
                                marginHorizontal: 10,
                                }}
                                name="ios-arrow-forward"
                                size={18}
                            />
                            </View>
                        </TouchableOpacity>
                        )
                    }
                    {
                    //   renderPageContent && renderPageContent.show_consent_auth && (
                    //     <TouchableOpacity
                    //         onPress={() => {
                    //         // analyticsRef.current.sendData({
                    //         //   "action-type": "click",
                    //         //   "starting-screen": "home",
                    //         //   "starting-section": "covid-onboarding-modal",
                    //         //   target: "covid-onboarding-consent-authorization",
                    //         //   "resulting-screen": "external-browser",
                    //         //   "resulting-section": null,
                    //         // });
                    //         // Linking.openURL("https://www.asu.edu/tou/");
                    //         setShowConsentAuthorizationTerms(true);
                    //         }}
                    //     >
                    //         <View style={styles.termsContainer}>
                    //             <Text style={styles.termsText}>
                    //                 Consent and Authorization
                    //             </Text>
                    //             <IonIcons
                    //                 style={{
                    //                 alignSelf: "center",
                    //                 marginHorizontal: 10,
                    //                 }}
                    //                 name="ios-arrow-forward"
                    //                 size={18}
                    //             />
                    //         </View>
                    //     </TouchableOpacity>
                    // )
                    }
                  {renderPageContent && renderPageContent.show_privacy && (
                    <TouchableOpacity
                      onPress={() => {
                        // analyticsRef.current.sendData({
                        //   "action-type": "click",
                        //   "starting-screen": "home",
                        //   "starting-section": "covid-onboarding-modal",
                        //   target: "covid-onboarding-privacy",
                        //   "resulting-screen": "external-browser",
                        //   "resulting-section": null,
                        //   "action-metadata": {
                        //     link: "https://www.asu.edu/privacy/",
                        //   },
                        // });
                        // Linking.openURL("https://www.asu.edu/privacy/");
                        setShowPrivacyTerms(true);
                      }}
                    >
                      <View style={styles.termsContainer}>
                        <Text allowFontScaling={false} style={styles.termsText}>
                          Privacy Information
                        </Text>
                        <IonIcons
                          style={{
                            alignSelf: "center",
                            marginHorizontal: 10,
                          }}
                          name="ios-arrow-forward"
                          size={18}
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                  {renderPageContent &&
                    renderPageContent.privacySettings &&
                    renderPageContent.privacySettings.map((settings, index) => {
                      settings = JSON.parse(settings);
                      return (
                        <View style={styles.privacyContainer} key={index}>
                          <View style={styles.settingWrapper}>
                            <View style={styles.settingTitleWrapper}>
                              <Text
                                allowFontScaling={false}
                                style={styles.settingTitle}
                              >
                                {settings.title}
                              </Text>
                            </View>
                            <View style={styles.settingSwtichWrapper}>
                              {settings.name == "shareLocation" && (
                                <TouchableWithoutFeedback
                                  onPress={() => {
                                    analyticsRef.current.sendData({
                                      "action-type": "click",
                                      "starting-screen": "home",
                                      "starting-section":
                                        "covid-onboarding-modal",
                                      target: "toggle-covid-share-location",
                                      "resulting-screen": "home",
                                      "resulting-section":
                                        "covid-onboarding-modal",
                                      "action-metadata": {
                                        value: "" + !shareLocation,
                                      },
                                    });
                                    setShareLocation(!shareLocation);
                                  }}
                                  style={styles.settingsButton}
                                >
                                  {getStatus(shareLocation)}
                                </TouchableWithoutFeedback>
                              )}
                              {settings.name == "shareHealthRecords" && (
                                <TouchableWithoutFeedback
                                  onPress={() => {
                                    analyticsRef.current.sendData({
                                      "action-type": "click",
                                      "starting-screen": "home",
                                      "starting-section":
                                        "covid-onboarding-modal",
                                      target:
                                        "toggle-covid-share-health-records",
                                      "resulting-screen": "home",
                                      "resulting-section":
                                        "covid-onboarding-modal",
                                      "action-metadata": {
                                        value: "" + !shareHealthRecords,
                                      },
                                    });
                                    setShareHealthRecords(!shareHealthRecords);
                                  }}
                                  style={styles.settingsButton}
                                >
                                  {getStatus(shareHealthRecords)}
                                </TouchableWithoutFeedback>
                              )}
                            </View>
                          </View>
                          {settings.newHelptext && settings.newHelptext.length > 0 && (
                            <Text
                              allowFontScaling={false}
                              style={styles.settingHelpText}
                            >
                              {settings.newHelptext}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                </View>
              </ScrollView>
            </View>
            <View style={styles.footerContainer}>
              <View style={styles.footer}>
                {renderPage < totalPages && (
                  <TouchableOpacity
                    onPress={() => {
                      analyticsRef.current.sendData({
                        "action-type": "click",
                        "starting-screen": "home",
                        "starting-section": "covid-onboarding-modal",
                        target: "covid-onboarding-next",
                        "resulting-screen": "home",
                        "resulting-section": "covid-onboarding-modal",
                        "action-metadata": {
                          "current-screen": "" + renderPage,
                          "button-type": "button",
                        },
                      });
                      if (covidOnboardContent) {
                        // pageContent = covidOnboardContent.filter(function(
                        //   card
                        // ) {
                        //   console.log("FINDING PAGE: ",renderPage + 1,card.page,covidOnboardContent)
                        //   return card.page == renderPage + 1;
                        // });
                        // // pageContent = covidOnboardContent[renderPage+1];
                        // console.log("PAGE CONTNT: ",pageContent);
                        // // pageContent = covidOnboardContent
                        // setRenderPageContent(pageContent[0]);

                        pageContent = covidOnboardContent[renderPage];
                        console.log("PAGE CONTNT: ",pageContent);
                        // pageContent = covidOnboardContent
                        setRenderPageContent(pageContent);

                        setRenderPage(renderPage + 1);
                      }
                    }}
                    accessibilityLabel="Next Page"
                    accessibilityRole="button"
                  >
                    <View style={styles.footerButton}>
                      <Text
                        allowFontScaling={false}
                        style={styles.footerButtonText}
                      >
                        Next
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                {renderPage == totalPages && (
                  <TouchableOpacity
                    onPress={() => {
                      toggleModal();
                      analyticsRef.current.sendData({
                        "action-type": "click",
                        "starting-screen": "home",
                        "starting-section": "covid-onboarding-modal",
                        target: "covid-onboarding-close",
                        "resulting-screen": "home",
                        "resulting-section": null,
                        "action-metadata": {
                          screen: "4",
                          "button-type": "button",
                        },
                      });
                    }}
                    accessibilityLabel="Close Modal"
                    accessibilityRole="button"
                  >
                    <View style={styles.footerButton}>
                      <Text
                        allowFontScaling={false}
                        style={styles.footerButtonText}
                      >
                        Close
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                {renderPage != 1 && renderPage != totalPages && (
                  <TouchableOpacity
                    onPress={() => {
                      toggleModal();
                      analyticsRef.current.sendData({
                        "action-type": "click",
                        "starting-screen": "home",
                        "starting-section": "covid-onboarding-modal",
                        target: "covid-onboarding-skip",
                        "resulting-screen": "home",
                        "resulting-section": null,
                        "action-metadata": {
                          screen: "" + renderPage,
                        },
                      });
                    }}
                    accessibilityLabel="Skip for now"
                    accessibilityRole="button"
                  >
                    <Text allowFontScaling={false} style={styles.skipText}>
                      Skip for now
                    </Text>
                  </TouchableOpacity>
                )}
                {/* <Button style={styles.footerButton} title="Next" color="#FFC627" onPress={toggleModal} > */}
                {/* </Button> */}
              </View>
            </View>
          </View>
          }
          { showProximityConsentTerms &&
            <View style={styles.modal}>
              <View style={styles.topPolicyDivContainer}>
                <View style={styles.topDiv}>
                  <TouchableOpacity onPress={() => {
                    setShowProximityConsentTerms(false);
                  }}>
                    <View style={styles.closeIcon}>
                      <IonIcons
                              style={{
                                alignSelf: "center",
                                marginHorizontal: 10,
                              }}
                              name="ios-arrow-back"
                              size={18}
                            />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView style={styles.policyContainer}>
                <Text style= {styles.policyText}>
                  {renderPageContent && renderPageContent.policyText}
                  {/* Proximity Notification Consent:
                  \n \n We are asking all members of the ASU community to allow the use of device location information on ASU’s Network to assist in notifying individuals that they may have been in close proximity with someone who has tested positive for COVID-19 and should take additional precautions (“Proximity Notification”).
                  \n \n If you consent, ASU will use the location information we receive when your device connects to ASU Wi-Fi access points to triangulate your physical location while you are connected to the network.  That information will be stored in a database of location/time/device information.  When we learn that someone has tested positive for COVID-19, we will search the database to identify devices that could have been in closeproximity with that person’s devices for a length of time that could increase the chances of spreading the COVID-19 virus, and provide notice to those individuals.
                  \n \n We will typically keep the location/time/device information for 14 days after we gather it. We will not include any personally identifiable information in the database other than your device ID number and your location. ASU is able, however, to match your device IDto your name if needed to protect the health and safety of you or others. We will use the information to provide the Proximity Notification described above.  We will not provide your name or device ID when providing Proximity Notification to other students. We typically will not share the information with any external parties except as necessary for the performance of the app, as required by applicable law, or as may be needed to protect the health and safety of you or others. Except for when a disclosure is required by law, external parties who receive location data may only use and disclose it to perform their duties on behalf of ASU, and are otherwise required to maintain its confidentiality. We will handle the data in accordance with ASU’s Privacy Policy.
                  \n \n You are able to opt out at any time by updating your preferences in the ASU Mobile App.
                  \n \n By opting into this service, you agree that you have read this Consent in full and agree that ASU may gather data on your location as described above to use in Proximity Notification and that you wish to receive Proximity Notifications if ASU determines your device was in proximity to the device of an individual who has tested positive for COVID-19.  */}
                </Text>
              </ScrollView>
              <View style={styles.footerPolicyContainer}>
                <View style={styles.footer}>

                </View>
              </View>
            </View>
          }

          { showConsentAuthorizationTerms &&
            <View style={styles.modal}>
              <View style={styles.topPolicyDivContainer}>
                <View style={styles.topDiv}>
                  <TouchableOpacity onPress={() => {
                    setShowConsentAuthorizationTerms(false);
                  }}>
                    <View style={styles.closeIcon}>
                      <IonIcons
                              style={{
                                alignSelf: "center",
                                marginHorizontal: 10,
                              }}
                              name="ios-arrow-back"
                              size={18}
                            />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView style={styles.policyContainer}>
                <Text style= {styles.policyText}>
                  {renderPageContent && renderPageContent.policyText}
                  {/* You are being asked to authorize, and to consent to, the release of your COVID-19 Laboratory Test Results by your health care provider and by Arizona State University (ASU) and its partners as part of ASU’s COVID-19 exposure management outreach efforts. This consent is voluntary. Please read carefully, and indicate your consent using the button below.
                  \n \n CONSENT AND AUTHORIZATION FOR
                  \n \n RELEASE OF CONFIDENTIAL & PROTECTED HEALTH INFORMATION
                  \n \n I hereby authorize my health care provider to disclose my COVID-19 Laboratory Test Results, which may include a positive diagnosis for COVID-19, to Arizona State University and its partners who are assisting with its COVID-19 exposure management outreach efforts (collectively the “Recipients”).  These partners include Safe Health Systems, Inc. which administers portions of the ASU Mobile App platform on behalf of ASU.
                  \n \n I also authorize the Recipients to use and disclose my COVID-19 Laboratory Test Results for ASU’s COVID-19 exposure management outreach efforts, and that information about my test results is a necessary part of ASU’s efforts to reduce exposure to and slow the spread of the disease.  I understand such disclosures may be made (1) to individuals with whom I may have been in close contact, such that their risk of contracting COVID-19 may have increased, (2) to ASU employees engaged in overseeing university operations for their use in determining who may be eligible to come to campus to work or study, (3) to public health officials, or (4) to the general public.  I understand that, with the exception of disclosures to ASU employees determining who may be eligible to come to campus to work or study, the disclosures of my information will typically include only my positive status and general location.  However, I understand that ASU may determine it is necessary in some cases to share additional information such as demographic information, including my identity, with individuals who I may have exposed, and I consent to such disclosures.
                  \n \n I further authorize the disclosure of my COVID-19 Laboratory Test Results to the Recipients inconnection with the development, maintenance, and operation of workforce management tools designed to support employer decision-making regarding the workforce’s ready-to-work status based on infectious disease, such as the My ASU App.
                  \n \n I understand that information disclosed pursuant to this authorization may be protected under the Federal privacy regulations within the Health Insurance Portability and Accountability Act of 1996 (HIPAA), 45 C.F.R. Parts 160 & 164 and that once my information is disclosed to the Recipients, it may be subject to re-disclosure and no longer be protected.
                  \n \n This authorization will expire one year from the date I sign the authorization. I also understand that I may revoke this authorization at any time except to the extent that action has been taken in reliance on it. This authorization may be revoked by updating my preferences in the ASU Mobile App.
                  \n \n I understand that the Covered Entity seeking this authorization is not conditioning treatment, payment, enrollment or eligibility for benefits on whether I sign the authorization.
                  \n \n I understand that I am entitled to receive a copy of this authorization after it is signed.
                  \n \n \n \n By opting into this service, I agree that I have read this Consent and Authorization in full and agree and consent to the uses and disclosures of my information described above.
                  \n \n Last updated on 10th August 2020. */}
                </Text>
              </ScrollView>
              <View style={styles.footerPolicyContainer}>
                <View style={styles.footer}>

                </View>
              </View>
            </View>
          }

          { showPrivacyTerms &&
            <View style={styles.modal}>
              <View style={styles.topPolicyDivContainer}>
                <View style={styles.topDiv}>
                  <TouchableOpacity onPress={() => {
                    setShowPrivacyTerms(false);
                  }}>
                    <View style={styles.closeIcon}>
                      <IonIcons
                              style={{
                                alignSelf: "center",
                                marginHorizontal: 10,
                              }}
                              name="ios-arrow-back"
                              size={18}
                            />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView style={styles.policyContainer}>
                <Text style= {styles.policyText}>
                  {renderPageContent && renderPageContent.policyText}
                  {/* Privacy Notice
                  \n \n This Privacy Notice provides information about ASU’s practices relating to its collection, use and disclosure of your health assessment data through the Daily Health Check tool within the ASU Mobile App.  Please refer also to ASU’s Privacy Statement at https://www.asu.edu/privacy/for additional information about ASU’s online information gathering and dissemination practices.  ASU will publish any changes to this Privacy Notice in the ASU Mobile App.  You will also be notified of any updates to this Notice through in-application messaging.
                  \n \n What is a Daily Health Check?
                  \n \n The CDC’s COVID-19 Considerations for Institutes of Higher Learning recommends daily health checks as a way to protect students and employees and slow the spread of COVID-19.  Accordingly, ASU is requiring all students, faculty and staff complete an online interactive DailyHealth Check before coming onto campus.  The Daily Health Check asks individuals to answer questions about COVID-19 signs and symptoms and provides follow up instructions based on the individual’s responses. Individuals that do not submit a Daily Health Check before arriving will not be permitted on campus.
                  \n \n What information does ASU collect as part of the Daily Health Check?
                  \n \n The Daily Health Check tool requires each individual to submit information about when they plan to be on campus, and, if they will be on site, what their temperature is and whether they are experiencing signs or symptoms of COVID-19 (e.g., fever, cough, shortness of breath, loss of smell etc.).
                  \n \n How does ASU use my Daily Health Check data?
                  \n \n ASU will use the data submitted through the Daily Health Check to determine whether an individual is permitted on campus and to monitor individual compliance with ASU’s COVID-19 mitigation strategy. This means that the data an individual submits may be shared internally with a limited number of ASU employees whose role is to assist in ASU’s exposure management outreach and risk mitigation efforts, including determining which individuals are permitted on campus and when they can return after illness.  ASU employees who receive Daily Health Checkdata may use and disclose it as needed to perform their duties on behalf of ASU but are otherwiserequired to maintain its confidentiality.
                  \n \n Does ASU share my Daily Health Check data with any third parties?
                  \n \n Data submitted through the Daily Health Check tool may be shared with ASU vendors contractedto assist in the operation of the ASU Mobile App platform.  This is necessary for the primary service of the app, to support the platform’s operations, to engage in product improvement, and for development, maintenance, and operation of workforce management tools designed to support employer decision-making regarding the workforce’s ready-to-work status based on infectious disease.  ASU may also share an individual’s Daily Health Check data with external parties as required by applicable law or as may be needed to protect the health and safety of individuals on campus.  Except for when a disclosure may be required by law, external parties who receive Daily Health Check data may use and disclose it as permitted by law to perform their duties on behalf of ASU but are otherwise required to maintain its confidentiality.
                  \n \n Does ASU sell my Daily Health Check data?
                  \n \n No.
                  \n \n Is my Daily Health Check data secure?
                  \n \n The Daily Health Check data tool automatically encrypts data in the app, while the data is being transmitted, and when it is being stored by the platform vendor.  Data that is encrypted has been converted into encoded text in such a way that only authorized parties can read it.
                  \n \n Does the Daily Health Check tool access to my device’s other data or applications?
                  \n \n No.  The Daily Health Check tool does not access other device data or applications, such as an individual’s phone’s camera, photos, or contacts.
                  \n \n Does the Daily Health Check tool allow me to share my data with my social media accounts?
                  \n \n No.  The technology does not allow an individual to share collected data with social media accounts.
                  \n \n Does the Daily Health Check allow me to access, edit, share or delete my data once it has been submitted?
                  \n \n No.  Once an individual has completed the Daily Health Check an individual cannot access, edit, share or delete their data.
                  \n \n For how long does ASU store my Daily Health Check data?
                  \n \n It is ASU’s practice to regularly purge the Daily Health Check data.  Data is usually stored for nomore than 30 days.
                  \n \n What happens to my Daily Health Check data when I am no longer enrolled with or employed at ASU?
                  \n \n When an individual is no longer affiliated with ASU as a student or employee, ASU automatically deactivates their ASU Mobile App account.  Daily Health Check data that has not already been purged at the time of account deactivation will be purged in accordance with ASU’snormal practice.  Daily Health Check data is usually stored for no longer than 30 days.
                  \n \n Will I be notified if my Daily Health Check data is improperly disclosed?
                  \n \n ASU follows all applicable laws regarding unauthorized access to information and will follow itsexisting policies and procedures in the event of a suspected or confirmed breach.
                  \n \n Who do I contact if I have more questions about my Daily Health Check data or this Privacy Notice?
                  \n \n Please contact ASU’s privacy team at privacy@asu.edu.  ASU will use reasonable efforts to address your concerns; although there may be circumstances where we cannot assist. */}
                </Text>
              </ScrollView>
              <View style={styles.footerPolicyContainer}>
                <View style={styles.footer}>

                </View>
              </View>
            </View>
          }

        </View>
      </Modal>
    </AuthRender>
  );
}

const Covid19OnboardingCards = AppSyncComponent(
  Covid19OnboardingCardsComponent,
  getCovid19OnboardingCardsContent,
  getCovidOnboardPermissions
);

class Covid19onboarding extends React.Component {
  componentDidMount() {
    //   this.refs.analytics.sendData({
    //     "action-type": "click",
    //     "starting-screen": "sun-devil-rewards",
    //     "starting-section": null,
    //     target: "Sun Devil Future Features",
    //     "resulting-screen": "sdr-future-features",
    //     "resulting-section": null,
    //   });
  }

  render() {
    return (
      <View>
        <Analytics ref="analytics" />
        <Covid19OnboardingCards {...this.props} />
      </View>
    );
  }
}

export default Covid19onboarding;
