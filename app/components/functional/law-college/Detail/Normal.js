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
    Linking
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
import HTMLView from "react-native-htmlview";

export default class Normal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            attachments: [],
            figureURLs: []
        }
        let category = this.props.navigation.state.params.category;

        if (category && category[0] == '[') {
            let temp = category.substring(1, category.length - 2);
            let arr = temp.split(',');
            this.tags = arr;
        } else {
            this.tags = [category];
        }



        // console.log('%%%%%%%%% Navigation object in Normal screen', this.props.navigation);
        // console.log('%%%%%%%%% Params object in Normal screen', this.props.navigation.state);

    }



    render = () => {
        const { navigation } = this.props;
        const {
            body,
            title,
            category,
            date,
            creator,
            originalUrl
        } = navigation.state.params;
        let subtitle;
        let newsType;
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        let temp_date = date.split("/");
        const formattedDate = temp_date[2] + " " + months[Number(temp_date[1]) - 1] + " " + temp_date[0]; //original date format : YYYY/MM/DD
        if (navigation.state && navigation.state.params) {
            subtitle = creator + ' | ' + formattedDate;
            newsType = category[0] == '[' ? category.substring(1, category.length - 2) : category;
        }
        return (
            <ScrollView style={styles.container}>
                <Text style={styles.title}>{title} </Text>
                <Text style={styles.subtitle}>{subtitle} </Text>
                <Text style={styles.newsType}>{newsType} </Text>
                {/* <View style={styles.mainContent}> */}
                <View style={styles.mainContent}>
                    <HTMLView
                        value={body.replace(/[\r\n]+/gm, "").trim()}
                        stylesheet={styles.normalText}
                        renderNode={this.customRendering}
                        // style={{ flexDirection: 'column', margin: 5, alignSelf: 'flex-start' }}

                    // add a line break between <p> tags like this:
                    // paragraphBreak={`
                    // `}
                    />
                </View>
                <Text style={styles.link}
                    onPress={() => Linking.openURL(originalUrl)}>
                    {originalUrl}
                </Text>
                <View style={{ margin: 20 }}>
                    {this.state.attachments && this.state.attachments.map(function (i) {
                        return (
                            <View style={{
                                paddingVertical: 15,
                                flexDirection: "row",
                                alignItems: 'flex-start'
                            }}>
                                <FontAwesome
                                    name="paperclip"
                                    color="grey"
                                    size={responsiveFontSize(2.2)}
                                /><Text style={styles.attachment} onPress={() => Linking.openURL(i.href)}>{i.fileName.trim()} </Text>
                            </View>
                        )
                    })}
                </View>
                <View style={{ backgroundColor: 'rgb(192,192,192)', height: 1, margin: 10 }} />
                <View style={styles.tagsContainer}>

                    {this.tagsRenderer()}
                </View>
            </ScrollView>

        )
    }
    attachmentRender = () => {

    }

    tagsRenderer = () => {
        return this.tags.map(function (k, i) {
            return <View style={styles.tagsButton}>
                <Text style={{ fontSize: 10 }}>{k}</Text>
            </View>
        });

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
                //         margin: 0
                //     }}
                //     source={{ uri: src }}
                // />)
                return (<Text> </Text>)

            } else {
                return (<Text> </Text>)
            }
        }
        
        if(node.name=='img'){
            let src=node.attribs.src;
            return (<Image
                    style={{
                        height: responsiveHeight(100),
                        width: responsiveWidth(100),
                        resizeMode: "contain",
                    }}
                    source={{ uri: src }}
                />)
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



const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    attachment: {
        color: "#121212",
        fontSize: 16,
        fontWeight: "bold",
        color: "grey",
        marginLeft: 5
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
        fontFamily: "Roboto",
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 10
    },
    subtitle: {
        color: "rgba(0,0,0,1)",
        fontSize: 12,
        fontFamily: "Roboto",
        marginLeft: 20,
        marginRight: 20
    },
    mainContent: {
        color: "#121212",
        fontSize: 12,
        fontFamily: "Roboto",
        alignSelf: 'flex-start',
        margin: 20
    },
    newsType: {
        color: "rgba(123,41,61,1)",
        fontSize: 12,
        fontFamily: "Roboto",
        marginLeft: 20,
        marginRight: 20
    },
    link: {
        color: "rgba(123,41,61,1)",
        fontSize: 14,
        fontFamily: "roboto-regular",
        margin: 20
    }
});

