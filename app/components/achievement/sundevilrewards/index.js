import React, {useState,useEffect} from "react";
import Icon from 'react-native-vector-icons/AntDesign';
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  Platform,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard
} from "react-native";
import {
  responsiveHeight,
  responsiveFontSize,
  // responsiveWidth
} from "react-native-responsive-dimensions";
import { AsyncStorage } from 'react-native';

import {getCollectPitchforkstext, getEarnPitchforkstext,updateASURITE,getLoginResponseQuery} from "./sdrquery";
import PitchForksBarComponent from "../Profile/SDRPitchforks/PitchForksBarComponent";
import {AppSyncComponent} from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { ErrorWrapper } from "../../functional/error/ErrorWrapper";
import Analytics from "../../functional/analytics";
import md5 from 'md5';
import useGlobal from "../../functional/global-state/store";
import { SettingsContext } from "../Settings/Settings";


const dimensions = Dimensions.get('window');
const headerMain = require("../assets/sdr/hero-bg-2x.png");
const handpic = require("../assets/sdr/sdr-hand-2x.png");
const view = require("../assets/sdr/view.png");
const hidden = require("../assets/sdr/eye-hidden-2x.png");
const success_modal = require("../assets/sdr/modal-success-2x.png"); 
const error_modal = require("../assets/sdr/error-2x.png");
const store_logo = require("../assets/sdr/play-store-logo-2x.png"); 
const ios_logo = require("../assets/sdr/ios_logo.jpg");;
const clientID = '1918'
const platformconfig =
      Platform.OS === "ios"
        ? { behavior: "padding", keyboardVerticalOffset: 105 }
        : {};

