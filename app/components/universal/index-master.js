import React from "react";
import {
  View,
  Image,
  Dimensions,
  Keyboard,
  Text,
  AsyncStorage,
  TextInput,
  Button,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  List
} from "react-native";
import {
  RkButton,
  RkCard,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme
} from "react-native-ui-kitten";
import {
  Config,
  CognitoIdentityCredentials
} from "aws-sdk/dist/aws-sdk-react-native";
// import { Col, Row, Grid } from "react-native-easy-grid";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken
} from "react-native-aws-cognito-js";
import { FontAwesome } from "../../assets/icons";
import { GradientButton } from "../../components/";
import LinearGradient from "react-native-linear-gradient";
import { scale, scaleModerate, scaleVertical } from "../../utils/scale";
import KeyboardSpacer from "react-native-keyboard-spacer";
import authHelper from "../../utils/authHelper";
import HideWithKeyboard from "react-native-hide-with-keyboard";

const appConfig = {
  region: "us-east-1",
  IdentityPoolId: "us-east-1:9bbe3e12-2167-44f4-a47b-68ac66ee0036",
  UserPoolId: "us-east-1_sqVggcPIm",
  ClientId: "f7i22m7tt5qmss3u7t0j7c54d"
};
var { height, width } = Dimensions.get("window");

var box_count = 4;
var box_height = height / box_count;
export class Accounts extends React.Component {
  static navigationOptions = {
    header: null
  };
  handleEmail = text => {
    this.setState({ email: text });
  };

  handlePassword = text => {
    this.setState({ password: text });
  };
  getCognitoUser = function() {
    const poolData = {
      UserPoolId: appConfig.UserPoolId,
      ClientId: appConfig.ClientId
    };
    const userPool = new CognitoUserPool(poolData);
    const userData = {
      Username: "zohair@renterspace.com",
      Pool: userPool
    };
    return new CognitoUser(userData);
  };
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      page: 1,
      seed: 1,
      error: null,
      refreshing: false
    };
    authHelper.sharedData = {};
  }
  componentDidMount() {
    this.makeRemoteRequest();
  }
  makeRemoteRequest = () => {
    const { page, seed } = this.state;
    const url = `https://randomuser.me/api/?seed=${seed}&page=${page}&results=20`;
    this.setState({ loading: true });
    fetch(url)
      .then(res => res.json())
      .then(res => {
        this.setState({
          data: page === 1 ? res.results : [...this.state.data, ...res.results],
          error: res.error || null,
          loading: false,
          refreshing: false
        });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
  };

  render() {
    return (
      <ScrollView style={styles.scroll}>
        <View style={styles.container}>
          <LinearGradient
            colors={["#002E41", "#00A6B8"]}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1, y: 1 }}
            style={styles.box1}
          >
            <View style={[styles.startspace]} />
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.startspace}
                onPress={() => {
                  this.props.navigation.navigate("HomeMain");
                }}
              >
                <RkText style={styles.leftarrow} rkType="awesome hero">
                  {FontAwesome.chevronLeft}
                </RkText>
              </TouchableOpacity>
              <View style={[styles.startspace]} />
            </View>
            <View style={[styles.startspace]} />
            <View style={[styles.startspace]} />
            <Text style={styles.title1}>BANKS & CARDS</Text>
            <Text style={styles.subtitle}>Manage the way you pay.</Text>
            <View style={[styles.startspace]} />
            <View style={[styles.startspace]} />
          </LinearGradient>
          <View style={[styles.box2]}>
            <TouchableOpacity
              style={styles.iconsecondhalf}
              onPress={() => this.props.navigation.navigate("addbank1")}
            >
              <Image
                style={styles.icons}
                source={require("../../assets/images/add-icon.png")}
              />
              <Text style={styles.bank}>Add Bank Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconsecondhalf}
              onPress={() => this.props.navigation.navigate("addcard1")}
            >
              {/* <View style={styles.iconsecondhalf}> */}
              <Image
                style={styles.icons}
                source={require("../../assets/images/add-icon.png")}
              />
              <Text style={styles.property}>Add Debit/Credit Card</Text>
            </TouchableOpacity>
            {/* </TouchableOpacity> */}
          </View>
          <View style={[styles.box3]}>
            <Text style={styles.payments}>ACCOUNTS</Text>
            <FlatList
              data={authHelper.loadedData.cards}
              keyExtractor={item => item.Token}
              renderItem={({ item }) => (
                <View style={styles.listpayments}>
                  <View style={styles.accountDetail}>
                    <Image
                      style={styles.accountIcon}
                      source={require("../../assets/images/card.png")}
                    />
                  </View>
                  <View style={styles.paydetail}>
                    <Text style={styles.propname}>{item.Type}</Text>
                    <Text style={styles.paydate}>{item.Card}</Text>
                  </View>
                  <Text style={styles.amount}>{item.Expiration}</Text>
                </View>
              )}
            />
            <FlatList
              data={authHelper.loadedData.banks}
              keyExtractor={item => item.Token}
              renderItem={({ item }) => (
                <View style={styles.listpayments}>
                  <View style={styles.accountDetail}>
                    <Image
                      style={styles.accountIcon}
                      source={require("../../assets/images/bank.png")}
                    />
                  </View>
                  <View style={styles.paydetail}>
                    <Text style={styles.propname}>{item.AccountName}</Text>
                  </View>
                  <Text style={styles.amount}>{item.Account}</Text>
                </View>
              )}
            />
          </View>

          {/* <View style={[styles.box, styles.box2]}>
                <View style={styles.container2}>
               <View style={[styles.box4]}><RkText rkType='awesome primary' style={styles.title}>{FontAwesome.heart}</RkText></View>
               <View style={[styles.box5]}></View>
               </View>
            </View> */}
          {/* <TouchableOpacity onPress={() => this.props.navigation.navigate('payrent')}><View style={[styles.box, styles.box3]}><Text>Pay Rent</Text></View></TouchableOpacity> */}
        </View>
      </ScrollView>
    );
  }
}

