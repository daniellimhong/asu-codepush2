//components and views import
import React, { PureComponent } from "react";
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Image,
  FlatList, //new import
  Linking,
  InteractionManager,
  Platform
} from "react-native";
//dimensions import
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
  Dimensions
} from "react-native-responsive-dimensions";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ScrollView } from "react-native-gesture-handler";

import { AppSyncComponent } from "../authentication/auth_components/appsync/AppSyncApp";
import { getLawDisclosures, getLawDisclosuresLearnMore } from '../../../Queries/LawDisclosures';
import { WebView } from "react-native-webview";
import { InAppLink } from "../../achievement/InAppLink";
//assets and images import
const headerMain = require("../assets/law/hero.png");

import normal from "./Detail/Normal";

export class LawSchoolX extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      stepIndex: 0,
      webView: false,
      disclosureList: this.props.disclosures ? this.props.disclosures : [],
      paginatedDisclosures: this.props.disclosures ? this.props.disclosures.slice(0, 5) : [],
      updatedWithNewProps: false
    }
    this.startIndex = 0
    this.endIndex = this.startIndex + 4;

    if (this.state.disclosureList.length > 0) {
      this.state.updatedWithNewProps = true;
    }
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.disclosures.length > this.props.disclosures.length) {
      this.setState({ disclosureList: nextProps.disclosures, paginatedDisclosures: nextProps.disclosures.slice(0, 5), updatedWithNewProps: true });

    }
  }
  render = () => {
    const { navigation } = this.props.data;
    const learnMoreLinksArray = this.props.learnMoreLinks;
    var startIndex = 0;
    var endIndex = 5;
    var data = null;
    // console.log('Data in index.js of law school ==>', this.props);

    return (
      <View style={{ flex: 1 }}>


        <ScrollView style={{ height: responsiveHeight(12) }}>



          <View style={styles.body}>
            <View style={{ flex: 1 }}>
              <ImageBackground
                style={[styles.imageBgContainer]}
                source={headerMain}
              >
                <View style={styles.header}>
                  <Text style={styles.titleText} numberOfLines={2}>
                    Sandra Day O'Connor
            </Text>
                  <Text style={styles.mainText}>
                    College of Law
            </Text>

                </View>

              </ImageBackground>
              <View style={{ backgroundColor: '#8C1D40', height: 10, margin: 0 }} />


            </View>



            <View style={styles.shadow}>

              <Text style={{ fontWeight: "700", fontSize: 30, color: 'black' }}>Daily Disclosure</Text>
              {!this.state.updatedWithNewProps && <ActivityIndicator size="large" animating={true} color="maroon" />}

              {this.state.updatedWithNewProps && <View style={{ marginTop: 10 }}>
                <FlatList
                  ref={(ref) => { this.flatListRef = ref; }}
                  scrollEnabled={true}
                  initialNumToRender={1}
                  initialScrollIndex={0}
                  refreshing={true}
                  pagingEnabled={true}
                  data={this.state.paginatedDisclosures} //disclosures being exposed using the compose function written after this class.
                  showsHorizontalScrollIndicator={false}
                  decelerationRate={0.2}
                  // style={{ height: responsiveHeight(60), overflow: 'scroll' }}
                  renderItem={({ item, index }) => {
                    return (
                      <TouchableOpacity style={{ margin: 10 }} onPress={() => {
                        if (item.type && item.type === 'news') {
                          navigation.navigate("LawSchoolNormalScreen", item)
                        } else {
                          navigation.navigate("LawSchoolEventScreen", item);
                        }
                      }}>
                        <View>
                          <Text style={styles.disclosureTextSmall}>{item.category[0] == '[' ? item.category.substring(1, item.category.length - 2) : item.category} </Text>
                          <Text style={styles.disclosureTextMain}>{item.title}</Text>
                          {/* <View style={{justifyContent:'flex-start', flexDirection:'row'}}><Text style={{ backgroundColor: 'grey', color: 'white',borderRadius:4,padding:4 }}>{item.type == 'event' ? 'event' : 'news'}</Text></View> */}
                        </View>
                      </TouchableOpacity>

                    )
                  }}
                  keyExtractor={(item) => item.originalURL} />

                <View style={styles.paginationContainer}>
                  <View style={{
                    flexDirection: 'column',
                    alignItems: 'flex-end'
                  }}>
                    {this.state.disclosureList.length > 1 && <Text style={{ textAlign: 'right' }}>({this.startIndex + 1} - {this.endIndex + 1 > this.state.disclosureList.length ? (this.state.disclosureList.length) : (this.endIndex + 1)}) of {this.state.disclosureList.length} results</Text>}
                  </View>

                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingHorizontal: 10
                  }}>

                    {this.startIndex != 0 && <TouchableOpacity style={styles.paginationButtons}
                      onPress={() => {
                        this.startIndex = this.startIndex - 5;
                        if (this.startIndex < 0) {
                          this.startIndex = 0;
                        }
                        this.endIndex = this.startIndex + 4;
                        this.setState({ paginatedDisclosures: this.state.disclosureList.slice(this.startIndex, this.endIndex + 1) })
                      }}
                    ><View style={{
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      alignSelf: "center",
                      justifyContent: "space-between",
                    }}>
                        <Text style={{ fontWeight: "bold", color: 'black', marginRight: 10 }}><FontAwesome
                          name="angle-left"
                          color="black"
                          size={responsiveFontSize(2)}
                        /></Text><Text style={{ fontWeight: 'bold', color: 'black' }}>Previous </Text>
                      </View>
                    </TouchableOpacity>}
                    {this.endIndex < this.state.disclosureList.length - 1 && <TouchableOpacity style={styles.paginationButtons}
                      onPress={() => {
                        this.startIndex = this.endIndex + 1;
                        if (this.endIndex > this.state.disclosureList.length - 1) {
                          this.endIndex = this.state.disclosureList.length - 1;
                        } else {
                          this.endIndex = this.startIndex + 4;
                        }
                        this.setState({ paginatedDisclosures: this.state.disclosureList.slice(this.startIndex, this.endIndex + 1) })
                      }}>

                      <View style={{
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        alignSelf: "center",
                        paddingHorizontal: 10,
                        justifyContent: "space-between",
                      }}>
                        <Text style={{ fontWeight: 'bold', color: 'black' }}>Next </Text><Text style={{ fontWeight: "bold", color: 'black', marginLeft: 10 }}><FontAwesome
                          name="angle-right"
                          color="black"
                          size={responsiveFontSize(2)}
                        /></Text>
                      </View>
                    </TouchableOpacity>}
                  </View>

                </View>
              </View>}



            </View>

          </View>



          <View style={{ margin: 20, height: '100%' }}>
            <Text style={{ fontWeight: "700", fontSize: 30, color: 'black' }}>Learn More</Text>
            <FlatList
              ref={(ref) => { this.flatListRef = ref; }}
              scrollEnabled={false}
              initialNumToRender={1}
              initialScrollIndex={0}
              refreshing={false}
              pagingEnabled={true}
              data={learnMoreLinksArray}
              showsHorizontalScrollIndicator={false}
              decelerationRate={0}
              renderItem={({ item, index }) => {

                return (
                  <View style={styles.links} >
                    <View style={{ backgroundColor: 'rgb(211,211,211)', height: 1.5, marginBottom: 2 }} />
                    <TouchableOpacity style={{ width: "100%", flex: 1, flexDirection: "row", alignItems: "flex-start" }}
                      onPress={() => {
                        if (item.platformSpecific === true) {
                          if (Platform.OS == 'ios' && item.iosUrl) {
                            Linking.openURL(item.iosUrl);
                          } else {
                            Linking.openURL(item.androidUrl);
                          }
                        } else {
                          if (item.internal_link) {
                            navigation.navigate("InAppLink", {
                              url: item.url,
                              title: item.title
                            });
                          } else if (!item.internal_link) {
                            Linking.openURL(item.url);
                          }
                        }

                      }}

                    >

                      <View style={{
                        paddingVertical: 15,
                        paddingHorizontal: 10,
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}>
                        <FontAwesome
                          name={item.icon}
                          color="black"
                          size={14}
                        /><Text style={{ fontWeight: "100", fontSize: 14, marginLeft: 10 }}>{item.title}</Text>

                      </View>


                    </TouchableOpacity>
                  </View>
                )
              }}
              keyExtractor={(item) => item.originalURL} />

          </View>
        </ScrollView>

      </View>
    )

  }
}