function SdrLandingPage(props){
  
  // const [collectPitchforksState,setcollectPitchforksState] = useState(null);
  // const [earnPitchforksState,setearnPitchforksState] = useState(null);
  const [hidePassword, sethidePassword] = useState(true);
  const [email_,setEmail]= useState('');
  const [password_,setPassword] = useState('');
  const [alertVisibility,setAlertVisibility] = useState(false);
  const [retrievedQueryStatus, setRetrieveQuesryStatus] = useState(false);
  const [loginSuccess,setloginSuccess] = useState(false);
  const [modalFields,setmodalFields]=useState({
    title:"",
    message:""
  });
  const [ASURITE_checkState, setASURITE_check] = useState("error");
  const [globalState, globalActions] = useGlobal();
  const [firstRunState, setFirstRunState] = useState(true);
  const [loading,setloading]=useState(true)
  const imageWidth = dimensions.width;
  const imageHeight = Math.round(dimensions.width);
  
 
  
  managePasswordVisibility = () =>{
    sethidePassword(!hidePassword)
  }
  
  cancelAlertBox = (visible)=>{
    setAlertVisibility(visible)

  }

 
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


  useEffect(()=>{

    // if(!props.collectPitchforks.getCollectPitchforkstext){
    //   setcollectPitchforksState(null);
    // }
    // else if(!props.earnPitchforks.getEarnPitchforkstext){
    //   setearnPitchforksState(null);
    // }

    if(!props.asurite_update.updateASURITE){
      setASURITE_check("error");
    }
    else{
      // var collectPitchforks = props.collectPitchforks.getCollectPitchforkstext
      // var earnPitchforks = props.earnPitchforks.getEarnPitchforkstext
      // var loginResponse = props.loginResponse.getLoginResponse 
      // setloginResponseState(loginResponse);

      if( firstRunState ){
        var ASURITE_check = props.asurite_update.updateASURITE.status
      


        // setcollectPitchforksState(collectPitchforks);
        // setearnPitchforksState(earnPitchforks);

       
        setASURITE_check(ASURITE_check);

        if(ASURITE_check == "success"){
          _storeData("sdr_login_status","true").then(() => {
            globalActions.setSDRLoginStatus(true);
          });
        }
        setFirstRunState(false)
        setRetrieveQuesryStatus(true);
      }
      
    }
//for Testing...
    // _storeData("sdr_login_status","false").then(() => {
    //   globalActions.setSDRLoginStatus(false);
    // })
    

  },[props.asurite_update] );
    

    

  return (
  
    <KeyboardAvoidingView {...platformconfig}>

    <ScrollView keyboardShouldPersistTaps={'handled'} >
      
      <View style={{ flex: 2 }}> 
        <ImageBackground
          style={{height: imageHeight, width: imageWidth}}
          source={headerMain}
        >
            <Text style={styles.headerText} numberOfLines={2}>
              Sun Devil<Text style={{fontSize: 15, lineHeight: 37}}>{'\u00ae'}</Text>
            </Text>
            <Text style={styles.headerText2} numberOfLines={2}>
              Rewards
            </Text>
          </ImageBackground>
          <View style ={styles.body}>
            <Text style={styles.bodyHeaderText1} numberOfLines={1}>
              Coming Soon!
            </Text>
            <Text style={styles.bodyText} numberOfLines={1}>
              Earn Pitchforks with ASU Mobile App!
            </Text>
          </View>
        
        <Modal
            visible={alertVisibility}
            transparent={true}
            animationType={"fade"}
            onRequestClose={() => { this.cancelAlertBox(!alertVisibility) }} >
              {loading && 
              
              <View style={{ alignItems: "center", paddingVertical: "80%"}}>
                <ActivityIndicator size="large" color="maroon" />
             
              </View>
              }
              {!loading && <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={styles.MainAlertView}>
                  <Image style={{height: 98, width: 90, marginTop:30}} source={loginSuccess?success_modal:error_modal}/>
                  <Text style={styles.AlertTitle}>{modalFields && modalFields.title + " " }</Text>
                  <Text style={styles.AlertMessage} numberOfLines={3}> {modalFields && modalFields.message + " "} </Text>
                  <View style={{ width: '100%', height: 0.5, backgroundColor: 'grey'}} />

                  <View style={{ flexDirection: 'row', height: '20%'}}>
                    <TouchableOpacity style={styles.buttonStyle} onPress={() => { cancelAlertBox(!alertVisibility) }}  >
                      <Text style={styles.TextStyle}> Continue </Text>
                    </TouchableOpacity>
                  </View>

                </View>
              </View>}
              
            </Modal>

        {!retrievedQueryStatus &&
          <View style={{ alignItems: "center", paddingVertical: 30}}>
              <ActivityIndicator size="large" color="maroon" />
          </View> 
        }

        {retrievedQueryStatus && !globalState.SDRLoginStatus &&
            <View style = {[styles.login,{opacity:100}]}>
              
              <View style={{ flexDirection: 'row'}}>
                <Image style={{height: 95, width: 65,marginTop:"5%",marginLeft:"6%"}} source={handpic}/>
                <Text style={styles.loginText1} numberOfLines={4} >
                If you have a Sun Devil Rewards account,{'\n'} 
                link it to your ASURITE email and earn an{'\n'}
                extra 1000 Pitchforks! 
              </Text>
              </View>
              <Text style={styles.loginText2} >
                Enter your current Sun Devil Rewards email and{'\n'}
                password below, then tap "Link with ASURITE".
              </Text>
              <Text style={styles.loginText3} numberOfLines={2}>
                Email address<Text style={{fontSize: 15, lineHeight: 18,color:"red"}}>*</Text>
              </Text>
              {Platform.OS == "android" && <TextInput style = {{marginLeft:"5%", marginRight:"5%",fontWeight:"900"}}  onChangeText={text => setEmail(text)} value={email_}    placeholder = "Sun Devil Rewards email"
                        underlineColorAndroid = {"#fff"}/>}
              {Platform.OS == "ios" && <TextInput style = {{paddingVertical:"3%",marginLeft:"5%", marginRight:"5%",fontWeight:"900",borderBottomWidth:1,borderBottomColor:"#fff"}}  onChangeText={text => setEmail(text)} value={email_}    placeholder = "Sun Devil Rewards email"
                        />}
              <Text style={styles.loginText3} numberOfLines={1}>
                Password<Text style={{fontSize: 15, lineHeight: 18,color:"red"}}>*</Text>
              </Text>
              <View style = { styles.textBoxBtnHolder }>
              {Platform.OS == "android" && <TextInput style= {{marginLeft:"5%", marginRight:"5%",fontWeight:"900"}}  onChangeText={text => setPassword(text)}  value={password_}  placeholder = "Sun Devil Rewards password" underlineColorAndroid = "#fff" secureTextEntry = { hidePassword } />}
              {Platform.OS == "ios" && <TextInput style= {{paddingVertical:"3%",marginLeft:"5%", marginRight:"5%",fontWeight:"900",borderBottomWidth:1,borderBottomColor:"#fff"}}  onChangeText={text => setPassword(text)}  value={password_}  placeholder = "Sun Devil Rewards password" underlineColorAndroid = "#fff" secureTextEntry = { hidePassword } />}
                <TouchableOpacity  style = { styles.visibilityBtn } onPress = { managePasswordVisibility }>
                  <Image source = { ( hidePassword ) ? hidden : view } style = { styles.btnImage } />
                </TouchableOpacity>

              </View>

      
              <TouchableOpacity 
                style={styles.LoginButton}
                onPress={() => 
                  {  
                    Keyboard.dismiss();
                    setloading(true);
                    cancelAlertBox(true);
                    props.client.query({
                      query: getLoginResponseQuery,
                      fetchPolicy: "network-only",
                      variables: { api: "login",email:email_,password: md5(password_+clientID) }})
                      .then(response=>{
                        triggermodal(response.data.getLoginResponse);
                        // loginResponseState && console.log("The output of query",loginResponseState);
                    })
                    triggermodal=(loginResponseState)=>{

                    const { sendAnalytics } = props;
                    if(loginResponseState && loginResponseState.status=="success"){
                      setloading(false)
                    
                      sendAnalytics({
                        "action-type": "click",
                        "starting-screen": "sun-devil-rewards",
                        "starting-section": null, 
                        "target": "Sun Devil Rewards Landing Page",
                        "resulting-screen": "sun-devil-rewards", 
                        "resulting-section": null,
                      });
                      setloginSuccess(true);
                      setmodalFields({...modalFields,title:"Success!",message:"Congratulations, your Sun Devil Rewards account has been successfully linked to your ASURITE."});
                      cancelAlertBox(true);
                      // console.log("successfully logged in") 
                      _storeData("sdr_login_status","true").then(() => {
                        globalActions.setSDRLoginStatus(true);
                      });
                    }
                  
                    else if(loginResponseState && loginResponseState.status=="error") { 
                      setloading(false)
                      // console.log("failed to login");
                      setloginSuccess(false);
                      setmodalFields({...modalFields,title:"Error! ",message:"Incorrect Email or Password. Please enter the correct email and password again."});
                      cancelAlertBox(true);
                    }
                  }
                  }

                }
                
              >

                <Text style={styles.LoginText}>Link with ASURITE</Text>
              </TouchableOpacity>   

          </View>
        }

        {retrievedQueryStatus && globalState.SDRLoginStatus &&
          <View style={styles.pitchforksContainer}>
            <PitchForksBarComponent checkASURITE={ASURITE_checkState} />
          </View>

        }

        {retrievedQueryStatus && globalState.SDRLoginStatus && 
          <View style ={styles.body2}>
            <Text style={styles.bodyText2}>
              Need help? Contact customer service at
            </Text>
            <Text style={styles.supportEmail}>
              sundevilrewards@asu.edu
            </Text>
          </View>

        }
        
       {retrievedQueryStatus && !globalState.SDRLoginStatus && 
       <View style ={styles.body2}>
        
        <Text style={{fontSize:responsiveFontSize(1.5),textAlign:"justify",color: "black", marginTop : 15,marginLeft : "14%",fontWeight: "300",fontFamily: "Roboto"}}  >
          Don't have Sun Devil Rewards? Download it today!
          </Text>
          <TouchableOpacity
          onPress = {()=>
            {
              if(Platform.OS === "android"){
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.asu.sundevilrewards"
                );

              }
              else if(Platform.OS === "ios"){
                Linking.openURL(
                  "https://apps.apple.com/us/app/sun-devil-rewards/id1138907629"
                );
              }
            }
          }>
          <Image style={{marginTop:20,marginBottom:20,marginLeft:"27%",height:40,width:"44%",borderRadius:10}} source={Platform.OS === "android"?store_logo:ios_logo}/>
          </TouchableOpacity>

        </View>   } 
        </View>

    </ScrollView>
    </KeyboardAvoidingView>
    );
    
}