let styles = RkStyleSheet.create(theme => ({
  container: {
    // flexDirection: 'column',
    // flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#002E41",
    flex: 1,
    height: null,
    width: null
  },
  header: {
    flex: 1,
    flexDirection: "row"
  },
  accountprop: {
    flex: 1
  },
  startspace: {
    flex: 1
  },
  accountIcon: {
    width: 75,
    height: 75,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center"
  },
  listpayments: {
    flex: 1,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#C5C7CE"
  },
  accountDetail: {
    flex: 1,
    justifyContent: "center"
  },
  paydetail: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: 10,
    paddingVertical: 20,
    paddingLeft: 30
  },
  propname: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  paydate: {
    flex: 1,
    fontWeight: "300",
    fontFamily: 'Roboto',
  },
  amount: {
    flex: 1,
    paddingVertical: 20,
    textAlign: "right",
    paddingRight: 30,
    paddingTop: 30
  },
  scroll: {
    display: "flex",
    flex: 1
  },
  image: {
    flex: 1
  },
  icons: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 175,
    flex: 1
  },
  leftarrow: {
    color: "#FFFFFF",
    alignItems: "flex-start",
    paddingLeft: 20
  },
  back: {
    flex: 1,
    flexDirection: "row,"
    // alignItems: 'flex-start',
    // justifyContent: 'flex-start',
    // paddingLeft: 5,
  },
  title1: {
    flex: 2,
    fontFamily: "Arial",
    color: "#FFFFFF",
    alignSelf: "center",
    fontSize: 24,
    paddingVertical: 5,
    fontWeight: "bold",
    fontFamily: "Roboto"
  },
  subtitle: {
    flex: 1,
    fontFamily: "Arial",
    color: "#FFFFFF",
    alignSelf: "center",
    fontSize: 20,
    marginTop: 30,
    fontWeight: "300",
    fontFamily: 'Roboto',
  },
  title2: {
    color: "#000000"
  },
  john: {
    fontFamily: "Big John",
    fontSize: 35,
    flexWrap: "wrap"
  },
  joe: {
    fontFamily: "Slim Joe",
    fontSize: 35,
    flexWrap: "wrap"
  },
  box1: {
    backgroundColor: "transparent",
    flex: 5,
    height: height / 2,
    width: null,
    justifyContent: "center"
  },
  box2: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    height: height / 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10
  },
  iconfirsthalf: {
    flex: 1,
    alignSelf: "center",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#FFFFFF",
    marginTop: 15
  },
  iconsecondhalf: {
    flex: 1,
    alignSelf: "center",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15
  },
  bank: {
    flex: 1,
    alignSelf: "center",
    color: "#000000",
    textAlign: "center",
    justifyContent: "center",
    fontSize: 16,
    marginTop: 20
  },
  property: {
    flex: 1,
    alignSelf: "center",
    color: "#000000",
    textAlign: "center",
    fontSize: 16,
    marginTop: 20
  },
  box3: {
    backgroundColor: "#FFFFFF",
    flex: 2,
    flexDirection: "column"
  },
  payments: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto",
    backgroundColor: "#F6F6F6",
    color: "#000000",
    textAlign: "center",
    borderBottomColor: "#E1E1E1",
    borderBottomWidth: 1,
    paddingVertical: 10
  },
  box4: {
    backgroundColor: "#FFFFFF",
    flex: 2
  },
  title: {
    fontSize: 40,
    fontFamily: "Roboto"
  },

  container2: {
    flexDirection: "row",
    flex: 1
  },
  // box: {
  //   height: box_height,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   flexDirection: 'column',
  //   flexWrap: 'wrap',
  // },
  heading: {
    paddingVertical: 50,
    flexWrap: "wrap",
    flexDirection: "row",
    backgroundColor: "transparent",
    alignItems: "center"
  },
  textTitle: {
    marginTop: 50,
    backgroundColor: "transparent",
    fontFamily: "Righteous-Regular",
    fontSize: 40,
    textAlign: "center"
  },
  paybutton: {
    color: "#FFFFFF"
  },
  logintext: {
    backgroundColor: "#1AA6B7",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 15,
    paddingTop: 15,
    marginTop: 15,
    paddingHorizontal: 50,
    borderWidth: 1,
    borderColor: "#1AA6B7",
    borderRadius: 30
  },
  socialIcon: {
    backgroundColor: "transparent",
    borderColor: "#FFFFFF",
    color: "#FFFFFF"
  },
  textInput: {
    color: "#ffffff",
    borderBottomWidth: 1,
    height: 40,
    paddingTop: 10,
    width: 300,
    fontSize: 16,
    alignSelf: "center",
    alignItems: "center",
    borderBottomColor: "#ffffff",
    fontFamily: "Roboto"
  },
  image: {
    marginBottom: scaleVertical(150),
    flex: 3
  },
  footer: {},
  buttons: {
    flexDirection: "row",
    marginBottom: scaleVertical(24)
  },
  button: {
    marginHorizontal: 14,
    backgroundColor: "transparent",
    borderColor: "#FFFFFF"
  },
  save: {
    marginVertical: 9
  },
  textRow: {
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 50
  },
  bottomText: {
    color: "#ffffff",
    marginTop: 10
  }
}));