const DisclosureComponent = AppSyncComponent(LawSchoolX, getLawDisclosuresLearnMore, getLawDisclosures);

export default class LawSchool extends PureComponent {
  render() {
    const data = this.props;
    return (<DisclosureComponent data={this.props} />);
  }
}

const styles = StyleSheet.create({
  paginationContainer: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    alignItems: "center",
    textAlignVertical: "center",
    marginTop: 10
  },
  paginationButtons: {
    width: responsiveWidth(30),
    borderColor: "black",
    borderWidth: 1,
    height: 40,
    margin: 10
  },
  disclosureTextSmall: {
    fontSize: 10,
    color: "#8C1D40",
    textTransform: 'uppercase',
    fontWeight: '700'
  },
  disclosureTextMain: {
    fontSize: 14,
    color: "black"
  },
  links: {
    justifyContent: "space-evenly",
    marginTop: 10,
    flex: 1,
    flexDirection: "column",
  },
  shadow: {
    flex: 3,
    margin: 20,
    // height: responsiveHeight(100)
    height: '100%'
  },

  body: {
    flex: 2,
    flexDirection: "column",
    backgroundColor: "white",
    shadowColor: "rgb(192,192,192)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    height: '100%'
  },
  mainText: {
    color: "white",
    fontSize: 40,
    fontWeight: "700",
    fontFamily: "Roboto"
  },
  titleText: {
    color: "white",
    fontSize: 20,
    fontWeight: "100",
    fontFamily: "Roboto"
  },
  header: {
    position: "absolute",
    margin: responsiveWidth(2.5),
    bottom: responsiveWidth(15),
    left: responsiveWidth(2.5)
  },
  headerText: {
    flex: 1,
    color: "black",
    fontSize: responsiveFontSize(3.3),
    fontWeight: "700",
    fontFamily: "Roboto",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  imageBgContainer: {
    flex: 1,
    backgroundColor: "grey",
    height: responsiveHeight(35)
  },
  bodyTop: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    margin: responsiveWidth(2.5),
    padding: responsiveWidth(2.5),
    backgroundColor: "#FFFFFF"
  }
});