const SDRcontent = AppSyncComponent(SdrLandingPage,getCollectPitchforkstext,getEarnPitchforkstext,updateASURITE);



export class SunDevilRewards extends React.Component {
  
  
  componentDidMount() {
    this.refs.analytics.sendData({
      "action-type": "click",
      "starting-screen": this.props.navigation.state.params.previousScreen?this.props.navigation.state.params.previousScreen:null,
      "starting-section": this.props.navigation.state.params.previousSection?this.props.navigation.state.params.previousSection:null, 
      "target": "Sun Devil Rewards Landing Page",
      "resulting-screen": "sun-devil-rewards", 
      "resulting-section": null
    });
  }
  render() {
    
    return (
      <ErrorWrapper>
        <Analytics ref="analytics" />
        <SettingsContext.Consumer>
          {settings => (
              <SDRcontent   
                sendAnalytics={settings.sendAnalytics}     
                {...this.props} />
          )}
        </SettingsContext.Consumer>
      </ErrorWrapper>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: responsiveHeight()
  },
  body: {
    flex: 2,
    backgroundColor: "black"
  },
  body2: {
    flex: 1,
    backgroundColor: "white"
  },
  login:{
    backgroundColor : "#FFCC00"

  },
  scrollview: {
    flexGrow: 1,
  },
  header: { 
    marginTop: "60%",
    paddingLeft: "6%"
  },
  headerText: {
    color: "white",
    fontSize: 35,
    marginTop:"60%",
    marginLeft:"5%",
    fontFamily: "Roboto",
    fontWeight: "bold",
    // alignSelf: 'flex-start'
  },
  headerText2: {
    backgroundColor:"white",
    textAlign: "center",
    color: "black",
    marginLeft:"5%",
    fontSize: 35,
    fontWeight: "bold",
    fontFamily: "Roboto",
    alignSelf: 'flex-start',
    paddingHorizontal: 5

  },
  bodyHeaderText1: {
    marginTop : 15,
    textAlign: "left",
    color: "white",
    marginLeft : "6%",
    fontSize: responsiveFontSize(4),
    fontWeight: "700",
    fontFamily: "Roboto"
  },

  bodyHeaderText2: {
    marginTop : 2,
    textAlign: "left",
    color: "orange",
    marginLeft : "6%",
    fontSize: responsiveFontSize(3),
    fontWeight: "500",
    fontFamily: "Roboto"
  },
  bodyHeaderText3: {
    textAlign: "left",
    color: "black",
    marginTop : 15,
    marginLeft : "6%",
    marginRight:"7%",
    fontSize: responsiveFontSize(4),
    fontWeight: "700",
    fontFamily: "Roboto"
  },
  bodyText: {
    color: "#FFCC00",
    marginTop : "5%",
    marginLeft: "6%",
    marginRight : "5%",
    marginBottom: "10%",
    fontSize: 15,
    fontWeight: "100",
    fontFamily: "Roboto"
  },
  supportEmail:{
    color: "#993366",
    marginTop : "5%",
    marginLeft: "30%",
    marginRight : "20%",
    marginBottom:"5%",
    fontSize:responsiveFontSize(1.5),
    fontWeight: "900",
    fontFamily: "Roboto"
  },
  buttonText: {
    textAlign: "justify",
    color: "white",
    marginTop : 15,
    marginLeft : "6%",
    marginBottom : 20,
    fontSize: responsiveFontSize(2),
    fontWeight: "700",
    fontFamily: "Roboto"
  
  },
  bodyText2: {
    textAlign: "justify",
    color: "black",
    marginTop : "5%",
    marginLeft : "20%",
    marginRight : "12%",
    fontSize: responsiveFontSize(1.5),
    fontWeight: "100",
    fontFamily: "Roboto"
  },
  
  buttonText2:{
    flex: 1,
    textAlign: "justify",
    color: "brown",
    marginTop: 15,
    marginLeft : "6%",
    marginBottom : 20,
    fontSize: responsiveFontSize(2),
    fontWeight: "700",
    fontFamily: "Roboto"

  },
  loginText1: {
    textAlign: "justify",
    color: "black",
    marginTop : "17%",
    marginLeft : "1%",
    marginRight : "5%",
    fontSize: responsiveFontSize(1.7),
    fontWeight: "700",
    fontFamily: "Roboto"
  },
  loginText2: {
    textAlign: "justify",
    color: "black",
    marginTop : "5%",
    marginLeft : "6%",
    marginRight : "5%",
    fontSize: responsiveFontSize(1.8),
    fontWeight: "300",
    fontFamily: "Roboto"
  },
  loginText3: {
    textAlign: "justify",
    color: "black",
    marginTop : "10%",
    marginLeft : "6%",
    marginRight : "5%",
    fontSize: responsiveFontSize(1.8),
    fontWeight: "900",
    fontFamily: "Roboto"
  },
  imageBgContainer: {
    flex: 2,
    position: "relative",
    backgroundColor: "grey",
    marginTop : 10
  },
  signinText: {
    marginTop : 5,
    marginBottom : 15,
    marginLeft : 25,
    marginRight : 10,
    alignContent: "center",
    color: "black",
    fontSize: responsiveFontSize(3),
    fontWeight: "500"
  },
  LoginButton: {
    marginTop : 20,
    marginLeft:"14%",
    marginBottom:25,
    alignContent:"center",
    borderRadius: 1,
    backgroundColor: "black",
    height: 30,
    width: "70%",
  },
  LoginText: {
    marginTop:5,
    alignSelf: "center",
    alignContent: "center",
    color: "white",
    fontSize: responsiveFontSize(1.5),
    fontWeight: "500"
  },
  
  textBoxBtnHolder:
  {
    position: 'relative',
    alignSelf: 'stretch',
    justifyContent: 'center'
  },

  textBox:
  {
    fontSize: 18,
    alignSelf: 'stretch',
    height: 45,
    paddingRight: 45,
    paddingLeft: 8,
    borderWidth: 1,
    paddingVertical: 0,
    borderColor: 'grey',
    borderRadius: 5
  },

  visibilityBtn:
  {
    position: 'absolute',
    right: 3,
    height: 40,
    width: 35,
    padding: 5,
    marginRight: 15
  },

  btnImage:
  {
    resizeMode: 'contain',
    height: '100%',
    width: '100%'
  },
  MainAlertView: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white", 
    height: 350,
    width: '90%',      
    borderColor: 'black',
    borderRadius: 10,
    borderWidth:1
  },
  AlertTitle: {
    fontSize: 20,
    color: "black",
    textAlign: 'center',
    padding: 10,
    fontWeight: '500',
  },
  AlertMessage: {
    fontSize: 15,
    color: "black",
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingBottom: 60,
  },
  buttonStyle: {
      width: '50%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      position:"relative",
  },
  TextStyle: {
    color: 'black',
    textAlign: 'center',
    position:"relative",
    padding : 5,
    fontWeight :"500",
    fontSize: 20,
    marginTop: -5
  },
  pitchforksContainer:{
    marginHorizontal: 10,
    borderTopWidth: 1,
    borderColor: "#DFDFDF",
    borderBottomWidth: 1
  }
});

