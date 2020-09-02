//components and views import
import React, { PureComponent, useContext } from "react";
import {
    Text,
    StyleSheet,
    View,
    TouchableOpacity,
    ActivityIndicator,
    ImageBackground,
    Image,
    FlatList, //new import
    TouchableHighlightBase
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
import { AppSyncComponent } from "../../authentication/auth_components/appsync/AppSyncApp";
import HTMLView from "react-native-htmlview";
import { rsvpforLawEvent, getRsvpObject } from "../../../../Queries/LawDisclosures";
import { SettingsContext } from "../../../achievement/Settings/Settings";

export class EventX extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            figureURLs: [],
            eventLocation: '',
            eventDateTime: '',
            rsvpExists: false,
            rsvpText: '',
            asurite: ''
        }

        // console.log('data inside event.js for law school ==>', this.props);

    }
    componentDidMount() {
        //check if the user has rsvpd already for this event ( this enables or disables the rsvp button)
        let rsvpObject = this.props['rsvpObject'];
        if (rsvpObject && rsvpObject['id'] && rsvpObject['id'] != '') {
            this.setState({ rsvpExists: true, rsvpText: "You have RSVP'd for the event" });
        }
    }

    render = () => {
        const { navigation } = this.props.data;
        const {
            body,
            title,
            category,
            date,
            creator,
            originalUrl
        } = navigation.state.params;
        let asurite = this.props.asurite;
        //function to be called when rsvp is clicked
        const { rsvpForEvent } = this.props;

        // const { SetToast } = useContext(SettingsContext);
        let subtitle;
        let newsType;
        let photoURL;
        let dateTime;
        let venue;

        if (navigation.state && navigation.state.params) {
            subtitle = creator + ' | ' + date;
            newsType = category[0] == '[' ? category.substring(1, category.length - 2) : category;
        }

        return (
            <ScrollView style={styles.container}>
                    <Text style={styles.title}>{title} </Text>
                    <Text style={styles.subtitle}>{subtitle} </Text>
                    <Text style={styles.newsType}>{newsType} </Text>

                    {/* <View style={styles.mainContent}> */}
                        {this.state.figureURLs.length > 0 && <FlatList
                                horizontal={false}
                                data={this.state.figureURLs}
                                extraData={this.state}
                                keyExtractor={this._keyExtractor}
                                style={{ height: "100%" }}
                                renderItem={({ item, index }) => {
                                    if (item != '') {
                                        return (<Image
                                            style={{
                                                height: responsiveHeight(100),
                                                width: responsiveWidth(100),
                                                resizeMode: "contain"
                                            }}
                                            source={{ uri: item }}
                                        />)
                                    }
                                }}
                            />}
                        <View>
                            <HTMLView
                                value={body.replace(/[\r\n]+/gm, "").trim()}
                                stylesheet={styles.normalText}
                                renderNode={this.customRendering}

                                // add a line break between <p> tags like this:
                                paragraphBreak={`
                            `}
                            />
                        </View>

                        <View style={styles.detailsContainer}>
                            {this.state.eventDateTime != '' && <View> <Text style={{ fontWeight: '600' }}>When: </Text>
                                <Text style={{ fontWeight: '100' }}>{dateTime}</Text>
                            </View>}
                            <View style={{ backgroundColor: 'white', height: 20 }}></View>
                            {this.state.eventLocation != '' && <View><Text style={{ fontWeight: '600' }}>Where: </Text>
                                <Text style={{ fontWeight: '100' }}>{venue}</Text></View>}
                        </View>
                        <View style={{ backgroundColor: 'white', height: 30 }}></View>
                        {!this.state.rsvpExists && <TouchableOpacity style={styles.attendBtn} onPress={() => {
                            let id = asurite + '-' + originalUrl;
                            rsvpForEvent(asurite, originalUrl, title, id)
                                .then(() => {

                                    this.setState({ rsvpExists: true, rsvpText: "You have RSVP'd for the event" });
                                    this.forceUpdate();
                                })
                                .catch(e => {
                                    console.log('RSVP has failed ', e);
                                    this.setState({ rsvpExists: false, rsvpText: "Some error occured, please try again" });
                                    this.forceUpdate();
                                    //  SetToast("The RSVP process has failed");
                                    //  navigation.goBack();
                                });
                        }}>
                            <Text style={{ color: 'white', fontWeight: '300' }}>Yes, I plan to attend! </Text>
                        </TouchableOpacity>}

                        {this.state.rsvpExists && <TouchableOpacity style={styles.attendBtnDisabled} disabled>
                            <Text style={{ color: 'white', fontWeight: '300' }}>Yes, I plan to attend! </Text>
                        </TouchableOpacity>
                        }

                        <Text style={{ fontSize: 12, marginLeft: 10 }}>{this.state.rsvpText} </Text>
                    {/* </View> */}

            </ScrollView>
        )
    }

    customRendering = (node, index, siblings, parent, defaultRenderer) => {
        if (node.name == 'figure' && node.attribs && node.attribs.class.includes('wp-block-image')) {
            let child = node.children[0];
            if (child) {
                let src = child.attribs.src;
                let f = this.state.figureURLs;
                f.push(src);
                this.setState({ figureURL: f });
                this.forceUpdate();
                // this.forceUpdate();
                // return (<Image
                //     style={{
                //         height: responsiveHeight(100),
                //         width: responsiveWidth(100),
                //         resizeMode: "contain",
                //         flexDirection: 'column',
                //         alignSelf: 'flex-start',
                //         margin: 5
                //     }}
                //     source={{ uri: src }}
                // />)
                return (
                    <Text> </Text>
                )

            } else {
                return (<Text> </Text>)
            }
        }

        if (node.attribs && node.attribs.class && node.attribs.class == 'wp-block-file__button') {
            let src = node.attribs.href;
            let fileName = src.split('/').slice(-1); //get the last part of the string for file name
            let attachments = this.state.attachments;
            attachments.push({ 'href': src, 'fileName': fileName[0] })
            this.setState({ attachments: attachments });
            this.forceUpdate();

            return (
                <Text> </Text>
            )
        }

        if (parent && parent.name == 'div' && (parent.attribs.class == "wp-block-file" || parent.attribs.class == "wp-block-file aligncenter")) {
            //this a tag must be hidden
            let toHide = false;
            siblings.map(function (k) {
                if (k.name == 'a' && k.attribs && k.attribs.class == 'wp-block-file__button') {
                    toHide = true;
                }
            });
            if (toHide) {
                return (<Text> </Text>)
            }
        }

    }
}



const RsvpComponent = AppSyncComponent(EventX, rsvpforLawEvent, getRsvpObject);


export default class Event extends PureComponent {
    render() {

        return (
            <SettingsContext.Consumer>
                {settings => {
                    let asurite = settings.user;
                    const { navigation } = this.props;
                    this.props['navigation']['id'] = asurite + '-' + navigation.state.params.originalUrl;
                    return (<RsvpComponent data={this.props} id={this.props['navigation']['id']} asurite={settings.user} />)

                }}
            </SettingsContext.Consumer>
        )
    }
}


const styles = StyleSheet.create({
    attendBtn: {
        alignSelf: 'flex-start',
        padding: 10,
        height: 40,
        borderRadius: 22,
        backgroundColor: "#8C1D40",
        margin: 5
    },
    attendBtnDisabled: {
        alignSelf: 'flex-start',
        padding: 10,
        height: 40,
        borderRadius: 22,
        backgroundColor: "grey",
        margin: 5
    },
    detailsContainer: {
        flexDirection: 'column',
        alignSelf: 'flex-start',
        color: "black",
        fontSize: responsiveFontSize(14),
        fontFamily: "roboto-regular",
        margin: 10
    },
    imageContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'center',
        // height: responsiveHeight(50)
        height: '100%'
    },
    container: {
        flex: 1,
        margin: 10,
        flexDirection: 'column',
        color: "#121212",
        height: '100%'
    },
    tagsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        margin: 10
    },
    tagsButton: {
        alignSelf: 'center',
        padding: 10,
        height: 40,
        borderRadius: 18,
        borderColor: "rgb(192,192,192)",
        borderWidth: 1,
        borderStyle: "solid",
        margin: 5
    },
    title: {
        color: "#121212",
        fontSize: 25,
        fontFamily: "roboto-700",
        marginLeft: 10
    },
    subtitle: {
        color: "rgba(0,0,0,1)",
        fontSize: 12,
        fontFamily: "roboto-regular",
        marginLeft: 10
    },
    mainContent: {
        color: "#121212",
        fontSize: 12,
        fontFamily: "roboto-regular",
        alignSelf: 'flex-start',
        margin: 10,
        flex: 2,
        flexDirection: 'column',
        height: '100%'
    },
    newsType: {
        color: "rgba(123,41,61,1)",
        fontSize: 12,
        fontFamily: "roboto-regular",
        marginLeft: 10
    },
    link: {
        color: "rgba(0,0,0,1)",
        fontSize: 12,
        fontFamily: "roboto-regular",
        margin: 10
    }
});

